<script setup lang="ts">
import { useAuthData } from '~/composables/useAuthData'
import { Button } from '@/components/ui/button'
import { User, Mail, Key, ArrowLeft, LogOut, Database } from 'lucide-vue-next'
import { useNhost } from '~/plugins/nhost'

interface TarRecord {
  id: number
  userid: string
  type: string
  tarid: string
  plan: string
}

const { userData, isLoggedIn } = useAuthData()
const { signOut } = useNhost()
const router = useRouter()
const tarRecords = ref<TarRecord[]>([])
const isLoadingTar = ref(true)
const loadError = ref<string | null>(null)

// Fetch TAR records from Turso
const fetchTarRecords = async () => {
  if (!userData.value?.id) return
  
  try {
    isLoadingTar.value = true
    loadError.value = null

    const url = "https://commerce-tarframework.turso.io/v2/pipeline"
    const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Mjk2NzQwNjQsImlkIjoiN2ZiNTFhMTgtYjU1My00Y2M2LTkwZWItZDE0ZTcxNDI5ODlhIn0.zxIjODPlBzNcAgQQ70xZj2sI7j7RSAHpYPQUtvyoAHDb4nLGzHAPiVvnJ6qeK7-00F8A6Lz__CSPjdITPZ31BQ"

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requests: [{
          type: "execute",
          stmt: {
            sql: "SELECT id, userid, type, tarid, plan FROM tar WHERE userid = ?",
            args: [{ value: userData.value.id, type: "text" }]
          }
        }]
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Server response:', errorText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log('Raw API Response:', result)
    
    const rows = result?.results?.[0]?.response?.result?.rows || []
    
    tarRecords.value = rows.map((row: any) => ({
      id: row[0]?.value || 0,
      userid: row[1]?.value || '',
      type: row[2]?.value || '',
      tarid: row[3]?.value || '',
      plan: row[4]?.value || ''
    }))

  } catch (error) {
    console.error('Failed to fetch TAR records:', error)
    loadError.value = 'Failed to load TAR records'
  } finally {
    isLoadingTar.value = false
  }
}

// Redirect to auth page if not logged in
watchEffect(() => {
  if (!isLoggedIn) {
    router.push('/auth')
  } else {
    fetchTarRecords() // Fetch TAR records when logged in
  }
})

const goBack = () => {
  router.push('/')
}

const handleSignOut = async () => {
  const { error } = await signOut()
  if (!error) {
    router.push('/auth')
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="container mx-auto p-4 max-w-2xl">
    <!-- Not Logged In State -->
    <div v-if="!isLoggedIn" class="flex justify-center items-center min-h-[60vh]">
      <div class="text-center">
        <p class="text-lg text-muted-foreground mb-4">Please sign in to view your profile</p>
        <Button @click="router.push('/auth')">
          Sign In
        </Button>
      </div>
    </div>

    <!-- Logged In State -->
    <template v-else>
      <div class="flex justify-between items-center mb-6">
        <Button @click="goBack" variant="ghost" class="gap-2">
          <ArrowLeft class="h-4 w-4" />
          Profile
        </Button>
        <Button variant="ghost" size="icon" @click="handleSignOut" class="text-muted-foreground hover:text-destructive">
          <LogOut class="h-5 w-5" />
        </Button>
      </div>
      
      <div v-if="userData" class="space-y-6">
        <!-- Profile Header -->
        <div class="flex items-center space-x-4 mb-6">
          <div class="h-16 w-16 rounded-full overflow-hidden bg-muted flex items-center justify-center">
            <img 
              v-if="userData.avatar" 
              :src="userData.avatar" 
              :alt="userData.name"
              class="h-full w-full object-cover"
            />
            <User v-else class="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h2 class="text-xl font-medium">{{ userData.name }}</h2>
            <p class="text-sm text-muted-foreground">{{ userData.email }}</p>
          </div>
        </div>

        <!-- Profile Details -->
        <div class="space-y-1 bg-muted/5">
          <div class="flex items-center p-3 hover:bg-muted/10 rounded-lg">
            <Key class="h-4 w-4 text-muted-foreground mr-3" />
            <div>
              <p class="text-sm text-muted-foreground break-all">{{ userData.id }}</p>
            </div>
          </div>
        </div>

        <!-- TAR Table -->
        <div class="mt-6">
          <div class="flex items-center space-x-2 mb-2">
            <Database class="h-4 w-4 text-muted-foreground" />
            <span class="text-sm font-medium">TAR</span>
          </div>
          
          <div class="border rounded-lg overflow-hidden">
            <!-- Table Header -->
            <div class="grid grid-cols-3 bg-muted/5 border-b text-sm font-medium">
              <div class="p-2">Type</div>
              <div class="p-2">TAR ID</div>
              <div class="p-2">Plan</div>
            </div>
            
            <!-- Loading State -->
            <div v-if="isLoadingTar" class="p-4 text-center text-sm text-muted-foreground">
              Loading...
            </div>
            
            <!-- Error State -->
            <div v-else-if="loadError" class="p-4 text-center text-sm text-red-500">
              {{ loadError }}
            </div>
            
            <!-- Table Content -->
            <div v-else-if="tarRecords.length > 0" class="divide-y">
              <div 
                v-for="record in tarRecords" 
                :key="record.id"
                class="grid grid-cols-3 text-sm hover:bg-muted/5"
              >
                <div class="p-2">{{ record.type }}</div>
                <div class="p-2">{{ record.tarid }}</div>
                <div class="p-2">{{ record.plan }}</div>
              </div>
            </div>
            
            <!-- Empty State -->
            <div v-else class="p-4 text-center text-sm text-muted-foreground">
              No TAR records found
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template> 