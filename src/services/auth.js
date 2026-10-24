/**
 * Auth & User Event Management Service (Client-Side & Supabase Ready)
 */

export const AUTH_STORAGE = {
  // Simpan user sesi aktif
  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem('eventforge_user') || 'null')
    } catch {
      return null
    }
  },

  // Daftar akun baru (disimpan lokal di browser, siap sync ke Supabase nanti)
  register(name, email, password) {
    const users = JSON.parse(localStorage.getItem('eventforge_all_users') || '[]')
    
    // Cek apakah email sudah terdaftar
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Email sudah terdaftar. Silakan login!')
    }

    const newUser = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name,
      email: email.toLowerCase(),
      password, // Di frontend demo disimpan sederhana, di Supabase otomatis hashed
      createdAt: new Date().toISOString()
    }

    users.push(newUser)
    localStorage.setItem('eventforge_all_users', JSON.stringify(users))
    
    // Auto login
    this.setCurrentUser(newUser)
    return newUser
  },

  // Login akun
  login(email, password) {
    const users = JSON.parse(localStorage.getItem('eventforge_all_users') || '[]')
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password)

    if (!user) {
      // Izinkan akun demo langsung login
      if (email && password.length >= 6) {
        return this.register('Panitia Kreatif', email, password)
      }
      throw new Error('Email atau password salah!')
    }

    this.setCurrentUser(user)
    return user
  },

  setCurrentUser(user) {
    const session = { id: user.id, name: user.name, email: user.email }
    localStorage.setItem('eventforge_user', JSON.stringify(session))
  },

  logout() {
    localStorage.removeItem('eventforge_user')
  },

  // Ambil semua event milik user yang sedang login
  getUserEvents(userId) {
    const events = JSON.parse(localStorage.getItem('eventforge_user_events_' + userId) || '[]')
    return events
  },

  // Simpan / update event ke dashboard user
  saveUserEvent(userId, eventData) {
    const events = this.getUserEvents(userId)
    const existingIndex = events.findIndex(e => e.slug === eventData.slug)

    const updatedEvent = {
      ...eventData,
      updatedAt: new Date().toISOString()
    }

    if (existingIndex >= 0) {
      events[existingIndex] = updatedEvent
    } else {
      events.unshift(updatedEvent)
    }

    localStorage.setItem('eventforge_user_events_' + userId, JSON.stringify(events))
    return events
  },

  // Hapus event
  deleteUserEvent(userId, slug) {
    let events = this.getUserEvents(userId)
    events = events.filter(e => e.slug !== slug)
    localStorage.setItem('eventforge_user_events_' + userId, JSON.stringify(events))
    return events
  }
}
