// utils/chatService.ts
import supabase from '@/utils/supabaseClient'

/**
 * Send a message from a user to their assigned admin.
 * - Checks for existing chat
 * - Creates a new chat if needed
 * - Inserts the message
 */
export const sendMessageToAdmin = async (userId: string, text: string) => {
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

  // Step 4: Send the message
  const { error: messageError } = await supabase.from("messages").insert({
    chat_id: chatId,
    sender_id: userId,
    message: text,
  });

  if (messageError) throw new Error("Failed to send message.");

  return chatId;
};

/**
 * Fetch all messages in a given chat, sorted by time.
 */
export const fetchMessages = async (chatId: string) => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error) throw new Error("Could not fetch messages.");

  return data;
};

/**
 * Subscribe to new messages in a chat using Supabase Realtime.
 * You must remember to unsubscribe when the component unmounts.
 */
export const subscribeToMessages = (
  chatId: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel('chat-messages')
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
