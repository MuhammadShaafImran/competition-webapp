import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if environment variables are properly loaded
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase environment variables are missing. Check your .env file.")
}

// Create a single supabase client for the entire app
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase
