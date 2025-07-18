// pages/api/admin/chats/[chatId]/messages.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { getChatMessages, createChatMessage } from '@/lib/admin'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    method,
    query: { chatId },
  } = req

  if (typeof chatId !== 'string') {
    return res.status(400).json({ error: 'Invalid chat ID' })
  }

  try {
    if (method === 'GET') {
      const { success, messages, error } = await getChatMessages(chatId)

      if (!success) return res.status(400).json({ error })

      return res.status(200).json({ success: true, messages })
    }

    if (method === 'POST') {
      const { content, message_type = 'text' } = req.body

      if (!content)
        return res.status(400).json({ error: 'Message content is required' })

      const { success, message, error } = await createChatMessage(
        chatId,
        content,
        message_type
      )

      if (!success) return res.status(400).json({ error })

      return res.status(200).json({ success: true, message })
    }

    return res.status(405).json({ error: `Method ${method} not allowed` })
  } catch (error: any) {
    return res.status(500).json({
      error: error.message || 'Internal server error',
    })
  }
}
