<template>
  <div class="min-h-screen bg-white">
    <!-- Header -->
    <header class="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-white px-4">
      <div class="flex items-center gap-2">
        <Button variant="ghost" size="icon" @click="router.back()">
          <ArrowLeft class="h-4 w-4" />
        </Button>
        <h1 class="text-base font-medium">Store Details</h1>
      </div>
      <div>
        <Button 
          variant="ghost" 
          class="hover:bg-transparent focus:bg-transparent active:bg-transparent"
          @click="saveStoreDetails"
          :disabled="isSaving"
        >
          {{ isSaving ? 'Updating...' : 'Update' }}
        </Button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="mx-auto max-w-3xl px-4">
      <div v-if="isLoading" class="mt-8 text-center text-sm text-muted-foreground">
        <p>Loading...</p>
        <p class="mt-2 text-sm text-gray-500">Configure your store settings and preferences</p>
      </div>

      <div v-else-if="loadError" class="mt-8 text-center">
        <p class="text-sm text-red-500">{{ loadError }}</p>
        <Button @click="fetchStoreDetails" variant="outline" class="mt-4">
          Retry
        </Button>
      </div>

      <div v-else class="mt-8 border rounded-lg overflow-hidden">
        <!-- Row 1: Logo and Name -->
        <div class="flex items-center border-b">
          <!-- Logo Cell - Fixed width based on image area -->
          <div class="w-[72px] border-r">
            <div class="relative h-12 w-12 mx-auto">
              <input
                type="file"
                accept="image/*"
                class="absolute inset-0 opacity-0 cursor-pointer"
                @change="handleLogoUpload"
              />
              <div class="h-full w-full flex items-center justify-center border border-dashed rounded">
                <img 
                  v-if="store.logo" 
                  :src="store.logo" 
                  class="h-full w-full object-cover"
                  alt="Store logo" 
                />
                <ImageIcon v-else class="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          <!-- Name Cell -->
          <div class="flex-1 border-r">
            <Input
              v-model="store.name"
              type="text"
              placeholder="name"
              class="w-full px-4 py-3"
            />
          </div>

          <!-- Store Status Cell -->
          <div class="w-[72px] flex items-center justify-center">
            <Button 
              variant="ghost" 
              size="icon" 
              @click="toggleStoreStatus"
              :class="store.active ? 'text-green-500' : 'text-gray-400'"
            >
              <Power v-if="store.active" class="h-4 w-4" />
              <PowerOff v-else class="h-4 w-4" />
            </Button>
          </div>
        </div>

        <!-- Row 2: Favicon and Brand Color -->
        <div class="flex items-center border-b">
          <!-- Favicon Text Cell -->
          <div class="w-[72px] border-r">
            <span class="block px-4 py-3 text-sm">favicon</span>
          </div>

          <!-- Favicon Image Cell -->
          <div class="w-[72px] border-r">
            <div class="relative h-12 w-12 mx-auto">
              <input
                type="file"
                accept="image/*"
                class="absolute inset-0 opacity-0 cursor-pointer"
                @change="handleFaviconUpload"
              />
              <div class="h-full w-full flex items-center justify-center border border-dashed rounded">
                <img 
                  v-if="store.favicon" 
                  :src="store.favicon" 
                  class="h-full w-full object-cover"
                  alt="Store favicon" 
                />
                <ImageIcon v-else class="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          <!-- Brand Color Text Cell -->
          <div class="w-[72px] border-r">
            <span class="block px-4 py-3 text-sm">brand color</span>
          </div>

          <!-- Color Picker Cell -->
          <div class="w-[72px]">
            <input
              type="color"
              v-model="store.color"
              class="w-12 h-12 cursor-pointer mx-auto block"
            />
          </div>
        </div>

        <!-- Basic Info Rows -->
        <div class="flex items-center border-b">
          <div class="w-16 border-r">
            <Globe class="h-4 w-4 mx-auto text-gray-600" />
          </div>
          <div class="flex-1">
            <Input
              v-model="store.domain"
              type="text"
              placeholder="domain"
              class="w-full px-4 py-3"
            />
          </div>
        </div>

        <!-- Email Row -->
        <div class="flex items-center border-b">
          <div class="w-16">
            <Mail class="h-4 w-4 mx-auto text-gray-600" />
          </div>
          <div class="flex-1">
            <Input
              v-model="store.email"
              type="email"
              placeholder="email"
              class="w-full px-4 py-3"
            />
          </div>
        </div>

        <!-- Phone Row -->
        <div class="flex items-center border-b">
          <div class="w-16">
            <Phone class="h-4 w-4 mx-auto text-gray-600" />
          </div>
          <div class="flex-1">
            <Input
              v-model="store.phone"
              type="tel"
              placeholder="phone"
              class="w-full px-4 py-3"
            />
          </div>
        </div>

        <!-- Address Details Row -->
        <div class="flex items-center border-b">
          <div class="w-16 border-r">
            <MapPin class="h-4 w-4 mx-auto text-gray-600" />
          </div>
          <div class="flex-1">
            <Input
              v-model="store.address"
              type="text"
              placeholder="address"
              class="w-full px-4 py-3"
            />
          </div>
        </div>

        <!-- Address Extra Details Row -->
        <div class="flex items-center border-b">
          <div class="w-16 border-r">
            <MapPin class="h-4 w-4 mx-auto text-gray-600" />
          </div>
          <div class="flex-1">
            <Input
              v-model="store.addressext"
              type="text"
              placeholder="address line 2"
              class="w-full px-4 py-3"
            />
          </div>
        </div>

        <!-- City & State Row -->
        <div class="flex items-center border-b">
          <div class="flex-1 border-r">
            <Input
              v-model="store.city"
              type="text"
              placeholder="city"
              class="w-full px-4 py-3"
            />
          </div>
          <div class="flex-1">
            <Input
              v-model="store.state"
              type="text"
              placeholder="state"
              class="w-full px-4 py-3"
            />
          </div>
        </div>

        <!-- Country & Country Code Row -->
        <div class="flex items-center border-b">
          <div class="flex-1 border-r">
            <Input
              v-model="store.country"
              type="text"
              placeholder="country"
              class="w-full px-4 py-3"
            />
          </div>
          <div class="flex-1">
            <Input
              v-model="store.postalcode"
              type="text"
              placeholder="country code"
              class="w-full px-4 py-3"
            />
          </div>
        </div>

        <!-- Currency & Locale Row - Fixed with border -->
        <div class="flex items-center border-b">
          <div class="flex-1 border-r">
            <Select v-model="store.currency">
              <SelectTrigger class="w-full px-4">
                <SelectValue placeholder="currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="flex-1">
            <Select v-model="store.locale">
              <SelectTrigger class="w-full px-4">
                <SelectValue placeholder="locale" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- Last Row: Timezone and Weight Unit -->
        <div class="flex items-center border-b">
          <div class="flex-1 border-r">
            <Select v-model="store.timezone">
              <SelectTrigger class="w-full px-4">
                <SelectValue placeholder="timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="EST">EST</SelectItem>
                <SelectItem value="PST">PST</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="flex-1">
            <Select v-model="store.weightunit">
              <SelectTrigger class="w-full px-4">
                <SelectValue placeholder="weight unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">Kilograms (kg)</SelectItem>
                <SelectItem value="lb">Pounds (lb)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- Row 12: Plan Details -->
        <div class="flex items-center border-b">
          <div class="flex-1 border-r">
            <Input
              v-model="store.planname"
              type="text"
              placeholder="plan name"
              class="w-full px-4 py-3"
            />
          </div>
          <div class="flex-1">
            <Input
              v-model="store.plandisplay"
              type="text"
              placeholder="plan display"
              class="w-full px-4 py-3"
            />
          </div>
        </div>

        <!-- Row 13: Social Media Section -->
        <div class="border-b">
          <!-- Social Header -->
          <div class="flex items-center py-3 border-b">
            <div class="flex-1 flex items-center justify-between px-4">
              <span class="text-sm">Social Media</span>
              <Button 
                variant="ghost" 
                size="icon"
                @click="addSocialRow"
              >
                <Plus class="h-4 w-4" />
              </Button>
            </div>
          </div>

          <!-- Social Media Rows -->
          <div 
            v-for="(social, index) in socialRows" 
            :key="index"
            class="flex items-center border-b last:border-b-0"
          >
            <div class="w-32 border-r">
              <Select v-model="social.type">
                <SelectTrigger class="w-full px-4">
                  <SelectValue placeholder="platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="flex-1 border-r">
              <Input
                v-model="social.url"
                type="text"
                placeholder="profile url"
                class="w-full px-4 py-3"
              />
            </div>
            <div class="w-16 flex items-center justify-center">
              <Button 
                variant="ghost" 
                size="icon"
                @click="removeSocialRow(index)"
              >
                <X class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Package,
  Store,
  Mail,
  Phone,
  MapPin,
  Globe,
  Settings,
  Image as ImageIcon,
  Plus,
  Power,
  PowerOff,
  Share2,
  X,
} from 'lucide-vue-next'

const router = useRouter()
const store = ref({
  id: 14, // Changed to store ID 14
  type: '',
  name: '',
  domain: '',
  email: '',
  phone: '',
  address: '',
  addressext: '',
  city: '',
  state: '',
  country: '',
  postalcode: '',
  currency: 'USD',
  timezone: '',
  locale: 'en',
  weightunit: 'kg',
  logo: '',
  favicon: '',
  color: '',
  social: '',
})

const isLoading = ref(true)
const isSaving = ref(false)
const loadError = ref(null)

const storeFields = {
  domain: { 
    type: 'text',
    placeholder: 'domain',
    icon: Globe
  },
  email: { 
    type: 'email',
    placeholder: 'email',
    icon: Mail
  },
  phone: { 
    type: 'tel',
    placeholder: 'phone',
    icon: Phone
  },
  address: { 
    type: 'text',
    placeholder: 'address',
    icon: MapPin
  },
  currency: {
    type: 'select',
    placeholder: 'currency',
    icon: Settings,
    options: [
      { value: 'USD', label: 'USD' },
      { value: 'EUR', label: 'EUR' },
      { value: 'GBP', label: 'GBP' },
    ],
  },
  // ... other fields with their respective icons
}

const handleLogoUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      store.value.logo = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// Add favicon upload handler
const handleFaviconUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      store.value.favicon = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// Add these new refs and functions
const socialRows = ref([])

const toggleStoreStatus = () => {
  store.value.active = !store.value.active
  saveStoreDetails() // Optional: save immediately on toggle
}

const addSocialRow = () => {
  socialRows.value.push({
    type: '',
    url: ''
  })
}

const removeSocialRow = (index) => {
  socialRows.value.splice(index, 1)
}

// Updated fetch function with error handling
const fetchStoreDetails = async () => {
  try {
    isLoading.value = true
    loadError.value = null
    
    const url = "https://commerce-tarframework.turso.io/v2/pipeline"
    const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Mjk2NzQwNjQsImlkIjoiN2ZiNTFhMTgtYjU1My00Y2M2LTkwZWItZDE0ZTcxNDI5ODlhIn0.zxIjODPlBzNcAgQQ70xZj2sI7j7RSAHpYPQUtvyoAHDb4nLGzHAPiVvnJ6qeK7-00F8A6Lz__CSPjdITPZ31BQ"

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requests: [{
          type: "execute",
          stmt: {
            sql: "SELECT * FROM stores WHERE id = 14",
            args: []
          }
        }]
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.error) {
      throw new Error(data.error)
    }

    const storeData = data?.results?.[0]?.response?.result?.rows?.[0]
    
    if (!storeData) {
      throw new Error('No store data found')
    }

    // Update store data
    store.value = {
      ...store.value,
      ...storeData
    }

    // After fetching store data, parse social data
    if (storeData.social) {
      try {
        socialRows.value = JSON.parse(storeData.social)
      } catch (e) {
        socialRows.value = []
      }
    }

  } catch (error) {
    console.error('Error fetching store details:', error)
    loadError.value = 'Failed to load store details. Please try again.'
  } finally {
    isLoading.value = false
  }
}

// Updated save function with error handling
const saveStoreDetails = async () => {
  try {
    isSaving.value = true
    
    const url = "https://commerce-tarframework.turso.io/v2/pipeline"
    const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Mjk2NzQwNjQsImlkIjoiN2ZiNTFhMTgtYjU1My00Y2M2LTkwZWItZDE0ZTcxNDI5ODlhIn0.zxIjODPlBzNcAgQQ70xZj2sI7j7RSAHpYPQUtvyoAHDb4nLGzHAPiVvnJ6qeK7-00F8A6Lz__CSPjdITPZ31BQ"

    // Before saving, stringify social data
    const storeData = {
      ...store.value,
      social: JSON.stringify(socialRows.value)
    }
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        statements: [
          {
            sql: `UPDATE stores SET 
              name = ?, domain = ?, email = ?, phone = ?,
              address = ?, addressext = ?, city = ?, state = ?,
              country = ?, postalcode = ?, currency = ?, timezone = ?,
              locale = ?, weightunit = ?, logo = ?, favicon = ?,
              color = ?, social = ?, updatedat = CURRENT_TIMESTAMP
              WHERE id = ? AND active = true`,
            args: [
              storeData.name,
              storeData.domain,
              storeData.email,
              storeData.phone,
              storeData.address,
              storeData.addressext,
              storeData.city,
              storeData.state,
              storeData.country,
              storeData.postalcode,
              storeData.currency,
              storeData.timezone,
              storeData.locale,
              storeData.weightunit,
              storeData.logo,
              storeData.favicon,
              storeData.color,
              storeData.social,
              storeData.id
            ]
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    
    if (result.error) {
      throw new Error(result.error)
    }

  } catch (error) {
    console.error('Error saving store details:', error)
    loadError.value = 'Failed to save store details. Please try again.'
  } finally {
    isSaving.value = false
  }
}

// Initialize data on mount
onMounted(() => {
  fetchStoreDetails()
})

// Rest of the script remains the same...
</script> 

<style scoped>
:deep(input),
:deep(select),
:deep(button),
:deep(.select-trigger) {
  @apply focus:ring-0 focus:outline-none;
  background: transparent !important;
  border: none !important;
}

/* Match the border colors from add-product */
.border,
.border-r,
.border-b {
  @apply border-gray-200;
}

/* Remove hover effects */
* {
  @apply hover:bg-transparent;
  transition: none !important;
}

/* Additional styles for the update button */
:deep(.update-button) {
  @apply border-0 shadow-none bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent;
}
</style> 