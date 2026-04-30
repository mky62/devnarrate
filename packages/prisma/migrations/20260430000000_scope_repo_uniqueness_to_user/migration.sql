-- A GitHub repository may be saved by multiple users, but only once per user.
DROP INDEX IF EXISTS "repo_githubRepoId_key";

CREATE UNIQUE INDEX "repo_userId_githubRepoId_key" ON "repo"("userId", "githubRepoId");
