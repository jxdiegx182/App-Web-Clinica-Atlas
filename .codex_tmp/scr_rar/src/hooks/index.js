// ══════════════════════════════════════════════════════
// HOOKS — MANFHER SYSTEMS · Atlas HIS
// ══════════════════════════════════════════════════════
import { useState, useCallback, useRef, useEffect } from 'react';
import { useHCU } from '../store/hcuStore';
import { FREC_DOSIS_DIA } from '../data/clinicalDB';

// ── useIMC — Calcula IMC en tiempo real ──
export function useIMC() {
  const { state, actions } = useHCU();
  const { peso, talla } = state.vitales;

  const calcular = useCallback(() => {
    const p = parseFloat(peso);
    const t = parseFloat(talla);
    if (!p || !t || t < 50) {
      actions.setIMC({ value: null, label: '', clase: '', alerta: '', pct: 0 });
      return;
    }
    const tm  = t / 100;
    const imc = p / (tm * tm);
    let clase = '', label = '', alerta = '', pct = 0;

    if      (imc < 16)   { clase = 'imc-bajo';   label = 'Desnutrición severa';  alerta = '🚨 ALERTA CRÍTICA: IMC muy bajo. Riesgo nutricional severo.'; pct = 2; }
    else if (imc < 18.5) { clase = 'imc-bajo';   label = 'Bajo peso';            alerta = '⚡ Bajo peso: Evaluar estado nutricional.'; pct = 10; }
    else if (imc < 25)   { clase = 'imc-normal';  label = 'Peso normal';          alerta = ''; pct = 25 + (imc - 18.5) / (25 - 18.5) * 20; }
    else if (imc < 30)   { clase = 'imc-sobre';   label = 'Sobrepeso';            alerta = '⚡ Sobrepeso: Considerar intervención nutricional.'; pct = 55 + (imc - 25) / 5 * 15; }
    else if (imc < 35)   { clase = 'imc-obeso';   label = 'Obesidad grado I';     alerta = '⚠️ ALERTA: Obesidad grado I. Riesgo cardiovascular aumentado.'; pct = 75; }
    else if (imc < 40)   { clase = 'imc-obeso';   label = 'Obesidad grado II';    alerta = '⚠️ ALERTA: Obesidad grado II. Manejo especializado.'; pct = 88; }
    else                  { clase = 'imc-obeso';   label = 'Obesidad mórbida';     alerta = '🚨 ALERTA CRÍTICA: Obesidad mórbida. Riesgo quirúrgico elevado.'; pct = 98; }

    actions.setIMC({ value: parseFloat(imc.toFixed(1)), label, clase, alerta, pct: Math.min(98, Math.max(2, pct)) });
  }, [peso, talla, actions]);

  useEffect(() => { calcular(); }, [calcular]);

  return state.imc;
}

// ── useVitalesAlerts — Semáforo de signos vitales ──
export function useVitalesAlerts(vitales) {
  const items = [];
  const { pa, fc, fr, temp, spo2 } = vitales;

  if (pa) {
    const pts = pa.split('/').map(Number);
    const [s, d = 0] = pts;
    const cls = (s >= 180 || s < 90 || d >= 110) ? 'alert' : (s >= 140 || d >= 90) ? 'warn' : 'ok';
    items.push({ l: 'PA', v: pa, c: cls });
  }
  if (fc) items.push({ l: 'FC', v: `${fc}lpm`, c: (fc > 100 || fc < 60) ? 'warn' : 'ok' });
  if (fr) items.push({ l: 'FR', v: `${fr}rpm`, c: (fr > 20 || fr < 12) ? 'warn' : 'ok' });
  if (temp) items.push({ l: 'Temp', v: `${temp}°C`, c: temp >= 38.5 ? 'alert' : (temp >= 37.5 || temp < 36) ? 'warn' : 'ok' });
  if (spo2) items.push({ l: 'SpO₂', v: `${spo2}%`, c: spo2 < 90 ? 'alert' : spo2 < 94 ? 'warn' : 'ok' });

  const hasAlert = items.some(i => i.c === 'alert');
  return { items, hasAlert };
}

// ── useCalcDosis — Motor de cálculo de dosis para Kárdex ──
export function useCalcDosis() {
  const toMg = { g: 1000, gr: 1000, mg: 1, mcg: 0.001, 'µg': 0.001, 'μg': 0.001, ui: 1, u: 1, meq: 1, mmol: 1, ml: 1, l: 1000 };

  const parseVal = (s) => {
    if (!s) return null;
    const m = s.trim().match(/^([\d]+(?:[.,]\d+)?)\s*([a-záéíóúüñµμ%/]+)?/i);
    if (!m) return null;
    return { n: parseFloat(m[1].replace(',', '.')), u: (m[2] || '').toLowerCase().replace(/[/\s].*/, '') };
  };

  const norm = (v) => v ? v.n * (toMg[v.u] || v.n) : null;

  const labelPres = (s) => {
    const v = (s || '').toLowerCase();
    if (v.includes('amp') || v.includes('vial')) return 'amp';
    if (v.includes('frasco')) return 'frasco';
    if (v.includes('tab') || v.includes('comp')) return 'tab';
    if (v.includes('cáp') || v.includes('cap')) return 'cáp';
    return 'unid';
  };

  const calcular = useCallback(({ dosis, conc, frec }) => {
    const pres = labelPres(conc);
    let upToma = null, upTomaStr = '', alertMsg = '', calcTxt = '';
    let total = null, farmUnidades = null, cantAuto = false;

    if (dosis && conc) {
      const unitPresM = dosis.match(/^([\d.,]+)\s*(tab|comp|cáp|cap|amp|ampolla[s]?|jer|sobre[s]?|puff[s]?|inhal)/i);
      if (unitPresM) {
        upToma = parseFloat(unitPresM[1].replace(',', '.'));
        upTomaStr = `${upToma} ${unitPresM[2]}`;
      } else {
        const dosV = parseVal(dosis), concNum = conc.split('/')[0].trim(), concV = parseVal(concNum);
        if (dosV && concV && concV.n > 0) {
          const dNorm = norm(dosV), cNorm = norm(concV);
          if (dNorm !== null && cNorm !== null && cNorm > 0) {
            upToma = Math.ceil(dNorm / cNorm);
            const concParts = conc.split('/'), denomStr = concParts.length >= 2 ? concParts[1].trim() : '';
            const denomVolM = denomStr.match(/^([\d.,]+)\s*(ml|l|cc)/i);
            upTomaStr = denomVolM
              ? `${upToma} amp (${dosis} ÷ ${concNum}/${denomStr})`
              : `${upToma} ${pres} (${dosis} ÷ ${concNum})`;
            if (upToma > 10) alertMsg = `⚠️ Verifique: ${upToma} unidades/toma parece excesivo`;
          }
        }
      }
    }

    const dosisDia = FREC_DOSIS_DIA[frec];
    if (frec === 'Una sola dosis (dosis única)') {
      total = upToma || 1; farmUnidades = total; cantAuto = true;
      calcTxt = upToma ? `${dosis} ÷ ${conc} = ${upTomaStr} · Dosis única` : `Dosis única → 1 ${pres}`;
    } else if (frec?.startsWith('PRN') || frec === 'Infusión continua 24h') {
      cantAuto = false;
      calcTxt = upToma ? `${upTomaStr}/toma · PRN` : dosis ? `${dosis}/toma · PRN` : 'PRN';
    } else if (upToma && dosisDia) {
      total = Math.ceil(upToma * dosisDia); farmUnidades = total; cantAuto = true;
      calcTxt = `${upTomaStr}/toma × ${dosisDia}/día = ${total} ${pres}/día`;
    } else if (upToma && !dosisDia) {
      total = upToma; farmUnidades = total; cantAuto = true;
      calcTxt = `${upTomaStr}/toma · seleccione frecuencia`;
    }

    if (alertMsg) calcTxt += ' · ' + alertMsg;

    return { farmUnidades, total, upTomaStr: upTomaStr || '—', calcTxt, cantAuto };
  }, []);

  return { calcular };
}

// ── useBridgeFarmacia — Sincronización con localStorage y fetch POST ──
export function useBridgeFarmacia() {
  const { state } = useHCU();

  const sync = useCallback(() => {
    try {
      const { paciente, vitales, rxList, farmaciaQueue, imc } = state;
      const payload = {
        ts: Date.now(),
        origen: 'HCU',
        version: 'MSP-HCU-Form.005/2021-v3',
        cama_id: `${paciente.sala}-${paciente.cama}`.toUpperCase() || 'SIN-CAMA',
        pac_display: paciente.nombres,
        cedula: paciente.hcl,
        medico_display: paciente.medico,
        signos_vitales: { ...vitales, imc_value: imc.value },
        rxList: rxList.map(rx => ({
          id: rx.id, nombre: rx.nombre, dosis: rx.dosis,
          via: rx.via, frecuencia: rx.frecuencia,
          indicacion: rx.indicacion, fecha_inicio: rx.fecha_inicio,
          status: rx.status, urgente: rx.urgente,
        })),
        pedidos: farmaciaQueue,
      };
      localStorage.setItem('M8_BRIDGE_HCU_FARMACIA', JSON.stringify(payload));
      localStorage.setItem('M8_BRIDGE_HCU_VITALES', JSON.stringify({ ...vitales, imc_value: imc.value }));
      // En producción: descomentar fetch POST
      // await fetch(window.MANFHER_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    } catch (e) {
      console.warn('MANFHER HIS Bridge error:', e);
    }
  }, [state]);

  return { sync };
}

// ── useUserSession — Certificado del médico logueado ──
export function useUserSession(firma) {
  const getSerial = useCallback((cedula) => {
    let h = 0, s = (cedula || '') + 'ATLAS-HIS';
    for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
    return `EC-${Math.abs(h).toString(16).toUpperCase().padStart(8, '0')}-HIS`;
  }, []);

  const getValidez = useCallback(() => {
    const d = new Date(); d.setFullYear(d.getFullYear() + 2);
    return d.toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }, []);

  return {
    nombre:  firma.medico  || 'Dr. Usuario Atlas',
    cedula:  firma.codigo  || '1700000000',
    emisora: 'Security Data S.A.',
    validez: getValidez(),
    serie:   getSerial(firma.codigo),
  };
}

// ── useToast — Notificaciones temporales ──
export function useToast() {
  const [toast, setToast] = useState({ msg: '', visible: false });
  const timerRef = useRef(null);

  const showToast = useCallback((msg) => {
    clearTimeout(timerRef.current);
    setToast({ msg, visible: true });
    timerRef.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 3200);
  }, []);

  return { toast, showToast };
}

// ── useSearchDropdown — Buscador genérico reutilizable ──
export function useSearchDropdown(db) {
  const [query, setQuery]   = useState('');
  const [open, setOpen]     = useState(false);
  const [results, setResults] = useState([]);

  const search = useCallback((q) => {
    setQuery(q);
    if (!q || q.length < 2) { setResults([]); setOpen(false); return; }
    const q2 = q.toLowerCase();
    const res = db.filter(item => {
      if (typeof item === 'string') return item.toLowerCase().includes(q2);
      return Object.values(item).some(v => String(v).toLowerCase().includes(q2));
    }).slice(0, 12);
    setResults(res);
    setOpen(res.length > 0);
  }, [db]);

  const clear = useCallback(() => { setQuery(''); setResults([]); setOpen(false); }, []);
  const close  = useCallback(() => setOpen(false), []);
  const focus  = useCallback(() => { if (query.length >= 2) setOpen(results.length > 0); }, [query, results]);

  return { query, open, results, search, clear, close, focus };
}

// ── useQRGen — Generador de QR visual SVG ──
export function useQRGen() {
  const generate = useCallback((hash, size = 54, cell = 4) => {
    const cols = Math.floor(size / cell);
    const rects = [];
    for (let r = 0; r < cols; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const bit = (hash.charCodeAt(idx % hash.length) >> (idx % 8)) & 1;
        const isFinder = (r < 2 && c < 2) || (r < 2 && c > cols - 3) || (r > cols - 3 && c < 2);
        if (bit || isFinder) {
          rects.push({ x: c * cell, y: r * cell, w: cell - 1, h: cell - 1, fill: isFinder ? '#0f2440' : '#1a3a5c' });
        }
      }
    }
    return rects;
  }, []);

  return { generate };
}
