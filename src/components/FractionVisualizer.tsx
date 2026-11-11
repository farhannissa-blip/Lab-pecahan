import React from 'react';
import { VisualMode } from '../types/fraction';

interface MathFractionProps {
  whole?: number;
  num: number;
  den: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  colorClass?: string;
  strikeNum?: number | null;
  strikeDen?: number | null;
  showWholeZero?: boolean;
}

export const MathFraction: React.FC<MathFractionProps> = ({
  whole = 0,
  num,
  den,
  size = 'md',
  colorClass = 'text-slate-900',
  strikeNum = null,
  strikeDen = null,
  showWholeZero = false,
}) => {
  const sizeMap = {
    sm: { whole: 'text-base', frac: 'text-xs', bar: 'h-[1.5px]', minW: 'min-w-[18px]' },
    md: { whole: 'text-xl', frac: 'text-sm', bar: 'h-[2px]', minW: 'min-w-[24px]' },
    lg: { whole: 'text-2xl', frac: 'text-base', bar: 'h-[2px]', minW: 'min-w-[30px]' },
    xl: { whole: 'text-3xl', frac: 'text-lg', bar: 'h-[2.5px]', minW: 'min-w-[36px]' },
  }[size];

  const hasWhole = whole !== 0 || showWholeZero;
  const hasFrac = num !== 0 || !hasWhole;

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono font-semibold tabular-nums align-middle ${colorClass}`}>
      {hasWhole && (
        <span className={`${sizeMap.whole} leading-none tracking-tight`}>{whole}</span>
      )}
      {hasFrac && (
        <span className={`inline-flex flex-col items-center justify-center leading-none ${sizeMap.minW}`}>
          <span className={`${sizeMap.frac} px-1 pb-0.5 relative`}>
            {strikeNum !== null ? (
              <span className="inline-flex items-center gap-0.5">
                <span className="line-through text-slate-400 decoration-rose-500 decoration-2">{num}</span>
                <span className="text-emerald-700 font-bold">{strikeNum}</span>
              </span>
            ) : (
              num
            )}
          </span>
          <span className={`w-full bg-current ${sizeMap.bar} rounded-full`} />
          <span className={`${sizeMap.frac} px-1 pt-0.5 relative`}>
            {strikeDen !== null ? (
              <span className="inline-flex items-center gap-0.5">
                <span className="line-through text-slate-400 decoration-rose-500 decoration-2">{den}</span>
                <span className="text-emerald-700 font-bold">{strikeDen}</span>
              </span>
            ) : (
              den
            )}
          </span>
        </span>
      )}
    </span>
  );
};

interface SingleUnitProps {
  activeParts: number;
  totalParts: number;
  subdivideBy?: number;
  secondaryParts?: number; // For showing second addend in same bar
  accentTone?: 'amber' | 'sky' | 'emerald' | 'rose';
  interactive?: boolean;
  onTogglePart?: (partIndex: number) => void;
  onPropChange?: (newActiveParts: number) => void;
  unitLabel?: string;
  compact?: boolean;
  draggablePieces?: boolean;
  onDragStartPiece?: (e: React.DragEvent, den: number) => void;
}

export const SingleWoodBlock: React.FC<SingleUnitProps> = ({
  activeParts,
  totalParts,
  subdivideBy = 1,
  secondaryParts = 0,
  accentTone = 'amber',
  interactive = false,
  onTogglePart,
  onPropChange,
  unitLabel,
  compact = false,
  draggablePieces = false,
  onDragStartPiece,
}) => {
  const safeDen = Math.max(1, Math.min(36, totalParts));
  const safeNum = Math.max(0, Math.min(safeDen, activeParts));
  const safeSec = Math.max(0, Math.min(safeDen - safeNum, secondaryParts));

  const tonePalette = {
    amber: {
      fill: 'from-[#D97706] via-[#B45309] to-[#92400E]',
      topBevel: 'bg-[#F59E0B]/40',
      border: 'border-[#78350F]',
      text: 'text-amber-50',
      grain: 'rgba(254, 243, 199, 0.16)',
    },
    sky: {
      fill: 'from-[#0284C7] via-[#0369A1] to-[#075985]',
      topBevel: 'bg-[#38BDF8]/40',
      border: 'border-[#0C4A6E]',
      text: 'text-sky-50',
      grain: 'rgba(224, 242, 254, 0.18)',
    },
    emerald: {
      fill: 'from-[#059669] via-[#047857] to-[#065F46]',
      topBevel: 'bg-[#34D399]/40',
      border: 'border-[#064E3B]',
      text: 'text-emerald-50',
      grain: 'rgba(209, 250, 229, 0.18)',
    },
    rose: {
      fill: 'from-[#E11D48] via-[#BE123C] to-[#9F1239]',
      topBevel: 'bg-[#FB7185]/40',
      border: 'border-[#881337]',
      text: 'text-rose-50',
      grain: 'rgba(255, 228, 230, 0.18)',
    },
  }[accentTone];

  const handleSegmentClick = (idx: number) => {
    if (!interactive) return;
    if (onTogglePart) {
      onTogglePart(idx);
      return;
    }
    if (onPropChange) {
      // If clicking the last active segment, reduce by 1; otherwise set to idx + 1
      if (idx + 1 === safeNum) {
        onPropChange(idx);
      } else {
        onPropChange(idx + 1);
      }
    }
  };

  return (
    <div className="w-full select-none">
      {unitLabel && (
        <div className="flex items-center justify-between text-xs text-slate-600 mb-1 font-medium">
          <span>{unitLabel}</span>
          <span className="font-mono tabular-nums text-slate-700">
            {safeNum + safeSec}/{safeDen} bagian
          </span>
        </div>
      )}
      <div
        className={`relative w-full ${
          compact ? 'h-11' : 'h-14'
        } rounded-lg bg-[#F1F5F9] border-2 border-slate-300 shadow-inner flex overflow-hidden`}
      >
        {Array.from({ length: safeDen }).map((_, idx) => {
          const isPrimary = idx < safeNum;
          const isSecondary = !isPrimary && idx < safeNum + safeSec;
          const isFilled = isPrimary || isSecondary;
          const activeStyle = isSecondary
            ? {
                fill: 'from-[#0284C7] via-[#0369A1] to-[#075985]',
                topBevel: 'bg-[#38BDF8]/40',
                text: 'text-sky-50',
              }
            : tonePalette;

          return (
            <div
              key={idx}
              draggable={draggablePieces && isFilled}
              onDragStart={(e) => {
                if (draggablePieces && onDragStartPiece) {
                  onDragStartPiece(e, safeDen);
                }
              }}
              onClick={() => handleSegmentClick(idx)}
              title={
                interactive
                  ? `Klik untuk mengatur ${idx + 1}/${safeDen} balok kayu`
                  : `Bagian ${idx + 1} dari ${safeDen} (1/${safeDen})`
              }
              className={`relative flex-1 h-full flex flex-col items-center justify-center transition-all duration-150 ${
                idx < safeDen - 1 ? 'border-r-2 border-slate-700/40' : ''
              } ${
                interactive
                  ? 'cursor-pointer hover:brightness-110 active:scale-[0.99]'
                  : draggablePieces && isFilled
                  ? 'cursor-grab active:cursor-grabbing'
                  : ''
              } ${
                isFilled
                  ? `bg-gradient-to-b ${activeStyle.fill} ${activeStyle.text} shadow-sm`
                  : 'bg-[#E2E8F0]/60 text-slate-500 hover:bg-slate-200/80'
              }`}
            >
              {/* Top wood highlight bevel */}
              {isFilled && (
                <div className={`absolute top-0 inset-x-0 h-1.5 ${activeStyle.topBevel} pointer-events-none`} />
              )}

              {/* Subtle wood grain lines SVG overlay */}
              {isFilled && (
                <svg
                  className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 40"
                >
                  <path
                    d="M0 10 Q 25 6, 50 10 T 100 10 M0 22 Q 35 26, 70 20 T 100 24 M0 33 Q 30 30, 60 34 T 100 32"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                </svg>
              )}

              {/* Subdivision lines for Equivalent Fractions / Common Denominator */}
              {subdivideBy > 1 && (
                <div className="absolute inset-0 flex pointer-events-none">
                  {Array.from({ length: subdivideBy }).map((__, subIdx) => (
                    <div
                      key={subIdx}
                      className={`flex-1 h-full ${
                        subIdx < subdivideBy - 1
                          ? isFilled
                            ? 'border-r border-dashed border-white/65'
                            : 'border-r border-dashed border-slate-400'
                          : ''
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Unit fraction label inside segment if not too crowded */}
              {safeDen <= 12 && (
                <span
                  className={`relative z-10 font-mono tabular-nums font-semibold ${
                    safeDen > 8 ? 'text-[10px]' : 'text-xs'
                  } select-none`}
                >
                  1/{safeDen}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const SinglePizzaPan: React.FC<SingleUnitProps> = ({
  activeParts,
  totalParts,
  subdivideBy = 1,
  secondaryParts = 0,
  accentTone = 'amber',
  interactive = false,
  onTogglePart,
  onPropChange,
  unitLabel,
  compact = false,
}) => {
  const safeDen = Math.max(1, Math.min(24, totalParts));
  const safeNum = Math.max(0, Math.min(safeDen, activeParts));
  const safeSec = Math.max(0, Math.min(safeDen - safeNum, secondaryParts));

  const size = compact ? 124 : 156;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 6;
  const innerR = outerR - 8;

  const cheeseFill =
    accentTone === 'sky'
      ? '#BAE6FD'
      : accentTone === 'emerald'
      ? '#A7F3D0'
      : '#FDE68A';
  const crustFill =
    accentTone === 'sky'
      ? '#0284C7'
      : accentTone === 'emerald'
      ? '#059669'
      : '#D97706';
  const toppingFill =
    accentTone === 'sky'
      ? '#0369A1'
      : accentTone === 'emerald'
      ? '#047857'
      : '#DC2626';

  const handleSliceClick = (idx: number) => {
    if (!interactive) return;
    if (onTogglePart) {
      onTogglePart(idx);
      return;
    }
    if (onPropChange) {
      if (idx + 1 === safeNum) {
        onPropChange(idx);
      } else {
        onPropChange(idx + 1);
      }
    }
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const createSlicePath = (idx: number, total: number, r: number) => {
    if (total === 1) {
      return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`;
    }
    const startAngle = (idx * 360) / total;
    const endAngle = ((idx + 1) * 360) / total;
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
  };

  const totalSubSlices = safeDen * Math.max(1, subdivideBy);

  return (
    <div className="inline-flex flex-col items-center select-none">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible drop-shadow-sm"
      >
        {/* Wooden Pizza Tray Base */}
        <circle
          cx={cx}
          cy={cy}
          r={outerR + 3}
          fill="#F1F5F9"
          stroke="#CBD5E1"
          strokeWidth="2"
        />

        {/* Render each slice */}
        {Array.from({ length: safeDen }).map((_, idx) => {
          const isPrimary = idx < safeNum;
          const isSecondary = !isPrimary && idx < safeNum + safeSec;
          const isFilled = isPrimary || isSecondary;

          const sliceCrust = isSecondary ? '#0284C7' : crustFill;
          const sliceCheese = isSecondary ? '#BAE6FD' : cheeseFill;
          const sliceTopping = isSecondary ? '#0369A1' : toppingFill;

          const midAngle = ((idx + 0.5) * 360) / safeDen;
          const pepPos1 = polarToCartesian(cx, cy, innerR * 0.56, midAngle - (safeDen <= 6 ? 10 : 0));
          const pepPos2 = polarToCartesian(cx, cy, innerR * 0.32, midAngle + (safeDen <= 6 ? 12 : 0));

          return (
            <g
              key={idx}
              onClick={() => handleSliceClick(idx)}
              className={interactive ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}
            >
              {/* Empty Pan Slot or Filled Crust */}
              <path
                d={createSlicePath(idx, safeDen, outerR)}
                fill={isFilled ? sliceCrust : '#E2E8F0'}
                stroke="#475569"
                strokeWidth="1.2"
              />
              {/* Melted Cheese Inner Layer */}
              {isFilled && (
                <path
                  d={createSlicePath(idx, safeDen, innerR)}
                  fill={sliceCheese}
                  stroke={sliceCrust}
                  strokeWidth="1"
                />
              )}
              {/* Pepperoni Toppings */}
              {isFilled && safeDen <= 12 && (
                <>
                  <circle cx={pepPos1.x} cy={pepPos1.y} r={compact ? 4 : 5.5} fill={sliceTopping} opacity="0.88" />
                  {safeDen <= 8 && (
                    <circle cx={pepPos2.x} cy={pepPos2.y} r={compact ? 3.2 : 4.2} fill={sliceTopping} opacity="0.85" />
                  )}
                </>
              )}
            </g>
          );
        })}

        {/* Subdivision radial lines if subdivideBy > 1 */}
        {subdivideBy > 1 &&
          Array.from({ length: totalSubSlices }).map((_, subIdx) => {
            const angle = (subIdx * 360) / totalSubSlices;
            const edge = polarToCartesian(cx, cy, outerR, angle);
            return (
              <line
                key={subIdx}
                x1={cx}
                y1={cy}
                x2={edge.x}
                y2={edge.y}
                stroke="#1E293B"
                strokeWidth="1"
                strokeDasharray="3 2"
                className="pointer-events-none opacity-65"
              />
            );
          })}

        {/* Primary cut lines on top */}
        {safeDen > 1 &&
          Array.from({ length: safeDen }).map((_, idx) => {
            const angle = (idx * 360) / safeDen;
            const edge = polarToCartesian(cx, cy, outerR, angle);
            return (
              <line
                key={idx}
                x1={cx}
                y1={cy}
                x2={edge.x}
                y2={edge.y}
                stroke="#0F172A"
                strokeWidth="1.6"
                className="pointer-events-none"
              />
            );
          })}
      </svg>
      {unitLabel && (
        <span className="mt-1 text-xs font-mono tabular-nums font-medium text-slate-600">
          {unitLabel} ({safeNum + safeSec}/{safeDen})
        </span>
      )}
    </div>
  );
};

interface ConcreteFractionViewProps {
  whole?: number;
  num: number;
  den: number;
  subdivideBy?: number;
  secondaryParts?: number;
  visualMode: VisualMode;
  accentTone?: 'amber' | 'sky' | 'emerald' | 'rose';
  interactive?: boolean;
  onChangeNum?: (newNum: number) => void;
  label?: string;
  compact?: boolean;
}

export const ConcreteFractionView: React.FC<ConcreteFractionViewProps> = ({
  whole = 0,
  num,
  den,
  subdivideBy = 1,
  secondaryParts = 0,
  visualMode,
  accentTone = 'amber',
  interactive = false,
  onChangeNum,
  label,
  compact = false,
}) => {
  const safeDen = Math.max(1, den);
  // Calculate how many full units + remainder if improper fraction is passed with whole=0
  const extraWholes = whole === 0 && num > safeDen && secondaryParts === 0 ? Math.floor(num / safeDen) : 0;
  const totalWholes = Math.max(0, whole + extraWholes);
  const remNum = extraWholes > 0 ? num % safeDen : num;

  const units: Array<{ active: number; secondary: number; isWholeUnit: boolean; index: number }> = [];
  for (let i = 0; i < totalWholes; i++) {
    units.push({ active: safeDen, secondary: 0, isWholeUnit: true, index: i });
  }
  if (remNum > 0 || secondaryParts > 0 || totalWholes === 0) {
    units.push({
      active: remNum,
      secondary: secondaryParts,
      isWholeUnit: false,
      index: totalWholes,
    });
  }

  return (
    <div className="w-full space-y-3">
      {label && (
        <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
          <span className="text-xs font-semibold text-slate-700">{label}</span>
          <span className="text-xs font-mono tabular-nums text-slate-500">
            {totalWholes > 0 ? `${totalWholes} utuh + ${remNum}/${safeDen}` : `${num + secondaryParts}/${safeDen}`}
          </span>
        </div>
      )}

      {/* Wood Block Mode (Bar Model Singapura) */}
      {(visualMode === 'wood' || visualMode === 'both') && (
        <div className="space-y-2">
          {visualMode === 'both' && (
            <div className="text-[11px] font-medium text-slate-500">
              Visual Balok Kayu (Bar Model Singapura)
            </div>
          )}
          <div className="grid grid-cols-1 gap-2">
            {units.map((u, idx) => (
              <SingleWoodBlock
                key={`wood-${idx}`}
                activeParts={u.active}
                secondaryParts={u.secondary}
                totalParts={safeDen}
                subdivideBy={subdivideBy}
                accentTone={u.isWholeUnit ? 'emerald' : accentTone}
                interactive={interactive && !u.isWholeUnit}
                onPropChange={onChangeNum}
                compact={compact || units.length > 2}
                unitLabel={
                  units.length > 1
                    ? u.isWholeUnit
                      ? `Balok Utuh #${idx + 1} (${safeDen}/${safeDen} = 1)`
                      : `Balok Pecahan (${u.active}/${safeDen})`
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Pizza Mode */}
      {(visualMode === 'pizza' || visualMode === 'both') && (
        <div className="pt-1">
          {visualMode === 'both' && (
            <div className="text-[11px] font-medium text-slate-500 mb-2">
              Visual Potongan Pizza Konkrit
            </div>
          )}
          <div className="flex flex-wrap items-center justify-center gap-4 py-1">
            {units.map((u, idx) => (
              <SinglePizzaPan
                key={`pizza-${idx}`}
                activeParts={u.active}
                secondaryParts={u.secondary}
                totalParts={safeDen}
                subdivideBy={subdivideBy}
                accentTone={u.isWholeUnit ? 'emerald' : accentTone}
                interactive={interactive && !u.isWholeUnit}
                onPropChange={onChangeNum}
                compact={compact || units.length > 2 || visualMode === 'both'}
                unitLabel={
                  units.length > 1
                    ? u.isWholeUnit
                      ? `Utuh #${idx + 1}`
                      : `Pecahan`
                    : `${u.active + u.secondary}/${safeDen}`
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface AreaMultiplicationGridProps {
  numA: number;
  denA: number;
  numB: number;
  denB: number;
  visualMode: VisualMode;
}

export const AreaMultiplicationGrid: React.FC<AreaMultiplicationGridProps> = ({
  numA,
  denA,
  numB,
  denB,
  visualMode,
}) => {
  const rows = Math.max(1, Math.min(10, denA));
  const cols = Math.max(1, Math.min(10, denB));
  const activeRows = Math.max(0, Math.min(rows, numA));
  const activeCols = Math.max(0, Math.min(cols, numB));

  const isPizzaTheme = visualMode === 'pizza';

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-md">
        {/* Top Column Header (Pecahan B: numB / denB) */}
        <div className="flex items-center justify-between text-xs font-medium text-sky-700 mb-1.5 px-1">
          <span>Potongan Vertikal: {numB}/{denB} kolom diambil</span>
          <span className="font-mono tabular-nums">Total Kotak: {rows} × {cols} = {rows * cols}</span>
        </div>

        <div
          className={`grid border-2 ${
            isPizzaTheme ? 'border-amber-700 rounded-xl bg-amber-50/60 p-1.5' : 'border-slate-700 rounded-lg bg-slate-100'
          } overflow-hidden shadow-sm`}
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: rows }).map((_, rIdx) =>
            Array.from({ length: cols }).map((__, cIdx) => {
              const inA = rIdx < activeRows;
              const inB = cIdx < activeCols;
              const isOverlap = inA && inB;

              let cellClass = 'bg-white text-slate-400';
              if (isOverlap) {
                cellClass = isPizzaTheme
                  ? 'bg-amber-500 text-white font-bold ring-1 ring-amber-800/40'
                  : 'bg-emerald-600 text-white font-bold';
              } else if (inA) {
                cellClass = 'bg-amber-200/80 text-amber-900';
              } else if (inB) {
                cellClass = 'bg-sky-200/80 text-sky-900';
              }

              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className={`h-11 border border-slate-300/80 flex flex-col items-center justify-center text-[11px] font-mono tabular-nums transition-colors ${cellClass}`}
                >
                  {isOverlap ? (
                    <span>✓ 1/{rows * cols}</span>
                  ) : inA ? (
                    <span>Baris</span>
                  ) : inB ? (
                    <span>Kolom</span>
                  ) : (
                    <span>·</span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <span>Arsir Baris ({numA}/{denA})</span>
          <span>·</span>
          <span>Arsir Kolom ({numB}/{denB})</span>
          <span>·</span>
          <span className="font-semibold text-emerald-700">
            Irisan Ganda (Hasil): {activeRows * activeCols}/{rows * cols}
          </span>
        </div>
      </div>
    </div>
  );
};
