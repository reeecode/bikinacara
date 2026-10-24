/**
 * Turso Database (LibSQL) Client & Authentication Service
 * 
 * Fitur:
 * 1. Native LibSQL HTTP Client (@libsql/client/web)
 * 2. Hash Password aman menggunakan Browser Web Crypto API (SHA-256 + Salt)
 * 3. Auto-Create Table `users` & `events`
 * 4. Fallback transparan ke LocalStorage jika belum menghubungkan token Turso
 */

import { createClient } from '@libsql/client/web'

// Konfigurasi Database Turso Terpusat (Diatur oleh Developer via .env atau Cloudflare Env)
// User / Panitia tidak perlu tahu dan tidak diminta memasukkan database sama sekali!
export const TURSO_CONFIG = {
  url: import.meta.env.VITE_TURSO_URL || localStorage.getItem('eventforge_dev_turso_url') || '',
  authToken: import.meta.env.VITE_TURSO_AUTH_TOKEN || localStorage.getItem('eventforge_dev_turso_token') || '',
}

let dbClient = null

export function getDbClient() {
  if (!TURSO_CONFIG.url || !TURSO_CONFIG.authToken) return null
  if (!dbClient) {
    try {
      dbClient = createClient({
        url: TURSO_CONFIG.url.replace('libsql://', 'https://'),
        authToken: TURSO_CONFIG.authToken
      })
    } catch (e) {
      console.error('[Turso] Gagal inisialisasi client:', e)
      return null
    }
  }
  return dbClient
}

// Inisialisasi tabel jika terhubung ke Turso
export async function initTursoTables() {
  const db = getDbClient()
  if (!db) return false

  try {
    await db.executeMultiple(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        config_json TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `)
    return true
  } catch (err) {
    console.error('[Turso] Init tables error:', err)
    return false
  }
}

// Algoritma hashing SHA-256 murni JS (kompatibel 100% di HTTP & HTTPS semua browser tanpa crypto.subtle)
function sha256Pure(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount))
  }

  const mathPow = Math.pow
  const maxWord = mathPow(2, 32)
  let lengthProperty = 'length'
  let i, j
  let result = ''

  const words = []
  const asciiBitLength = ascii[lengthProperty] * 8

  let hash = []
  const k = []
  let primeCounter = 0

  const isComposite = {}
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = candidate
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0
    }
  }

  ascii += '\x80'
  while ((ascii[lengthProperty] % 64) - 56) ascii += '\x00'
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i)
    if (j >> 8) return ''
    words[i >> 2] |= j << ((3 - (i % 4)) * 8)
  }
  words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0
  words[words[lengthProperty]] = asciiBitLength

  for (j = 0; j < words[lengthProperty]; ) {
    const w = words.slice(j, (j += 16))
    const oldHash = hash
    hash = hash.slice(0, 8)

    for (i = 0; i < 64; i++) {
      const i2 = i + j
      const w15 = w[i - 15], w2 = w[i - 2]

      const a = hash[0], e = hash[4]
      const temp1 =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
        ((e & hash[5]) ^ (~e & hash[6])) +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] +
                (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                w[i - 7] +
                (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
              0)

      const temp2 =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]))

      hash = [(temp1 + temp2) | 0].concat(hash)
      hash[4] = (hash[4] + temp1) | 0
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0
    }
  }

  for (i = 0; i < 8; i++) {
    for (let i2 = 3; i2 >= 0; i2--) {
      const b = (hash[i] >> (i2 * 8)) & 255
      result += (b < 16 ? '0' : '') + b.toString(16)
    }
  }
  return result
}

// Hash password aman dengan fallback otomatis
async function hashPassword(password) {
  const salt = 'eventforge_salt_2026_xyz'
  const text = password + salt

  // Coba crypto.subtle jika ada (lingkungan HTTPS)
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(text)
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    } catch (e) {
      // Fallback ke murni JS
    }
  }

  // Fallback untuk HTTP lokal IP (192.168.x.x)
  return sha256Pure(text)
}

export const AUTH_SERVICE = {
  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem('eventforge_user') || 'null')
    } catch {
      return null
    }
  },

  setCurrentUser(user) {
    const session = { id: user.id, name: user.name, email: user.email }
    localStorage.setItem('eventforge_user', JSON.stringify(session))
  },

  logout() {
    localStorage.removeItem('eventforge_user')
  },

  // 1. DAFTAR AKUN BARU
  async register(name, email, password) {
    const cleanEmail = email.toLowerCase().trim()
    const passwordHash = await hashPassword(password)
    const userId = 'usr_' + Math.random().toString(36).substring(2, 9)

    const db = getDbClient()
    if (db) {
      await initTursoTables()
      // Cek apakah email sudah ada di Turso
      const check = await db.execute({
        sql: 'SELECT id FROM users WHERE email = ?',
        args: [cleanEmail]
      })
      if (check.rows.length > 0) {
        throw new Error('Email sudah terdaftar. Silakan login!')
      }

      await db.execute({
        sql: 'INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)',
        args: [userId, name, cleanEmail, passwordHash]
      })

      const user = { id: userId, name, email: cleanEmail }
      this.setCurrentUser(user)
      return user
    }

    // Fallback Local Storage jika kredensial Turso belum diisi
    const users = JSON.parse(localStorage.getItem('eventforge_all_users') || '[]')
    if (users.find(u => u.email === cleanEmail)) {
      throw new Error('Email sudah terdaftar. Silakan login!')
    }
    const newUser = { id: userId, name, email: cleanEmail, passwordHash }
    users.push(newUser)
    localStorage.setItem('eventforge_all_users', JSON.stringify(users))
    this.setCurrentUser(newUser)
    return newUser
  },

  // 2. LOGIN USER
  async login(email, password) {
    const cleanEmail = email.toLowerCase().trim()
    const passwordHash = await hashPassword(password)

    const db = getDbClient()
    if (db) {
      await initTursoTables()
      const res = await db.execute({
        sql: 'SELECT id, name, email, password_hash FROM users WHERE email = ?',
        args: [cleanEmail]
      })

      if (res.rows.length === 0) {
        throw new Error('Email belum terdaftar!')
      }

      const row = res.rows[0]
      if (row.password_hash !== passwordHash) {
        throw new Error('Password salah!')
      }

      const user = { id: row.id, name: row.name, email: row.email }
      this.setCurrentUser(user)
      return user
    }

    // Fallback Local Storage
    const users = JSON.parse(localStorage.getItem('eventforge_all_users') || '[]')
    const user = users.find(u => u.email === cleanEmail && u.passwordHash === passwordHash)

    if (!user) {
      if (email && password.length >= 6) {
        return this.register('Panitia Acara', email, password)
      }
      throw new Error('Email atau password salah!')
    }

    this.setCurrentUser(user)
    return user
  },

  // 3. AMBIL SEMUA EVENT MILIK USER
  async getUserEvents(userId) {
    const db = getDbClient()
    if (db) {
      try {
        await initTursoTables()
        const res = await db.execute({
          sql: 'SELECT config_json FROM events WHERE user_id = ? ORDER BY updated_at DESC',
          args: [userId]
        })
        return res.rows.map(r => JSON.parse(r.config_json))
      } catch (e) {
        console.error('[Turso] Fetch events error:', e)
      }
    }

    // Fallback
    return JSON.parse(localStorage.getItem('eventforge_user_events_' + userId) || '[]')
  },

  // 4. SIMPAN / UPDATE EVENT (Dibatasi 1 Event per Akun)
  async saveUserEvent(userId, eventData) {
    const db = getDbClient()
    const configJson = JSON.stringify(eventData)

    // Cek event yang ada
    const currentEvents = await this.getUserEvents(userId)
    const existing = currentEvents.find(e => e.slug === eventData.slug)

    // Jika membuat event baru tapi sudah punya 1 event lain
    if (!existing && currentEvents.length >= 1) {
      throw new Error('Batas maksimal tercapai: Anda hanya diperbolehkan membuat 1 acara.')
    }

    if (db) {
      try {
        await initTursoTables()
        const eventId = 'ev_' + (eventData.slug || Math.random().toString(36).substring(2, 8))
        await db.execute({
          sql: `
            INSERT INTO events (id, user_id, slug, title, config_json, updated_at)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(slug) DO UPDATE SET
              title = excluded.title,
              config_json = excluded.config_json,
              updated_at = CURRENT_TIMESTAMP
          `,
          args: [eventId, userId, eventData.slug, eventData.general?.title || 'Acara', configJson]
        })
      } catch (e) {
        console.error('[Turso] Save event error:', e)
      }
    }

    // Selalu simpan juga di local sebagai instant cache
    const events = JSON.parse(localStorage.getItem('eventforge_user_events_' + userId) || '[]')
    const existingIndex = events.findIndex(e => e.slug === eventData.slug)
    if (existingIndex >= 0) {
      events[existingIndex] = eventData
    } else {
      events.unshift(eventData)
    }
    localStorage.setItem('eventforge_user_events_' + userId, JSON.stringify(events))
    return events
  },

  // 5. HAPUS EVENT
  async deleteUserEvent(userId, slug) {
    const db = getDbClient()
    if (db) {
      try {
        await db.execute({
          sql: 'DELETE FROM events WHERE user_id = ? AND slug = ?',
          args: [userId, slug]
        })
      } catch (e) {
        console.error('[Turso] Delete error:', e)
      }
    }

    let events = JSON.parse(localStorage.getItem('eventforge_user_events_' + userId) || '[]')
    events = events.filter(e => e.slug !== slug)
    localStorage.setItem('eventforge_user_events_' + userId, JSON.stringify(events))
    return events
  },

  // 6. AMBIL EVENT PUBLIK BERDASARKAN SLUG (UNTUK PENGUNJUNG)
  async getPublicEventBySlug(slug) {
    const db = getDbClient()
    if (db) {
      try {
        const res = await db.execute({
          sql: 'SELECT config_json FROM events WHERE slug = ?',
          args: [slug]
        })
        if (res.rows.length > 0) {
          return JSON.parse(res.rows[0].config_json)
        }
      } catch (e) {
        console.error('[Turso] Public event query error:', e)
      }
    }
    return null
  }
}
