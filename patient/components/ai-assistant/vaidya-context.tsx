"use client";

import React, { useState, useEffect, createContext, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getAIAssistant, Message, DR_VAIDYA_SYSTEM_PROMPT as SYSTEM_PROMPT } from '@/lib/ai-assistant';
import { VaidyaDialog } from './vaidya-dialog';

// Initial messages for the chat
const initialMessages: Message[] = [
    {
        id: 'system-1',
        role: 'system',
        content: SYSTEM_PROMPT,
        timestamp: new Date()
    },
    {
        id: 'welcome',
        role: 'assistant',
        content: "Hello! I'm Dr. Vaidya, your VaidyaSetu AI health assistant. How can I help you with your health today?",
        timestamp: new Date()
    }
];

// Create a context to share the assistant functionality
interface VaidyaContextType {
    isOpen: boolean;
    messages: Message[];
    openAssistant: () => void;
    closeAssistant: () => void;
    sendMessage: (message: string) => Promise<void>;
    isTyping: boolean;
    clearMessages: () => void;
}

const VaidyaContext = createContext<VaidyaContextType | null>(null);

// Hook to use the assistant
export function useVaidya() {
    const context = useContext(VaidyaContext);
    if (!context) {
        throw new Error("useVaidya must be used within a VaidyaProvider");
    }
    return context;
}

// Provider component
export function VaidyaProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [isTyping, setIsTyping] = useState(false);

    // Load messages from localStorage on mount
    useEffect(() => {
        const savedMessages = localStorage.getItem("vaidyaMessages");
        if (savedMessages) {
            try {
                const parsedMessages = JSON.parse(savedMessages) as Message[];

                // Ensure the system prompt is always present
                if (!parsedMessages.some(msg => msg.role === 'system')) {
                    parsedMessages.unshift({
                        id: 'system-1',
                        role: 'system',
                        content: SYSTEM_PROMPT,
                        timestamp: new Date()
                    });
                }

                // Fix timestamp strings (convert back to Date objects)
                const messagesWithDates = parsedMessages.map(msg => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                }));

                setMessages(messagesWithDates);
            } catch (error) {
                console.error("Error parsing saved messages:", error);
            }
        }
    }, []);

    // Save messages to localStorage whenever they change
    useEffect(() => {
        if (messages.length > 2) {
            localStorage.setItem("vaidyaMessages", JSON.stringify(messages));
        }
    }, [messages]);

    const openAssistant = () => setIsOpen(true);
    const closeAssistant = () => setIsOpen(false);

    const clearMessages = () => {
        setMessages([
            {
                id: 'system-1',
                role: 'system',
                content: SYSTEM_PROMPT,
                timestamp: new Date()
            },
            {
                id: 'welcome',
                role: 'assistant',
                content: "Hello! I'm Dr. Vaidya, your VaidyaSetu AI health assistant. How can I help you with your health today?",
                timestamp: new Date()
            }
        ]);
        localStorage.removeItem("vaidyaMessages");
    };

    const sendMessage = async (message: string) => {
        // Don't send empty messages
        if (!message.trim()) return;

        // Create user message
        const userMessage: Message = {
            id: uuidv4(),
            role: 'user',
            content: message,
            timestamp: new Date()
        };

        // Add user message to chat
        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);

        // Get AI assistant service
        const aiAssistant = getAIAssistant();

        try {
            // Process the message stream
            const currentMessages = [...messages, userMessage];

            // Track the response text as it streams in
            let responseText = "";

            await aiAssistant.generateStreamingResponse(
                currentMessages,
                {
                    onStart: () => {
                        setIsTyping(true);
                    },
                    onToken: (text) => {
                        responseText = text;
                    },
                    onComplete: (fullResponse) => {
                        // Add assistant message to chat
                        const assistantMessage: Message = {
                            id: uuidv4(),
                            role: 'assistant',
                            content: fullResponse,
                            timestamp: new Date()
                        };

                        setMessages(prev => [...prev, assistantMessage]);
                        setIsTyping(false);
                    },
                    onError: (error) => {
                        console.error("Error from AI service:", error);
                        // Add error message
                        const errorMessage: Message = {
                            id: uuidv4(),
                            role: 'assistant',
                            content: "I'm sorry, I encountered an error processing your request. Please try again.",
                            timestamp: new Date()
                        };

                        setMessages(prev => [...prev, errorMessage]);
                        setIsTyping(false);
                    }
                }
            );
        } catch (error) {
            console.error("Error in sendMessage:", error);
            // Add error message
            const errorMessage: Message = {
                id: uuidv4(),
                role: 'assistant',
                content: "I'm sorry, there was an error processing your request. Please try again.",
                timestamp: new Date()
            };

            setMessages(prev => [...prev, errorMessage]);
            setIsTyping(false);
        }
    };

    const value = {
        isOpen,
        messages,
        openAssistant,
        closeAssistant,
        sendMessage,
        isTyping,
        clearMessages
    };

    return (
        <VaidyaContext.Provider value={value}>
            {children}
            {isOpen && <VaidyaDialog />}
        </VaidyaContext.Provider>
    );
}
