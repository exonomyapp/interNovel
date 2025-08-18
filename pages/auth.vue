<template>
  <v-app>
    <v-main>
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="6">
            <v-card class="elevation-12">
              <v-toolbar color="primary" dark flat>
                <v-toolbar-title>Authentication</v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <v-tabs v-model="tab" grow>
                  <v-tab value="login">Login</v-tab>
                  <v-tab value="register">Register</v-tab>
                </v-tabs>
                <v-window v-model="tab">
                  <v-window-item value="login">
                    <v-form @submit.prevent="handleLogin">
                      <v-text-field
                        v-model="loginForm.email"
                        label="Email"
                        type="email"
                        required
                      />
                      <v-text-field
                        v-model="loginForm.password"
                        label="Password"
                        type="password"
                        required
                      />
                      <v-btn type="submit" color="primary" block>Login</v-btn>
                    </v-form>
                  </v-window-item>
                  <v-window-item value="register">
                    <v-form @submit.prevent="handleRegister">
                      <v-text-field
                        v-model="registerForm.email"
                        label="Email"
                        type="email"
                        required
                      />
                      <v-text-field
                        v-model="registerForm.password"
                        label="Password"
                        type="password"
                        required
                      />
                      <v-btn type="submit" color="primary" block>Register</v-btn>
                    </v-form>
                  </v-window-item>
                </v-window>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const tab = ref('login')
const loginForm = ref({
  email: '',
  password: ''
})
const registerForm = ref({
  email: '',
  password: ''
})

const handleLogin = async () => {
  try {
    await authStore.signIn({
      email: loginForm.value.email,
      password: loginForm.value.password
    })
    navigateTo('/')
  } catch (error) {
    console.error('Login error:', error)
  }
}

const handleRegister = async () => {
  try {
    await authStore.signUp({
      email: registerForm.value.email,
      password: registerForm.value.password
    })
    tab.value = 'login'
  } catch (error) {
    console.error('Registration error:', error)
  }
}
</script>