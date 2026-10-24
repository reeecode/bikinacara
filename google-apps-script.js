/**
 * KODE GOOGLE APPS SCRIPT (UNTUK OPSI 1 - GOOGLE SHEETS)
 * 
 * Cara Penggunaan:
 * 1. Buka https://sheets.google.com/ lalu buat Spreadsheet baru (misal: "Pendaftaran Lomba Video").
 * 2. Di baris pertama (Header), buat kolom:
 *    Timestamp | No Registrasi | Nama Lengkap | No WhatsApp | Alamat | Kategori | Judul Video | Link Google Drive | Catatan
 * 3. Klik menu: Extensions (Ekstensi) -> Apps Script.
 * 4. Hapus semua kode default, lalu paste SELURUH KODE di bawah ini:
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      data.submittedAt || new Date().toLocaleString('id-ID'),
      data.regId || '-',
      data.fullName || '-',
      "'" + (data.phone || '-'), // Tanda kutip agar angka 0 di depan nomor HP tidak hilang
      data.address || '-',
      data.category || '-',
      data.videoTitle || '-',
      data.gdriveUrl || '-',
      data.notes || '-'
    ]);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data berhasil disimpan ke Google Sheets",
      regId: data.regId
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 5. Klik tombol "Deploy" (Terapkan) di pojok kanan atas -> New deployment (Penerapan baru).
 * 6. Klik ikon gerigi (Select type) -> pilih "Web App".
 * 7. Isi:
 *    - Description: "Webhook Pendaftaran Video"
 *    - Execute as: "Me" (Email kamu)
 *    - Who has access: "Anyone" (Siapa saja - PENTING agar web pendaftaran bisa kirim data)
 * 8. Klik "Deploy" -> Authorize access.
 * 9. Salin "Web App URL" yang diberikan (panjangnya sekitar .../exec).
 * 10. Buka file src/services/storage.js di proyek ini dan ganti nilai `googleAppsScriptUrl` dengan URL tersebut!
 */
