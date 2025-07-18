'use client';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../../contexts/auth';
import { sendMessageToAdmin, fetchMessages, subscribeToMessages } from '@/services/chatService';

export default function ChatBox() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const chatIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const loadMessages = async () => {
      try {
        const id = await sendMessageToAdmin(user.id, ""); // This ensures chat exists
        chatIdRef.current = id;
        const msgs = await fetchMessages(id);
        setMessages(msgs);
        subscribeToMessages(id, (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        });
      } catch (err) {
        console.error(err);
      }
    };

    loadMessages();
  }, [user]);

  const sendMessage = async () => {
    if (!input.trim() || !chatIdRef.current) return;
    try {
      await sendMessageToAdmin(user.id, input);
      setInput('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-md p-4 border rounded bg-white shadow">
      <div className="h-64 overflow-y-auto space-y-2 mb-2">
        {messages.map((msg) => (
          <div key={msg.id} className={`p-2 rounded ${msg.sender_id === user.id ? 'bg-blue-100 text-right' : 'bg-gray-100 text-left'}`}>
            {msg.message}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border p-2 rounded"
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2 rounded">Send</button>
      </div>
    </div>
  );
}
