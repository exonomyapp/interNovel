import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { User, Session } from '@supabase/supabase-js'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
declare const useSupabaseClient: () => any

interface Credentials {
  email: string
  password: string
}

interface AuthState {
  user: User | null
  session: Session | null
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)

  const persist = {
    enabled: true,
    strategies: [{ storage: process.client ? localStorage : undefined }]
  }

  async function signIn(credentials: Credentials) {
      const supabase = useSupabaseClient()
      const { data, error } = await supabase.auth.signInWithPassword(credentials)
      if (error) {
        throw error
      }
      user.value = data.user
      session.value = data.session
    }

    async function signUp(credentials: Credentials) {
      const supabase = useSupabaseClient()
      const { data, error } = await supabase.auth.signUp(credentials)
      if (error) {
        throw error
      }
      user.value = data.user
      session.value = data.session
    }

    async function signOut() {
      const supabase = useSupabaseClient()
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
      user.value = null
      session.value = null
    }

    async function fetchUser(): Promise<User | null> {
      const supabase = useSupabaseClient()
      const { data } = await supabase.auth.getSession()
      user.value = data.session?.user ?? null
      session.value = data.session ?? null
      return data.session?.user ?? null
    }

    async function init() {
      try {
        await fetchUser()
      } catch (error) {
        user.value = null
        session.value = null
      }
    }

  return {
    user,
    session,
    signIn,
    signUp,
    signOut,
    fetchUser,
    init,
    isLoggedIn: computed(() => !!user.value)
  }
})