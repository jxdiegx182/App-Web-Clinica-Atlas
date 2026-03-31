// ══════════════════════════════════════════════════════
// UI COMPONENTS — MANFHER SYSTEMS · Atlas HIS
// Componentes base reutilizables
// ══════════════════════════════════════════════════════
import { useState, useRef, useEffect } from 'react';
import styles from './UIComponents.module.css';

// ── Card ──
export function Card({ icon, title, badge, badgeStyle, colorClass = 'ch-teal', children, noPrint }) {
  return (
    <div className={`${styles.card} ${noPrint ? styles.noPrint : ''}`}>
      <div className={`${styles.cardHeader} ${styles[colorClass]}`}>
        <div className={styles.cardIcon}>{icon}</div>
        <span className={styles.cardTitle}>{title}</span>
        {badge !== undefined && (
          <span className={styles.cardBadge} style={badgeStyle}>{badge}</span>
        )}
      </div>
      <div className={styles.cardBody}>{children}</div>
    </div>
  );
}

// ── SectionLabel ──
export function SL({ children }) {
  return <div className={styles.sl}>{children}</div>;
}

// ── FieldGroup ──
export function FieldGroup({ label, children, className }) {
  return (
    <div className={`${styles.fg} ${className || ''}`}>
      {label && <label className={styles.fl}>{label}</label>}
      {children}
    </div>
  );
}

// ── Input ──
export function Input({ mono, redText, ...props }) {
  return (
    <input
      className={`fi ${styles.input} ${mono ? styles.mono : ''} ${redText ? styles.redText : ''}`}
      {...props}
    />
  );
}

// ── Select ──
export function Select({ options, valueKey, labelKey, children, ...props }) {
  return (
    <select className={`fs ${styles.select}`} {...props}>
      {options
        ? options.map((o, i) => (
            <option key={i} value={valueKey ? o[valueKey] : o}>
              {labelKey ? o[labelKey] : o}
            </option>
          ))
        : children}
    </select>
  );
}

// ── Textarea ──
export function Textarea(props) {
  return <textarea className={`fta ${styles.textarea}`} {...props} />;
}

// ── AddRowButton ──
export function AddRowButton({ onClick, children }) {
  return (
    <button className={styles.btnAddRow} onClick={onClick} type="button">
      {children}
    </button>
  );
}

// ── DeleteRowButton ──
export function DeleteRowButton({ onClick }) {
  return (
    <button className={styles.btnDelRow} onClick={onClick} type="button">✕</button>
  );
}

// ── SearchDropdown — buscador con dropdown ──
export function SearchDropdown({ placeholder, icon = '🔍', db, onSelect, renderOption, renderValue, inputId }) {
  const [query, setQuery]   = useState('');
  const [open, setOpen]     = useState(false);
  const [results, setResults] = useState([]);
  const [pos, setPos]       = useState({ top: 0, left: 0, width: 220 });
  const inputRef            = useRef(null);
  const ddRef               = useRef(null);

  const search = (q) => {
    setQuery(q);
    if (!q || q.length < 2) { setResults([]); setOpen(false); return; }
    const q2 = q.toLowerCase();
    const res = db.filter(item => {
      if (typeof item === 'string') return item.toLowerCase().includes(q2);
      return Object.values(item).some(v => String(v).toLowerCase().includes(q2));
    }).slice(0, 12);
    setResults(res);
    setOpen(res.length > 0);
  };

  const onFocus = () => {
    if (query.length >= 2 && results.length > 0) setOpen(true);
    else if (!query) {
      const all = db.slice(0, 14);
      setResults(all); setOpen(all.length > 0);
    }
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 2, left: rect.left, width: Math.max(rect.width, 220) });
    }
  };

  const pick = (item) => {
    onSelect(item);
    setQuery(renderValue ? renderValue(item) : (typeof item === 'string' ? item : ''));
    setOpen(false);
  };

  // Cerrar al click fuera
  useEffect(() => {
    const handler = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target) &&
          ddRef.current && !ddRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Reposicionar al scroll
  useEffect(() => {
    if (!open) return;
    const update = () => {
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        setPos({ top: rect.bottom + 2, left: rect.left, width: Math.max(rect.width, 220) });
      }
    };
    window.addEventListener('scroll', update, true);
    return () => window.removeEventListener('scroll', update, true);
  }, [open]);

  return (
    <div className={styles.cieWrap}>
      <input
        ref={inputRef}
        id={inputId}
        className={styles.cieInput}
        type="text"
        placeholder={placeholder}
        value={query}
        autoComplete="off"
        onChange={e => search(e.target.value)}
        onFocus={onFocus}
      />
      <span className={styles.cieIcon}>{icon}</span>
      {open && (
        <div
          ref={ddRef}
          className={styles.cieDrop}
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.width, zIndex: 9999 }}
        >
          {results.map((item, i) => (
            <div key={i} className={styles.cieOpt} onMouseDown={() => pick(item)}>
              {renderOption ? renderOption(item) : (typeof item === 'string' ? item : JSON.stringify(item))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── CIE Tag ──
export function CIETag({ code, desc, onRemove }) {
  return (
    <span className={styles.cieTag}>
      <span className={styles.cieTagCode}>{code}</span>
      <span className={styles.cieTagName}>{desc}</span>
      <button className={styles.cieTagDel} onClick={onRemove} type="button">✕</button>
    </span>
  );
}

// ── VitalBadge ──
export function VitalBadge({ label, value, status }) {
  const cls = status === 'alert' ? styles.vitalAlert : status === 'warn' ? styles.vitalWarn : styles.vitalOk;
  return (
    <div className={`${styles.vitalBadge} ${cls}`}>
      {status === 'alert' ? '⚠️' : status === 'warn' ? '⚡' : ''}
      <span>{label}</span>
      {value}
    </div>
  );
}

// ── Modal ──
export function Modal({ open, onClose, children, width = '640px' }) {
  if (!open) return null;
  return (
    <div className={styles.modalOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modalBox} style={{ width: `min(${width}, 95vw)` }}>
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({ icon, title }) {
  return (
    <div className={styles.modalHeader}>
      <div className={styles.cardIcon}>{icon}</div>
      <span style={{ fontSize: '.85rem', fontWeight: 800 }}>{title}</span>
    </div>
  );
}

export function ModalBody({ children }) {
  return <div className={styles.modalBody}>{children}</div>;
}

export function ModalFooter({ children }) {
  return <div className={styles.modalFooter}>{children}</div>;
}

// ── Btn ──
export function Btn({ variant = 'primary', onClick, children, disabled, style }) {
  const cls = variant === 'primary' ? styles.btnPrimary
    : variant === 'outline' ? styles.btnOutline
    : variant === 'teal' ? styles.btnPrimary
    : variant === 'red' ? styles.btnRed
    : styles.btnPrimary;
  return (
    <button className={cls} onClick={onClick} disabled={disabled} type="button" style={style}>
      {children}
    </button>
  );
}

// ── StatusBadge ──
export function StatusBadge({ status }) {
  const map = {
    pendiente:     { bg: 'var(--amber-l)',  border: 'var(--amber-mid)',  color: 'var(--amber)',  label: 'Pendiente' },
    enviada:       { bg: 'var(--blue-l)',   border: '#93c5fd',           color: 'var(--blue)',   label: 'En Farmacia' },
    despachada:    { bg: 'var(--teal-l)',   border: 'var(--teal)',       color: 'var(--teal-d)', label: 'Despachado' },
    descontinuada: { bg: '#fed7d7',         border: '#fc8181',           color: 'var(--red)',    label: 'Descontinuado' },
  };
  const s = map[status] || map.pendiente;
  return (
    <span style={{ fontSize: '.66rem', fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
      {s.label}
    </span>
  );
}
