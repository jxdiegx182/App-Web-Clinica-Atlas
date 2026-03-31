// ══════════════════════════════════════════════════════════════════
// ENTREGABLE 3 — SeccionProtocolo.jsx
// Componente principal del Protocolo Operatorio Form. 017
// Orquesta todos los sub-componentes
// ══════════════════════════════════════════════════════════════════
import { useState, useCallback } from 'react';
import { useProtocolo } from '../hooks/useProtocolo';
import { Card, FieldGroup, Input, Select, Btn, SL, SearchDropdown, CIETag } from './UIComponents';
import {
  CIE10_QUIRURGICO, CPT_DB, INSUMOS_DB, STAFF_DB,
  CAT_LABELS, CAT_COLORS, CAT_ICONS,
  TIPOS_CIRUGIA, TIPOS_ANESTESIA,
  NARRACION_SECTIONS, URGENCIA_PATOLOGIA, IA_BUTTONS, ALERT_MAP,
} from '../data/protocoloDB';
import styles from './Protocolo.module.css';

// ══════════════════════════════════════════════════════════════════
// 1. CABECERA DEL PACIENTE
// ══════════════════════════════════════════════════════════════════
function PacienteHeader({ paciente, onUpdate }) {
  return (
    <>
      {/* Banner de nombre */}
      <div className={styles.patHeader}>
        <div className={styles.patAvatar}>🧑‍⚕️</div>
        <div>
          <div className={styles.patName}>{paciente.nombres.toUpperCase() || 'NOMBRE DEL PACIENTE'}</div>
          <div className={styles.patId}>
            ID: {paciente.id || '—'} · HCL: {paciente.hcl || '—'} · DOB: {paciente.fechaNac || '—'}
          </div>
        </div>
        {paciente.alergias && (
          <div className={styles.allergyBadge}>⚠️ ALERGIA: {paciente.alergias}</div>
        )}
      </div>

      {/* Campos del paciente */}
      <div className={styles.patBody}>
        {[
          { id: 'nombres',      label: 'Nombres y Apellidos',   placeholder: 'APELLIDO APELLIDO, NOMBRE NOMBRE', upper: true },
          { id: 'id',           label: 'Identificación',         placeholder: '0000000000',  mono: true },
          { id: 'edad',         label: 'Edad',                   placeholder: '41 años' },
          { id: 'servicio',     label: 'Servicio',               placeholder: 'CIRUGÍA' },
          { id: 'seguro',       label: 'Seguro',                 placeholder: 'HUMANA' },
          { id: 'hcl',          label: 'HCL',                    placeholder: '1713656748', mono: true },
          { id: 'fechaNac',     label: 'Fecha Nacimiento',       type: 'date' },
          { id: 'medico',       label: 'Médico',                 placeholder: 'Dr. Nombre...' },
          { id: 'dias',         label: 'Días de Estancia',       type: 'number' },
          { id: 'alergias',     label: 'Alergias ⚠️',           placeholder: 'NKDA o especifique', redText: true },
          { id: 'fechaCirugia', label: 'Fecha de Cirugía',       type: 'date' },
          { id: 'numHoja',      label: 'N° Hoja',                placeholder: '017', mono: true },
        ].map(({ id, label, placeholder, type = 'text', mono, upper, redText }) => (
          <FieldGroup key={id} label={label}>
            <Input
              type={type}
              value={paciente[id] || ''}
              onChange={e => onUpdate({ [id]: upper ? e.target.value.toUpperCase() : e.target.value })}
              placeholder={placeholder}
              mono={mono}
              redText={redText}
            />
          </FieldGroup>
        ))}
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════
// 2. BUSCADOR CIE-10 CON TAGS (reutilizable para múltiples scopes)
// ══════════════════════════════════════════════════════════════════
function CIESearchBox({ selected, onAdd, onRemove, placeholder, emptyLabel }) {
  return (
    <div>
      <SearchDropdown
        placeholder={placeholder || '🔍 Buscar por código o descripción CIE-10...'}
        icon="🔍"
        db={CIE10_QUIRURGICO}
        onSelect={(item) => onAdd(item)}
        renderOption={(item) => (
          <>
            <span className={styles.cieOptCode}>{item.c}</span>
            <span className={styles.cieOptDesc}>{item.d}</span>
          </>
        )}
        renderValue={() => ''}
      />
      <div className={styles.cieTags}>
        {selected.length === 0
          ? <span className={styles.emptyLabel}>{emptyLabel || 'Sin selección'}</span>
          : selected.map(dx => (
              <CIETag key={dx.c} code={dx.c} desc={dx.d} onRemove={() => onRemove(dx.c)} />
            ))
        }
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// 3. BUSCADOR DE STAFF MÉDICO
// ══════════════════════════════════════════════════════════════════
function StaffSearchInput({ label, value, onChange, field }) {
  const [showDrop, setShowDrop] = useState(false);
  const [results, setResults]   = useState([]);

  const search = (q) => {
    onChange(q);
    if (q.length < 2) { setResults([]); setShowDrop(false); return; }
    const r = STAFF_DB.filter(s =>
      s.nombre.toLowerCase().includes(q.toLowerCase()) ||
      s.especialidad.toLowerCase().includes(q.toLowerCase())
    ).slice(0, 8);
    setResults(r);
    setShowDrop(r.length > 0);
  };

  const pick = (staff) => {
    onChange(staff.nombre);
    setShowDrop(false);
  };

  return (
    <FieldGroup label={label}>
      <div style={{ position: 'relative' }}>
        <Input
          value={value}
          onChange={e => search(e.target.value)}
          onBlur={() => setTimeout(() => setShowDrop(false), 200)}
          placeholder="Dr. Apellido Nombre..."
        />
        {showDrop && (
          <div className={styles.staffDrop}>
            {results.map(s => (
              <div key={s.id} className={styles.staffOpt} onMouseDown={() => pick(s)}>
                <span className={styles.staffNombre}>{s.nombre}</span>
                <span className={styles.staffEsp}>{s.especialidad}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </FieldGroup>
  );
}

// ══════════════════════════════════════════════════════════════════
// 4. TIPO DE CIRUGÍA Y ANESTESIA
// ══════════════════════════════════════════════════════════════════
function TipoCirugia({ operacion, onSetTipo, onSetAnestesia }) {
  return (
    <div className="g2">
      <FieldGroup label="Tipo de Cirugía">
        <div className={styles.cxTypeRow}>
          {TIPOS_CIRUGIA.map(({ value, label, cls }) => (
            <button
              key={value}
              type="button"
              className={`${styles.cxTypeBtn} ${styles[`cx${cls.charAt(0).toUpperCase()}${cls.slice(1)}`]} ${operacion.tipoCirugia === value ? styles.active : ''}`}
              onClick={() => onSetTipo(value)}
            >
              <span className={`${styles.cxDot} ${operacion.tipoCirugia === value ? styles.cxDotActive : ''}`} />
              {label}
            </button>
          ))}
          {operacion.tipoCirugia && (
            <span className={`${styles.cxBanner} ${styles[operacion.tipoCirugia]}`}>
              {operacion.tipoCirugia === 'emergencia' ? '⚠ EMERGENCIA' : '✓ ELECTIVA'}
            </span>
          )}
        </div>
      </FieldGroup>

      <FieldGroup label="Tipo de Anestesia">
        <div className={styles.cxTypeRow} style={{ flexWrap: 'wrap' }}>
          {TIPOS_ANESTESIA.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={`${styles.cxTypeBtn} ${styles.cxElectiva} ${operacion.tipoAnestesia === value ? styles.active : ''}`}
              onClick={() => onSetAnestesia(value)}
              style={{ fontSize: '.78rem', padding: '8px 14px' }}
            >
              {label}
            </button>
          ))}
        </div>
      </FieldGroup>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// 5. TIEMPOS QUIRÚRGICOS
// ══════════════════════════════════════════════════════════════════
function TiemposQuirurgicos({ tiempos, onSetInicio, onSetFin }) {
  return (
    <div className={styles.tiemposRow}>
      <div className={styles.tiempoCard} style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <span className={styles.tcLabel}>🟢 Inicio</span>
        <input
          type="time"
          value={tiempos.inicio}
          onChange={e => onSetInicio(e.target.value)}
          className={styles.tcInput}
        />
      </div>
      <div className={styles.tiempoCard} style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <span className={styles.tcLabel}>🔴 Fin</span>
        <input
          type="time"
          value={tiempos.fin}
          onChange={e => onSetFin(e.target.value)}
          className={styles.tcInput}
        />
      </div>
      <div className={styles.tiempoCard} style={{ background: 'var(--teal-l)', border: '1px solid var(--teal)' }}>
        <span className={styles.tcLabel} style={{ color: 'var(--teal-d)' }}>⏱ Duración</span>
        <div className={styles.tcTotal}>{tiempos.duracion || '—'}</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// 6. NARRACIÓN QUIRÚRGICA
// ══════════════════════════════════════════════════════════════════
function NarracionQuirurgica({ narracion, onSet }) {
  return (
    <div className={styles.narrContainer}>
      {NARRACION_SECTIONS.map(({ key, num, title, placeholder, style }) => (
        <div key={key} className={styles.narrSection}>
          <div className={styles.narrHead}>
            <div className={styles.narrNum}>{num}</div>
            <span className={styles.narrTitle}>{title}</span>
          </div>
          <div className={styles.narrBody}>
            <textarea
              className="fta"
              value={narracion[key]}
              onChange={e => onSet({ [key]: e.target.value })}
              placeholder={placeholder}
              style={{ ...style, background: 'var(--white)', borderColor: 'var(--border)' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// 7. PANEL CIE-10 / CPT (con tabs)
// ══════════════════════════════════════════════════════════════════
function PanelCodigos({ diagnosticos, procedimientosCPT, proto, ciesSincronizados }) {
  const [tabActivo, setTabActivo] = useState('cie');

  return (
    <div className={styles.codePanel}>
      {/* Tabs */}
      <div className={styles.codeTabs}>
        <button
          type="button"
          className={`${styles.codeTab} ${tabActivo === 'cie' ? styles.onCie : ''}`}
          onClick={() => setTabActivo('cie')}
        >
          🔵 CIE-10 — Diagnósticos
        </button>
        <button
          type="button"
          className={`${styles.codeTab} ${tabActivo === 'cpt' ? styles.onCpt : ''}`}
          onClick={() => setTabActivo('cpt')}
        >
          🟢 CPT — Procedimientos
        </button>
      </div>

      <div className={styles.codeTabContent}>
        {/* CIE-10 */}
        {tabActivo === 'cie' && (
          <div>
            {diagnosticos.ingreso.length > 0 && (
              <div className={styles.cieSyncBanner}>
                🔗 <span>Conectado con <strong>Diagnóstico de Ingreso</strong> — los códigos se sincronizan automáticamente</span>
                <span className={styles.cieSyncCount}>{diagnosticos.cie10.filter(x => x.syncedFromIngreso).length} sincronizados</span>
              </div>
            )}
            <SearchDropdown
              placeholder="Buscar por código o descripción... ej: K37, fractura, colecistitis"
              icon="🔍"
              db={CIE10_QUIRURGICO}
              onSelect={item => proto.addCIE10(item)}
              renderOption={item => (
                <>
                  <span className={`${styles.coCode} ${styles.cieCode}`}>{item.c}</span>
                  <span className={styles.coDesc}>{item.d}</span>
                </>
              )}
              renderValue={() => ''}
            />
            <label className="fl" style={{ marginBottom: 8, display: 'block', marginTop: 12 }}>
              Códigos CIE-10 seleccionados
            </label>
            <div className={styles.codesSelected}>
              {diagnosticos.cie10.length === 0
                ? <span style={{ fontSize: '.78rem', color: 'var(--muted)' }}>Ningún código seleccionado</span>
                : diagnosticos.cie10.map(x => (
                    <span
                      key={x.c}
                      className={`${styles.codeTag} ${styles.cieTagC}`}
                      style={x.syncedFromIngreso ? { borderColor: '#2979ff', background: '#dbeafe' } : {}}
                    >
                      <span className={styles.ctCode}>{x.c}</span>
                      <span className={styles.ctName}>{x.d}</span>
                      {x.syncedFromIngreso && (
                        <span className={styles.syncBadge}>🔗 INGRESO</span>
                      )}
                      <button
                        className={styles.ctDel}
                        type="button"
                        onClick={() => x.syncedFromIngreso ? proto.removeSyncedCIE(x.c) : proto.removeCIE10(x.c)}
                      >✕</button>
                    </span>
                  ))
              }
            </div>
          </div>
        )}

        {/* CPT */}
        {tabActivo === 'cpt' && (
          <div>
            <SearchDropdown
              placeholder="Buscar por código CPT o procedimiento... ej: 47600, colecistectomía"
              icon="🔍"
              db={CPT_DB}
              onSelect={item => proto.addCPT(item)}
              renderOption={item => (
                <>
                  <span className={`${styles.coCode} ${styles.cptCode}`}>{item.c}</span>
                  <span className={styles.coDesc}>{item.d}</span>
                </>
              )}
              renderValue={() => ''}
            />
            <label className="fl" style={{ marginBottom: 8, display: 'block', marginTop: 12 }}>
              Códigos CPT seleccionados
            </label>
            <div className={styles.codesSelected}>
              {procedimientosCPT.length === 0
                ? <span style={{ fontSize: '.78rem', color: 'var(--muted)' }}>Ningún código seleccionado</span>
                : procedimientosCPT.map(x => (
                    <span key={x.c} className={`${styles.codeTag} ${styles.cptTagC}`}>
                      <span className={styles.ctCode}>{x.c}</span>
                      <span className={styles.ctName}>{x.d}</span>
                      <button className={styles.ctDel} type="button" onClick={() => proto.removeCPT(x.c)}>✕</button>
                    </span>
                  ))
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// 8. EQUIPOS E INSUMOS + CONTEO DE GASAS
// ══════════════════════════════════════════════════════════════════
function EquiposInsumos({ insumos, proto, insumosCount }) {
  const [catFiltro, setCatFiltro] = useState('all');

  // Construir DB filtrada para el SearchDropdown
  const insumosFlat = Object.entries(INSUMOS_DB).flatMap(([cat, arr]) =>
    arr.map(nombre => ({ cat, nombre }))
  );
  const insumosFiltered = catFiltro === 'all'
    ? insumosFlat
    : insumosFlat.filter(i => i.cat === catFiltro);

  return (
    <>
      {/* Buscador + filtro categoría */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <SearchDropdown
            placeholder="Buscar equipo o insumo — ej: bisturí, vicryl 3-0, penrose, surgicel..."
            icon="🔍"
            db={insumosFiltered}
            onSelect={item => proto.addInsumo(item.cat, item.nombre)}
            renderOption={item => (
              <span>
                <span style={{ marginRight: 5 }}>{CAT_ICONS[item.cat] || '🔧'}</span>
                {item.nombre}
              </span>
            )}
            renderValue={() => ''}
          />
        </div>
        <select
          className="fs"
          value={catFiltro}
          onChange={e => setCatFiltro(e.target.value)}
          style={{ width: 160, padding: '8px 10px' }}
        >
          <option value="all">Todas las categorías</option>
          {Object.entries(CAT_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Tabla de insumos */}
      {insumos.rows.length > 0 && (
        <div style={{ marginBottom: 14, overflowX: 'auto' }}>
          <table className={styles.insumosTable}>
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Insumo / Equipo</th>
                <th style={{ width: 70, textAlign: 'center' }}>Cant.</th>
                <th>Talla / Lote / Obs.</th>
                <th style={{ width: 36 }}></th>
              </tr>
            </thead>
            <tbody>
              {insumos.rows.map(row => (
                <tr key={row.id}>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 9px', borderRadius: 100, fontSize: '.68rem', fontWeight: 700, background: 'var(--surface)', color: CAT_COLORS[row.cat], border: '1px solid var(--border)' }}>
                      {CAT_LABELS[row.cat] || row.cat}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{row.nombre}</td>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="number"
                      min="1"
                      value={row.cantidad}
                      onChange={e => proto.updateInsumo(row.id, 'cantidad', parseInt(e.target.value) || 1)}
                      className={styles.insumoQty}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.obs}
                      onChange={e => proto.updateInsumo(row.id, 'obs', e.target.value)}
                      placeholder="Talla, lote, referencia..."
                      className={styles.insumoObs}
                    />
                  </td>
                  <td>
                    <button className={styles.btnDel} type="button" onClick={() => proto.removeInsumo(row.id)}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Conteo gasas/compresas */}
      <div className={styles.conteoRow}>
        <span className={styles.conteoLabel}>Conteo Gasas/Compresas:</span>
        {[
          { label: 'Gasas', ini: 'gasasInicio', fin: 'gasasFin' },
          { label: 'Compresas', ini: 'compresasInicio', fin: 'compresasFin' },
        ].map(({ label, ini, fin }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '.72rem', color: 'var(--muted)' }}>{label}</span>
            <input
              type="number"
              value={insumos.conteo[ini]}
              onChange={e => proto.updateConteo({ [ini]: e.target.value })}
              placeholder="ini"
              className={styles.conteoInput}
            />
            <span style={{ color: 'var(--dim)' }}>→</span>
            <input
              type="number"
              value={insumos.conteo[fin]}
              onChange={e => proto.updateConteo({ [fin]: e.target.value })}
              placeholder="fin"
              className={styles.conteoInput}
            />
          </div>
        ))}
        {insumos.conteo.resultado && (
          <div className={`${styles.conteoResult} ${styles[insumos.conteo.resultado]}`}>
            {insumos.conteo.mensajeConteo}
          </div>
        )}
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════
// 9. COMPLICACIONES Y MUESTRA PATOLÓGICA
// ══════════════════════════════════════════════════════════════════
function ComplicacionesMuestra({ complicaciones, muestra, proto, PATOLOGOS, onNotificar }) {
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifMsg, setNotifMsg]         = useState('');

  const handleNotificar = async () => {
    setNotifLoading(true);
    const result = await onNotificar();
    setNotifLoading(false);
    setNotifMsg(result.ok ? `✅ ${result.msg}` : `❌ ${result.error}`);
    setTimeout(() => setNotifMsg(''), 5000);
  };

  return (
    <>
      <div className="g2" style={{ marginBottom: 16 }}>
        {/* Complicaciones */}
        <FieldGroup label="¿Hubo Complicaciones?">
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {[{ v: true, label: '✓ SÍ' }, { v: false, label: '✗ NO' }].map(({ v, label }) => (
              <button
                key={String(v)}
                type="button"
                className={`${styles.ctBtn} ${complicaciones.hubo === v ? (v ? styles.si : styles.no) : ''}`}
                onClick={() => proto.setComplicaciones({ hubo: complicaciones.hubo === v ? null : v })}
              >
                {label}
              </button>
            ))}
          </div>
        </FieldGroup>

        {/* Muestra */}
        <FieldGroup label="¿Muestra para Patología?">
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {[{ v: true, label: '✓ SÍ' }, { v: false, label: '✗ NO' }].map(({ v, label }) => (
              <button
                key={String(v)}
                type="button"
                className={`${styles.ctBtn} ${muestra.hubo === v ? (v ? styles.si : styles.no) : ''}`}
                onClick={() => proto.setMuestra({ hubo: muestra.hubo === v ? null : v })}
              >
                {label}
              </button>
            ))}
          </div>
        </FieldGroup>
      </div>

      {/* Descripción complicaciones */}
      {complicaciones.hubo === true && (
        <FieldGroup label="Descripción de Complicaciones" style={{ marginBottom: 14 }}>
          <textarea
            className="fta"
            value={complicaciones.descripcion}
            onChange={e => proto.setComplicaciones({ descripcion: e.target.value })}
            placeholder="Describa detalladamente las complicaciones y su manejo..."
            style={{ borderColor: 'var(--red-mid)' }}
          />
        </FieldGroup>
      )}

      {/* Descripción muestra */}
      {muestra.hubo === true && (
        <div className={styles.muestraContainer}>
          {/* Datos de la muestra */}
          <div className={styles.muestraHeader}>
            <span>🧫</span>
            <span className={styles.muestraTitle}>Descripción de la Muestra Patológica</span>
          </div>
          <div className="g2" style={{ padding: 14 }}>
            <FieldGroup label="Tipo de Tejido / Muestra">
              <Input value={muestra.tipo} onChange={e => proto.setMuestra({ tipo: e.target.value })} placeholder="Ej: Apéndice cecal, vesícula biliar..." />
            </FieldGroup>
            <FieldGroup label="Nº de Piezas / Frascos">
              <Input type="number" min="1" value={muestra.piezas} onChange={e => proto.setMuestra({ piezas: e.target.value })} placeholder="1" />
            </FieldGroup>
            <FieldGroup label="Diagnóstico de Presunción">
              <Input value={muestra.diagPresuncion} onChange={e => proto.setMuestra({ diagPresuncion: e.target.value })} placeholder="Diagnóstico clínico-quirúrgico..." />
            </FieldGroup>
            <FieldGroup label="Urgencia">
              <Select
                value={muestra.urgencia}
                onChange={e => proto.setMuestra({ urgencia: e.target.value })}
                options={URGENCIA_PATOLOGIA}
                valueKey="value"
                labelKey="label"
              />
            </FieldGroup>
            <FieldGroup label="Características Macroscópicas" style={{ gridColumn: '1/-1' }}>
              <textarea className="fta" value={muestra.macroscopico} onChange={e => proto.setMuestra({ macroscopico: e.target.value })} placeholder="Dimensiones, color, consistencia, superficie, contenido..." style={{ minHeight: 70 }} />
            </FieldGroup>
          </div>

          {/* Selección de patólogo */}
          <div className={styles.patologoSection}>
            <div className={styles.patologoHeader}>
              <span>🏥</span>
              <span>Seleccionar Patólogo de Turno</span>
            </div>
            {!muestra.patologo ? (
              <div className={styles.patologoGrid}>
                {PATOLOGOS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    className={styles.patologoCard}
                    onClick={() => proto.setPatologo(p)}
                  >
                    <div style={{ fontSize: '.84rem', fontWeight: 700 }}>{p.nombre}</div>
                    <div style={{ fontSize: '.72rem', color: 'var(--muted)' }}>{p.especialidad}</div>
                    <div style={{ fontSize: '.68rem', color: 'var(--teal-d)', fontWeight: 600 }}>{p.turno}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className={styles.patologoSelected}>
                <div>
                  <div style={{ fontWeight: 700 }}>{muestra.patologo.nombre}</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--muted)' }}>{muestra.patologo.especialidad} · {muestra.patologo.email}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {!muestra.notificado ? (
                    <Btn onClick={handleNotificar} disabled={notifLoading}>
                      {notifLoading ? '⏳ Notificando...' : '📧 Notificar'}
                    </Btn>
                  ) : (
                    <span style={{ color: 'var(--green)', fontWeight: 700, fontSize: '.82rem' }}>✅ Notificado</span>
                  )}
                  <Btn variant="outline" onClick={() => proto.clearPatologo()}>Cambiar</Btn>
                </div>
              </div>
            )}
            {notifMsg && (
              <div className={styles.notifMsg}>{notifMsg}</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ══════════════════════════════════════════════════════════════════
// 10. PANEL ASISTENTE IA QUIRÚRGICO
// ══════════════════════════════════════════════════════════════════
function PanelIA({ runIA }) {
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState('');

  const handleIA = async (type) => {
    setLoading(true);
    setError('');
    setResult(null);
    const res = await runIA(type);
    setLoading(false);
    if (res.error) { setError(res.error); return; }
    setResult(res);
  };

  return (
    <div className={styles.aiPanel}>
      <div className={styles.aiHeader}>
        <div className={styles.aiHeaderIcon}>🤖</div>
        <div>
          <div className={styles.aiHeaderTitle}>Asistente IA Quirúrgico</div>
          <div className={styles.aiHeaderSub}>Verificación CIE-10 · Validación CPT · Alertas · Control de calidad</div>
        </div>
      </div>

      {/* Botones de análisis */}
      <div className={styles.aiGrid}>
        {IA_BUTTONS.map(({ type, icon, title, desc }) => (
          <button
            key={type}
            type="button"
            className={styles.aiBtn}
            onClick={() => handleIA(type)}
            disabled={loading}
          >
            <span className={styles.aiBtnIcon}>{icon}</span>
            <span className={styles.aiBtnTitle}>{title}</span>
            <span className={styles.aiBtnDesc}>{desc}</span>
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className={styles.aiLoading}>
          <div className={styles.aiSpin} />
          Analizando protocolo quirúrgico...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className={styles.aiResult} style={{ padding: 16, color: 'var(--red)' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Resultado */}
      {result && !loading && (
        <div className={styles.aiResult}>
          <div className={styles.aiResultHeader}>
            <span className={styles.aiResultLabel}>{result.label}</span>
            <span className={styles.aiResultTag}>{result.tag}</span>
          </div>

          {/* Alertas estructuradas */}
          {result.alertas ? (
            <div className={styles.alertsWrap}>
              {result.alertas.length === 0 ? (
                <div className={`${styles.alertRow} ${styles.arOk}`}>
                  <span className={styles.arIcon}>✅</span>
                  <div><div className={styles.arTitle}>Sin alertas críticas</div>
                  <div className={styles.arDesc}>El protocolo parece completo y sin inconsistencias mayores.</div></div>
                </div>
              ) : result.alertas.map((a, i) => {
                const m = ALERT_MAP[a.nivel] || ALERT_MAP.info;
                return (
                  <div key={i} className={`${styles.alertRow} ${styles[m.cls.replace('ar-', 'ar')]}`}>
                    <span className={styles.arIcon}>{m.icon}</span>
                    <div className={styles.arBody}>
                      <div className={styles.arTitle}>{a.titulo}</div>
                      <div className={styles.arDesc}>{a.descripcion}</div>
                    </div>
                    <span className={`${styles.arBadge} ${styles[m.bcls.replace('b-', 'b')]}`}>{m.lbl}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.aiResultBody}>
              {result.raw?.split('\n').map((line, i) => (
                <span key={i}>{line}<br /></span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL — SeccionProtocolo
// ══════════════════════════════════════════════════════════════════
export default function SeccionProtocolo({ showToast }) {
  const {
    P, proto,
    collectData, runIA,
    guardarPlantilla, listarPlantillas, eliminarPlantilla,
    insumosCount, scoreCompletitud, ciesSincronizados,
    PATOLOGOS,
    enviarNotificacionPatologo,
  } = useProtocolo();

  // Sincronizar Dx Ingreso → panel CIE-10 al agregar
  const handleAddDxIngreso = useCallback((dx) => {
    proto.addDxIngreso(dx);
    proto.syncIngresoToCIE(dx);
    showToast?.(`🔗 ${dx.c}: ${dx.d} sincronizado con CIE-10`);
  }, [proto, showToast]);

  const handleGuardar = () => {
    showToast?.(`✅ Protocolo guardado · Score: ${scoreCompletitud}/10`);
  };

  return (
    <div className={styles.protocoloRoot}>

      {/* ── 1. PACIENTE ── */}
      <div id="s-pac" /><Card icon="🧑‍⚕️" title="Paciente · HCU Form. 017" colorClass="ch-teal">
        <PacienteHeader
          paciente={P.paciente}
          onUpdate={proto.setPaciente}
        />
        {/* Diagnóstico de Ingreso */}
        <div style={{ padding: '0 22px 18px', borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <label className="fl" style={{ margin: 0 }}>🏥 Diagnóstico de Ingreso</label>
            <span className={styles.connBadge}>CONECTADO CON CIE-10</span>
          </div>
          <CIESearchBox
            selected={P.diagnosticos.ingreso}
            onAdd={handleAddDxIngreso}
            onRemove={proto.removeDxIngreso}
            placeholder="Buscar diagnóstico de ingreso por código o descripción CIE-10..."
            emptyLabel="Sin diagnóstico de ingreso — se sincronizará automáticamente con CIE-10"
          />
        </div>
      </Card>

      {/* ── 2. OPERACIÓN Y TIPO DE CIRUGÍA ── */}
      <div id="s-op" />
      <Card icon="⚙️" title="Operación y Tipo de Cirugía" colorClass="ch-teal">
        <div className="g2" style={{ marginBottom: 16 }}>
          <FieldGroup label="Operación Propuesta">
            <CIESearchBox
              selected={P.diagnosticos.operacionPropuesta}
              onAdd={proto.addDxOpPropuesta}
              onRemove={proto.removeDxOpPropuesta}
              placeholder="Buscar procedimiento o código CIE-10..."
              emptyLabel="Sin procedimiento seleccionado"
            />
          </FieldGroup>
          <FieldGroup label="Diagnóstico Posoperatorio">
            <CIESearchBox
              selected={P.diagnosticos.posoperatorio}
              onAdd={proto.addDxPosop}
              onRemove={proto.removeDxPosop}
              placeholder="Buscar diagnóstico o código CIE-10..."
              emptyLabel="Sin diagnóstico seleccionado"
            />
          </FieldGroup>
        </div>
        <TipoCirugia
          operacion={P.operacion}
          onSetTipo={proto.setTipoCirugia}
          onSetAnestesia={proto.setTipoAnestesia}
        />
      </Card>

      {/* ── 3. EQUIPO OPERATORIO ── */}
      <div id="s-equipo" />
      <Card icon="👨‍⚕️" title="Equipo Operatorio" colorClass="ch-teal">
        <div className="g3" style={{ marginBottom: 14 }}>
          {[
            { field: 'cirujano1',     label: 'Cirujano 1' },
            { field: 'cirujano2',     label: 'Cirujano 2' },
            { field: 'anestesiologo', label: 'Anestesiólogo' },
          ].map(({ field, label }) => (
            <StaffSearchInput
              key={field}
              label={label}
              value={P.equipoQuirurgico[field]}
              onChange={v => proto.setEquipo({ [field]: v })}
            />
          ))}
        </div>
        <div className="g3" style={{ marginBottom: 14 }}>
          {[
            { field: 'ayudante1', label: 'Ayudante 1' },
            { field: 'ayudante2', label: 'Ayudante 2' },
            { field: 'pediatra',  label: 'Pediatra' },
          ].map(({ field, label }) => (
            <StaffSearchInput
              key={field}
              label={label}
              value={P.equipoQuirurgico[field]}
              onChange={v => proto.setEquipo({ [field]: v })}
            />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 14 }}>
          <FieldGroup label="Sexo RN">
            <Select
              value={P.equipoQuirurgico.sexoRN}
              onChange={e => proto.setEquipo({ sexoRN: e.target.value })}
              options={['', 'Masculino', 'Femenino']}
            />
          </FieldGroup>
          <FieldGroup label="Hora Nacimiento RN">
            <Input type="time" value={P.equipoQuirurgico.horaNacRN} onChange={e => proto.setEquipo({ horaNacRN: e.target.value })} />
          </FieldGroup>
        </div>
      </Card>

      {/* ── 4. TIEMPOS ── */}
      <div id="s-tiempos" />
      <Card icon="⏱" title="Tiempos Quirúrgicos" colorClass="ch-teal">
        <TiemposQuirurgicos
          tiempos={P.tiempos}
          onSetInicio={proto.setTiempoInicio}
          onSetFin={proto.setTiempoFin}
        />
      </Card>

      {/* ── 5. NARRACIÓN ── */}
      <div id="s-narr" />
      <Card icon="📝" title="Descripción Quirúrgica Detallada" badge="Narración del acto operatorio">
        <NarracionQuirurgica narracion={P.narracion} onSet={proto.setNarracion} />
      </Card>

      {/* ── 6. CIE-10 / CPT ── */}
      <div id="s-codes" />
      <Card icon="🔢" title="Codificación — CIE-10 y CPT" badge="Búsqueda · Selección · Verificación IA" colorClass="ch-teal">
        <PanelCodigos
          diagnosticos={P.diagnosticos}
          procedimientosCPT={P.procedimientosCPT}
          proto={proto}
          ciesSincronizados={ciesSincronizados}
        />
      </Card>

      {/* ── 7. EQUIPOS E INSUMOS ── */}
      <div id="s-equipos-insumos" />
      <Card icon="🔧" title="Equipos e Insumos Utilizados" badge={insumosCount} colorClass="ch-teal">
        <EquiposInsumos insumos={P.insumos} proto={proto} insumosCount={insumosCount} />
      </Card>

      {/* ── 8. COMPLICACIONES Y MUESTRA ── */}
      <div id="s-comp" />
      <Card icon="⚠️" title="Complicaciones, Muestra y Cierre" colorClass="ch-teal">
        <ComplicacionesMuestra
          complicaciones={P.complicaciones}
          muestra={P.muestra}
          proto={proto}
          PATOLOGOS={PATOLOGOS}
          onNotificar={enviarNotificacionPatologo}
        />
        <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid var(--border)' }} />
        <div className="g2">
          <FieldGroup label="Firma del Cirujano">
            <Input value={P.firma.firmaCirujano} onChange={e => proto.setFirmaCirujano({ firmaCirujano: e.target.value })} placeholder="Dr./Dra. Apellido Nombre — Firma" />
          </FieldGroup>
          <FieldGroup label="Nombre del Cirujano">
            <Input value={P.firma.nombreCirujano} onChange={e => proto.setFirmaCirujano({ nombreCirujano: e.target.value })} placeholder="Nombre completo legible" />
          </FieldGroup>
        </div>
      </Card>

      {/* ── 9. PANEL IA ── */}
      <div id="s-ia" />
      <PanelIA runIA={runIA} />

    </div>
  );
}
