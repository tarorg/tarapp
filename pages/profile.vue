<script setup lang="ts">
import { useAuthData } from '~/composables/useAuthData'
import { Button } from '@/components/ui/button'
import { User, Mail, Key, ArrowLeft, LogOut, Database, LogOutIcon } from 'lucide-vue-next'
import { useNhost } from '~/plugins/nhost'

interface TarRecord {
  type: 'pin' | 'par'
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

    const types = ['pin', 'par'] as const
    
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
            sql: "SELECT type, tarid, plan FROM tar WHERE userid = ? AND type IN (?, ?)",
            args: [
              { value: userData.value.id, type: "text" },
              { value: "pin", type: "text" },
              { value: "par", type: "text" }
            ]
          }
        }]
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    const rows = result?.results?.[0]?.response?.result?.rows || []
    
    // Create a map of existing records with proper typing
    const recordsMap = new Map<string, TarRecord>(
      rows.map((row: any) => [
        row[0]?.value || '',
        {
          type: row[0]?.value as 'pin' | 'par',
          tarid: row[1]?.value || '',
          plan: row[2]?.value || ''
        }
      ])
    )

    // Create the final array with proper typing
    tarRecords.value = types.map(type => 
      recordsMap.get(type) || {
        type,
        tarid: '-',
        plan: '-'
      }
    ) as TarRecord[]

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
      <div v-if="userData" class="space-y-6">
        <!-- Profile Header with Navigation -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
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
          <Button variant="ghost" size="icon" @click="handleSignOut" class="text-muted-foreground hover:text-destructive">
            <LogOutIcon class="h-5 w-5 rotate-180" />
          </Button>
        </div>

        <!-- TAR Table -->
        <div class="mt-6">
          <div class="border rounded-lg overflow-hidden">
            <!-- Loading State -->
            <div v-if="isLoadingTar" class="p-4 text-center text-sm text-muted-foreground">
              Loading...
            </div>
            
            <!-- Error State -->
            <div v-else-if="loadError" class="p-4 text-center text-sm text-red-500">
              {{ loadError }}
            </div>
            
            <!-- Table Content -->
            <div v-else class="divide-y">
              <!-- Header Row -->
              <div class="grid text-sm" style="grid-template-columns: 80px 1fr 1fr;">
                <div class="p-2 pl-3">tar id</div>
                <div class="p-2 col-span-2">{{ userData?.id }}</div>
              </div>

              <!-- Data Rows -->
              <div 
                v-for="record in tarRecords" 
                :key="record.type"
                class="grid text-sm hover:bg-muted/5"
                style="grid-template-columns: 80px 1fr 1fr;"
                :class="{ 'cursor-pointer': record.type === 'pin' }"
                @click="record.type === 'pin' ? router.push(`/pin?id=${record.tarid}`) : null"
              >
                <div class="p-2 pl-3 capitalize">{{ record.type }}</div>
                <div class="p-2">{{ record.tarid }}</div>
                <div class="p-2">{{ record.plan }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template> 