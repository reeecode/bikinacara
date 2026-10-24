/**
 * Storage Service untuk Event Landing Page Builder (EventForge)
 * 
 * Mendukung 3 cara penyimpanan:
 * 1. SUPABASE: Multi-user online database (publik bisa akses page.reee.my.id/[slug])
 * 2. URL_HASH: 100% Stateless serverless (Data tersimpan di link terkompresi Base64)
 * 3. LOCAL_STORAGE: Penyimpanan draft builder di browser lokal
 */

export const STORAGE_CONFIG = {
  // Pilihan driver online: 'SUPABASE' | 'URL_HASH'
  driver: 'URL_HASH',

  // Konfigurasi Supabase (Tinggal isi jika sudah ada project Supabase)
  supabase: {
    url: 'https://xyzcompany.supabase.co',
    anonKey: 'eyJh...',
    table: 'event_pages'
  }
}

// Template awal contoh acara (Lomba Video)
export const DEFAULT_EVENT = {
  slug: 'lomba-video-kreatif-2026',
  theme: {
    primaryColor: '#10b981', // Hijau Emerald
    secondaryColor: '#14b8a6', // Teal
    bgColor: '#090d16',
    cardBg: '#0f172a'
  },
  // Pengaturan Panel (Bisa diaktifkan/dinonaktifkan oleh user)
  sections: {
    banner: true,
    highlights: true,
    description: true,
    requirements: true,
    registration: true,
    whatsappGroup: true,
    whatsappHelp: true
  },
  general: {
    title: 'Lomba Video Kreatif Nasional 2026',
    organizer: 'BEM & Komunitas Kreatif Nusantara',
    tagline: 'Tunjukkan Bakat Sinematografi & Raih Total Hadiah Jutaan Rupiah!',
    categoryBadge: '',
    bannerUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
    eventDate: '2026-11-30T23:59',
    location: 'Online / Nasional'
  },
  highlights: [
    { title: 'Total Hadiah', desc: 'Rp 10.000.000 + E-Sertifikat' },
    { title: 'Biaya Pendaftaran', desc: 'Gratis / Free Entry' },
    { title: 'Batas Pengumpulan', desc: '30 November 2026' }
  ],
  description: {
    title: 'Tentang Acara',
    content: 'Ajang kompetisi pembuatan video pendek kreatif terbuka untuk seluruh pelajar, mahasiswa, dan kreator konten di seluruh Indonesia. Buat karya terbaikmu dengan tema "Inovasi & Harapan Masa Depan".'
  },
  requirements: {
    title: 'Ketentuan & Persyaratan',
    items: [
      { text: 'Video berdurasi 1 - 3 menit format MP4/MOV kualitas minimal 1080p.', linkText: '', linkUrl: '' },
      { text: 'Wajib follow akun Instagram panitia:', linkText: '@kreatif_nusantara', linkUrl: 'https://instagram.com' },
      { text: 'Video diunggah ke Google Drive dengan izin link terbuka untuk umum.', linkText: '', linkUrl: '' },
      { text: 'Unduh panduan & juknis lengkap lomba di sini:', linkText: 'Download Buku Panduan', linkUrl: 'https://drive.google.com' }
    ]
  },
  registration: {
    title: 'Formulir Pendaftaran',
    subtitle: 'Silakan lengkapi formulir pendaftaran di bawah ini.',
    type: 'embed', // 'embed' (tampilkan Google Form di web) | 'button' (buka tab baru)
    googleFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSc_EXAMPLE_FORM/viewform?embedded=true',
    buttonText: 'Daftar Sekarang via Google Form'
  },
  whatsappGroup: {
    title: 'Grup WhatsApp Peserta',
    subtitle: 'Gabung ke grup resmi untuk info teknis, pengumuman jadwal, dan diskusi antar peserta.',
    buttonText: 'Gabung Grup WhatsApp Peserta',
    groupUrl: 'https://chat.whatsapp.com/EXAMPLE_INVITE_LINK'
  },
  whatsappHelp: {
    text: 'Ada pertanyaan seputar acara?',
    buttonText: 'Tanya Panitia via WhatsApp',
    panitiaWhatsApp: '6281234567890'
  }
}

// Helper untuk memastikan struktur event kompatibel dengan semua versi data lama
export function normalizeEventData(raw) {
  if (!raw) return JSON.parse(JSON.stringify(DEFAULT_EVENT))
  const d = JSON.parse(JSON.stringify(DEFAULT_EVENT))

  return {
    ...d,
    ...raw,
    sections: {
      ...d.sections,
      ...(raw.sections || {})
    },
    theme: {
      ...d.theme,
      ...(raw.theme || {})
    },
    general: {
      ...d.general,
      ...(raw.general || {}),
      categoryBadge: '' // Hilangkan badge lama seperti 'Kompetisi Nasional'
    },
    description: typeof raw.description === 'string'
      ? { title: 'Tentang Acara', content: raw.description }
      : { ...d.description, ...(raw.description || {}) },
    highlights: Array.isArray(raw.highlights) ? raw.highlights : d.highlights,
    requirements: Array.isArray(raw.requirements)
      ? {
          title: 'Ketentuan & Persyaratan',
          items: raw.requirements.map(item => 
            typeof item === 'string' 
              ? { text: item, linkText: '', linkUrl: '' } 
              : item
          )
        }
      : {
          title: raw.requirements?.title || d.requirements.title,
          items: Array.isArray(raw.requirements?.items)
            ? raw.requirements.items.map(item => 
                typeof item === 'string' 
                  ? { text: item, linkText: '', linkUrl: '' } 
                  : item
              )
            : d.requirements.items
        },
    registration: {
      ...d.registration,
      ...(raw.registration || {})
    },
    whatsappGroup: {
      ...d.whatsappGroup,
      ...(raw.whatsappGroup || {})
    },
    whatsappHelp: {
      ...d.whatsappHelp,
      ...(raw.whatsappHelp || {})
    }
  }
}

// Simpan event ke LocalStorage & return link
export function saveEventToLocal(eventData) {
  const events = JSON.parse(localStorage.getItem('eventforge_pages') || '{}')
  events[eventData.slug] = eventData
  localStorage.setItem('eventforge_pages', JSON.stringify(events))
  return eventData.slug
}

// Dapatkan event dari LocalStorage
export function getEventFromLocal(slug) {
  const events = JSON.parse(localStorage.getItem('eventforge_pages') || '{}')
  return events[slug] || null
}

// Encode event ke URL Hash (100% Stateless - Bisa di-share langsung tanpa DB!)
export function encodeEventToHash(eventData) {
  try {
    const jsonStr = JSON.stringify(eventData)
    // UTF-8 safe base64
    return btoa(encodeURIComponent(jsonStr))
  } catch (e) {
    console.error('Error encoding event to hash:', e)
    return ''
  }
}

// Decode event dari URL Hash
export function decodeEventFromHash(hashStr) {
  try {
    const jsonStr = decodeURIComponent(atob(hashStr))
    return JSON.parse(jsonStr)
  } catch (e) {
    console.error('Error decoding event from hash:', e)
    return null
  }
}

// Simpan ke Supabase jika konfigurasi aktif
export async function saveEventToSupabase(eventData) {
  if (!STORAGE_CONFIG.supabase.url.includes('xyzcompany')) {
    const res = await fetch(`${STORAGE_CONFIG.supabase.url}/rest/v1/${STORAGE_CONFIG.supabase.table}`, {
      method: 'POST',
      headers: {
        'apikey': STORAGE_CONFIG.supabase.anonKey,
        'Authorization': `Bearer ${STORAGE_CONFIG.supabase.anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        slug: eventData.slug,
        data: eventData,
        updated_at: new Date().toISOString()
      })
    })
    return res.ok
  }
  return false
}
