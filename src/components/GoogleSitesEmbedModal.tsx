import React, { useState } from 'react';
import { Copy, Check, Code2, X, ExternalLink, Layers } from 'lucide-react';
import { VisualMode } from '../types/fraction';

interface GoogleSitesEmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTopicId: number;
  defaultVisualMode: VisualMode;
}

export function generateStandaloneGoogleSitesHTML(initialTopicId: number, initialVisual: VisualMode): string {
  const defaultMode = initialVisual === 'pizza' ? 'pizza' : 'wood';
  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>PecahanLab - Simulasi Pecahan GASING & Matematika Singapura</title>
<style>
  :root {
    --bg: #F8FAFC;
    --card: #FFFFFF;
    --border: #E2E8F0;
    --text: #0F172A;
    --muted: #475569;
    --sky: #0284C7;
    --amber: #D97706;
    --emerald: #059669;
  }
  * { box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; }
  body { margin: 0; padding: 14px; background: var(--bg); color: var(--text); }
  .app { max-width: 1080px; margin: 0 auto; background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
  .top { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 10px; border-bottom: 1px solid var(--border); padding-bottom: 12px; margin-bottom: 14px; }
  .brand { font-size: 17px; font-weight: 700; color: var(--text); }
  .controls { display: flex; flex-wrap: wrap; gap: 6px; }
  button, select { font-size: 12px; font-weight: 600; padding: 7px 11px; border-radius: 8px; border: 1px solid var(--border); background: #F1F5F9; color: var(--text); cursor: pointer; }
  button.active { background: var(--sky); color: #fff; border-color: var(--sky); }
  .grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 16px; }
  @media (max-width: 760px) { .grid { grid-template-columns: 1fr; } }
  .panel { border: 1px solid var(--border); border-radius: 12px; padding: 14px; background: #fff; }
  .wood-bar { display: flex; height: 46px; border: 2px solid #475569; border-radius: 8px; overflow: hidden; background: #E2E8F0; margin: 8px 0; }
  .wood-seg { flex: 1; border-right: 1.5px solid rgba(15,23,42,0.35); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; cursor: pointer; user-select: none; }
  .wood-seg:last-child { border-right: none; }
  .wood-seg.on { background: linear-gradient(180deg, #D97706, #92400E); color: #FFFBEB; }
  .wood-seg.on2 { background: linear-gradient(180deg, #0284C7, #075985); color: #F0F9FF; }
  .eq-box { display: flex; align-items: center; justify-content: center; gap: 14px; background: #F8FAFC; border: 1px solid var(--border); padding: 12px; border-radius: 10px; margin-bottom: 12px; font-family: monospace; font-size: 16px; font-weight: 700; }
  .frac { display: inline-flex; flex-direction: column; align-items: center; vertical-align: middle; line-height: 1.1; }
  .frac .bar { width: 100%; height: 2px; background: currentColor; margin: 2px 0; }
  .method-box { padding: 10px 12px; border-radius: 9px; font-size: 12.5px; line-height: 1.45; margin-top: 8px; }
  .m-sg { background: #F0F9FF; border: 1px solid #BAE6FD; color: #0C4A6E; }
  .m-gs { background: #ECFDF5; border: 1px solid #A7F3D0; color: #064E3B; }
  .slider-row { margin-bottom: 10px; font-size: 12px; }
  .slider-row input { width: 100%; margin-top: 4px; }
  .tray { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
  .chip { padding: 6px 10px; background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: grab; }
</style>
</head>
<body>
<div class="app">
  <div class="top">
    <div class="brand">PecahanLab · Simulasi GASING & Matematika Singapura</div>
    <div class="controls">
      <select id="topicSelect" onchange="changeTopic(this.value)">
        <option value="1">01. Menentukan Pecahan</option>
        <option value="2">02. Pecahan Senilai</option>
        <option value="3">03. Membandingkan (Penyebut Sama)</option>
        <option value="4">04. Membandingkan (Penyebut Berbeda)</option>
        <option value="5">05. Mengurutkan Pecahan</option>
        <option value="6">06. Penjumlahan (Penyebut Sama)</option>
        <option value="7">07. Penjumlahan (Penyebut Berbeda)</option>
        <option value="8">08. Pecahan Campuran (GASING)</option>
        <option value="9">09. Penjumlahan Campuran (GASING)</option>
        <option value="10">10. Pengurangan Campuran (GASING)</option>
        <option value="11">11. Perkalian Pecahan</option>
        <option value="12">12. Pembagian Pecahan</option>
      </select>
      <button id="btnWood" onclick="setMode('wood')">Balok Kayu</button>
      <button id="btnPizza" onclick="setMode('pizza')">Pizza</button>
      <button id="btnQuiz" onclick="toggleQuiz()">Kuis Interaktif</button>
    </div>
  </div>

  <div id="mainStage" class="grid">
    <div class="panel">
      <div id="topicHeader" style="font-weight:700;font-size:15px;margin-bottom:8px;"></div>
      <div id="eqBanner" class="eq-box"></div>
      <div id="visualCanvas"></div>
      <div style="margin-top:12px;padding-top:10px;border-top:1px solid #E2E8F0;">
        <div style="font-size:11px;color:#475569;font-weight:600;">Baki Potongan Cepat (Klik/Drag untuk Mengubah Pembilang A):</div>
        <div class="tray" id="quickTray"></div>
      </div>
    </div>

    <div class="panel">
      <div style="font-weight:700;font-size:13px;margin-bottom:10px;">Pengatur Potongan & Metode</div>
      <div class="slider-row" id="wholeARow" style="display:none;">
        <label>Bilangan Bulat A: <strong id="lblWA">2</strong> Utuh</label>
        <input type="range" id="rngWA" min="1" max="4" value="2" oninput="updateParams()" />
      </div>
      <div class="slider-row">
        <label>Pembilang A (Diambil): <strong id="lblNA">2</strong></label>
        <input type="range" id="rngNA" min="1" max="10" value="2" oninput="updateParams()" />
      </div>
      <div class="slider-row">
        <label>Penyebut A (Total Potongan): <strong id="lblDA">4</strong></label>
        <input type="range" id="rngDA" min="2" max="10" value="4" oninput="updateParams()" />
      </div>
      <div class="slider-row" id="wholeBRow" style="display:none;">
        <label>Bilangan Bulat B: <strong id="lblWB">1</strong> Utuh</label>
        <input type="range" id="rngWB" min="1" max="3" value="1" oninput="updateParams()" />
      </div>
      <div class="slider-row" id="numBRow">
        <label>Pembilang B: <strong id="lblNB">1</strong></label>
        <input type="range" id="rngNB" min="1" max="10" value="1" oninput="updateParams()" />
      </div>
      <div class="slider-row" id="denBRow">
        <label>Penyebut B: <strong id="lblDB">3</strong></label>
        <input type="range" id="rngDB" min="2" max="10" value="3" oninput="updateParams()" />
      </div>

      <div id="sgExplain" class="method-box m-sg"></div>
      <div id="gsExplain" class="method-box m-gs"></div>
    </div>
  </div>
</div>

<script>
let state = { topic: ${initialTopicId}, mode: '${defaultMode}', quiz: false, wA: 2, nA: 2, dA: 4, wB: 1, nB: 1, dB: 3 };
const TOPICS = {
  1: { t: '01. Menentukan Pecahan', sg: 'Matematika Singapura: 1 balok kayu/pizza dibagi menjadi b bagian sama besar, bagian diarsir adalah a/b.', gs: 'Metode GASING: 1 dibagi b bagian sama besar = 1/b. Ambil a potong = a/b.' },
  2: { t: '02. Pecahan Senilai', sg: 'Matematika Singapura: Membelah tiap segmen balok kayu menjadi 2 bagian tanpa mengubah panjang arsiran.', gs: 'Metode GASING: Kalikan pembilang dan penyebut dengan angka yang sama: a/b = (a×2)/(b×2).' },
  3: { t: '03. Membandingkan (Penyebut Sama)', sg: 'Matematika Singapura: Ukuran potongan sudah sama, balok dengan potongan lebih banyak lebih panjang.', gs: 'Metode GASING: Penyebut sama → langsung bandingkan pembilang!' },
  4: { t: '04. Membandingkan (Penyebut Berbeda)', sg: 'Matematika Singapura: Samakan potongan kedua balok ke KPK penyebut.', gs: 'Metode GASING: Kali Silang! Bandingkan (a × d) di kiri dengan (b × c) di kanan.' },
  5: { t: '05. Mengurutkan Pecahan', sg: 'Matematika Singapura: Susun balok dari arsiran terpendek ke terpanjang.', gs: 'Metode GASING: Samakan penyebut ke KPK lalu urutkan pembilangnya.' },
  6: { t: '06. Penjumlahan (Penyebut Sama)', sg: 'Matematika Singapura: Gabungkan potongan pada satu balok berpenyebut sama.', gs: 'Metode GASING: Jumlahkan pembilangnya saja: (a + c)/b.' },
  7: { t: '07. Penjumlahan (Penyebut Berbeda)', sg: 'Matematika Singapura: Potong silang kedua balok menjadi b×d bagian.', gs: 'Metode GASING: Kali Silang! ((a×d) + (b×c)) / (b×d).' },
  8: { t: '08. Pecahan Campuran (GASING)', sg: 'Matematika Singapura: W balok utuh ditambah pecahan a/b.', gs: 'Metode GASING: W a/b = W + a/b = ((W × b) + a)/b.' },
  9: { t: '09. Penjumlahan Campuran (GASING)', sg: 'Matematika Singapura: Kelompokkan balok utuh dengan utuh, pecahan dengan pecahan.', gs: 'Metode GASING: (Bulat + Bulat) + (Pecahan + Pecahan)!' },
  10: { t: '10. Pengurangan Campuran (GASING)', sg: 'Matematika Singapura: Jika pecahan kurang, belah 1 balok utuh menjadi b/b.', gs: 'Metode GASING: Pinjam 1 utuh menjadi b/b → pembilang bertambah sebesar penyebut!' },
  11: { t: '11. Perkalian Pecahan', sg: 'Matematika Singapura: Irisan 2D baris (a/b) dan kolom (c/d).', gs: 'Metode GASING: Coret silang faktor yang sama sebelum mengalikan atas×atas dan bawah×bawah!' },
  12: { t: '12. Pembagian Pecahan', sg: 'Matematika Singapura: Mencacah berapa potong c/d muat di dalam a/b.', gs: 'Metode GASING: Ubah bagi jadi kali dengan membalik pecahan kedua: a/b × d/c!' }
};

function fracHTML(w, n, d) {
  let wPart = w ? '<span style="font-size:19px;margin-right:3px;">' + w + '</span>' : '';
  return '<span style="display:inline-flex;align-items:center;">' + wPart + '<span class="frac"><span>' + n + '</span><span class="bar"></span><span>' + d + '</span></span></span>';
}

function drawUnit(n, d, color) {
  if (state.mode === 'pizza') {
    let r = 46, cx = 54, cy = 54;
    let paths = '';
    for (let i = 0; i < d; i++) {
      let a1 = (i * 360 / d - 90) * Math.PI / 180;
      let a2 = ((i + 1) * 360 / d - 90) * Math.PI / 180;
      let x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      let x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
      let fill = i < n ? (color === 'sky' ? '#0284C7' : '#D97706') : '#E2E8F0';
      let dPath = d === 1 ? 'M 54 8 A 46 46 0 1 1 53.9 8 Z' : 'M '+cx+' '+cy+' L '+x1+' '+y1+' A '+r+' '+r+' 0 '+(360/d > 180 ? 1 : 0)+' 1 '+x2+' '+y2+' Z';
      paths += '<path d="'+dPath+'" fill="'+fill+'" stroke="#0F172A" stroke-width="1.5"/>';
    }
    return '<svg width="108" height="108" viewBox="0 0 108 108">' + paths + '</svg>';
  }
  let segs = '';
  for (let i = 0; i < d; i++) {
    let cls = i < n ? (color === 'sky' ? 'wood-seg on2' : 'wood-seg on') : 'wood-seg';
    segs += '<div class="'+cls+'" onclick="setNA('+(i+1)+')">1/'+d+'</div>';
  }
  return '<div class="wood-bar">' + segs + '</div>';
}

function setNA(val) {
  document.getElementById('rngNA').value = val;
  updateParams();
}

function setMode(m) {
  state.mode = m;
  document.getElementById('btnWood').className = m === 'wood' ? 'active' : '';
  document.getElementById('btnPizza').className = m === 'pizza' ? 'active' : '';
  render();
}

function changeTopic(val) {
  state.topic = parseInt(val, 10);
  render();
}

function updateParams() {
  state.wA = parseInt(document.getElementById('rngWA').value, 10);
  state.dA = parseInt(document.getElementById('rngDA').value, 10);
  state.nA = Math.min(state.dA, parseInt(document.getElementById('rngNA').value, 10));
  document.getElementById('rngNA').max = state.dA;
  state.wB = parseInt(document.getElementById('rngWB').value, 10);
  state.dB = (state.topic === 3 || state.topic === 6 || state.topic === 9 || state.topic === 10) ? state.dA : parseInt(document.getElementById('rngDB').value, 10);
  state.nB = Math.min(state.dB, parseInt(document.getElementById('rngNB').value, 10));
  document.getElementById('rngNB').max = state.dB;
  render();
}

function render() {
  document.getElementById('topicSelect').value = state.topic;
  document.getElementById('btnWood').className = state.mode === 'wood' ? 'active' : '';
  document.getElementById('btnPizza').className = state.mode === 'pizza' ? 'active' : '';
  document.getElementById('lblWA').innerText = state.wA;
  document.getElementById('lblNA').innerText = state.nA;
  document.getElementById('lblDA').innerText = state.dA;
  document.getElementById('lblWB').innerText = state.wB;
  document.getElementById('lblNB').innerText = state.nB;
  document.getElementById('lblDB').innerText = state.dB;

  let isMixed = state.topic >= 8 && state.topic <= 10;
  document.getElementById('wholeARow').style.display = isMixed ? 'block' : 'none';
  document.getElementById('wholeBRow').style.display = (state.topic === 9 || state.topic === 10) ? 'block' : 'none';
  document.getElementById('numBRow').style.display = (state.topic >= 3 && state.topic !== 8) ? 'block' : 'none';
  document.getElementById('denBRow').style.display = (state.topic === 4 || state.topic === 5 || state.topic === 7 || state.topic === 11 || state.topic === 12) ? 'block' : 'none';

  let info = TOPICS[state.topic];
  document.getElementById('topicHeader').innerText = info.t;
  document.getElementById('sgExplain').innerHTML = '<strong>Matematika Singapura:</strong><br/>' + info.sg;
  document.getElementById('gsExplain').innerHTML = '<strong>Metode GASING:</strong><br/>' + info.gs;

  let eq = '', vis = '';
  let { wA, nA, dA, wB, nB, dB, topic } = state;
  if (topic === 1) {
    eq = fracHTML(0, nA, dA) + ' = ' + nA + ' bagian dari ' + dA + ' potong';
    vis = drawUnit(nA, dA, 'amber');
  } else if (topic === 2) {
    eq = fracHTML(0, nA, dA) + ' = ' + fracHTML(0, nA * 2, dA * 2);
    vis = '<div>Pecahan Asli:</div>' + drawUnit(nA, dA, 'amber') + '<div>Senilai (×2):</div>' + drawUnit(nA * 2, dA * 2, 'sky');
  } else if (topic === 3 || topic === 4) {
    let left = nA * dB, right = nB * dA;
    let sgn = left === right ? '=' : (left > right ? '>' : '<');
    eq = fracHTML(0, nA, dA) + ' <span style="color:#059669;font-size:22px;">' + sgn + '</span> ' + fracHTML(0, nB, dB) + ' <span style="font-size:12px;color:#475569;">(Silang: '+left+' vs '+right+')</span>';
    vis = '<div>Pecahan A:</div>' + drawUnit(nA, dA, 'amber') + '<div>Pecahan B:</div>' + drawUnit(nB, dB, 'sky');
  } else if (topic === 5) {
    let g = function(x, y){ while(y){ let t=y; y=x%y; x=t; } return x||1; };
    let kpk2 = (dA * dB) / g(dA, dB);
    let kpk = (kpk2 * 2) / g(kpk2, 2);
    let list = [
      { n: nA, d: dA, eq: nA * (kpk / dA) },
      { n: nB, d: dB, eq: nB * (kpk / dB) },
      { n: 1, d: 2, eq: 1 * (kpk / 2) }
    ];
    let sorted = list.slice().sort(function(a, b){ return a.eq - b.eq; });
    eq = '<div style="font-size:13px;">Samakan Penyebut (KPK = '+kpk+'): ' +
      list.map(function(x){ return x.n+'/'+x.d+' = <strong>'+x.eq+'/'+kpk+'</strong>'; }).join(' · ') +
      '<br/>Urutan Terkecil → Terbesar: <span style="color:#059669;">' +
      sorted.map(function(x){ return x.n+'/'+x.d+' ('+x.eq+'/'+kpk+')'; }).join(' &lt; ') + '</span></div>';
    vis = sorted.map(function(x, i){
      return '<div style="font-size:12px;margin-top:4px;">#'+(i+1)+': '+x.n+'/'+x.d+' → <strong>Disamakan Penyebut: '+x.eq+'/'+kpk+'</strong></div>' + drawUnit(x.eq, kpk, i % 2 === 0 ? 'amber' : 'sky');
    }).join('');
  } else if (topic === 6 || topic === 7) {
    let cd = topic === 6 ? dA : dA * dB;
    let sumN = topic === 6 ? (nA + nB) : (nA * dB + nB * dA);
    eq = fracHTML(0, nA, dA) + ' + ' + fracHTML(0, nB, dB) + ' = ' + fracHTML(0, sumN, cd);
    vis = '<div>Pecahan A:</div>' + drawUnit(nA, dA, 'amber') + '<div>Pecahan B:</div>' + drawUnit(nB, dB, 'sky');
  } else if (topic === 8) {
    let imp = wA * dA + nA;
    eq = fracHTML(wA, nA, dA) + ' = ' + wA + ' + ' + fracHTML(0, nA, dA) + ' = ' + fracHTML(0, imp, dA);
    vis = '<div>' + wA + ' Utuh + Pecahan:</div>' + drawUnit(dA, dA, 'sky') + drawUnit(nA, dA, 'amber');
  } else if (topic === 9) {
    let wSum = wA + wB, nSum = nA + nB;
    let extraW = Math.floor(nSum / dA), remN = nSum % dA;
    eq = fracHTML(wA, nA, dA) + ' + ' + fracHTML(wB, nB, dA) + ' = ('+wA+'+'+wB+') + ' + fracHTML(0, nSum, dA) + ' = ' + fracHTML(wSum + extraW, remN, dA);
    vis = '<div>Gabungan Pecahan:</div>' + drawUnit(nA, dA, 'amber') + drawUnit(nB, dA, 'sky');
  } else if (topic === 10) {
    let borrow = nA < nB;
    let wEff = borrow ? wA - 1 : wA;
    let nEff = borrow ? nA + dA : nA;
    eq = fracHTML(wA, nA, dA) + ' − ' + fracHTML(wB, nB, dA) + (borrow ? ' → Pinjam 1: ' + fracHTML(wEff, nEff, dA) : '') + ' = ' + fracHTML(wEff - wB, nEff - nB, dA);
    vis = '<div>Pecahan A '+(borrow ? '(Pinjam 1 Utuh = '+dA+'/'+dA+')' : '')+':</div>' + drawUnit(nA, dA, 'amber');
  } else if (topic === 11) {
    eq = fracHTML(0, nA, dA) + ' × ' + fracHTML(0, nB, dB) + ' = ' + fracHTML(0, nA * nB, dA * dB);
    vis = '<div>Baris ('+nA+'/'+dA+') × Kolom ('+nB+'/'+dB+'):</div>' + drawUnit(nA, dA, 'amber') + drawUnit(nB, dB, 'sky');
  } else {
    eq = fracHTML(0, nA, dA) + ' ÷ ' + fracHTML(0, nB, dB) + ' = ' + fracHTML(0, nA, dA) + ' × ' + fracHTML(0, dB, nB) + ' = ' + fracHTML(0, nA * dB, dA * nB);
    vis = '<div>Dibagi ('+nA+'/'+dA+') oleh ('+nB+'/'+dB+'):</div>' + drawUnit(nA, dA, 'amber') + drawUnit(nB, dB, 'sky');
  }
  document.getElementById('eqBanner').innerHTML = eq;
  document.getElementById('visualCanvas').innerHTML = vis;

  let trayHTML = '';
  for (let i = 1; i <= dA; i++) {
    trayHTML += '<span class="chip" onclick="setNA('+i+')">Ambil '+i+'/'+dA+'</span>';
  }
  document.getElementById('quickTray').innerHTML = trayHTML;
}

function toggleQuiz() {
  let ans = prompt('Kuis Cepat GASING: Berapakah hasil dari 1/3 + 1/4? (Ketik dalam bentuk a/b)');
  if (ans && ans.trim() === '7/12') {
    alert('Benar! Kali Silang GASING: (1×4 + 3×1)/(3×4) = 7/12.');
  } else if (ans !== null) {
    alert('Mari gunakan Kali Silang GASING: (1×4 + 3×1)/(3×4) = (4 + 3)/12 = 7/12.');
  }
}

render();
</script>
</body>
</html>`;
}

export const GoogleSitesEmbedModal: React.FC<GoogleSitesEmbedModalProps> = ({
  isOpen,
  onClose,
  defaultTopicId,
  defaultVisualMode,
}) => {
  const [embedType, setEmbedType] = useState<'standalone-html' | 'iframe-url'>('standalone-html');
  const [selectedTopic, setSelectedTopic] = useState<number>(defaultTopicId);
  const [selectedVisual, setSelectedVisual] = useState<VisualMode>(defaultVisualMode);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://pecahanlab.example.com';
  const iframeSnippet = `<iframe src="${appOrigin}" width="100%" height="780" style="border:1px solid #E2E8F0; border-radius:12px;" allowfullscreen loading="lazy" title="PecahanLab - Simulasi Pecahan GASING & Matematika Singapura"></iframe>`;
  const standaloneHTML = generateStandaloneGoogleSitesHTML(selectedTopic, selectedVisual);

  const activeCode = embedType === 'standalone-html' ? standaloneHTML : iframeSnippet;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback textarea copy
      const ta = document.createElement('textarea');
      ta.value = activeCode;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Code2 className="w-5 h-5 text-sky-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Salin Kode Sematan untuk Google Sites
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Mode Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setEmbedType('standalone-html')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  embedType === 'standalone-html'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Kode HTML Mandiri (Tab "Sematkan Kode")
              </button>
              <button
                type="button"
                onClick={() => setEmbedType('iframe-url')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  embedType === 'iframe-url'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2. Kode Iframe Aplikasi Penuh
              </button>
            </div>

            {embedType === 'standalone-html' && (
              <div className="flex items-center gap-2">
                <select
                  aria-label="Pilih Materi Awal"
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(Number(e.target.value))}
                  className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-700"
                >
                  {Array.from({ length: 12 }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Mulai di Materi {i + 1}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Pilih Visual Awal"
                  value={selectedVisual}
                  onChange={(e) => setSelectedVisual(e.target.value as VisualMode)}
                  className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-700"
                >
                  <option value="wood">Default: Balok Kayu</option>
                  <option value="pizza">Default: Pizza</option>
                </select>
              </div>
            )}
          </div>

          {/* Step-by-step instructions for Google Sites */}
          <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 space-y-2 text-xs text-slate-700">
            <div className="font-bold text-sky-950">
              Cara Memasang di Google Sites (100% Langsung Jalan):
            </div>
            <ol className="list-decimal pl-4 space-y-1">
              <li>
                Klik tombol <strong>"Salin Kode ke Clipboard"</strong> di bawah ini.
              </li>
              <li>
                Buka halaman <strong>Google Sites</strong> Anda, lalu pada panel kanan pilih menu{' '}
                <strong>Sisipkan (Insert) → Sematkan (Embed)</strong>.
              </li>
              <li>
                Pilih tab <strong>"Sematkan Kode" (Embed Code)</strong>, tempelkan (Paste / Ctrl+V) kode di bawah, lalu klik <strong>Berikutnya → Sisipkan</strong>.
              </li>
            </ol>
          </div>

          {/* Code Block */}
          <div className="relative">
            <div className="flex items-center justify-between bg-slate-900 text-slate-200 px-4 py-2.5 rounded-t-xl border-b border-slate-700">
              <span className="text-xs font-mono">
                {embedType === 'standalone-html'
                  ? 'google-sites-pecahanlab-standalone.html (Semua 12 Materi + Balok Kayu & Pizza)'
                  : 'google-sites-iframe.html'}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Berhasil Disalin!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Salin Kode ke Clipboard
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto max-h-64 rounded-b-xl leading-relaxed select-all">
              {activeCode}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Kode mandiri mendukung tampilan responsif desktop, tablet, dan Chromebook sekolah.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Tutup Jendela
          </button>
        </div>
      </div>
    </div>
  );
};
