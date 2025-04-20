"use client"

import { createContext, useState, useEffect } from "react"
import supabase from "../api/supabaseClient"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    // Check for active session on mount
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error
        } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Session check error:", error.message)
          setAuthError(error.message)
        }
        
        setUser(session?.user || null)
        setLoading(false)

        // Set up auth state listener
        const {
          data: { subscription },
        } = await supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user || null)
          setAuthError(null)
        })

        return () => subscription.unsubscribe()
      } catch (err) {
        console.error("Auth initialization error:", err)
        setAuthError(err.message)
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  const login = async (email, password) => {
    try {
      setAuthError(null)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setAuthError(error.message)
        throw error
      }
      return data
    } catch (err) {
      setAuthError(err.message || "Login failed")
      throw err
    }
  }

  const loginWithGoogle = async () => {
    try {
      setAuthError(null)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      })

      if (error) {
        setAuthError(error.message)
        throw error
      }
      return data
    } catch (err) {
      setAuthError(err.message || "Google login failed")
      throw err
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        setAuthError(error.message)
        throw error
      }
    } catch (err) {
      setAuthError(err.message || "Logout failed")
      throw err
    }
  }

  const register = async (email, password) => {
    try {
      setAuthError(null)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setAuthError(error.message)
        throw error
      }
      return data
    } catch (err) {
      setAuthError(err.message || "Registration failed")
      throw err
    }
  }

  const value = {
    user,
    loading,
    login,
    loginWithGoogle,
    logout,
    register,
    isAuthenticated: !!user,
    authError,
    clearAuthError: () => setAuthError(null)
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
