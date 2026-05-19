const AccessModal = ({
  pin,
  errorPin,
  manejarPin,
  verificarAcceso,
  entrarSoloLectura,
}) => (
  <div className="access-modal">
    <div className="access-box">
      <div className="access-hdr">
        <div style={{ fontSize: '1.6rem', marginBottom: '6px' }}>🔐</div>
        <div style={{ fontWeight: 800, color: 'white' }}>PARTE OPERATORIO</div>
        <div style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.5)' }}>Clínicas Atlas · MANFHER SYSTEMS</div>
      </div>
      <div className="access-body">
        <p style={{ textAlign: 'center', fontSize: '.78rem', color: 'var(--muted)', marginBottom: '4px' }}>
          Ingrese el código de administración para editar
        </p>
        <div className="access-pin">
          {pin.map((d, i) => (
            <input
              key={i} id={`pin-${i}`} type="password" maxLength="1"
              value={d} inputMode="numeric"
              onChange={(e) => manejarPin(e.target.value, i)}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !d && i > 0) document.getElementById(`pin-${i - 1}`)?.focus();
                if (e.key === 'Enter') verificarAcceso();
              }}
            />
          ))}
        </div>
        {errorPin && <div className="access-error">{errorPin}</div>}
        <button className="access-btn" onClick={verificarAcceso}>🔓 Ingresar como Administrador</button>
        <button
          style={{ width: '100%', marginTop: '8px', padding: '10px', background: 'transparent', border: '1.5px solid var(--border)', borderRadius: '8px', fontFamily: "'Montserrat',sans-serif", fontSize: '.84rem', color: 'var(--muted)', cursor: 'pointer' }}
          onClick={entrarSoloLectura}
        >
          👁 Solo lectura — Ver parte
        </button>
      </div>
    </div>
  </div>
);

export default AccessModal;
