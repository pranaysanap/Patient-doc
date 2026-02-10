/**
 * Enhanced AI Assistant Service
 * A modern, robust implementation for the Dr. Echo chatbot
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Type definitions
export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export interface StreamCallbacks {
  onStart?: () => void;
  onToken?: (token: string) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: Error) => void;
}

// System prompts
export const DR_ECHO_SYSTEM_PROMPT = `
You are Dr. Echo, an advanced AI healthcare assistant developed by EchoMed. Your primary goal is to provide helpful, accurate, and compassionate healthcare guidance to users.

Guidelines:
1. Be empathetic and supportive while maintaining professional tone
2. Provide evidence-based information from reliable medical sources
3. Acknowledge uncertainty when appropriate
4. Encourage users to seek professional medical advice for serious concerns
5. Avoid making definitive diagnoses
6. Be concise yet comprehensive
7. Use plain language and explain medical terms
8. Consider physical, mental, and emotional aspects of health
9. Respect user privacy and maintain confidentiality

Remember: You are not a replacement for professional medical care, but a supportive resource for health information and guidance.
`;

// Main AI Service Class
export class AIAssistantService {
  private genAI: GoogleGenerativeAI | null = null;
  private apiKey: string;
  private model: string;
  private initialized: boolean = false;
  private initializationError: Error | null = null;
  private fallbackMode: boolean = false;

  constructor(apiKey?: string, model: string = "gemini-1.5-pro") {
    // Get API key from parameter or environment variable
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY || "";
    this.model = model;
    
    // Log API key status (without revealing the actual key)
    if (this.apiKey) {
      console.log("API key found, initializing AI Assistant...");
      console.log("API key length:", this.apiKey.length);
      console.log("API key first 4 chars:", this.apiKey.substring(0, 4));
    } else {
      console.warn("No API key provided for AI Assistant");
    }
    
    this.initialize();
  }

  /**
   * Initialize the AI service
   */
  private async initialize(): Promise<void> {
    try {
      if (!this.apiKey) {
        throw new Error("No API key provided");
      }

      // Create the Google Generative AI instance
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      
      // Test the API with a simple request to verify it's working
      const model = this.genAI.getGenerativeModel({ model: this.model });
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: "Hello, this is a test." }] }]
      });
      
      // If we get here, the API is working
      this.initialized = true;
      this.fallbackMode = false;
      console.log("AI Assistant service initialized successfully");
    } catch (error) {
      this.initializationError = error instanceof Error ? error : new Error("Unknown initialization error");
      this.fallbackMode = true;
      console.error("AI Assistant initialization failed:", this.initializationError.message);
      
      // Log more detailed error information
      if (error instanceof Error) {
        console.error("Error details:", error.stack);
      }
    }
  }

  /**
   * Get the initialization status
   */
  public getStatus(): { initialized: boolean; error: Error | null; fallbackMode: boolean } {
    return {
      initialized: this.initialized,
      error: this.initializationError,
      fallbackMode: this.fallbackMode
    };
  }

  /**
   * Generate a response to a conversation
   */
  public async generateResponse(messages: Message[]): Promise<string> {
    try {
      if (!this.initialized || this.fallbackMode) {
        return this.generateFallbackResponse(messages);
      }

      if (!this.genAI) {
        throw new Error("AI service not initialized");
      }

      // Prepare the conversation for the API
      const history = this.prepareConversationHistory(messages);
      
      // Get the generative model
      const model = this.genAI.getGenerativeModel({ model: this.model });
      
      // Configure safety settings
      const generationConfig = {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      };

      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ];

      // Generate content
      const result = await model.generateContent({
        contents: history,
        generationConfig,
        safetySettings,
      });

      const response = result.response;
      return response.text();
    } catch (error) {
      console.error("Error generating response:", error);
      this.fallbackMode = true;
      return this.generateFallbackResponse(messages);
    }
  }

  /**
   * Generate a streaming response
   */
  public async generateStreamingResponse(
    messages: Message[],
    callbacks: StreamCallbacks
  ): Promise<void> {
    try {
      callbacks.onStart?.();

      // Check if we're in fallback mode or not initialized
      if (!this.initialized || this.fallbackMode) {
        console.warn("AI Assistant is in fallback mode or not initialized. Using fallback responses.");
        await this.generateFallbackStreamingResponse(messages, callbacks);
        return;
      }

      // Double-check API key
      if (!this.apiKey || this.apiKey === 'your_api_key_here') {
        console.error("Invalid API key detected. API Key:", this.apiKey ? "Present but may be invalid" : "Missing");
        this.fallbackMode = true;
        await this.generateFallbackStreamingResponse(messages, callbacks);
        return;
      }

      if (!this.genAI) {
        console.error("Google Generative AI instance not initialized");
        throw new Error("AI service not initialized");
      }

      // Prepare the conversation for the API
      const history = this.prepareConversationHistory(messages);
      
      try {
        // Get the generative model
        const model = this.genAI.getGenerativeModel({ model: this.model });
        
        // Configure safety settings
        const generationConfig = {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        };

        const safetySettings = [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ];

        // Generate content stream
        console.log("Sending request to Gemini API...");
        const result = await model.generateContentStream({
          contents: history,
          generationConfig,
          safetySettings,
        });

        console.log("Received streaming response from Gemini API");
        let fullResponse = "";

        // Process each chunk as it comes
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          fullResponse += chunkText;
          callbacks.onToken?.(fullResponse);
        }

        console.log("Streaming complete, final response length:", fullResponse.length);
        callbacks.onComplete?.(fullResponse);
      } catch (apiError) {
        console.error("Error in API call:", apiError);
        if (apiError instanceof Error) {
          console.error("API Error details:", apiError.message, apiError.stack);
        }
        
        // Set fallback mode for future calls
        this.fallbackMode = true;
        
        // Use fallback response
        await this.generateFallbackStreamingResponse(messages, callbacks);
      }
    } catch (error) {
      console.error("Error in streaming response:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message, error.stack);
      }
      
      this.fallbackMode = true;
      callbacks.onError?.(error instanceof Error ? error : new Error("Unknown error in streaming response"));
      
      // Still try to provide a fallback response
      await this.generateFallbackStreamingResponse(messages, callbacks);
    }
  }

  /**
   * Prepare the conversation history for the API
   */
  private prepareConversationHistory(messages: Message[]) {
    return messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));
  }

  /**
   * Generate a fallback response when the API is unavailable
   */
  private async generateFallbackResponse(messages: Message[]): Promise<string> {
    const lastMessage = messages.filter(m => m.role === 'user').pop()?.content || "";
    
    // Simple keyword-based fallbacks
    if (lastMessage.toLowerCase().includes("hello") || lastMessage.toLowerCase().includes("hi")) {
      return "Hello! I'm Dr. Echo, your EchoMed AI health assistant. I'm currently operating in offline mode with limited capabilities, but I'll do my best to help you.";
    }
    
    if (lastMessage.toLowerCase().includes("headache")) {
      return "Headaches can be caused by various factors including stress, dehydration, lack of sleep, or eye strain. For occasional headaches, rest, staying hydrated, and over-the-counter pain relievers may help. If your headaches are severe or persistent, please consult a healthcare professional.\n\nNote: I'm currently operating in offline mode with limited capabilities.";
    }

    if (lastMessage.toLowerCase().includes("fitness") || lastMessage.toLowerCase().includes("exercise")) {
      return "Regular physical activity is important for maintaining good health. Adults should aim for at least 150 minutes of moderate-intensity activity or 75 minutes of vigorous activity each week, along with muscle-strengthening activities twice weekly. Always start gradually and listen to your body.\n\nNote: I'm currently operating in offline mode with limited capabilities.";
    }

    if (lastMessage.toLowerCase().includes("diet") || lastMessage.toLowerCase().includes("nutrition")) {
      return "A balanced diet typically includes plenty of fruits, vegetables, whole grains, lean proteins, and healthy fats. It's best to limit processed foods, added sugars, and excessive sodium. Staying hydrated is also important for overall health.\n\nNote: I'm currently operating in offline mode with limited capabilities.";
    }
    
    if (lastMessage.toLowerCase().includes("apple")) {
      return "Apples are nutritious fruits that are high in fiber, vitamin C, and various antioxidants. They're associated with numerous health benefits, including improved heart health and potential reduced risk of certain cancers. The saying 'an apple a day keeps the doctor away' reflects their reputation as a healthy food choice.\n\nNote: I'm currently operating in offline mode with limited capabilities.";
    }

    // Default response for any other queries
    return "I'm Dr. Echo, your health assistant. I'm currently operating in offline mode with limited capabilities. In this mode, I can only provide very general health information. For more specific guidance, please try again when my connection to the AI service is restored.\n\nFor medical concerns, please consult with a healthcare professional.\n\nTechnical note: The AI service connection is experiencing issues. This could be due to API key configuration, network connectivity, or service availability. Please check the console for more detailed error information.";
  }

  /**
   * Generate a streaming fallback response
   */
  private async generateFallbackStreamingResponse(
    messages: Message[],
    callbacks: StreamCallbacks
  ): Promise<void> {
    try {
      const response = await this.generateFallbackResponse(messages);
      let currentText = "";
      const words = response.split(" ");
      
      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 20)); // Simulate typing delay
        currentText += (i === 0 ? "" : " ") + words[i];
        callbacks.onToken?.(currentText);
      }
      
      callbacks.onComplete?.(response);
    } catch (error) {
      const errorMessage = "I'm sorry, I encountered an error. Please try again.";
      callbacks.onError?.(error instanceof Error ? error : new Error(errorMessage));
      callbacks.onComplete?.(errorMessage);
    }
  }
}

// Singleton instance for use throughout the app
let aiAssistantInstance: AIAssistantService | null = null;

export function getAIAssistant(): AIAssistantService {
  if (!aiAssistantInstance) {
    aiAssistantInstance = new AIAssistantService();
  }
  return aiAssistantInstance;
} 