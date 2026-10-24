/**
 * Service untuk mengunggah gambar langsung ke Cloudinary via Unsigned Preset
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'lrs86u09'
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'bikinacara_uploads'

export async function uploadImageToCloudinary(file) {
  if (!file) {
    throw new Error('Tidak ada file gambar yang dipilih.')
  }

  // Validasi tipe file
  if (!file.type.startsWith('image/')) {
    throw new Error('File harus berupa gambar (JPG, PNG, WebP).')
  }

  // Validasi ukuran file (maksimal 10MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Ukuran gambar maksimal 10MB.')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const errorMsg = errorData.error?.message || `Gagal mengunggah foto ke Cloudinary (${response.status})`
    throw new Error(errorMsg)
  }

  const data = await response.json()
  // Mengembalikan secure_url HTTPS
  return data.secure_url
}
