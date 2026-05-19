export const SALA_SUCIA_MIN = 30;

export const fechaKey = (d) => d.toISOString().slice(0, 10);

export const fechaHoy = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const horaToMin = (h) => {
  const [hh, mm] = h.split(':').map(Number);
  return hh * 60 + mm;
};

export const minToHora = (m) =>
  `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

export const h12 = (h) => {
  const [hh, mm] = h.split(':').map(Number);
  const ap = hh < 12 ? 'AM' : 'PM';
  const h2 = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh;
  return `${h2}:${String(mm).padStart(2, '0')} ${ap}`;
};

export const tcls = (t) =>
  t === 'Laparoscópica' ? 'tlap' : t === 'Abierta' ? 'tab' : t === 'Endoscopía' ? 'ten' : 'trob';

export const validarCedula = (ced) => {
  if (!ced) return { ok: false, msg: '' };
  const c = ced.replace(/\D/g, '');
  if (c.length !== 10) return { ok: false, msg: 'Debe tener 10 dígitos' };
  const prov = parseInt(c.substring(0, 2));
  if (prov < 1 || prov > 24) return { ok: false, msg: 'Provincia inválida (01–24)' };
  const coef = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;
  for (let i = 0; i < 9; i++) {
    let val = parseInt(c[i]) * coef[i];
    if (val >= 10) val -= 9;
    suma += val;
  }
  const dv = (10 - (suma % 10)) % 10;
  if (dv !== parseInt(c[9])) return { ok: false, msg: 'Cédula inválida — dígito verificador incorrecto' };
  return { ok: true, msg: 'Cédula válida ✓' };
};

export const getConflicto = (registros, sala, horaStr, tpo, excluirId, fecha) => {
  const ini = horaToMin(horaStr);
  const fin = ini + Math.round(tpo * 60);
  for (const r of registros.filter((r) => r.fecha === fecha && r.sala === sala && r.id !== excluirId)) {
    const ri = horaToMin(r.hora);
    const rf = ri + Math.round(r.tpo * 60);
    const rfl = rf + SALA_SUCIA_MIN;
    if (ini < rfl && fin > ri) return { r, esSalaSucia: ini >= rf && ini < rfl, rf, rf_limpieza: rfl };
  }
  return null;
};
