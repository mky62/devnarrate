
import z from "zod";

const feedSchema = z.string().max(200, "Feedback must be 200 characters or less");
interface FeedbackSectionProps {
  feedback: string;
}

export function FeedbackSection({ feedback }: FeedbackSectionProps) {

    const result =  feedSchema.safeParse(feedback)
    const isValid = result.success;


    return (
        <div className="mt-4 border-t border-blue-200">

       {feedback ? (
        <div
          className={`p-4 rounded-2xl text-sm border ${
            isValid
              ? "bg-blue-50 border-blue-100 text-gray-700"
              : "bg-red-50 border-red-200 text-red-600"
          }`}
        >
          {feedback}
        </div>
      ) : (
        <p className="text-gray-400 text-sm italic">
          Click the AI Feedback button to get personalized suggestions!
        </p>
      )}
    </div>
  );
}

export function generateAIFdb(name: string): string {
  const feedbacks = [
    `Hey ${name}! Your profile is looking sharp. The stage name is unique — love it! Adding a bit more to your bio would make it even more engaging.`,
    `${name}, solid presence! Consider linking your GitHub or LinkedIn so people can see your work instantly.`,
    `AI check: Your avatar + banner combo is fire 🔥. Maybe add a personal website if you have a portfolio?`,
    `Great job, ${name}! You joined early — that’s cool. A short one-liner in your bio would help visitors instantly know what you’re about.`,
    `${name}’s profile feels professional. One tiny suggestion: try adding a couple of your top skills or interests in the description!`,
  ];

  return feedbacks[Math.floor(Math.random() * feedbacks.length)];
}
