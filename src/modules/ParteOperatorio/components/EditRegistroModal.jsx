import { ESTADOS, SN, TIPOS_CX } from '../data/parteOperatorioData';

const EditRegistroModal = ({
  editRec,
  setEditRec,
  modoAdmin,
  cerrarEditar,
  guardarEdicion,
}) => (
  <div className="mov open" onClick={(e) => { if (e.target === e.currentTarget) cerrarEditar(); }}>
    <div className="mbx">
      <div className="mhdr">
        <div className="chi">✏️</div>
        <span className="cht">Editar Registro</span>
        <button className="bxm" onClick={cerrarEditar}>✕</button>
      </div>
      <div className="mbody">
        {[
          ['hora',  'Hora (HH:MM)', 'text'],
          ['nom',   'Paciente',     'text'],
          ['edad',  'Edad',         'number'],
          ['cir',   'Cirugía',      'text'],
          ['dr',    'Cirujano',     'text'],
          ['ayu',   'Ayudante',     'text'],
          ['ane',   'Anestesiólogo','text'],
        ].map(([campo, label, tipo]) => (
          <div key={campo}>
            <label className="fl">{label.toUpperCase()}</label>
            <input className="fi" type={tipo} value={editRec[campo] || ''}
              onChange={(e) => setEditRec((r) => ({ ...r, [campo]: e.target.value }))} />
          </div>
        ))}
        <div className="g2">
          <div>
            <label className="fl">TIPO</label>
            <select className="fs" value={editRec.tipo}
              onChange={(e) => setEditRec((r) => ({ ...r, tipo: e.target.value }))}>
              {TIPOS_CX.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="fl">TIEMPO (H)</label>
            <input className="fi" type="number" step="0.5" min="0.5" value={editRec.tpo}
              onChange={(e) => setEditRec((r) => ({ ...r, tpo: parseFloat(e.target.value) || 1 }))} />
          </div>
        </div>
        <div>
          <label className="fl">SALA</label>
          <select className="fs" value={editRec.sala}
            onChange={(e) => setEditRec((r) => ({ ...r, sala: parseInt(e.target.value) }))}>
            {[1, 2, 3, 4, 5, 6].map((s) => <option key={s} value={s}>{SN[s]}</option>)}
          </select>
        </div>
        <div>
          <label className="fl">ESTADO</label>
          <select className="fs" value={editRec.estado || 'programado'}
            onChange={(e) => setEditRec((r) => ({ ...r, estado: e.target.value }))}>
            {Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.lbl}</option>)}
          </select>
        </div>
        {modoAdmin && (
          <div>
            <label className="fl" style={{ color: 'var(--red)' }}>🔒 OBSERVACIONES / ALERGIAS</label>
            <input className="fi" style={{ borderColor: 'var(--red-mid)' }} value={editRec.obs || ''}
              onChange={(e) => setEditRec((r) => ({ ...r, obs: e.target.value }))} />
          </div>
        )}
      </div>
      <div className="mfoot">
        <button className="bmo" onClick={cerrarEditar}>Cancelar</button>
        <button className="bms" onClick={guardarEdicion}>💾 Guardar Cambios</button>
      </div>
    </div>
  </div>
);

export default EditRegistroModal;
