import React, { useState, useRef, useEffect } from 'react';
import styles from './UIComponents.module.css';

export const Card = ({ icon, title, children, badge, colorClass }) => (
  <div className={styles.card}>
    <div className={`${styles.cardHeader} ${colorClass === 'ch-teal' ? styles.chTeal : ''}`}>
      <div className={styles.cardIcon}>{icon}</div>
      <span className={styles.cardTitle}>{title}</span>
      {badge && <span style={{marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--muted)'}}>{badge}</span>}
    </div>
    <div className={styles.cardBody}>{children}</div>
  </div>
);

export const FieldGroup = ({ label, children, style }) => (
  <div style={{ marginBottom: '14px', ...style }}>
    <label className="fl">{label}</label>
    {children}
  </div>
);

export const Input = ({ mono, redText, ...props }) => (
  <input
    className="fi"
    style={{
      ...(mono ? { fontFamily: 'var(--font-mono)', fontWeight: 700 } : {}),
      ...(redText ? { color: 'var(--red)', fontWeight: 700 } : {}),
    }}
    {...props}
  />
);

export const Select = ({ options, valueKey, labelKey, ...props }) => (
  <select className="fs" {...props}>
    {(options || []).map((opt, i) => {
      if (typeof opt === 'string') return <option key={i} value={opt}>{opt || '—'}</option>;
      return <option key={i} value={opt[valueKey || 'value']}>{opt[labelKey || 'label']}</option>;
    })}
  </select>
);

export const Btn = ({ children, onClick, variant, disabled }) => (
  <button
    type="button"
    className={variant === 'outline' ? styles.btnOutline : styles.btnPrimary}
    onClick={onClick}
    disabled={disabled}
    style={disabled ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
  >
    {children}
  </button>
);

// ── SearchDropdown: buscador con dropdown funcional ──
export function SearchDropdown({ placeholder, icon, db, onSelect, renderOption, renderValue }) {
  const [query, setQuery]   = useState('');
  const [open, setOpen]     = useState(false);
  const [results, setResults] = useState([]);
  const wrapRef = useRef(null);

  const search = (q) => {
    setQuery(q);
    if (!q || q.length < 1) { setResults([]); setOpen(false); return; }
    const q2 = q.toLowerCase();
    const res = (db || []).filter(item => {
      const code = (item.c || item.nombre || '').toLowerCase();
      const desc = (item.d || item.nombre || '').toLowerCase();
      return code.includes(q2) || desc.includes(q2);
    }).slice(0, 14);
    // Add free-text option if no exact match
    if (q.trim().length >= 2 && !res.find(r => (r.nombre||'').toLowerCase() === q2)) {
      const hasFreeText = db && db[0] && db[0].cat; // it's an insumo
      if (hasFreeText) {
        res.push({ cat: 'generales', nombre: q.trim(), isNew: true });
      }
    }
    setResults(res);
    setOpen(res.length > 0);
  };

  const pick = (item) => {
    onSelect(item);
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          className="fi"
          type="text"
          value={query}
          onChange={e => search(e.target.value)}
          onFocus={() => { if (query.length >= 1) setOpen(results.length > 0); }}
          placeholder={placeholder}
          autoComplete="off"
          style={{ paddingRight: 38 }}
        />
        <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }}>
          {icon || '🔍'}
        </span>
      </div>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: 'var(--white)', border: '1.5px solid var(--border)',
          borderRadius: 9, maxHeight: 220, overflowY: 'auto', zIndex: 100,
          boxShadow: 'var(--shadow-lg)',
        }}>
          {results.map((item, i) => (
            <div
              key={i}
              onMouseDown={() => pick(item)}
              style={{
                padding: '10px 14px', cursor: 'pointer',
                borderBottom: i < results.length - 1 ? '1px solid var(--surface2)' : 'none',
                display: 'flex', alignItems: 'flex-start', gap: 10, transition: 'background .12s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--teal-l)'}
              onMouseLeave={e => e.currentTarget.style.background = ''}
            >
              {renderOption ? renderOption(item) : (
                <span>{item.c || item.nombre}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── CIETag: tag con código + descripción + botón eliminar ──
export function CIETag({ code, desc, onRemove, synced }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: synced ? '#dbeafe' : 'var(--navy-l)',
      border: `1px solid ${synced ? '#2979ff' : 'var(--border)'}`,
      borderRadius: 100, padding: '5px 12px 5px 10px', fontSize: '.78rem',
    }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--navy)' }}>{code}</span>
      <span style={{ color: 'var(--text)' }}>{desc}</span>
      {synced && (
        <span style={{ fontSize: '.6rem', padding: '1px 6px', borderRadius: 100, background: '#0d47a1', color: 'white', fontWeight: 700, letterSpacing: '.05em' }}>INGRESO</span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '.85rem', padding: 0, lineHeight: 1 }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
        >✕</button>
      )}
    </span>
  );
}

export const SL = ({ children }) => <span style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase' }}>{children}</span>;