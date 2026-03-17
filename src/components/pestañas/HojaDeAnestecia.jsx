import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
const AnestesiaApp = () => {
  // --- ESTADO PARA PERSONAL MÉDICO ---
  const [personal, setPersonal] = useState({
    cirujano1: '', cirujano2: '', ayudante1: '', ayudante2: '',
    anestesiologo: '', ayudanteAnestesia: '', pediatra: '', 'Servicio / Especialidad': ''
  });

  // --- ESTADO PARA TIEMPOS ---
  const [tiempos, setTiempos] = useState({
    anestesiaInicial: '',
    anestesiaFinal: '',
    cirugiaInicial: '',
    cirugiaFinal: ''
  });

  // --- ESTADO PARA RESULTADOS CALCULADOS ---
  const [calculos, setCalculos] = useState({
    duracionAnestesia: '--:--',
    minAnestesia: 0,
    pctAnestesia: '0%',
    duracionCirugia: '--:--',
    minCirugia: 0,
    pctCirugia: '0%',
    diferencia: '--:--',
    diffColor: '#ffffff'
  });

  const handlePersonalChange = (e) => {
    setPersonal({ ...personal, [e.target.id]: e.target.value });
  };

  const handleTiempoChange = (e) => {
    setTiempos({ ...tiempos, [e.target.id]: e.target.value });
  };

  // --- LÓGICA DE CÁLCULO ---
  useEffect(() => {
    const calcular = (inicio, fin) => {
      if (!inicio || !fin) return null;
      const [hI, mI] = inicio.split(':').map(Number);
      const [hF, mF] = fin.split(':').map(Number);
      let totalMinutos = (hF * 60 + mF) - (hI * 60 + mI);
      if (totalMinutos < 0) totalMinutos += 1440; // Cruce de medianoche
      return totalMinutos;
    };

    const formatearHms = (totalMinutos) => {
      if (totalMinutos === null) return '--:--';
      const h = Math.floor(totalMinutos / 60);
      const m = totalMinutos % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    const minA = calcular(tiempos.anestesiaInicial, tiempos.anestesiaFinal);
    const minC = calcular(tiempos.cirugiaInicial, tiempos.cirugiaFinal);

    // Cálculo de diferencia
    let diffText = '--:--';
    let color = '#ffffff';
    if (minA !== null && minC !== null) {
      const diff = Math.abs(minA - minC);
      diffText = formatearHms(diff);
      color = minA > minC ? '#ffaa00' : '#00d278';
    }

    const maxRef = 12 * 60; // 12 horas para el 100% de la barra

    setCalculos({
      duracionAnestesia: formatearHms(minA),
      minAnestesia: minA || 0,
      pctAnestesia: `${Math.min(((minA || 0) / maxRef) * 100, 100).toFixed(1)}%`,
      duracionCirugia: formatearHms(minC),
      minCirugia: minC || 0,
      pctCirugia: `${Math.min(((minC || 0) / maxRef) * 100, 100).toFixed(1)}%`,
      diferencia: diffText,
      diffColor: color
    });
  }, [tiempos]);

  const cardClassName = 'mb-5 rounded-2xl border border-[rgb(85, 87, 89)] bg-white/5 p-[22px] backdrop-blur-[10px]';
  const formGroupClassName = 'mb-[10px] flex flex-col gap-[6px]';
  const formLabelClassName = 'text-[10px] font-semibold uppercase text-[#595759]';
  const formInputClassName = 'rounded-[8px] border border-[rgba(0,180,255,0.25)] bg-[rgba(255,255,255,0.07)] px-[10px] py-[10px] text-[#595759] outline-none placeholder:text-[#595759]/60 focus:border-[#00b4ff] focus:bg-[rgba(0,180,255,0.1)]';

  return (
    <div className="min-h-screen p-5 text-[#595759] [font-family:Montserrat] [background:linear-gradient(135deg,#ffffff_%,#76c4d5_1%,#595759)]">
      {/* HEADER */}
      <div className="mb-[25px] text-center">
        <h1 className="text-[21px] text-[#595759] uppercase tracking-[1px] [text-shadow:0_0_20px_rgba(0,180,255,0.5)]">🏥 Hoja de Anestesia Quirúrgica</h1>
        <div className="mx-auto my-[6px] h-[6px]  w-[200px] [background:linear-gradient(90deg,transparent,#76c4d5,transparent)]"></div>
        <p className='text-[#595759]'>Sistema de Registro Quirúrgico Interactivo</p>
      </div>

      <div className="mx-auto max-w-[1100px]">
        {/* PERSONAL MÉDICO */}
        <div className={cardClassName}>
          <div className="mb-[18px] flex items-center gap-[10px] [background:linear-gradient(135deg,#595759,#595759)] border-b border-[rgb(85, 87, 89)] rounded-[10px] pb-1">
            <div className="flex items-center justify-center rounded-[9px] [background:linear-gradient(130deg,#,#)]">🩺</div>
            <h2 className='text-[#ffffff]'>Personal Médico</h2>
          </div>
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
            {['cirujano1', 'cirujano2', 'ayudante1', 'ayudante2'].map((id) => (
              <div className={formGroupClassName} key={id}>
                <label className={formLabelClassName}>{id.replace(/([A-Z])/g, ' $1').replace('1', ' 1').replace('2', ' 2')}</label>
                <Input type="text" id={id} placeholder="Nombre..." value={personal[id]} onChange={handlePersonalChange} className={formInputClassName} />
              </div>
            ))}
          </div>
          <div className="mt-[15px] grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(250px,1fr))]">
            {['anestesiologo', 'ayudanteAnestesia', 'pediatra' ].map((id) => (
              <div className={formGroupClassName} key={id}>
                <label className={formLabelClassName}>{id.replace(/([A-Z])/g, ' $1')}</label>
                <Input type="text" id={id} placeholder="Nombre..." value={personal[id]} onChange={handlePersonalChange} className={formInputClassName} />
              </div>
            ))}
          </div>
          <div className="mt-[15px] grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(250px,1fr))]">
            {['Servicio / Especialidad'].map((id) => (
              <div className={formGroupClassName} key={id}>
                <label className={formLabelClassName}>{id.replace(/([A-Z])/g, ' $1')}</label>
                <Input type="text" id={id} placeholder="Nombre..." value={personal[id]} onChange={handlePersonalChange} className={formInputClassName} />
              </div>
            ))}
          </div>
        </div>

        {/* TIEMPOS QUIRÚRGICOS */}
        <div className={cardClassName}>
         <div className="mb-[18px] flex items-center gap-[10px] [background:linear-gradient(135deg,#595759,#595759)] border-b border-[rgb(85, 87, 89)] rounded-[10px] pb-1">
            <div className="flex h-9 w-9 items-center  justify-center rounded-[10px] [background:linear-gradient(15deg,#,#)]">⏱️</div>
            <h2 className='text-[#ffffff] font-bold'>Tiempos Quirúrgicos</h2>
          </div>

          <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
            {/* BLOQUE ANESTESIA */}
            <TiempoInputBlock 
              titulo="Tiempo de Anestesia"
              prefix="anestesia"
              tiempos={tiempos}
              onChange={handleTiempoChange}
              calculos={{
                duracion: calculos.duracionAnestesia,
                minutos: calculos.minAnestesia,
                pct: calculos.pctAnestesia
              }}
            />

            {/* BLOQUE CIRUGÍA */}
            <TiempoInputBlock 
              titulo="Tiempo de Cirugía"
              prefix="cirugia"
              tiempos={tiempos}
              onChange={handleTiempoChange}
              calculos={{
                duracion: calculos.duracionCirugia,
                minutos: calculos.minCirugia,
                pct: calculos.pctCirugia
              }}
            />
          </div>

          {/* RESUMEN */}
          <div className="mt-5 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
            <ResumenItem icon="💉" valor={calculos.duracionAnestesia} label="Duración Anestesia" />
            <ResumenItem icon="🔪" valor={calculos.duracionCirugia} label="Duración Cirugía" />
            <ResumenItem 
                icon="⚖️" 
                valor={calculos.diferencia} 
                label="Diferencia A/C" 
                diffColor={calculos.diffColor}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTES PARA LIMPIEZA DEL CÓDIGO ---

const TiempoInputBlock = ({ titulo, prefix, tiempos, onChange, calculos }) => (
  <div className="rounded-xl border border-[rgba(38, 72, 88, 0.7)] bg-[rgba(0, 179, 255, 0.55)] p-4">
    <h3 className="mb-[10px] text-[12px] text-[#595759]">● {titulo}</h3>
    <div className="grid grid-cols-2 gap-[10px]">
      <div className="mb-[10px] flex flex-col gap-[6px]">
        <label className="text-[10px] font-semibold uppercase text-[#595759]">⏰ Inicio</label>
        <input type="time" id={`${prefix}Inicial`} value={tiempos[`${prefix}Inicial`]} onChange={onChange} className="rounded-[8px] border border-[rgba(0,180,255,0.25)] bg-[rgba(255,255,255,0.07)] px-[10px] py-[10px] text-[#595759] outline-none [color-scheme:light] focus:border-[#00b4ff] focus:bg-[rgba(0,180,255,0.1)]" />
      </div>
      <div className="mb-[10px] flex flex-col gap-[6px]">
        <label className="text-[10px] font-semibold uppercase text-[#595759]">🏁 Final</label>
        <input type="time" id={`${prefix}Final`} value={tiempos[`${prefix}Final`]} onChange={onChange} className="rounded-[8px] border border-[rgba(0,180,255,0.25)] bg-[rgba(255,255,255,0.07)] px-[10px] py-[10px] text-[#595759] outline-none [color-scheme:light] focus:border-[#00b4ff] focus:bg-[rgba(0,180,255,0.1)]" />
      </div>
    </div>
    <div className="mt-[10px] flex items-center justify-between rounded-[10px] border border-[rgba(0,180,255,0.4)] p-3 [background:linear-gradient(135deg,rgba(0,180,255,0.15),rgba(0,102,204,0.15))]">
      <div>
        <div className="text-[9px] text-[#595759]">DURACIÓN TOTAL</div>
        <div className="font-mono text-[22px] font-bold text-[#595759]">{calculos.duracion}</div>
      </div>
      <div className="text-right text-[10px] text-[#00d278]">
        {calculos.minutos > 0 ? `${calculos.minutos} min` : 'Esperando...'}
      </div>
    </div>
    <div className="mt-[10px]">
      <div className="flex justify-between text-[9px] text-[#7eb8d4]">
        <span>Progreso</span>
        <span>{calculos.pct}</span>
      </div>
      <div className="mt-[5px] h-[6px] overflow-hidden rounded-[3px] bg-[rgba(255,255,255,0.1)]">
        <div className="h-full bg-[linear-gradient(90deg,#00b4ff,#00e5ff)] transition-[width] duration-500 ease-in-out" style={{ width: calculos.pct }}></div>
      </div>
    </div>
  </div>
);

const ResumenItem = ({ icon, valor, label, diffColor }) => {
  const diffClass = diffColor === '#ffaa00'
    ? 'text-[#ffaa00]'
    : diffColor === '#00d278'
      ? 'text-[#00d278]'
      : 'text-595759';

  return (
    <div className="rounded-[10px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] p-[15px] text-center">
      <div className="text-[22px]">{icon}</div>
      <div className={`font-mono text-[20px] font-bold ${diffClass}`}>{valor}</div>
      <div className="text-[10px] uppercase text-[#7eb8d4]">{label}</div>
    </div>
  );
};

export default AnestesiaApp;
