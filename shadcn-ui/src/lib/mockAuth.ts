// Mock authentication system for testing without Supabase
interface MockUser {
  id: string
  email: string
  full_name: string | null
  created_at: string
}

interface MockSession {
  user: MockUser
  access_token: string
  expires_at: number
}

class MockAuthService {
  private users: Map<string, { password: string; user: MockUser }> = new Map()
  private currentSession: MockSession | null = null
  private listeners: ((session: MockSession | null) => void)[] = []

  constructor() {
    // Load from localStorage if available
    const savedSession = localStorage.getItem('mock_session')
    if (savedSession) {
      try {
        this.currentSession = JSON.parse(savedSession)
      } catch (e) {
        // Invalid session, ignore
      }
    }

    const savedUsers = localStorage.getItem('mock_users')
    if (savedUsers) {
      try {
        const userData = JSON.parse(savedUsers)
        this.users = new Map(Object.entries(userData))
      } catch (e) {
        // Invalid users data, ignore
      }
    }
  }

  private saveToStorage() {
    if (this.currentSession) {
      localStorage.setItem('mock_session', JSON.stringify(this.currentSession))
    } else {
      localStorage.removeItem('mock_session')
    }
    
    const usersData = Object.fromEntries(this.users.entries())
    localStorage.setItem('mock_users', JSON.stringify(usersData))
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentSession))
  }

  async signUp(email: string, password: string, fullName: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (this.users.has(email)) {
      return {
        data: null,
        error: { message: 'User already exists' }
      }
    }

    const user: MockUser = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      full_name: fullName,
      created_at: new Date().toISOString()
    }

    this.users.set(email, { password, user })
    this.saveToStorage()

    return {
      data: { user },
      error: null
    }
  }

  async signInWithPassword(email: string, password: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    const userData = this.users.get(email)
    if (!userData || userData.password !== password) {
      return {
        data: null,
        error: { message: 'Invalid login credentials' }
      }
    }

    const session: MockSession = {
      user: userData.user,
      access_token: 'mock_token_' + Math.random().toString(36),
      expires_at: Date.now() + 3600000 // 1 hour
    }

    this.currentSession = session
    this.saveToStorage()
    this.notifyListeners()

    return {
      data: { session, user: userData.user },
      error: null
    }
  }

  async signInWithOAuth() {
    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 1500))

    const user: MockUser = {
      id: 'google_' + Math.random().toString(36).substr(2, 9),
      email: 'demo@gmail.com',
      full_name: 'Demo User',
      created_at: new Date().toISOString()
    }

    const session: MockSession = {
      user,
      access_token: 'mock_google_token_' + Math.random().toString(36),
      expires_at: Date.now() + 3600000
    }

    this.currentSession = session
    this.saveToStorage()
    this.notifyListeners()

    return {
      data: { session, user },
      error: null
    }
  }

  async signOut() {
    this.currentSession = null
    this.saveToStorage()
    this.notifyListeners()
  }

  getSession() {
    return {
      data: { session: this.currentSession },
      error: null
    }
  }

  onAuthStateChange(callback: (session: MockSession | null) => void) {
    this.listeners.push(callback)
    
    // Return unsubscribe function
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const index = this.listeners.indexOf(callback)
            if (index > -1) {
              this.listeners.splice(index, 1)
            }
          }
        }
      }
    }
  }
}

export const mockAuth = new MockAuthService()