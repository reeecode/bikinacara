<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Loader2, AlertCircle, Home } from 'lucide-vue-next'
import EventLandingView from '../components/EventLandingView.vue'
import { AUTH_SERVICE } from '../services/turso.js'
import { getEventFromLocal, decodeEventFromHash, normalizeEventData } from '../services/eventStorage.js'

const route = useRoute()
const router = useRouter()

const event = ref(null)
const isLoading = ref(true)
const errorMsg = ref('')

const loadEvent = async () => {
  isLoading.value = true
  errorMsg.value = ''

  const slug = route.params.slug
  const hash = window.location.hash.replace('#', '')

  // 1. Cek hash URL jika ada data terkompresi
  if (hash) {
    const decoded = decodeEventFromHash(hash)
    if (decoded) {
      event.value = normalizeEventData(decoded)
      isLoading.value = false
      return
    }
  }

  // 2. Ambil dari database Turso
  if (slug) {
    try {
      const tursoEvent = await AUTH_SERVICE.getPublicEventBySlug(slug)
      if (tursoEvent) {
        event.value = normalizeEventData(tursoEvent)
        isLoading.value = false
        return
      }
    } catch (err) {
      console.error('Error fetch public event:', err)
    }

    // 3. Fallback LocalStorage
    const local = getEventFromLocal(slug)
    if (local) {
      event.value = normalizeEventData(local)
      isLoading.value = false
      return
    }
  }

  errorMsg.value = 'Halaman acara tidak ditemukan atau telah dihapus oleh panitia.'
  isLoading.value = false
}

onMounted(() => {
  loadEvent()
})
</script>

<template>
  <div class="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-center">
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-20 px-4">
      <Loader2 class="w-10 h-10 text-emerald-400 animate-spin mx-auto mb-4" />
      <h3 class="text-base font-bold text-white mb-1">Memuat Halaman Acara...</h3>
      <p class="text-xs text-slate-400">Menghubungkan ke server BikinAcara</p>
    </div>

    <!-- Error State (404) -->
    <div v-else-if="errorMsg || !event" class="text-center py-20 px-4 max-w-md mx-auto">
      <div class="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
        <AlertCircle class="w-7 h-7" />
      </div>
      <h2 class="text-xl font-black text-white mb-2">Acara Tidak Ditemukan</h2>
      <p class="text-xs text-slate-400 leading-relaxed mb-6">{{ errorMsg }}</p>
      <button 
        @click="router.push('/')" 
        class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition inline-flex items-center gap-2 cursor-pointer border border-slate-700"
      >
        <Home class="w-4 h-4 text-emerald-400" />
        <span>Kembali ke Beranda BikinAcara</span>
      </button>
    </div>

    <!-- Live Event View (Tanpa Tombol Admin/Floating Nav) -->
    <EventLandingView v-else :event="event" />
  </div>
</template>
