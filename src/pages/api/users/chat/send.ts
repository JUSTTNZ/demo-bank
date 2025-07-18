// /pages/api/chat/send.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Make sure to restrict access with RLS
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { userId, message } = req.body;

  if (!userId || !message) return res.status(400).json({ error: "Missing fields" });

  // Step 1: Get user's admin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("created_by_admin_id")
    .eq("id", userId)
    .single();

  if (profileError || !profile?.created_by_admin_id) {
    return res.status(404).json({ error: "Admin not found for user" });
  }

  const adminId = profile.created_by_admin_id;

  // Step 2: Check if chat already exists
  const { data: existingChat } = await supabase
    .from("chats")
    .select("id")
    .match({ user_id: userId, admin_id: adminId })
    .maybeSingle();

  let chatId = existingChat?.id;

  // Step 3: Create chat if not exists
  if (!chatId) {
    const { data: newChat, error: chatError } = await supabase
      .from("chats")
      .insert({
        user_id: userId,
        admin_id: adminId,
      })
      .select("id")
      .single();

    if (chatError) return res.status(500).json({ error: "Failed to create chat" });
    chatId = newChat.id;
  }

  // Step 4: Insert the message
  const { error: msgError } = await supabase.from("messages").insert({
    chat_id: chatId,
    sender_id: userId,
    text: message,
  });

  if (msgError) return res.status(500).json({ error: "Failed to send message" });

  return res.status(200).json({ success: true, chatId });
}
