// Simple API function for user sync
export const syncUser = async (userData: {
  auth0Id: string;
  email: string;
  name?: string;
  avatar?: string;
}) => {
  try {
    // For now, just store in localStorage for demo
    // In production, this would call your backend API
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    let existingUserIndex = users.findIndex((u: any) => u.auth0Id === userData.auth0Id);
    
    const user = {
      id: existingUserIndex >= 0 ? users[existingUserIndex].id : crypto.randomUUID(),
      ...userData,
      createdAt: existingUserIndex >= 0 ? users[existingUserIndex].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      language: 'en'
    };
    
    if (existingUserIndex >= 0) {
      users[existingUserIndex] = user;
    } else {
      users.push(user);
    }
    
    localStorage.setItem('users', JSON.stringify(users));
    return user;
  } catch (error) {
    console.error('User sync error:', error);
    throw error;
  }
};