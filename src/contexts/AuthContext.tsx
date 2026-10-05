import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (error || !profile) {
          // Profile doesn't exist, create it (for OAuth users)
          await createProfile(
            session.user.id,
            session.user.email!,
            session.user.user_metadata.full_name
          )
        } else {
          await fetchProfile(session.user.id)
        }
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: string, session: Session | null) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (error || !profile) {
          // Profile doesn't exist, create it (for OAuth users)
          await createProfile(
            session.user.id,
            session.user.email!,
            session.user.user_metadata.full_name
          )
        } else {
          await fetchProfile(session.user.id)
        }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
    } else {
      // Auto-assign role based on email if profile exists
      if (data) {
        let role = data.role
        const email = data.email.toLowerCase()

        // Super admin email
        if (email === 'daniellinus163@gmail.com') {
          role = 'super_admin'
        }
        // Admin email
        else if (email === 'vicdam539@gmail.com') {
          role = 'admin'
        }

        // Update role if it doesn't match email-based assignment
        if (role !== data.role) {
          await supabase
            .from('profiles')
            .update({ role })
            .eq('id', userId)
          data.role = role
        }

        setProfile(data)
      }
    }
  }

  const createProfile = async (userId: string, email: string, fullName?: string) => {
    let role = 'member'
    const emailLower = email.toLowerCase()

    // Super admin email
    if (emailLower === 'daniellinus163@gmail.com') {
      role = 'super_admin'
    }
    // Admin email
    else if (emailLower === 'vicdam539@gmail.com') {
      role = 'admin'
    }

    const { error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        full_name: fullName || email.split('@')[0],
        role: role,
        is_active: true,
      })

    if (error) {
      console.error('Error creating profile:', error)
    } else {
      await fetchProfile(userId)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
