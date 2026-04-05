import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/prisma";
import { getRedisClient } from "@/lib/redis";

interface ContributionDay {
  date: string;
  contributionCount: number;
}

interface ContributionWeek {
  contributionDays: ContributionDay[];
}

interface GitHubError {
  message: string;
}

interface GitHubContributionsResponse {
  data?: {
    user: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: ContributionWeek[];
        };
      };
    };
  };
  errors?: GitHubError[];
}

interface GitStats {
  totalContributions: number;
  currentStreak: number;
  longestStreak: number;
  startDate: string;
  endDate: string;
  currentStreakStart: string;
  currentStreakEnd: string;
  longestStreakStart: string;
  longestStreakEnd: string;
}

const calculateStreaks = (weeks: ContributionWeek[]): { currentStreak: number; longestStreak: number; currentStreakStart: string; currentStreakEnd: string; longestStreakStart: string; longestStreakEnd: string } => {
  const allDays: ContributionDay[] = [];
  weeks.forEach(week => {
    week.contributionDays.forEach(day => {
      allDays.push(day);
    });
  });

  if (allDays.length === 0) {
    return { currentStreak: 0, longestStreak: 0, currentStreakStart: "", currentStreakEnd: "", longestStreakStart: "", longestStreakEnd: "" };
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let currentStreakStart = "";
  let currentStreakEnd = "";
  let longestStreakStart = "";
  let longestStreakEnd = "";
  let tempStreakStart = "";

  for (let i = allDays.length - 1; i >= 0; i--) {
    const day = allDays[i];
    if (day.contributionCount > 0) {
      if (currentStreak === 0) {
        currentStreakEnd = day.date;
      }
      currentStreak++;
      currentStreakStart = day.date;
    } else {
      break;
    }
  }

  for (const day of allDays) {
    if (day.contributionCount > 0) {
      if (tempStreak === 0) {
        tempStreakStart = day.date;
      }
      tempStreak++;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
        longestStreakStart = tempStreakStart;
        longestStreakEnd = day.date;
      }
    } else {
      tempStreak = 0;
    }
  }

  return { currentStreak, longestStreak, currentStreakStart, currentStreakEnd, longestStreakStart, longestStreakEnd };
};

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

const fetchContributions = async (token: string, username: string): Promise<GitStats> => {
  const query = `
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "devnarrate-App",
    },
    body: JSON.stringify({ query, variables: { login: username } }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`GitHub API error: ${response.status} - ${error.message || "Unknown error"}`);
  }

  const data: GitHubContributionsResponse = await response.json();
  
  if (data.errors) {
    throw new Error(`GitHub GraphQL error: ${data.errors.map(e => e.message).join(", ")}`);
  }

  const calendar = data.data!.user.contributionsCollection.contributionCalendar;
  const { currentStreak, longestStreak, currentStreakStart, currentStreakEnd, longestStreakStart, longestStreakEnd } = calculateStreaks(calendar.weeks);

  const allDays: ContributionDay[] = [];
  calendar.weeks.forEach(week => {
    week.contributionDays.forEach(day => {
      allDays.push(day);
    });
  });

  const startDate = allDays.length > 0 ? allDays[0].date : "";
  const endDate = allDays.length > 0 ? allDays[allDays.length - 1].date : "";

  return {
    totalContributions: calendar.totalContributions,
    currentStreak,
    longestStreak,
    startDate,
    endDate,
    currentStreakStart,
    currentStreakEnd,
    longestStreakStart,
    longestStreakEnd,
  };
};

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const account = await db.account.findFirst({
      where: { userId, providerId: "github" },
      select: { accessToken: true },
    });

    const token = account?.accessToken;
    if (!token) {
      return NextResponse.json({ error: "GitHub account not connected" }, { status: 400 });
    }

    const username = session.user.name?.replace("@", "") || "";
    if (!username) {
      return NextResponse.json({ error: "GitHub username not found" }, { status: 400 });
    }

    const cacheKey = `github:stats:${userId}`;
    const redis = await getRedisClient();
    const cachedStats = await redis.get(cacheKey);

    if (cachedStats) {
      return NextResponse.json({ stats: JSON.parse(cachedStats) });
    }

    const stats = await fetchContributions(token, username);
    await redis.set(cacheKey, JSON.stringify(stats), { EX: 1800 });

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("GitHub stats error:", error);

    if (error instanceof Error && error.message.includes("GitHub")) {
      return NextResponse.json(
        { error: "GitHub API error", details: error.message },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
