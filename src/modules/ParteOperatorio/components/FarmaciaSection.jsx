const FarmaciaSection = ({
  farmPedidos,
  fechaActiva,
  modoAdmin,
  farmForm,
  setFarmForm,
  agregarFarmPedido,
  toggleFarmOk,
  elimFarmPedido,
}) => (
  <div className="farm-card" style={{ marginTop: '16px' }}>
    <div className="card-hdr" style={{ background: 'linear-gradient(135deg,var(--amber),#975a16)' }}>
      <div className="chi">🏥</div>
      <span className="cht">Pedidos Especiales a Farmacia</span>
      <span style={{ marginLeft: 'auto', fontSize: '.66rem', color: 'rgba(255,255,255,.6)' }}>Insumos y medicamentos especiales por cirugía</span>
    </div>
    <div>
      {farmPedidos.filter((p) => p.fecha === fechaActiva).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '16px', color: 'var(--dim)', fontSize: '.8rem', fontStyle: 'italic' }}>Sin pedidos para este día</div>
      ) : (
        farmPedidos.filter((p) => p.fecha === fechaActiva).map((p) => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderBottom: '1px solid var(--surface2)' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: p.prio === 'urg' ? 'var(--red)' : 'var(--amber)' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--navy)' }}>{p.item}{p.cant ? ` — ${p.cant}` : ''}</div>
              <div style={{ fontSize: '.7rem', color: 'var(--muted)' }}>{p.pac ? `Cirugía: ${p.pac} · ` : ''}Estado: {p.estado === 'ok' ? '✅ Confirmado' : '⏳ Pendiente'}</div>
            </div>
            <span className={`farm-badge ${p.prio === 'urg' ? 'fb-urg' : 'fb-norm'}`}>{p.prio === 'urg' ? 'Urgente' : 'Normal'}</span>
            <button onClick={() => toggleFarmOk(p.id)} style={{ padding: '3px 9px', borderRadius: 5, background: p.estado === 'ok' ? 'var(--green-l)' : 'var(--surface2)', border: `1px solid ${p.estado === 'ok' ? 'var(--green-mid)' : 'var(--border)'}`, color: p.estado === 'ok' ? 'var(--green)' : 'var(--muted)', fontSize: '.7rem', cursor: 'pointer' }}>✓</button>
            {modoAdmin && <button onClick={() => elimFarmPedido(p.id)} style={{ padding: '3px 7px', borderRadius: 5, background: 'var(--red-l)', border: '1px solid var(--red-mid)', color: 'var(--red)', fontSize: '.7rem', cursor: 'pointer' }}>✕</button>}
          </div>
        ))
      )}
    </div>
    {modoAdmin && (
      <div style={{ display: 'flex', gap: '8px', padding: '12px 16px', background: 'var(--surface)', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 2, minWidth: '160px' }}>
          <label className="fl" style={{ color: 'var(--amber)' }}>Medicamento / Insumo</label>
          <input className="fi" placeholder="Nombre del medicamento o insumo especial" value={farmForm.item}
            onChange={(e) => setFarmForm((f) => ({ ...f, item: e.target.value }))} />
        </div>
        <div style={{ flex: 1, minWidth: '100px' }}>
          <label className="fl" style={{ color: 'var(--amber)' }}>Cantidad</label>
          <input className="fi" placeholder="Ej: 2 amp, 1 kit" value={farmForm.cant}
            onChange={(e) => setFarmForm((f) => ({ ...f, cant: e.target.value }))} />
        </div>
        <div style={{ flex: 1, minWidth: '100px' }}>
          <label className="fl" style={{ color: 'var(--amber)' }}>Cirugía / Paciente</label>
          <input className="fi" placeholder="Referencia" value={farmForm.pac}
            onChange={(e) => setFarmForm((f) => ({ ...f, pac: e.target.value }))} />
        </div>
        <div style={{ minWidth: '90px' }}>
          <label className="fl" style={{ color: 'var(--amber)' }}>Prioridad</label>
          <select className="fs" value={farmForm.prio}
            onChange={(e) => setFarmForm((f) => ({ ...f, prio: e.target.value }))}>
            <option value="urg">🔴 Urgente</option>
            <option value="norm">🟡 Normal</option>
          </select>
        </div>
        <button onClick={agregarFarmPedido}
          style={{ padding: '0 15px', height: 32, background: 'var(--amber)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
          + Agregar Pedido
        </button>
      </div>
    )}
  </div>
);

export default FarmaciaSection;
