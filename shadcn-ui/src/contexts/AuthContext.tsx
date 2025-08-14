import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { mockAuth } from '@/lib/mockAuth'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<{ data: any; error: any }>
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>
  signInWithGoogle: () => Promise<{ data: any; error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const { data: { session } } = mockAuth.getSession()
    setSession(session as Session | null)
    setUser(session?.user ?? null)
    setLoading(false)

    // Listen for auth changes
    const { data: { subscription } } = mockAuth.onAuthStateChange((session) => {
      setSession(session as Session | null)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, fullName: string) => {
    return await mockAuth.signUp(email, password, fullName)
  }

  const signIn = async (email: string, password: string) => {
    return await mockAuth.signInWithPassword(email, password)
  }

  const signInWithGoogle = async () => {
    return await mockAuth.signInWithOAuth()
  }

  const signOut = async () => {
    await mockAuth.signOut()
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}