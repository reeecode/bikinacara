/**
 * Adapter Storage untuk Pendaftaran Lomba Video
 * 
 * Desain modular: Sekarang default ke GOOGLE_SHEETS (Apps Script Webhook).
 * Kapan saja mau pindah ke Supabase atau Cloudflare D1, cukup ganti driver
 * atau isi konfigurasi di bawah tanpa perlu ubah kode komponen UI!
 */

export const STORAGE_CONFIG = {
  // Pilihan driver: 'GOOGLE_SHEETS' | 'SUPABASE' | 'CUSTOM_API' | 'MOCK'
  driver: 'GOOGLE_SHEETS',

  // 1. Google Sheets Apps Script Webhook URL
  // Buat di Google Sheets -> Extensions -> Apps Script -> Deploy as Web App -> Access: Anyone
  googleAppsScriptUrl: 'https://script.google.com/macros/s/AKfycbxYOUR_SCRIPT_ID_HERE/exec',

  // 2. Jika nanti beralih ke Supabase:
  supabase: {
    url: 'https://xyzcompany.supabase.co',
    anonKey: 'eyJh...',
    table: 'video_submissions'
  },

  // 3. WhatsApp Panitia untuk Konfirmasi
  panitiaWhatsApp: '6281234567890'
}

export async function submitRegistration(data) {
  const payload = {
    ...data,
    submittedAt: new Date().toISOString(),
    regId: 'REG-' + Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  // JIKA MENGGUNAKAN GOOGLE APPS SCRIPT
  if (STORAGE_CONFIG.driver === 'GOOGLE_SHEETS') {
    // Jika belum diset URL aslinya, berikan simulasi sukses untuk demo
    if (STORAGE_CONFIG.googleAppsScriptUrl.includes('YOUR_SCRIPT_ID')) {
      console.warn('[Storage] Google Apps Script URL belum diisi. Menjalankan fallback simulasi.')
      await new Promise(resolve => setTimeout(resolve, 1200))
      // Simpan juga di localStorage agar admin/user bisa lihat preview
      saveLocalBackup(payload)
      return { success: true, isDemo: true, regId: payload.regId, data: payload }
    }

    try {
      const response = await fetch(STORAGE_CONFIG.googleAppsScriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', // Hindari preflight CORS options pada Apps Script
        },
        body: JSON.stringify(payload)
      })

      const resJson = await response.json().catch(() => ({}))
      saveLocalBackup(payload)
      return { success: true, regId: payload.regId, response: resJson }
    } catch (err) {
      console.error('Submit Google Apps Script error:', err)
      // Simpan lokal sebagai backup jika internet ngedrop
      saveLocalBackup(payload)
      return { success: true, regId: payload.regId, backupLocal: true }
    }
  }

  // JIKA NANTI BERALIH KE SUPABASE
  if (STORAGE_CONFIG.driver === 'SUPABASE') {
    const res = await fetch(`${STORAGE_CONFIG.supabase.url}/rest/v1/${STORAGE_CONFIG.supabase.table}`, {
      method: 'POST',
      headers: {
        'apikey': STORAGE_CONFIG.supabase.anonKey,
        'Authorization': `Bearer ${STORAGE_CONFIG.supabase.anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(payload)
    })
    if (!res.ok) throw new Error('Gagal simpan ke Supabase')
    return { success: true, regId: payload.regId }
  }

  // Default Mock Fallback
  await new Promise(resolve => setTimeout(resolve, 800))
  saveLocalBackup(payload)
  return { success: true, regId: payload.regId }
}

function saveLocalBackup(item) {
  try {
    const list = JSON.parse(localStorage.getItem('video_submissions') || '[]')
    list.unshift(item)
    localStorage.setItem('video_submissions', JSON.stringify(list))
  } catch (e) {
    // Ignore storage quota errors
  }
}

export function getLocalSubmissions() {
  try {
    return JSON.parse(localStorage.getItem('video_submissions') || '[]')
  } catch {
    return []
  }
}
