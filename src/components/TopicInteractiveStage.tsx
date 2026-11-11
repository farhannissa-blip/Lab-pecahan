import React, { useState, useEffect } from 'react';
import {
  Scissors,
  ArrowRight,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  GripVertical,
  ArrowUpDown,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { MixedFraction, TopicDefinition, VisualMode } from '../types/fraction';
import { gcd, lcm, simplifyFraction, toImproper, toMixed } from '../utils/math';
import {
  AreaMultiplicationGrid,
  ConcreteFractionView,
  MathFraction,
  SinglePizzaPan,
  SingleWoodBlock,
} from './FractionVisualizer';

interface TopicInteractiveStageProps {
  topic: TopicDefinition;
  visualMode: VisualMode;
  onSelectTopic: (id: number) => void;
  totalTopics: number;
}

export const TopicInteractiveStage: React.FC<TopicInteractiveStageProps> = ({
  topic,
  visualMode,
  onSelectTopic,
  totalTopics,
}) => {
  const [fracA, setFracA] = useState<MixedFraction>(topic.defaultA);
  const [fracB, setFracB] = useState<MixedFraction>(topic.defaultB);
  const [multiplier, setMultiplier] = useState<number>(topic.defaultMultiplier || 2);
  const [showSubdivision, setShowSubdivision] = useState<boolean>(true);
  const [borrowedOneWhole, setBorrowedOneWhole] = useState<boolean>(false);
  const [unpackedImproper, setUnpackedImproper] = useState<boolean>(false);
  const [showCrossCancel, setShowCrossCancel] = useState<boolean>(true);
  const [activeStep, setActiveStep] = useState<number>(3); // 1, 2, 3 (all steps)

  // Topic 3 & 4 Interactive Comparison Sign Drag/Click state
  const [userSignGuess, setUserSignGuess] = useState<'<' | '=' | '>' | null>(null);

  // Topic 5 Drag-and-Drop Sorting & Equalize Denominator Simulation state
  const [sortCards, setSortCards] = useState<Array<{ id: string; num: number; den: number }>>(
    topic.defaultOrderList || [
      { id: 'c1', num: 3, den: 4 },
      { id: 'c2', num: 1, den: 3 },
      { id: 'c3', num: 1, den: 2 },
      { id: 'c4', num: 5, den: 6 },
    ]
  );
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [draggedCardIdx, setDraggedCardIdx] = useState<number | null>(null);
  // 'original' = pecahan asli, 'subdivide' = garis potong ×k menuju KPK, 'equalized' = sudah berpenyebut sama (KPK)
  const [equalizeMode, setEqualizeMode] = useState<'original' | 'subdivide' | 'equalized'>('equalized');
  const [equalizedCardIds, setEqualizedCardIds] = useState<Record<string, boolean>>({
    c1: true,
    c2: true,
    c3: true,
    c4: true,
  });

  // Reset states when topic changes
  useEffect(() => {
    setFracA(topic.defaultA);
    setFracB(topic.defaultB);
    setMultiplier(topic.defaultMultiplier || 2);
    setBorrowedOneWhole(false);
    setUnpackedImproper(false);
    setUserSignGuess(null);
    setActiveStep(3);
    if (topic.defaultOrderList) {
      setSortCards(topic.defaultOrderList);
      const initEq: Record<string, boolean> = {};
      topic.defaultOrderList.forEach((c) => {
        initEq[c.id] = true;
      });
      setEqualizedCardIds(initEq);
      setEqualizeMode('equalized');
    }
  }, [topic]);

  // Keep denominators synchronized for Same-Denominator topics (3 and 6)
  const updateDenA = (newDen: number) => {
    const safeDen = Math.max(2, Math.min(12, newDen));
    setFracA((prev) => ({
      ...prev,
      den: safeDen,
      num: Math.min(prev.num, safeDen),
    }));
    if (topic.id === 3 || topic.id === 6 || topic.id === 9 || topic.id === 10) {
      setFracB((prev) => ({
        ...prev,
        den: safeDen,
        num: Math.min(prev.num, safeDen - 1 || 1),
      }));
    }
  };

  // Sorting Drag & Drop handlers for Topic 5
  const handleCardDragStart = (idx: number) => {
    setDraggedCardIdx(idx);
  };

  const handleCardDrop = (targetIdx: number) => {
    if (draggedCardIdx === null || draggedCardIdx === targetIdx) return;
    const updated = [...sortCards];
    const [moved] = updated.splice(draggedCardIdx, 1);
    updated.splice(targetIdx, 0, moved);
    setSortCards(updated);
    setDraggedCardIdx(null);
  };

  const moveCard = (idx: number, dir: -1 | 1) => {
    const nextIdx = idx + dir;
    if (nextIdx < 0 || nextIdx >= sortCards.length) return;
    const updated = [...sortCards];
    const [moved] = updated.splice(idx, 1);
    updated.splice(nextIdx, 0, moved);
    setSortCards(updated);
  };

  const isSortOrderCorrect = () => {
    for (let i = 0; i < sortCards.length - 1; i++) {
      const valCurr = sortCards[i].num / sortCards[i].den;
      const valNext = sortCards[i + 1].num / sortCards[i + 1].den;
      if (sortDirection === 'asc' && valCurr > valNext + 0.0001) return false;
      if (sortDirection === 'desc' && valCurr < valNext - 0.0001) return false;
    }
    return true;
  };

  const randomizeSortCards = () => {
    const presets = [
      [
        { id: 'p1-1', num: 3, den: 4 },
        { id: 'p1-2', num: 1, den: 3 },
        { id: 'p1-3', num: 1, den: 2 },
        { id: 'p1-4', num: 5, den: 6 },
      ],
      [
        { id: 'p2-1', num: 3, den: 4 },
        { id: 'p2-2', num: 3, den: 8 },
        { id: 'p2-3', num: 1, den: 2 },
        { id: 'p2-4', num: 7, den: 8 },
      ],
      [
        { id: 'p3-1', num: 4, den: 5 },
        { id: 'p3-2', num: 1, den: 2 },
        { id: 'p3-3', num: 7, den: 10 },
        { id: 'p3-4', num: 2, den: 5 },
      ],
      [
        { id: 'p4-1', num: 2, den: 3 },
        { id: 'p4-2', num: 1, den: 6 },
        { id: 'p4-3', num: 5, den: 9 },
        { id: 'p4-4', num: 1, den: 2 },
      ],
    ];
    const pick = presets[Math.floor(Math.random() * presets.length)];
    const shuffled = [...pick].sort(() => Math.random() - 0.5);
    setSortCards(shuffled);
    const nextEq: Record<string, boolean> = {};
    shuffled.forEach((c) => {
      nextEq[c.id] = equalizeMode !== 'original';
    });
    setEqualizedCardIds(nextEq);
  };

  // Derived mathematical calculations for the current topic
  const crossLeft = fracA.num * fracB.den;
  const crossRight = fracA.den * fracB.num;
  const actualComparisonSign: '<' | '=' | '>' =
    crossLeft === crossRight ? '=' : crossLeft > crossRight ? '>' : '<';

  // Common denominator calculations
  const commonDen = fracA.den * fracB.den;
  const kpkDen = lcm(fracA.den, fracB.den);

  // Mixed fraction addition/subtraction (Topics 9 & 10)
  const needsBorrowTopic10 =
    topic.id === 10 && fracA.num * fracB.den < fracB.num * fracA.den && fracA.whole > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT ZONE: INTERACTIVE SIMULATION STAGE (62% / 7 cols on 12-col grid) */}
      <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        {/* Stage Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Materi {topic.code} dari 12</span>
              <span aria-hidden="true">·</span>
              <span>{topic.category}</span>
              <span aria-hidden="true">·</span>
              <span>Interaktif Konkrit</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{topic.title}</h2>
            <p className="text-sm text-slate-600">{topic.summary}</p>
          </div>

          <button
            type="button"
            onClick={() => {
              setFracA(topic.defaultA);
              setFracB(topic.defaultB);
              setMultiplier(topic.defaultMultiplier || 2);
              setBorrowedOneWhole(false);
              setUnpackedImproper(false);
              setUserSignGuess(null);
            }}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Simulasi
          </button>
        </div>

        {/* ============================================================
            TOPIC 1: MENENTUKAN PECAHAN
           ============================================================ */}
        {topic.id === 1 && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <MathFraction num={fracA.num} den={fracA.den} size="xl" colorClass="text-amber-700" />
                <div className="text-sm text-slate-700 space-y-0.5">
                  <div>
                    <strong className="text-amber-800">Pembilang = {fracA.num}</strong> (Banyak potongan yang diambil/diwarnai)
                  </div>
                  <div>
                    <strong className="text-slate-900">Penyebut = {fracA.den}</strong> (Total seluruh potongan yang sama besar)
                  </div>
                </div>
              </div>
              <div className="text-xs font-mono tabular-nums text-slate-500">
                Desimal: {(fracA.num / fracA.den).toFixed(2)} · Persen: {Math.round((fracA.num / fracA.den) * 100)}%
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium text-slate-600">
                Klik langsung pada potongan Balok Kayu atau Pizza di bawah untuk menambah/mengurangi bagian yang diambil:
              </div>
              <ConcreteFractionView
                num={fracA.num}
                den={fracA.den}
                visualMode={visualMode}
                accentTone="amber"
                interactive
                onChangeNum={(newNum) => setFracA((prev) => ({ ...prev, num: newNum }))}
                label={`1 Benda Utuh Dipotong ${fracA.den} Bagian Sama Besar (Diambil ${fracA.num} Bagian)`}
              />
            </div>

            {/* Interactive Quick Slice Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
              <span className="text-xs text-slate-600">
                Uji cepat: Ambil potongan satu per satu:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {Array.from({ length: fracA.den + 1 }).map((_, n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setFracA((prev) => ({ ...prev, num: n }))}
                    className={`px-2.5 py-1 text-xs font-mono font-semibold rounded transition-colors whitespace-nowrap shrink-0 ${
                      fracA.num === n
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {n}/{fracA.den}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            TOPIC 2: PECAHAN SENILAI
           ============================================================ */}
        {topic.id === 2 && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-around gap-4">
              <div className="text-center">
                <div className="text-xs text-slate-500 mb-1">Pecahan Awal</div>
                <MathFraction num={fracA.num} den={fracA.den} size="xl" colorClass="text-amber-700" />
              </div>

              <div className="flex flex-col items-center text-xs font-mono text-sky-700">
                <span>× {multiplier}</span>
                <span className="text-xl font-bold text-slate-800 my-0.5">=</span>
                <span>× {multiplier}</span>
              </div>

              <div className="text-center">
                <div className="text-xs text-slate-500 mb-1">Pecahan Senilai (Dibelah ×{multiplier})</div>
                <MathFraction
                  num={fracA.num * multiplier}
                  den={fracA.den * multiplier}
                  size="xl"
                  colorClass="text-sky-700"
                />
              </div>
            </div>

            <div className="space-y-5">
              <ConcreteFractionView
                num={fracA.num}
                den={fracA.den}
                subdivideBy={showSubdivision ? multiplier : 1}
                visualMode={visualMode}
                accentTone="amber"
                interactive
                onChangeNum={(newNum) => setFracA((prev) => ({ ...prev, num: newNum }))}
                label={`1. Pecahan Asli: ${fracA.num}/${fracA.den} (Garis putus-putus membelah tiap bagian menjadi ${multiplier})`}
              />

              <ConcreteFractionView
                num={fracA.num * multiplier}
                den={fracA.den * multiplier}
                visualMode={visualMode}
                accentTone="sky"
                label={`2. Hasil Pecahan Senilai: ${fracA.num * multiplier}/${fracA.den * multiplier} (Panjang balok & luas pizza persis sama!)`}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-700">Pisau Pembagi Potongan (×k):</span>
                {[2, 3, 4, 5].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setMultiplier(k)}
                    className={`px-3 py-1 text-xs font-mono font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      multiplier === k
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Belah ×{k}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowSubdivision((v) => !v)}
                className="px-3 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors whitespace-nowrap shrink-0"
              >
                {showSubdivision ? 'Sembunyikan Garis Belah' : 'Tampilkan Garis Belah'}
              </button>
            </div>
          </div>
        )}

        {/* ============================================================
            TOPIC 3 & TOPIC 4: MEMBANDINGKAN PECAHAN (PENYEBUT SAMA & BERBEDA)
           ============================================================ */}
        {(topic.id === 3 || topic.id === 4) && (
          <div className="space-y-6">
            {/* Comparison Interactive Arena */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-around gap-4">
              <div className="text-center space-y-1">
                <div className="text-xs text-slate-500">Pecahan Kiri (A)</div>
                <MathFraction num={fracA.num} den={fracA.den} size="xl" colorClass="text-amber-700" />
                {topic.id === 4 && (
                  <div className="text-xs font-mono text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded">
                    Kali Silang: {fracA.num} × {fracB.den} = <strong>{crossLeft}</strong>
                  </div>
                )}
              </div>

              {/* Interactive Sign Selector / Drop Zone */}
              <div className="flex flex-col items-center gap-2">
                <div className="text-xs text-slate-500">Pilih / Tarik Tanda:</div>
                <div className="flex items-center gap-1.5">
                  {(['<', '=', '>'] as const).map((sign) => {
                    const isSelected = (userSignGuess || actualComparisonSign) === sign;
                    return (
                      <button
                        key={sign}
                        type="button"
                        onClick={() => setUserSignGuess(sign)}
                        className={`w-11 h-11 rounded-xl font-mono text-xl font-bold transition-all ${
                          isSelected
                            ? sign === actualComparisonSign
                              ? 'bg-emerald-600 text-white shadow-sm scale-105'
                              : 'bg-rose-600 text-white'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {sign}
                      </button>
                    );
                  })}
                </div>
                {userSignGuess && (
                  <span
                    className={`text-xs font-semibold ${
                      userSignGuess === actualComparisonSign ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {userSignGuess === actualComparisonSign
                      ? '✓ Tepat! Tanda perbandingan benar.'
                      : `Kurang tepat, seharusnya "${actualComparisonSign}"`}
                  </span>
                )}
              </div>

              <div className="text-center space-y-1">
                <div className="text-xs text-slate-500">Pecahan Kanan (B)</div>
                <MathFraction num={fracB.num} den={fracB.den} size="xl" colorClass="text-sky-700" />
                {topic.id === 4 && (
                  <div className="text-xs font-mono text-sky-800 bg-sky-100/80 px-2 py-0.5 rounded">
                    Kali Silang: {fracA.den} × {fracB.num} = <strong>{crossRight}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Parallel Bar / Pizza Visualizers */}
            <div className="space-y-5">
              <ConcreteFractionView
                num={fracA.num}
                den={fracA.den}
                subdivideBy={topic.id === 4 && showSubdivision ? fracB.den : 1}
                visualMode={visualMode}
                accentTone="amber"
                interactive
                onChangeNum={(newNum) => setFracA((prev) => ({ ...prev, num: newNum }))}
                label={
                  topic.id === 4 && showSubdivision
                    ? `Pecahan A: ${fracA.num}/${fracA.den} = ${crossLeft}/${commonDen}`
                    : `Pecahan A: ${fracA.num}/${fracA.den}`
                }
              />

              <ConcreteFractionView
                num={fracB.num}
                den={fracB.den}
                subdivideBy={topic.id === 4 && showSubdivision ? fracA.den : 1}
                visualMode={visualMode}
                accentTone="sky"
                interactive
                onChangeNum={(newNum) => setFracB((prev) => ({ ...prev, num: newNum }))}
                label={
                  topic.id === 4 && showSubdivision
                    ? `Pecahan B: ${fracB.num}/${fracB.den} = ${crossRight}/${commonDen}`
                    : `Pecahan B: ${fracB.num}/${fracB.den}`
                }
              />
            </div>

            {topic.id === 4 && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <span className="text-xs text-slate-600">
                  Penyebut bersama (KPK = {kpkDen}, Perkalian = {commonDen})
                </span>
                <button
                  type="button"
                  onClick={() => setShowSubdivision((v) => !v)}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  {showSubdivision ? 'Sembunyikan Garis Samakan Penyebut' : 'Tampilkan Garis Samakan Penyebut'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            TOPIC 5: MENGURUTKAN PECAHAN (SIMULASI MENYAMAKAN PENYEBUT + DRAG & DROP)
           ============================================================ */}
        {topic.id === 5 && (
          <div className="space-y-5">
            {(() => {
              const allKpk = sortCards.reduce((acc, c) => lcm(acc, c.den), 1);
              const uniqueDens = Array.from(new Set(sortCards.map((c) => c.den)));
              const allCardsEqualized = sortCards.every((c) => equalizedCardIds[c.id]);

              return (
                <>
                  {/* Step-by-Step Equalizing Denominator Simulation Controller */}
                  <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-sky-950">
                          Simulasi Menyamakan Penyebut Terlebih Dahulu (KPK = {allKpk})
                        </div>
                        <p className="text-xs text-slate-600">
                          Penyebut awal ({uniqueDens.join(', ')}) disamakan menjadi <strong>per-{allKpk}</strong> agar ukuran setiap potongan balok kayu / pizza persis sama besar sebelum diurutkan.
                        </p>
                      </div>

                      <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg">
                        <button
                          type="button"
                          onClick={() => {
                            setEqualizeMode('original');
                            const none: Record<string, boolean> = {};
                            sortCards.forEach((c) => {
                              none[c.id] = false;
                            });
                            setEqualizedCardIds(none);
                          }}
                          className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                            equalizeMode === 'original' && !allCardsEqualized
                              ? 'bg-slate-900 text-white'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          1. Pecahan Awal
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEqualizeMode('subdivide');
                            const all: Record<string, boolean> = {};
                            sortCards.forEach((c) => {
                              all[c.id] = true;
                            });
                            setEqualizedCardIds(all);
                          }}
                          className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                            equalizeMode === 'subdivide'
                              ? 'bg-amber-600 text-white'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          2. Proses Belah (×k)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEqualizeMode('equalized');
                            const all: Record<string, boolean> = {};
                            sortCards.forEach((c) => {
                              all[c.id] = true;
                            });
                            setEqualizedCardIds(all);
                          }}
                          className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                            equalizeMode === 'equalized' && allCardsEqualized
                              ? 'bg-sky-600 text-white'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          3. Penyebut Sama (/{allKpk})
                        </button>
                      </div>
                    </div>

                    {/* Conversion Strip for each card showing × factor to reach KPK */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                      {sortCards.map((card) => {
                        const factor = allKpk / card.den;
                        const eqNum = card.num * factor;
                        const isEq = !!equalizedCardIds[card.id];
                        return (
                          <div
                            key={`conv-${card.id}`}
                            onClick={() =>
                              setEqualizedCardIds((prev) => ({
                                ...prev,
                                [card.id]: !prev[card.id],
                              }))
                            }
                            className={`p-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                              isEq
                                ? 'bg-white border-sky-400 shadow-2xs'
                                : 'bg-white/70 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                              <span>Kali ×{factor}</span>
                              <span
                                className={`font-mono font-semibold ${
                                  isEq ? 'text-emerald-700' : 'text-amber-700'
                                }`}
                              >
                                {isEq ? `✓ Per-${allKpk}` : 'Klik Samakan'}
                              </span>
                            </div>
                            <div className="flex items-center justify-center gap-1.5 font-mono text-xs">
                              <MathFraction num={card.num} den={card.den} size="sm" colorClass="text-slate-800" />
                              <span className="text-slate-400">=</span>
                              <span className="text-[11px] text-sky-700 font-semibold">
                                ({card.num}×{factor})/({card.den}×{factor})
                              </span>
                              <span className="text-slate-400">=</span>
                              <MathFraction
                                num={eqNum}
                                den={allKpk}
                                size="sm"
                                colorClass="text-emerald-700"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Target Direction & Auto-Sort Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-700">Target Urutan:</span>
                      <button
                        type="button"
                        onClick={() => setSortDirection('asc')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                          sortDirection === 'asc'
                            ? 'bg-sky-600 text-white'
                            : 'bg-white border border-slate-300 text-slate-700'
                        }`}
                      >
                        Terkecil → Terbesar
                      </button>
                      <button
                        type="button"
                        onClick={() => setSortDirection('desc')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                          sortDirection === 'desc'
                            ? 'bg-sky-600 text-white'
                            : 'bg-white border border-slate-300 text-slate-700'
                        }`}
                      >
                        Terbesar → Terkecil
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          // First ensure all cards are equalized so user sees why they sort this way
                          const all: Record<string, boolean> = {};
                          sortCards.forEach((c) => {
                            all[c.id] = true;
                          });
                          setEqualizedCardIds(all);
                          setEqualizeMode('equalized');
                          const sorted = [...sortCards].sort((a, b) =>
                            sortDirection === 'asc'
                              ? a.num / a.den - b.num / b.den
                              : b.num / b.den - a.num / a.den
                          );
                          setSortCards(sorted);
                        }}
                        className="px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors whitespace-nowrap shrink-0"
                      >
                        Samakan & Urutkan Otomatis
                      </button>
                      <button
                        type="button"
                        onClick={randomizeSortCards}
                        className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
                      >
                        Acak Soal Baru
                      </button>
                    </div>
                  </div>

                  {/* Drag and Drop Cards List with Equalized Wood Block & Pizza Visuals */}
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                      <span>
                        Tarik (drag & drop) kartu di bawah atau klik panah (↑ ↓) untuk mengurutkan berdasarkan <strong>Pembilang Baru (per-{allKpk})</strong>:
                      </span>
                      <span className="font-mono text-slate-600">
                        KPK Penyebut = {allKpk}
                      </span>
                    </div>

                    {sortCards.map((card, idx) => {
                      const factor = allKpk / card.den;
                      const eqNum = card.num * factor;
                      const isCardEqualized = !!equalizedCardIds[card.id];

                      // Determine what to pass to WoodBlock & Pizza based on equalization state
                      const displayNum =
                        isCardEqualized && equalizeMode === 'equalized' ? eqNum : card.num;
                      const displayDen =
                        isCardEqualized && equalizeMode === 'equalized' ? allKpk : card.den;
                      const displaySubdivide =
                        isCardEqualized && equalizeMode === 'subdivide' ? factor : 1;

                      return (
                        <div
                          key={card.id}
                          draggable
                          onDragStart={() => handleCardDragStart(idx)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => handleCardDrop(idx)}
                          className="p-3.5 rounded-xl bg-white border-2 border-slate-200 hover:border-sky-400 transition-all flex flex-col sm:flex-row sm:items-center gap-3.5 cursor-grab active:cursor-grabbing shadow-2xs"
                        >
                          {/* Left: Drag Handle + Original & Equalized Fraction Notation */}
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="flex flex-col items-center gap-0.5 text-slate-400">
                              <GripVertical className="w-4 h-4" />
                              <span className="text-[11px] font-mono font-bold text-slate-600">
                                #{idx + 1}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 min-w-[135px]">
                              <MathFraction
                                num={card.num}
                                den={card.den}
                                size="md"
                                colorClass="text-slate-900"
                              />
                              {isCardEqualized && (
                                <>
                                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <div className="px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200">
                                    <MathFraction
                                      num={eqNum}
                                      den={allKpk}
                                      size="md"
                                      colorClass="text-emerald-700"
                                    />
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Center: Concrete Visual (Wood Block and/or Pizza Pan) */}
                          <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-3">
                            {(visualMode === 'wood' || visualMode === 'both') && (
                              <div className="flex-1 min-w-0">
                                <SingleWoodBlock
                                  activeParts={displayNum}
                                  totalParts={displayDen}
                                  subdivideBy={displaySubdivide}
                                  accentTone={isCardEqualized ? 'emerald' : idx % 2 === 0 ? 'amber' : 'sky'}
                                  compact
                                />
                              </div>
                            )}

                            {(visualMode === 'pizza' || visualMode === 'both') && (
                              <div className="shrink-0 flex justify-center">
                                <SinglePizzaPan
                                  activeParts={displayNum}
                                  totalParts={Math.min(24, displayDen)}
                                  subdivideBy={displaySubdivide}
                                  accentTone={isCardEqualized ? 'emerald' : idx % 2 === 0 ? 'amber' : 'sky'}
                                  compact
                                />
                              </div>
                            )}
                          </div>

                          {/* Right: Equalize Toggle & Up/Down Order Buttons */}
                          <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
                            <div className="text-right font-mono tabular-nums text-xs">
                              <div className="font-bold text-emerald-800">
                                Pembilang Baru: {eqNum}
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setEqualizedCardIds((prev) => ({
                                    ...prev,
                                    [card.id]: !prev[card.id],
                                  }))
                                }
                                className="text-[11px] text-sky-700 hover:underline font-sans font-medium"
                              >
                                {isCardEqualized
                                  ? `Reset ke ${card.num}/${card.den}`
                                  : `Belah ×${factor} → ${eqNum}/${allKpk}`}
                              </button>
                            </div>

                            <div className="flex flex-col gap-1 shrink-0">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveCard(idx, -1)}
                                className="px-2 py-0.5 text-xs bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded font-mono"
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                disabled={idx === sortCards.length - 1}
                                onClick={() => moveCard(idx, 1)}
                                className="px-2 py-0.5 text-xs bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded font-mono"
                              >
                                ↓
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Status Banner with Equalized vs Original Summary */}
                  <div
                    className={`p-4 rounded-xl border space-y-2 ${
                      isSortOrderCorrect()
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                        : 'bg-amber-50 border-amber-200 text-amber-950'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>
                          {isSortOrderCorrect()
                            ? `Urutan Tepat (${
                                sortDirection === 'asc'
                                  ? 'Terkecil ke Terbesar'
                                  : 'Terbesar ke Terkecil'
                              })!`
                            : 'Urutan Belum Tepat — Bandingkan angka Pembilang Baru setelah penyebut disamakan!'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs font-mono tabular-nums">
                      <div className="p-2 rounded bg-white/80 border border-black/10">
                        <span className="text-slate-500 font-sans">Urutan Penyebut Sama (/{allKpk}): </span>
                        <strong className="text-emerald-800">
                          {sortCards
                            .map((c) => `${(c.num * allKpk) / c.den}/${allKpk}`)
                            .join(sortDirection === 'asc' ? ' < ' : ' > ')}
                        </strong>
                      </div>
                      <div className="p-2 rounded bg-white/80 border border-black/10">
                        <span className="text-slate-500 font-sans">Urutan Pecahan Asli: </span>
                        <strong className="text-slate-900">
                          {sortCards
                            .map((c) => `${c.num}/${c.den}`)
                            .join(sortDirection === 'asc' ? ' < ' : ' > ')}
                        </strong>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* ============================================================
            TOPIC 6 & TOPIC 7: PENJUMLAHAN PECAHAN (PENYEBUT SAMA & BERBEDA)
           ============================================================ */}
        {(topic.id === 6 || topic.id === 7) && (
          <div className="space-y-6">
            {(() => {
              const isSameDen = topic.id === 6 || fracA.den === fracB.den;
              const resDen = isSameDen ? fracA.den : fracA.den * fracB.den;
              const term1 = isSameDen ? fracA.num : fracA.num * fracB.den;
              const term2 = isSameDen ? fracB.num : fracB.num * fracA.den;
              const sumNum = term1 + term2;
              const simplified = simplifyFraction(sumNum, resDen);
              const mixedRes = toMixed(sumNum, resDen);

              return (
                <>
                  {/* Equation Summary Banner */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-center gap-4">
                    <MathFraction num={fracA.num} den={fracA.den} size="lg" colorClass="text-amber-700" />
                    <span className="font-mono text-xl font-bold text-slate-700">+</span>
                    <MathFraction num={fracB.num} den={fracB.den} size="lg" colorClass="text-sky-700" />
                    <span className="font-mono text-xl font-bold text-slate-700">=</span>

                    {!isSameDen && (
                      <>
                        <div className="px-2.5 py-1 rounded bg-white border border-slate-200 font-mono text-xs text-slate-700">
                          ({fracA.num}×{fracB.den} + {fracA.den}×{fracB.num}) / ({fracA.den}×{fracB.den})
                        </div>
                        <span className="font-mono text-xl font-bold text-slate-700">=</span>
                      </>
                    )}

                    <MathFraction num={sumNum} den={resDen} size="lg" colorClass="text-emerald-700" />

                    {sumNum >= resDen && (
                      <>
                        <span className="font-mono text-sm text-slate-400">=</span>
                        <MathFraction
                          whole={mixedRes.whole}
                          num={mixedRes.num}
                          den={mixedRes.den}
                          size="lg"
                          colorClass="text-emerald-800"
                        />
                      </>
                    )}
                  </div>

                  {/* Visual Bars */}
                  <div className="space-y-4">
                    <ConcreteFractionView
                      num={fracA.num}
                      den={fracA.den}
                      subdivideBy={!isSameDen && showSubdivision ? fracB.den : 1}
                      visualMode={visualMode}
                      accentTone="amber"
                      interactive
                      onChangeNum={(n) => setFracA((prev) => ({ ...prev, num: n }))}
                      label={
                        !isSameDen && showSubdivision
                          ? `Pecahan Pertama: ${fracA.num}/${fracA.den} → Dipotong ×${fracB.den} menjadi ${term1}/${resDen}`
                          : `Pecahan Pertama: ${fracA.num}/${fracA.den}`
                      }
                    />

                    <ConcreteFractionView
                      num={fracB.num}
                      den={fracB.den}
                      subdivideBy={!isSameDen && showSubdivision ? fracA.den : 1}
                      visualMode={visualMode}
                      accentTone="sky"
                      interactive
                      onChangeNum={(n) => setFracB((prev) => ({ ...prev, num: n }))}
                      label={
                        !isSameDen && showSubdivision
                          ? `Pecahan Kedua: ${fracB.num}/${fracB.den} → Dipotong ×${fracA.den} menjadi ${term2}/${resDen}`
                          : `Pecahan Kedua: ${fracB.num}/${fracB.den}`
                      }
                    />

                    {/* Combined Result Container */}
                    <div className="pt-3 border-t border-slate-200">
                      {sumNum <= resDen ? (
                        <ConcreteFractionView
                          num={term1}
                          secondaryParts={term2}
                          den={resDen}
                          visualMode={visualMode}
                          accentTone="amber"
                          label={`Hasil Gabungan Potongan: ${term1}/${resDen} (Kuning) + ${term2}/${resDen} (Biru) = ${sumNum}/${resDen}`}
                        />
                      ) : (
                        <ConcreteFractionView
                          num={sumNum}
                          den={resDen}
                          visualMode={visualMode}
                          accentTone="emerald"
                          label={`Hasil Gabungan (Melebihi 1 Utuh): ${sumNum}/${resDen} = ${mixedRes.whole} Utuh ${
                            mixedRes.num > 0 ? `+ ${mixedRes.num}/${mixedRes.den}` : ''
                          }`}
                        />
                      )}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* ============================================================
            TOPIC 8: PECAHAN CAMPURAN (METODE GASING)
           ============================================================ */}
        {topic.id === 8 && (
          <div className="space-y-6">
            {(() => {
              const imp = toImproper(fracA);
              return (
                <>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-around gap-4">
                    <div className="text-center">
                      <div className="text-xs text-slate-500 mb-1">Pecahan Campuran</div>
                      <MathFraction
                        whole={fracA.whole}
                        num={fracA.num}
                        den={fracA.den}
                        size="xl"
                        colorClass="text-emerald-700"
                      />
                    </div>

                    <div className="text-center font-mono text-xs text-slate-600 space-y-1">
                      <div className="font-semibold text-slate-900">Konsep GASING:</div>
                      <div>
                        {fracA.whole} Utuh + {fracA.num}/{fracA.den}
                      </div>
                      <div className="text-sky-700">
                        = ({fracA.whole} × {fracA.den} + {fracA.num}) / {fracA.den}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-xs text-slate-500 mb-1">Pecahan Biasa</div>
                      <MathFraction num={imp.num} den={imp.den} size="xl" colorClass="text-amber-700" />
                    </div>
                  </div>

                  <ConcreteFractionView
                    whole={unpackedImproper ? 0 : fracA.whole}
                    num={unpackedImproper ? imp.num : fracA.num}
                    den={fracA.den}
                    visualMode={visualMode}
                    accentTone="amber"
                    interactive
                    onChangeNum={(n) => setFracA((prev) => ({ ...prev, num: n }))}
                    label={`Visualisasi ${fracA.whole} Benda Utuh (${fracA.whole} × ${fracA.den}/${fracA.den}) ditambah Pecahan ${fracA.num}/${fracA.den}`}
                  />

                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-emerald-950">
                      <strong>Inti Metode GASING:</strong> Setiap 1 benda utuh bernilai{' '}
                      <span className="font-mono font-bold">{fracA.den}/{fracA.den}</span>. Jadi {fracA.whole} benda utuh memiliki{' '}
                      <span className="font-mono font-bold">
                        {fracA.whole} × {fracA.den} = {fracA.whole * fracA.den}
                      </span>{' '}
                      potong, ditambah <span className="font-mono font-bold">{fracA.num}</span> potong ={' '}
                      <span className="font-mono font-bold">{imp.num}/{fracA.den}</span>.
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* ============================================================
            TOPIC 9: PENJUMLAHAN PECAHAN CAMPURAN (METODE GASING)
           ============================================================ */}
        {topic.id === 9 && (
          <div className="space-y-6">
            {(() => {
              const wholeSum = fracA.whole + fracB.whole;
              const isSameDen = fracA.den === fracB.den;
              const commonD = isSameDen ? fracA.den : fracA.den * fracB.den;
              const numSum = isSameDen
                ? fracA.num + fracB.num
                : fracA.num * fracB.den + fracB.num * fracA.den;
              const carryWhole = Math.floor(numSum / commonD);
              const remNum = numSum % commonD;
              const finalWhole = wholeSum + carryWhole;
              const simpRem = simplifyFraction(remNum, commonD);

              return (
                <>
                  {/* GASING Separation Visual Box */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <MathFraction
                        whole={fracA.whole}
                        num={fracA.num}
                        den={fracA.den}
                        size="lg"
                        colorClass="text-amber-700"
                      />
                      <span className="font-mono text-xl font-bold">+</span>
                      <MathFraction
                        whole={fracB.whole}
                        num={fracB.num}
                        den={fracB.den}
                        size="lg"
                        colorClass="text-sky-700"
                      />
                      <span className="font-mono text-xl font-bold">=</span>
                      <div className="px-3 py-1.5 rounded-lg bg-emerald-100/80 border border-emerald-300 text-emerald-950 font-mono text-xs font-semibold">
                        Bulat: ({fracA.whole} + {fracB.whole} = {wholeSum})
                      </div>
                      <span className="font-mono font-bold">+</span>
                      <div className="px-3 py-1.5 rounded-lg bg-amber-100/80 border border-amber-300 text-amber-950 font-mono text-xs font-semibold">
                        Pecahan: ({fracA.num}/{fracA.den} + {fracB.num}/{fracB.den} = {numSum}/{commonD})
                      </div>
                      <span className="font-mono text-xl font-bold">=</span>
                      <MathFraction
                        whole={finalWhole}
                        num={simpRem.num}
                        den={simpRem.den}
                        size="xl"
                        colorClass="text-emerald-700"
                      />
                    </div>
                  </div>

                  {/* Grouped Visual Representation: Whole Group vs Fraction Group */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-900">
                          Langkah 1 GASING: Kumpulkan Bilangan Bulat
                        </span>
                        <span className="font-mono text-xs font-bold text-emerald-700">
                          {fracA.whole} + {fracB.whole} = {wholeSum} Utuh
                        </span>
                      </div>
                      <ConcreteFractionView
                        whole={wholeSum}
                        num={0}
                        den={commonD}
                        visualMode={visualMode}
                        accentTone="emerald"
                        compact
                      />
                    </div>

                    <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-900">
                          Langkah 2 GASING: Jumlahkan Pecahan Saja
                        </span>
                        <span className="font-mono text-xs font-bold text-amber-800">
                          {numSum}/{commonD}{' '}
                          {carryWhole > 0 ? `= ${carryWhole} Utuh + ${remNum}/${commonD}` : ''}
                        </span>
                      </div>
                      <ConcreteFractionView
                        whole={carryWhole}
                        num={remNum}
                        den={commonD}
                        visualMode={visualMode}
                        accentTone="amber"
                        compact
                      />
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* ============================================================
            TOPIC 10: PENGURANGAN PECAHAN CAMPURAN (METODE GASING)
           ============================================================ */}
        {topic.id === 10 && (
          <div className="space-y-6">
            {(() => {
              const isSameDen = fracA.den === fracB.den;
              const commonD = isSameDen ? fracA.den : fracA.den * fracB.den;
              const normNumA = isSameDen ? fracA.num : fracA.num * fracB.den;
              const normNumB = isSameDen ? fracB.num : fracB.num * fracA.den;

              const mustBorrow = normNumA < normNumB && fracA.whole > 0;
              const activeBorrow = mustBorrow && borrowedOneWhole;

              const effectiveWholeA = activeBorrow ? fracA.whole - 1 : fracA.whole;
              const effectiveNumA = activeBorrow ? normNumA + commonD : normNumA;

              const impA = toImproper(fracA);
              const impB = toImproper(fracB);
              const rawDiffNum = impA.num * fracB.den - impB.num * fracA.den;
              const rawDiffDen = fracA.den * fracB.den;
              const finalMixed = toMixed(rawDiffNum, rawDiffDen);

              return (
                <>
                  {/* GASING Subtraction Banner */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <MathFraction
                        whole={fracA.whole}
                        num={fracA.num}
                        den={fracA.den}
                        size="lg"
                        colorClass="text-amber-700"
                      />
                      <span className="font-mono text-xl font-bold">−</span>
                      <MathFraction
                        whole={fracB.whole}
                        num={fracB.num}
                        den={fracB.den}
                        size="lg"
                        colorClass="text-rose-700"
                      />

                      {activeBorrow && (
                        <>
                          <ArrowRight className="w-4 h-4 text-sky-600" />
                          <div className="px-2.5 py-1 rounded-lg bg-sky-100 border border-sky-300 flex items-center gap-2">
                            <span className="text-xs font-medium text-sky-900">Setelah Pinjam 1 Utuh:</span>
                            <MathFraction
                              whole={effectiveWholeA}
                              num={effectiveNumA}
                              den={commonD}
                              size="md"
                              colorClass="text-sky-800"
                            />
                            <span className="font-mono font-bold">−</span>
                            <MathFraction
                              whole={fracB.whole}
                              num={normNumB}
                              den={commonD}
                              size="md"
                              colorClass="text-rose-700"
                            />
                          </div>
                        </>
                      )}

                      <span className="font-mono text-xl font-bold">=</span>
                      <MathFraction
                        whole={finalMixed.whole}
                        num={finalMixed.num}
                        den={finalMixed.den}
                        size="xl"
                        colorClass="text-emerald-700"
                      />
                    </div>

                    {mustBorrow && (
                      <button
                        type="button"
                        onClick={() => setBorrowedOneWhole((v) => !v)}
                        className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                          borrowedOneWhole
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                        }`}
                      >
                        <Scissors className="w-3.5 h-3.5" />
                        {borrowedOneWhole
                          ? 'Sudah Dipinjam 1 Utuh (Klik untuk Reset)'
                          : `Pinjam 1 Utuh GASING (Ubah 1 → ${commonD}/${commonD})`}
                      </button>
                    )}
                  </div>

                  {mustBorrow && !borrowedOneWhole && (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
                      <strong>Perhatikan (Situasi Pinjam 1 Utuh GASING):</strong> Pecahan{' '}
                      <span className="font-mono font-bold">{normNumA}/{commonD}</span> lebih kecil dari{' '}
                      <span className="font-mono font-bold">{normNumB}/{commonD}</span>. Klik tombol{' '}
                      <strong>"Pinjam 1 Utuh GASING"</strong> di atas untuk membelah 1 balok/pizza utuh menjadi{' '}
                      <span className="font-mono font-bold">{commonD}/{commonD}</span> sehingga pecahan menjadi{' '}
                      <span className="font-mono font-bold">
                        ({normNumA} + {commonD})/{commonD} = {normNumA + commonD}/{commonD}
                      </span>
                      !
                    </div>
                  )}

                  {/* Concrete Visual before/after borrow */}
                  <div className="space-y-4">
                    <ConcreteFractionView
                      whole={effectiveWholeA}
                      num={effectiveNumA}
                      den={commonD}
                      visualMode={visualMode}
                      accentTone={activeBorrow ? 'sky' : 'amber'}
                      label={
                        activeBorrow
                          ? `Pecahan Pertama (Setelah 1 Utuh Dibelah Menjadi ${commonD}/${commonD}): ${effectiveWholeA} Utuh dan ${effectiveNumA}/${commonD}`
                          : `Pecahan Pertama: ${fracA.whole} Utuh dan ${normNumA}/${commonD}`
                      }
                    />

                    <ConcreteFractionView
                      whole={finalMixed.whole}
                      num={finalMixed.num}
                      den={finalMixed.den}
                      visualMode={visualMode}
                      accentTone="emerald"
                      label={`Hasil Akhir Pengurangan: ${finalMixed.whole} Utuh ${
                        finalMixed.num > 0 ? `dan ${finalMixed.num}/${finalMixed.den}` : ''
                      }`}
                    />
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* ============================================================
            TOPIC 11: PERKALIAN PECAHAN (2D AREA MODEL & CORET SILANG GASING)
           ============================================================ */}
        {topic.id === 11 && (
          <div className="space-y-6">
            {(() => {
              const g1 = gcd(fracA.num, fracB.den);
              const g2 = gcd(fracB.num, fracA.den);
              const canCancel = g1 > 1 || g2 > 1;
              const sNumA = fracA.num / g1;
              const sDenB = fracB.den / g1;
              const sNumB = fracB.num / g2;
              const sDenA = fracA.den / g2;
              const rawNum = fracA.num * fracB.num;
              const rawDen = fracA.den * fracB.den;
              const simp = simplifyFraction(rawNum, rawDen);

              return (
                <>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <MathFraction
                        num={fracA.num}
                        den={fracA.den}
                        size="xl"
                        colorClass="text-amber-700"
                        strikeNum={showCrossCancel && g1 > 1 ? sNumA : null}
                        strikeDen={showCrossCancel && g2 > 1 ? sDenA : null}
                      />
                      <span className="font-mono text-xl font-bold">×</span>
                      <MathFraction
                        num={fracB.num}
                        den={fracB.den}
                        size="xl"
                        colorClass="text-sky-700"
                        strikeNum={showCrossCancel && g2 > 1 ? sNumB : null}
                        strikeDen={showCrossCancel && g1 > 1 ? sDenB : null}
                      />
                      <span className="font-mono text-xl font-bold">=</span>
                      <MathFraction num={rawNum} den={rawDen} size="lg" colorClass="text-slate-700" />
                      {simp.factor > 1 && (
                        <>
                          <span className="font-mono text-sm text-slate-400">=</span>
                          <MathFraction
                            num={simp.num}
                            den={simp.den}
                            size="xl"
                            colorClass="text-emerald-700"
                          />
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowCrossCancel((v) => !v)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                        showCrossCancel
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white border border-slate-300 text-slate-700'
                      }`}
                    >
                      {showCrossCancel ? 'Coret Silang GASING: Aktif' : 'Aktifkan Coret Silang GASING'}
                    </button>
                  </div>

                  {canCancel && showCrossCancel && (
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                      <strong>Trik Coret Silang GASING:</strong>{' '}
                      {g1 > 1 && (
                        <span>
                          Pasangan ({fracA.num} dan {fracB.den}) sama-sama dibagi {g1} menjadi ({sNumA} dan {sDenB}).{' '}
                        </span>
                      )}
                      {g2 > 1 && (
                        <span>
                          Pasangan ({fracB.num} dan {fracA.den}) sama-sama dibagi {g2} menjadi ({sNumB} dan {sDenA}).{' '}
                        </span>
                      )}
                      Hasil langsung sederhana: <strong>{simp.num}/{simp.den}</strong>!
                    </div>
                  )}

                  <AreaMultiplicationGrid
                    numA={fracA.num}
                    denA={fracA.den}
                    numB={fracB.num}
                    denB={fracB.den}
                    visualMode={visualMode}
                  />
                </>
              );
            })()}
          </div>
        )}

        {/* ============================================================
            TOPIC 12: PEMBAGIAN PECAHAN (MEASUREMENT BAR & BALIK-KALI GASING)
           ============================================================ */}
        {topic.id === 12 && (
          <div className="space-y-6">
            {(() => {
              const resNum = fracA.num * fracB.den;
              const resDen = fracA.den * fracB.num;
              const simp = simplifyFraction(resNum, resDen);
              const mixed = toMixed(resNum, resDen);
              const commonGrid = lcm(fracA.den, fracB.den);
              const partsAInGrid = (fracA.num * commonGrid) / fracA.den;
              const partsBInGrid = (fracB.num * commonGrid) / fracB.den;

              return (
                <>
                  {/* Flip and Multiply Banner */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-around gap-3">
                    <div className="flex items-center gap-2.5">
                      <MathFraction num={fracA.num} den={fracA.den} size="lg" colorClass="text-amber-700" />
                      <span className="font-mono text-xl font-bold text-rose-600">÷</span>
                      <MathFraction num={fracB.num} den={fracB.den} size="lg" colorClass="text-sky-700" />
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100/80 px-3 py-1.5 rounded-lg border border-emerald-300">
                      <span>GASING (Balik & Kali)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex items-center gap-2.5">
                      <MathFraction num={fracA.num} den={fracA.den} size="lg" colorClass="text-amber-700" />
                      <span className="font-mono text-xl font-bold text-emerald-700">×</span>
                      <MathFraction num={fracB.den} den={fracB.num} size="lg" colorClass="text-emerald-700" />
                      <span className="font-mono text-xl font-bold">=</span>
                      <MathFraction num={simp.num} den={simp.den} size="xl" colorClass="text-slate-900" />
                      {simp.num >= simp.den && simp.den > 1 && (
                        <span className="text-xs font-mono text-slate-500">
                          ({mixed.whole}
                          {mixed.num > 0 ? ` ${mixed.num}/${mixed.den}` : ''})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Singapore Math Measurement Comparison */}
                  <div className="space-y-4">
                    <div className="text-xs text-slate-600">
                      <strong>Visualisasi Matematika Singapura:</strong> Ada berapa banyak potongan berukuran{' '}
                      <span className="font-mono font-bold text-sky-700">{fracB.num}/{fracB.den}</span> yang dapat dimuat di dalam{' '}
                      <span className="font-mono font-bold text-amber-700">{fracA.num}/{fracA.den}</span>?
                    </div>

                    <ConcreteFractionView
                      num={partsAInGrid}
                      den={commonGrid}
                      visualMode={visualMode}
                      accentTone="amber"
                      label={`Panjang Yang Dibagi (${fracA.num}/${fracA.den} = ${partsAInGrid}/${commonGrid} bagian skala bersama)`}
                    />

                    <ConcreteFractionView
                      num={partsBInGrid}
                      den={commonGrid}
                      visualMode={visualMode}
                      accentTone="sky"
                      label={`Ukuran 1 Kelompok Pembagi (${fracB.num}/${fracB.den} = ${partsBInGrid}/${commonGrid} bagian skala bersama)`}
                    />

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                      Karena pecahan pertama bernilai <strong>{partsAInGrid}</strong> unit skala dan setiap pembagi membutuhkan{' '}
                      <strong>{partsBInGrid}</strong> unit skala, maka banyaknya kelompok yang terbentuk adalah{' '}
                      <span className="font-mono font-bold text-emerald-700">
                        {partsAInGrid} ÷ {partsBInGrid} = {simp.num}/{simp.den}{' '}
                        {simp.den === 1 ? `(${simp.num} kelompok penuh)` : 'kelompok'}
                      </span>
                      .
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* RIGHT ZONE: CONTROL & CONCEPT DECK (38% / 5 cols on 12-col grid) */}
      <div className="lg:col-span-5 space-y-5">
        {/* Topic 5 Special Controls: Equalize Denominator & Edit Cards */}
        {topic.id === 5 && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900">
                Pengatur Kartu & Penyebut Bersama (KPK)
              </h3>
              <span className="text-xs text-sky-700 font-mono font-semibold tabular-nums">
                KPK = {sortCards.reduce((acc, c) => lcm(acc, c.den), 1)}
              </span>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-700">
                Ubah Nilai Kartu Pecahan yang Diurutkan:
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {sortCards.map((card, idx) => (
                  <div
                    key={card.id}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>Kartu #{idx + 1}</span>
                      <MathFraction num={card.num} den={card.den} size="sm" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>Pembilang: {card.num}</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={card.den - 1 || 1}
                        value={card.num}
                        onChange={(e) => {
                          const newNum = Number(e.target.value);
                          setSortCards((prev) =>
                            prev.map((c, i) => (i === idx ? { ...c, num: newNum } : c))
                          );
                        }}
                        className="w-full accent-amber-600 cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>Penyebut: {card.den}</span>
                      </div>
                      <select
                        aria-label={`Penyebut Kartu ${idx + 1}`}
                        value={card.den}
                        onChange={(e) => {
                          const newDen = Number(e.target.value);
                          setSortCards((prev) =>
                            prev.map((c, i) =>
                              i === idx
                                ? { ...c, den: newDen, num: Math.min(c.num, newDen - 1 || 1) }
                                : c
                            )
                          );
                        }}
                        className="w-full px-2 py-1 text-xs font-mono bg-white border border-slate-300 rounded"
                      >
                        {[2, 3, 4, 5, 6, 8, 9, 10, 12].map((d) => (
                          <option key={d} value={d}>
                            Per-{d} (/{d})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Parameter Controls Card */}
        {topic.id !== 5 && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900">Pengatur Nilai Pecahan</h3>
              <span className="text-xs text-slate-500 font-mono tabular-nums">Parameter Live</span>
            </div>

            {/* Fraction A Controls */}
            <div className="space-y-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-900">
                  {topic.id <= 2 || topic.id === 8 ? 'Pecahan Utama' : 'Pecahan Pertama (A)'}
                </span>
                <MathFraction
                  whole={topic.id >= 8 && topic.id <= 10 ? fracA.whole : 0}
                  num={fracA.num}
                  den={fracA.den}
                  size="sm"
                  colorClass="text-amber-700"
                />
              </div>

              {/* Whole Number Slider for Mixed Fraction Topics (8, 9, 10) */}
              {topic.id >= 8 && topic.id <= 10 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600">
                    <label htmlFor="slider-whole-a">Bilangan Bulat Utuh (A):</label>
                    <span className="font-mono font-bold tabular-nums">{fracA.whole} Utuh</span>
                  </div>
                  <input
                    id="slider-whole-a"
                    type="range"
                    min={1}
                    max={4}
                    value={fracA.whole}
                    onChange={(e) => {
                      setBorrowedOneWhole(false);
                      setFracA((prev) => ({ ...prev, whole: Number(e.target.value) }));
                    }}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>
              )}

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-600">
                  <label htmlFor="slider-num-a">Pembilang (Bagian Diambil):</label>
                  <span className="font-mono font-bold tabular-nums">{fracA.num} potong</span>
                </div>
                <input
                  id="slider-num-a"
                  type="range"
                  min={1}
                  max={fracA.den}
                  value={fracA.num}
                  onChange={(e) => {
                    setBorrowedOneWhole(false);
                    setFracA((prev) => ({ ...prev, num: Number(e.target.value) }));
                  }}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-600">
                  <label htmlFor="slider-den-a">Penyebut (Total Potongan per Utuh):</label>
                  <span className="font-mono font-bold tabular-nums">{fracA.den} bagian</span>
                </div>
                <input
                  id="slider-den-a"
                  type="range"
                  min={2}
                  max={topic.id === 2 ? 6 : 10}
                  value={fracA.den}
                  onChange={(e) => {
                    setBorrowedOneWhole(false);
                    updateDenA(Number(e.target.value));
                  }}
                  className="w-full accent-slate-700 cursor-pointer"
                />
              </div>
            </div>

            {/* Fraction B Controls (for two-fraction topics) */}
            {topic.id >= 3 && topic.id !== 5 && topic.id !== 8 && (
              <div className="space-y-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-sky-900">Pecahan Kedua (B)</span>
                  <MathFraction
                    whole={topic.id === 9 || topic.id === 10 ? fracB.whole : 0}
                    num={fracB.num}
                    den={fracB.den}
                    size="sm"
                    colorClass="text-sky-700"
                  />
                </div>

                {(topic.id === 9 || topic.id === 10) && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-600">
                      <label htmlFor="slider-whole-b">Bilangan Bulat Utuh (B):</label>
                      <span className="font-mono font-bold tabular-nums">{fracB.whole} Utuh</span>
                    </div>
                    <input
                      id="slider-whole-b"
                      type="range"
                      min={1}
                      max={topic.id === 10 ? Math.max(1, fracA.whole - 1) : 3}
                      value={fracB.whole}
                      onChange={(e) => {
                        setBorrowedOneWhole(false);
                        setFracB((prev) => ({ ...prev, whole: Number(e.target.value) }));
                      }}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600">
                    <label htmlFor="slider-num-b">Pembilang B:</label>
                    <span className="font-mono font-bold tabular-nums">{fracB.num} potong</span>
                  </div>
                  <input
                    id="slider-num-b"
                    type="range"
                    min={1}
                    max={fracB.den}
                    value={fracB.num}
                    onChange={(e) => {
                      setBorrowedOneWhole(false);
                      setFracB((prev) => ({ ...prev, num: Number(e.target.value) }));
                    }}
                    className="w-full accent-sky-600 cursor-pointer"
                  />
                </div>

                {topic.id !== 3 && topic.id !== 6 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-600">
                      <label htmlFor="slider-den-b">Penyebut B:</label>
                      <span className="font-mono font-bold tabular-nums">{fracB.den} bagian</span>
                    </div>
                    <input
                      id="slider-den-b"
                      type="range"
                      min={2}
                      max={10}
                      value={fracB.den}
                      onChange={(e) => {
                        setBorrowedOneWhole(false);
                        const d = Number(e.target.value);
                        setFracB((prev) => ({ ...prev, den: d, num: Math.min(prev.num, d) }));
                      }}
                      className="w-full accent-slate-700 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Dual Pedagogical Deck: Matematika Singapura vs Metode GASING */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <div className="text-xs text-slate-500">Sintesis Dua Metode</div>
              <h3 className="text-sm font-bold text-slate-900">
                Matematika Singapura & Metode GASING
              </h3>
            </div>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {[1, 2, 3].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setActiveStep(st)}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                    activeStep === st ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  {st === 1 ? 'Singapura' : st === 2 ? 'GASING' : 'Keduanya'}
                </button>
              ))}
            </div>
          </div>

          {(activeStep === 1 || activeStep === 3) && (
            <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-200 space-y-1.5">
              <div className="text-xs font-bold text-sky-900 flex items-center justify-between">
                <span>1. Pendekatan Matematika Singapura (CPA / Bar Model)</span>
                <span className="font-mono text-[11px] text-sky-700">Visual Konkrit</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{topic.singaporeConcept}</p>
            </div>
          )}

          {(activeStep === 2 || activeStep === 3) && (
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1.5">
              <div className="text-xs font-bold text-emerald-900 flex items-center justify-between">
                <span>2. Pendekatan Metode GASING (Gampang, Asyik, Menyenangkan)</span>
                <span className="font-mono text-[11px] text-emerald-700">Cepat & Logis</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{topic.gasingConcept}</p>
            </div>
          )}

          {/* Topic Navigation Footer */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              disabled={topic.id <= 1}
              onClick={() => onSelectTopic(topic.id - 1)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              ← Materi Sebelumnya
            </button>
            <span className="text-xs font-mono tabular-nums text-slate-500">
              {topic.id} / {totalTopics}
            </span>
            <button
              type="button"
              disabled={topic.id >= totalTopics}
              onClick={() => onSelectTopic(topic.id + 1)}
              className="px-3 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-40 rounded-lg flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
            >
              Materi Berikutnya <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
