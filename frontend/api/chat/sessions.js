import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { chatSessions } from '../../src/lib/schema.ts';
import { eq, desc } from 'drizzle-orm';

const sql = postgres(process.env.DATABASE_URL);
const db = drizzle(sql);

export default withApiAuthRequired(async function handler(req, res) {
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
        .where(eq(chatSessions.userId, userId))
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