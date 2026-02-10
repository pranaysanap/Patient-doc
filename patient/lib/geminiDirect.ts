/**
 * Direct Gemini API Integration
 * Simple, focused implementation with proper error handling
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateFallbackResponse } from "./fallbackResponses";

// Get API key from environment variables
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY || "";

// Basic debugging
if (!API_KEY) {
  console.error("No API key found for Gemini API");
}

// Healthcare system prompt - simplified version
const SYSTEM_PROMPT = `
You are a helpful medical AI assistant. Provide clear and helpful information to users while being careful not to make 
definitive medical diagnoses or recommend specific treatments unless you're quoting established medical guidelines.
Always recommend consulting with a healthcare professional for specific medical advice or concerns.
`;

/**
 * A simple, direct function to generate a response using Gemini API
 * This uses the most basic pattern possible for reliability
 */
export async function getAIResponse(userMessage: string): Promise<string> {
  try {
    // Full prompt combining system instructions and user message
    const fullPrompt = `${SYSTEM_PROMPT}\n\nUser query: ${userMessage}\n\nYour response:`;
    
    // Initialize the Gemini API
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Get the generative model
    const model = genAI.getGenerativeModel({
      model: "gemini-pro"
    });
    
    // Generate content with error handling - proper format
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }]
    });
    
    // Process the response
    const response = result.response;
    const text = response.text();
    
    return text;
  } catch (error: any) {
    console.error("Error in getAIResponse:", error);
    console.error("Error details:", error.message);
    
    // Return a fallback response when the API fails
    return generateFallbackResponse(userMessage);
  }
}

/**
 * Streaming version of the API call
 * Updates the UI as chunks of the response arrive
 */
export async function getStreamingAIResponse(
  userMessage: string,
  onUpdate: (text: string) => void
): Promise<string> {
  try {
    // Full prompt combining system instructions and user message
    const fullPrompt = `${SYSTEM_PROMPT}\n\nUser query: ${userMessage}\n\nYour response:`;
    
    // Initialize the Gemini API
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Get the generative model
    const model = genAI.getGenerativeModel({
      model: "gemini-pro"
    });
    
    // Generate streaming content with error handling - proper format
    const result = await model.generateContentStream({
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }]
    });
    
    // Process the streaming response
    let fullResponse = "";
    
    for await (const chunk of result.stream) {
      const partialResponse = chunk.text();
      fullResponse += partialResponse;
      onUpdate(fullResponse);
    }
    
    return fullResponse;
  } catch (error: any) {
    console.error("Error in getStreamingAIResponse:", error);
    console.error("Error details:", error.message);
    
    // Return a fallback response when the API fails
    const fallbackResponse = generateFallbackResponse(userMessage);
    onUpdate(fallbackResponse);
    return fallbackResponse;
  }
} 