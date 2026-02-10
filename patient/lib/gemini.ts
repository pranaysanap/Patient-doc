import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  console.warn("NEXT_PUBLIC_GEMINI_API_KEY is not set globally.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export const getGeminiResponse = async (history: { role: string; parts: string }[], message: string) => {
  if (!apiKey) return "Error: API Key not configured.";

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Map roles to Gemini format (user/model)
    const formattedHistory = history.map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.parts }]
    }));

    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        maxOutputTokens: 200,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to the medical database right now. Please try again.";
  }
};