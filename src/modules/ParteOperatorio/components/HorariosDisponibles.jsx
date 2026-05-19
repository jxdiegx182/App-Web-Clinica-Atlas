import { HORAS_GRID, SS } from '../data/parteOperatorioData';
import { fechaHoy, fechaKey, h12 } from '../utils/parteOperatorioUtils';

const HorariosDisponibles = ({
  horariosFecha,
  setHorariosFecha,
  registros,
  estadoSlot,
  labelFecha,
}) => (
  <div className="horarios-card">
    <div className="card-hdr">
      <div className="chi">🕐</div>
      <span className="cht">HORARIOS DISPONIBLES POR SALA — {labelFecha(horariosFecha)}</span>
    </div>
    <div className="horarios-day-nav">
      {Array.from({ length: 7 }, (_, i) => {
        const d = fechaHoy(); d.setDate(d.getDate() + i);
        const fk = fechaKey(d);
        const esHoy = i === 0;
        const label = esHoy ? 'HOY' : d.toLocaleDateString('es-EC', { weekday: 'short', day: '2-digit', month: '2-digit' }).toUpperCase();
        const n = registros.filter((r) => r.fecha === fk).length;
        return (
          <button key={fk} className={`day-pill${esHoy ? ' hoy-pill' : ''}${horariosFecha === fk ? ' active' : ''}`}
            onClick={() => setHorariosFecha(fk)}>
            {label}{n > 0 ? ` (${n})` : ''}
          </button>
        );
      })}
      <div className="horarios-legend" style={{ marginLeft: 'auto' }}>
        <div className="leg-item"><div className="leg-dot" style={{ background: 'var(--green)' }} /> Libre</div>
        <div className="leg-item"><div className="leg-dot" style={{ background: 'var(--amber)' }} /> Limpieza</div>
        <div className="leg-item"><div className="leg-dot" style={{ background: 'var(--red)' }} /> Ocupado</div>
      </div>
    </div>
    <div style={{ overflowX: 'auto' }}>
      <div className="horarios-grid" style={{ minWidth: '900px' }}>
        {[1, 2, 3, 4, 5, 6].map((salaId) => (
          <div key={salaId} className="sala-col">
            <div className="sala-col-hdr">{SS[salaId]}</div>
            {HORAS_GRID.map((horaStr) => {
              const s = estadoSlot(salaId, horaStr);
              return (
                <div key={horaStr} className={`hora-slot ${s.tipo}`}>
                  <div className="slot-info">
                    {s.tipo === 'ocupado'  && <>{`🔴 ${(s.nom || '').split(' ')[0]}`}</>}
                    {s.tipo === 'limpieza' && <>🧹 LIMPIEZA</>}
                    {s.tipo === 'libre'    && <>✅ {h12(horaStr)}</>}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default HorariosDisponibles;
