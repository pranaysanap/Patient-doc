"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MessageSquare, Mic, Send, Sparkles, Bot, StopCircle } from "lucide-react";
import { getGeminiResponse } from "@/lib/gemini";

// Speech Recognition Type Definition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export function AIAssistantDemo() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: "Hello! I'm EchoMed. How can I help you with your health today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSend(transcript); // Auto-send on voice end
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  const handleSend = async (textOverride?: string) => {
    const text = textOverride || input;
    if (!text.trim()) return;

    // Add User Message
    const userMsg = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Call Gemini API
    try {
      // Format history for the API (only keeping recent context to save tokens/complexity)
      const history = messages.slice(-4).map(m => ({
        role: m.role,
        parts: m.content
      }));

      const response = await getGeminiResponse(history, text);

      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I am having trouble connecting. Please check your internet or API key." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="inline-flex items-center rounded-full bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-500 ring-1 ring-inset ring-blue-500/20">
              <Sparkles className="mr-1 h-3 w-3" /> Powered by Gemini Ultra
            </div>

            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Real-Time AI <br />
              <span className="text-primary">Medical Intelligence</span>
            </h2>

            <p className="text-lg text-muted-foreground leading-relaxed">
              Medical-grade AI that listens and speaks. Ask about symptoms, medications,
              or interpret your vitals instantly.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: MessageSquare, title: "Chat Naturally", desc: "No complex medical terms needed." },
                { icon: Mic, title: "Voice Activated", desc: "Just press the mic and speak." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-secondary/5 border border-border/50 hover:bg-secondary/10 transition-colors">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Phone Frame */}
            <div className="relative mx-auto max-w-[380px] bg-black rounded-[45px] p-3 shadow-2xl border-[6px] border-zinc-800">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-7 w-28 bg-black rounded-b-2xl z-20"></div>

              <div className="bg-background rounded-[35px] overflow-hidden h-[600px] flex flex-col relative">
                {/* Header */}
                <div className="pt-12 pb-4 px-6 bg-background/80 backdrop-blur-md sticky top-0 z-10 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Bot className="h-6 w-6 text-primary" />
                      </div>
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background"></span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">EchoMed AI</h3>
                      <p className="text-[10px] text-primary font-medium">Online • Gemini Pro</p>
                    </div>
                  </div>
                </div>

                {/* Chat Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                  <AnimatePresence mode="popLayout">
                    {messages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${message.role === "user"
                              ? "bg-primary text-primary-foreground rounded-tr-sm"
                              : "bg-muted text-foreground rounded-tl-sm border border-border/50"
                            }`}
                        >
                          {message.content}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="bg-muted border border-border/50 rounded-2xl rounded-tl-sm p-4 w-14 flex items-center justify-center gap-1">
                        <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce"></span>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-background/80 backdrop-blur-md border-t border-border/50">
                  <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-full border border-border/50 ring-offset-2 focus-within:ring-2 ring-primary/20 transition-all">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={toggleListening}
                      className={`rounded-full h-8 w-8 ${isListening ? "text-red-500 bg-red-500/10 animate-pulse" : "text-muted-foreground"}`}
                    >
                      {isListening ? <StopCircle className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={isListening ? "Listening..." : "Ask EchoMed..."}
                      className="flex-1 bg-transparent border-none focus:outline-none text-sm px-2"
                    />
                    <Button
                      size="icon"
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isTyping}
                      className="rounded-full h-8 w-8"
                    >
                      <Send className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Glow effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[750px] bg-primary/20 blur-[100px] -z-10 rounded-full opacity-50 pointer-events-none" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}