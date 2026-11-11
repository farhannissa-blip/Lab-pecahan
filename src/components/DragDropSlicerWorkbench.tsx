import React, { useState } from 'react';
import { Scissors, Trash2, RotateCcw, Plus, Combine, ArrowRightLeft } from 'lucide-react';
import { VisualMode } from '../types/fraction';
import { gcd, lcm, toMixed } from '../utils/math';
import { MathFraction, SinglePizzaPan } from './FractionVisualizer';

interface PlacedPiece {
  id: string;
  den: number; // represents 1/den
}

interface DragDropSlicerWorkbenchProps {
  visualMode: VisualMode;
}

const TRAY_DENOMINATORS = [1, 2, 3, 4, 5, 6, 8, 10, 12];

const PIECE_COLORS: Record<number, { bg: string; border: string; hex: string; label: string }> = {
  1: { bg: 'bg-amber-700 text-white', border: 'border-amber-900', hex: '#B45309', label: '1 Utuh' },
  2: { bg: 'bg-sky-600 text-white', border: 'border-sky-800', hex: '#0284C7', label: '1/2' },
  3: { bg: 'bg-emerald-600 text-white', border: 'border-emerald-800', hex: '#059669', label: '1/3' },
  4: { bg: 'bg-amber-500 text-slate-950', border: 'border-amber-700', hex: '#F59E0B', label: '1/4' },
  5: { bg: 'bg-teal-600 text-white', border: 'border-teal-800', hex: '#0D9488', label: '1/5' },
  6: { bg: 'bg-rose-600 text-white', border: 'border-rose-800', hex: '#E11D48', label: '1/6' },
  8: { bg: 'bg-cyan-700 text-white', border: 'border-cyan-900', hex: '#0E7490', label: '1/8' },
  10: { bg: 'bg-orange-600 text-white', border: 'border-orange-800', hex: '#EA580C', label: '1/10' },
  12: { bg: 'bg-slate-700 text-white', border: 'border-slate-900', hex: '#334155', label: '1/12' },
};

function getPieceStyle(den: number) {
  return (
    PIECE_COLORS[den] || {
      bg: 'bg-sky-700 text-white',
      border: 'border-sky-900',
      hex: '#0369A1',
      label: `1/${den}`,
    }
  );
}

function calculateTrackFraction(pieces: PlacedPiece[]): { num: number; den: number; value: number } {
  if (pieces.length === 0) return { num: 0, den: 1, value: 0 };
  const commonDen = pieces.reduce((acc, p) => lcm(acc, p.den), 1);
  const totalNum = pieces.reduce((acc, p) => acc + commonDen / p.den, 0);
  const g = gcd(totalNum, commonDen);
  return {
    num: totalNum,
    den: commonDen,
    value: totalNum / commonDen,
  };
}

export const DragDropSlicerWorkbench: React.FC<DragDropSlicerWorkbenchProps> = ({ visualMode }) => {
  const [trackA, setTrackA] = useState<PlacedPiece[]>([
    { id: 'init-a1', den: 2 },
    { id: 'init-a2', den: 4 },
  ]);
  const [trackB, setTrackB] = useState<PlacedPiece[]>([
    { id: 'init-b1', den: 4 },
    { id: 'init-b2', den: 4 },
    { id: 'init-b3', den: 4 },
  ]);
  const [activeTarget, setActiveTarget] = useState<'A' | 'B'>('A');
  const [slicerFactor, setSlicerFactor] = useState<2 | 3>(2);
  const [dragOverZone, setDragOverZone] = useState<'A' | 'B' | null>(null);
  const [actionMessage, setActionMessage] = useState<string>(
    'Tarik (drag) potongan balok kayu/pizza dari baki di atas ke Jalur A atau Jalur B, atau klik potongan pada jalur untuk membelahnya.'
  );

  const addPieceToTrack = (target: 'A' | 'B', den: number) => {
    const current = target === 'A' ? trackA : trackB;
    const currentVal = current.reduce((sum, p) => sum + 1 / p.den, 0);
    if (currentVal + 1 / den > 2.001) {
      setActionMessage('Maksimal kapasitas 1 jalur adalah 2 utuh (200%) agar visualisasi tetap presisi.');
      return;
    }
    const newPiece: PlacedPiece = {
      id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      den,
    };
    if (target === 'A') {
      setTrackA((prev) => [...prev, newPiece]);
    } else {
      setTrackB((prev) => [...prev, newPiece]);
    }
    setActionMessage(`Menambahkan potongan 1/${den} ke Jalur ${target}.`);
  };

  const handleDragStartFromTray = (e: React.DragEvent, den: number) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ source: 'tray', den }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDropOnTrack = (e: React.DragEvent, target: 'A' | 'B') => {
    e.preventDefault();
    setDragOverZone(null);
    try {
      const raw = e.dataTransfer.getData('text/plain');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.den === 'number') {
        addPieceToTrack(target, parsed.den);
      }
    } catch {
      // Ignore invalid drag payload
    }
  };

  // Split a single piece into `factor` smaller pieces (e.g. 1/2 split by 2 -> two 1/4 pieces)
  const splitPiece = (target: 'A' | 'B', pieceId: string, factor: number) => {
    const updater = (list: PlacedPiece[]) => {
      const idx = list.findIndex((p) => p.id === pieceId);
      if (idx === -1) return list;
      const targetPiece = list[idx];
      const newDen = targetPiece.den * factor;
      if (newDen > 24) {
        setActionMessage(`Potongan 1/${targetPiece.den} sudah terlalu kecil untuk dibagi ${factor} lagi (maksimal 1/24).`);
        return list;
      }
      const subPieces: PlacedPiece[] = Array.from({ length: factor }).map((_, i) => ({
        id: `${pieceId}-sub-${i}-${Date.now()}`,
        den: newDen,
      }));
      setActionMessage(
        `Membagi potongan 1/${targetPiece.den} menjadi ${factor} bagian sama besar → menghasilkan ${factor} potong berukuran 1/${newDen} (Pecahan Senilai: 1/${targetPiece.den} = ${factor}/${newDen}).`
      );
      const next = [...list];
      next.splice(idx, 1, ...subPieces);
      return next;
    };

    if (target === 'A') setTrackA(updater);
    else setTrackB(updater);
  };

  // Merge identical unit fractions that can form a larger unit fraction (e.g., two 1/4 -> one 1/2)
  const mergeEquivalentPieces = (target: 'A' | 'B') => {
    const list = target === 'A' ? [...trackA] : [...trackB];
    let merged = false;
    for (let i = 0; i < list.length; i++) {
      const d = list[i].den;
      if (d % 2 === 0) {
        // Look for another piece with same denominator d
        const pairIdx = list.findIndex((p, idx) => idx !== i && p.den === d);
        if (pairIdx !== -1) {
          const newDen = d / 2;
          const firstIdx = Math.min(i, pairIdx);
          const secondIdx = Math.max(i, pairIdx);
          list.splice(secondIdx, 1);
          list.splice(firstIdx, 1, { id: `merged-${Date.now()}`, den: newDen });
          merged = true;
          setActionMessage(`Menggabungkan dua potongan 1/${d} menjadi satu potongan utuh 1/${newDen} (2/${d} = 1/${newDen}).`);
          break;
        }
      }
      if (d % 3 === 0) {
        const matches = list
          .map((p, idx) => ({ p, idx }))
          .filter((item) => item.p.den === d);
        if (matches.length >= 3) {
          const newDen = d / 3;
          const indices = matches.slice(0, 3).map((m) => m.idx).sort((a, b) => b - a);
          indices.forEach((idx) => list.splice(idx, 1));
          list.push({ id: `merged3-${Date.now()}`, den: newDen });
          merged = true;
          setActionMessage(`Menggabungkan tiga potongan 1/${d} menjadi satu potongan 1/${newDen} (3/${d} = 1/${newDen}).`);
          break;
        }
      }
    }

    if (!merged) {
      setActionMessage(`Tidak ditemukan pasangan potongan sejenis pada Jalur ${target} yang dapat digabung.`);
      return;
    }
    if (target === 'A') setTrackA(list);
    else setTrackB(list);
  };

  const removePiece = (target: 'A' | 'B', pieceId: string) => {
    if (target === 'A') {
      setTrackA((prev) => prev.filter((p) => p.id !== pieceId));
    } else {
      setTrackB((prev) => prev.filter((p) => p.id !== pieceId));
    }
  };

  const applyPreset = (preset: 'senilai' | 'penjumlahan' | 'pinjam-gasing') => {
    if (preset === 'senilai') {
      setTrackA([{ id: 'pre-1', den: 2 }]);
      setTrackB([
        { id: 'pre-2', den: 6 },
        { id: 'pre-3', den: 6 },
        { id: 'pre-4', den: 6 },
      ]);
      setActionMessage('Simulasi Pecahan Senilai: Perhatikan bahwa 1 potong 1/2 sama panjangnya dengan 3 potong 1/6 (1/2 = 3/6).');
    } else if (preset === 'penjumlahan') {
      setTrackA([
        { id: 'pre-a1', den: 2 },
        { id: 'pre-a2', den: 3 },
      ]);
      setTrackB([
        { id: 'pre-b1', den: 6 },
        { id: 'pre-b2', den: 6 },
        { id: 'pre-b3', den: 6 },
        { id: 'pre-b4', den: 6 },
        { id: 'pre-b5', den: 6 },
      ]);
      setActionMessage(
        'Penjumlahan Penyebut Berbeda (1/2 + 1/3): Klik potongan 1/2 (bagi 3) dan 1/3 (bagi 2) di Jalur A agar berubah menjadi lima potong 1/6!'
      );
    } else {
      setTrackA([
        { id: 'pre-g1', den: 1 },
        { id: 'pre-g2', den: 4 },
      ]);
      setTrackB([
        { id: 'pre-g3', den: 4 },
        { id: 'pre-g4', den: 4 },
        { id: 'pre-g5', den: 4 },
      ]);
      setActionMessage(
        'Teknik Pinjam 1 Utuh GASING (1 1/4 - 3/4): Klik balok "1 Utuh" di Jalur A dengan Pemotong ÷2 dua kali untuk mengubah 1 Utuh menjadi 4/4!'
      );
    }
  };

  const statA = calculateTrackFraction(trackA);
  const statB = calculateTrackFraction(trackB);
  const mixedA = toMixed(statA.num, statA.den);
  const mixedB = toMixed(statB.num, statB.den);

  const diffVal = statA.value - statB.value;
  const comparisonSign = Math.abs(diffVal) < 0.0001 ? '=' : diffVal > 0 ? '>' : '<';

  return (
    <div className="space-y-6">
      {/* Top Instruction & Preset Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs text-slate-500">
            Meja Eksplorasi Konkrit · Drag-and-Drop & Pembagian Potongan
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Laboratorium Potongan Balok Kayu & Pizza Interaktif
          </h2>
          <p className="text-sm text-slate-600 max-w-3xl">
            Seret potongan dari baki ke jalur pembanding, atau gunakan alat <strong>Gergaji Pemotong</strong> untuk membelah 1 potongan besar menjadi beberapa potongan pecahan senilai yang lebih kecil.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => applyPreset('senilai')}
            className="px-3 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Contoh Pecahan Senilai
          </button>
          <button
            type="button"
            onClick={() => applyPreset('penjumlahan')}
            className="px-3 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Contoh 1/2 + 1/3
          </button>
          <button
            type="button"
            onClick={() => applyPreset('pinjam-gasing')}
            className="px-3 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Contoh Pinjam 1 Utuh GASING
          </button>
        </div>
      </div>

      {/* Draggable Unit Fraction Tray */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold text-slate-900">
              1. Baki Potongan Pecahan Satuan (Tarik ke Jalur atau Klik untuk Menambah)
            </h3>
            <p className="text-xs text-slate-500">
              Target klik cepat saat ini: <strong>Jalur {activeTarget}</strong> · Ukuran lempeng proporsional terhadap 1 utuh.
            </p>
          </div>

          {/* Target selector & Slicer Factor */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setActiveTarget('A')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  activeTarget === 'A' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Target Klik: Jalur A
              </button>
              <button
                type="button"
                onClick={() => setActiveTarget('B')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  activeTarget === 'B' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Target Klik: Jalur B
              </button>
            </div>

            <div className="flex items-center gap-1 p-1 bg-amber-50 border border-amber-200 rounded-lg">
              <span className="px-2 text-xs font-medium text-amber-900 flex items-center gap-1 whitespace-nowrap shrink-0">
                <Scissors className="w-3.5 h-3.5" /> Pisau Belah:
              </span>
              <button
                type="button"
                onClick={() => setSlicerFactor(2)}
                className={`px-2.5 py-1 text-xs font-mono font-semibold rounded transition-colors whitespace-nowrap shrink-0 ${
                  slicerFactor === 2 ? 'bg-amber-600 text-white' : 'text-amber-900 hover:bg-amber-100'
                }`}
              >
                ÷ 2 Bagian
              </button>
              <button
                type="button"
                onClick={() => setSlicerFactor(3)}
                className={`px-2.5 py-1 text-xs font-mono font-semibold rounded transition-colors whitespace-nowrap shrink-0 ${
                  slicerFactor === 3 ? 'bg-amber-600 text-white' : 'text-amber-900 hover:bg-amber-100'
                }`}
              >
                ÷ 3 Bagian
              </button>
            </div>
          </div>
        </div>

        {/* Draggable Chips */}
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2.5">
          {TRAY_DENOMINATORS.map((den) => {
            const st = getPieceStyle(den);
            return (
              <div
                key={den}
                draggable
                onDragStart={(e) => handleDragStartFromTray(e, den)}
                onClick={() => addPieceToTrack(activeTarget, den)}
                className={`group cursor-grab active:cursor-grabbing rounded-lg border-2 ${st.border} ${st.bg} p-2.5 flex flex-col items-center justify-between shadow-xs hover:brightness-105 transition-all select-none`}
              >
                <div className="w-full flex items-center justify-between text-[11px] opacity-85 font-mono">
                  <span>Tarik</span>
                  <Plus className="w-3.5 h-3.5" />
                </div>
                <div className="my-1.5 font-mono text-base font-bold tabular-nums">
                  {den === 1 ? '1 Utuh' : `1/${den}`}
                </div>
                {/* Proportional mini bar indicator */}
                <div className="w-full h-1.5 bg-black/25 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white/90 rounded-full"
                    style={{ width: `${Math.max(12, Math.round(100 / den))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Comparison Tracks (Singapore Bar Model + Concrete Pizza Pans) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                2. Papan Susun & Gergaji Potongan (Skala 0 sampai 2 Utuh)
              </h3>
              <p className="text-xs text-slate-500">
                Klik tombol <strong>Belah ÷{slicerFactor}</strong> pada kepingan di dalam jalur untuk memotongnya menjadi pecahan yang lebih kecil.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setTrackA([]);
                setTrackB([]);
                setActionMessage('Papan susun dikosongkan. Silakan tarik potongan baru dari baki.');
              }}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Kosongkan Semua
            </button>
          </div>

          {/* Ruler Scale Header (0 to 2 Whole Units) */}
          <div className="relative pt-5 pb-1">
            <div className="flex justify-between text-xs font-mono tabular-nums text-slate-500 mb-1">
              <span>0</span>
              <span>1/2</span>
              <span className="font-bold text-slate-900">1 Utuh</span>
              <span>1 1/2</span>
              <span className="font-bold text-slate-900">2 Utuh</span>
            </div>
            <div className="h-2 w-full bg-slate-100 border border-slate-300 rounded-full relative">
              <div className="absolute left-1/4 top-0 bottom-0 w-px bg-slate-300" />
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-700" />
              <div className="absolute left-3/4 top-0 bottom-0 w-px bg-slate-300" />
            </div>

            {/* Track A */}
            <div className="mt-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">Jalur Pembanding A</span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs font-mono tabular-nums font-semibold text-sky-700">
                    Total = {statA.num}/{statA.den}
                    {statA.num >= statA.den && statA.den > 1
                      ? ` (${mixedA.whole}${mixedA.num > 0 ? ` ${mixedA.num}/${mixedA.den}` : ''})`
                      : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => mergeEquivalentPieces('A')}
                    className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
                  >
                    <Combine className="w-3.5 h-3.5" /> Gabung Senilai
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrackA([])}
                    className="px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded transition-colors whitespace-nowrap shrink-0"
                  >
                    Hapus A
                  </button>
                </div>
              </div>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverZone('A');
                }}
                onDragLeave={() => setDragOverZone(null)}
                onDrop={(e) => handleDropOnTrack(e, 'A')}
                className={`relative min-h-[68px] w-full rounded-xl border-2 transition-colors flex items-stretch overflow-hidden ${
                  dragOverZone === 'A'
                    ? 'border-sky-500 bg-sky-50/70'
                    : 'border-slate-300 bg-slate-50/80'
                }`}
              >
                {/* 1-Whole Reference Vertical Line at 50% width */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 border-r-2 border-dashed border-slate-400/70 pointer-events-none z-10" />

                {trackA.length === 0 ? (
                  <div className="w-full flex items-center justify-center text-xs text-slate-400 py-5">
                    Tarik potongan balok kayu/pizza ke Jalur A di sini
                  </div>
                ) : (
                  trackA.map((piece) => {
                    const widthPercent = (1 / piece.den / 2) * 100; // Because full track is 2 wholes
                    const st = getPieceStyle(piece.den);
                    return (
                      <div
                        key={piece.id}
                        style={{ width: `${widthPercent}%` }}
                        className={`relative group border-r-2 ${st.border} ${st.bg} flex flex-col items-center justify-center py-2 px-1 transition-all select-none overflow-hidden`}
                      >
                        <span className="font-mono text-xs font-bold tabular-nums leading-none">
                          {piece.den === 1 ? '1' : `1/${piece.den}`}
                        </span>
                        <div className="mt-1.5 flex items-center gap-1 opacity-95">
                          <button
                            type="button"
                            onClick={() => splitPiece('A', piece.id, slicerFactor)}
                            title={`Belah potongan 1/${piece.den} menjadi ${slicerFactor} bagian`}
                            className="px-1.5 py-0.5 rounded bg-black/30 hover:bg-black/50 text-[10px] font-mono text-white flex items-center gap-0.5 transition-colors whitespace-nowrap shrink-0"
                          >
                            <Scissors className="w-2.5 h-2.5" /> ÷{slicerFactor}
                          </button>
                          <button
                            type="button"
                            onClick={() => removePiece('A', piece.id)}
                            title="Hapus potongan ini"
                            className="p-0.5 rounded bg-black/25 hover:bg-rose-600 text-white transition-colors"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Track B */}
            <div className="mt-5 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">Jalur Pembanding B</span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs font-mono tabular-nums font-semibold text-emerald-700">
                    Total = {statB.num}/{statB.den}
                    {statB.num >= statB.den && statB.den > 1
                      ? ` (${mixedB.whole}${mixedB.num > 0 ? ` ${mixedB.num}/${mixedB.den}` : ''})`
                      : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => mergeEquivalentPieces('B')}
                    className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
                  >
                    <Combine className="w-3.5 h-3.5" /> Gabung Senilai
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrackB([])}
                    className="px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded transition-colors whitespace-nowrap shrink-0"
                  >
                    Hapus B
                  </button>
                </div>
              </div>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverZone('B');
                }}
                onDragLeave={() => setDragOverZone(null)}
                onDrop={(e) => handleDropOnTrack(e, 'B')}
                className={`relative min-h-[68px] w-full rounded-xl border-2 transition-colors flex items-stretch overflow-hidden ${
                  dragOverZone === 'B'
                    ? 'border-emerald-500 bg-emerald-50/70'
                    : 'border-slate-300 bg-slate-50/80'
                }`}
              >
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 border-r-2 border-dashed border-slate-400/70 pointer-events-none z-10" />

                {trackB.length === 0 ? (
                  <div className="w-full flex items-center justify-center text-xs text-slate-400 py-5">
                    Tarik potongan balok kayu/pizza ke Jalur B di sini
                  </div>
                ) : (
                  trackB.map((piece) => {
                    const widthPercent = (1 / piece.den / 2) * 100;
                    const st = getPieceStyle(piece.den);
                    return (
                      <div
                        key={piece.id}
                        style={{ width: `${widthPercent}%` }}
                        className={`relative group border-r-2 ${st.border} ${st.bg} flex flex-col items-center justify-center py-2 px-1 transition-all select-none overflow-hidden`}
                      >
                        <span className="font-mono text-xs font-bold tabular-nums leading-none">
                          {piece.den === 1 ? '1' : `1/${piece.den}`}
                        </span>
                        <div className="mt-1.5 flex items-center gap-1 opacity-95">
                          <button
                            type="button"
                            onClick={() => splitPiece('B', piece.id, slicerFactor)}
                            title={`Belah potongan 1/${piece.den} menjadi ${slicerFactor} bagian`}
                            className="px-1.5 py-0.5 rounded bg-black/30 hover:bg-black/50 text-[10px] font-mono text-white flex items-center gap-0.5 transition-colors whitespace-nowrap shrink-0"
                          >
                            <Scissors className="w-2.5 h-2.5" /> ÷{slicerFactor}
                          </button>
                          <button
                            type="button"
                            onClick={() => removePiece('B', piece.id)}
                            title="Hapus potongan ini"
                            className="p-0.5 rounded bg-black/25 hover:bg-rose-600 text-white transition-colors"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Live feedback log */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between gap-4">
            <span>{actionMessage}</span>
            <span className="font-mono tabular-nums text-slate-500 shrink-0">
              Jalur A {comparisonSign} Jalur B
            </span>
          </div>
        </div>

        {/* Right Summary & Pizza Equivalency View */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 space-y-5">
          <div>
            <div className="text-xs text-slate-500">Analisis Otomatis GASING & Singapura</div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Perbandingan & Visual Loyang Pizza
            </h3>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-around">
            <div className="text-center">
              <div className="text-xs text-slate-500 mb-1">Jalur A</div>
              <MathFraction
                whole={mixedA.whole}
                num={mixedA.whole > 0 && mixedA.num === 0 ? 0 : statA.num}
                den={statA.den}
                size="lg"
                colorClass="text-sky-700"
              />
            </div>

            <div className="w-10 h-10 rounded-lg bg-white border border-slate-300 flex items-center justify-center font-mono text-xl font-bold text-slate-900 shadow-2xs">
              {comparisonSign}
            </div>

            <div className="text-center">
              <div className="text-xs text-slate-500 mb-1">Jalur B</div>
              <MathFraction
                whole={mixedB.whole}
                num={mixedB.whole > 0 && mixedB.num === 0 ? 0 : statB.num}
                den={statB.den}
                size="lg"
                colorClass="text-emerald-700"
              />
            </div>
          </div>

          {/* Concrete Pizza Pan Equivalence */}
          {(visualMode === 'pizza' || visualMode === 'both' || visualMode === 'wood') && (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Representasi Loyang Pizza</span>
                <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex flex-col items-center">
                  <SinglePizzaPan
                    activeParts={Math.min(statA.den, statA.num)}
                    totalParts={Math.max(1, Math.min(24, statA.den))}
                    accentTone="sky"
                    compact
                    unitLabel="Loyang A"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <SinglePizzaPan
                    activeParts={Math.min(statB.den, statB.num)}
                    totalParts={Math.max(1, Math.min(24, statB.den))}
                    accentTone="emerald"
                    compact
                    unitLabel="Loyang B"
                  />
                </div>
              </div>
            </div>
          )}

          {/* GASING & Singapore Synthesis */}
          <div className="space-y-2.5 text-xs text-slate-600 border-t border-slate-200 pt-4">
            <div>
              <strong className="text-slate-900">Kesimpulan Kali Silang GASING:</strong>{' '}
              <span className="font-mono tabular-nums">
                ({statA.num} × {statB.den} = {statA.num * statB.den}) {comparisonSign} ({statA.den} × {statB.num} ={' '}
                {statA.den * statB.num})
              </span>
            </div>
            <div>
              <strong className="text-slate-900">Jumlah Keduanya (A + B):</strong>{' '}
              <span className="font-mono tabular-nums">
                {statA.num * statB.den + statB.num * statA.den}/{statA.den * statB.den}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
