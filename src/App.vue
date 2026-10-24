<script setup>
import { ref, onMounted, computed } from 'vue'
import { 
  Sparkles, 
  Eye, 
  Smartphone, 
  Monitor, 
  Share2, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Layers, 
  Settings, 
  HelpCircle, 
  FileCode, 
  ArrowLeft, 
  Home, 
  Save,
  Info,
  Sliders,
  Palette,
  FileText,
  MessageSquare
} from 'lucide-vue-next'
import EventLandingView from './components/EventLandingView.vue'
import HomePage from './components/HomePage.vue'
import AuthModal from './components/AuthModal.vue'
import UserDashboard from './components/UserDashboard.vue'
import { 
  DEFAULT_EVENT, 
  saveEventToLocal, 
  getEventFromLocal, 
  encodeEventToHash, 
  decodeEventFromHash,
  normalizeEventData
} from './services/eventStorage.js'
import { AUTH_SERVICE } from './services/turso.js'

// App Navigation state: 'home' | 'dashboard' | 'builder' | 'public_view'
const viewMode = ref('home')
const activeTab = ref('general')
const devicePreview = ref('mobile')
const mobileBuilderView = ref('editor') // 'editor' | 'preview'
const copied = ref(false)

// Auth State
const currentUser = ref(null)
const showAuthModal = ref(false)
const authModalMode = ref('login')

// Event Data di Builder
const event = ref(JSON.parse(JSON.stringify(DEFAULT_EVENT)))

const generatedUrl = computed(() => {
  const hash = encodeEventToHash(event.value)
  const baseUrl = window.location.origin
  return `${baseUrl}/?page=${event.value.slug}#${hash}`
})

const shareDomainUrl = computed(() => {
  return `https://bikinacara.reee.my.id/${event.value.slug}`
})

onMounted(async () => {
  // Cek user login
  currentUser.value = AUTH_SERVICE.getCurrentUser()

  // 1. Cek Routing path browser (misal: /dashboard atau /[slug-acara])
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '')
  
  if (path === 'dashboard') {
    if (currentUser.value) {
      viewMode.value = 'dashboard'
    } else {
      openAuth('login')
    }
    return
  }

  // 2. Cek apakah membuka link publik acara via hash atau query param
  const urlParams = new URLSearchParams(window.location.search)
  const hash = window.location.hash.replace('#', '')

  if (hash) {
    const decoded = decodeEventFromHash(hash)
    if (decoded) {
      event.value = normalizeEventData(decoded)
      viewMode.value = 'public_view'
      return
    }
  }

  // Cek slug acara: dukung langsung /slug-acara atau fallback ?page=slug-acara
  const pageSlug = path || urlParams.get('page')
  if (pageSlug && pageSlug !== 'index.html') {
    // Coba ambil dari Turso dulu jika aktif
    const tursoEvent = await AUTH_SERVICE.getPublicEventBySlug(pageSlug)
    if (tursoEvent) {
      event.value = normalizeEventData(tursoEvent)
      viewMode.value = 'public_view'
      return
    }

    const local = getEventFromLocal(pageSlug)
    if (local) {
      event.value = normalizeEventData(local)
      viewMode.value = 'public_view'
      return
    }
  }
})

// Navigasi View Mode dengan Sinkronisasi URL Browser
const navigateTo = (mode) => {
  viewMode.value = mode
  if (mode === 'dashboard') {
    if (window.location.pathname !== '/dashboard') {
      window.history.pushState({}, '', '/dashboard')
    }
  } else if (mode === 'home') {
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/')
    }
  }
}

// Buka modal auth
const openAuth = (mode = 'login') => {
  authModalMode.value = mode
  showAuthModal.value = true
}

const onAuthSuccess = (user) => {
  currentUser.value = user
  showAuthModal.value = false
  navigateTo('dashboard')
}

const handleLogout = () => {
  AUTH_SERVICE.logout()
  currentUser.value = null
  navigateTo('home')
}

// Mulai Buat Acara (Wajib Login & Batasi Maksimal 1 Event per Akun)
const startCreateEvent = async () => {
  if (!currentUser.value) {
    openAuth('register')
    return
  }

  // Cek jumlah event yang sudah dimiliki user
  const existingEvents = await AUTH_SERVICE.getUserEvents(currentUser.value.id)
  if (existingEvents && existingEvents.length >= 1) {
    alert('Batas kuota tercapai: Setiap akun hanya dapat membuat maksimal 1 halaman acara (Free Plan). Silakan edit acara yang sudah ada di Dashboard.')
    navigateTo('dashboard')
    return
  }

  event.value = normalizeEventData(DEFAULT_EVENT)
  event.value.slug = 'acara-' + Math.random().toString(36).substring(2, 7)
  navigateTo('builder')
  activeTab.value = 'general'
}

const editExistingEvent = (ev) => {
  event.value = normalizeEventData(ev)
  navigateTo('builder')
  activeTab.value = 'general'
}

const viewLiveEvent = (ev) => {
  event.value = normalizeEventData(ev)
  navigateTo('public_view')
}

// Simpan event ke akun user & Turso
const saveCurrentEvent = async () => {
  if (currentUser.value) {
    await AUTH_SERVICE.saveUserEvent(currentUser.value.id, event.value)
  }
  saveEventToLocal(event.value)
}

const updateDraft = () => {
  saveCurrentEvent()
}

const addHighlight = () => {
  event.value.highlights.push({ title: 'Kategori Baru', desc: 'Isi detail di sini' })
  updateDraft()
}
const removeHighlight = (idx) => {
  event.value.highlights.splice(idx, 1)
  updateDraft()
}

// Manipulasi Persyaratan (Teks + Link kustom)
const addRequirement = () => {
  if (!event.value.requirements.items) {
    event.value.requirements = { title: 'Ketentuan & Persyaratan', items: [] }
  }
  event.value.requirements.items.push({ text: 'Syarat baru...', linkText: '', linkUrl: '' })
  updateDraft()
}
const removeRequirement = (idx) => {
  event.value.requirements.items.splice(idx, 1)
  updateDraft()
}

// Color Theme Presets
const themePresets = [
  { name: 'Emerald Neon', primary: '#10b981', secondary: '#14b8a6', bg: '#090d16', card: '#0f172a' },
  { name: 'Cyber Blue', primary: '#3b82f6', secondary: '#06b6d4', bg: '#0b1120', card: '#111c38' },
  { name: 'Violet Galaxy', primary: '#8b5cf6', secondary: '#d946ef', bg: '#0e0b1f', card: '#181236' },
  { name: 'Sunset Amber', primary: '#f59e0b', secondary: '#ef4444', bg: '#140d07', card: '#24140c' },
  { name: 'Crimson Red', primary: '#ef4444', secondary: '#f97316', bg: '#140808', card: '#241010' }
]

const applyThemePreset = (preset) => {
  event.value.theme.primaryColor = preset.primary
  event.value.theme.secondaryColor = preset.secondary
  event.value.theme.bgColor = preset.bg
  event.value.theme.cardBg = preset.card
  updateDraft()
}

const copyLink = (text) => {
  navigator.clipboard.writeText(text)
  copied.value = true
  setTimeout(() => copied.value = false, 2500)
}
</script>

<template>
  <!-- 1. HALAMAN UTAMA / HOME LANDING PAGE -->
  <HomePage 
    v-if="viewMode === 'home'"
    :currentUser="currentUser"
    @start-create="startCreateEvent"
    @open-auth="openAuth"
    @go-dashboard="navigateTo('dashboard')"
  />

  <!-- 2. DASHBOARD USER (DAFTAR EVENT SAYA) -->
  <UserDashboard 
    v-else-if="viewMode === 'dashboard' && currentUser"
    :currentUser="currentUser"
    @create-new="startCreateEvent"
    @edit-event="editExistingEvent"
    @view-event="viewLiveEvent"
    @logout="handleLogout"
    @go-home="navigateTo('home')"
  />

  <!-- 3. HALAMAN PUBLIK ACARA LIVE -->
  <div v-else-if="viewMode === 'public_view'" class="min-h-screen bg-[#090d16]">
    <div class="fixed bottom-4 right-4 z-50 flex items-center gap-2">
      <button 
        @click="navigateTo(currentUser ? 'dashboard' : 'home')"
        class="px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-300 font-semibold text-xs shadow-2xl backdrop-blur-md hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
      >
        <Home class="w-3.5 h-3.5" />
        <span>Beranda</span>
      </button>
      <button 
        @click="navigateTo('builder')"
        class="px-4 py-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/40 text-emerald-400 font-semibold text-xs shadow-2xl backdrop-blur-md hover:bg-slate-800 transition flex items-center gap-2 cursor-pointer"
      >
        <Settings class="w-3.5 h-3.5" />
        <span>Buka Builder / Edit Halaman</span>
      </button>
    </div>
    <EventLandingView :event="event" />
  </div>

  <!-- 4. MODE BUILDER / WYSIWYG EDITOR -->
  <div v-else class="min-h-screen bg-[#060910] text-slate-100 flex flex-col h-screen overflow-hidden">
    <!-- Header Builder Full Width -->
    <header class="w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between shrink-0 z-30">
      <div class="flex items-center gap-3">
        <button 
          @click="navigateTo(currentUser ? 'dashboard' : 'home')"
          class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          title="Kembali ke Dashboard"
        >
          <ArrowLeft class="w-4 h-4" />
          <span class="hidden sm:inline">Kembali</span>
        </button>

        <img src="/logo-icon.png" alt="BikinAcara Logo" class="w-8 h-8 rounded-lg object-contain shadow-sm" />
        <div>
          <h1 class="font-black text-sm md:text-base leading-tight">
            <span class="text-white">Bikin<span class="text-[#34d399]">Acara</span></span>
          </h1>
          <p class="text-[10px] md:text-xs text-slate-400">Bikin Landing Page Acara Keren Tanpa Ribet</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <!-- Switch Tab Mobile: Atur Form VS Pratinjau HP -->
        <div class="flex lg:hidden items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
          <button 
            @click="mobileBuilderView = 'editor'"
            :class="['px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition', mobileBuilderView === 'editor' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white']"
          >
            Form
          </button>
          <button 
            @click="mobileBuilderView = 'preview'"
            :class="['px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center gap-1', mobileBuilderView === 'preview' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white']"
          >
            <Eye class="w-3.5 h-3.5" />
            <span>Lihat HP</span>
          </button>
        </div>

        <!-- Switch Device Preview di Desktop -->
        <div class="hidden sm:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
          <button 
            @click="devicePreview = 'mobile'"
            :class="['px-2.5 py-1 rounded text-xs flex items-center gap-1 cursor-pointer transition', devicePreview === 'mobile' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200']"
          >
            <Smartphone class="w-3.5 h-3.5" />
            <span>HP</span>
          </button>
          <button 
            @click="devicePreview = 'desktop'"
            :class="['px-2.5 py-1 rounded text-xs flex items-center gap-1 cursor-pointer transition', devicePreview === 'desktop' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200']"
          >
            <Monitor class="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
        </div>

        <button 
          @click="saveCurrentEvent(); activeTab = 'share'"
          class="px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
        >
          <Share2 class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">Bagikan Web Acara</span>
          <span class="sm:hidden">Share</span>
        </button>
      </div>
    </header>

    <!-- Main Builder Workspace (2 Kolom di Desktop, Tab Switching di HP) -->
    <div class="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
      <!-- SIDEBAR FORM EDITOR DENGAN MENU SAMPING (VERTICAL SUB-SIDEBAR) -->
      <aside 
        :class="[
          'w-full lg:w-[540px] xl:w-[580px] border-r border-slate-800/80 bg-slate-950 flex flex-row shrink-0 overflow-hidden',
          mobileBuilderView === 'preview' ? 'hidden lg:flex' : 'flex'
        ]"
      >
        <!-- NAV MENU SAMPING (VERTICAL SIDEBAR ICON & LABEL) -->
        <div class="w-16 sm:w-20 border-r border-slate-800/80 bg-slate-900/60 flex flex-col items-center py-3 gap-2 shrink-0 select-none overflow-y-auto">
          <button 
            @click="activeTab = 'general'"
            :class="[
              'w-12 sm:w-14 h-12 sm:h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition cursor-pointer text-center',
              activeTab === 'general' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            ]"
            title="Informasi Dasar Acara"
          >
            <Info class="w-4 h-4" />
            <span class="text-[9px] font-bold leading-none">Info</span>
          </button>

          <button 
            @click="activeTab = 'sections'"
            :class="[
              'w-12 sm:w-14 h-12 sm:h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition cursor-pointer text-center',
              activeTab === 'sections' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            ]"
            title="Kelola Visibilitas Panel"
          >
            <Sliders class="w-4 h-4" />
            <span class="text-[9px] font-bold leading-none">Panel</span>
          </button>

          <button 
            @click="activeTab = 'theme'"
            :class="[
              'w-12 sm:w-14 h-12 sm:h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition cursor-pointer text-center',
              activeTab === 'theme' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            ]"
            title="Warna & Desain Tema"
          >
            <Palette class="w-4 h-4" />
            <span class="text-[9px] font-bold leading-none">Tema</span>
          </button>

          <button 
            @click="activeTab = 'content'"
            :class="[
              'w-12 sm:w-14 h-12 sm:h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition cursor-pointer text-center',
              activeTab === 'content' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            ]"
            title="Hadiah, Deskripsi & Ketentuan Syarat"
          >
            <FileText class="w-4 h-4" />
            <span class="text-[9px] font-bold leading-none">Syarat</span>
          </button>

          <button 
            @click="activeTab = 'form'"
            :class="[
              'w-12 sm:w-14 h-12 sm:h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition cursor-pointer text-center',
              activeTab === 'form' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            ]"
            title="Google Form & Grup WhatsApp"
          >
            <MessageSquare class="w-4 h-4" />
            <span class="text-[9px] font-bold leading-none">Form/WA</span>
          </button>

          <button 
            @click="activeTab = 'share'"
            :class="[
              'w-12 sm:w-14 h-12 sm:h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition cursor-pointer text-center mt-auto',
              activeTab === 'share' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            ]"
            title="Publikasikan & Salin Link"
          >
            <Share2 class="w-4 h-4" />
            <span class="text-[9px] font-bold leading-none">Bagikan</span>
          </button>
        </div>

        <!-- FORM CONTENT WRAPPER SESUAI MENU AKTIF -->
        <div class="flex-1 flex flex-col overflow-hidden bg-slate-950/80">
          <div class="px-4 py-3 border-b border-slate-800/80 bg-slate-900/30 flex items-center justify-between shrink-0">
            <span class="font-bold text-white text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              {{
                activeTab === 'general' ? '1. Informasi Utama & Banner' :
                activeTab === 'sections' ? '2. Pengaturan Panel (On/Off)' :
                activeTab === 'theme' ? '3. Kustomisasi Tema & Warna' :
                activeTab === 'content' ? '4. Hadiah, Deskripsi & Syarat' :
                activeTab === 'form' ? '5. Integrasi Form & WhatsApp' : '6. Bagikan & Publikasi'
              }}
            </span>
          </div>

          <div class="flex-1 overflow-y-auto p-4 md:p-5 space-y-5 text-xs">
          <!-- TAB 1 -->
          <div v-if="activeTab === 'general'" class="space-y-4">
            <div>
              <label class="block font-semibold text-slate-300 mb-1.5">Custom Slug URL Acara (Link)</label>
              <div class="flex items-center rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-slate-400 font-mono text-[11px]">
                <span class="text-slate-500">bikinacara.reee.my.id/</span>
                <input 
                  v-model="event.slug" 
                  @input="updateDraft"
                  type="text" 
                  class="bg-transparent border-0 outline-none text-emerald-400 font-bold flex-1 ml-1"
                  placeholder="nama-acara-kamu"
                />
              </div>
            </div>

            <div>
              <label class="block font-semibold text-slate-300 mb-1.5">Judul Acara / Lomba</label>
              <input 
                v-model="event.general.title" 
                @input="updateDraft"
                type="text" 
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-emerald-500 transition"
                placeholder="Contoh: Lomba Video Kreatif Pelajar 2026"
              />
            </div>

            <div>
              <label class="block font-semibold text-slate-300 mb-1.5">Penyelenggara / Organizer</label>
              <input 
                v-model="event.general.organizer" 
                @input="updateDraft"
                type="text" 
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-emerald-500 transition"
                placeholder="Contoh: BEM Fakultas Ilmu Komputer"
              />
            </div>

            <div>
              <label class="block font-semibold text-slate-300 mb-1.5">Tagline / Sub-judul Menarik</label>
              <textarea 
                v-model="event.general.tagline" 
                @input="updateDraft"
                rows="2"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-emerald-500 transition resize-none"
                placeholder="Tuliskan ajakan singkat..."
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-300 mb-1.5">Tanggal Acara / Deadline</label>
                <input 
                  v-model="event.general.eventDate" 
                  @input="updateDraft"
                  type="text" 
                  class="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-emerald-500 transition"
                  placeholder="30 Nov 2026"
                />
              </div>
              <div>
                <label class="block font-semibold text-slate-300 mb-1.5">Lokasi / Format</label>
                <input 
                  v-model="event.general.location" 
                  @input="updateDraft"
                  type="text" 
                  class="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-emerald-500 transition"
                  placeholder="Online / Samarinda"
                />
              </div>
            </div>

            <div>
              <label class="block font-semibold text-slate-300 mb-1.5">URL Gambar Poster / Banner</label>
              <input 
                v-model="event.general.bannerUrl" 
                @input="updateDraft"
                type="url" 
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-emerald-500 transition font-mono text-[11px]"
                placeholder="https://..."
              />
              <p class="text-[10px] text-slate-500 mt-1">Gunakan link poster/gambar dari Unsplash, Imgur, atau Google Drive.</p>
            </div>
          </div>

          <!-- TAB SECTIONS: ON / OFF SETIAP PANEL -->
          <div v-if="activeTab === 'sections'" class="space-y-4">
            <div class="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-slate-300">
              <span class="font-bold text-emerald-400 block mb-1">Visibilitas Panel Halaman</span>
              Kamu bisa mengaktifkan atau menyembunyikan panel apa pun sesuai kebutuhan acaramu:
            </div>

            <div class="space-y-2">
              <label class="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700">
                <span class="font-medium text-white">Banner Header Besar</span>
                <input type="checkbox" v-model="event.sections.banner" @change="updateDraft" class="w-4 h-4 accent-emerald-500 cursor-pointer" />
              </label>

              <label class="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700">
                <span class="font-medium text-white">Kartu Highlight (Hadiah / Biaya)</span>
                <input type="checkbox" v-model="event.sections.highlights" @change="updateDraft" class="w-4 h-4 accent-emerald-500 cursor-pointer" />
              </label>

              <label class="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700">
                <span class="font-medium text-white">Deskripsi Acara</span>
                <input type="checkbox" v-model="event.sections.description" @change="updateDraft" class="w-4 h-4 accent-emerald-500 cursor-pointer" />
              </label>

              <label class="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700">
                <span class="font-medium text-white">Ketentuan & Persyaratan (Follow IG, Juknis)</span>
                <input type="checkbox" v-model="event.sections.requirements" @change="updateDraft" class="w-4 h-4 accent-emerald-500 cursor-pointer" />
              </label>

              <label class="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700">
                <span class="font-medium text-white">Formulir Pendaftaran (Google Form)</span>
                <input type="checkbox" v-model="event.sections.registration" @change="updateDraft" class="w-4 h-4 accent-emerald-500 cursor-pointer" />
              </label>

              <label class="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700">
                <span class="font-medium text-white">Tombol Gabung Grup WhatsApp Peserta</span>
                <input type="checkbox" v-model="event.sections.whatsappGroup" @change="updateDraft" class="w-4 h-4 accent-emerald-500 cursor-pointer" />
              </label>

              <label class="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700">
                <span class="font-medium text-white">Tombol Bantuan Panitia via WhatsApp</span>
                <input type="checkbox" v-model="event.sections.whatsappHelp" @change="updateDraft" class="w-4 h-4 accent-emerald-500 cursor-pointer" />
              </label>
            </div>
          </div>

          <!-- TAB THEME: PENGATURAN WARNA TAMPILAN -->
          <div v-if="activeTab === 'theme'" class="space-y-4">
            <div>
              <label class="block font-semibold text-slate-300 mb-2">Pilihan Palet Preset Warna</label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  v-for="p in themePresets"
                  :key="p.name"
                  type="button"
                  @click="applyThemePreset(p)"
                  class="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:border-slate-700 transition text-left cursor-pointer"
                >
                  <span class="w-5 h-5 rounded-full border border-white/20 shrink-0" :style="{ backgroundColor: p.primary }"></span>
                  <span class="text-xs font-medium text-white">{{ p.name }}</span>
                </button>
              </div>
            </div>

            <div class="pt-3 border-t border-slate-800/80 space-y-3">
              <label class="block font-semibold text-slate-300">Kustomisasi Warna Manual</label>
              
              <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span class="text-slate-300">Warna Aksen Utama (Tombol & Judul)</span>
                <div class="flex items-center gap-2">
                  <input type="color" v-model="event.theme.primaryColor" @input="updateDraft" class="w-7 h-7 rounded border-0 cursor-pointer bg-transparent" />
                  <span class="font-mono text-[11px] text-slate-400">{{ event.theme.primaryColor }}</span>
                </div>
              </div>

              <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span class="text-slate-300">Warna Latar Belakang Web (Background)</span>
                <div class="flex items-center gap-2">
                  <input type="color" v-model="event.theme.bgColor" @input="updateDraft" class="w-7 h-7 rounded border-0 cursor-pointer bg-transparent" />
                  <span class="font-mono text-[11px] text-slate-400">{{ event.theme.bgColor }}</span>
                </div>
              </div>

              <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span class="text-slate-300">Warna Latar Kotak/Kartu Konten</span>
                <div class="flex items-center gap-2">
                  <input type="color" v-model="event.theme.cardBg" @input="updateDraft" class="w-7 h-7 rounded border-0 cursor-pointer bg-transparent" />
                  <span class="font-mono text-[11px] text-slate-400">{{ event.theme.cardBg }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 4: HADIAH, DESKRIPSI & SYARAT -->
          <div v-if="activeTab === 'content'" class="space-y-4">
            <!-- Kustomisasi Deskripsi -->
            <div class="space-y-2">
              <label class="block font-semibold text-slate-300">Judul & Isi Deskripsi Acara</label>
              <input 
                v-model="event.description.title" 
                @input="updateDraft"
                type="text" 
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-emerald-500 transition font-bold"
                placeholder="Judul Panel (Default: Tentang Acara)"
              />
              <textarea 
                v-model="event.description.content" 
                @input="updateDraft"
                rows="3"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-emerald-500 transition resize-none leading-relaxed"
                placeholder="Jelaskan detail tujuan acara..."
              ></textarea>
            </div>

            <!-- Highlights -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="font-semibold text-slate-300">Highlight Informasi (Hadiah / Biaya)</label>
                <button @click="addHighlight" class="text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer">
                  <Plus class="w-3 h-3" /> Tambah
                </button>
              </div>
              <div class="space-y-2">
                <div v-for="(hl, i) in event.highlights" :key="i" class="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <input v-model="hl.title" @input="updateDraft" type="text" placeholder="Judul" class="w-1/3 bg-slate-950 px-2 py-1.5 rounded text-white outline-none text-[11px]" />
                  <input v-model="hl.desc" @input="updateDraft" type="text" placeholder="Nilai" class="flex-1 bg-slate-950 px-2 py-1.5 rounded text-emerald-400 font-bold outline-none text-[11px]" />
                  <button @click="removeHighlight(i)" class="text-rose-400 hover:text-rose-300 p-1 cursor-pointer">
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Syarat & Ketentuan dengan Dukungan Link (Follow IG, Juknis) -->
            <div class="space-y-2 pt-2 border-t border-slate-800/80">
              <div class="flex items-center justify-between mb-1">
                <div>
                  <label class="font-semibold text-slate-300 block">Ketentuan & Syarat Acara</label>
                  <span class="text-[10px] text-slate-500">Bisa tambahkan link (contoh: Link Follow Instagram / Download Buku Panduan)</span>
                </div>
                <button @click="addRequirement" class="text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer">
                  <Plus class="w-3 h-3" /> Tambah
                </button>
              </div>

              <input 
                v-model="event.requirements.title" 
                @input="updateDraft"
                type="text" 
                class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-emerald-500 transition font-bold text-xs mb-2"
                placeholder="Judul Panel Syarat (Default: Ketentuan & Persyaratan)"
              />

              <div class="space-y-3">
                <div v-for="(req, i) in event.requirements.items" :key="i" class="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                  <div class="flex items-center gap-2">
                    <span class="text-emerald-400 font-bold">#{{ i + 1 }}</span>
                    <input 
                      v-model="req.text" 
                      @input="updateDraft" 
                      type="text" 
                      placeholder="Isi persyaratan (contoh: Wajib follow IG panitia)"
                      class="flex-1 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 text-white outline-none text-[11px]" 
                    />
                    <button @click="removeRequirement(i)" class="text-rose-400 hover:text-rose-300 p-1 cursor-pointer">
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <!-- Opsional Link -->
                  <div class="grid grid-cols-2 gap-2 pl-6">
                    <input 
                      v-model="req.linkText" 
                      @input="updateDraft" 
                      type="text" 
                      placeholder="Nama Tautan (misal: @akun_ig / Buku Juknis)"
                      class="bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 text-emerald-400 outline-none text-[10px]" 
                    />
                    <input 
                      v-model="req.linkUrl" 
                      @input="updateDraft" 
                      type="url" 
                      placeholder="URL Tujuan (https://...)"
                      class="bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 text-slate-300 outline-none font-mono text-[10px]" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 5: INTEGRASI FORM & WHATSAPP LENGKAP -->
          <div v-if="activeTab === 'form'" class="space-y-5">
            <!-- Google Form Section Settings -->
            <div class="space-y-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <label class="block font-bold text-white text-xs">Pengaturan Formulir Pendaftaran</label>
              
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="text-[10px] text-slate-400 block mb-1">Judul Panel Form</label>
                  <input 
                    v-model="event.registration.title" 
                    @input="updateDraft"
                    type="text" 
                    class="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white outline-none text-[11px]"
                    placeholder="Formulir Pendaftaran"
                  />
                </div>
                <div>
                  <label class="text-[10px] text-slate-400 block mb-1">Sub-judul / Petunjuk</label>
                  <input 
                    v-model="event.registration.subtitle" 
                    @input="updateDraft"
                    type="text" 
                    class="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white outline-none text-[11px]"
                    placeholder="Isi form di bawah ini"
                  />
                </div>
              </div>

              <div>
                <label class="text-[10px] text-slate-400 block mb-1">Tipe Tampilan Form</label>
                <div class="grid grid-cols-2 gap-2">
                  <button 
                    type="button"
                    @click="event.registration.type = 'embed'; updateDraft()"
                    :class="['p-2.5 rounded-xl border text-center transition cursor-pointer text-xs', event.registration.type === 'embed' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400']"
                  >
                    <FileCode class="w-3.5 h-3.5 mx-auto mb-1" />
                    Embed di Web
                  </button>
                  <button 
                    type="button"
                    @click="event.registration.type = 'button'; updateDraft()"
                    :class="['p-2.5 rounded-xl border text-center transition cursor-pointer text-xs', event.registration.type === 'button' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400']"
                  >
                    <ExternalLink class="w-3.5 h-3.5 mx-auto mb-1" />
                    Tombol Buka Tab
                  </button>
                </div>
              </div>

              <div>
                <label class="text-[10px] text-slate-400 block mb-1">Tautan Google Form</label>
                <input 
                  v-model="event.registration.googleFormUrl" 
                  @input="updateDraft"
                  type="url" 
                  class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500 transition font-mono text-[11px]"
                  placeholder="https://docs.google.com/forms/d/e/.../viewform"
                />
              </div>

              <div>
                <label class="text-[10px] text-slate-400 block mb-1">Kustom Teks Tombol Pendaftaran</label>
                <input 
                  v-model="event.registration.buttonText" 
                  @input="updateDraft"
                  type="text" 
                  class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500 transition text-[11px]"
                  placeholder="Daftar Sekarang via Google Form"
                />
              </div>
            </div>

            <!-- Panel Tombol Gabung Grup WhatsApp Peserta -->
            <div class="space-y-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <label class="block font-bold text-white text-xs">Pengaturan Tombol Gabung Grup WhatsApp</label>
              
              <div>
                <label class="text-[10px] text-slate-400 block mb-1">Judul Panel Grup</label>
                <input 
                  v-model="event.whatsappGroup.title" 
                  @input="updateDraft"
                  type="text" 
                  class="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white outline-none text-[11px]"
                  placeholder="Grup WhatsApp Peserta"
                />
              </div>

              <div>
                <label class="text-[10px] text-slate-400 block mb-1">Keterangan / Subtitle Grup</label>
                <textarea 
                  v-model="event.whatsappGroup.subtitle" 
                  @input="updateDraft"
                  rows="2"
                  class="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white outline-none text-[11px] resize-none"
                  placeholder="Gabung grup peserta untuk diskusi dan info penting..."
                ></textarea>
              </div>

              <div>
                <label class="text-[10px] text-slate-400 block mb-1">Kustom Teks Tombol Gabung</label>
                <input 
                  v-model="event.whatsappGroup.buttonText" 
                  @input="updateDraft"
                  type="text" 
                  class="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white outline-none text-[11px]"
                  placeholder="Gabung Grup WhatsApp Peserta"
                />
              </div>

              <div>
                <label class="text-[10px] text-slate-400 block mb-1">Tautan Undangan Grup WhatsApp (chat.whatsapp.com)</label>
                <input 
                  v-model="event.whatsappGroup.groupUrl" 
                  @input="updateDraft"
                  type="url" 
                  class="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white outline-none font-mono text-[11px]"
                  placeholder="https://chat.whatsapp.com/..."
                />
              </div>
            </div>

            <!-- Kontak Bantuan Panitia WhatsApp -->
            <div class="space-y-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <label class="block font-bold text-white text-xs">Pengaturan Tombol Bantuan Panitia (WA)</label>

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="text-[10px] text-slate-400 block mb-1">Teks Pertanyaan</label>
                  <input 
                    v-model="event.whatsappHelp.text" 
                    @input="updateDraft"
                    type="text" 
                    class="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white outline-none text-[11px]"
                    placeholder="Ada pertanyaan seputar acara?"
                  />
                </div>
                <div>
                  <label class="text-[10px] text-slate-400 block mb-1">Teks Tombol WA</label>
                  <input 
                    v-model="event.whatsappHelp.buttonText" 
                    @input="updateDraft"
                    type="text" 
                    class="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white outline-none text-[11px]"
                    placeholder="Tanya Panitia via WhatsApp"
                  />
                </div>
              </div>

              <div>
                <label class="text-[10px] text-slate-400 block mb-1">Nomor WhatsApp Panitia</label>
                <input 
                  v-model="event.whatsappHelp.panitiaWhatsApp" 
                  @input="updateDraft"
                  type="tel" 
                  class="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white outline-none text-[11px]"
                  placeholder="6281234567890"
                />
              </div>
            </div>
          </div>

          <!-- TAB 6: SHARE -->
          <div v-if="activeTab === 'share'" class="space-y-4">
            <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-slate-200">
              <h3 class="font-bold text-emerald-400 text-sm mb-1">🎉 Halaman Acara Kamu Siap Dipublikasikan!</h3>
              <p class="text-xs text-slate-300 leading-relaxed">
                Salin tautan resmi di bawah ini untuk dibagikan ke calon peserta, broadcast WhatsApp, atau dipasang di bio Instagram:
              </p>
            </div>

            <div class="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
              <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Tautan Resmi Halaman Acara:</span>
              <div class="flex items-center gap-2">
                <input :value="shareDomainUrl" readonly class="flex-1 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 font-mono text-xs text-emerald-400 outline-none select-all" />
                <button @click="copyLink(shareDomainUrl)" class="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs cursor-pointer flex items-center gap-1 shrink-0">
                  <Check v-if="copied" class="w-3.5 h-3.5" />
                  <Copy v-else class="w-3.5 h-3.5" />
                  {{ copied ? 'Tersalin' : 'Salin Link' }}
                </button>
              </div>
              <p class="text-[10px] text-slate-500">Tautan ini langsung terhubung ke database dan siap dibuka oleh calon peserta di mana saja.</p>
            </div>

            <button 
              @click="viewMode = 'public_view'"
              class="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <Eye class="w-4 h-4" />
              <span>Lihat Tampilan Penuh Web Acara (Mode Publik)</span>
            </button>
          </div>
          </div>
        </div>
      </aside>

      <!-- LIVE PREVIEW AREA -->
      <main 
        :class="[
          'flex-1 bg-slate-950/90 flex flex-col items-center justify-start p-3 sm:p-4 md:p-6 overflow-hidden',
          mobileBuilderView === 'editor' ? 'hidden lg:flex' : 'flex'
        ]"
      >
        <div class="text-[11px] text-slate-500 mb-2 sm:mb-3 flex items-center gap-2 shrink-0">
          <Eye class="w-3.5 h-3.5 text-emerald-400" />
          <span>Pratinjau Langsung (Scroll di dalam bingkai untuk melihat)</span>
        </div>

        <div 
          :class="[
            'transition-all duration-300 rounded-2xl sm:rounded-3xl border border-slate-800 overflow-hidden shadow-2xl bg-[#090d16] flex flex-col',
            devicePreview === 'mobile' ? 'w-full max-w-[390px] h-[calc(100vh-140px)] border-4 sm:border-[8px] border-slate-800 shadow-emerald-500/5' : 'w-full max-w-4xl h-[calc(100vh-140px)]'
          ]"
        >
          <!-- Internal Scroll Wrapper -->
          <div class="w-full h-full overflow-y-auto overflow-x-hidden scroll-smooth">
            <EventLandingView :event="event" :previewMode="true" />
          </div>
        </div>
      </main>
    </div>
  </div>

  <!-- MODAL DAFTAR & MASUK AKUN PANITIA -->
  <AuthModal 
    v-if="showAuthModal"
    :initialMode="authModalMode"
    @close="showAuthModal = false"
    @auth-success="onAuthSuccess"
  />
</template>
