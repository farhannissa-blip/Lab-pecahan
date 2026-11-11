import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { CURRICULUM_TOPICS } from '../utils/math';

interface MethodGuideSectionProps {
  onOpenTopicSimulation: (topicId: number) => void;
}

export const MethodGuideSection: React.FC<MethodGuideSectionProps> = ({
  onOpenTopicSimulation,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
        <div className="text-xs text-slate-500">
          Pedagogi Terpadu · Concrete-Pictorial-Abstract (CPA) & Gampang Asyik Menyenangkan (GASING)
        </div>
        <h2 className="text-2xl font-bold text-slate-900">
          Sinergi Metode Matematika Singapura & Metode GASING
        </h2>
        <p className="text-sm text-slate-600 max-w-4xl leading-relaxed">
          Aplikasi ini menggabungkan kekuatan visualisasi <strong>Bar Model Matematika Singapura</strong> (melalui balok kayu dan potongan pizza konkrit) dengan kecepatan berhitung logis <strong>Metode GASING</strong> sehingga siswa memahami alasan konkrit di balik setiap rumus cepat.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
          <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-200 space-y-1.5">
            <h3 className="text-sm font-bold text-sky-950">
              Prinsip Matematika Singapura (CPA & Bar Model)
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              Setiap konsep dimulai dari benda nyata (<strong>Concrete</strong>: potongan pizza/kayu), dilanjutkan ke diagram batang sejajar (<strong>Pictorial</strong>: Bar Model untuk membandingkan panjang dan membelah petak), hingga notasi simbolik (<strong>Abstract</strong>: angka pecahan).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1.5">
            <h3 className="text-sm font-bold text-emerald-950">
              Prinsip Metode GASING (Cepat, Logis, Tanpa Angka Raksasa)
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              Menggunakan pola kali silang untuk penyebut berbeda, memisahkan bilangan bulat dan pecahan pada operasi pecahan campuran (sehingga tidak perlu mengubah ke pecahan biasa berangka besar), teknik pinjam 1 utuh (<span className="font-mono">c/c</span>), serta coret silang pada perkalian dan pembagian.
            </p>
          </div>
        </div>
      </div>

      {/* Complete 12 Topics Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CURRICULUM_TOPICS.map((topic) => (
          <div
            key={topic.id}
            className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-4 hover:border-slate-300 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-slate-500">{topic.category}</div>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{topic.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenTopicSimulation(topic.id)}
                  className="px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
                >
                  Buka Simulasi <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-slate-600">{topic.summary}</p>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <strong className="text-sky-900">Visual Singapura:</strong>{' '}
                  <span className="text-slate-700">{topic.singaporeConcept}</span>
                </div>
                <div>
                  <strong className="text-emerald-900">Metode GASING:</strong>{' '}
                  <span className="text-slate-700">{topic.gasingConcept}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
