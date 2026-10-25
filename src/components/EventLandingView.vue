<script setup>
import { computed } from 'vue'
import { 
  Calendar, 
  MapPin, 
  Trophy, 
  CheckCircle2, 
  ExternalLink, 
  MessageSquare, 
  Sparkles,
  Users,
  ArrowRight
} from 'lucide-vue-next'

const props = defineProps({
  event: {
    type: Object,
    required: true
  },
  previewMode: {
    type: Boolean,
    default: false
  }
})

// Format Google Form URL untuk iframe embed
const embedUrl = computed(() => {
  let url = props.event.registration?.googleFormUrl || ''
  if (!url) return ''
  if (url.includes('/viewform') && !url.includes('embedded=true')) {
    url += (url.includes('?') ? '&' : '?') + 'embedded=true'
  }
  return url
})

const getWhatsAppLink = computed(() => {
  const wa = props.event.whatsappHelp?.panitiaWhatsApp || ''
  if (!wa) return '#'
  const text = encodeURIComponent(`Halo Panitia, saya ingin bertanya tentang acara "${props.event.general?.title}"`)
  return `https://wa.me/${wa.replace(/[^0-9]/g, '')}?text=${text}`
})

// Dynamic theme styles
const themeStyle = computed(() => {
  const t = props.event.theme || {}
  return {
    '--primary': t.primaryColor || '#10b981',
    '--secondary': t.secondaryColor || '#14b8a6',
    '--bg-main': t.bgColor || '#090d16',
    '--card-bg': t.cardBg || '#0f172a'
  }
})

// Helper untuk mengecek visibilitas section (default true jika undefined)
const isSectionVisible = (key) => {
  if (!props.event.sections) return true
  return props.event.sections[key] !== false
}
</script>

<template>
  <div 
    :style="themeStyle"
    :class="['w-full bg-[var(--bg-main)] text-slate-100 selection:bg-[var(--primary)] selection:text-white pb-16 transition-colors duration-300', previewMode ? 'min-h-full' : 'min-h-screen']"
  >
    <!-- 1. BANNER HEADER SECTION -->
    <div v-if="isSectionVisible('banner')" class="relative w-full h-56 sm:h-72 md:h-80 overflow-hidden bg-slate-900 border-b border-slate-800">
      <img 
        v-if="event.general?.bannerUrl" 
        :src="event.general.bannerUrl" 
        alt="Banner Acara" 
        class="w-full h-full object-cover opacity-60"
      />
      <div v-else class="w-full h-full bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950"></div>
      
      <!-- Gradient Overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-[var(--bg-main)] via-[var(--bg-main)]/60 to-transparent"></div>

      <!-- Banner Tag (Opsional) -->
      <div v-if="event.general?.categoryBadge" class="absolute top-4 left-4 z-10">
        <span 
          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border"
          :style="{ backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: 'var(--primary)', color: 'var(--primary)' }"
        >
          <Sparkles class="w-3.5 h-3.5" />
          {{ event.general.categoryBadge }}
        </span>
      </div>
    </div>

    <!-- Main Content Container -->
    <div :class="['max-w-4xl mx-auto px-4 relative z-20 space-y-6', isSectionVisible('banner') ? '-mt-16 sm:-mt-20' : 'pt-8']">
      
      <!-- TITLE & ORGANIZER CARD -->
      <div 
        class="border border-slate-800/80 rounded-2xl p-5 sm:p-8 backdrop-blur-xl shadow-2xl transition-all"
        :style="{ backgroundColor: 'var(--card-bg)' }"
      >
        <div class="text-[10px] sm:text-xs uppercase tracking-wider font-semibold mb-2" :style="{ color: 'var(--primary)' }">
          Diselenggarakan Oleh: {{ event.general?.organizer || 'Panitia Acara' }}
        </div>
        <h1 class="text-xl sm:text-3xl md:text-4xl font-black text-white tracking-tight mb-2 sm:mb-3 break-words">
          {{ event.general?.title || 'Judul Acara Belum Diisi' }}
        </h1>
        <p class="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed mb-4 sm:mb-6">
          {{ event.general?.tagline || 'Tagline acara kamu akan tampil di sini.' }}
        </p>

        <!-- Tanggal & Lokasi Badge -->
        <div class="flex flex-wrap gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-800/80 text-xs sm:text-sm text-slate-300">
          <div class="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <Calendar class="w-3.5 h-3.5" :style="{ color: 'var(--primary)' }" />
            <span class="text-[11px] sm:text-xs">{{ event.general?.eventDate || 'Tanggal Acara' }}</span>
          </div>
          <div class="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <MapPin class="w-3.5 h-3.5" :style="{ color: 'var(--primary)' }" />
            <span class="text-[11px] sm:text-xs">{{ event.general?.location || 'Lokasi Acara' }}</span>
          </div>
        </div>
      </div>

      <!-- 2. HIGHLIGHTS PANEL (3 KOLOM) -->
      <div v-if="isSectionVisible('highlights') && event.highlights && event.highlights.length" class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div 
          v-for="(hl, i) in event.highlights" 
          :key="i"
          class="border border-slate-800/80 rounded-xl p-3.5 sm:p-4 text-center transition"
          :style="{ backgroundColor: 'var(--card-bg)' }"
        >
          <div class="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">{{ hl.title }}</div>
          <div class="text-sm sm:text-base md:text-lg font-black font-mono break-words" :style="{ color: 'var(--primary)' }">
            {{ hl.desc }}
          </div>
        </div>
      </div>

      <!-- 3. DESKRIPSI ACARA PANEL -->
      <div 
        v-if="isSectionVisible('description') && event.description?.content" 
        class="border border-slate-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl"
        :style="{ backgroundColor: 'var(--card-bg)' }"
      >
        <h3 class="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <span>{{ event.description?.title || 'Tentang Acara' }}</span>
        </h3>
        <p class="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
          {{ event.description.content }}
        </p>
      </div>

      <!-- 4. SYARAT & KETENTUAN PANEL (DENGAN CUSTOM LINK) -->
      <div 
        v-if="isSectionVisible('requirements') && event.requirements?.items && event.requirements.items.length" 
        class="border border-slate-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl"
        :style="{ backgroundColor: 'var(--card-bg)' }"
      >
        <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <CheckCircle2 class="w-5 h-5" :style="{ color: 'var(--primary)' }" />
          <span>{{ event.requirements?.title || 'Ketentuan & Persyaratan' }}</span>
        </h3>
        <ul class="space-y-3 text-xs sm:text-sm text-slate-300">
          <li v-for="(req, i) in event.requirements.items" :key="i" class="flex items-start gap-3">
            <span 
              class="w-5 h-5 rounded-full border text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5"
              :style="{ borderColor: 'var(--primary)', color: 'var(--primary)', backgroundColor: 'rgba(16, 185, 129, 0.1)' }"
            >
              {{ i + 1 }}
            </span>
            <div class="leading-relaxed flex-1">
              <span>{{ typeof req === 'string' ? req : req.text }}</span>
              <!-- Custom Link di Syarat (Follow IG, Link Juknis, dll) -->
              <a 
                v-if="req.linkUrl" 
                :href="req.linkUrl" 
                target="_blank" 
                class="inline-flex items-center gap-1 font-semibold ml-1.5 underline hover:opacity-80 transition"
                :style="{ color: 'var(--primary)' }"
              >
                {{ req.linkText || 'Buka Tautan' }}
                <ExternalLink class="w-3 h-3" />
              </a>
            </div>
          </li>
        </ul>
      </div>

      <!-- 4B. CUSTOM CARDS TAMBAHAN (KRITERIA PENILAIAN, JADWAL, DLL) -->
      <template v-if="event.customCards && event.customCards.length">
        <div 
          v-for="(card, cardIdx) in event.customCards" 
          :key="card.id || cardIdx"
          class="border border-slate-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl"
          :style="{ backgroundColor: 'var(--card-bg)' }"
        >
          <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle2 class="w-5 h-5" :style="{ color: 'var(--primary)' }" />
            <span>{{ card.title || 'Informasi Tambahan' }}</span>
          </h3>

          <!-- Mode List / Poin -->
          <ul v-if="card.type !== 'text' && card.items && card.items.length" class="space-y-3 text-xs sm:text-sm text-slate-300">
            <li v-for="(it, i) in card.items" :key="i" class="flex items-start gap-3">
              <span 
                class="w-5 h-5 rounded-full border text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5"
                :style="{ borderColor: 'var(--primary)', color: 'var(--primary)', backgroundColor: 'rgba(16, 185, 129, 0.1)' }"
              >
                {{ i + 1 }}
              </span>
              <div class="leading-relaxed flex-1">
                <span>{{ typeof it === 'string' ? it : it.text }}</span>
                <a 
                  v-if="it.linkUrl" 
                  :href="it.linkUrl" 
                  target="_blank" 
                  class="inline-flex items-center gap-1 font-semibold ml-1.5 underline hover:opacity-80 transition"
                  :style="{ color: 'var(--primary)' }"
                >
                  {{ it.linkText || 'Buka Tautan' }}
                  <ExternalLink class="w-3 h-3" />
                </a>
              </div>
            </li>
          </ul>

          <!-- Mode Paragraf Bebas -->
          <p v-else-if="card.content" class="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
            {{ card.content }}
          </p>
        </div>
      </template>

      <!-- 5. PANEL GABUNG GRUP WHATSAPP PESERTA -->
      <div 
        v-if="isSectionVisible('whatsappGroup') && event.whatsappGroup?.groupUrl" 
        class="border border-emerald-500/30 rounded-2xl p-6 sm:p-8 backdrop-blur-xl text-center relative overflow-hidden"
        :style="{ backgroundColor: 'var(--card-bg)' }"
      >
        <div class="max-w-md mx-auto">
          <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <Users class="w-6 h-6" />
          </div>
          <h3 class="text-lg sm:text-xl font-bold text-white mb-1.5">
            {{ event.whatsappGroup?.title || 'Grup WhatsApp Peserta' }}
          </h3>
          <p class="text-slate-300 text-xs sm:text-sm mb-5 leading-relaxed">
            {{ event.whatsappGroup?.subtitle || 'Bergabunglah dengan grup resmi peserta untuk informasi jadwal, panduan teknis, dan diskusi.' }}
          </p>
          <a 
            :href="event.whatsappGroup.groupUrl" 
            target="_blank"
            class="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm text-slate-950 transition shadow-xl cursor-pointer"
            :style="{ backgroundColor: 'var(--primary)' }"
          >
            <span>{{ event.whatsappGroup?.buttonText || 'Gabung Grup WhatsApp' }}</span>
            <ArrowRight class="w-4 h-4" />
          </a>
        </div>
      </div>

      <!-- 6. SECTION REGISTRASI (GOOGLE FORM EMBED / BUTTON) -->
      <div 
        v-if="isSectionVisible('registration')" 
        class="border border-slate-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl"
        :style="{ backgroundColor: 'var(--card-bg)' }"
      >
        <div class="text-center mb-6">
          <span 
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-2"
            :style="{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)' }"
          >
            Pendaftaran Peserta
          </span>
          <h2 class="text-xl sm:text-3xl font-black text-white">
            {{ event.registration?.title || 'Formulir Pendaftaran' }}
          </h2>
          <p class="text-slate-400 text-xs sm:text-sm mt-1">
            {{ event.registration?.subtitle || 'Silakan lengkapi formulir pendaftaran di bawah ini.' }}
          </p>
        </div>

        <!-- MODE EMBED GOOGLE FORM -->
        <div v-if="event.registration?.type === 'embed' && embedUrl" class="rounded-xl overflow-hidden border border-slate-800 bg-white">
          <iframe 
            :src="embedUrl" 
            class="w-full h-[520px] sm:h-[650px] md:h-[750px] border-0" 
            frameborder="0" 
            marginheight="0" 
            marginwidth="0"
          >
            Memuat formulir pendaftaran...
          </iframe>
        </div>

        <!-- MODE BUTTON CTA GOOGLE FORM -->
        <div v-else class="text-center py-6">
          <a 
            :href="event.registration?.googleFormUrl || '#'" 
            target="_blank"
            class="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-slate-950 font-bold text-base transition shadow-xl cursor-pointer"
            :style="{ backgroundColor: 'var(--primary)' }"
          >
            <span>{{ event.registration?.buttonText || 'Buka Google Form Pendaftaran' }}</span>
            <ExternalLink class="w-4 h-4" />
          </a>
          <p class="text-[11px] text-slate-500 mt-2">Formulir akan terbuka di tab baru</p>
        </div>

        <!-- 7. Kontak Panitia WhatsApp -->
        <div 
          v-if="isSectionVisible('whatsappHelp') && event.whatsappHelp?.panitiaWhatsApp" 
          class="mt-6 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400"
        >
          <span>{{ event.whatsappHelp?.text || 'Ada pertanyaan seputar acara?' }}</span>
          <a 
            :href="getWhatsAppLink" 
            target="_blank"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 font-medium transition cursor-pointer border border-slate-800"
            :style="{ color: 'var(--primary)' }"
          >
            <MessageSquare class="w-4 h-4" />
            <span>{{ event.whatsappHelp?.buttonText || 'Tanya Panitia via WhatsApp' }}</span>
          </a>
        </div>
      </div>

      <!-- Footer Watermark -->
      <div class="text-center py-6 text-xs text-slate-600">
        Landing Page dibuat dengan <span class="text-white font-semibold">Bikin<span class="text-[#34d399]">Acara</span></span> • Bebas Buat Acara Tanpa Koding
      </div>
    </div>
  </div>
</template>
