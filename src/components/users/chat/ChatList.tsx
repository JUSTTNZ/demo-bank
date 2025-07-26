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
  
  // Get user's timezone from profile or browser
  const userTimezone = user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const { formatMessageTime, formatDetailedTime } = useTimestampFormatter(userTimezone);

  const adminProfile = {
    id: "admin-id",
    full_name: "Support Agent",
    email: "support@example.com",
    last_sign_in_at: new Date(Date.now() - 300000),
    avatar_url: null,
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!user?.id) return;

    const loadMessages = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log('🔍 Debug: Initializing chat for user:', user.id);
        
        const chatId = await getOrCreateChat(user.id);
        console.log('🔍 Debug: Chat ID obtained:', chatId);
        
        chatIdRef.current = chatId;
        const msgs = await fetchMessages(chatId);
        console.log('🔍 Debug: Fetched messages:', msgs);
        
        // Filter out empty messages and ensure timestamps are valid
        const validMessages = msgs.filter((msg: any) => {
          return msg.message && 
                 msg.message.trim() !== "" && 
                 msg.created_at &&
                 !isNaN(new Date(msg.created_at).getTime());
        });
        
        setMessages(validMessages);
        console.log('🔍 Debug: Valid messages after filtering:', validMessages);
        
        // Subscribe to new messages
        const subscription = subscribeToMessages(chatId, (payload) => {
          console.log('🔍 Debug: New message received:', payload.new);
          
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
        console.error('❌ Debug: Failed to load messages:', err);
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
    if (!trimmedInput || !chatIdRef.current) {
      console.log('🔍 Debug: Cannot send message - empty input or no chat ID');
      return;
    }
    
    console.log('🔍 Debug: Sending message:', {
      userId: user.id,
      chatId: chatIdRef.current,
      message: trimmedInput,
      messageLength: trimmedInput.length
    });
    
    setIsLoading(true);
    try {
      const result = await sendMessageToAdmin(user.id, trimmedInput);
      console.log('✅ Debug: Message sent successfully, chat ID:', result);
      setInput("");
    } catch (err) {
      console.error('❌ Debug: Failed to send message:', err);
      setError("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
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
          <p className="text-emerald-100 text-sm">Your dedicated support representative</p>
        </div>

        <div className="p-4 md:p-6">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 md:p-6">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-lg md:text-xl font-semibold">
                {adminProfile.avatar_url ? (
                  <img
                    src={adminProfile.avatar_url}
                    alt={adminProfile.full_name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getUserInitials(adminProfile.full_name)
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800">{adminProfile.full_name}</h2>
                <p className="text-gray-600 text-xs md:text-sm">Customer Support Representative</p>
                <div className="flex items-center space-x-1 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-500">Online</span>
                </div>
              </div>
            </div>

            <div className="mt-4 md:mt-6 space-y-2 md:space-y-3">
              <div className="flex items-center space-x-2 text-gray-600">
                <User className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-xs md:text-sm">{adminProfile.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-xs md:text-sm">
                  Last active: {formatMessageTime(adminProfile.last_sign_in_at, userTimezone)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setView("chat")}
              className="w-full mt-4 md:mt-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-2 md:py-3 px-4 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
            >
              <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
              <span>Start Chat</span>
            </button>
          </div>

          <div className="mt-4 md:mt-6 bg-emerald-50 rounded-lg p-3 md:p-4">
            <h3 className="font-medium text-emerald-900 mb-1 md:mb-2 text-sm md:text-base">Need Help?</h3>
            <p className="text-emerald-700 text-xs md:text-sm">
              Click START CHAT to begin a conversation with your support representative.
            </p>
            <p className="text-emerald-600 text-xs mt-1">
              Your timezone: {userTimezone}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white min-h-screen flex flex-col">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-3 md:p-4 flex items-center space-x-2 md:space-x-3">
        <button
          onClick={() => setView("admin-profile")}
          className="hover:bg-white/20 p-1 rounded transition-colors"
          aria-label="Back to profile"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-semibold">
          {getUserInitials(adminProfile.full_name)}
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-sm md:text-base">{adminProfile.full_name}</h2>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-xs text-emerald-100">Online</span>
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
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_id === user.id ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-lg shadow text-sm whitespace-pre-line ${
                    msg.sender_id === user.id
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {msg.message}
                  <div className={`flex items-center justify-end space-x-1 mt-1 text-xs ${
                    msg.sender_id === user.id ? "text-emerald-100" : "text-gray-500"
                  }`}>
                    <span title={formatDetailedTime(msg.created_at, userTimezone)}>
                      {formatMessageTime(msg.created_at, userTimezone)}
                    </span>
                    {msg.sender_id === user.id && <CheckCheck className="w-3 h-3" />}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-3 md:p-4 border-t bg-gray-50">
            <div className="flex space-x-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none text-sm md:text-base"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-2 rounded-lg hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 transition-all duration-200 shadow-lg flex items-center justify-center"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 md:w-5 md:h-5" />
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