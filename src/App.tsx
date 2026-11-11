/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ActiveTab, VisualMode } from './types/fraction';
import { CURRICULUM_TOPICS } from './utils/math';
import { TopicInteractiveStage } from './components/TopicInteractiveStage';
import { DragDropSlicerWorkbench } from './components/DragDropSlicerWorkbench';
import { InteractiveQuiz } from './components/InteractiveQuiz';
import { MethodGuideSection } from './components/MethodGuideSection';
import { GoogleSitesEmbedModal } from './components/GoogleSitesEmbedModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('simulasi');
  const [selectedTopicId, setSelectedTopicId] = useState<number>(1);
  const [visualMode, setVisualMode] = useState<VisualMode>('both');
  const [quizTopicFilter, setQuizTopicFilter] = useState<number | 'all'>('all');
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState<boolean>(false);

  const currentTopic =
    CURRICULUM_TOPICS.find((t) => t.id === selectedTopicId) || CURRICULUM_TOPICS[0];

  const handleOpenTopicQuiz = (topicId: number) => {
    setQuizTopicFilter(topicId);
    setActiveTab('kuis');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      {/* STRICT 3-ZONE TOP BAR CONTRACT */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#simulasi"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('simulasi');
            }}
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            PecahanLab
          </a>

          {/* Zone 2: 4 concise single-line text navigation links */}
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-600 overflow-x-auto">
            <a
              href="#simulasi"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('simulasi');
              }}
              className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
                activeTab === 'simulasi'
                  ? 'text-sky-700 font-semibold underline underline-offset-8 decoration-2 decoration-sky-600'
                  : 'hover:text-slate-900'
              }`}
            >
              Simulasi Materi
            </a>
            <a
              href="#meja-potong"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('meja-potong');
              }}
              className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
                activeTab === 'meja-potong'
                  ? 'text-sky-700 font-semibold underline underline-offset-8 decoration-2 decoration-sky-600'
                  : 'hover:text-slate-900'
              }`}
            >
              Meja Potong
            </a>
            <a
              href="#kuis"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('kuis');
              }}
              className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
                activeTab === 'kuis'
                  ? 'text-sky-700 font-semibold underline underline-offset-8 decoration-2 decoration-sky-600'
                  : 'hover:text-slate-900'
              }`}
            >
              Latihan Kuis
            </a>
            <a
              href="#panduan"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('panduan');
              }}
              className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
                activeTab === 'panduan'
                  ? 'text-sky-700 font-semibold underline underline-offset-8 decoration-2 decoration-sky-600'
                  : 'hover:text-slate-900'
              }`}
            >
              Panduan Metode
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setIsEmbedModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              Kode Google Sites
            </button>
          </div>
        </div>
      </header>

      {/* WORKSPACE CONTEXT & CONCRETE MODEL TOOLBAR */}
      <div className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-900">
              Simulasi Mandiri Pecahan
            </span>
            <span aria-hidden="true">·</span>
            <span>Kombinasi Metode GASING & Matematika Singapura (CPA)</span>
            <span aria-hidden="true">·</span>
            <span>12 Materi Lengkap</span>
          </div>

          {/* Interactive Concrete Visual Mode Switcher */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-slate-600 whitespace-nowrap shrink-0">
              Model Konkrit:
            </span>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setVisualMode('wood')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  visualMode === 'wood'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Balok Kayu
              </button>
              <button
                type="button"
                onClick={() => setVisualMode('pizza')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  visualMode === 'pizza'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Potongan Pizza
              </button>
              <button
                type="button"
                onClick={() => setVisualMode('both')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  visualMode === 'both'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Balok Kayu + Pizza
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-6 space-y-6">
        {activeTab === 'simulasi' && (
          <>
            {/* 12 Curriculum Modules Selector Grid */}
            <section aria-label="Daftar 12 Materi Pecahan" className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <strong className="text-slate-900">Pilih Materi Pembelajaran (1 – 12):</strong>
                  <span>Klik materi untuk mengganti simulasi interaktif di bawah</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleOpenTopicQuiz(selectedTopicId)}
                    className="text-xs font-semibold text-sky-700 hover:text-sky-800 whitespace-nowrap shrink-0"
                  >
                    Uji Kuis Materi {currentTopic.code} →
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {CURRICULUM_TOPICS.map((t) => {
                  const isActive = t.id === selectedTopicId;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTopicId(t.id)}
                      className={`px-3 py-2 rounded-lg text-left transition-all border ${
                        isActive
                          ? 'bg-sky-600 text-white border-sky-700 shadow-2xs'
                          : 'bg-slate-50/80 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <div
                        className={`text-[11px] font-mono tabular-nums ${
                          isActive ? 'text-sky-100' : 'text-slate-400'
                        }`}
                      >
                        Materi {t.code}
                      </div>
                      <div className="text-xs font-semibold truncate whitespace-nowrap">
                        {t.shortTitle}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Two-Zone Interactive Sandbox for Selected Topic */}
            <TopicInteractiveStage
              topic={currentTopic}
              visualMode={visualMode}
              onSelectTopic={(id) => setSelectedTopicId(id)}
              totalTopics={CURRICULUM_TOPICS.length}
            />
          </>
        )}

        {activeTab === 'meja-potong' && (
          <DragDropSlicerWorkbench visualMode={visualMode} />
        )}

        {activeTab === 'kuis' && (
          <InteractiveQuiz
            visualMode={visualMode}
            selectedTopicFilter={quizTopicFilter}
            onChangeTopicFilter={setQuizTopicFilter}
          />
        )}

        {activeTab === 'panduan' && (
          <MethodGuideSection
            onOpenTopicSimulation={(topicId) => {
              setSelectedTopicId(topicId);
              setActiveTab('simulasi');
            }}
          />
        )}
      </main>

      {/* QUIET FOOTER */}
      <footer className="bg-white border-t border-slate-200 px-6 py-4 mt-8">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            PecahanLab · Media Pembelajaran Interaktif Pecahan Metode GASING & Matematika Singapura
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('meja-potong')}
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Meja Drag & Drop
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setActiveTab('kuis')}
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Kuis 12 Materi
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setIsEmbedModalOpen(true)}
              className="text-sky-700 font-semibold hover:text-sky-900 transition-colors whitespace-nowrap shrink-0"
            >
              Salin Kode Google Sites
            </button>
          </div>
        </div>
      </footer>

      {/* GOOGLE SITES EMBED CODE GENERATOR MODAL */}
      <GoogleSitesEmbedModal
        isOpen={isEmbedModalOpen}
        onClose={() => setIsEmbedModalOpen(false)}
        defaultTopicId={selectedTopicId}
        defaultVisualMode={visualMode}
      />
    </div>
  );
}
