<script setup>
import { ref } from 'vue'
import { 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  X 
} from 'lucide-vue-next'
import { AUTH_SERVICE } from '../services/turso.js'

const props = defineProps({
  initialMode: {
    type: String,
    default: 'login' // 'login' | 'register'
  }
})

const emit = defineEmits(['close', 'auth-success'])

const mode = ref(props.initialMode)
const name = ref('')
const email = ref('')
const password = ref('')
const errorMsg = ref('')
const isLoading = ref(false)

const handleAuth = async () => {
  errorMsg.value = ''
  isLoading.value = true

  try {
    let user
    if (mode.value === 'register') {
      if (!name.value) throw new Error('Nama lengkap wajib diisi!')
      if (password.value.length < 6) throw new Error('Password minimal 6 karakter!')
      user = await AUTH_SERVICE.register(name.value, email.value, password.value)
    } else {
      user = await AUTH_SERVICE.login(email.value, password.value)
    }

    emit('auth-success', user)
  } catch (err) {
    errorMsg.value = err.message || 'Terjadi kesalahan autentikasi'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-fade-in text-slate-100">
      <button 
        @click="emit('close')"
        class="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
      >
        <X class="w-5 h-5" />
      </button>

      <div class="text-center mb-6">
        <h3 class="text-2xl font-black text-white">
          {{ mode === 'register' ? 'Daftar Akun Panitia' : 'Masuk ke BikinAcara' }}
        </h3>
        <p class="text-xs text-slate-400 mt-1">
          {{ mode === 'register' ? 'Buat dan kelola landing page acara kamu secara mandiri' : 'Kelola halaman acara dan formulir yang telah dibuat' }}
        </p>
      </div>

      <div v-if="errorMsg" class="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
        <AlertCircle class="w-4 h-4 shrink-0" />
        <span>{{ errorMsg }}</span>
      </div>

      <form @submit.prevent="handleAuth" class="space-y-4 text-xs">
        <div v-if="mode === 'register'">
          <label class="block font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <User class="w-3.5 h-3.5 text-emerald-400" />
            Nama Lengkap / Nama Organisasi
          </label>
          <input 
            v-model="name"
            type="text" 
            required
            placeholder="Contoh: Rifqi Hidayat / BEM Fasilkom"
            class="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500 transition placeholder:text-slate-600"
          />
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Mail class="w-3.5 h-3.5 text-emerald-400" />
            Alamat Email
          </label>
          <input 
            v-model="email"
            type="email" 
            required
            placeholder="panitia@gmail.com"
            class="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500 transition placeholder:text-slate-600"
          />
        </div>

        <div>
          <label class="block font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Lock class="w-3.5 h-3.5 text-emerald-400" />
            Kata Sandi (Password)
          </label>
          <input 
            v-model="password"
            type="password" 
            required
            placeholder="Minimal 6 karakter"
            class="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-emerald-500 transition placeholder:text-slate-600"
          />
        </div>

        <button 
          type="submit"
          :disabled="isLoading"
          class="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 cursor-pointer mt-2"
        >
          <span>{{ mode === 'register' ? 'Daftar Sekarang' : 'Masuk Dashboard' }}</span>
          <ArrowRight class="w-4 h-4" />
        </button>
      </form>

      <div class="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
        <span v-if="mode === 'register'">Sudah punya akun? </span>
        <span v-else>Belum punya akun? </span>
        <button 
          @click="mode = (mode === 'register' ? 'login' : 'register'); errorMsg = ''"
          class="text-emerald-400 font-bold hover:underline cursor-pointer ml-1"
        >
          {{ mode === 'register' ? 'Masuk di sini' : 'Daftar akun gratis' }}
        </button>
      </div>
    </div>
  </div>
</template>
