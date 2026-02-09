"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  MessageSquare,
  Trash2,
  Plus,
  ChevronLeft,
  List,
} from "lucide-react";

// Simple markdown renderer component
function MarkdownText({ text }: { text: string }) {
  const renderLine = (line: string, index: number) => {
    // Handle headers
    if (line.startsWith("### ")) {
      return (
        <h3
          key={index}
          className="text-sm font-semibold mb-1 mt-2 text-slate-800 dark:text-slate-100"
        >
          {line.slice(4)}
        </h3>
      );
    }
    if (line.startsWith("## ")) {
      return (
        <h2
          key={index}
          className="text-sm font-bold mb-2 mt-2 text-slate-900 dark:text-white"
        >
          {line.slice(3)}
        </h2>
      );
    }
    if (line.startsWith("# ")) {
      return (
        <h1
          key={index}
          className="text-base font-bold mb-2 mt-2 text-slate-900 dark:text-white"
        >
          {line.slice(2)}
        </h1>
      );
    }

    // Handle lists
    if (line.match(/^[\d]+\.\s/)) {
      const content = line.replace(/^[\d]+\.\s/, "");
      return (
        <li key={index} className="ml-4 text-sm">
          {formatInline(content)}
        </li>
      );
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const content = line.slice(2);
      return (
        <li
          key={index}
          className="ml-4 text-sm list-disc marker:text-[#FF5E1F]"
        >
          {formatInline(content)}
        </li>
      );
    }

    // Handle empty lines
    if (line.trim() === "") {
      return <div key={index} className="h-2" />;
    }

    // Regular paragraph
    return (
      <p key={index} className="mb-2">
        {formatInline(line)}
      </p>
    );
  };

  const formatInline = (text: string) => {
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;

    // Match bold, italic, code, links
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[([^\]]+)\]\(([^)]+)\))/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Add text before match
      if (match.index > currentIndex) {
        parts.push(text.substring(currentIndex, match.index));
      }

      const matched = match[0];
      if (matched.startsWith("**") && matched.endsWith("**")) {
        // Bold
        parts.push(
          <strong
            key={match.index}
            className="font-bold text-[#FF5E1F] dark:text-orange-400"
          >
            {matched.slice(2, -2)}
          </strong>,
        );
      } else if (matched.startsWith("*") && matched.endsWith("*")) {
        // Italic
        parts.push(
          <em key={match.index} className="italic">
            {matched.slice(1, -1)}
          </em>,
        );
      } else if (matched.startsWith("`") && matched.endsWith("`")) {
        // Code
        parts.push(
          <code
            key={match.index}
            className="px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-700 rounded text-xs font-mono"
          >
            {matched.slice(1, -1)}
          </code>,
        );
      } else if (matched.startsWith("[")) {
        // Link
        parts.push(
          <a
            key={match.index}
            href={match[3]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#FF5E1F] hover:text-orange-600 underline"
          >
            {match[2]}
          </a>,
        );
      }

      currentIndex = regex.lastIndex;
    }

    // Add remaining text
    if (currentIndex < text.length) {
      parts.push(text.substring(currentIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];
  let isOrderedList = false;

  lines.forEach((line, index) => {
    const isListItem = line.match(/^([\d]+\.|[-*])\s/);
    const isOrdered = line.match(/^[\d]+\.\s/);

    if (isListItem) {
      listItems.push(renderLine(line, index));
      if (isOrdered) isOrderedList = true;
    } else {
      // Flush list if we have items
      if (listItems.length > 0) {
        if (isOrderedList) {
          elements.push(
            <ol key={`list-${index}`} className="mb-2 space-y-1 list-decimal">
              {listItems}
            </ol>,
          );
        } else {
          elements.push(
            <ul key={`list-${index}`} className="mb-2 space-y-1">
              {listItems}
            </ul>,
          );
        }
        listItems = [];
        isOrderedList = false;
      }
      elements.push(renderLine(line, index));
    }
  });

  // Flush remaining list items
  if (listItems.length > 0) {
    if (isOrderedList) {
      elements.push(
        <ol key="list-final" className="mb-2 space-y-1 list-decimal">
          {listItems}
        </ol>,
      );
    } else {
      elements.push(
        <ul key="list-final" className="mb-2 space-y-1">
          {listItems}
        </ul>,
      );
    }
  }

  return <div className="leading-relaxed">{elements}</div>;
}

// Initial welcome message
const INITIAL_MESSAGES = [
  {
    id: 1,
    role: "ai",
    text: "Hi there! I'm your TripC AI Concierge. How can I help you plan your perfect trip today?",
  },
];

// Default suggestions for initial state
const DEFAULT_SUGGESTIONS = [
  "Find hotels in Da Nang",
  "Search flights to Ho Chi Minh",
  "Best restaurants in Hai Quan",
];

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: string;
  messageCount: number;
}

export function ChatWidget() {
  const pathname = usePathname();
  // Check if we are on likely booking pages with sticky footers
  const isBookingPage = pathname?.includes("/hotels/") || pathname?.includes("/flights/");

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showConversationList, setShowConversationList] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load conversations when chat opens
  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen]);

  // Generate AI-powered suggestions when messages change
  useEffect(() => {
    // Don't generate suggestions if we only have the welcome message
    if (messages.length <= 1) {
      setSuggestions(DEFAULT_SUGGESTIONS);
      return;
    }

    // Generate new suggestions after AI responds
    generateAISuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const generateAISuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const response = await fetch("/api/chat/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages.map((m) => ({
            role: m.role === "ai" ? "assistant" : "user",
            content: m.text,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || DEFAULT_SUGGESTIONS);
      } else {
        // Keep current suggestions on error
        console.error("Failed to generate suggestions");
      }
    } catch (error) {
      console.error("Suggestion generation error:", error);
      // Keep current suggestions on error
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/chat/conversations");
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    const newUserMsg = { id: Date.now(), role: "user", text: userMessage };
    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      // Call the chat API
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages
            .map((m) => ({
              role: m.role === "ai" ? "assistant" : "user",
              content: m.text,
            }))
            .concat([
              {
                role: "user",
                content: userMessage,
              },
            ]),
          conversationId: conversationId, // Send conversation ID if exists
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiResponse = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") break;

              try {
                const parsed = JSON.parse(data);

                // Check if we received a conversation ID
                if (parsed.conversationId && !conversationId) {
                  setConversationId(parsed.conversationId);
                }

                if (parsed.content) {
                  aiResponse += parsed.content;
                  // Update the message in real-time
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages[newMessages.length - 1];
                    if (lastMsg && lastMsg.role === "ai") {
                      lastMsg.text = aiResponse;
                    } else {
                      newMessages.push({
                        id: Date.now(),
                        role: "ai",
                        text: aiResponse,
                      });
                    }
                    return newMessages;
                  });
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      setIsTyping(false);

      // If no response was streamed, add the final message
      if (!aiResponse) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            role: "ai",
            text: "I apologize, but I encountered an error. Please try again.",
          },
        ]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "ai",
          text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    }
  };

  const handleSuggestionClick = (text: string) => {
    setInputValue(text);
  };

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
    setConversationId(null); // Reset conversation ID
    setShowConversationList(false);
    setSuggestions(DEFAULT_SUGGESTIONS);
  };

  const handleNewConversation = () => {
    handleReset();
  };

  const handleLoadConversation = async (convId: string) => {
    try {
      const response = await fetch(`/api/chat/conversations/${convId}`);
      if (response.ok) {
        const data = await response.json();

        // Convert messages from database format to UI format
        const loadedMessages = data.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role === "assistant" ? "ai" : "user",
          text: msg.content,
        }));

        setMessages(
          loadedMessages.length > 0 ? loadedMessages : INITIAL_MESSAGES,
        );
        setConversationId(convId);
        setShowConversationList(false);

        // Generate suggestions for loaded conversation
        if (loadedMessages.length > 0) {
          // We'll let the useEffect handle this
        } else {
          setSuggestions(DEFAULT_SUGGESTIONS);
        }
      }
    } catch (error) {
      console.error("Failed to load conversation:", error);
    }
  };

  const handleDeleteConversation = async () => {
    if (!conversationId) {
      handleReset();
      return;
    }

    if (
      !confirm(
        "Are you sure you want to delete this conversation? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/chat/conversations/${conversationId}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        handleReset();
        fetchConversations(); // Refresh the list
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            role: "ai",
            text: "Conversation deleted successfully.",
          },
        ]);
        setTimeout(handleReset, 1500);
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete conversation. Please try again.");
    }
  };

  const toggleConversationList = () => {
    setShowConversationList(!showConversationList);
  };

  return (
    <div
      className={`fixed right-6 z-[100] flex flex-col items-end gap-4 pointer-events-none transition-all duration-300 ${isBookingPage ? "bottom-24 md:bottom-6" : "bottom-6"}`}
    >
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
            className="pointer-events-auto w-[90vw] md:w-[400px] h-[600px] max-h-[80vh] bg-white/80 dark:bg-zinc-900/90 backdrop-blur-xl border border-white/20 dark:border-zinc-800 shadow-2xl rounded-[2.5rem] flex flex-col overflow-hidden origin-bottom-right relative"
          >
            {/* Conversation List Sidebar */}
            <AnimatePresence>
              {showConversationList && (
                <motion.div
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -100, opacity: 0 }}
                  transition={{ type: "spring", bounce: 0.2 }}
                  className="absolute inset-0 z-50 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-700 rounded-[2.5rem] overflow-hidden"
                >
                  {/* Sidebar Header */}
                  <div className="flex items-center justify-between px-6 py-4 bg-white/40 dark:bg-black/20 backdrop-blur-sm border-b border-white/10">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      Conversations
                    </h3>
                    <button
                      onClick={toggleConversationList}
                      className="p-2 rounded-full hover:bg-slate-100/50 dark:hover:bg-zinc-800/50 text-slate-500 dark:text-slate-400 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* New Conversation Button */}
                  <div className="p-4 border-b border-slate-200 dark:border-zinc-700">
                    <button
                      onClick={handleNewConversation}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#FF5E1F] hover:bg-orange-600 text-white rounded-2xl font-semibold transition-colors shadow-sm"
                    >
                      <Plus className="w-5 h-5" />
                      New Conversation
                    </button>
                  </div>

                  {/* Conversations List */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {conversations.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 dark:text-zinc-500 text-sm">
                        No conversations yet
                      </div>
                    ) : (
                      conversations.map((conv) => (
                        <motion.button
                          key={conv.id}
                          onClick={() => handleLoadConversation(conv.id)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full text-left p-3 rounded-2xl transition-all ${conv.id === conversationId
                            ? "bg-[#FF5E1F]/10 border-2 border-[#FF5E1F]"
                            : "bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700"
                            }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                                {conv.title}
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-zinc-400 truncate mt-1">
                                {conv.lastMessage}
                              </p>
                            </div>
                            <span className="text-xs text-slate-400 dark:text-zinc-500 whitespace-nowrap">
                              {conv.messageCount} msgs
                            </span>
                          </div>
                        </motion.button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white/40 dark:bg-black/20 backdrop-blur-sm border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleConversationList}
                  className="p-1.5 hover:bg-slate-100/50 dark:hover:bg-zinc-800/50 rounded-full transition-colors"
                >
                  <List className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
                <div className="p-1.5 bg-[#FF5E1F] rounded-full">
                  <Sparkles className="w-4 h-4 text-white fill-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base leading-none">
                    TripC AI
                  </h3>
                  <span className="text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF5E1F] to-orange-400 uppercase tracking-widest">
                    Concierge
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleDeleteConversation}
                  className="p-2 rounded-full hover:bg-red-100/50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 transition-colors"
                  title="Delete Conversation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNewConversation}
                  className="p-2 rounded-full hover:bg-slate-100/50 dark:hover:bg-zinc-800/50 text-slate-500 dark:text-slate-400 transition-colors"
                  title="New Chat"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100/50 dark:hover:bg-zinc-800/50 text-slate-500 dark:text-slate-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Messages Area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar scroll-smooth"
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className="max-w-[85%]">
                    {/* Bubble */}
                    <div
                      className={`px-4 py-3 shadow-sm text-sm leading-relaxed ${msg.role === "user"
                        ? "bg-gradient-to-r from-[#FF5E1F] to-[#ff8c5e] text-white rounded-2xl rounded-tr-none font-medium"
                        : "bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-zinc-700 rounded-2xl rounded-tl-none"
                        }`}
                    >
                      {msg.role === "user" ? (
                        <span className="font-medium">{msg.text}</span>
                      ) : (
                        <MarkdownText text={msg.text} />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start w-full"
                >
                  <div className="max-w-[85%]">
                    <div className="bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input Console */}
            <div className="p-4 pt-2">
              {/* AI-Generated Draggable Suggestion Carousel - Exactly 3 suggestions */}
              <div
                ref={suggestionsRef}
                className="flex gap-2 mb-3 overflow-x-scroll no-scrollbar pb-1 cursor-grab active:cursor-grabbing"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  WebkitOverflowScrolling: "touch",
                  scrollBehavior: "smooth",
                }}
                onMouseDown={(e) => {
                  const ele = suggestionsRef.current;
                  if (!ele) return;

                  e.preventDefault();
                  ele.style.scrollBehavior = "auto";
                  ele.style.cursor = "grabbing";

                  let isDown = true;
                  let startX = e.pageX;
                  let scrollLeft = ele.scrollLeft;
                  let velocityX = 0;
                  let lastX = e.pageX;
                  let lastTime = performance.now();
                  let animationId: number | null = null;
                  let hasDragged = false; // Track if user actually dragged

                  const handleMouseMove = (e: MouseEvent) => {
                    if (!isDown) return;
                    e.preventDefault();

                    const now = performance.now();
                    const deltaTime = now - lastTime;
                    const x = e.pageX;
                    const deltaX = x - lastX;
                    const walk = x - startX;

                    // Mark as dragged if moved more than 3px
                    if (Math.abs(walk) > 3) {
                      hasDragged = true;
                    }

                    // Smooth scrolling with high responsiveness
                    ele.scrollLeft = scrollLeft - walk;

                    // Calculate velocity with smoothing
                    if (deltaTime > 0) {
                      const currentVelocity = deltaX / deltaTime;
                      velocityX = velocityX * 0.8 + currentVelocity * 0.2; // Smooth velocity
                    }

                    lastX = x;
                    lastTime = now;
                  };

                  const applyMomentum = () => {
                    const friction = 0.93; // Higher = longer momentum
                    const minVelocity = 0.05;

                    if (Math.abs(velocityX) > minVelocity) {
                      ele.scrollLeft -= velocityX * 15; // Amplify velocity
                      velocityX *= friction;
                      animationId = requestAnimationFrame(applyMomentum);
                    } else {
                      velocityX = 0;
                      ele.style.scrollBehavior = "smooth";
                      animationId = null;
                    }
                  };

                  const handleMouseUp = () => {
                    isDown = false;
                    ele.style.cursor = "grab";
                    document.removeEventListener("mousemove", handleMouseMove);
                    document.removeEventListener("mouseup", handleMouseUp);

                    // Store drag state for click handler
                    ele.dataset.hasDragged = hasDragged.toString();

                    // Start momentum if velocity is significant
                    if (Math.abs(velocityX) > 0.3) {
                      if (animationId) cancelAnimationFrame(animationId);
                      applyMomentum();
                    } else {
                      ele.style.scrollBehavior = "smooth";
                    }

                    // Reset drag state after a short delay
                    setTimeout(() => {
                      ele.dataset.hasDragged = "false";
                    }, 100);
                  };

                  document.addEventListener("mousemove", handleMouseMove, {
                    passive: false,
                  });
                  document.addEventListener("mouseup", handleMouseUp);

                  // Cancel any existing momentum
                  if (animationId) {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                  }
                }}
              >
                {suggestions.map((suggestion, i) => (
                  <motion.button
                    key={i}
                    onClick={(e) => {
                      // Prevent click if user just dragged
                      const ele = suggestionsRef.current;
                      if (ele?.dataset.hasDragged === "true") {
                        e.preventDefault();
                        return;
                      }
                      handleSuggestionClick(suggestion);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex-shrink-0 whitespace-nowrap px-4 py-2 bg-gradient-to-r from-white/60 to-white/40 dark:from-zinc-800/60 dark:to-zinc-800/40 hover:from-white dark:hover:from-zinc-800 border border-white/30 dark:border-zinc-700 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all shadow-sm backdrop-blur-md hover:shadow-md hover:border-[#FF5E1F]/30 ${isLoadingSuggestions ? "opacity-50" : ""}`}
                    disabled={isLoadingSuggestions}
                  >
                    {isLoadingSuggestions && i === 0
                      ? "✨ Thinking..."
                      : suggestion}
                  </motion.button>
                ))}
              </div>

              {/* Input Field */}
              <div className="relative group">
                <div className="absolute inset-0 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-full shadow-sm border border-white/40 dark:border-zinc-700" />
                <div className="relative flex items-center px-2 py-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Ask about hotels, flights..."
                    className="flex-1 bg-transparent border-none focus:outline-none pl-4 text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium"
                  />
                  <button
                    onClick={handleSend}
                    className={`size-9 rounded-full flex items-center justify-center transition-all ${inputValue.trim() ? "bg-[#FF5E1F] text-white shadow-md hover:scale-105 active:scale-95" : "bg-slate-200 dark:bg-zinc-700 text-slate-400 cursor-not-allowed"}`}
                    disabled={!inputValue.trim()}
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="pointer-events-auto relative z-[100] w-14 h-14 bg-[#FF5E1F] hover:bg-orange-600 rounded-full shadow-lg shadow-orange-500/30 flex items-center justify-center text-white transition-colors"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-7 h-7" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Sparkles className="w-7 h-7" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse Ring when idle */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full border-2 border-[#FF5E1F] animate-ping opacity-20 pointer-events-none"></span>
        )}
      </motion.button>
    </div>
  );
}
