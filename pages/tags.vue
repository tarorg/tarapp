<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X } from 'lucide-vue-next'
import AppHeader from '@/components/AppHeader.vue'

interface Tag {
  id: number
  storeid: number
  name: string
  createdat: string
}

const tags = ref<Tag[]>([])
const isLoading = ref(true)
const searchQuery = ref('')
const newTagName = ref('')
const loadError = ref<string | null>(null)

const fetchTags = async () => {
  try {
    isLoading.value = true
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
            sql: "SELECT * FROM tags ORDER BY createdat DESC",
          }
        }]
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    const rows = result?.results?.[0]?.response?.result?.rows || []

    tags.value = rows.map((row: any[]) => ({
      id: Number(row[0].value),
      storeid: Number(row[1].value),
      name: row[2].value,
      createdat: row[3].value
    }))

  } catch (error) {
    console.error('Failed to fetch tags:', error)
    loadError.value = 'Failed to load tags. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const createTag = async () => {
  if (!newTagName.value.trim()) return

  try {
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
            sql: "INSERT INTO tags (storeid, name) VALUES (?, ?)",
            args: [
              { type: 'integer', value: '1' }, // storeid - replace with actual store ID
              { type: 'text', value: newTagName.value.trim() }
            ]
          }
        }]
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    newTagName.value = ''
    await fetchTags()

  } catch (error) {
    console.error('Failed to create tag:', error)
  }
}

const deleteTag = async (id: number) => {
  try {
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
            sql: "DELETE FROM tags WHERE id = ?",
            args: [{ type: 'integer', value: String(id) }]
          }
        }]
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    await fetchTags()

  } catch (error) {
    console.error('Failed to delete tag:', error)
  }
}

const filteredTags = computed(() => {
  if (!searchQuery.value) return tags.value
  
  const query = searchQuery.value.toLowerCase()
  return tags.value.filter(tag => 
    tag.name.toLowerCase().includes(query)
  )
})

onMounted(() => {
  fetchTags()
})
</script>

<template>
  <div class="flex flex-col h-screen">
    <AppHeader />

    <!-- Search Bar and Add Tag Input -->
    <div class="p-4 space-y-4">
      <Input
        v-model="searchQuery"
        type="text"
        placeholder="Search tags..."
        class="w-full"
      />
      
      <div class="flex gap-2">
        <Input
          v-model="newTagName"
          type="text"
          placeholder="Enter new tag name"
          class="flex-1"
          @keyup.enter="createTag"
        />
        <Button @click="createTag" variant="ghost" size="icon" class="h-10 w-10">
          <Plus class="h-5 w-5" />
        </Button>
      </div>
    </div>

    <!-- Tags List -->
    <div class="flex-1 overflow-auto p-4">
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        <div 
          v-for="tag in filteredTags" 
          :key="tag.id"
          class="flex items-center justify-between p-2 rounded-lg border bg-white"
        >
          <span class="text-sm truncate">{{ tag.name }}</span>
          <Button 
            variant="ghost" 
            size="icon"
            class="h-8 w-8 hover:text-red-500"
            @click="deleteTag(tag.id)"
          >
            <X class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overflow-auto::-webkit-scrollbar {
  display: none;
}

.overflow-auto {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style> 