// API function for user sync with PostgreSQL
export const syncUser = async (userData: {
  auth0Id: string;
  email: string;
  name?: string;
  avatar?: string;
  language?: string;
}) => {
  try {
    const response = await fetch('/api/user/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to sync user');
    }
    
    const user = await response.json();
    
    // Also keep in localStorage for quick access
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    return user;
  } catch (error) {
    console.error('User sync error:', error);
    // Fallback to localStorage if API fails
    const cachedUser = localStorage.getItem('currentUser');
    if (cachedUser) {
      return JSON.parse(cachedUser);
    }
    throw error;
  }
};