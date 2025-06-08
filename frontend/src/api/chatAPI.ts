// Simple API functions for chat management
export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  preset?: string;
  countries?: string[];
  queryType?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  type: 'human' | 'ai';
  content: string;
  metadata?: any;
  createdAt: string;
}

export const createSession = async (data: {
  userId: string;
  title: string;
  preset?: string;
  countries?: string[];
  queryType?: string;
}): Promise<ChatSession> => {
  try {
    const sessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
    
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };
    
    sessions.unshift(newSession);
    localStorage.setItem('chatSessions', JSON.stringify(sessions));
    
    return newSession;
  } catch (error) {
    console.error('Create session error:', error);
    throw error;
  }
};

export const getSessions = async (userId: string): Promise<ChatSession[]> => {
  try {
    const sessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
    return sessions.filter((s: ChatSession) => s.userId === userId);
  } catch (error) {
    console.error('Get sessions error:', error);
    return [];
  }
};

export const addMessage = async (data: {
  sessionId: string;
  type: 'human' | 'ai';
  content: string;
  metadata?: any;
}): Promise<ChatMessage> => {
  try {
    const messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
    
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date().toISOString()
    };
    
    messages.push(newMessage);
    localStorage.setItem('chatMessages', JSON.stringify(messages));
    
    return newMessage;
  } catch (error) {
    console.error('Add message error:', error);
    throw error;
  }
};

export const getMessages = async (sessionId: string): Promise<ChatMessage[]> => {
  try {
    const messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
    return messages.filter((m: ChatMessage) => m.sessionId === sessionId);
  } catch (error) {
    console.error('Get messages error:', error);
    return [];
  }
};

export const deleteSession = async (sessionId: string): Promise<void> => {
  try {
    // Delete session
    const sessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
    const filteredSessions = sessions.filter((s: ChatSession) => s.id !== sessionId);
    localStorage.setItem('chatSessions', JSON.stringify(filteredSessions));
    
    // Delete associated messages
    const messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
    const filteredMessages = messages.filter((m: ChatMessage) => m.sessionId !== sessionId);
    localStorage.setItem('chatMessages', JSON.stringify(filteredMessages));
  } catch (error) {
    console.error('Delete session error:', error);
    throw error;
  }
};