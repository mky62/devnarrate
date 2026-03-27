import { useState } from "react";
import z from "zod";

export default function FeedbackSection() {
    const [feedback, setFeedback] = useState("");

    const generateAIFeedback = () => {
        
    }
    

    const feedValid = z.string().max(200, "Feedback must be 200 characters or less");

    return (
        <div className="mt-4 border-t border-blue-200">


        </div>
    );
}