<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Search, 
  Image as ImageIcon,
  Video as VideoIcon,
  ChevronRight,
  X
} from 'lucide-vue-next'
import AppHeader from '@/components/AppHeader.vue'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Collection {
  id: number
  storeid: number
  title: string
  handle: string
  description: string | null
  image: string | null
  type: 'manual' | 'automated'
  conditions: string | null
  productscount: number
  active: string
  createdat: string
}

interface MediaItem {
  url: string
  mediaType: 'image' | 'video'
}

interface CollectionCondition {
  field: string
  operator: string
  value: string
}

const collections = ref<Collection[]>([])
const isLoading = ref(true)
const searchQuery = ref('')
const loadError = ref<string | null>(null)
const showAddSheet = ref(false)
const primaryFileInput = ref<HTMLInputElement | null>(null)

// Form data
const newCollection = ref({
  title: '',
  handle: '',
  description: '',
  image: null as MediaItem | null,
  type: 'manual' as 'manual' | 'automated',
  conditions: [] as CollectionCondition[]
})

// Add condition form data
const newCondition = ref({
  field: 'product_type',
  operator: 'equals',
  value: ''
})

const conditionFields = [
  { value: 'product_type', label: 'Product type' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'price', label: 'Price' },
  { value: 'tag', label: 'Tag' },
  { value: 'title', label: 'Title' }
]

const conditionOperators = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Does not equal' },
  { value: 'greater_than', label: 'Is greater than' },
  { value: 'less_than', label: 'Is less than' },
  { value: 'starts_with', label: 'Starts with' },
  { value: 'ends_with', label: 'Ends with' },
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Does not contain' }
]

const fetchCollections = async () => {
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
            sql: "SELECT * FROM collections WHERE active = 'true' ORDER BY createdat DESC",
          }
        }]
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    const rows = result?.results?.[0]?.response?.result?.rows || []

    collections.value = rows.map((row: any[]) => ({
      id: Number(row[0].value),
      storeid: Number(row[1].value),
      title: row[2].value,
      handle: row[3].value,
      description: row[4].value,
      image: row[5].value ? JSON.parse(row[5].value) : null,
      type: row[6].value,
      conditions: row[7].value ? JSON.parse(row[7].value) : [],
      productscount: Number(row[8].value),
      active: row[9].value,
      createdat: row[10].value
    }))

  } catch (error) {
    console.error('Failed to fetch collections:', error)
    loadError.value = 'Failed to load collections. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const createCollection = async () => {
  if (!newCollection.value.title.trim()) return

  try {
    const url = "https://commerce-tarframework.turso.io/v2/pipeline"
    const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Mjk2NzQwNjQsImlkIjoiN2ZiNTFhMTgtYjU1My00Y2M2LTkwZWItZDE0ZTcxNDI5ODlhIn0.zxIjODPlBzNcAgQQ70xZj2sI7j7RSAHpYPQUtvyoAHDb4nLGzHAPiVvnJ6qeK7-00F8A6Lz__CSPjdITPZ31BQ"

    const handle = newCollection.value.handle || 
      newCollection.value.title.toLowerCase().replace(/\s+/g, '-')

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
            sql: `INSERT INTO collections (
              storeid, title, handle, description, image, type, 
              conditions, productscount, active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              { type: 'integer', value: '1' },
              { type: 'text', value: newCollection.value.title.trim() },
              { type: 'text', value: handle },
              { type: 'text', value: newCollection.value.description || null },
              { type: 'text', value: newCollection.value.image ? JSON.stringify(newCollection.value.image) : null },
              { type: 'text', value: newCollection.value.type },
              { type: 'text', value: JSON.stringify(newCollection.value.conditions) },
              { type: 'integer', value: '0' },
              { type: 'text', value: 'true' }
            ]
          }
        }]
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Reset form and refresh list
    newCollection.value = {
      title: '',
      handle: '',
      description: '',
      image: null,
      type: 'manual',
      conditions: []
    }
    
    showAddSheet.value = false
    await fetchCollections()

  } catch (error) {
    console.error('Failed to create collection:', error)
  }
}

const deleteCollection = async (id: number) => {
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
            sql: "UPDATE collections SET active = 'false' WHERE id = ?",
            args: [{ type: 'integer', value: String(id) }]
          }
        }]
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    await fetchCollections()

  } catch (error) {
    console.error('Failed to delete collection:', error)
  }
}

const addCondition = () => {
  if (newCondition.value.value.trim()) {
    newCollection.value.conditions.push({
      field: newCondition.value.field,
      operator: newCondition.value.operator,
      value: newCondition.value.value.trim()
    })
    newCondition.value.value = ''
  }
}

const removeCondition = (index: number) => {
  newCollection.value.conditions.splice(index, 1)
}

const handleImageUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    try {
      const file = input.files[0]
      const mediaType = file.type.startsWith('video/') ? 'video' : 'image'
      const formData = new FormData()
      
      const ext = file.name.split('.').pop()
      const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
      
      formData.append('name', filename)
      formData.append('file', file)

      const response = await fetch('https://par.wetarteam.workers.dev/upload', {
        method: 'PUT',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      newCollection.value.image = {
        url: `https://pub-645e6a6aec9743558410b2ba6cedc346.r2.dev/${filename}`,
        mediaType
      }

    } catch (error) {
      console.error('Failed to upload media:', error)
    }
  }
}

const triggerFileInput = () => {
  primaryFileInput.value?.click()
}

const filteredCollections = computed(() => {
  if (!searchQuery.value) return collections.value
  
  const query = searchQuery.value.toLowerCase()
  return collections.value.filter(collection => 
    collection.title.toLowerCase().includes(query) ||
    collection.handle.toLowerCase().includes(query)
  )
})

onMounted(() => {
  fetchCollections()
})
</script>

<template>
  <div class="flex flex-col h-screen">
    <AppHeader />

    <!-- Search Bar and Add Button -->
    <div class="p-4 flex gap-2 items-center">
      <div class="flex-1 relative">
        <Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          v-model="searchQuery"
          type="text"
          placeholder="Search collections..."
          class="pl-8"
        />
      </div>
      <Button @click="showAddSheet = true" variant="ghost" size="icon" class="h-10 w-10">
        <Plus class="h-5 w-5" />
      </Button>
    </div>

    <!-- Collections List -->
    <div class="flex-1 overflow-auto">
      <div class="w-full">
        <template v-for="collection in filteredCollections" :key="collection.id">
          <!-- Collection Row -->
          <div class="flex w-full border-b border-gray-200 hover:bg-gray-50">
            <!-- Image Column -->
            <div class="w-[80px] p-3">
              <div class="w-12 h-12 rounded-lg overflow-hidden bg-gray-50">
                <template v-if="collection.image">
                  <img 
                    v-if="collection.image.mediaType === 'image'"
                    :src="collection.image.url"
                    class="w-full h-full object-cover"
                    alt="Collection"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <VideoIcon class="w-6 h-6 text-gray-400" />
                  </div>
                </template>
              </div>
            </div>

            <!-- Collection Info Column -->
            <div class="flex-1 p-3 flex flex-col justify-center">
              <div class="text-sm font-medium">{{ collection.title }}</div>
              <div class="text-xs text-gray-500">
                {{ collection.productscount }} products • {{ collection.type }}
              </div>
            </div>

            <!-- Actions Column -->
            <div class="w-[100px] flex items-center justify-end gap-2 pr-4">
              <Button 
                variant="ghost" 
                size="icon"
                class="h-8 w-8 hover:text-red-500"
                @click="deleteCollection(collection.id)"
              >
                <X class="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" class="h-8 w-8">
                <ChevronRight class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Add Collection Sheet -->
    <Sheet v-model:open="showAddSheet">
      <SheetContent side="right" class="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add Collection</SheetTitle>
          <SheetDescription>
            Create a new collection to organize your products
          </SheetDescription>
        </SheetHeader>

        <div class="flex-1 overflow-y-auto mt-6">
          <!-- Title Row -->
          <div class="flex items-center border-b hover:bg-gray-50">
            <div class="w-[100px] border-r p-4">
              <span class="text-sm font-medium">Title</span>
            </div>
            <div class="flex-1 p-2">
              <input
                v-model="newCollection.title"
                type="text"
                placeholder="Enter collection title"
                class="w-full py-3 px-4 bg-transparent border-0 focus:outline-none placeholder:text-gray-400 text-sm"
              />
            </div>
          </div>

          <!-- Handle Row -->
          <div class="flex items-center border-b hover:bg-gray-50">
            <div class="w-[100px] border-r p-4">
              <span class="text-sm font-medium">Handle</span>
            </div>
            <div class="flex-1 p-2">
              <input
                v-model="newCollection.handle"
                type="text"
                placeholder="Enter handle"
                class="w-full py-3 px-4 bg-transparent border-0 focus:outline-none placeholder:text-gray-400 text-sm"
              />
            </div>
          </div>

          <!-- Type Row -->
          <div class="flex items-center border-b hover:bg-gray-50">
            <div class="w-[100px] border-r p-4">
              <span class="text-sm font-medium">Type</span>
            </div>
            <div class="flex-1 p-2">
              <Select v-model="newCollection.type">
                <SelectTrigger class="w-full border-0 shadow-none focus:ring-0 px-4 py-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="automated">Automated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <!-- Description Row - Full Width -->
          <div class="border-b hover:bg-gray-50">
            <div class="p-4">
              <div class="mb-2 text-sm font-medium">Description</div>
              <textarea
                v-model="newCollection.description"
                rows="3"
                placeholder="Enter collection description"
                class="w-full py-3 px-4 bg-transparent border-0 focus:outline-none placeholder:text-gray-400 text-sm resize-none"
              />
            </div>
          </div>

          <!-- Image Row -->
          <div class="flex items-center border-b hover:bg-gray-50">
            <div class="w-[100px] border-r p-4">
              <span class="text-sm font-medium">Image</span>
            </div>
            <div class="flex-1 p-2">
              <div class="flex items-center gap-4">
                <!-- Image Preview/Upload -->
                <div class="flex-shrink-0">
                  <button 
                    @click="triggerFileInput"
                    class="w-16 h-16 rounded border flex items-center justify-center hover:bg-gray-50 relative overflow-hidden"
                    :class="{ 'border-dashed border-gray-300': !newCollection.image }"
                  >
                    <template v-if="newCollection.image">
                      <img 
                        v-if="newCollection.image.mediaType === 'image'"
                        :src="newCollection.image.url" 
                        class="w-full h-full object-cover"
                        alt="Collection"
                      />
                      <div 
                        v-else 
                        class="w-full h-full flex items-center justify-center"
                      >
                        <VideoIcon class="w-8 h-8 text-gray-400" />
                      </div>
                    </template>
                    <ImageIcon v-else class="w-6 h-6 text-gray-400" />
                  </button>
                  <input
                    ref="primaryFileInput"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleImageUpload"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Conditions Section (for automated collections) -->
          <div v-if="newCollection.type === 'automated'" class="border-b">
            <div class="p-4">
              <div class="mb-4 text-sm font-medium">Conditions</div>
              
              <!-- Existing conditions -->
              <div v-for="(condition, index) in newCollection.conditions" :key="index" class="mb-2 p-2 bg-gray-50 rounded-lg flex items-center justify-between">
                <span class="text-sm">
                  {{ condition.field }} {{ condition.operator }} {{ condition.value }}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon"
                  class="h-6 w-6 hover:text-red-500"
                  @click="removeCondition(index)"
                >
                  <X class="h-4 w-4" />
                </Button>
              </div>

              <!-- Add condition form -->
              <div class="grid grid-cols-3 gap-2 mt-4">
                <Select v-model="newCondition.field">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem 
                      v-for="field in conditionFields" 
                      :key="field.value" 
                      :value="field.value"
                    >
                      {{ field.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select v-model="newCondition.operator">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem 
                      v-for="op in conditionOperators" 
                      :key="op.value" 
                      :value="op.value"
                    >
                      {{ op.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>

                <div class="flex gap-2">
                  <Input
                    v-model="newCondition.value"
                    placeholder="Value"
                    @keyup.enter="addCondition"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon"
                    @click="addCondition"
                  >
                    <Plus class="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <!-- Save Button -->
          <div class="mt-6">
            <Button class="w-full" @click="createCollection">
              Create Collection
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
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

:deep(.sheet-content) {
  .select-trigger,
  .input,
  textarea {
    background-color: transparent;
    border: none;
    box-shadow: none;
  }

  .select-trigger:focus,
  .input:focus,
  textarea:focus {
    outline: none;
    box-shadow: none;
    border: none;
  }

  textarea {
    resize: none;
  }
}

/* Remove input field background highlight */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 30px white inset !important;
}

/* Remove tap highlight color on mobile */
* {
  -webkit-tap-highlight-color: transparent;
}

/* Remove border highlight on cells */
.border-r {
  border-color: rgb(229 231 235) !important;
}

:deep(input),
:deep(input:focus),
:deep(input:focus-visible) {
  outline: none !important;
  box-shadow: none !important;
  border: none !important;
  -webkit-tap-highlight-color: transparent;
}

.hover\:bg-gray-50:hover input {
  background-color: transparent;
}
</style> 