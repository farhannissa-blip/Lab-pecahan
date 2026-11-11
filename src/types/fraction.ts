export type VisualMode = 'wood' | 'pizza' | 'both';

export type ActiveTab = 'simulasi' | 'meja-potong' | 'kuis' | 'panduan';

export interface MixedFraction {
  whole: number;
  num: number;
  den: number;
}

export interface TopicDefinition {
  id: number;
  code: string;
  title: string;
  shortTitle: string;
  category: 'Dasar & Ekuivalensi' | 'Perbandingan & Urutan' | 'Penjumlahan' | 'Pecahan Campuran GASING' | 'Perkalian & Pembagian';
  summary: string;
  singaporeConcept: string;
  gasingConcept: string;
  defaultA: MixedFraction;
  defaultB: MixedFraction;
  defaultMultiplier?: number;
  defaultOrderList?: Array<{ id: string; num: number; den: number }>;
}

export type QuizQuestionType =
  | 'build-slices'
  | 'compare-sign'
  | 'sort-cards'
  | 'fraction-input'
  | 'mixed-input';

export interface QuizQuestion {
  id: string;
  topicId: number;
  topicTitle: string;
  type: QuizQuestionType;
  questionText: string;
  contextStory: string;
  visualA: MixedFraction;
  visualB?: MixedFraction;
  operation?: '+' | '-' | '×' | '÷' | 'compare' | 'equivalent';
  targetDenominator?: number;
  // For build-slices: target fraction value
  targetFraction?: MixedFraction;
  // For compare-sign: '<' | '=' | '>'
  correctSign?: '<' | '=' | '>';
  // For sort-cards: list of fractions to sort ascending
  initialCards?: Array<{ id: string; label: string; num: number; den: number }>;
  correctCardOrder?: string[];
  // Explanations
  singaporeSteps: string[];
  gasingSteps: string[];
}
