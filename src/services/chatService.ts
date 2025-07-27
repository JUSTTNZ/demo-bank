// utils/chatService.ts
import supabase from '@/utils/supabaseClient'
import type { RealtimePostgresInsertPayload } from '@supabase/supabase-js'
type Message = {
  id: string;
  chat_id: string;
  sender_id: string;
  message: string;
  created_at: string;
};
/**
 * Get or create a chat between user and admin WITHOUT sending a message
 */
export const getOrCreateChat = async (userId: string) => {
  // Step 1: Get user's admin ID from profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("created_by_admin_id")
    .eq("id", userId)
    .single();

  if (profileError || !profile?.created_by_admin_id) {
    throw new Error("Admin not assigned to this user.");
  }

  const adminId = profile.created_by_admin_id;

  // Step 2: Check if chat already exists between user and admin
  const { data: existingChats, error: fetchChatError } = await supabase
    .from("chats")
    .select("*")
    .eq("user_id", userId)
    .eq("admin_id", adminId);

  if (fetchChatError) throw new Error("Failed to fetch existing chats.");

  const existingChat = existingChats?.[0]; // Pick the first chat if it exists
  let chatId = existingChat?.id;

  // Step 3: Create chat if it doesn't exist
  if (!chatId) {
    const { data: newChat, error: chatError } = await supabase
      .from("chats")
      .insert({
        user_id: userId,
        admin_id: adminId,
      })
      .select()
      .single();

    if (chatError) throw new Error("Failed to create chat.");

    chatId = newChat.id;
  }

  return chatId;
};

/**
 * Send a message from a user to their assigned admin.
 * Uses existing chat or creates one if needed.
 */
export const sendMessageToAdmin = async (userId: string, text: string) => {
  // Don't send empty messages
  if (!text || text.trim() === "") {
    throw new Error("Cannot send empty message");
  }

  // Get or create the chat
  const chatId = await getOrCreateChat(userId);

  // Send the message
  const { error: messageError } = await supabase.from("messages").insert({
    chat_id: chatId,
    sender_id: userId,
    message: text.trim(), // Ensure we trim the message
  });

  if (messageError) {
    console.error("Message insert error:", messageError);
    throw new Error("Failed to send message.");
  }

  return chatId;
};

/**
 * Fetch all messages in a given chat, sorted by time.
 */
export const fetchMessages = async (chatId: string) => {
  const { data, error } = await supabase
    .from("messages")
    .select("*") // Remove the profile join - we don't need names
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Fetch messages error:", error);
    throw new Error("Could not fetch messages.");
  }

  return data || [];
};

/**
 * Subscribe to new messages in a chat using Supabase Realtime.
 */
export const subscribeToMessages = (
  chatId: string,
  callback: (payload:  RealtimePostgresInsertPayload<Message>) => void
) => {
  return supabase
    .channel(`chat-messages-${chatId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`,
      },
      callback
    )
    .subscribe();
};