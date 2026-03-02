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

  return (
    <div className="main-wrapper">
      <style>{`
        .main-wrapper {
          font-family: Montserrat, sans-serif;
          background: linear-gradient(135deg, #0b4f6c 0%, #0b4f6c 50%, #0d2137 100%);
          min-height: 100vh;
          padding: 20px;
          color: white;
        }
        .container { max-width: 1100px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 25px; animation: fadeInDown 0.8s ease; }
        .header h1 { font-size: 28px; letter-spacing: 3px; text-transform: uppercase; text-shadow: 0 0 20px rgba(0, 180, 255, 0.5); }
        .header-line { width: 200px; height: 3px; background: linear-gradient(90deg, transparent, #00b4ff, transparent); margin: 10px auto; }
        
        .card { 
          background: rgba(255, 255, 255, 0.05); 
          backdrop-filter: blur(10px); 
          border: 1px solid rgba(0, 180, 255, 0.2); 
          border-radius: 16px; padding: 22px; margin-bottom: 20px;
          animation: fadeInUp 0.6s ease;
        }
        .card-title { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; border-bottom: 1px solid rgba(0, 180, 255, 0.2); padding-bottom: 12px; }
        .icon { width: 36px; height: 36px; background: linear-gradient(135deg, #00b4ff, #0066cc); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        
        .grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
        .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; }
        
        .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; }
        .form-group label { color: #7eb8d4; font-size: 10px; font-weight: 600; text-transform: uppercase; }
        .form-group input { 
          background: rgba(255, 255, 255, 0.07); border: 1px solid rgba(0, 180, 255, 0.25); 
          border-radius: 8px; padding: 10px; color: white; outline: none; 
        }
        .form-group input:focus { border-color: #00b4ff; background: rgba(0, 180, 255, 0.1); }

        .tiempo-wrapper { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .tiempo-bloque { background: rgba(0, 180, 255, 0.05); border: 1px solid rgba(0, 180, 255, 0.2); border-radius: 12px; padding: 16px; }
        .duracion-display { 
          background: linear-gradient(135deg, rgba(0, 180, 255, 0.15), rgba(0, 102, 204, 0.15)); 
          border: 1px solid rgba(0, 180, 255, 0.4); border-radius: 10px; padding: 12px; 
          display: flex; justify-content: space-between; align-items: center; margin-top: 10px;
        }
        .dur-value { color: #00e5ff; font-size: 22px; font-weight: 700; font-family: monospace; }
        
        .progress-bar { height: 6px; background: rgba(255, 255, 255, 0.1); border-radius: 3px; overflow: hidden; margin-top: 5px; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #00b4ff, #00e5ff); transition: width 0.5s ease; }
        
        .resumen-tiempos { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-top: 20px; }
        .resumen-item { background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; padding: 15px; text-align: center; }
        
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* HEADER */}
      <div className="header">
        <h1>🏥 Hoja de Anestesia Quirúrgica</h1>
        <div className="header-line"></div>
        <p>Sistema de Registro Quirúrgico Interactivo</p>
      </div>

      <div className="container">
        {/* PERSONAL MÉDICO */}
        <div className="card">
          <div className="card-title">
            <div className="icon">👨‍⚕️</div>
            <h2>Personal Médico</h2>
          </div>
          <div className="grid-4">
            {['cirujano1', 'cirujano2', 'ayudante1', 'ayudante2'].map((id) => (
              <div className="form-group" key={id}>
                <label>{id.replace(/([A-Z])/g, ' $1').replace('1', ' 1').replace('2', ' 2')}</label>
                <Input type="text" id={id} placeholder="Nombre..." value={personal[id]} onChange={handlePersonalChange} />
              </div>
            ))}
          </div>
          <div className="grid-3" style={{ marginTop: '15px' }}>
            {['anestesiologo', 'ayudanteAnestesia', 'pediatra' ].map((id) => (
              <div className="form-group" key={id}>
                <label>{id.replace(/([A-Z])/g, ' $1')}</label>
                <Input type="text" id={id} placeholder="Nombre..." value={personal[id]} onChange={handlePersonalChange} />
              </div>
            ))}
          </div>
          <div className="grid-3" style={{ marginTop: '15px' }}>
            {['Servicio / Especialidad'].map((id) => (
              <div className="form-group" key={id}>
                <label>{id.replace(/([A-Z])/g, ' $1')}</label>
                <Input type="text" id={id} placeholder="Nombre..." value={personal[id]} onChange={handlePersonalChange} />
              </div>
            ))}
          </div>
        </div>

        {/* TIEMPOS QUIRÚRGICOS */}
        <div className="card">
          <div className="card-title">
            <div className="icon">⏱️</div>
            <h2>Tiempos Quirúrgicos</h2>
          </div>

          <div className="tiempo-wrapper">
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
          <div className="resumen-tiempos">
            <ResumenItem icon="💉" valor={calculos.duracionAnestesia} label="Duración Anestesia" />
            <ResumenItem icon="🔪" valor={calculos.duracionCirugia} label="Duración Cirugía" />
            <ResumenItem 
                icon="⚖️" 
                valor={calculos.diferencia} 
                label="Diferencia A/C" 
                style={{ color: calculos.diffColor }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTES PARA LIMPIEZA DEL CÓDIGO ---

const TiempoInputBlock = ({ titulo, prefix, tiempos, onChange, calculos }) => (
  <div className="tiempo-bloque">
    <h3 style={{ color: '#00b4ff', fontSize: '12px', marginBottom: '10px' }}>● {titulo}</h3>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
      <div className="form-group">
        <label>⏰ Inicio</label>
        <input type="time" id={`${prefix}Inicial`} value={tiempos[`${prefix}Inicial`]} onChange={onChange} />
      </div>
      <div className="form-group">
        <label>🏁 Final</label>
        <input type="time" id={`${prefix}Final`} value={tiempos[`${prefix}Final`]} onChange={onChange} />
      </div>
    </div>
    <div className="duracion-display">
      <div>
        <div style={{ fontSize: '9px', color: '#7eb8d4' }}>DURACIÓN TOTAL</div>
        <div className="dur-value">{calculos.duracion}</div>
      </div>
      <div style={{ textAlign: 'right', fontSize: '10px', color: '#00d278' }}>
        {calculos.minutos > 0 ? `${calculos.minutos} min` : 'Esperando...'}
      </div>
    </div>
    <div style={{ marginTop: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#7eb8d4' }}>
        <span>Progreso</span>
        <span>{calculos.pct}</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: calculos.pct }}></div>
      </div>
    </div>
  </div>
);

const ResumenItem = ({ icon, valor, label, style }) => (
  <div className="resumen-item">
    <div style={{ fontSize: '22px' }}>{icon}</div>
    <div style={{ fontSize: '20px', fontWeight: 'bold', fontFamily: 'monospace', ...style }}>{valor}</div>
    <div style={{ fontSize: '10px', color: '#7eb8d4', textTransform: 'uppercase' }}>{label}</div>
  </div>
);

export default AnestesiaApp;