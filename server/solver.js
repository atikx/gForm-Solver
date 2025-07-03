import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const getans = async (questions) => {
  const prompt = `
You are a helpful assistant. Given an array of MCQ questions with options , return the same array with an added "answer" field in each object.select any one of options that is most appropriate for the question.

Return only valid JSON (not code block, no comments). Here's the input:

${JSON.stringify(questions, null, 2)}
`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Clean up any markdown formatting (e.g., ```
    const cleanedText = responseText
      .replace(/```json|```/g, "") // remove markdown code blocks if any
      .trim();

    // Try to parse the result as JSON
    const parsed = JSON.parse(cleanedText);
    if (!Array.isArray(parsed)) {
      throw new Error("Gemini response is not a valid array");
    }

    return parsed;
  } catch (error) {
    console.error("❌ Error parsing Gemini response:", error);
    throw error;
  }
};
