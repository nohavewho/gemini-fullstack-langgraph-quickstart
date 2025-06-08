import { NextApiRequest, NextApiResponse } from 'next';
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import { db } from '../../../lib/database';
import { chatSessions, users } from '../../../lib/schema';
import { eq, desc } from 'drizzle-orm';

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
      const { userId } = req.query;
      
      const sessions = await db
        .select()
        .from(chatSessions)
        .where(eq(chatSessions.userId, userId as string))
        .orderBy(desc(chatSessions.createdAt));

      res.status(200).json(sessions);
    } 
    
    else if (req.method === 'POST') {
      const { userId, title, preset, countries, queryType } = req.body;

      const newSession = await db
        .insert(chatSessions)
        .values({
          userId,
          title,
          preset,
          countries,
          queryType,
        })
        .returning();

      res.status(201).json(newSession[0]);
    } 
    
    else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Chat sessions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});