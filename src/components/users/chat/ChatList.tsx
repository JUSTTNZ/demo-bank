"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../../contexts/auth";
import {
  sendMessageToAdmin,
  fetchMessages,
  subscribeToMessages,
  getOrCreateChat
} from "@/services/chatService";
import {
  MessageCircle,
  Send,
  ArrowLeft,
  User,
  Clock,
  CheckCheck,
  Loader2,
} from "lucide-react";
import { useTimestampFormatter, getUserInitials } from "@/utils/timeStamp";

const ChatBox = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chatIdRef = useRef<string | null>(null);
  const [view, setView] = useState("admin-profile");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  const userTimezone = user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const { formatMessageTime, formatDetailedTime } = useTimestampFormatter(userTimezone);

  const adminProfile = {
    id: "admin-id",
    full_name: "Support Agent",
    last_sign_in_at: new Date(Date.now() - 300000),
    avatar_url: null,
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!user?.id) return;

    const loadMessages = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const chatId = await getOrCreateChat(user.id);
        chatIdRef.current = chatId;
        const msgs = await fetchMessages(chatId);
        
        const validMessages = msgs.filter((msg: any) => {
          return msg.message && 
                 msg.message.trim() !== "" && 
                 msg.created_at &&
                 !isNaN(new Date(msg.created_at).getTime());
        });
        
        setMessages(validMessages);
        
        const subscription = subscribeToMessages(chatId, (payload) => {
          if (payload.new.message && 
              payload.new.message.trim() !== "" && 
              payload.new.created_at &&
              !isNaN(new Date(payload.new.created_at).getTime())) {
            setMessages((prev) => [...prev, payload.new]);
          }
        });

        return () => {
          subscription.unsubscribe();
        };
        
      } catch (err) {
        console.error('Failed to load messages:', err);
        setError("Failed to load messages. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, view]);

  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || !chatIdRef.current || !user?.id) return;
    
    // Create optimistic message
    const tempId = `temp_${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      chat_id: chatIdRef.current,
      sender_id: user.id,
      message: trimmedInput,
      created_at: new Date().toISOString(),
      profiles: {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email
      }
    };

    // Add to messages immediately
    setMessages(prev => [...prev, optimisticMessage]);
    setInput("");
    setIsSending(true);

    try {
      await sendMessageToAdmin(user.id, trimmedInput);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError("Failed to send message. Please try again.");
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      setInput(trimmedInput);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (view === "admin-profile") {
    return (
      <div className="w-full bg-white min-h-screen">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4">
          <h1 className="text-xl font-semibold">Customer Support</h1>
          <p className="text-emerald-100 text-sm">We're here to help you 24/7</p>
        </div>

        <div className="p-4 md:p-6">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 md:p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                {getUserInitials(adminProfile.full_name)}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-800">{adminProfile.full_name}</h2>
                <p className="text-gray-600 text-sm">Customer Support Team</p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-500">Online now</span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
    
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  Available 24/7
                </span>
              </div>
            </div>

            <button
              onClick={() => setView("chat")}
              className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Start Chat</span>
            </button>
          </div>

          <div className="mt-6 bg-emerald-50 rounded-lg p-4">
            <h3 className="font-medium text-emerald-900 mb-2">How can we help?</h3>
            <p className="text-emerald-700 text-sm">
              Our support team is ready to assist you with any questions or issues.
            </p>
            <p className="text-emerald-600 text-xs mt-2">
              Your timezone: {userTimezone}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white h-screen flex flex-col">
      {/* Fixed header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 flex items-center space-x-3 flex-shrink-0">
        <button
          onClick={() => setView("admin-profile")}
          className="hover:bg-white/20 p-1 rounded transition-colors"
          aria-label="Back to profile"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white text-sm font-semibold">
          {getUserInitials(adminProfile.full_name)}
        </div>
        <div className="flex-1">
          <h2 className="font-semibold">{adminProfile.full_name}</h2>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-xs text-emerald-100">Responds within minutes</span>
          </div>
        </div>
      </div>

      {isLoading && messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center text-red-500">{error}</div>
        </div>
      ) : (
        <>
          {/* Scrollable messages area */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {messages.map((msg, index) => {
              const isUser = msg.sender_id === user?.id;
              const showTimestamp = index === 0 || 
                                   new Date(msg.created_at).getTime() - new Date(messages[index - 1].created_at).getTime() > 300000 ||
                                   messages[index - 1].sender_id !== msg.sender_id;

              return (
                <div key={msg.id}>
                  {showTimestamp && (
                    <div className="text-center text-xs text-gray-400 mb-2">
                      {formatDetailedTime(msg.created_at, userTimezone)}
                    </div>
                  )}
                  <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-lg ${isUser 
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-br-none" 
                        : "bg-gray-100 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.message}</p>
                      <div className={`flex items-center justify-end space-x-1 mt-1 text-xs ${
                        isUser ? "text-emerald-100" : "text-gray-500"
                      }`}>
                        <span>{formatMessageTime(msg.created_at, userTimezone)}</span>
                        {isUser && <CheckCheck className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Fixed input area */}
          <div className="p-4 border-t bg-gray-50 flex-shrink-0">
            <div className="flex space-x-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                rows={1}
                disabled={isSending}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isSending}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-3 rounded-lg hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 transition-all duration-200 shadow-lg flex items-center justify-center"
                aria-label="Send message"
              >
                {isSending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBox;