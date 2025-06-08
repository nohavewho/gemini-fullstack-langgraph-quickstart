import { NextApiRequest, NextApiResponse } from 'next';
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import { db } from '../../../lib/database';
import { messages } from '../../../lib/schema';
import { eq, asc } from 'drizzle-orm';

export default withApiAuthRequired(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getSession(req, res);
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'GET') {
      const { sessionId } = req.query;
      
      const sessionMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.sessionId, sessionId as string))
        .orderBy(asc(messages.createdAt));

      res.status(200).json(sessionMessages);
    } 
    
    else if (req.method === 'POST') {
      const { sessionId, type, content, metadata } = req.body;

      const newMessage = await db
        .insert(messages)
        .values({
          sessionId,
          type,
          content,
          metadata,
        })
        .returning();

      res.status(201).json(newMessage[0]);
    } 
    
    else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Chat messages error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});