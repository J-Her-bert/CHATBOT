// Mock database for chat messages
interface ChatMessage {
  id: string
  user_id: string
  message: string
  response: string
  created_at: string
}

class MockDatabase {
  private messages: ChatMessage[] = []

  constructor() {
    // Load from localStorage
    const savedMessages = localStorage.getItem('mock_chat_messages')
    if (savedMessages) {
      try {
        this.messages = JSON.parse(savedMessages)
      } catch (e) {
        // Invalid data, ignore
      }
    }
  }

  private saveToStorage() {
    localStorage.setItem('mock_chat_messages', JSON.stringify(this.messages))
  }

  async insertMessage(userId: string, message: string, response: string) {
    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      user_id: userId,
      message,
      response,
      created_at: new Date().toISOString()
    }

    this.messages.push(newMessage)
    this.saveToStorage()

    return { data: newMessage, error: null }
  }

  async getMessagesByUser(userId: string) {
    const userMessages = this.messages
      .filter(msg => msg.user_id === userId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    return { data: userMessages, error: null }
  }
}

export const mockDb = new MockDatabase()