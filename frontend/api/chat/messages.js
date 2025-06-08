import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { messages } from '../../src/lib/schema.ts';
import { eq, asc } from 'drizzle-orm';

const sql = postgres(process.env.DATABASE_URL);
const db = drizzle(sql);

export default withApiAuthRequired(async function handler(req, res) {
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
        .where(eq(messages.sessionId, sessionId))
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