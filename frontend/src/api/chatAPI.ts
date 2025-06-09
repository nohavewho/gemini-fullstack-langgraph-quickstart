// API functions for chat management
export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  preset?: string | null;
  countries?: string[];
  queryType?: string | null;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface MessageMetadata {
  targetCountries?: string[];
  selectedCountries?: string[];
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  sources?: string[];
  reasoning?: string[];
  searchQuery?: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  type: 'human' | 'ai';
  content: string;
  metadata?: MessageMetadata;
  createdAt: string;
}

const API_BASE = '/api/chat';

export const createSession = async (data: {
  userId: string;
  title: string;
  preset?: string;
  countries?: string[];
  queryType?: string;
}): Promise<ChatSession> => {
  try {
    const response = await fetch(`${API_BASE}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('Failed to create session');
    return await response.json();
  } catch (error) {
    console.error('Create session error:', error);
    throw error;
  }
};

export const getSessions = async (userId: string): Promise<ChatSession[]> => {
  try {
    const response = await fetch(`${API_BASE}/sessions?userId=${userId}`);
    if (!response.ok) throw new Error('Failed to get sessions');
    return await response.json();
  } catch (error) {
    console.error('Get sessions error:', error);
    return [];
  }
};

export const addMessage = async (data: {
  sessionId: string;
  type: 'human' | 'ai';
  content: string;
  metadata?: MessageMetadata;
}): Promise<ChatMessage> => {
  try {
    const response = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: data.sessionId,
        role: data.type === 'human' ? 'user' : 'assistant',
        content: data.content,
        metadata: data.metadata
      })
    });
    
    if (!response.ok) throw new Error('Failed to add message');
    return await response.json();
  } catch (error) {
    console.error('Add message error:', error);
    throw error;
  }
};

export const getMessages = async (sessionId: string): Promise<ChatMessage[]> => {
  try {
    const response = await fetch(`${API_BASE}/messages?sessionId=${sessionId}`);
    if (!response.ok) throw new Error('Failed to get messages');
    return await response.json();
  } catch (error) {
    console.error('Get messages error:', error);
    return [];
  }
};

export const deleteSession = async (sessionId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE}/sessions/${sessionId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Failed to delete session');
  } catch (error) {
    console.error('Delete session error:', error);
    throw error;
  }
};