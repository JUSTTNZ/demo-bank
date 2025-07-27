// pages/api/admin/chats/[chatId].ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { getChatDetails, deleteChat } from '@/lib/admin'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { chatId },
    method,
  } = req

  try {
    if (method === 'GET') {
      const { success, chat, error } = await getChatDetails(chatId as string)
      if (!success) return res.status(400).json({ error })
      return res.status(200).json({ success: true, chat })
    }

    if (method === 'DELETE') {
      const { success, error } = await deleteChat(chatId as string)
      if (!success) return res.status(400).json({ error })
      return res.status(200).json({ success: true })
    }

    res.setHeader('Allow', ['GET', 'DELETE'])
    return res.status(405).end(`Method ${method} Not Allowed`)
  } catch (error: unknown) {
    const err = error as Error;
    return res.status(500).json({
      error: err.message || 'Internal server error',
    });
  }
}
