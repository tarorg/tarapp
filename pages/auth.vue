<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft } from 'lucide-vue-next'
import { navigateTo } from '#app'
import { useNhost } from '~/plugins/nhost'
import { useAuthError } from '~/composables/useAuthError'
import { ref } from 'vue'

const { signInWithEmail } = useNhost()
const { error, isLoading, handleAuthError, clearError, setLoading } = useAuthError()
const router = useRouter()

const email = ref('')
const password = ref('')

const goBack = () => {
  router.push('/')
}

const handleSubmit = async () => {
  try {
    setLoading(true)
    clearError()
    
    const { session, error: authError } = await signInWithEmail(email.value, password.value)
    
    if (authError) {
      throw authError
    }

    if (session) {
      router.push('/')
    }
  } catch (e: unknown) {
    handleAuthError(e)
  } finally {
    setLoading(false)
  }
}

const goToSignUp = () => {
  router.push('/sign-up')
}
</script>

<template>
  <div class="min-h-screen p-4">
    <Button @click="goBack" variant="ghost" class="mb-4">
      <ArrowLeft class="mr-2 h-4 w-4" />
      Back
    </Button>
    <Card class="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle class="text-2xl">
          Login
        </CardTitle>
        <CardDescription>
          Sign in to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="grid gap-4">
          <div class="grid gap-2">
            <Label for="email">Email</Label>
            <Input
              id="email"
              v-model="email"
              type="email"
              placeholder="m@example.com"
              required
            />
          </div>
          <div class="grid gap-2">
            <div class="flex items-center">
              <Label for="password">Password</Label>
              <a v-if="!isSignUp" href="#" class="ml-auto inline-block text-sm underline">
                Forgot password?
              </a>
            </div>
            <Input 
              id="password"
              v-model="password"
              type="password" 
              required 
            />
          </div>
          
          <div v-if="error" class="text-sm text-red-500 text-center">
            {{ error }}
          </div>
          
          <Button type="submit" class="w-full" :disabled="isLoading">
            {{ isLoading ? 'Processing...' : 'Sign In' }}
          </Button>
        </form>
        
        <div class="mt-4 text-center text-sm">
          Don't have an account?
          <button 
            @click="goToSignUp" 
            class="underline ml-1"
          >
            Create one
          </button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
