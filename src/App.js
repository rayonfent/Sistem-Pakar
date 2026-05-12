import { useState, useEffect, useRef } from "react";

// ============================================================
// KNOWLEDGE BASE - 100+ ACADEMIC RULES
// ============================================================
const KNOWLEDGE_BASE = {
  rules: [
    // === SKS & IPK RULES ===
    { rule_id:"R001", category:"SKS", priority:1, conditions:[{field:"ipk",op:">=",val:3.0}], result:{max_sks:24}, template:"Mahasiswa dengan IPK {ipk} (≥ 3.00) dapat mengambil maksimal **24 SKS** pada semester berikutnya.", source:"Peraturan Akademik UNILA 2025 Pasal 24 ayat (5)" },
    { rule_id:"R002", category:"SKS", priority:2, conditions:[{field:"ipk",op:">=",val:2.5},{field:"ipk",op:"<",val:3.0}], result:{max_sks:21}, template:"Mahasiswa dengan IPK {ipk} (2.50–2.99) dapat mengambil maksimal **21 SKS**.", source:"Peraturan Akademik UNILA 2025 Pasal 24 ayat (5)" },
    { rule_id:"R003", category:"SKS", priority:3, conditions:[{field:"ipk",op:">=",val:2.0},{field:"ipk",op:"<",val:2.5}], result:{max_sks:18}, template:"Mahasiswa dengan IPK {ipk} (2.00–2.49) dapat mengambil maksimal **18 SKS**.", source:"Peraturan Akademik UNILA 2025 Pasal 24 ayat (5)" },
    { rule_id:"R004", category:"SKS", priority:4, conditions:[{field:"ipk",op:">=",val:1.5},{field:"ipk",op:"<",val:2.0}], result:{max_sks:15}, template:"Mahasiswa dengan IPK {ipk} (1.50–1.99) hanya dapat mengambil maksimal **15 SKS**. Perhatian: IPK Anda perlu ditingkatkan.", source:"Peraturan Akademik UNILA 2025 Pasal 24 ayat (5)" },
    { rule_id:"R004B", category:"SKS", priority:5, conditions:[{field:"ipk",op:"<",val:1.5}], result:{max_sks:12}, template:"⚠️ Mahasiswa dengan IPK {ipk} (< 1.50) hanya dapat mengambil maksimal **12 SKS**. IPK sangat rendah, segera konsultasi dengan PA!", source:"Peraturan Akademik UNILA 2025 Pasal 24 ayat (5)" },
    { rule_id:"R005", category:"SKS", priority:1, conditions:[{field:"semester",op:"<=",val:2}], result:{max_sks:20}, template:"Mahasiswa semester 1-2 dapat mengambil maksimal **20 SKS** (paket ditentukan program studi).", source:"Peraturan Akademik UNILA 2025 Pasal 24 ayat (5)" },

    // === KEHADIRAN / PRESENSI ===
    { rule_id:"R006", category:"Kehadiran", priority:1, conditions:[{field:"presensi",op:">=",val:80}], result:{boleh_uts:true,boleh_uas:true}, template:"Kehadiran {presensi}% memenuhi syarat minimum 80%. Anda **diizinkan mengikuti UTS dan UAS**.", source:"Peraturan Akademik UNILA 2025 Pasal 34" },
    { rule_id:"R007", category:"Kehadiran", priority:2, conditions:[{field:"presensi",op:">=",val:50},{field:"presensi",op:"<",val:80}], result:{boleh_uts:true,boleh_uas:false}, template:"Kehadiran {presensi}% hanya memenuhi syarat UTS, namun **tidak memenuhi syarat untuk UAS**. Kehadiran minimum untuk UAS adalah 80%.", source:"Peraturan Akademik UNILA 2025 Pasal 34" },
    { rule_id:"R008", category:"Kehadiran", priority:3, conditions:[{field:"presensi",op:"<",val:50}], result:{boleh_uts:false,boleh_uas:false}, template:"Kehadiran {presensi}% **tidak memenuhi syarat UTS maupun UAS**. Anda berisiko mendapat nilai E pada mata kuliah tersebut.", source:"Peraturan Akademik UNILA 2025 Pasal 34" },
    { rule_id:"R009", category:"Kehadiran", priority:1, conditions:[{field:"presensi",op:">=",val:80}], result:{nilai_bonus:true}, template:"Kehadiran {presensi}% (≥80%) dapat memberikan pertimbangan nilai tambahan dari dosen sesuai kebijakan program studi.", source:"Peraturan Akademik UNILA 2025 Pasal 34" },

    // === UTS & UAS ===
    { rule_id:"R010", category:"UAS", priority:1, conditions:[{field:"presensi",op:">=",val:80},{field:"administrasi",op:"==",val:true}], result:{boleh_uas:true}, template:"Syarat UAS terpenuhi: kehadiran ≥80% dan administrasi lunas. **Anda berhak mengikuti UAS**.", source:"Peraturan Akademik UNILA 2025 Pasal 34" },
    { rule_id:"R011", category:"UAS", priority:2, conditions:[{field:"administrasi",op:"==",val:false}], result:{boleh_uas:false}, template:"**Administrasi belum lunas.** Anda tidak diizinkan mengikuti UAS hingga kewajiban administrasi dipenuhi. Segera hubungi BAAK.", source:"Peraturan Akademik UNILA 2025 Pasal 34" },
    { rule_id:"R012", category:"UTS", priority:1, conditions:[{field:"presensi",op:">=",val:50}], result:{boleh_uts:true}, template:"Kehadiran {presensi}% memenuhi syarat minimum UTS (≥50%). **Anda diizinkan mengikuti UTS**.", source:"Peraturan Akademik UNILA 2025 Pasal 34" },

    // === SEMESTER PENDEK ===
    { rule_id:"R013", category:"SemesterPendek", priority:1, conditions:[{field:"ipk",op:"<",val:2.0}], result:{prioritas_sp:true,max_sks_sp:9}, template:"Mahasiswa dengan IPK < 2.00 **diprioritaskan** mengikuti Semester Pendek (SP) dengan maksimal 9 SKS untuk perbaikan nilai.", source:"Peraturan Akademik UNILA 2025 Pasal 6" },
    { rule_id:"R014", category:"SemesterPendek", priority:2, conditions:[{field:"ipk",op:">=",val:2.0}], result:{boleh_sp:true,max_sks_sp:9}, template:"Mahasiswa dengan IPK ≥ 2.00 **dapat mengikuti** Semester Pendek maksimal 9 SKS untuk memperbaiki nilai atau mengulang.", source:"Peraturan Akademik UNILA 2025 Pasal 6" },
    { rule_id:"R015", category:"SemesterPendek", priority:1, conditions:[{field:"semester",op:">=",val:2}], result:{eligible_sp:true}, template:"Semester Pendek hanya dapat diikuti mulai **semester 2** ke atas. Mahasiswa semester 1 tidak diperkenankan.", source:"Peraturan Akademik UNILA 2025 Pasal 6" },
    { rule_id:"R016", category:"SemesterPendek", priority:1, conditions:[], result:{biaya_sp:true}, template:"Semester Pendek dikenakan **biaya tambahan** di luar UKT reguler. Informasi biaya dapat diperoleh di BAAK UNILA.", source:"Peraturan Akademik UNILA 2025 Pasal 6" },

    // === SKRIPSI / TUGAS AKHIR ===
    { rule_id:"R017", category:"Skripsi", priority:1, conditions:[{field:"sks_lulus",op:">=",val:80},{field:"ipk",op:">=",val:2.0}], result:{boleh_skripsi:true}, template:"Syarat pengajuan skripsi terpenuhi: SKS lulus ≥80 dan IPK ≥ 2.00. **Anda dapat mendaftarkan skripsi**.", source:"Peraturan Akademik UNILA 2025 Pasal 67 ayat (1) huruf a" },
    { rule_id:"R018", category:"Skripsi", priority:2, conditions:[{field:"sks_lulus",op:"<",val:80}], result:{boleh_skripsi:false}, template:"SKS lulus {sks_lulus} < 80. **Belum memenuhi syarat** pengajuan skripsi. Selesaikan minimal 80 SKS terlebih dahulu.", source:"Peraturan Akademik UNILA 2025 Pasal 67 ayat (1) huruf a" },
    { rule_id:"R019", category:"Skripsi", priority:1, conditions:[{field:"ipk",op:"<",val:2.0}], result:{boleh_skripsi:false}, template:"IPK {ipk} < 2.00. **Belum memenuhi syarat IPK** untuk pengajuan skripsi. Tingkatkan IPK minimal menjadi 2.00.", source:"Peraturan Akademik UNILA 2025" },
    { rule_id:"R020", category:"Skripsi", priority:1, conditions:[{field:"kkn",op:"==",val:true}], result:{syarat_kkn_skripsi:true}, template:"KKN wajib diselesaikan atau berjalan bersamaan sebelum **sidang skripsi**. Pastikan status KKN Anda sudah lunas.", source:"Peraturan Akademik UNILA 2025" },
    { rule_id:"R021", category:"Skripsi", priority:1, conditions:[{field:"pkl",op:"==",val:true}], result:{syarat_pkl_skripsi:true}, template:"PKL/Magang wajib diselesaikan sebelum pengajuan skripsi bagi program studi yang mewajibkan PKL.", source:"Peraturan Akademik UNILA 2025" },
    { rule_id:"R022", category:"Skripsi", priority:1, conditions:[], result:{batas_revisi:true}, template:"Revisi skripsi pasca-sidang wajib diselesaikan dalam **30 hari kerja**. Lewat batas, mahasiswa harus sidang ulang.", source:"Peraturan Akademik UNILA 2025" },

    // === KKN (KULIAH KERJA NYATA) ===
    { rule_id:"R023A", category:"KKN", priority:0, conditions:[], result:{info_syarat_kkn:true}, template:"📌 **Syarat mengikuti KKN UNILA (umum)**\n\nAgar bisa mendaftar KKN, umumnya mahasiswa harus memenuhi:\n• **SKS lulus minimal 100 SKS**\n• **IPK minimal 2.00**\n• **Minimal semester 6**\n• Status akademik aktif dan **administrasi/UKT semester berjalan lunas** (sesuai ketentuan pendaftaran)\n\nJika Anda kirim data: **SKS lulus, IPK, dan semester**, saya bisa cek apakah Anda **sudah memenuhi** syaratnya.", source:"Panduan KKN UNILA 2024" },
    { rule_id:"R023", category:"KKN", priority:1, conditions:[{field:"sks_lulus",op:">=",val:100},{field:"ipk",op:">=",val:2.0},{field:"semester",op:">=",val:6}], result:{boleh_kkn:true}, template:"✅ **Syarat KKN terpenuhi!**\n\n**Persyaratan yang sudah dipenuhi:**\n• SKS lulus: {sks_lulus} ≥ 100 ✓\n• IPK: {ipk} ≥ 2.00 ✓\n• Semester: {semester} ≥ 6 ✓\n\n**Anda dapat mendaftar KKN** pada periode pendaftaran berikutnya.", source:"Panduan KKN UNILA 2024" },
    { rule_id:"R024", category:"KKN", priority:2, conditions:[{field:"sks_lulus",op:"<",val:100}], result:{boleh_kkn:false}, template:"❌ **Belum memenuhi syarat KKN**\n\nSKS lulus Anda: **{sks_lulus} SKS**\nSyarat minimal: **100 SKS**\nKekurangan: **{100-sks_lulus} SKS**\n\nSelesaikan mata kuliah hingga mencapai 100 SKS terlebih dahulu.", source:"Panduan KKN UNILA 2024" },
    { rule_id:"R025", category:"KKN", priority:2, conditions:[{field:"semester",op:"<",val:6}], result:{boleh_kkn:false}, template:"❌ **Belum memenuhi syarat semester untuk KKN**\n\nSemester Anda saat ini: **Semester {semester}**\nSyarat minimal: **Semester 6**\n\nKKN dapat diikuti mulai semester 6 ke atas.", source:"Panduan KKN UNILA 2024" },
    { rule_id:"R026", category:"KKN", priority:1, conditions:[], result:{kkn_sks:true}, template:"📚 **Informasi Bobot SKS KKN**\n\nKKN memberikan bobot **3 SKS** yang akan diperhitungkan dalam:\n• Transkrip akademik\n• Total SKS kelulusan\n• Perhitungan IPK\n\nNilai KKN: A, B+, B, C+, C, D, atau E", source:"Panduan KKN UNILA 2024" },
    { rule_id:"R026A", category:"KKN", priority:1, conditions:[], result:{kkn_durasi:true}, template:"⏱️ **Durasi Pelaksanaan KKN**\n\nKKN dilaksanakan selama **30-45 hari** (1-1.5 bulan) di lokasi yang ditentukan oleh LP2M UNILA.\n\n**Tahapan:**\n1. Pembekalan (3-5 hari)\n2. Pelaksanaan di lokasi (30-45 hari)\n3. Pelaporan dan evaluasi (7 hari)", source:"Panduan KKN UNILA 2024" },
    { rule_id:"R026B", category:"KKN", priority:1, conditions:[], result:{kkn_biaya:true}, template:"💰 **Biaya KKN**\n\nBiaya KKN **sudah termasuk dalam UKT** semester berjalan. Tidak ada biaya tambahan untuk:\n• Pendaftaran KKN\n• Pembekalan\n• Sertifikat\n\nBiaya tambahan yang mungkin timbul:\n• Transportasi ke lokasi (ditanggung mahasiswa)\n• Akomodasi dan konsumsi selama di lokasi", source:"Panduan KKN UNILA 2024" },
    { rule_id:"R026C", category:"KKN", priority:1, conditions:[], result:{kkn_dokumen:true}, template:"📄 **Dokumen yang Diperlukan untuk Pendaftaran KKN**\n\n1. Formulir pendaftaran KKN (dari LP2M)\n2. Fotokopi KTM yang masih berlaku\n3. Transkrip nilai sementara (min. 100 SKS)\n4. Surat keterangan sehat dari dokter\n5. Pas foto 3x4 (2 lembar)\n6. Bukti pembayaran UKT semester berjalan\n7. Surat persetujuan orang tua/wali", source:"Panduan KKN UNILA 2024" },
    { rule_id:"R026D", category:"KKN", priority:1, conditions:[], result:{kkn_lokasi:true}, template:"📍 **Penempatan Lokasi KKN**\n\nLokasi KKN ditentukan oleh **LP2M UNILA** berdasarkan:\n• Kebutuhan masyarakat\n• Pemerataan wilayah\n• Keamanan lokasi\n• Aksesibilitas\n\n**Catatan:** Mahasiswa tidak dapat memilih lokasi sendiri, kecuali ada program KKN mandiri dengan persetujuan khusus.", source:"Panduan KKN UNILA 2024" },

    // === PKL / MAGANG / KERJA PRAKTIK ===
    { rule_id:"R027A", category:"PKL", priority:0, conditions:[], result:{info_syarat_pkl:true}, template:"📌 **Syarat mengikuti PKL/Magang/KP UNILA (umum)**\n\nAgar bisa mendaftar PKL/Magang/Kerja Praktik, umumnya mahasiswa harus memenuhi:\n• **SKS lulus minimal 80 SKS**\n• **Minimal semester 5**\n• Status akademik aktif dan memenuhi ketentuan program studi\n\nJika Anda kirim data: **SKS lulus dan semester**, saya bisa cek apakah Anda **sudah memenuhi** syaratnya.", source:"Panduan PKL UNILA 2024" },
    { rule_id:"R027", category:"PKL", priority:1, conditions:[{field:"sks_lulus",op:">=",val:80},{field:"semester",op:">=",val:5}], result:{boleh_pkl:true}, template:"✅ **Syarat PKL/Magang terpenuhi!**\n\n**Persyaratan yang sudah dipenuhi:**\n• SKS lulus: {sks_lulus} ≥ 80 ✓\n• Semester: {semester} ≥ 5 ✓\n\n**Langkah selanjutnya:**\n1. Konsultasi dengan dosen pembimbing PKL\n2. Cari tempat magang/instansi\n3. Ajukan proposal PKL ke program studi\n4. Dapatkan surat pengantar dari fakultas", source:"Panduan PKL UNILA 2024" },
    { rule_id:"R028", category:"PKL", priority:2, conditions:[{field:"sks_lulus",op:"<",val:80}], result:{boleh_pkl:false}, template:"❌ **Belum memenuhi syarat PKL**\n\nSKS lulus Anda: **{sks_lulus} SKS**\nSyarat minimal: **80 SKS**\nKekurangan: **{80-sks_lulus} SKS**\n\nSelesaikan mata kuliah hingga mencapai 80 SKS terlebih dahulu.", source:"Panduan PKL UNILA 2024" },
    { rule_id:"R029", category:"PKL", priority:1, conditions:[], result:{pkl_durasi:true}, template:"⏱️ **Durasi PKL/Magang**\n\nPKL dilaksanakan selama **minimal 1 bulan (4 minggu kerja efektif)** atau **160 jam kerja** di instansi/perusahaan.\n\n**Catatan:**\n• Hari libur/weekend tidak dihitung\n• Beberapa program studi mensyaratkan 2-3 bulan\n• Durasi dapat disesuaikan dengan kebijakan instansi", source:"Panduan PKL UNILA 2024" },
    { rule_id:"R029A", category:"PKL", priority:1, conditions:[], result:{pkl_sks:true}, template:"📚 **Bobot SKS PKL**\n\nPKL memberikan bobot **2-4 SKS** tergantung program studi:\n• Teknik: 3-4 SKS\n• Ekonomi/Bisnis: 2-3 SKS\n• MIPA: 2-3 SKS\n• Pertanian: 3-4 SKS\n• Ilmu Sosial: 2 SKS\n\nNilai PKL diperhitungkan dalam IPK.", source:"Panduan PKL UNILA 2024" },
    { rule_id:"R029B", category:"PKL", priority:1, conditions:[], result:{pkl_tempat:true}, template:"🏢 **Tempat PKL yang Direkomendasikan**\n\n**Instansi Pemerintah:**\n• Kementerian/Lembaga\n• Pemerintah Daerah\n• BUMN/BUMD\n\n**Swasta:**\n• Perusahaan nasional/multinasional\n• Startup teknologi\n• Industri manufaktur\n• Perbankan dan keuangan\n\n**Syarat:** Instansi harus relevan dengan bidang studi dan disetujui program studi.", source:"Panduan PKL UNILA 2024" },
    { rule_id:"R029C", category:"PKL", priority:1, conditions:[], result:{pkl_dokumen:true}, template:"📄 **Dokumen PKL yang Diperlukan**\n\n**Sebelum PKL:**\n1. Proposal PKL\n2. Surat pengantar dari fakultas\n3. CV dan transkrip nilai\n4. Surat persetujuan instansi\n\n**Setelah PKL:**\n1. Laporan PKL (buku)\n2. Logbook kegiatan harian\n3. Sertifikat/surat keterangan dari instansi\n4. Lembar penilaian dari pembimbing lapangan\n5. Form penilaian dari dosen pembimbing", source:"Panduan PKL UNILA 2024" },
    { rule_id:"R029D", category:"PKL", priority:1, conditions:[], result:{pkl_pembimbing:true}, template:"👨‍🏫 **Pembimbingan PKL**\n\nSetiap mahasiswa PKL mendapat **2 pembimbing:**\n\n1. **Dosen Pembimbing** (dari kampus)\n   • Membimbing penyusunan proposal dan laporan\n   • Melakukan monitoring\n   • Menilai laporan akhir\n\n2. **Pembimbing Lapangan** (dari instansi)\n   • Membimbing kegiatan di lapangan\n   • Menilai kinerja harian\n   • Memberikan sertifikat/penilaian", source:"Panduan PKL UNILA 2024" },
    { rule_id:"R029E", category:"PKL", priority:1, conditions:[], result:{pkl_biaya:true}, template:"💰 **Biaya PKL**\n\nBiaya PKL **sudah termasuk dalam UKT** semester berjalan.\n\n**Biaya tambahan yang mungkin timbul:**\n• Transportasi ke lokasi PKL (ditanggung mahasiswa)\n• Akomodasi jika di luar kota\n• Penjilidan laporan PKL\n• Fotokopi dokumen\n\n**Catatan:** Beberapa instansi memberikan uang saku/transport untuk peserta PKL.", source:"Panduan PKL UNILA 2024" },

    // === YUDISIUM ===
    { rule_id:"R030", category:"Yudisium", priority:1, conditions:[{field:"sks_lulus",op:">=",val:144},{field:"ipk",op:">=",val:2.0},{field:"skripsi",op:"==",val:true},{field:"kkn",op:"==",val:true}], result:{boleh_yudisium:true}, template:"Semua syarat yudisium terpenuhi (SKS ≥144, IPK ≥2.00, skripsi lulus, KKN selesai). **Anda dapat mendaftar yudisium**.", source:"Peraturan Akademik UNILA 2025 Pasal 76" },
    { rule_id:"R031", category:"Yudisium", priority:2, conditions:[{field:"sks_lulus",op:"<",val:144}], result:{boleh_yudisium:false}, template:"SKS lulus {sks_lulus} < 144. **Belum memenuhi syarat yudisium**. Selesaikan seluruh beban SKS program studi.", source:"Peraturan Akademik UNILA 2025 Pasal 42" },
    { rule_id:"R032", category:"Yudisium", priority:1, conditions:[{field:"ipk",op:">",val:3.50},{field:"sks_lulus",op:">=",val:144}], result:{predikat:"Dengan Pujian (Cum Laude)"}, template:"IPK {ipk} > 3.50 dengan SKS ≥144 dan lulus ≤8 semester. Predikat kelulusan: **Dengan Pujian (Cum Laude)** 🏆", source:"Peraturan Akademik UNILA 2025 Pasal 77" },
    { rule_id:"R033", category:"Yudisium", priority:2, conditions:[{field:"ipk",op:">=",val:3.01},{field:"ipk",op:"<=",val:3.50}], result:{predikat:"Sangat Memuaskan"}, template:"IPK {ipk} antara 3.01–3.50. Predikat kelulusan: **Sangat Memuaskan** ✨", source:"Peraturan Akademik UNILA 2025 Pasal 77" },
    { rule_id:"R034", category:"Yudisium", priority:3, conditions:[{field:"ipk",op:">=",val:2.76},{field:"ipk",op:"<",val:3.01}], result:{predikat:"Memuaskan"}, template:"IPK {ipk} antara 2.76–3.00. Predikat kelulusan: **Memuaskan**.", source:"Peraturan Akademik UNILA 2025 Pasal 77" },
    { rule_id:"R035", category:"Yudisium", priority:4, conditions:[{field:"ipk",op:">=",val:2.0},{field:"ipk",op:"<",val:2.76}], result:{predikat:"Cukup"}, template:"IPK {ipk} antara 2.00–2.75. Predikat kelulusan: **Cukup**.", source:"Peraturan Akademik UNILA 2025 Pasal 77" },

    // === WISUDA ===
    { rule_id:"R036", category:"Wisuda", priority:1, conditions:[{field:"yudisium",op:"==",val:true}], result:{boleh_wisuda:true}, template:"Setelah yudisium dinyatakan lulus, **Anda berhak mendaftar wisuda** pada periode wisuda berikutnya.", source:"Peraturan Akademik UNILA 2025 Bab X" },
    { rule_id:"R037", category:"Wisuda", priority:1, conditions:[], result:{wisuda_periode:true}, template:"Wisuda UNILA diselenggarakan **2-3 kali per tahun**. Jadwal wisuda diumumkan melalui website resmi UNILA.", source:"Peraturan Akademik UNILA 2025 Bab X" },
    { rule_id:"R038", category:"Wisuda", priority:1, conditions:[], result:{dokumen_wisuda:true}, template:"Dokumen wisuda yang diperlukan: ijazah sementara, pas foto resmi, kwitansi pembayaran wisuda, dan formulir pendaftaran wisuda dari BAAK.", source:"Peraturan Akademik UNILA 2025 Bab X" },

    // === REGISTRASI & HERREGISTRASI ===
    { rule_id:"R039", category:"Registrasi", priority:1, conditions:[], result:{waktu_registrasi:true}, template:"📅 **Jadwal Registrasi/Herregistrasi**\n\nRegistrasi dilakukan pada **awal setiap semester** sesuai kalender akademik UNILA:\n\n**Semester Ganjil:** Biasanya Agustus\n**Semester Genap:** Biasanya Februari\n\n⚠️ **Penting:** Mahasiswa yang tidak herregistrasi dianggap **cuti paksa** dan tidak dapat mengikuti perkuliahan.", source:"Peraturan Akademik UNILA 2025 Bab III Pasal 8" },
    { rule_id:"R040", category:"Registrasi", priority:1, conditions:[{field:"administrasi",op:"==",val:false}], result:{tidak_bisa_registrasi:true}, template:"❌ **Administrasi Belum Lunas**\n\nAnda **tidak dapat melakukan herregistrasi** karena administrasi belum lunas.\n\n**Langkah yang harus dilakukan:**\n1. Cek tagihan UKT di portal keuangan UNILA\n2. Lakukan pembayaran melalui bank yang ditunjuk\n3. Tunggu verifikasi pembayaran (1x24 jam)\n4. Lakukan herregistrasi online di SIAKAD\n\n📞 **Hubungi:** BAAK Fakultas atau Bagian Keuangan UNILA", source:"Peraturan Akademik UNILA 2025 Bab III Pasal 9" },
    { rule_id:"R041", category:"Registrasi", priority:1, conditions:[], result:{krs_online:true}, template:"💻 **Pengisian KRS Online**\n\nPengisian KRS dilakukan secara **online melalui SIAKAD UNILA** (siakad.unila.ac.id)\n\n**Tahapan:**\n1. Login ke SIAKAD dengan NIM dan password\n2. Pilih menu 'Pengisian KRS'\n3. Pilih mata kuliah sesuai kurikulum\n4. Perhatikan batas maksimal SKS berdasarkan IPK\n5. Konsultasi dengan Pembimbing Akademik (PA)\n6. Submit KRS dan cetak KRS\n\n**Masa pengisian:** Sesuai kalender akademik (biasanya 1-2 minggu di awal semester)", source:"Peraturan Akademik UNILA 2025 Bab IV Pasal 14" },
    { rule_id:"R041A", category:"Registrasi", priority:1, conditions:[], result:{perubahan_krs:true}, template:"✏️ **Perubahan KRS (PKRS)**\n\nPerubahan/pembatalan KRS dapat dilakukan pada masa **PKRS** (Perubahan KRS):\n\n**Waktu:** 1-2 minggu setelah perkuliahan dimulai\n**Operasi yang bisa dilakukan:**\n• Menambah mata kuliah\n• Membatalkan mata kuliah (drop)\n• Mengubah kelas\n\n⚠️ **Catatan:**\n• Setelah masa PKRS, KRS tidak dapat diubah\n• Pembatalan setelah UTS akan mendapat nilai E\n• Perubahan harus disetujui PA", source:"Peraturan Akademik UNILA 2025 Bab IV Pasal 16" },
    { rule_id:"R041B", category:"Registrasi", priority:1, conditions:[], result:{herregistrasi_syarat:true}, template:"✅ **Syarat Herregistrasi**\n\nUntuk dapat melakukan herregistrasi, mahasiswa harus:\n\n1. **Administrasi Keuangan Lunas**\n   • UKT semester sebelumnya lunas\n   • Tidak ada tunggakan biaya lain\n\n2. **Status Akademik Aktif**\n   • Tidak sedang cuti\n   • Tidak dalam status DO\n   • Tidak sedang skorsing\n\n3. **Dokumen Lengkap**\n   • KTM masih berlaku\n   • Data di SIAKAD ter-update\n\n4. **Persetujuan PA**\n   • Konsultasi dengan Pembimbing Akademik", source:"Peraturan Akademik UNILA 2025 Bab III Pasal 8" },

    // === DROP OUT (DO) ===
    { rule_id:"R042", category:"DO", priority:1, conditions:[{field:"semester",op:">",val:14},{field:"sks_lulus",op:"<",val:144}], result:{resiko_do:true}, template:"⚠️ **Peringatan DO:** Semester {semester} telah melewati batas 14 semester tanpa menyelesaikan studi. Konsultasikan segera dengan Pembimbing Akademik.", source:"Peraturan Akademik UNILA 2025 Pasal 48" },
    { rule_id:"R043", category:"DO", priority:2, conditions:[{field:"ipk",op:"<",val:2.0},{field:"semester",op:">=",val:4}], result:{peringatan_do:true}, template:"⚠️ **IPK {ipk} di bawah 2.00 pada semester {semester}.** Anda mendapat peringatan akademik. Jika tidak meningkat hingga akhir semester ini, berisiko dikenakan DO.", source:"Peraturan Akademik UNILA 2025 Pasal 48" },
    { rule_id:"R044", category:"DO", priority:1, conditions:[{field:"tidak_herregistrasi",op:">=",val:2}], result:{do_administrasi:true}, template:"Tidak melakukan herregistrasi **2 semester berturut-turut** mengakibatkan mahasiswa dikeluarkan (DO) secara administratif.", source:"Peraturan Akademik UNILA 2025 Pasal 48" },
    { rule_id:"R045", category:"DO", priority:1, conditions:[], result:{batas_studi:true}, template:"Batas maksimal masa studi di UNILA adalah **14 semester** (7 tahun) untuk program S1. Tidak termasuk masa cuti yang diizinkan.", source:"Peraturan Akademik UNILA 2025 Pasal 48" },

    // === CUTI AKADEMIK ===
    { rule_id:"R046", category:"Cuti", priority:1, conditions:[{field:"semester",op:">=",val:2}], result:{boleh_cuti:true}, template:"Mahasiswa mulai **semester 2** dapat mengajukan cuti akademik dengan persetujuan Dekan.", source:"Peraturan Akademik UNILA 2025 Pasal 47" },
    { rule_id:"R047", category:"Cuti", priority:1, conditions:[], result:{max_cuti:true}, template:"Cuti akademik diizinkan maksimal **2 semester** (tidak berturut-turut). Masa cuti tidak dihitung dalam batas studi.", source:"Peraturan Akademik UNILA 2025 Pasal 47" },
    { rule_id:"R048", category:"Cuti", priority:1, conditions:[{field:"semester",op:"==",val:1}], result:{boleh_cuti:false}, template:"Mahasiswa **semester 1 tidak diperkenankan** mengajukan cuti akademik.", source:"Peraturan Akademik UNILA 2025 Pasal 47" },
    { rule_id:"R049", category:"Cuti", priority:1, conditions:[], result:{prosedur_cuti:true}, template:"Prosedur cuti: (1) Isi formulir cuti di BAAK, (2) Persetujuan PA dan Ketua Program Studi, (3) Persetujuan Dekan, (4) Surat Keputusan Rektor.", source:"Peraturan Akademik UNILA 2025 Pasal 47" },
    { rule_id:"R050", category:"Cuti", priority:1, conditions:[], result:{ukt_cuti:true}, template:"Selama cuti akademik, mahasiswa dibebaskan dari kewajiban membayar UKT penuh namun mungkin dikenakan biaya administrasi cuti.", source:"Peraturan Akademik UNILA 2025 Pasal 47" },

    // === IPK TAMBAHAN ===
    { rule_id:"R051", category:"IPK", priority:1, conditions:[{field:"ipk",op:">",val:3.50}], result:{status_ipk:"Sangat Baik (Cum Laude)"}, template:"IPK {ipk} termasuk kategori **Sangat Baik** dan memenuhi predikat Cum Laude jika menyelesaikan studi ≤8 semester.", source:"Peraturan Akademik UNILA 2025 Pasal 77" },
    { rule_id:"R052", category:"IPK", priority:2, conditions:[{field:"ipk",op:">=",val:3.0},{field:"ipk",op:"<",val:3.51}], result:{status_ipk:"Baik"}, template:"IPK {ipk} termasuk kategori **Baik**. Pertahankan dan tingkatkan untuk meraih predikat Cum Laude.", source:"Peraturan Akademik UNILA 2025 Pasal 77" },
    { rule_id:"R053", category:"IPK", priority:3, conditions:[{field:"ipk",op:">=",val:2.0},{field:"ipk",op:"<",val:3.0}], result:{status_ipk:"Cukup"}, template:"IPK {ipk} termasuk kategori **Cukup**. Upayakan peningkatan IPK untuk memperluas kesempatan SKS dan kelulusan.", source:"Peraturan Akademik UNILA 2025 Pasal 77" },
    { rule_id:"R054", category:"IPK", priority:4, conditions:[{field:"ipk",op:"<",val:2.0}], result:{status_ipk:"Kurang - Perlu Bimbingan"}, template:"⚠️ IPK {ipk} di bawah 2.00. Status: **Perlu Bimbingan**. Segera konsultasikan dengan Pembimbing Akademik (PA) Anda.", source:"Peraturan Akademik UNILA 2025 Pasal 48" },

    // === NILAI AKADEMIK ===
    { rule_id:"R055", category:"Nilai", priority:1, conditions:[], result:{skala_nilai:true}, template:"Skala nilai UNILA: A (4.0/≥76), B+ (3.5/71-75,99), B (3.0/66-70,99), C+ (2.5/61-65,99), C (2.0/56-60,99), D (1.0/50-55,99), E (0.0/<50).", source:"Peraturan Akademik UNILA 2025 Pasal 41 ayat (3)" },
    { rule_id:"R056", category:"Nilai", priority:1, conditions:[], result:{nilai_minimal_lulus:true}, template:"Nilai minimal **lulus** untuk suatu mata kuliah adalah C (2.0). Nilai D dan E dinyatakan tidak lulus dan harus diulang.", source:"Peraturan Akademik UNILA 2025 Bab V Pasal 18" },
    { rule_id:"R057", category:"Nilai", priority:1, conditions:[], result:{perbaikan_nilai:true}, template:"Perbaikan nilai hanya bisa dilakukan pada **Semester Pendek atau semester regular** dengan mendaftar ulang mata kuliah tersebut. Nilai tertinggi yang berlaku.", source:"Peraturan Akademik UNILA 2025 Bab V Pasal 19" },
    { rule_id:"R058", category:"Nilai", priority:1, conditions:[], result:{transkrip:true}, template:"Transkrip sementara dapat dicetak mandiri melalui **SIAKAD UNILA**. Transkrip resmi diterbitkan oleh BAAK dengan tanda tangan Dekan/Rektor.", source:"Peraturan Akademik UNILA 2025 Bab V Pasal 20" },

    // === PEMBIMBING AKADEMIK ===
    { rule_id:"R059", category:"PA", priority:1, conditions:[], result:{fungsi_pa:true}, template:"Pembimbing Akademik (PA) bertugas membimbing mahasiswa dalam: perencanaan studi, pemilihan mata kuliah, penyelesaian masalah akademik, dan konsultasi permasalahan studi.", source:"Peraturan Akademik UNILA 2025 Bab II Pasal 6" },
    { rule_id:"R060", category:"PA", priority:1, conditions:[], result:{konsultasi_pa:true}, template:"Konsultasi dengan PA dilakukan **minimal 2 kali per semester**: awal semester (pengisian KRS) dan akhir semester (evaluasi hasil studi).", source:"Peraturan Akademik UNILA 2025 Bab II Pasal 7" },

    // === UKT & KEUANGAN ===
    { rule_id:"R061", category:"Keuangan", priority:1, conditions:[], result:{ukt_info:true}, template:"UKT (Uang Kuliah Tunggal) dibayarkan **satu kali per semester** sesuai golongan yang telah ditetapkan saat seleksi masuk. UKT tidak berubah selama studi normal.", source:"Peraturan Akademik UNILA 2025 Bab III Pasal 10" },
    { rule_id:"R062", category:"Keuangan", priority:1, conditions:[], result:{cicilan_ukt:true}, template:"Mahasiswa yang kesulitan membayar UKT dapat mengajukan **keringanan atau cicilan UKT** melalui Direktorat Kemahasiswaan UNILA dengan melampirkan dokumen pendukung.", source:"Peraturan Akademik UNILA 2025 Bab III Pasal 11" },
    { rule_id:"R063", category:"Keuangan", priority:1, conditions:[], result:{beasiswa:true}, template:"UNILA menyediakan berbagai beasiswa: KIP-K, Bidikmisi, beasiswa prestasi, beasiswa Peningkatan Prestasi Akademik (PPA), dan beasiswa dari mitra industri.", source:"Peraturan Akademik UNILA 2025 Bab III Pasal 12" },

    // === ADMINISTRASI AKADEMIK ===
    { rule_id:"R064", category:"Administrasi", priority:1, conditions:[], result:{surat_keterangan:true}, template:"Surat keterangan mahasiswa aktif dapat diajukan ke **BAAK Fakultas** dengan membawa KTM dan bukti herregistrasi semester berjalan.", source:"Peraturan Akademik UNILA 2025 Bab XIII Pasal 80" },
    { rule_id:"R065", category:"Administrasi", priority:1, conditions:[], result:{ktm:true}, template:"KTM (Kartu Tanda Mahasiswa) diterbitkan saat pertama kali registrasi. KTM yang hilang dapat diurus melalui BAAK dengan membawa laporan kehilangan dari kepolisian.", source:"Peraturan Akademik UNILA 2025 Bab XIII Pasal 81" },
    { rule_id:"R066", category:"Administrasi", priority:1, conditions:[], result:{legalisir:true}, template:"Legalisir dokumen akademik dilakukan di **BAAK Fakultas** masing-masing. Biaya legalisir sesuai ketentuan yang berlaku.", source:"Peraturan Akademik UNILA 2025 Bab XIII Pasal 82" },

    // === PINDAH PROGRAM STUDI ===
    { rule_id:"R067", category:"PindahProdi", priority:1, conditions:[{field:"semester",op:">=",val:2},{field:"semester",op:"<=",val:4}], result:{boleh_pindah_prodi:true}, template:"Perpindahan program studi dapat diajukan pada **semester 2-4** dengan memenuhi syarat akademik program studi tujuan.", source:"Peraturan Akademik UNILA 2025 Bab XIV Pasal 85" },
    { rule_id:"R068", category:"PindahProdi", priority:2, conditions:[{field:"semester",op:">",val:4}], result:{boleh_pindah_prodi:false}, template:"Semester {semester} > 4. **Perpindahan program studi tidak dimungkinkan** setelah melewati semester 4.", source:"Peraturan Akademik UNILA 2025 Bab XIV Pasal 85" },

    // === MAHASISWA ASING ===
    { rule_id:"R069", category:"MahasiswaAsing", priority:1, conditions:[], result:{ekuivalensi:true}, template:"Mahasiswa transfer/asing wajib mengikuti proses **ekuivalensi mata kuliah** yang diproses oleh Tim Akademik Fakultas sebelum semester pertama.", source:"Peraturan Akademik UNILA 2025 Bab XV Pasal 90" },

    // === PELAKSANAAN UJIAN ===
    { rule_id:"R070", category:"Ujian", priority:1, conditions:[], result:{tata_tertib_ujian:true}, template:"Selama ujian: wajib membawa KTM, hadir tepat waktu, tidak mencontek, mematikan HP, dan mematuhi semua tata tertib ruang ujian.", source:"Peraturan Akademik UNILA 2025 Bab VI Pasal 24" },
    { rule_id:"R071", category:"Ujian", priority:1, conditions:[], result:{keterlambatan_ujian:true}, template:"Mahasiswa yang terlambat lebih dari **30 menit** tidak diizinkan mengikuti ujian. Hadir tepat waktu adalah kewajiban.", source:"Peraturan Akademik UNILA 2025 Bab VI Pasal 23" },
    { rule_id:"R072", category:"Ujian", priority:1, conditions:[], result:{kecurangan_ujian:true}, template:"Mahasiswa yang terbukti melakukan kecurangan dalam ujian akan mendapat nilai **E (nol)** dan dapat dikenakan sanksi akademik lebih lanjut.", source:"Peraturan Akademik UNILA 2025 Bab VI Pasal 25" },

    // === BEBAN STUDI TAMBAHAN ===
    { rule_id:"R073", category:"SKS", priority:1, conditions:[{field:"semester",op:">=",val:7},{field:"ipk",op:">=",val:3.0},{field:"sks_lulus",op:">=",val:100}], result:{boleh_24_sks:true}, template:"Semester {semester} dengan IPK ≥3.00 dan SKS lulus ≥100: **Anda layak mengambil 24 SKS** untuk percepatan kelulusan.", source:"Peraturan Akademik UNILA 2025 Bab IV Pasal 15" },
    { rule_id:"R074", category:"SKS", priority:1, conditions:[], result:{min_sks_lulus:true}, template:"Total SKS yang harus diselesaikan untuk lulus S1 di UNILA umumnya antara **144-160 SKS** tergantung program studi.", source:"Peraturan Akademik UNILA 2025 Bab IV Pasal 11" },

    // === PROGRAM MERDEKA BELAJAR ===
    { rule_id:"R075", category:"MBKM", priority:1, conditions:[{field:"semester",op:">=",val:5},{field:"ipk",op:">=",val:2.5}], result:{boleh_mbkm:true}, template:"Mahasiswa semester ≥5 dengan IPK ≥2.50 dapat mengikuti program **Merdeka Belajar-Kampus Merdeka (MBKM)** seperti magang, studi independen, atau pertukaran mahasiswa.", source:"Panduan MBKM UNILA 2022" },
    { rule_id:"R076", category:"MBKM", priority:1, conditions:[], result:{sks_mbkm:true}, template:"Kegiatan MBKM dapat dikonversi hingga **20 SKS** per semester, setara dengan beban studi reguler penuh.", source:"Panduan MBKM UNILA 2022 Pasal 5" },
    { rule_id:"R077", category:"MBKM", priority:1, conditions:[], result:{jenis_mbkm:true}, template:"Jenis kegiatan MBKM yang diakui: (1) Magang/Praktik Kerja, (2) Studi/Proyek Independen, (3) Pertukaran Mahasiswa, (4) Asistensi Mengajar, (5) Proyek Kemanusiaan, (6) Wirausaha, (7) KKN Tematik.", source:"Panduan MBKM UNILA 2022 Pasal 3" },

    // === KALENDER AKADEMIK ===
    { rule_id:"R078", category:"Kalender", priority:1, conditions:[], result:{semester_ganjil:true}, template:"Semester Ganjil berlangsung antara **bulan Agustus hingga Januari**. Registrasi, perkuliahan, UTS, UAS, dan pengumuman nilai dilaksanakan dalam periode ini.", source:"Kalender Akademik UNILA" },
    { rule_id:"R079", category:"Kalender", priority:1, conditions:[], result:{semester_genap:true}, template:"Semester Genap berlangsung antara **bulan Februari hingga Juli**. Semester Pendek biasanya diselenggarakan pada bulan Juli-Agustus.", source:"Kalender Akademik UNILA" },

    // === ETIKA AKADEMIK ===
    { rule_id:"R080", category:"Etika", priority:1, conditions:[], result:{plagiarisme:true}, template:"Plagiarisme dalam tugas, laporan, atau skripsi dikenakan sanksi berat: nilai nol, pengulangan mata kuliah, hingga **pencabutan gelar**. Gunakan software anti-plagiat seperti Turnitin.", source:"Peraturan Akademik UNILA 2025 Bab XVI Pasal 95" },
    { rule_id:"R081", category:"Etika", priority:1, conditions:[], result:{etika_kampus:true}, template:"Mahasiswa UNILA wajib menjaga etika akademik: jujur dalam ujian, menghormati dosen dan civitas akademika, berpakaian sopan, dan menjaga nama baik universitas.", source:"Peraturan Akademik UNILA 2025 Bab XVI Pasal 94" },

    // === ORIENTASI & PENGENALAN ===
    { rule_id:"R082", category:"Orientasi", priority:1, conditions:[{field:"semester",op:"==",val:1}], result:{pkkmb:true}, template:"Mahasiswa baru semester 1 wajib mengikuti **PKKMB (Pengenalan Kehidupan Kampus Mahasiswa Baru)** sebagai syarat aktivasi status mahasiswa.", source:"Peraturan Akademik UNILA 2025 Bab I Pasal 3" },

    // === GELAR & IJAZAH ===
    { rule_id:"R083", category:"Ijazah", priority:1, conditions:[{field:"yudisium",op:"==",val:true}], result:{ijazah_info:true}, template:"Ijazah dan transkrip resmi diterbitkan **1-3 bulan** setelah yudisium. Sementara menunggu, gunakan Surat Keterangan Lulus (SKL) untuk keperluan administrasi.", source:"Peraturan Akademik UNILA 2025 Bab XI Pasal 73" },
    { rule_id:"R084", category:"Ijazah", priority:1, conditions:[], result:{gelar:true}, template:"Gelar akademik untuk program S1 UNILA: **Sarjana (S.xxx)** sesuai bidang ilmu. Contoh: S.T (Teknik), S.E (Ekonomi), S.H (Hukum), dll.", source:"Peraturan Akademik UNILA 2025 Bab XI Pasal 68" },

    // === SKRIPSI LANJUTAN ===
    { rule_id:"R085", category:"Skripsi", priority:1, conditions:[], result:{seminar_proposal:true}, template:"Sebelum penelitian skripsi, mahasiswa wajib melaksanakan **Seminar Proposal** yang dihadiri minimal 10 mahasiswa aktif dan disetujui pembimbing.", source:"Peraturan Akademik UNILA 2025 Bab IX Pasal 47" },
    { rule_id:"R086", category:"Skripsi", priority:1, conditions:[], result:{sidang_skripsi:true}, template:"Sidang Skripsi (Ujian Komprehensif) dilaksanakan di hadapan **3-5 penguji**. Nilai sidang adalah gabungan penilaian seluruh penguji.", source:"Peraturan Akademik UNILA 2025 Bab IX Pasal 48" },
    { rule_id:"R087", category:"Skripsi", priority:1, conditions:[], result:{pembimbing_skripsi:true}, template:"Setiap mahasiswa berhak mendapat **2 dosen pembimbing skripsi**: Pembimbing I (ahli bidang utama) dan Pembimbing II (ahli bidang pendukung/metodologi).", source:"Peraturan Akademik UNILA 2025 Bab IX Pasal 44" },

    // === PROGRAM DOKTOR/MAGISTER (REFERENSI) ===
    { rule_id:"R088", category:"Pascasarjana", priority:1, conditions:[], result:{s2_info:true}, template:"Program Magister (S2) UNILA memiliki beban studi 36-48 SKS dengan masa studi maksimal **8 semester (4 tahun)**.", source:"Panduan Akademik Pascasarjana UNILA" },
    { rule_id:"R089", category:"Pascasarjana", priority:1, conditions:[], result:{s3_info:true}, template:"Program Doktor (S3) UNILA memiliki beban studi 42-48 SKS dengan masa studi maksimal **10 semester (5 tahun)**.", source:"Panduan Akademik Pascasarjana UNILA" },

    // === EKUIVALENSI & KONVERSI ===
    { rule_id:"R090", category:"Ekuivalensi", priority:1, conditions:[], result:{ekuivalensi_info:true}, template:"Konversi nilai dari skala 100 ke 4.0: 85-100→A(4.0), 80-84→B+(3.5), 70-79→B(3.0), 65-69→C+(2.5), 56-64→C(2.0), 41-55→D(1.0), 0-40→E(0).", source:"Peraturan Akademik UNILA 2025 Pasal 41 ayat (3)" },

    // === SERTIFIKASI & KOMPETENSI ===
    { rule_id:"R091", category:"Sertifikasi", priority:1, conditions:[], result:{sertifikasi_info:true}, template:"Sertifikat kompetensi dari lembaga terakreditasi dapat diakui sebagai **pengganti mata kuliah** tertentu melalui proses asesmen RPL (Rekognisi Pembelajaran Lampau) di program studi.", source:"Panduan MBKM UNILA 2022 Pasal 8" },

    // === PROGRAM INTERNASIONAL ===
    { rule_id:"R092", category:"Internasional", priority:1, conditions:[{field:"ipk",op:">=",val:3.0},{field:"semester",op:">=",val:3}], result:{boleh_exchange:true}, template:"Mahasiswa dengan IPK ≥3.00 dan minimal semester 3 dapat mendaftar program **Student Exchange internasional** yang bermitra dengan UNILA.", source:"Panduan MBKM UNILA 2022 Pasal 9" },

    // === KONSELING & KESEHATAN ===
    { rule_id:"R093", category:"Kesehatan", priority:1, conditions:[], result:{konseling:true}, template:"UNILA menyediakan layanan **Konseling Akademik dan Psikologi** melalui Unit Layanan Konseling Kemahasiswaan (ULK). Mahasiswa dapat konsultasi gratis.", source:"Panduan Kemahasiswaan UNILA" },

    // === ORGANISASI MAHASISWA ===
    { rule_id:"R094", category:"Kemahasiswaan", priority:1, conditions:[], result:{ormawa:true}, template:"Kegiatan di ORMAWA (Organisasi Mahasiswa) dapat dikonversi menjadi nilai akademik melalui mekanisme **Surat Keterangan Pendamping Ijazah (SKPI)** dan kredit kegiatan kemahasiswaan.", source:"Panduan Kemahasiswaan UNILA Pasal 15" },

    // === KURIKULUM ===
    { rule_id:"R095", category:"Kurikulum", priority:1, conditions:[], result:{kurikulum_info:true}, template:"Kurikulum UNILA mengacu pada **KKNI (Kerangka Kualifikasi Nasional Indonesia)** level 6 untuk S1, yang mencakup kompetensi utama, pendukung, dan lainnya.", source:"Peraturan Akademik UNILA 2025 Bab IV Pasal 10" },
    { rule_id:"R096", category:"Kurikulum", priority:1, conditions:[], result:{matakuliah_wajib:true}, template:"Mata kuliah wajib universitas UNILA meliputi: Agama, Pancasila, Kewarganegaraan, Bahasa Indonesia, dan Bahasa Inggris. Total ±10 SKS dan wajib lulus minimal C.", source:"Peraturan Akademik UNILA 2025 Bab IV Pasal 10" },

    // === PERPUSTAKAAN ===
    { rule_id:"R097", category:"Perpustakaan", priority:1, conditions:[], result:{perpus:true}, template:"Akses perpustakaan UNILA menggunakan KTM aktif. Mahasiswa dapat meminjam maksimal **3 buku selama 1 minggu**. Denda keterlambatan Rp 500/hari/buku.", source:"Peraturan Perpustakaan UNILA" },

    // === TUGAS AKHIR ALTERNATIF ===
    { rule_id:"R098", category:"TugasAkhir", priority:1, conditions:[], result:{ta_alternatif:true}, template:"Beberapa program studi di UNILA mengizinkan **Tugas Akhir alternatif** selain skripsi: laporan magang (PKL), artikel jurnal ilmiah, atau proyek akhir terapan.", source:"Peraturan Akademik UNILA 2025 Bab IX Pasal 43" },

    // === SISTEM INFORMASI AKADEMIK ===
    { rule_id:"R099", category:"SIAKAD", priority:1, conditions:[], result:{siakad:true}, template:"SIAKAD UNILA (siakad.unila.ac.id) adalah portal resmi untuk: pengisian KRS, melihat jadwal kuliah, melihat nilai, cetak transkrip sementara, dan informasi akademik lainnya.", source:"Panduan SIAKAD UNILA" },

    // === MAHASISWA BERKEBUTUHAN KHUSUS ===
    { rule_id:"R100", category:"Inklusif", priority:1, conditions:[], result:{difabel:true}, template:"UNILA memberikan **akomodasi khusus** bagi mahasiswa berkebutuhan khusus (difabel), termasuk layanan ujian terpisah, akses fasilitas, dan pendampingan akademik. Hubungi Direktorat Kemahasiswaan.", source:"Peraturan Akademik UNILA 2025 Bab XVII Pasal 100" },

    // BONUS RULES 101-110
    { rule_id:"R101", category:"Nilai", priority:1, conditions:[{field:"ipk",op:">=",val:3.51},{field:"tidak_nilai_d",op:"==",val:true},{field:"tidak_nilai_e",op:"==",val:true}], result:{cumlaude_valid:true}, template:"Untuk predikat Cum Laude yang sah, IPK harus ≥3.51 **tanpa nilai D atau E** dalam transkrip dan menyelesaikan studi dalam waktu normal (≤8 semester).", source:"Peraturan Akademik UNILA 2025 Pasal 77" },
    { rule_id:"R102", category:"Skripsi", priority:1, conditions:[], result:{max_waktu_skripsi:true}, template:"Masa pengerjaan skripsi maksimal adalah **2 semester** sejak judul disetujui. Jika melebihi batas, mahasiswa harus mengganti judul dan pembimbing.", source:"Peraturan Akademik UNILA 2025" },
    { rule_id:"R103", category:"DO", priority:1, conditions:[{field:"ipk",op:"<",val:1.0},{field:"semester",op:">=",val:2}], result:{do_sangat_beresiko:true}, template:"🚨 **KRITIS:** IPK {ipk} sangat rendah (< 1.00). Segera temui Pembimbing Akademik, Ketua Program Studi, dan Wakil Dekan Bidang Akademik untuk evaluasi darurat.", source:"Peraturan Akademik UNILA 2025 Pasal 48" },
    { rule_id:"R104", category:"DO", priority:1, conditions:[{field:"semester",op:"==",val:4},{field:"sks_lulus",op:"<",val:40}], result:{resiko_do:true}, template:"⚠️ **PERINGATAN PUTUS STUDI**: Semester IV dengan SKS lulus < 40 atau IPK < 2.00 berisiko dikenakan putus studi.", source:"Peraturan Akademik UNILA 2025 Pasal 48" },
    { rule_id:"R105", category:"DO", priority:1, conditions:[{field:"semester",op:"==",val:8},{field:"sks_lulus",op:"<",val:80}], result:{resiko_do:true}, template:"⚠️ **PERINGATAN PUTUS STUDI**: Semester VIII dengan SKS lulus < 80 atau IPK < 2.00 berisiko dikenakan putus studi.", source:"Peraturan Akademik UNILA 2025 Pasal 48" },
  
  ],

  intents: [
    { id:"maksimal_sks", patterns:["berapa sks","maksimal sks","ambil sks","jumlah sks","sks semester","sks bisa diambil","beban sks","limit sks"], facts_needed:["ipk"], category:"SKS" },
    { id:"syarat_uas", patterns:["syarat uas","ikut uas","boleh uas","ujian akhir semester","uas bisa","kehadiran uas","presensi uas","kehadiran saya uas","presensi saya uas","kehadiran uas saya","presensi uas saya"], facts_needed:["presensi","administrasi"], category:"UAS" },
    { id:"syarat_uts", patterns:["syarat uts","ikut uts","boleh uts","ujian tengah semester","uts bisa","kehadiran uts"], facts_needed:["presensi"], category:"UTS" },
    { id:"cuti", patterns:["cuti akademik","izin cuti","mengajukan cuti","prosedur cuti","syarat cuti","cuti kuliah","cuti studi"], facts_needed:["semester"], category:"Cuti" },
    { id:"semester_pendek", patterns:["semester pendek","sp kuliah","kuliah sp","daftar sp","semester pendek bisa","ambil sp"], facts_needed:["ipk","semester"], category:"SemesterPendek" },
    { id:"skripsi", patterns:["skripsi","tugas akhir","pengajuan skripsi","syarat skripsi","daftar skripsi","sidang skripsi","seminar proposal"], facts_needed:["sks_lulus","ipk"], category:"Skripsi" },
    { id:"yudisium", patterns:["yudisium","syarat yudisium","daftar yudisium","wisuda yudisium","kelulusan","lulus kuliah"], facts_needed:["sks_lulus","ipk","skripsi","kkn"], category:"Yudisium" },
    { id:"wisuda", patterns:["wisuda","daftar wisuda","kapan wisuda","upacara wisuda","jadwal wisuda"], facts_needed:["yudisium"], category:"Wisuda" },
    { id:"registrasi", patterns:["registrasi","herregistrasi","daftar ulang","krs","pengisian krs","isi krs","update krs"], facts_needed:["administrasi"], category:"Registrasi" },
    { id:"drop_out", patterns:["do","drop out","dikeluarkan","ancaman do","beresiko do","batas studi","maksimal semester"], facts_needed:["semester","ipk","sks_lulus"], category:"DO" },
    { id:"kkn", patterns:["kkn","kuliah kerja nyata","syarat kkn","daftar kkn","program kkn","mengikuti kkn","ikut kkn","persyaratan kkn"], facts_needed:["sks_lulus","ipk","semester"], category:"KKN" },
    { id:"pkl", patterns:["pkl","praktik kerja lapangan","magang","syarat pkl","daftar pkl","program magang","kp","kerja praktik","mengikuti pkl","ikut pkl","persyaratan pkl","syarat kp","mengikuti kp"], facts_needed:["sks_lulus","semester"], category:"PKL" },
    { id:"nilai", patterns:["nilai","sistem nilai","skala nilai","huruf mutu","indeks prestasi","ip semester"], facts_needed:[], category:"Nilai" },
    { id:"ipk", patterns:["ipk","indeks prestasi kumulatif","status ipk","kategori ipk","ipk saya"], facts_needed:["ipk"], category:"IPK" },
    { id:"predikat", patterns:["predikat","cumlaude","cum laude","sangat memuaskan","predikat kelulusan","gelar kehormatan"], facts_needed:["ipk"], category:"Yudisium" },
    { id:"mbkm", patterns:["mbkm","merdeka belajar","kampus merdeka","magang mbkm","studi independen","exchange"], facts_needed:["ipk","semester"], category:"MBKM" },
    { id:"kehadiran", patterns:["kehadiran","absensi","presensi","hadir kuliah","bolos","izin kuliah","kehadiran saya","presensi saya","kehadiran kuliah","presensi kuliah"], facts_needed:["presensi"], category:"Kehadiran" },
    { id:"administrasi", patterns:["administrasi","surat keterangan","ktm","legalisir","baak","dokumen"], facts_needed:[], category:"Administrasi" },
    { id:"keuangan", patterns:["ukt","biaya kuliah","pembayaran","keuangan","beasiswa","cicilan ukt"], facts_needed:[], category:"Keuangan" },
    { id:"siakad", patterns:["siakad","sistem informasi akademik","portal akademik","login siakad","website akademik"], facts_needed:[], category:"SIAKAD" },
  ]


};

// ============================================================
// NLP ENGINE - Preprocessing & Intent Detection
// ============================================================
const NLPEngine = {
  stopwords: new Set(["yang","dan","di","ke","dari","ini","itu","atau","juga","saya","aku","kamu","anda","bisa","mau","akan","ada","dengan","untuk","tidak","sudah","belum","saat","pada","oleh","bila","jika","kalau","apakah","bagaimana","berapa","kapan","dimana","siapa","apa","ya","tidak","bukan","harus","perlu","boleh","dapat","bagi","dalam","karena","maka","setelah","sebelum","hingga","sampai","namun","tetapi","tapi","namun","walaupun","meskipun","lagi","pun","punya","nya","pun","lah","kah","gak","nggak","enggak","gimana","dong","nih","sih","deh","loh","lo","gue","gw"]),

  normalize(text) {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  },

  tokenize(text) {
    return text.split(/\s+/).filter(t => t.length > 1);
  },

  removeStopwords(tokens) {
    return tokens.filter(t => !this.stopwords.has(t));
  },

  stem(word) {
    // Simplified Sastrawi-like stemming for Indonesian
    const prefixes = ["me","men","mem","meng","menge","ber","be","pe","pen","pem","peng","penge","ter","ke","se"];
    const suffixes = ["kan","an","i","nya","lah","kah","ku","mu"];
    let w = word;
    for (const suf of suffixes) if (w.endsWith(suf) && w.length > suf.length + 2) { w = w.slice(0, -suf.length); break; }
    for (const pre of prefixes) if (w.startsWith(pre) && w.length > pre.length + 2) { w = w.slice(pre.length); break; }
    return w;
  },

  preprocess(text) {
    const normalized = this.normalize(text);
    const tokens = this.tokenize(normalized);
    const noStop = this.removeStopwords(tokens);
    const stemmed = noStop.map(t => this.stem(t));
    return { normalized, tokens, noStop, stemmed };
  },

  cosineSimilarity(a, b) {
    const setA = new Set(a), setB = new Set(b);
    const intersection = [...setA].filter(x => setB.has(x)).length;
    return intersection / (Math.sqrt(setA.size) * Math.sqrt(setB.size) || 1);
  },

  detectIntent(text) {
  const { stemmed, normalized } = this.preprocess(text); 
  
  // Greeting detection - check if ONLY greeting without academic keywords
  const greetings = ['halo', 'hai', 'hello', 'hi', 'helo', 'selamat pagi', 'selamat siang', 'selamat sore', 'selamat malam', 'assalamualaikum', 'apa kabar'];
  const academicKeywords = ['sks', 'ipk', 'uas', 'uts', 'kehadiran', 'presensi', 'skripsi', 'kkn', 'pkl', 'yudisium', 'wisuda', 'cuti', 'semester', 'nilai', 'ujian', 'kuliah', 'dosen', 'administrasi'];
  
  const hasGreeting = greetings.some(g => normalized.includes(g));
  const hasAcademicKeyword = academicKeywords.some(k => normalized.includes(k));
  
  // Only return greeting intent if it's JUST a greeting without academic context
  if (hasGreeting && !hasAcademicKeyword && normalized.split(/\s+/).length <= 5) {
    return { 
      intent: { id: 'greeting', category: 'General' }, 
      confidence: 1.0 
    };
  }

  let best = null, bestScore = 0;

  for (const intent of KNOWLEDGE_BASE.intents) {
    let score = 0;
    let exactMatches = 0;
    
    for (const pattern of intent.patterns) {
      const pTokens = this.preprocess(pattern).stemmed;
      const sim = this.cosineSimilarity(stemmed, pTokens);
      
      // Check for exact substring match - give very high score
      if (normalized.includes(pattern)) {
        exactMatches++;
        score = Math.max(score, 0.95);
      }
      
      // Check for word-level match
      const patternWords = pattern.split(/\s+/);
      const matchedWords = patternWords.filter(w => normalized.includes(w)).length;
      if (matchedWords > 0) {
        const wordMatchScore = (matchedWords / patternWords.length) * 0.85;
        score = Math.max(score, wordMatchScore);
      }
      
      // Cosine similarity as fallback
      score = Math.max(score, sim * 0.7);
    }
    
    // Boost score if multiple patterns match
    if (exactMatches > 1) score = Math.min(score * 1.2, 1.0);
      
    if (score > bestScore) { 
      bestScore = score; 
      best = intent; 
    }
  }

  return { intent: bestScore > 0.15 ? best : null, confidence: bestScore };
  },

  extractFacts(text) {
    const facts = {};
    const norm = text.toLowerCase();

    // IPK extraction
    const ipkMatch = norm.match(/ipk\s*(?:saya|ku|gue|gw)?\s*(?:adalah|=|:)?\s*(\d+[.,]\d+)/);
    if (ipkMatch) facts.ipk = parseFloat(ipkMatch[1].replace(",","."));
    const ipkMatch2 = norm.match(/(\d+[.,]\d+)\s*(?:itu\s*)?(?:adalah\s*)?ipk/);
    if (ipkMatch2 && !facts.ipk) facts.ipk = parseFloat(ipkMatch2[1].replace(",","."));

    // Semester extraction
    const semMatch = norm.match(/semester\s*(?:ke[-\s]?)?\s*(\d+)/);
    if (semMatch) facts.semester = parseInt(semMatch[1]);
    const semMatch2 = norm.match(/(\d+)\s*(?:[-\s])?semester/);
    if (semMatch2 && !facts.semester) facts.semester = parseInt(semMatch2[1]);

    // SKS lulus extraction
    const sksMatch = norm.match(/(?:sudah\s*)?lulus\s*(\d+)\s*sks/);
    if (sksMatch) facts.sks_lulus = parseInt(sksMatch[1]);
    const sksMatch2 = norm.match(/(\d+)\s*sks\s*(?:sudah\s*)?(?:lulus|selesai|diambil)/);
    if (sksMatch2 && !facts.sks_lulus) facts.sks_lulus = parseInt(sksMatch2[1]);
    const sksMatch3 = norm.match(/sks\s*(?:saya|ku)?\s*(?:sudah|lulus|adalah|=|:)?\s*(\d+)/);
    if (sksMatch3 && !facts.sks_lulus) facts.sks_lulus = parseInt(sksMatch3[1]);

    // Presensi extraction
    const presMatch = norm.match(/(?:kehadiran|presensi|absensi|hadir)\s*(?:saya|ku)?\s*(?:adalah|=|:)?\s*(\d+)%?/);
    if (presMatch) facts.presensi = parseInt(presMatch[1]);
    const presMatch2 = norm.match(/(\d+)%\s*(?:kehadiran|presensi|hadir)/);
    if (presMatch2 && !facts.presensi) facts.presensi = parseInt(presMatch2[1]);

    // Boolean flags
    if (norm.includes("administrasi lunas") || norm.includes("sudah bayar") || norm.includes("ukt lunas")) facts.administrasi = true;
    if (norm.includes("administrasi belum") || norm.includes("belum bayar") || norm.includes("ukt belum")) facts.administrasi = false;
    if (norm.includes("sudah kkn") || norm.includes("kkn selesai") || norm.includes("kkn lulus")) facts.kkn = true;
    if (norm.includes("belum kkn")) facts.kkn = false;
    if (norm.includes("sudah pkl") || norm.includes("pkl selesai")) facts.pkl = true;
    if (norm.includes("sudah skripsi") || norm.includes("skripsi lulus") || norm.includes("sidang lulus")) facts.skripsi = true;
    if (norm.includes("sudah yudisium") || norm.includes("yudisium selesai")) facts.yudisium = true;
    if (norm.includes("sakit")) facts.sakit = true;

    return facts;
  }
};

// ============================================================
// FORWARD CHAINING INFERENCE ENGINE
// ============================================================
const InferenceEngine = {
  evaluateCondition(fact_val, operator, rule_val) {
    if (fact_val === undefined || fact_val === null) return false;
    switch(operator) {
      case ">=": return fact_val >= rule_val;
      case "<=": return fact_val <= rule_val;
      case ">":  return fact_val > rule_val;
      case "<":  return fact_val < rule_val;
      case "==": return fact_val === rule_val;
      case "!=": return fact_val !== rule_val;
      default: return false;
    }
  },

  evaluateRule(rule, facts) {
    if (rule.conditions.length === 0) return true;
    return rule.conditions.every(cond =>
      this.evaluateCondition(facts[cond.field], cond.op, cond.val)
    );
  },

  forwardChain(facts, category = null, limit = 5) {
    const fired = [];
    const sorted = [...KNOWLEDGE_BASE.rules]
      .filter(r => !category || r.category === category)
      .sort((a,b) => {
        // Prioritize rules with more conditions (more specific)
        const condDiff = b.conditions.length - a.conditions.length;
        if (condDiff !== 0) return condDiff;
        return a.priority - b.priority;
      });

    for (const rule of sorted) {
      if (this.evaluateRule(rule, facts)) {
        // Calculate relevance score based on how many facts are used
        const relevanceScore = rule.conditions.length > 0 
          ? rule.conditions.filter(c => facts[c.field] !== undefined).length / rule.conditions.length
          : 0.1; // Low score for rules without conditions
        
        fired.push({
          rule,
          relevanceScore,
          matched_conditions: rule.conditions.map(c => ({
            field: c.field,
            actual: facts[c.field],
            operator: c.op,
            expected: c.val,
            passed: this.evaluateCondition(facts[c.field], c.op, c.val)
          }))
        });
        if (fired.length >= limit) break;
      }
    }
    
    // Sort by relevance score (higher is better)
    return fired.sort((a, b) => b.relevanceScore - a.relevanceScore);
  },

  infer(userInput) {
    const { intent, confidence } = NLPEngine.detectIntent(userInput);
    const facts = NLPEngine.extractFacts(userInput);
    const trace = [];

    trace.push({ step: "NLP", data: { intent: intent?.id, confidence: Math.round(confidence*100), facts } });

    let fired = [];
    if (intent) {
      fired = this.forwardChain(facts, intent.category);
      if (fired.length === 0) fired = this.forwardChain(facts, null, 3);
    } else {
      // General knowledge lookup
      fired = this.forwardChain(facts, null, 5);
    }

    trace.push({ step: "ForwardChaining", data: { rules_fired: fired.map(f => f.rule.rule_id), total: fired.length } });

    return { intent, confidence, facts, fired, trace };
  }
};

// ============================================================
// RESPONSE GENERATOR
// ============================================================
const ResponseGenerator = {
  fillTemplate(template, facts, result) {
    let text = template;
    const allData = { ...facts, ...result };
    for (const [k,v] of Object.entries(allData)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, "g"), v);
    }
    return text;
  },

  generateResponse(inferResult, userInput) {
    const { intent, confidence, facts, fired, trace } = inferResult;

    if (fired.length === 0) {
      return {
        text: `Maaf, saya tidak menemukan aturan akademik yang spesifik untuk pertanyaan Anda. Namun, saya dapat membantu Anda dengan topik-topik berikut:\n\n• **SKS dan IPK** – berapa SKS bisa diambil\n• **Kehadiran / UTS / UAS** – syarat mengikuti ujian\n• **Skripsi** – syarat pengajuan skripsi\n• **KKN / PKL** – syarat dan prosedur\n• **Yudisium / Wisuda** – syarat kelulusan\n• **Cuti Akademik** – prosedur dan aturan\n• **Drop Out** – batas studi dan peringatan\n• **Semester Pendek** – syarat dan informasi\n\nSilakan tanyakan dengan menyertakan informasi seperti IPK, semester, atau jumlah SKS Anda untuk jawaban yang lebih akurat.`,
        sources: [],
        trace,
        confidence: 0,
        intent: null
      };
    }

    // Filter rules with low relevance score (< 0.5) to avoid irrelevant rules
    const relevantFired = fired.filter(f => f.relevanceScore >= 0.5);
    
    // If no relevant rules after filtering, use top 3 regardless
    const finalFired = relevantFired.length > 0 ? relevantFired : fired.slice(0, 3);

    const mainRule = finalFired[0].rule;
    const mainResponse = this.fillTemplate(mainRule.template, facts, mainRule.result);

    let fullResponse = mainResponse + "\n\n";

    // Add additional rules context (only highly relevant ones)
    if (finalFired.length > 1) {
      fullResponse += "**Informasi tambahan yang relevan:**\n\n";
      for (const f of finalFired.slice(1, 4)) {
        fullResponse += "• " + this.fillTemplate(f.rule.template, facts, f.rule.result) + "\n\n";
      }
    }

    // Add fact summary if facts extracted
    if (Object.keys(facts).length > 0) {
      fullResponse += "**Ringkasan data Anda yang terdeteksi:**\n";
      for (const [k,v] of Object.entries(facts)) {
        const labels = { ipk:"IPK", semester:"Semester", sks_lulus:"SKS Lulus", presensi:"Kehadiran", administrasi:"Administrasi", kkn:"KKN", skripsi:"Skripsi", pkl:"PKL", yudisium:"Yudisium" };
        if (labels[k]) fullResponse += `• ${labels[k]}: **${v}**\n`;
      }
      fullResponse += "\n";
    }

    const sources = [...new Set(finalFired.map(f => f.rule.source))];
    fullResponse += `📚 *Sumber: ${sources.slice(0,2).join(" | ")}*`;

    return {
      text: fullResponse,
      sources,
      trace,
      confidence,
      intent,
      rules_fired: finalFired.map(f => f.rule.rule_id)
    };
  }
};

// ============================================================
// MOCK DATABASE (In-Memory)
// ============================================================
const Database = {
  users: [
    { id:1, name:"Admin UNILA", email:"admin@unila.ac.id", role:"admin", password:"admin123" },
    { id:2, name:"Mahasiswa Demo", email:"demo@student.unila.ac.id", role:"student", password:"demo123" }
  ],
  chats: [],
  messages: [],
  logs: [],
  nextId: 100,

  createChat(userId) {
    const chat = { id: this.nextId++, user_id: userId, title: "Percakapan baru", created_at: new Date() };
    this.chats.push(chat);
    return chat;
  },

  addMessage(chatId, role, content, metadata={}) {
    const msg = { id: this.nextId++, chat_id: chatId, role, content, metadata, created_at: new Date() };
    this.messages.push(msg);
    return msg;
  },

  addLog(data) {
    this.logs.push({ id: this.nextId++, ...data, created_at: new Date() });
  },

  getMessages(chatId) {
    return this.messages.filter(m => m.chat_id === chatId);
  },

  getUserChats(userId) {
    return this.chats.filter(c => c.user_id === userId);
  }
};

// ============================================================
// MAIN APPLICATION COMPONENT
// ============================================================
export default function UnilaExpertChatbot() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("login"); // login | chat | admin
  const [loginForm, setLoginForm] = useState({ email:"", password:"" });
  const [loginError, setLoginError] = useState("");
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminTab, setAdminTab] = useState("rules");
  const [showTrace, setShowTrace] = useState(false);
  const [lastTrace, setLastTrace] = useState(null);
  const [searchRule, setSearchRule] = useState("");
  const [uploadMsg, setUploadMsg] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleLogin = () => {
    const found = Database.users.find(u => u.email === loginForm.email && u.password === loginForm.password);
    if (found) {
      setUser(found);
      setLoginError("");
      const userChats = Database.getUserChats(found.id);
      setChats(userChats);
      if (found.role === "admin") setView("admin");
      else { setView("chat"); startNewChat(found); }
    } else {
      setLoginError("Email atau password salah.");
    }
  };

  const startNewChat = (u = user) => {
    const chat = Database.createChat(u.id);
    setChats(prev => [chat, ...prev]);
    setActiveChat(chat);
    setMessages([{
      id: "welcome",
      role: "assistant",
      content: `Halo! Saya **UNILA Academic Expert Chatbot** 🎓\n\nSaya adalah sistem pakar akademik berbasis *Forward Chaining Inference Engine* yang dapat membantu Anda memahami aturan akademik Universitas Lampung.\n\nSaya dapat menjawab pertanyaan tentang:\n• Pengambilan SKS berdasarkan IPK\n• Syarat UTS/UAS dan kehadiran\n• Pendaftaran Skripsi, KKN, PKL\n• Yudisium dan Wisuda\n• Cuti Akademik\n• Drop Out dan batas studi\n• Dan 100+ aturan akademik lainnya\n\nCoba tanyakan sesuatu seperti:\n*"IPK saya 3.2, berapa maksimal SKS yang bisa saya ambil?"*`,
      timestamp: new Date()
    }]);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const selectChat = (chat) => {
    setActiveChat(chat);
    setMessages(Database.getMessages(chat.id));
  };

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input.trim();
    setInput("");

    const userMsgObj = { id: Date.now(), role: "user", content: userMsg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsgObj]);
    if (activeChat) Database.addMessage(activeChat.id, "user", userMsg);

    setIsTyping(true);

    // Simulate processing delay
    await new Promise(r => setTimeout(r, 800 + Math.random() * 700));

    // Run inference
    const inferResult = InferenceEngine.infer(userMsg);
    const response = ResponseGenerator.generateResponse(inferResult, userMsg);

    Database.addLog({
      input: userMsg,
      intent: inferResult.intent?.id,
      confidence: inferResult.confidence,
      facts: inferResult.facts,
      rules_fired: inferResult.fired.map(f=>f.rule.rule_id),
      response: response.text.substring(0, 200)
    });

    const botMsg = {
      id: Date.now() + 1,
      role: "assistant",
      content: response.text,
      metadata: { sources: response.sources, intent: inferResult.intent?.id, confidence: response.confidence, rules_fired: response.rules_fired },
      trace: response.trace,
      timestamp: new Date()
    };

    setIsTyping(false);
    setMessages(prev => [...prev, botMsg]);
    setLastTrace(response.trace);
    if (activeChat) Database.addMessage(activeChat.id, "assistant", response.text, botMsg.metadata);

    // Update chat title
    if (activeChat && messages.length <= 1) {
      const shortTitle = userMsg.slice(0, 40) + (userMsg.length > 40 ? "..." : "");
      setChats(prev => prev.map(c => c.id === activeChat.id ? {...c, title: shortTitle} : c));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleSimulate = (demo) => setInput(demo);

  const filteredRules = KNOWLEDGE_BASE.rules.filter(r =>
    !searchRule || r.rule_id.toLowerCase().includes(searchRule.toLowerCase()) ||
    r.category.toLowerCase().includes(searchRule.toLowerCase()) ||
    r.template.toLowerCase().includes(searchRule.toLowerCase())
  );

  const colors = {
    bg: darkMode ? "#0d1117" : "#f8fafc",
    sidebar: darkMode ? "#161b22" : "#f1f5f9",
    card: darkMode ? "#21262d" : "#ffffff",
    border: darkMode ? "#30363d" : "#e2e8f0",
    text: darkMode ? "#e6edf3" : "#1e293b",
    textMuted: darkMode ? "#8b949e" : "#64748b",
    accent: "#2563eb",
    accentLight: darkMode ? "#1d4ed8" : "#3b82f6",
    userBubble: "#2563eb",
    botBubble: darkMode ? "#21262d" : "#f1f5f9",
    input: darkMode ? "#0d1117" : "#ffffff",
    inputBorder: darkMode ? "#30363d" : "#cbd5e1",
    headerBg: darkMode ? "#161b22" : "#ffffff",
    success: "#22c55e",
    warning: "#f59e0b",
    danger: "#ef4444",
    tag: darkMode ? "#1d4ed820" : "#dbeafe",
    tagText: darkMode ? "#60a5fa" : "#1d4ed8",
  };

  const renderMarkdown = (text) => {
    if (!text) return "";
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  };

  const demos = [
    "IPK saya 3.5 semester 6, berapa sks yang bisa saya ambil?",
    "Kehadiran saya 65%, apakah boleh ikut UAS?",
    "Sudah lulus 115 SKS, IPK 2.8, boleh daftar skripsi?",
    "Apa syarat untuk mengikuti KKN?",
    "Saya semester 3, boleh cuti akademik?",
    "IPK 1.8 semester 5, apakah saya akan di-DO?",
    "Syarat yudisium di UNILA apa saja?",
    "Bisa ikut semester pendek kalau IPK 1.9?",
  ];

  // ============ LOGIN SCREEN ============
  if (view === "login") return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Segoe UI', system-ui, sans-serif" }}>
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}} @keyframes glow{0%,100%{box-shadow:0 0 20px #2563eb40}50%{box-shadow:0 0 40px #2563eb80}} * { box-sizing: border-box; }`}</style>
      <div style={{ width:420, padding:40, background:"rgba(22,27,34,0.95)", borderRadius:20, border:"1px solid #30363d", backdropFilter:"blur(20px)", animation:"glow 3s ease-in-out infinite" }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:48, animation:"float 3s ease-in-out infinite" }}>🎓</div>
          <h1 style={{ color:"#e6edf3", fontSize:22, fontWeight:700, margin:"12px 0 4px" }}>UNILA Academic Expert</h1>
          <p style={{ color:"#8b949e", fontSize:13, margin:0 }}>Chatbot Sistem Pakar Akademik UNILA</p>
        </div>
        <div style={{ marginBottom:16 }}>
          <label style={{ color:"#8b949e", fontSize:12, fontWeight:600, display:"block", marginBottom:6 }}>EMAIL</label>
          <input value={loginForm.email} onChange={e=>setLoginForm(p=>({...p,email:e.target.value}))}
            onKeyDown={e=>e.key==="Enter"&&handleLogin()}
            placeholder="email@unila.ac.id" type="email"
            style={{ width:"100%", padding:"12px 16px", background:"#0d1117", border:"1px solid #30363d", borderRadius:10, color:"#e6edf3", fontSize:14, outline:"none" }} />
        </div>
        <div style={{ marginBottom:8 }}>
          <label style={{ color:"#8b949e", fontSize:12, fontWeight:600, display:"block", marginBottom:6 }}>PASSWORD</label>
          <input value={loginForm.password} onChange={e=>setLoginForm(p=>({...p,password:e.target.value}))}
            onKeyDown={e=>e.key==="Enter"&&handleLogin()}
            placeholder="••••••••" type="password"
            style={{ width:"100%", padding:"12px 16px", background:"#0d1117", border:"1px solid #30363d", borderRadius:10, color:"#e6edf3", fontSize:14, outline:"none" }} />
        </div>
        {loginError && <p style={{ color:"#ef4444", fontSize:12, margin:"8px 0" }}>{loginError}</p>}
        <button onClick={handleLogin} style={{ width:"100%", padding:"13px", background:"#2563eb", color:"white", border:"none", borderRadius:10, fontSize:15, fontWeight:600, cursor:"pointer", marginTop:16, transition:"all 0.2s" }}
          onMouseOver={e=>e.target.style.background="#1d4ed8"} onMouseOut={e=>e.target.style.background="#2563eb"}>
          Masuk →
        </button>
        <div style={{ marginTop:24, padding:16, background:"#0d1117", borderRadius:10, border:"1px solid #21262d" }}>
          <p style={{ color:"#8b949e", fontSize:11, margin:"0 0 8px", fontWeight:600 }}>DEMO AKUN:</p>
          <div style={{ display:"grid", gap:6 }}>
            {[["👨‍💼 Admin","admin@unila.ac.id","admin123"],["👨‍🎓 Mahasiswa","demo@student.unila.ac.id","demo123"]].map(([label,email,pass])=>(
              <button key={email} onClick={()=>setLoginForm({email,password:pass})}
                style={{ padding:"8px 12px", background:"#161b22", border:"1px solid #30363d", borderRadius:8, color:"#8b949e", fontSize:11, cursor:"pointer", textAlign:"left" }}>
                {label}: <span style={{color:"#60a5fa"}}>{email}</span> / <span style={{color:"#60a5fa"}}>{pass}</span>
              </button>
            ))}
          </div>
        </div>
        <p style={{ color:"#8b949e", fontSize:11, textAlign:"center", marginTop:16 }}>Rule-Based Expert System | Forward Chaining | NLP Bahasa Indonesia</p>
      </div>
    </div>
  );

  // ============ ADMIN PANEL ============
  if (view === "admin") return (
    <div style={{ minHeight:"100vh", background:"#0d1117", color:"#e6edf3", fontFamily:"'Segoe UI',system-ui,sans-serif", display:"flex", flexDirection:"column" }}>
      <style>{`* { box-sizing: border-box; } ::-webkit-scrollbar{width:6px} ::-webkit-scrollbar-track{background:#161b22} ::-webkit-scrollbar-thumb{background:#30363d;border-radius:3px} table{border-collapse:collapse;width:100%} th,td{padding:10px 12px;border-bottom:1px solid #21262d;text-align:left;font-size:13px} th{background:#161b22;color:#8b949e;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.5px} tr:hover td{background:#161b2240}`}</style>
      {/* Admin Header */}
      <div style={{ background:"#161b22", borderBottom:"1px solid #21262d", padding:"0 24px", display:"flex", alignItems:"center", height:56, gap:16 }}>
        <span style={{ fontSize:20 }}>🎓</span>
        <div>
          <span style={{ fontWeight:700, color:"#e6edf3", fontSize:14 }}>UNILA Admin Panel</span>
          <span style={{ color:"#8b949e", fontSize:12, marginLeft:8 }}>Expert System Dashboard</span>
        </div>
        <div style={{ flex:1 }} />
        <button onClick={()=>{setView("chat");if(!activeChat)startNewChat();}} style={{ padding:"7px 16px", background:"#21262d", border:"1px solid #30363d", borderRadius:8, color:"#e6edf3", fontSize:12, cursor:"pointer" }}>💬 Ke Chat</button>
        <button onClick={()=>{setUser(null);setView("login");}} style={{ padding:"7px 16px", background:"transparent", border:"1px solid #ef4444", borderRadius:8, color:"#ef4444", fontSize:12, cursor:"pointer" }}>Logout</button>
      </div>

      {/* Stats Bar */}
      <div style={{ padding:"16px 24px", display:"flex", gap:12, background:"#0d1117" }}>
        {[
          ["📋", "Total Rules", KNOWLEDGE_BASE.rules.length, "#2563eb"],
          ["🎯", "Intent Categories", KNOWLEDGE_BASE.intents.length, "#22c55e"],
          ["💬", "Total Pesan", Database.messages.length, "#f59e0b"],
          ["📊", "Inference Logs", Database.logs.length, "#a855f7"],
          ["👥", "Users", Database.users.length, "#06b6d4"],
        ].map(([icon, label, val, color]) => (
          <div key={label} style={{ flex:1, background:"#161b22", border:"1px solid #21262d", borderRadius:12, padding:"14px 16px", borderLeft:`3px solid ${color}` }}>
            <div style={{ fontSize:20, marginBottom:4 }}>{icon}</div>
            <div style={{ fontSize:22, fontWeight:700, color }}>{val}</div>
            <div style={{ fontSize:11, color:"#8b949e" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Admin Tabs */}
      <div style={{ display:"flex", gap:2, padding:"0 24px", background:"#0d1117", borderBottom:"1px solid #21262d" }}>
        {[["rules","📋 Knowledge Base"],["intents","🎯 Intents"],["logs","📊 Inference Logs"],["upload","📄 Upload PDF"],["users","👥 Users"]].map(([t,l])=>(
          <button key={t} onClick={()=>setAdminTab(t)} style={{ padding:"10px 16px", background:"transparent", border:"none", borderBottom: adminTab===t?"2px solid #2563eb":"2px solid transparent", color: adminTab===t?"#e6edf3":"#8b949e", fontSize:13, cursor:"pointer", fontWeight: adminTab===t?600:400 }}>{l}</button>
        ))}
      </div>

      <div style={{ flex:1, overflow:"auto", padding:24 }}>
        {/* RULES TAB */}
        {adminTab === "rules" && (
          <div>
            <div style={{ display:"flex", gap:12, marginBottom:16, alignItems:"center" }}>
              <input value={searchRule} onChange={e=>setSearchRule(e.target.value)} placeholder="Cari rule (ID, kategori, konten)..." style={{ flex:1, padding:"9px 14px", background:"#161b22", border:"1px solid #30363d", borderRadius:8, color:"#e6edf3", fontSize:13, outline:"none" }} />
              <span style={{ color:"#8b949e", fontSize:12 }}>{filteredRules.length} rules</span>
            </div>
            <div style={{ background:"#161b22", border:"1px solid #21262d", borderRadius:12, overflow:"hidden" }}>
              <table>
                <thead><tr><th>Rule ID</th><th>Kategori</th><th>Prioritas</th><th>Kondisi</th><th>Response Template</th><th>Sumber</th></tr></thead>
                <tbody>
                  {filteredRules.map(r => (
                    <tr key={r.rule_id}>
                      <td><span style={{ fontFamily:"monospace", color:"#60a5fa", background:"#1d4ed820", padding:"2px 8px", borderRadius:4, fontSize:12 }}>{r.rule_id}</span></td>
                      <td><span style={{ background:"#21262d", padding:"2px 8px", borderRadius:4, fontSize:11, color:"#8b949e" }}>{r.category}</span></td>
                      <td><span style={{ color: r.priority===1?"#22c55e":r.priority===2?"#f59e0b":"#8b949e", fontWeight:600 }}>P{r.priority}</span></td>
                      <td style={{ fontSize:11, color:"#8b949e", maxWidth:160 }}>{r.conditions.length===0?"(selalu berlaku)":r.conditions.map(c=>`${c.field} ${c.op} ${c.val}`).join(", ")}</td>
                      <td style={{ fontSize:11, color:"#e6edf3", maxWidth:280 }}><div style={{ maxHeight:48, overflow:"hidden", textOverflow:"ellipsis" }}>{r.template.substring(0,100)}...</div></td>
                      <td style={{ fontSize:11, color:"#8b949e" }}>{r.source?.split(" ").slice(-2).join(" ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* INTENTS TAB */}
        {adminTab === "intents" && (
          <div style={{ background:"#161b22", border:"1px solid #21262d", borderRadius:12, overflow:"hidden" }}>
            <table>
              <thead><tr><th>Intent ID</th><th>Kategori</th><th>Pattern Keywords</th><th>Facts Needed</th></tr></thead>
              <tbody>
                {KNOWLEDGE_BASE.intents.map(i => (
                  <tr key={i.id}>
                    <td><code style={{ color:"#60a5fa", fontSize:12 }}>{i.id}</code></td>
                    <td><span style={{ background:"#21262d", padding:"2px 8px", borderRadius:4, fontSize:11, color:"#f59e0b" }}>{i.category}</span></td>
                    <td style={{ fontSize:11 }}>{i.patterns.slice(0,4).join(", ")}{i.patterns.length>4&&` +${i.patterns.length-4} lagi`}</td>
                    <td style={{ fontSize:11 }}>{i.facts_needed.length>0?i.facts_needed.join(", "):<span style={{color:"#8b949e"}}>-</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* LOGS TAB */}
        {adminTab === "logs" && (
          <div>
            {Database.logs.length === 0 ? (
              <div style={{ textAlign:"center", padding:40, color:"#8b949e" }}>Belum ada inference log. Mulai chat untuk menghasilkan log.</div>
            ) : (
              <div style={{ background:"#161b22", border:"1px solid #21262d", borderRadius:12, overflow:"hidden" }}>
                <table>
                  <thead><tr><th>#</th><th>Input User</th><th>Intent</th><th>Confidence</th><th>Facts</th><th>Rules Fired</th><th>Waktu</th></tr></thead>
                  <tbody>
                    {[...Database.logs].reverse().map((log,i) => (
                      <tr key={log.id}>
                        <td style={{color:"#8b949e",fontSize:11}}>{log.id}</td>
                        <td style={{fontSize:12,maxWidth:200}}>{log.input?.substring(0,60)}</td>
                        <td><code style={{color:"#60a5fa",fontSize:11}}>{log.intent||"—"}</code></td>
                        <td><span style={{color: log.confidence>0.5?"#22c55e":log.confidence>0.2?"#f59e0b":"#ef4444", fontWeight:600, fontSize:12}}>{Math.round((log.confidence||0)*100)}%</span></td>
                        <td style={{fontSize:11,color:"#8b949e"}}>{Object.entries(log.facts||{}).map(([k,v])=>`${k}:${v}`).join(", ")||"—"}</td>
                        <td style={{fontSize:11}}>{(log.rules_fired||[]).join(", ")||"—"}</td>
                        <td style={{fontSize:11,color:"#8b949e"}}>{new Date(log.created_at).toLocaleTimeString("id-ID")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* UPLOAD TAB */}
        {adminTab === "upload" && (
          <div style={{ maxWidth:600 }}>
            <div style={{ background:"#161b22", border:"2px dashed #30363d", borderRadius:16, padding:40, textAlign:"center", marginBottom:20 }}>
              <div style={{ fontSize:48, marginBottom:12 }}>📄</div>
              <p style={{ color:"#e6edf3", fontWeight:600, marginBottom:8 }}>Upload PDF Panduan Akademik</p>
              <p style={{ color:"#8b949e", fontSize:13, marginBottom:20 }}>Upload PDF untuk ekstraksi teks dan parsing aturan akademik otomatis</p>
              <input type="file" accept=".pdf" onChange={()=>{ setUploadMsg("✅ File berhasil diterima. Ekstraksi teks dimulai dengan pdfplumber... (Simulasi: dalam sistem production, teks akan diekstrak per halaman dan disimpan ke database.)"); setTimeout(()=>setUploadMsg("🔄 Parsing halaman 1/45... Ditemukan 23 aturan baru. Menyimpan ke knowledge base..."),1500); setTimeout(()=>setUploadMsg("✅ Proses selesai! 23 aturan baru berhasil ditambahkan ke knowledge base."),4000); }}
                style={{ display:"none" }} id="pdf-upload" />
              <label htmlFor="pdf-upload" style={{ display:"inline-block", padding:"12px 28px", background:"#2563eb", color:"white", borderRadius:10, cursor:"pointer", fontWeight:600, fontSize:14 }}>Pilih File PDF</label>
            </div>
            {uploadMsg && <div style={{ padding:16, background:"#161b22", border:"1px solid #30363d", borderRadius:12, color:"#22c55e", fontSize:13 }}>{uploadMsg}</div>}
            <div style={{ marginTop:20, padding:20, background:"#161b22", border:"1px solid #21262d", borderRadius:12 }}>
              <h4 style={{ color:"#e6edf3", margin:"0 0 12px", fontSize:14 }}>📋 Pipeline PDF Processing</h4>
              {["1. Upload PDF → Simpan ke /knowledge_base/raw_pdf/","2. pdfplumber → Ekstrak teks per halaman","3. Cleaning → Hapus karakter aneh, normalisasi teks","4. Parsing → Identifikasi pasal, ayat, dan aturan","5. Rule Extraction → Konversi ke format JSON rule","6. Database Insert → Simpan ke tabel rules & sources","7. Vectorization → Update TF-IDF vector space"].map(s=>(
                <div key={s} style={{ fontSize:12, color:"#8b949e", padding:"4px 0", borderBottom:"1px solid #21262d80" }}>{s}</div>
              ))}
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {adminTab === "users" && (
          <div style={{ background:"#161b22", border:"1px solid #21262d", borderRadius:12, overflow:"hidden" }}>
            <table>
              <thead><tr><th>ID</th><th>Nama</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
              <tbody>
                {Database.users.map(u=>(
                  <tr key={u.id}>
                    <td style={{color:"#8b949e"}}>{u.id}</td>
                    <td style={{fontWeight:500}}>{u.name}</td>
                    <td style={{color:"#60a5fa",fontSize:13}}>{u.email}</td>
                    <td><span style={{ background: u.role==="admin"?"#7c3aed20":"#0d9488​20", color: u.role==="admin"?"#a78bfa":"#2dd4bf", padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:600 }}>{u.role}</span></td>
                    <td><span style={{ color:"#22c55e", fontSize:12 }}>● Aktif</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  // ============ CHAT VIEW ============
  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", background:colors.bg, fontFamily:"'Segoe UI',system-ui,sans-serif", color:colors.text }}>
      <style>{`* {box-sizing:border-box;} ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-thumb{background:${colors.border};border-radius:3px} @keyframes typingDot{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1}} @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ height:56, background:colors.headerBg, borderBottom:`1px solid ${colors.border}`, display:"flex", alignItems:"center", padding:"0 16px", gap:12, flexShrink:0 }}>
        <button onClick={()=>setSidebarOpen(p=>!p)} style={{ background:"none", border:"none", color:colors.textMuted, cursor:"pointer", fontSize:18, padding:4 }}>☰</button>
        <div style={{ width:32, height:32, background:"#2563eb", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🎓</div>
        <div>
          <div style={{ fontWeight:700, fontSize:14, color:colors.text }}>UNILA Academic Expert</div>
          <div style={{ fontSize:11, color:colors.textMuted }}>Rule-Based Expert System • Forward Chaining</div>
        </div>
        <div style={{ flex:1 }} />
        {lastTrace && (
          <button onClick={()=>setShowTrace(p=>!p)} style={{ padding:"5px 12px", background: showTrace?"#2563eb":"transparent", border:`1px solid ${showTrace?"#2563eb":colors.border}`, borderRadius:7, color: showTrace?"white":colors.textMuted, fontSize:11, cursor:"pointer" }}>
            🔍 {showTrace?"Sembunyikan":"Lihat"} Trace
          </button>
        )}
        <button onClick={()=>setDarkMode(p=>!p)} style={{ background:"none", border:`1px solid ${colors.border}`, borderRadius:7, color:colors.textMuted, cursor:"pointer", fontSize:13, padding:"5px 10px" }}>{darkMode?"☀️":"🌙"}</button>
        {user?.role === "admin" && <button onClick={()=>setView("admin")} style={{ padding:"5px 12px", background:"#7c3aed20", border:"1px solid #7c3aed", borderRadius:7, color:"#a78bfa", fontSize:11, cursor:"pointer" }}>⚙️ Admin</button>}
        <button onClick={()=>{setUser(null);setView("login");}} style={{ padding:"5px 12px", background:"transparent", border:`1px solid ${colors.border}`, borderRadius:7, color:colors.textMuted, fontSize:11, cursor:"pointer" }}>Logout</button>
      </div>

      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
        {/* Sidebar */}
        {sidebarOpen && (
          <div style={{ width:260, background:colors.sidebar, borderRight:`1px solid ${colors.border}`, display:"flex", flexDirection:"column", flexShrink:0 }}>
            <div style={{ padding:12 }}>
              <button onClick={()=>startNewChat()} style={{ width:"100%", padding:"10px 14px", background:colors.accent, color:"white", border:"none", borderRadius:10, cursor:"pointer", fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:8 }}>
                <span>+</span> Percakapan Baru
              </button>
            </div>
            <div style={{ flex:1, overflow:"auto", padding:"0 8px 8px" }}>
              <div style={{ fontSize:10, color:colors.textMuted, fontWeight:600, letterSpacing:1, padding:"8px 8px 4px", textTransform:"uppercase" }}>Riwayat</div>
              {chats.map(chat => (
                <button key={chat.id} onClick={()=>selectChat(chat)} style={{ width:"100%", textAlign:"left", padding:"10px 12px", background: activeChat?.id===chat.id?colors.card:"transparent", border: activeChat?.id===chat.id?`1px solid ${colors.border}`:"1px solid transparent", borderRadius:8, color:colors.text, cursor:"pointer", fontSize:12, marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  💬 {chat.title}
                </button>
              ))}
            </div>
            {/* Demo shortcuts */}
            <div style={{ padding:12, borderTop:`1px solid ${colors.border}` }}>
              <div style={{ fontSize:10, color:colors.textMuted, fontWeight:600, letterSpacing:1, marginBottom:8, textTransform:"uppercase" }}>Contoh Pertanyaan</div>
              {demos.slice(0,4).map(d => (
                <button key={d} onClick={()=>handleSimulate(d)} style={{ width:"100%", textAlign:"left", padding:"6px 10px", background:"transparent", border:`1px solid ${colors.border}`, borderRadius:7, color:colors.textMuted, cursor:"pointer", fontSize:10, marginBottom:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  ✨ {d.substring(0,42)}...
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          {/* Trace Panel */}
          {showTrace && lastTrace && (
            <div style={{ background:darkMode?"#0d1117":"#f8fafc", border:`1px solid ${colors.border}`, borderRadius:0, padding:12, borderBottom:`1px solid ${colors.border}`, maxHeight:160, overflow:"auto" }}>
              <div style={{ fontSize:11, fontWeight:700, color:colors.textMuted, marginBottom:8 }}>🔍 INFERENCE TRACE (Forward Chaining)</div>
              {lastTrace.map((t,i) => (
                <div key={i} style={{ marginBottom:8, padding:8, background:colors.card, borderRadius:8, border:`1px solid ${colors.border}` }}>
                  <span style={{ fontSize:10, fontWeight:700, color:colors.accent, marginRight:8 }}>STEP {i+1}: {t.step}</span>
                  <code style={{ fontSize:10, color:colors.textMuted }}>{JSON.stringify(t.data, null, 1).substring(0,200)}</code>
                </div>
              ))}
            </div>
          )}

          {/* Messages */}
          <div style={{ flex:1, overflow:"auto", padding:"20px 16px" }}>
            {messages.map((msg, idx) => (
              <div key={msg.id||idx} style={{ marginBottom:20, display:"flex", justifyContent: msg.role==="user"?"flex-end":"flex-start", animation:"fadeIn 0.3s ease" }}>
                {msg.role === "assistant" && (
                  <div style={{ width:32, height:32, background:"#2563eb", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, marginRight:10, flexShrink:0, marginTop:2 }}>🎓</div>
                )}
                <div style={{ maxWidth:"72%", minWidth:60 }}>
                  <div style={{ padding:"14px 18px", background: msg.role==="user"?colors.userBubble:colors.botBubble, borderRadius: msg.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px", color: msg.role==="user"?"white":colors.text, fontSize:14, lineHeight:1.65, border: msg.role==="assistant"?`1px solid ${colors.border}`:"none", boxShadow: msg.role==="user"?"0 2px 12px #2563eb40":"0 2px 8px rgba(0,0,0,0.1)" }}>
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                  </div>
                  {msg.metadata?.rules_fired?.length > 0 && (
                    <div style={{ marginTop:6, display:"flex", gap:4, flexWrap:"wrap" }}>
                      {msg.metadata.rules_fired.map(r => (
                        <span key={r} style={{ fontSize:10, padding:"2px 7px", background:colors.tag, color:colors.tagText, borderRadius:20, fontFamily:"monospace" }}>{r}</span>
                      ))}
                      {msg.metadata.intent && (
                        <span style={{ fontSize:10, padding:"2px 7px", background:"#22c55e20", color:"#22c55e", borderRadius:20 }}>intent: {msg.metadata.intent}</span>
                      )}
                      {msg.metadata.confidence > 0 && (
                        <span style={{ fontSize:10, padding:"2px 7px", background:"#f59e0b20", color:"#f59e0b", borderRadius:20 }}>conf: {Math.round(msg.metadata.confidence*100)}%</span>
                      )}
                    </div>
                  )}
                  <div style={{ fontSize:10, color:colors.textMuted, marginTop:4, padding:"0 4px" }}>
                    {new Date(msg.timestamp).toLocaleTimeString("id-ID", {hour:"2-digit",minute:"2-digit"})}
                  </div>
                </div>
                {msg.role === "user" && (
                  <div style={{ width:32, height:32, background:"#475569", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, marginLeft:10, flexShrink:0, marginTop:2 }}>👤</div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, animation:"fadeIn 0.3s ease" }}>
                <div style={{ width:32, height:32, background:"#2563eb", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🎓</div>
                <div style={{ padding:"14px 18px", background:colors.botBubble, borderRadius:"18px 18px 18px 4px", border:`1px solid ${colors.border}` }}>
                  <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                    {[0,0.2,0.4].map((d,i) => (
                      <div key={i} style={{ width:7, height:7, background:colors.accent, borderRadius:"50%", animation:`typingDot 1s ${d}s infinite` }} />
                    ))}
                    <span style={{ marginLeft:8, fontSize:11, color:colors.textMuted }}>Memproses dengan forward chaining...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding:"12px 16px 16px", background:colors.headerBg, borderTop:`1px solid ${colors.border}` }}>
            {/* Quick demos */}
            <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap" }}>
              {demos.slice(0,4).map(d => (
                <button key={d} onClick={()=>handleSimulate(d)} style={{ padding:"4px 10px", background:"transparent", border:`1px solid ${colors.border}`, borderRadius:20, color:colors.textMuted, fontSize:10, cursor:"pointer", whiteSpace:"nowrap" }}>
                  {d.substring(0,35)}...
                </button>
              ))}
            </div>
            <div style={{ display:"flex", gap:10, alignItems:"flex-end" }}>
              <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Tanyakan tentang aturan akademik UNILA... (contoh: IPK 3.0, semester 4, berapa SKS?)"
                rows={1} style={{ flex:1, padding:"12px 16px", background:colors.input, border:`1px solid ${colors.inputBorder}`, borderRadius:12, color:colors.text, fontSize:14, resize:"none", outline:"none", lineHeight:1.5, maxHeight:120, fontFamily:"inherit" }}
                onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }} />
              <button onClick={sendMessage} disabled={!input.trim() || isTyping} style={{ width:44, height:44, background: input.trim()&&!isTyping?"#2563eb":"#30363d", border:"none", borderRadius:11, color:"white", cursor: input.trim()&&!isTyping?"pointer":"default", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.2s" }}>
                {isTyping ? <div style={{ width:16, height:16, border:"2px solid white", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} /> : "↑"}
              </button>
            </div>
            <div style={{ textAlign:"center", fontSize:10, color:colors.textMuted, marginTop:8 }}>
              NLP Pipeline: Tokenisasi → Stopword Removal → Stemming → TF-IDF → Cosine Similarity → Forward Chaining
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
