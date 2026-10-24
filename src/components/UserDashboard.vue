<script setup>
import { ref, onMounted } from 'vue'
import { 
  Layers, 
  Plus, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Share2, 
  Calendar, 
  MapPin, 
  Globe, 
  Check, 
  Copy,
  LogOut,
  Sparkles
} from 'lucide-vue-next'
import { AUTH_SERVICE } from '../services/turso.js'

const props = defineProps({
  currentUser: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['create-new', 'edit-event', 'logout', 'go-home', 'view-event'])

const userEvents = ref([])
const copiedSlug = ref('')

const loadEvents = async () => {
  userEvents.value = await AUTH_SERVICE.getUserEvents(props.currentUser.id)
}

onMounted(() => {
  loadEvents()
})

const handleDelete = async (slug) => {
  if (confirm(`Yakin ingin menghapus halaman "${slug}"?`)) {
    userEvents.value = await AUTH_SERVICE.deleteUserEvent(props.currentUser.id, slug)
  }
}

const copyEventUrl = (slug) => {
  const url = `https://bikinacara.reee.my.id/?page=${slug}`
  navigator.clipboard.writeText(url)
  copiedSlug.value = slug
  setTimeout(() => copiedSlug.value = '', 2000)
}
</script>

<template>
  <div class="min-h-screen bg-[#070b12] text-slate-100 pb-16">
    <!-- Navbar Dashboard Full Width -->
    <header class="w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 md:px-10 py-3.5 sm:py-4 flex items-center justify-between">
      <div class="flex items-center gap-3 cursor-pointer" @click="emit('go-home')">
        <img src="/logo-icon.png" alt="BikinAcara Logo" class="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-lg shadow-sm" />
        <span class="font-black text-lg sm:text-xl tracking-tight text-white">Bikin<span class="text-[#34d399]">Acara</span></span>
      </div>

      <div class="flex items-center gap-2 sm:gap-3 text-xs">
        <span class="text-slate-400 hidden sm:inline">Halo, <b class="text-white">{{ currentUser.name }}</b></span>
        <button 
          v-if="userEvents.length === 0"
          @click="emit('create-new')"
          class="font-bold px-3 sm:px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center gap-1 sm:gap-1.5"
        >
          <Plus class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span class="hidden sm:inline">Buat Halaman Acara</span>
          <span class="sm:hidden">+ Acara</span>
        </button>
        <div v-else class="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg">
          Kuota: 1/1 Acara (Free)
        </div>
        <button 
          @click="emit('logout')"
          class="text-slate-400 hover:text-rose-400 p-2 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          title="Keluar"
        >
          <LogOut class="w-4 h-4" />
        </button>
      </div>
    </header>

    <!-- Main Content Dashboard -->
    <main class="max-w-7xl mx-auto px-4 md:px-8 pt-8">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-white">Daftar Acara Saya</h1>
          <p class="text-slate-400 text-xs sm:text-sm mt-1">Kelola halaman landing page acara dan tautan Google Form kamu di sini.</p>
        </div>
        <div class="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center gap-2">
          <span class="text-slate-400">Status Akun:</span>
          <span class="text-emerald-400 font-bold">Free Plan (Maks. 1 Acara Aktif)</span>
        </div>
      </div>

      <!-- Jika Belum Ada Event -->
      <div v-if="userEvents.length === 0" class="text-center py-16 px-4 rounded-3xl border border-dashed border-slate-800 bg-slate-900/30">
        <div class="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
          <Sparkles class="w-8 h-8" />
        </div>
        <h3 class="text-lg font-bold text-white mb-2">Belum Ada Halaman Acara</h3>
        <p class="text-slate-400 text-xs sm:text-sm max-w-md mx-auto mb-6">
          Kamu belum membuat halaman acara apa pun. Yuk, bikin landing page acara pertama kamu sekarang dalam 2 menit!
        </p>
        <button 
          @click="emit('create-new')"
          class="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition inline-flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          Buat Halaman Acara Sekarang
        </button>
      </div>

      <!-- Grid Daftar Event -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="ev in userEvents" 
          :key="ev.slug"
          class="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden flex flex-col hover:border-slate-700 transition shadow-xl"
        >
          <!-- Banner Mini -->
          <div class="h-32 bg-slate-800 relative overflow-hidden">
            <img 
              v-if="ev.general?.bannerUrl" 
              :src="ev.general.bannerUrl" 
              class="w-full h-full object-cover opacity-70"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
          </div>

          <!-- Event Body -->
          <div class="p-5 flex-1 flex flex-col">
            <h3 class="font-bold text-white text-base line-clamp-1 mb-1">{{ ev.general?.title }}</h3>
            <p class="text-slate-400 text-xs line-clamp-2 mb-4 leading-relaxed">{{ ev.general?.tagline }}</p>

            <div class="space-y-1.5 text-xs text-slate-400 mb-4 pt-3 border-t border-slate-800/80">
              <div class="flex items-center gap-2">
                <Calendar class="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span class="truncate">{{ ev.general?.eventDate || 'Belum diatur' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <Globe class="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span class="font-mono text-[11px] text-slate-300 truncate">bikinacara.reee.my.id/?page={{ ev.slug }}</span>
              </div>
            </div>

            <!-- Actions Bar -->
            <div class="mt-auto pt-3 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
              <div class="flex items-center gap-1">
                <button 
                  @click="copyEventUrl(ev.slug)"
                  class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                  title="Salin Link Acara"
                >
                  <Check v-if="copiedSlug === ev.slug" class="w-3.5 h-3.5 text-emerald-400" />
                  <Copy v-else class="w-3.5 h-3.5" />
                </button>
                <button 
                  @click="emit('view-event', ev)"
                  class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                  title="Buka Halaman Live"
                >
                  <ExternalLink class="w-3.5 h-3.5" />
                </button>
              </div>

              <div class="flex items-center gap-2">
                <button 
                  @click="emit('edit-event', ev)"
                  class="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Edit3 class="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button 
                  @click="handleDelete(ev.slug)"
                  class="p-1.5 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                  title="Hapus Acara"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
