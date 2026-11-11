import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  GripVertical,
  HelpCircle,
} from 'lucide-react';
import { QuizQuestion, VisualMode } from '../types/fraction';
import { CURRICULUM_TOPICS, lcm, toImproper } from '../utils/math';
import { ConcreteFractionView, MathFraction, SinglePizzaPan, SingleWoodBlock } from './FractionVisualizer';

const QUIZ_BANK: QuizQuestion[] = [
  {
    id: 'q1',
    topicId: 1,
    topicTitle: '01. Menentukan Pecahan',
    type: 'build-slices',
    questionText: 'Sebuah loyang pizza / balok kayu dipotong menjadi 6 bagian sama besar. Klik atau ambil potongan pada gambar di bawah agar menunjukkan pecahan 4/6!',
    contextStory: 'Konsep Dasar Pecahan: Pembilang (4) adalah bagian yang diambil, Penyebut (6) adalah total potongan sama besar.',
    visualA: { whole: 0, num: 1, den: 6 },
    targetFraction: { whole: 0, num: 4, den: 6 },
    singaporeSteps: [
      'Lihat balok kayu / loyang pizza yang sudah terbagi menjadi 6 bagian sama besar.',
      'Warnai atau ambil tepat 4 potong dari 6 bagian yang tersedia.',
    ],
    gasingSteps: [
      '1 benda utuh dibagi 6 bagian sama besar → setiap potong bernilai 1/6.',
      'Ambil 4 potong → 4 kali satu per enam = 4/6.',
    ],
  },
  {
    id: 'q2',
    topicId: 2,
    topicTitle: '02. Pecahan Senilai',
    type: 'build-slices',
    questionText: 'Susunlah potongan pada balok kayu / pizza berpenyebut 8 di bawah agar SENILAI (sama besar) dengan pecahan 3/4!',
    contextStory: 'Setiap 1 potong perempat (1/4) jika dibelah menjadi 2 bagian sama besar akan menghasilkan 2 potong perdelapan (2/8).',
    visualA: { whole: 0, num: 3, den: 4 },
    targetDenominator: 8,
    targetFraction: { whole: 0, num: 6, den: 8 },
    singaporeSteps: [
      'Bandingkan panjang balok 3/4 dengan balok yang dipotong menjadi 8 bagian.',
      'Agar panjang arsirannya persis sejajar dengan 3/4, kita memerlukan 6 bagian dari 8 (6/8).',
    ],
    gasingSteps: [
      'Dari penyebut 4 menjadi 8 dikalikan 2 (4 × 2 = 8).',
      'Maka pembilang juga dikalikan 2: 3 × 2 = 6. Jadi 3/4 = 6/8.',
    ],
  },
  {
    id: 'q3',
    topicId: 3,
    topicTitle: '03. Membandingkan Pecahan (Penyebut Sama)',
    type: 'compare-sign',
    questionText: 'Bandingkan kedua potongan balok kayu / pizza berikut: Manakah tanda yang tepat untuk 5/8 ... 3/8?',
    contextStory: 'Kedua pecahan memiliki ukuran potongan yang persis sama, yaitu 1/8.',
    visualA: { whole: 0, num: 5, den: 8 },
    visualB: { whole: 0, num: 3, den: 8 },
    correctSign: '>',
    singaporeSteps: [
      'Bar Model A memiliki 5 segmen berukuran 1/8, sedangkan Bar Model B hanya 3 segmen berukuran 1/8.',
      'Panjang balok 5/8 lebih panjang daripada 3/8.',
    ],
    gasingSteps: [
      'Penyebut sudah sama (sama-sama per delapan).',
      'Langsung bandingkan pembilangnya: karena 5 > 3, maka 5/8 > 3/8.',
    ],
  },
  {
    id: 'q4',
    topicId: 4,
    topicTitle: '04. Membandingkan Pecahan (Penyebut Berbeda)',
    type: 'compare-sign',
    questionText: 'Gunakan pengamatan Bar Model atau Kali Silang GASING: Tanda apakah yang tepat untuk membandingkan 3/4 ... 4/6?',
    contextStory: 'Potongan perempat (1/4) lebih besar ukurannya daripada potongan perenam (1/6).',
    visualA: { whole: 0, num: 3, den: 4 },
    visualB: { whole: 0, num: 4, den: 6 },
    correctSign: '>',
    singaporeSteps: [
      'Samakan potongan ke KPK(4, 6) = 12 bagian.',
      '3/4 menjadi 9/12, sedangkan 4/6 menjadi 8/12. Karena 9/12 lebih panjang dari 8/12, maka 3/4 > 4/6.',
    ],
    gasingSteps: [
      'Trik Kali Silang GASING: Kiri = 3 × 6 = 18. Kanan = 4 × 4 = 16.',
      'Karena 18 > 16, maka langsung diperoleh 3/4 > 4/6!',
    ],
  },
  {
    id: 'q5',
    topicId: 5,
    topicTitle: '05. Mengurutkan Pecahan',
    type: 'sort-cards',
    questionText: 'Tarik dan susun kartu pecahan di bawah ini mulai dari nilai TERKECIL hingga TERBESAR!',
    contextStory: 'Perhatikan panjang arsiran balok kayu pada tiap kartu atau samakan penyebutnya ke per-12.',
    visualA: { whole: 0, num: 1, den: 2 },
    initialCards: [
      { id: 's-34', label: '3/4', num: 3, den: 4 },
      { id: 's-13', label: '1/3', num: 1, den: 3 },
      { id: 's-56', label: '5/6', num: 5, den: 6 },
      { id: 's-12', label: '1/2', num: 1, den: 2 },
    ],
    correctCardOrder: ['s-13', 's-12', 's-34', 's-56'],
    singaporeSteps: [
      'Susun tangga balok kayu dari arsiran terpendek ke terpanjang: 1/3 (33%), 1/2 (50%), 3/4 (75%), lalu 5/6 (83%).',
    ],
    gasingSteps: [
      'Ubah semua ke penyebut KPK = 12: 1/3 = 4/12, 1/2 = 6/12, 3/4 = 9/12, 5/6 = 10/12.',
      'Urutan dari terkecil: 1/3 < 1/2 < 3/4 < 5/6.',
    ],
  },
  {
    id: 'q6',
    topicId: 6,
    topicTitle: '06. Penjumlahan Pecahan (Penyebut Sama)',
    type: 'fraction-input',
    questionText: 'Hitunglah hasil penjumlahan potongan balok kayu / pizza berikut: 2/7 + 3/7 = ...',
    contextStory: 'Kedua pecahan memiliki ukuran potongan yang sama, yaitu sepertujuh (1/7).',
    visualA: { whole: 0, num: 2, den: 7 },
    visualB: { whole: 0, num: 3, den: 7 },
    operation: '+',
    targetFraction: { whole: 0, num: 5, den: 7 },
    singaporeSteps: [
      'Gabungkan 2 potong balok (2/7) dengan 3 potong balok (3/7) pada jalur berpenyebut 7.',
      'Total bagian yang terisi adalah 5 dari 7 bagian (5/7).',
    ],
    gasingSteps: [
      'Karena penyebut sudah sama (per 7), jumlahkan pembilangnya saja: (2 + 3)/7 = 5/7.',
    ],
  },
  {
    id: 'q7',
    topicId: 7,
    topicTitle: '07. Penjumlahan Pecahan (Penyebut Berbeda)',
    type: 'fraction-input',
    questionText: 'Hitunglah hasil penjumlahan pecahan berbeda penyebut berikut: 1/2 + 2/5 = ...',
    contextStory: 'Potong silang kedua balok kayu agar ukuran potongannya sama (persepuluh) atau gunakan Kali Silang GASING.',
    visualA: { whole: 0, num: 1, den: 2 },
    visualB: { whole: 0, num: 2, den: 5 },
    operation: '+',
    targetFraction: { whole: 0, num: 9, den: 10 },
    singaporeSteps: [
      'Bagi balok 1/2 menjadi 5/10, dan balok 2/5 menjadi 4/10.',
      'Gabungkan keduanya: 5/10 + 4/10 = 9/10.',
    ],
    gasingSteps: [
      'Kali Silang GASING: ((1 × 5) + (2 × 2)) / (2 × 5) = (5 + 4) / 10 = 9/10.',
    ],
  },
  {
    id: 'q8',
    topicId: 8,
    topicTitle: '08. Pecahan Campuran (Metode GASING)',
    type: 'fraction-input',
    questionText: 'Ubahlah pecahan campuran 2 3/5 (2 utuh dan 3/5) menjadi bentuk Pecahan Biasa!',
    contextStory: 'Ingat konsep GASING: Setiap 1 benda utuh memiliki 5/5 bagian.',
    visualA: { whole: 2, num: 3, den: 5 },
    targetFraction: { whole: 0, num: 13, den: 5 },
    singaporeSteps: [
      'Ada 2 balok utuh (masing-masing 5/5) ditambah 1 balok berisi 3/5.',
      'Total potongan berukuran 1/5 adalah 5 + 5 + 3 = 13 potong (13/5).',
    ],
    gasingSteps: [
      'Metode GASING: 2 utuh = 2 × 5/5 = 10/5.',
      'Tambahkan dengan 3/5 → (10 + 3)/5 = 13/5.',
    ],
  },
  {
    id: 'q9',
    topicId: 9,
    topicTitle: '09. Penjumlahan Pecahan Campuran (Metode GASING)',
    type: 'mixed-input',
    questionText: 'Gunakan Metode GASING (Bulat + Bulat, Pecahan + Pecahan) untuk menghitung: 2 1/5 + 1 3/5 = ...',
    contextStory: 'Pisahkan bilangan bulat dengan pecahan agar tidak perlu mengubah ke pecahan biasa!',
    visualA: { whole: 2, num: 1, den: 5 },
    visualB: { whole: 1, num: 3, den: 5 },
    operation: '+',
    targetFraction: { whole: 3, num: 4, den: 5 },
    singaporeSteps: [
      'Kumpulkan balok utuh: 2 utuh + 1 utuh = 3 utuh.',
      'Gabungkan potongan pecahan: 1/5 + 3/5 = 4/5. Hasilnya 3 4/5.',
    ],
    gasingSteps: [
      'Langkah 1 (Bulat + Bulat): 2 + 1 = 3.',
      'Langkah 2 (Pecahan + Pecahan): 1/5 + 3/5 = 4/5. Digabung menjadi 3 4/5!',
    ],
  },
  {
    id: 'q10',
    topicId: 10,
    topicTitle: '10. Pengurangan Pecahan Campuran (Metode GASING)',
    type: 'mixed-input',
    questionText: 'Gunakan Teknik Pinjam 1 Utuh GASING untuk menghitung: 3 1/4 − 1 3/4 = ... (Tuliskan hasil dalam bentuk paling sederhana)',
    contextStory: 'Karena 1/4 tidak cukup dikurangi 3/4, pinjam 1 utuh dari 3 sehingga 3 1/4 menjadi 2 5/4!',
    visualA: { whole: 3, num: 1, den: 4 },
    visualB: { whole: 1, num: 3, den: 4 },
    operation: '-',
    targetFraction: { whole: 1, num: 1, den: 2 },
    singaporeSteps: [
      'Belah 1 balok utuh menjadi 4/4, sehingga 3 1/4 berubah menjadi 2 utuh dan 5/4.',
      'Kurangkan utuh: 2 − 1 = 1 utuh. Kurangkan pecahan: 5/4 − 3/4 = 2/4 = 1/2. Hasil: 1 1/2 (atau 1 2/4).',
    ],
    gasingSteps: [
      'Pinjam 1 dari 3 → bulat sisa 2, pembilang pecahan ditambah penyebut (1 + 4 = 5) menjadi 2 5/4.',
      '(2 − 1) + (5/4 − 3/4) = 1 2/4 = 1 1/2.',
    ],
  },
  {
    id: 'q11',
    topicId: 11,
    topicTitle: '11. Perkalian Pecahan',
    type: 'fraction-input',
    questionText: 'Gunakan Teknik Coret Silang GASING atau Model Luas Singapura untuk menghitung: 2/3 × 3/5 = ...',
    contextStory: 'Perhatikan angka 3 di pembilang kanan dan angka 3 di penyebut kiri yang bisa dicoret silang!',
    visualA: { whole: 0, num: 2, den: 3 },
    visualB: { whole: 0, num: 3, den: 5 },
    operation: '×',
    targetFraction: { whole: 0, num: 2, den: 5 },
    singaporeSteps: [
      'Pada grid 3 × 5 = 15 kotak, daerah irisan 2 baris dan 3 kolom mencakup 2 × 3 = 6 kotak (6/15).',
      'Jika disederhanakan dibagi 3 menjadi 2/5.',
    ],
    gasingSteps: [
      'Coret Silang GASING: Angka 3 di atas dan 3 di bawah sama-sama dibagi 3 menjadi 1.',
      'Langsung kalikan sisanya: (2 × 1) / (1 × 5) = 2/5!',
    ],
  },
  {
    id: 'q12',
    topicId: 12,
    topicTitle: '12. Pembagian Pecahan',
    type: 'fraction-input',
    questionText: 'Berapakah hasil pembagian pecahan berikut: 3/4 ÷ 1/8 = ...? (Untuk jawaban bilangan bulat seperti 6, isi Pembilang = 6 dan Penyebut = 1)',
    contextStory: 'Ada berapa potong 1/8 yang muat di dalam 3/4? Gunakan metode Balik & Kali Silang GASING!',
    visualA: { whole: 0, num: 3, den: 4 },
    visualB: { whole: 0, num: 1, den: 8 },
    operation: '÷',
    targetFraction: { whole: 0, num: 6, den: 1 },
    singaporeSteps: [
      'Ubah 3/4 menjadi potongan perdelapan: 3/4 = 6/8.',
      'Di dalam 6/8 terdapat tepat 6 potong berukuran 1/8. Jadi jawabannya 6 (atau 6/1).',
    ],
    gasingSteps: [
      'Balik & Kali GASING: 3/4 ÷ 1/8 = 3/4 × 8/1.',
      'Coret 8 dan 4 (sama-sama dibagi 4 → 2 dan 1): 3 × 2 = 6 (atau 6/1).',
    ],
  },
];

interface InteractiveQuizProps {
  visualMode: VisualMode;
  selectedTopicFilter: number | 'all';
  onChangeTopicFilter: (filter: number | 'all') => void;
}

export const InteractiveQuiz: React.FC<InteractiveQuizProps> = ({
  visualMode,
  selectedTopicFilter,
  onChangeTopicFilter,
}) => {
  const filteredQuestions = useMemo(() => {
    if (selectedTopicFilter === 'all') return QUIZ_BANK;
    return QUIZ_BANK.filter((q) => q.topicId === selectedTopicFilter);
  }, [selectedTopicFilter]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [answeredMap, setAnsweredMap] = useState<Record<string, boolean>>({});
  const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'wrong'>('idle');

  // Interactive answer states
  const [sliceCount, setSliceCount] = useState<number>(1);
  const [selectedSign, setSelectedSign] = useState<'<' | '=' | '>' | null>(null);
  const [sortedCards, setSortedCards] = useState<Array<{ id: string; label: string; num: number; den: number }>>(
    QUIZ_BANK[4].initialCards || []
  );
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [quizSortEqualizeMode, setQuizSortEqualizeMode] = useState<'original' | 'subdivide' | 'equalized'>('equalized');
  const [inputWhole, setInputWhole] = useState<string>('0');
  const [inputNum, setInputNum] = useState<string>('');
  const [inputDen, setInputDen] = useState<string>('');

  const safeIdx = Math.min(currentIndex, Math.max(0, filteredQuestions.length - 1));
  const question = filteredQuestions[safeIdx];

  const loadQuestionState = (q: QuizQuestion) => {
    setFeedbackState('idle');
    setSliceCount(1);
    setSelectedSign(null);
    if (q.initialCards) {
      setSortedCards([...q.initialCards]);
    }
    setInputWhole('');
    setInputNum('');
    setInputDen('');
  };

  const handleSelectQuestion = (idx: number) => {
    setCurrentIndex(idx);
    if (filteredQuestions[idx]) {
      loadQuestionState(filteredQuestions[idx]);
    }
  };

  const checkAnswer = () => {
    if (!question) return;
    let isRight = false;

    if (question.type === 'build-slices' && question.targetFraction) {
      const targetDen = question.targetDenominator || question.visualA.den;
      isRight =
        sliceCount * question.targetFraction.den ===
        question.targetFraction.num * targetDen;
    } else if (question.type === 'compare-sign') {
      isRight = selectedSign === question.correctSign;
    } else if (question.type === 'sort-cards' && question.correctCardOrder) {
      isRight = sortedCards.every((c, idx) => c.id === question.correctCardOrder![idx]);
    } else if (question.type === 'fraction-input' && question.targetFraction) {
      const n = parseInt(inputNum, 10);
      const d = parseInt(inputDen, 10);
      if (!isNaN(n) && !isNaN(d) && d > 0) {
        const targetImp = toImproper(question.targetFraction);
        isRight = n * targetImp.den === targetImp.num * d;
      }
    } else if (question.type === 'mixed-input' && question.targetFraction) {
      const w = parseInt(inputWhole || '0', 10);
      const n = parseInt(inputNum || '0', 10);
      const d = parseInt(inputDen || '1', 10);
      if (!isNaN(w) && !isNaN(n) && !isNaN(d) && d > 0) {
        const userImp = w * d + n;
        const targetImp = toImproper(question.targetFraction);
        isRight = userImp * targetImp.den === targetImp.num * d && w > 0;
      }
    }

    setFeedbackState(isRight ? 'correct' : 'wrong');
    if (isRight && !answeredMap[question.id]) {
      setScore((s) => s + 1);
      setAnsweredMap((prev) => ({ ...prev, [question.id]: true }));
    }
  };

  if (!question) return null;

  return (
    <div className="space-y-6">
      {/* Top Filter & Score Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs text-slate-500">
            Evaluasi Mandiri · 12 Materi Kurikulum GASING & Matematika Singapura
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Kuis Interaktif & Tantangan Visual Pecahan
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="text-sm text-slate-700 font-mono tabular-nums">
            Skor Terkumpul: <strong className="text-emerald-700">{score}</strong> / {QUIZ_BANK.length} Soal
          </div>

          <select
            aria-label="Filter Materi Kuis"
            value={selectedTopicFilter}
            onChange={(e) => {
              const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
              onChangeTopicFilter(val);
              setCurrentIndex(0);
              const nextList = val === 'all' ? QUIZ_BANK : QUIZ_BANK.filter((q) => q.topicId === val);
              if (nextList[0]) loadQuestionState(nextList[0]);
            }}
            className="px-3 py-2 text-xs font-medium bg-slate-100 border border-slate-300 rounded-lg text-slate-800"
          >
            <option value="all">Semua Materi (1 – 12)</option>
            {CURRICULUM_TOPICS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Question Number Strip */}
      <div className="flex flex-wrap items-center gap-1.5">
        {filteredQuestions.map((q, idx) => {
          const isCurrent = idx === safeIdx;
          const isSolved = answeredMap[q.id];
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => handleSelectQuestion(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors whitespace-nowrap shrink-0 ${
                isCurrent
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : isSolved
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Soal #{q.topicId} {isSolved ? '✓' : ''}
            </button>
          );
        })}
      </div>

      {/* Main Quiz Two-Zone Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Question & Concrete Visual Prompt */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div className="space-y-1 border-b border-slate-200 pb-4">
            <div className="text-xs text-slate-500">
              {question.topicTitle} · Soal Interaktif
            </div>
            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              {question.questionText}
            </h3>
            <p className="text-xs text-slate-600">{question.contextStory}</p>
          </div>

          {/* Interactive Question Stage by Type */}
          {question.type === 'build-slices' && (
            <div className="space-y-5">
              {question.targetDenominator && (
                <ConcreteFractionView
                  num={question.visualA.num}
                  den={question.visualA.den}
                  visualMode={visualMode}
                  accentTone="amber"
                  label={`Pecahan Acuan: ${question.visualA.num}/${question.visualA.den}`}
                />
              )}

              <div className="p-4 rounded-xl bg-sky-50/50 border border-sky-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-950">
                    Klik potongan di bawah atau gunakan tombol (+ / −) untuk menyusun jawabanmu:
                  </span>
                  <MathFraction
                    num={sliceCount}
                    den={question.targetDenominator || question.visualA.den}
                    size="lg"
                    colorClass="text-sky-700"
                  />
                </div>

                <ConcreteFractionView
                  num={sliceCount}
                  den={question.targetDenominator || question.visualA.den}
                  visualMode={visualMode}
                  accentTone="sky"
                  interactive
                  onChangeNum={(n) => {
                    setSliceCount(n);
                    setFeedbackState('idle');
                  }}
                />

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSliceCount((c) => Math.max(0, c - 1));
                      setFeedbackState('idle');
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
                  >
                    − Kurangi 1 Potong
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const maxD = question.targetDenominator || question.visualA.den;
                      setSliceCount((c) => Math.min(maxD, c + 1));
                      setFeedbackState('idle');
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-sky-600 text-white rounded-lg hover:bg-sky-700"
                  >
                    + Tambah 1 Potong
                  </button>
                </div>
              </div>
            </div>
          )}

          {question.type === 'compare-sign' && question.visualB && (
            <div className="space-y-4">
              <ConcreteFractionView
                num={question.visualA.num}
                den={question.visualA.den}
                visualMode={visualMode}
                accentTone="amber"
                label={`Pecahan Kiri: ${question.visualA.num}/${question.visualA.den}`}
              />
              <ConcreteFractionView
                num={question.visualB.num}
                den={question.visualB.den}
                visualMode={visualMode}
                accentTone="sky"
                label={`Pecahan Kanan: ${question.visualB.num}/${question.visualB.den}`}
              />
            </div>
          )}

          {question.type === 'sort-cards' && (
            <div className="space-y-3.5">
              {(() => {
                const quizKpk = sortedCards.reduce((acc, c) => lcm(acc, c.den), 1);
                return (
                  <>
                    {/* Equalize Denominators Simulation Bar inside Quiz */}
                    <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200 space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-sky-950">
                            Simulasi Samakan Penyebut Terlebih Dahulu (KPK = {quizKpk})
                          </div>
                          <div className="text-[11px] text-slate-600">
                            Samakan penyebut ke per-{quizKpk} untuk membandingkan pembilang secara langsung:
                          </div>
                        </div>

                        <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg">
                          <button
                            type="button"
                            onClick={() => setQuizSortEqualizeMode('original')}
                            className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors whitespace-nowrap shrink-0 ${
                              quizSortEqualizeMode === 'original'
                                ? 'bg-slate-900 text-white'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            1. Pecahan Awal
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuizSortEqualizeMode('subdivide')}
                            className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors whitespace-nowrap shrink-0 ${
                              quizSortEqualizeMode === 'subdivide'
                                ? 'bg-amber-600 text-white'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            2. Garis Belah (×k)
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuizSortEqualizeMode('equalized')}
                            className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors whitespace-nowrap shrink-0 ${
                              quizSortEqualizeMode === 'equalized'
                                ? 'bg-sky-600 text-white'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            3. Penyebut Sama (/{quizKpk})
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500">
                      Tarik (drag & drop) kartu atau klik panah ↑ ↓ untuk mengurutkan dari Terkecil ke Terbesar:
                    </div>

                    {sortedCards.map((card, idx) => {
                      const factor = quizKpk / card.den;
                      const eqNum = card.num * factor;
                      const dispNum = quizSortEqualizeMode === 'equalized' ? eqNum : card.num;
                      const dispDen = quizSortEqualizeMode === 'equalized' ? quizKpk : card.den;
                      const dispSub = quizSortEqualizeMode === 'subdivide' ? factor : 1;

                      return (
                        <div
                          key={card.id}
                          draggable
                          onDragStart={() => setDragIdx(idx)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => {
                            if (dragIdx === null || dragIdx === idx) return;
                            const next = [...sortedCards];
                            const [moved] = next.splice(dragIdx, 1);
                            next.splice(idx, 0, moved);
                            setSortedCards(next);
                            setDragIdx(null);
                            setFeedbackState('idle');
                          }}
                          className="p-3 rounded-xl bg-slate-50 border-2 border-slate-200 hover:border-sky-400 flex flex-col sm:flex-row sm:items-center gap-3 cursor-grab"
                        >
                          <div className="flex items-center gap-2.5 shrink-0">
                            <GripVertical className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="text-xs font-mono font-bold text-slate-500 w-6">
                              #{idx + 1}
                            </span>
                            <div className="flex items-center gap-2 min-w-[120px]">
                              <MathFraction num={card.num} den={card.den} size="md" />
                              {quizSortEqualizeMode !== 'original' && (
                                <>
                                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                                  <div className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                                    <MathFraction
                                      num={eqNum}
                                      den={quizKpk}
                                      size="md"
                                      colorClass="text-emerald-700"
                                    />
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex-1 flex items-center gap-3 min-w-0">
                            {(visualMode === 'wood' || visualMode === 'both') && (
                              <div className="flex-1 min-w-0">
                                <SingleWoodBlock
                                  activeParts={dispNum}
                                  totalParts={dispDen}
                                  subdivideBy={dispSub}
                                  accentTone={quizSortEqualizeMode !== 'original' ? 'emerald' : 'amber'}
                                  compact
                                />
                              </div>
                            )}
                            {(visualMode === 'pizza' || visualMode === 'both') && (
                              <div className="shrink-0">
                                <SinglePizzaPan
                                  activeParts={dispNum}
                                  totalParts={dispDen}
                                  subdivideBy={dispSub}
                                  accentTone={quizSortEqualizeMode !== 'original' ? 'emerald' : 'amber'}
                                  compact
                                />
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                            {quizSortEqualizeMode !== 'original' && (
                              <span className="text-[11px] font-mono text-emerald-800 font-semibold">
                                ×{factor} → {eqNum}/{quizKpk}
                              </span>
                            )}
                            <div className="flex flex-col gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => {
                                  const next = [...sortedCards];
                                  const [m] = next.splice(idx, 1);
                                  next.splice(idx - 1, 0, m);
                                  setSortedCards(next);
                                  setFeedbackState('idle');
                                }}
                                className="px-2 py-0.5 text-xs bg-white border border-slate-300 rounded disabled:opacity-30"
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                disabled={idx === sortedCards.length - 1}
                                onClick={() => {
                                  const next = [...sortedCards];
                                  const [m] = next.splice(idx, 1);
                                  next.splice(idx + 1, 0, m);
                                  setSortedCards(next);
                                  setFeedbackState('idle');
                                }}
                                className="px-2 py-0.5 text-xs bg-white border border-slate-300 rounded disabled:opacity-30"
                              >
                                ↓
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                );
              })()}
            </div>
          )}

          {(question.type === 'fraction-input' || question.type === 'mixed-input') && (
            <div className="space-y-4">
              <ConcreteFractionView
                whole={question.visualA.whole}
                num={question.visualA.num}
                den={question.visualA.den}
                visualMode={visualMode}
                accentTone="amber"
                label={`Pecahan Pertama: ${
                  question.visualA.whole > 0 ? `${question.visualA.whole} ` : ''
                }${question.visualA.num}/${question.visualA.den}`}
              />
              {question.visualB && (
                <ConcreteFractionView
                  whole={question.visualB.whole}
                  num={question.visualB.num}
                  den={question.visualB.den}
                  visualMode={visualMode}
                  accentTone="sky"
                  label={`Pecahan Kedua (${question.operation}): ${
                    question.visualB.whole > 0 ? `${question.visualB.whole} ` : ''
                  }${question.visualB.num}/${question.visualB.den}`}
                />
              )}
            </div>
          )}
        </div>

        {/* Right: Answer Pad & Dual Method Explanation */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2.5">
              Lembar Jawaban Interaktif
            </h4>

            {question.type === 'compare-sign' && (
              <div className="space-y-3">
                <div className="text-xs text-slate-600">Pilih tanda perbandingan yang benar:</div>
                <div className="grid grid-cols-3 gap-3">
                  {(['<', '=', '>'] as const).map((sgn) => (
                    <button
                      key={sgn}
                      type="button"
                      onClick={() => {
                        setSelectedSign(sgn);
                        setFeedbackState('idle');
                      }}
                      className={`py-3 rounded-xl font-mono text-2xl font-bold border-2 transition-all ${
                        selectedSign === sgn
                          ? 'border-sky-600 bg-sky-50 text-sky-800'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {sgn}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(question.type === 'fraction-input' || question.type === 'mixed-input') && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center gap-4">
                {question.type === 'mixed-input' && (
                  <div className="flex flex-col items-center">
                    <label htmlFor="quiz-whole" className="text-[11px] font-medium text-slate-500 mb-1">
                      Bulat Utuh
                    </label>
                    <input
                      id="quiz-whole"
                      type="number"
                      placeholder="0"
                      value={inputWhole}
                      onChange={(e) => {
                        setInputWhole(e.target.value);
                        setFeedbackState('idle');
                      }}
                      className="w-16 h-14 text-center font-mono text-xl font-bold bg-white border-2 border-slate-300 rounded-lg focus:border-sky-600 focus:outline-none"
                    />
                  </div>
                )}

                <div className="flex flex-col items-center gap-1.5">
                  <div className="flex flex-col items-center">
                    <label htmlFor="quiz-num" className="text-[11px] font-medium text-slate-500 mb-1">
                      Pembilang
                    </label>
                    <input
                      id="quiz-num"
                      type="number"
                      placeholder="?"
                      value={inputNum}
                      onChange={(e) => {
                        setInputNum(e.target.value);
                        setFeedbackState('idle');
                      }}
                      className="w-20 h-11 text-center font-mono text-lg font-bold bg-white border-2 border-slate-300 rounded-lg focus:border-sky-600 focus:outline-none"
                    />
                  </div>
                  <div className="w-24 h-0.5 bg-slate-800 rounded-full" />
                  <div className="flex flex-col items-center">
                    <input
                      id="quiz-den"
                      type="number"
                      placeholder="?"
                      value={inputDen}
                      onChange={(e) => {
                        setInputDen(e.target.value);
                        setFeedbackState('idle');
                      }}
                      className="w-20 h-11 text-center font-mono text-lg font-bold bg-white border-2 border-slate-300 rounded-lg focus:border-sky-600 focus:outline-none"
                    />
                    <label htmlFor="quiz-den" className="text-[11px] font-medium text-slate-500 mt-1">
                      Penyebut
                    </label>
                  </div>
                </div>
              </div>
            )}

            {question.type === 'build-slices' && (
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                Potongan terpilih saat ini:{' '}
                <strong className="font-mono text-sm text-sky-700">
                  {sliceCount}/{question.targetDenominator || question.visualA.den}
                </strong>
              </div>
            )}

            {question.type === 'sort-cards' && (
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                Urutanmu saat ini:{' '}
                <strong className="font-mono text-sky-800">
                  {sortedCards.map((c) => c.label).join(' → ')}
                </strong>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={checkAnswer}
                className="flex-1 py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
              >
                Periksa Jawaban
              </button>
              <button
                type="button"
                onClick={() => loadQuestionState(question)}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                title="Ulangi Soal Ini"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Feedback Banner */}
            {feedbackState !== 'idle' && (
              <div
                className={`p-4 rounded-xl border space-y-3 ${
                  feedbackState === 'correct'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  {feedbackState === 'correct' ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>Luar Biasa! Jawabanmu Benar.</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      <span>Belum Tepat. Mari Pelajari Langkahnya!</span>
                    </>
                  )}
                </div>

                {/* Dual Explanations */}
                <div className="space-y-2 pt-2 border-t border-black/10 text-xs">
                  <div className="font-bold text-sky-900">Cara Visual Matematika Singapura:</div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700">
                    {question.singaporeSteps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>

                  <div className="font-bold text-emerald-900 pt-1">Trik Cepat Metode GASING:</div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700">
                    {question.gasingSteps.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>

                {safeIdx < filteredQuestions.length - 1 && (
                  <button
                    type="button"
                    onClick={() => handleSelectQuestion(safeIdx + 1)}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    Lanjut ke Soal Berikutnya <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
