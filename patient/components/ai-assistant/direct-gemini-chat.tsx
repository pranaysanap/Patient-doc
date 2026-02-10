"use client";

import React, { useState, useEffect, useRef } from 'react';
import { getStreamingAIResponse } from '@/lib/geminiDirect';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Download, Mic, MicOff, Send, Image, File, X, Plus, Trash2, Heart, ThumbsUp, ThumbsDown, Bookmark } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Stethoscope, Paperclip, ChevronDown, Volume2, VolumeX, PlayCircle, StopCircle, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { 
  speakText, 
  speakLongText, 
  stopSpeaking, 
  initSpeechSynthesis, 
  isSpeechSynthesisActive,
  setSpeechRate as setTTSRate,
  setSpeechPitch as setTTSPitch,
  setSpeechVolume as setTTSVolume
} from '@/lib/speechService';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  bookmarked?: boolean;
  rating?: 'like' | 'dislike';
  attachments?: Array<{
    type: 'image' | 'file';
    url: string;
    name: string;
  }>;
};

type DirectGeminiChatProps = {
  onClose?: () => void;
};

// Speech recognition type
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function DirectGeminiChat({ onClose }: DirectGeminiChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I\'m Dr. Echo, your EchoMed AI health assistant. How can I help you with your health today?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [attachments, setAttachments] = useState<Array<{type: 'image' | 'file', file: File, preview: string}>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const recognition = useRef<any>(null);
  const [theme, setTheme] = useState<'blue' | 'teal' | 'purple'>('blue');
  
  // Add text-to-speech state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [textToSpeechEnabled, setTextToSpeechEnabled] = useState(true);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [speechVolume, setSpeechVolume] = useState(1.0);
  const [activeSpeakingMessageId, setActiveSpeakingMessageId] = useState<string | null>(null);
  
  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognition.current = new SpeechRecognition();
        recognition.current.continuous = true;
        recognition.current.interimResults = true;
        recognition.current.lang = 'en-US';
        
        // Set a longer timeout for speech detection
        recognition.current.speechRecognitionTimeout = 10000; // 10 seconds
        
        recognition.current.onstart = () => {
          setIsListening(true);
          toast.success("Voice input started - Please start speaking");
        };
        
        recognition.current.onend = () => {
          // If we're still marked as listening when onend fires, 
          // it means it ended unexpectedly, so try to restart
          if (isListening) {
            try {
              recognition.current?.start();
            } catch (err) {
              console.error('Error restarting recognition:', err);
              setIsListening(false);
            }
          } else {
            setIsListening(false);
          }
        };
        
        recognition.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          
          // Handle specific error cases
          switch (event.error) {
            case 'no-speech':
              toast.error("No speech detected. Please try speaking again or check your microphone.");
              // Don't stop listening, just notify the user
              return;
            case 'audio-capture':
              toast.error("No microphone detected. Please check your microphone connection.");
              break;
            case 'not-allowed':
              toast.error("Microphone access denied. Please allow microphone access in your browser settings.");
              break;
            case 'network':
              toast.error("Network error occurred. Please check your internet connection.");
              break;
            default:
              toast.error("Voice input error: " + event.error);
          }
          
          setIsListening(false);
        };
        
        recognition.current.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          // Update input value with both final and interim results
          setInputValue(prevValue => {
            const newValue = finalTranscript || interimTranscript;
            return newValue || prevValue;
          });
        };
        
        // Add nomatch handler
        recognition.current.onnomatch = () => {
          toast.error("Could not understand speech. Please try speaking more clearly.");
        };
      }
    }
    
    // Initialize speech synthesis
    const initSpeech = async () => {
      await initSpeechSynthesis();
    };
    initSpeech();
    
    return () => {
      if (recognition.current) {
        try {
          recognition.current.stop();
        } catch (err) {
          console.error('Error stopping recognition:', err);
        }
      }
      stopSpeaking();
    };
  }, [isListening]);
  
  // Check speaking status periodically to update the UI
  useEffect(() => {
    const checkSpeakingInterval = setInterval(() => {
      const currentlySpeaking = isSpeechSynthesisActive();
      setIsSpeaking(currentlySpeaking);
      
      // If speech has stopped, clear the active message
      if (!currentlySpeaking && isSpeaking) {
        setActiveSpeakingMessageId(null);
      }
    }, 200);
    
    return () => clearInterval(checkSpeakingInterval);
  }, [isSpeaking]);
  
  // Toggle text-to-speech setting
  const toggleTextToSpeech = () => {
    if (textToSpeechEnabled) {
      stopSpeaking();
      setActiveSpeakingMessageId(null);
    }
    setTextToSpeechEnabled(!textToSpeechEnabled);
    toast.success(textToSpeechEnabled ? "Voice output disabled" : "Voice output enabled");
  };
  
  // Speak text and manage state
  const speakMessage = (text: string, messageId: string) => {
    if (!textToSpeechEnabled) return;
    
    // If we're already speaking this message, stop it
    if (activeSpeakingMessageId === messageId) {
      stopSpeaking();
      setActiveSpeakingMessageId(null);
      return;
    }
    
    // Otherwise, stop any current speech and start speaking this message
    stopSpeaking();
    setIsSpeaking(true);
    setActiveSpeakingMessageId(messageId);
    speakLongText(text);
  };
  
  // Update speech settings with feedback
  const handleSetSpeechRate = (rate: number) => {
    setSpeechRate(rate);
    setTTSRate(rate);
  };
  
  const handleSetSpeechPitch = (pitch: number) => {
    setSpeechPitch(pitch);
    setTTSPitch(pitch);
  };
  
  const handleSetSpeechVolume = (volume: number) => {
    setSpeechVolume(volume);
    setTTSVolume(volume);
  };
  
  // Stop speaking
  const handleStopSpeaking = () => {
    stopSpeaking();
    setIsSpeaking(false);
    setActiveSpeakingMessageId(null);
  };
  
  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleListening = () => {
    if (isListening) {
      try {
        recognition.current?.stop();
        setIsListening(false);
        toast.success("Voice input stopped");
      } catch (error) {
        console.error("Error stopping speech recognition:", error);
        toast.error("Error stopping voice input");
      }
    } else {
      try {
        setInputValue(''); // Clear previous input
        recognition.current?.start();
        toast.success("Voice input started - Speak now", {
          description: "If no speech is detected, try speaking louder or check your microphone settings."
        });
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        toast.error("Couldn't access microphone. Please check your browser permissions.");
        setIsListening(false);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() && attachments.length === 0) return;
    
    // Stop listening if active
    if (isListening) {
      try {
        recognition.current?.stop();
      } catch (err) {
        console.error('Error stopping recognition:', err);
      }
    }
    
    // Create attachment objects for the message
    const messageAttachments = attachments.map(att => ({
      type: att.type,
      url: att.preview,
      name: att.file.name
    }));
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
      attachments: messageAttachments.length > 0 ? messageAttachments : undefined
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setAttachments([]);
    
    // Create temporary message for typing effect
    const tempId = 'typing-' + Date.now();
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      },
    ]);
    
    // Prepare prompt with attachment descriptions
    let promptWithAttachments = inputValue;
    if (messageAttachments.length > 0) {
      const attachmentDescriptions = messageAttachments.map(att => 
        `[User has attached a ${att.type}: ${att.name}]`
      ).join("\n");
      promptWithAttachments = `${inputValue}\n\n${attachmentDescriptions}`;
    }
    
    // Get AI response using our direct implementation
    try {
      const finalResponse = await getStreamingAIResponse(
        promptWithAttachments,
        (text) => {
          setMessages((prev) => 
            prev.map((msg) => 
              msg.id === tempId ? { ...msg, content: text } : msg
            )
          );
        }
      );
      
      // Update with final message and assign a proper ID
      const finalMessageId = 'response-' + Date.now();
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === tempId ? { ...msg, id: finalMessageId } : msg
        )
      );
      
      // Speak the response if text-to-speech is enabled
      if (textToSpeechEnabled) {
        speakMessage(finalResponse, finalMessageId);
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      // Update with error message
      const errorMessageId = 'error-' + Date.now();
      const errorContent = "I'm sorry, I encountered an error. Please try again later.";
      
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === tempId ? { 
            ...msg, 
            id: errorMessageId,
            content: errorContent
          } : msg
        )
      );
      
      // Speak the error message if text-to-speech is enabled
      if (textToSpeechEnabled) {
        speakMessage(errorContent, errorMessageId);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'image') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setAttachments(prev => [...prev, {
        type: type === 'image' ? 'image' : 'file',
        file: file,
        preview: result
      }]);
    };
    
    if (type === 'image') {
      reader.readAsDataURL(file);
    } else {
      // For non-image files, we'll just use the file name and icon
      reader.readAsDataURL(file);
    }
    
    // Reset file input
    e.target.value = '';
  };
  
  const handleFileClick = (type: 'file' | 'image') => {
    if (type === 'file') {
      fileInputRef.current?.click();
    } else {
      imageInputRef.current?.click();
    }
  };
  
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };
  
  const bookmarkMessage = (id: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === id ? { ...msg, bookmarked: !msg.bookmarked } : msg
      )
    );
    toast.success("Message bookmarked for later reference");
  };
  
  const rateMessage = (id: string, rating: 'like' | 'dislike') => {
    setMessages(prev => 
      prev.map(msg => {
        // If this message already has this rating, remove it
        if (msg.id === id && msg.rating === rating) {
          return { ...msg, rating: undefined };
        }
        // Otherwise set the new rating
        return msg.id === id ? { ...msg, rating } : msg;
      })
    );
    
    if (rating === 'like') {
      toast.success("Thanks for the positive feedback!");
    } else {
      toast.success("Thanks for your feedback. We'll work to improve.");
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };
  
  const clearChat = () => {
    if (confirm("Are you sure you want to clear the chat history?")) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: 'Hello! I\'m Dr. Echo, your EchoMed AI health assistant. How can I help you with your health today?',
        timestamp: new Date(),
      }]);
      toast.success("Chat history cleared");
    }
  };
  
  const downloadChat = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 255);
    doc.text("Dr. Echo Chat History", 20, 20);
    doc.setTextColor(0, 0, 0);
    
    // Add timestamp
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);
    
    let yPosition = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add each message
    messages.forEach((msg) => {
      // Add sender
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 255);
      doc.text(`${msg.role === 'user' ? 'You' : 'Dr. Echo'} - ${msg.timestamp.toLocaleTimeString()}`, 20, yPosition);
      yPosition += 10;
      
      // Add message content with word wrap
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      
      const textLines = doc.splitTextToSize(msg.content, pageWidth - 40);
      
      // Check if we need a new page
      if (yPosition + textLines.length * 7 > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.text(textLines, 20, yPosition);
      yPosition += textLines.length * 7 + 10;
    });
    
    // Save the PDF
    doc.save("dr-echo-chat.pdf");
    toast.success("Chat history downloaded as PDF");
  };

  const getThemeColors = () => {
    switch(theme) {
      case 'teal':
        return {
          headerFrom: 'from-teal-600',
          headerTo: 'to-teal-500',
          accent: 'bg-teal-700', 
          highlight: 'text-teal-400',
          hover: 'hover:bg-teal-600',
          button: 'bg-teal-500 hover:bg-teal-600',
          userMessageFrom: 'from-teal-500',
          userMessageTo: 'to-teal-600'
        };
      case 'purple':
        return {
          headerFrom: 'from-purple-600',
          headerTo: 'to-purple-500',
          accent: 'bg-purple-700',
          highlight: 'text-purple-400',
          hover: 'hover:bg-purple-600',
          button: 'bg-purple-500 hover:bg-purple-600',
          userMessageFrom: 'from-purple-500',
          userMessageTo: 'to-purple-600'
        };
      default: // blue
        return {
          headerFrom: 'from-blue-600',
          headerTo: 'to-blue-500',
          accent: 'bg-blue-700',
          highlight: 'text-blue-400',
          hover: 'hover:bg-blue-600',
          button: 'bg-blue-500 hover:bg-blue-600',
          userMessageFrom: 'from-blue-500',
          userMessageTo: 'to-blue-600'
        };
    }
  };

  const themeColors = getThemeColors();

  const changeTheme = (newTheme: 'blue' | 'teal' | 'purple') => {
    setTheme(newTheme);
    toast.success(`Theme changed to ${newTheme}`);
  };

  return (
    <motion.div 
      className="fixed bottom-0 right-0 w-full sm:w-auto sm:max-w-md md:max-w-lg lg:max-w-xl z-50 p-4 sm:p-0 sm:mb-20 sm:mr-4"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative h-[600px] max-h-[80vh] w-full sm:w-[400px] lg:w-[500px] rounded-xl overflow-hidden flex flex-col bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 shadow-2xl">
        {/* Header */}
        <motion.div 
          className={`bg-gradient-to-r ${themeColors.headerFrom} ${themeColors.headerTo} flex items-center justify-between px-4 py-3`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center">
            <div className={`${themeColors.accent} rounded-full p-2 mr-2 shadow-lg`}>
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, 0, -5, 0]
                }}
                transition={{ 
                  repeat: Infinity, 
                  repeatType: "mirror", 
                  duration: 2,
                  repeatDelay: 5
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
                  <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
                  <circle cx="20" cy="10" r="2" />
                </svg>
              </motion.div>
            </div>
            <div>
              <div className="font-semibold text-white text-lg flex items-center gap-2">
                Dr. Echo
                <motion.span 
                  className="bg-green-500 rounded-full w-3 h-3"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                ></motion.span>
              </div>
              <div className="text-white text-xs opacity-80">EchoMed AI Health Assistant</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="relative group">
              <button
                className="text-white hover:bg-blue-600 p-1.5 rounded-lg transition-all"
                title="Change theme"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
                </svg>
              </button>
              <div className="absolute top-full right-0 mt-1 hidden group-hover:flex bg-gray-800 rounded-lg shadow-xl overflow-hidden z-10 flex-col w-28">
                <button onClick={() => changeTheme('blue')} className="px-3 py-2 hover:bg-blue-800 text-left text-sm flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-white">Blue</span>
                </button>
                <button onClick={() => changeTheme('teal')} className="px-3 py-2 hover:bg-teal-800 text-left text-sm flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                  <span className="text-white">Teal</span>
                </button>
                <button onClick={() => changeTheme('purple')} className="px-3 py-2 hover:bg-purple-800 text-left text-sm flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-white">Purple</span>
                </button>
              </div>
            </div>
            
            <button
              className="text-white hover:bg-blue-600 p-1.5 rounded-lg transition-all"
              onClick={clearChat}
              title="Clear chat"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            
            <button
              className="text-white hover:bg-blue-600 p-1.5 rounded-lg transition-all"
              onClick={downloadChat}
              title="Download chat history"
            >
              <Download className="h-5 w-5" />
            </button>
            
            <button 
              className="text-white hover:bg-blue-600 p-1.5 rounded-lg transition-all"
              onClick={onClose}
              title="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div 
                key={message.id} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl shadow-md ${
                    message.role === 'user' 
                      ? `bg-gradient-to-br ${themeColors.userMessageFrom} ${themeColors.userMessageTo} text-white` 
                      : 'bg-gradient-to-br from-gray-800 to-gray-700 text-white'
                  }`}
                >
                  {/* Message attachments if any */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="p-2 space-y-2">
                      {message.attachments.map((attachment, index) => (
                        <div key={index} className="rounded-lg overflow-hidden border border-gray-700">
                          {attachment.type === 'image' ? (
                            <img 
                              src={attachment.url} 
                              alt="Attached image" 
                              className="max-w-full h-auto max-h-60 object-contain"
                            />
                          ) : (
                            <div className="bg-gray-900 p-2 flex items-center gap-2">
                              <File className="h-5 w-5 text-gray-300" />
                              <span className="text-sm text-gray-300 truncate">{attachment.name}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Message content */}
                  <div className="p-4">
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    <div className="text-xs opacity-70 mt-2 flex justify-between items-center">
                      <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      
                      {/* Only show actions for assistant messages */}
                      {message.role === 'assistant' && message.id !== 'welcome' && (
                        <div className="flex gap-1">
                          <button 
                            onClick={() => copyToClipboard(message.content)}
                            className="p-1 hover:bg-gray-600 rounded transition-colors"
                            title="Copy to clipboard"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                          
                          <button 
                            onClick={() => bookmarkMessage(message.id)}
                            className={`p-1 hover:bg-gray-600 rounded transition-colors ${message.bookmarked ? themeColors.highlight : ''}`}
                            title={message.bookmarked ? "Remove bookmark" : "Bookmark"}
                          >
                            <Bookmark className="h-3 w-3" fill={message.bookmarked ? "currentColor" : "none"} />
                          </button>
                          
                          <div className="flex gap-1">
                            <button 
                              onClick={() => rateMessage(message.id, 'like')}
                              className={`p-1 hover:bg-gray-600 rounded transition-colors ${message.rating === 'like' ? 'text-green-400' : 'text-gray-400'}`}
                              title="Helpful response"
                            >
                              <ThumbsUp className="h-3 w-3" fill={message.rating === 'like' ? "currentColor" : "none"} />
                            </button>
                            <button 
                              onClick={() => rateMessage(message.id, 'dislike')}
                              className={`p-1 hover:bg-gray-600 rounded transition-colors ${message.rating === 'dislike' ? 'text-red-400' : 'text-gray-400'}`}
                              title="Not helpful response"
                            >
                              <ThumbsDown className="h-3 w-3" fill={message.rating === 'dislike' ? "currentColor" : "none"} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
        
        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="p-2 border-t border-gray-800 overflow-x-auto">
            <div className="flex gap-2">
              {attachments.map((att, index) => (
                <div key={index} className="relative flex-shrink-0 w-16 h-16 rounded border border-gray-700 overflow-hidden bg-gray-900">
                  {att.type === 'image' ? (
                    <img src={att.preview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <File className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <button 
                    className="absolute top-0 right-0 bg-red-500 w-5 h-5 flex items-center justify-center rounded-bl-md"
                    onClick={() => removeAttachment(index)}
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Input */}
        <div className="p-4 border-t border-gray-800">
          <div className="text-xs text-blue-300 mb-2 flex justify-between items-center">
            <span>Ask Dr. Echo about your health concerns</span>
            {isTyping && (
              <motion.span 
                className="text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                Dr. Echo is thinking...
              </motion.span>
            )}
          </div>
          
          <div className="relative">
            <textarea
              className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-4 pr-[90px] text-white resize-none min-h-[56px] max-h-32 outline-none focus:border-blue-500 transition-colors"
              placeholder="Type your health question..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{ overflowY: 'auto' }}
              rows={1}
              disabled={isTyping}
            />
            
            {/* Input action buttons */}
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => handleFileUpload(e, 'file')}
              />
              <input 
                type="file" 
                ref={imageInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'image')}
              />
              
              {/* Toggle more options */}
              <AnimatePresence>
                {showOptions && (
                  <motion.div 
                    className="absolute right-[52px] bottom-0 flex items-center gap-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <button
                      className={`p-2 text-gray-400 hover:${themeColors.highlight} hover:bg-gray-700 rounded-full transition-colors`}
                      onClick={() => handleFileClick('file')}
                      title="Upload file"
                      disabled={isTyping}
                    >
                      <File className="h-4 w-4" />
                    </button>
                    <button
                      className={`p-2 text-gray-400 hover:${themeColors.highlight} hover:bg-gray-700 rounded-full transition-colors`}
                      onClick={() => handleFileClick('image')}
                      title="Upload image"
                      disabled={isTyping}
                    >
                      <Image className="h-4 w-4" />
                    </button>
                    <button
                      className={`p-2 ${isListening ? 'text-red-500' : `text-gray-400 hover:${themeColors.highlight}`} hover:bg-gray-700 rounded-full transition-colors`}
                      onClick={toggleListening}
                      title={isListening ? "Stop recording" : "Voice input"}
                      disabled={isTyping}
                    >
                      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <button
                className={`p-2 text-gray-400 hover:${themeColors.highlight} hover:bg-gray-700 rounded-full transition-colors`}
                onClick={() => setShowOptions(!showOptions)}
                title="More options"
                disabled={isTyping}
              >
                <Plus className="h-4 w-4" />
              </button>
              
              <button
                className={`p-2 rounded-full transition-all ${
                  isTyping 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                    : (!inputValue.trim() && attachments.length === 0)
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : `${themeColors.button} text-white`
                }`}
                onClick={handleSendMessage}
                disabled={(!inputValue.trim() && attachments.length === 0) || isTyping}
                title="Send message"
              >
                {isTyping ? (
                  <motion.div 
                    className="h-4 w-4"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="60" strokeDashoffset="20" />
                    </svg>
                  </motion.div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          
          <div className="text-[10px] text-gray-500 mt-2 text-center">
            Dr. Echo provides general information and is not a substitute for professional medical advice.
          </div>
        </div>
      </div>
    </motion.div>
  );
} 