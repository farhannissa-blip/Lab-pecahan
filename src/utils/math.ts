import { MixedFraction, TopicDefinition } from '../types/fraction';

export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 1;
  return Math.abs((a * b) / gcd(a, b));
}

export function simplifyFraction(num: number, den: number): { num: number; den: number; factor: number } {
  if (den === 0) return { num: 0, den: 1, factor: 1 };
  const sign = (num < 0 ? -1 : 1) * (den < 0 ? -1 : 1);
  const absNum = Math.abs(num);
  const absDen = Math.abs(den);
  const factor = gcd(absNum, absDen);
  return {
    num: sign * (absNum / factor),
    den: absDen / factor,
    factor,
  };
}

export function toImproper(f: MixedFraction): { num: number; den: number } {
  const den = Math.max(1, f.den);
  const sign = f.whole < 0 ? -1 : 1;
  const totalNum = sign * (Math.abs(f.whole) * den + Math.abs(f.num));
  return { num: totalNum, den };
}

export function toMixed(num: number, den: number): MixedFraction {
  const cleanDen = Math.max(1, Math.abs(den));
  const simplified = simplifyFraction(num, cleanDen);
  const sign = simplified.num < 0 ? -1 : 1;
  const absNum = Math.abs(simplified.num);
  const whole = Math.floor(absNum / simplified.den);
  const remNum = absNum % simplified.den;
  return {
    whole: sign * whole,
    num: remNum,
    den: simplified.den,
  };
}

export function toMixedUnreduced(num: number, den: number): MixedFraction {
  const cleanDen = Math.max(1, Math.abs(den));
  const sign = num < 0 ? -1 : 1;
  const absNum = Math.abs(num);
  const whole = Math.floor(absNum / cleanDen);
  const remNum = absNum % cleanDen;
  return {
    whole: sign * whole,
    num: remNum,
    den: cleanDen,
  };
}

export function fractionValue(f: MixedFraction): number {
  const imp = toImproper(f);
  return imp.num / imp.den;
}

export const CURRICULUM_TOPICS: TopicDefinition[] = [
  {
    id: 1,
    code: '01',
    title: '01. Menentukan Pecahan',
    shortTitle: 'Menentukan Pecahan',
    category: 'Dasar & Ekuivalensi',
    summary: 'Memahami konsep pecahan sebagai bagian yang diambil (pembilang) dari keseluruhan potongan yang sama besar (penyebut).',
    singaporeConcept: 'Model Konkrit-Piktorial-Abstrak (CPA): 1 balok kayu utuh atau 1 loyang pizza dibagi menjadi beberapa potong sama besar. Bagian yang diwarnai/diambil menunjukkan nilai pecahan.',
    gasingConcept: 'Konsep Dasar GASING: Jika 1 benda utuh dipotong menjadi b bagian yang persis sama besar, maka 1 potong bernilai 1/b ("satu per b"). Jika kita mengambil a potong, nilainya adalah a/b.',
    defaultA: { whole: 0, num: 3, den: 5 },
    defaultB: { whole: 0, num: 1, den: 4 },
  },
  {
    id: 2,
    code: '02',
    title: '02. Pecahan Senilai',
    shortTitle: 'Pecahan Senilai',
    category: 'Dasar & Ekuivalensi',
    summary: 'Menemukan pecahan yang memiliki nilai atau ukuran bagian yang persis sama meskipun jumlah potongannya diperbanyak.',
    singaporeConcept: 'Bar Model Berdampingan: Memotong ulang setiap bagian balok kayu menjadi k bagian lebih kecil tanpa menambah atau mengurangi panjang balok yang diarsir.',
    gasingConcept: 'Pola Kelipatan GASING: Kalikan atau bagi pembilang dan penyebut dengan bilangan yang sama (a/b = (a × k)/(b × k)). Ukuran pizza/kayu tetap sama, hanya potongannya lebih rapat.',
    defaultA: { whole: 0, num: 2, den: 3 },
    defaultB: { whole: 0, num: 4, den: 6 },
    defaultMultiplier: 2,
  },
  {
    id: 3,
    code: '03',
    title: '03. Membandingkan Pecahan (Penyebut Sama)',
    shortTitle: 'Bandingkan (Penyebut Sama)',
    category: 'Perbandingan & Urutan',
    summary: 'Membandingkan dua pecahan yang ukuran tiap potongannya sudah sama besar (penyebutnya sama).',
    singaporeConcept: 'Perbandingan Panjang Bar: Karena ukuran 1 potong balok kayu (1/b) sudah identik, balok yang memiliki lebih banyak potongan arsir otomatis lebih panjang.',
    gasingConcept: 'Trik Cepat GASING: Jika penyebut sudah sama (ukuran potongan sama), cukup lihat pembilangnya saja! Pembilang lebih besar = pecahan lebih besar.',
    defaultA: { whole: 0, num: 3, den: 7 },
    defaultB: { whole: 0, num: 5, den: 7 },
  },
  {
    id: 4,
    code: '04',
    title: '04. Membandingkan Pecahan (Penyebut Berbeda)',
    shortTitle: 'Bandingkan (Penyebut Beda)',
    category: 'Perbandingan & Urutan',
    summary: 'Membandingkan dua pecahan yang ukuran potongannya berbeda dengan menyamakan potongan atau perkalian silang.',
    singaporeConcept: 'Subdivisi Bar Model: Sejajarkan kedua balok kayu, lalu bagi keduanya menjadi satuan potongan terkecil yang sama (KPK atau b × d) agar bisa dibandingkan langsung.',
    gasingConcept: 'Kali Silang Cepat GASING: Kalikan silang bawah ke atas! Bandingkan (a × d) di kiri dengan (b × c) di kanan. Hasil kali yang lebih besar menunjukkan pecahan yang lebih besar.',
    defaultA: { whole: 0, num: 2, den: 3 },
    defaultB: { whole: 0, num: 3, den: 5 },
  },
  {
    id: 5,
    code: '05',
    title: '05. Mengurutkan Pecahan',
    shortTitle: 'Mengurutkan Pecahan',
    category: 'Perbandingan & Urutan',
    summary: 'Menyusun beberapa pecahan dari nilai terkecil ke terbesar (atau sebaliknya) melalui perbandingan visual dan penyamaan penyebut.',
    singaporeConcept: 'Tangga Bar Model (Fraction Tower): Menyusun balok kayu dari yang arsirannya paling pendek ke paling panjang secara berurutan.',
    gasingConcept: 'Metode Samakan Bawah / Desimal Cepat GASING: Samakan semua penyebut ke KPK-nya (atau kalikan penyebut), lalu urutkan langsung berdasarkan angka pembilang barunya.',
    defaultA: { whole: 0, num: 1, den: 2 },
    defaultB: { whole: 0, num: 3, den: 4 },
    defaultOrderList: [
      { id: 'c1', num: 3, den: 4 },
      { id: 'c2', num: 1, den: 3 },
      { id: 'c3', num: 1, den: 2 },
      { id: 'c4', num: 5, den: 6 },
    ],
  },
  {
    id: 6,
    code: '06',
    title: '06. Penjumlahan Pecahan (Penyebut Sama)',
    shortTitle: 'Jumlah (Penyebut Sama)',
    category: 'Penjumlahan',
    summary: 'Menjumlahkan dua pecahan yang ukuran potongannya sudah sama besar dengan menggabungkan potongannya.',
    singaporeConcept: 'Penggabungan Bar Model: Menggeser potongan balok kayu kedua untuk menyambung balok kayu pertama pada wadah ukuran 1/b yang sama.',
    gasingConcept: 'Prinsip Satu Satuan GASING: Karena nama satuannya sama ("per b"), langsung jumlahkan angka di atas (pembilang): a/b + c/b = (a + c)/b. Jangan jumlahkan penyebutnya!',
    defaultA: { whole: 0, num: 2, den: 6 },
    defaultB: { whole: 0, num: 3, den: 6 },
  },
  {
    id: 7,
    code: '07',
    title: '07. Penjumlahan Pecahan (Penyebut Berbeda)',
    shortTitle: 'Jumlah (Penyebut Beda)',
    category: 'Penjumlahan',
    summary: 'Menjumlahkan dua pecahan yang berbeda ukuran potongannya dengan menyamakan potongan terlebih dahulu.',
    singaporeConcept: 'Pemotongan Silang Ekuivalen: Potong balok pertama menjadi d bagian tiap segmen dan balok kedua menjadi b bagian tiap segmen sehingga semua potongan berukuran 1/(b×d).',
    gasingConcept: 'Rumus Kali Silang GASING: a/b + c/d = ((a × d) + (b × c)) / (b × d). Atas kiri kali bawah kanan, tambah atas kanan kali bawah kiri, per bawah kali bawah!',
    defaultA: { whole: 0, num: 1, den: 3 },
    defaultB: { whole: 0, num: 1, den: 4 },
  },
  {
    id: 8,
    code: '08',
    title: '08. Pecahan Campuran (Metode GASING)',
    shortTitle: 'Pecahan Campuran GASING',
    category: 'Pecahan Campuran GASING',
    summary: 'Memahami pecahan campuran sebagai gabungan bilangan bulat utuh dan pecahan murni, serta konversi cepat ke pecahan biasa.',
    singaporeConcept: 'Model Utuh + Bagian: Menampilkan beberapa balok kayu/pizza utuh penuh ditambah satu balok/pizza yang terisi sebagian.',
    gasingConcept: 'Konsep Penting GASING: A b/c artinya A UTUH ditambah b/c (A + b/c). Jika pecahan biasa p/q memiliki pembilang lebih besar dari penyebut, keluarkan kelompok utuhnya (q/q = 1)!',
    defaultA: { whole: 2, num: 3, den: 4 },
    defaultB: { whole: 1, num: 1, den: 4 },
  },
  {
    id: 9,
    code: '09',
    title: '09. Penjumlahan Pecahan Campuran (Metode GASING)',
    shortTitle: 'Jumlah Campuran GASING',
    category: 'Pecahan Campuran GASING',
    summary: 'Menjumlahkan pecahan campuran secara cepat tanpa mengubahnya menjadi pecahan biasa yang berangka besar.',
    singaporeConcept: 'Pengelompokan Visual Utuh & Pecahan: Kumpulkan seluruh balok/pizza utuh di sisi kiri, dan gabungkan potongan pecahan di sisi kanan.',
    gasingConcept: 'Keunggulan Metode GASING: Pisahkan Bulat dengan Pecahan! Jumlahkan Bulat + Bulat terlebih dahulu, lalu Pecahan + Pecahan. Jika hasil pecahan ≥ 1 utuh, simpan 1 utuh ke bilangan bulat!',
    defaultA: { whole: 2, num: 2, den: 5 },
    defaultB: { whole: 1, num: 4, den: 5 },
  },
  {
    id: 10,
    code: '10',
    title: '10. Pengurangan Pecahan Campuran (Metode GASING)',
    shortTitle: 'Kurang Campuran GASING',
    category: 'Pecahan Campuran GASING',
    summary: 'Mengurangkan pecahan campuran dengan memisahkan bilangan bulat dan pecahan, termasuk teknik pinjam 1 utuh GASING.',
    singaporeConcept: 'Regrouping Bar Model: Jika potongan pecahan yang akan dikurangi tidak cukup, ambil 1 balok/pizza utuh lalu potong menjadi c/c bagian.',
    gasingConcept: 'Teknik Pinjam 1 Utuh GASING: Kurangkan Bulat - Bulat dan Pecahan - Pecahan. Jika pecahan pertama lebih kecil, pinjam 1 dari bilangan bulat menjadi c/c, sehingga pembilang bertambah c ((b+c)/c)!',
    defaultA: { whole: 3, num: 1, den: 4 },
    defaultB: { whole: 1, num: 3, den: 4 },
  },
  {
    id: 11,
    code: '11',
    title: '11. Perkalian Pecahan',
    shortTitle: 'Perkalian Pecahan',
    category: 'Perkalian & Pembagian',
    summary: 'Memahami perkalian pecahan sebagai bagian dari bagian (irisan luas) dan menyederhanakan dengan teknik coret silang.',
    singaporeConcept: 'Model Luas Irisan 2D (Area Model): Bagi balok secara mendatar menjadi b bagian (ambil a), lalu bagi secara tegak menjadi d bagian (ambil c). Irisan tumpang-tindih adalah (a×c)/(b×d).',
    gasingConcept: 'Teknik Coret Silang GASING: Sebelum mengalikan atas × atas dan bawah × bawah, sederhanakan (coret) pasangan angka di atas dan di bawah yang memiliki faktor pembagi sama agar angkanya kecil!',
    defaultA: { whole: 0, num: 2, den: 3 },
    defaultB: { whole: 0, num: 3, den: 4 },
  },
  {
    id: 12,
    code: '12',
    title: '12. Pembagian Pecahan',
    shortTitle: 'Pembagian Pecahan',
    category: 'Perkalian & Pembagian',
    summary: 'Memahami pembagian pecahan sebagai pencacahan berapa kali ukuran pembagi muat di dalam pecahan yang dibagi.',
    singaporeConcept: 'Model Pengukuran Pita (Measurement Division): Samakan grid potongan kedua pecahan, lalu hitung ada berapa kelompok potongan pembagi (c/d) yang dapat memuat pecahan pertama (a/b).',
    gasingConcept: 'Metode Balik & Kali GASING: Ubah tanda bagi (÷) menjadi kali (×) dengan membalik pecahan kedua (pembagi): a/b ÷ c/d = a/b × d/c. Lalu gunakan teknik coret silang!',
    defaultA: { whole: 0, num: 3, den: 4 },
    defaultB: { whole: 0, num: 1, den: 8 },
  },
];
