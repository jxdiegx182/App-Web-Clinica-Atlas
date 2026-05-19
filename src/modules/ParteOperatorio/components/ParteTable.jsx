import { ESTADOS, SN, SS } from '../data/parteOperatorioData';
import { h12, horaToMin, minToHora, tcls } from '../utils/parteOperatorioUtils';

const ParteTable = ({
  salaFiltro,
  fechaActiva,
  labelFecha,
  stats,
  cxFiltrados,
  modoAdmin,
  abrirEditar,
  eliminarCirugia,
}) => (
  <div className="card">
    <div className="card-hdr">
      <div className="chi">📋</div>
      <span className="cht">{SN[salaFiltro]}</span>
      <span className="tbl-fecha">{labelFecha(fechaActiva)}</span>
    </div>
    <div className="stats-row">
      <div className="schip"><div className="sdot" style={{ background: 'var(--teal)' }} />Total:<strong>{stats.total}</strong></div>
      <div className="schip"><div className="sdot" style={{ background: 'var(--teal-mid)' }} />Lap.:<strong>{stats.lap}</strong></div>
      <div className="schip"><div className="sdot" style={{ background: 'var(--amber)' }} />Abierta:<strong>{stats.ab}</strong></div>
      <div className="schip"><div className="sdot" style={{ background: 'var(--navy)' }} />Endosc.:<strong>{stats.en}</strong></div>
      <div className="schip"><div className="sdot" style={{ background: 'var(--green)' }} />Otros:<strong>{stats.otros}</strong></div>
    </div>
    <div className="tbl-wrap">
      <table>
        <thead>
          <tr>
            <th>Hora</th><th>Paciente</th><th>Edad</th><th>Cirugía</th>
            <th>Cirujano</th><th>Ayudante</th><th>Anestesiólogo</th>
            <th>Tipo</th><th>T.h</th><th>Sala</th><th>Estado</th>
            {modoAdmin && <th>Obs.</th>}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {cxFiltrados.length === 0 ? (
            <tr className="er">
              <td colSpan={modoAdmin ? 13 : 12}>Sin cirugías programadas para este día en esta vista</td>
            </tr>
          ) : (
            cxFiltrados.map((r) => {
              const est     = ESTADOS[r.estado || 'programado'] || ESTADOS.programado;
              const finHora = h12(minToHora(horaToMin(r.hora) + Math.round(r.tpo * 60)));
              return (
                <tr key={r.id}>
                  <td className="hc">
                    {h12(r.hora)}
                    <br />
                    <span style={{ fontSize: '.62rem', color: 'var(--teal-d)', fontWeight: 600, background: 'var(--teal-l)', padding: '1px 5px', borderRadius: 4, display: 'inline-block', marginTop: 2 }}>
                      → {finHora}
                    </span>
                  </td>
                  <td className="nc">{r.nom}</td>
                  <td style={{ textAlign: 'center', fontFamily: "'Montserrat',sans-serif" }}>{r.edad || '—'}</td>
                  <td style={{ fontWeight: 600, color: 'var(--navy-mid)' }}>{r.cir}</td>
                  <td className="dc">{r.dr}</td>
                  <td className="dc">{r.ayu || '—'}</td>
                  <td className="dc">{r.ane || '—'}</td>
                  <td><span className={`tbadge ${tcls(r.tipo)}`}>{r.tipo}</span></td>
                  <td style={{ textAlign: 'center', fontFamily: "'Montserrat',sans-serif" }}>{r.tpo}h</td>
                  <td className="sc2">{SS[r.sala]}</td>
                  <td><span className={`estado-badge ${est.cls}`}>{est.icon} {est.lbl}</span></td>
                  {modoAdmin && (
                    <td style={{ fontSize: '.71rem', color: 'var(--muted)', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.obs || ''}>
                      {r.obs || '—'}
                    </td>
                  )}
                  <td>
                    {modoAdmin && (
                      <div className="abw">
                        <button className="be" onClick={() => abrirEditar(r)} title="Editar">✏️</button>
                        <button className="bd" onClick={() => eliminarCirugia(r.id)} title="Eliminar">✕</button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default ParteTable;
