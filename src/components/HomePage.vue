<script setup>
import { 
  Sparkles, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  Smartphone, 
  FileCode, 
  Zap, 
  Trophy, 
  Users, 
  Calendar,
  Lock,
  Globe,
  Share2
} from 'lucide-vue-next'

const emit = defineEmits(['start-create', 'open-auth', 'go-dashboard'])
const props = defineProps({
  currentUser: {
    type: Object,
    default: null
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#070b12] text-slate-100 selection:bg-emerald-500 selection:text-white">
    <!-- Navbar Home Full Width -->
    <header class="w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 md:px-10 py-3.5 sm:py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <img src="/logo-icon.png" alt="BikinAcara Logo" class="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-lg shadow-sm" />
        <span class="font-black text-lg sm:text-xl tracking-tight text-white">Bikin<span class="text-[#34d399]">Acara</span></span>
      </div>

      <div class="flex items-center gap-2 sm:gap-3">
        <template v-if="currentUser">
          <button 
            @click="emit('go-dashboard')"
            class="text-xs font-semibold px-3 sm:px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
          >
            Dashboard
          </button>
          <button 
            @click="emit('start-create')"
            class="text-xs font-bold px-3 sm:px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center gap-1"
          >
            <Sparkles class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">+ Buat Acara</span>
            <span class="sm:hidden">Buat</span>
          </button>
        </template>
        <template v-else>
          <button 
            @click="emit('open-auth', 'login')"
            class="text-xs font-medium text-slate-400 hover:text-white px-2.5 sm:px-3 py-2 cursor-pointer transition"
          >
            Masuk
          </button>
          <button 
            @click="emit('open-auth', 'register')"
            class="text-xs font-bold px-3 sm:px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center gap-1"
          >
            <span>Daftar</span>
            <span class="hidden sm:inline">Gratis</span>
          </button>
        </template>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="max-w-5xl mx-auto px-4 pt-16 pb-20 text-center">
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6">
        <Sparkles class="w-3.5 h-3.5" />
        <span>Platform Buat Landing Page Acara No-Code Tercepat</span>
      </div>

      <h1 class="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight mb-6">
        Bikin Landing Page Acara Keren <br class="hidden sm:inline" />
        <span class="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
          Terintegrasi Google Form
        </span> Dalam 2 Menit.
      </h1>

      <p class="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
        Solusi instan untuk BEM, komunitas, dan panitia lomba. Desain brosur online, countdown hadiah, dan formulir pendaftaran dengan link domain kamu sendiri: <br />
        <code class="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono text-sm">bikinacara.reee.my.id/?page=acara-kamu</code>
      </p>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button 
          @click="emit('start-create')"
          class="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-sm tracking-wide transition flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 cursor-pointer"
        >
          <span>Mulai Buat Halaman Acara (Gratis)</span>
          <ArrowRight class="w-4 h-4" />
        </button>
        <button 
          @click="emit('open-auth', 'register')"
          class="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-sm transition cursor-pointer"
        >
          Daftar Akun Panitia
        </button>
      </div>

      <!-- Preview Mockup Screenshot -->
      <div class="mt-14 relative rounded-2xl border border-slate-800 bg-slate-900/60 p-2 shadow-2xl backdrop-blur-xl">
        <div class="flex items-center gap-1.5 px-3 py-2 border-b border-slate-800/80 text-[11px] text-slate-500 font-mono">
          <div class="w-2.5 h-2.5 rounded-full bg-rose-500/60"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-amber-500/60"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-emerald-500/60"></div>
          <span class="ml-2 text-slate-400">https://bikinacara.reee.my.id/?page=lomba-video-kreatif-2026</span>
        </div>
        <div class="p-6 md:p-8 bg-[#090d16] rounded-xl text-left grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <span class="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Kompetisi Nasional</span>
            <h3 class="text-2xl font-black text-white mt-1 mb-2">Lomba Video Kreatif Pelajar 2026</h3>
            <p class="text-slate-400 text-xs leading-relaxed mb-4">
              Ajang kreasi sinematografi dan short video berhadiah total Rp 10 Juta. Formulir pendaftaran Google Form terintegrasi langsung di bawah halaman.
            </p>
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono">
              Total Hadiah: Rp 10.000.000
            </div>
          </div>
          <div class="rounded-xl border border-slate-800 bg-slate-900/80 p-4 text-center cursor-pointer hover:border-emerald-500/40 transition" @click="emit('start-create')">
            <Smartphone class="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <div class="text-xs font-bold text-white">Buka Live Editor Demo</div>
            <div class="text-[11px] text-slate-400 mt-1">Klik untuk langsung mencoba membuat dan mengedit halaman acara.</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Fitur-Fitur Unggulan -->
    <section class="max-w-5xl mx-auto px-4 py-16 border-t border-slate-900">
      <div class="text-center mb-12">
        <h2 class="text-2xl sm:text-3xl font-bold text-white mb-3">Kenapa Panitia Memilih BikinAcara?</h2>
        <p class="text-slate-400 text-sm max-w-lg mx-auto">Dirancang spesifik untuk kebutuhan panitia acara yang ingin gerak cepat tanpa ribet koding.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div class="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-emerald-500/30 transition">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
            <FileCode class="w-5 h-5" />
          </div>
          <h3 class="font-bold text-white text-base mb-2">Google Form Embed</h3>
          <p class="text-slate-400 text-xs leading-relaxed">
            Cukup paste link Google Form panitia, form pendaftaran langsung menyatu rapi di dalam web tanpa harus sewa programmer.
          </p>
        </div>

        <div class="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-emerald-500/30 transition">
          <div class="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-4">
            <Globe class="w-5 h-5" />
          </div>
          <h3 class="font-bold text-white text-base mb-2">Link Subdomain Cantik</h3>
          <p class="text-slate-400 text-xs leading-relaxed">
            Dapatkan link acara yang profesional (misal: <code>bikinacara.reee.my.id/?page=seminar-2026</code>) untuk dipasang di bio Instagram dan grup broadcast.
          </p>
        </div>

        <div class="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-emerald-500/30 transition">
          <div class="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
            <Zap class="w-5 h-5" />
          </div>
          <h3 class="font-bold text-white text-base mb-2">100% Gratis & Ringan</h3>
          <p class="text-slate-400 text-xs leading-relaxed">
            Berjalan di infrastruktur Cloudflare edge global. Cepat dibuka dari smartphone dan anti-down meski diakses ribuan pendaftar.
          </p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-slate-900 py-8 text-center text-xs text-slate-500">
      © {{ new Date().getFullYear() }} <span class="text-white font-semibold">Bikin<span class="text-[#34d399]">Acara</span></span> • Bikin Landing Page Acara Keren Tanpa Ribet.
    </footer>
  </div>
</template>
