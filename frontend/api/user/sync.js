import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from '../../src/lib/schema.ts';
import { eq } from 'drizzle-orm';

const sql = postgres(process.env.DATABASE_URL);
const db = drizzle(sql);

export default withApiAuthRequired(async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getSession(req, res);
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { auth0Id, email, name, avatar } = req.body;

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.auth0Id, auth0Id))
      .limit(1);

    let user;
    
    if (existingUser.length > 0) {
      // Update existing user
      const updated = await db
        .update(users)
        .set({
          email,
          name,
          avatar,
          updatedAt: new Date(),
        })
        .where(eq(users.auth0Id, auth0Id))
        .returning();
      
      user = updated[0];
    } else {
      // Create new user
      const inserted = await db
        .insert(users)
        .values({
          auth0Id,
          email,
          name,
          avatar,
        })
        .returning();
      
      user = inserted[0];
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('User sync error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});