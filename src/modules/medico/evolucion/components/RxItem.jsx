import { useMemo, useState } from "react";

function getProgress(rx) {
  const admin = (rx.dosisLog || []).filter((item) => item.tipo === "admin").length;
  const omit = (rx.dosisLog || []).filter((item) => item.tipo === "omitida").length;
  const total = Number.parseInt(rx.totalDespachado || rx.cant || 0, 10) || 0;
  const percent = total > 0 ? Math.min(100, Math.round((admin / total) * 100)) : 0;
  return { admin, omit, total, percent };
}

function statusLabel(status) {
  switch (status) {
    case "enviada":
      return "Enviada a farmacia";
    case "despachada":
      return "Despachada";
    case "descontinuada":
      return "Descontinuada";
    default:
      return "Pendiente";
  }
}

export default function RxItem({
  rx,
  index,
  viaOptions,
  frecuenciaOptions,
  onChange,
  onSend,
  onToggleUrgente,
  onDiscontinue,
  onRemove,
  onRegistrarDosis,
  onEliminarDosis,
}) {
  const [horaDosis, setHoraDosis] = useState(new Date().toTimeString().slice(0, 5));
  const { admin, omit, total, percent } = useMemo(() => getProgress(rx), [rx]);
  const showDoseControls = rx.status === "enviada" || rx.status === "despachada";

  const rxClass = [
    "rx-item",
    `rx-${rx.status}`,
    rx.urgente ? "rx-urgente" : "",
    rx.status === "enviada" ? "rx-enviada" : "",
    rx.status === "despachada" ? "rx-despachada" : "",
    rx.status === "descontinuada" ? "rx-descontinuada" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rxClass}>
      <div className="rx-num">{index + 1}</div>

      <div className="rx-body">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: ".9rem", fontWeight: 800, color: "var(--navy-d)" }}>
            {rx.nom || "Medicamento"}
          </span>

          {rx.com ? (
            <span style={{ fontSize: ".72rem", color: "var(--dim)" }}>{rx.com}</span>
          ) : null}

          {rx.solicitudFarmacia ? (
            <span className="rx-quick-badge buscar">Busqueda farmacia</span>
          ) : null}

          {rx.farmUnidades ? (
            <span className="rx-quick-badge unidades">{rx.farmUnidades} unid.</span>
          ) : null}

          <span className={`rx-status-badge ${rx.status}`}>{statusLabel(rx.status)}</span>
        </div>

        <div className="g4" style={{ marginBottom: 8 }}>
          <div className="fg">
            <label className="fl">Concentracion</label>
            <input
              className="fi"
              value={rx.conc || ""}
              onChange={(event) => onChange(rx.id, "conc", event.target.value)}
              placeholder="500mg/tab"
            />
          </div>

          <div className="fg">
            <label className="fl">Dosis</label>
            <input
              className="fi"
              value={rx.dosis || ""}
              onChange={(event) => onChange(rx.id, "dosis", event.target.value)}
              placeholder="1g"
            />
          </div>

          <div className="fg">
            <label className="fl">Via</label>
            <select
              className="fs"
              value={rx.via || ""}
              onChange={(event) => onChange(rx.id, "via", event.target.value)}
            >
              {viaOptions.map((option) => (
                <option key={option || "vacio"} value={option}>
                  {option || "- Seleccione -"}
                </option>
              ))}
            </select>
          </div>

          <div className="fg">
            <label className="fl">Frecuencia</label>
            <select
              className="fs"
              value={rx.frec || ""}
              onChange={(event) => onChange(rx.id, "frec", event.target.value)}
            >
              {frecuenciaOptions.map((option) => (
                <option key={option || "f-vacio"} value={option}>
                  {option || "- Seleccione -"}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="g2" style={{ marginBottom: 8 }}>
          <div className="fg">
            <label className="fl">Duracion</label>
            <input
              className="fi"
              value={rx.dur || ""}
              onChange={(event) => onChange(rx.id, "dur", event.target.value)}
              placeholder="5 dias"
            />
          </div>

          <div className="fg">
            <label className="fl">Total farmacia</label>
            <input
              className="fi"
              value={rx.cant || ""}
              onChange={(event) => onChange(rx.id, "cant", event.target.value)}
              placeholder={rx.cantAuto ? "Auto" : "Manual"}
            />
          </div>
        </div>

        {rx.calcTxt ? (
          <div className="rx-calc-box">
            <span>{rx.calcTxt}</span>
            {rx.upTomaStr && rx.upTomaStr !== "-" ? (
              <span className="rx-quick-badge uptoma">{rx.upTomaStr}/toma</span>
            ) : null}
          </div>
        ) : null}

        <div style={{ marginTop: 8 }}>
          <label className="fl">Indicaciones clinicas</label>
          <input
            className="fi"
            value={rx.obsCustom || ""}
            onChange={(event) => onChange(rx.id, "obsCustom", event.target.value)}
            placeholder="Indicaciones para enfermeria/farmacia"
          />
        </div>

        {rx.status === "descontinuada" ? (
          <div className="rx-discont-banner" style={{ marginTop: 8 }}>
            {rx.discontMotivo || "Tratamiento descontinuado"}
            {rx.discontObs ? ` - ${rx.discontObs}` : ""}
            {rx.discontHora ? ` (${rx.discontHora})` : ""}
          </div>
        ) : null}

        {rx.devolucion > 0 ? (
          <div className="rx-devolucion-alert">
            Devolucion pendiente: {rx.devolucion} unidad{rx.devolucion > 1 ? "es" : ""}
          </div>
        ) : null}

        <div className="rx-actions-row">
          {rx.status === "pendiente" ? (
            <>
              <button
                type="button"
                className={`rx-send-btn ${rx.urgente ? "urgent" : "send"}`}
                onClick={() => onSend(rx.id)}
              >
                {rx.urgente ? "Urgente" : "Enviar a farmacia"}
              </button>

              <button
                type="button"
                className="rx-send-btn urgent"
                style={{ opacity: rx.urgente ? 1 : 0.75 }}
                onClick={() => onToggleUrgente(rx.id)}
              >
                {rx.urgente ? "Quitar urgente" : "Marcar urgente"}
              </button>
            </>
          ) : (
            <span className="rx-send-btn disabled">{statusLabel(rx.status)}</span>
          )}

          {rx.status !== "descontinuada" ? (
            <button
              type="button"
              className="btn-outline"
              style={{ color: "var(--red)", borderColor: "var(--red-mid)" }}
              onClick={() => onDiscontinue(rx.id)}
            >
              Descontinuar
            </button>
          ) : null}

          <button type="button" className="btn-del-row" onClick={() => onRemove(rx.id)}>
            x
          </button>
        </div>

        {showDoseControls ? (
          <div style={{ marginTop: 10, padding: 10, border: "1px solid var(--border)", borderRadius: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span className="rx-progress-chip">
                {admin}/{total || "-"} administradas
              </span>
              <span className="rx-progress-chip" style={{ color: "var(--amber)" }}>
                {omit} omitidas
              </span>

              <input
                className="fi"
                type="time"
                value={horaDosis}
                onChange={(event) => setHoraDosis(event.target.value)}
                style={{ maxWidth: 120 }}
              />

              <button
                type="button"
                className="rx-send-btn send"
                onClick={() => onRegistrarDosis(rx.id, "admin", horaDosis)}
              >
                Administrar
              </button>

              <button
                type="button"
                className="rx-send-btn"
                style={{ background: "var(--amber)", color: "white" }}
                onClick={() => onRegistrarDosis(rx.id, "omitida", horaDosis)}
              >
                Omitir
              </button>
            </div>

            <div className="dosis-prog-bar" style={{ marginTop: 8 }}>
              <div className="dosis-prog-fill" style={{ width: `${percent}%`, background: "var(--teal)" }} />
            </div>

            <div className="dosis-timeline">
              {(rx.dosisLog || []).length === 0 ? (
                <div className="rx-timeline-empty">Sin registros de dosis</div>
              ) : (
                rx.dosisLog
                  .slice()
                  .reverse()
                  .map((item, revIndex) => {
                    const realIndex = rx.dosisLog.length - 1 - revIndex;
                    return (
                      <div
                        key={`${item.hora}-${realIndex}`}
                        className={`dosis-row ${item.tipo === "admin" ? "admin" : "omitida"}`}
                      >
                        <span className="dosis-hora">{item.hora}</span>
                        <span className={`dosis-badge ${item.tipo === "admin" ? "adm" : "omit"}`}>
                          {item.tipo === "admin" ? "Administrada" : "Omitida"}
                        </span>
                        <button
                          type="button"
                          className="btn-del-row"
                          onClick={() => onEliminarDosis(rx.id, realIndex)}
                          style={{ marginLeft: "auto" }}
                        >
                          x
                        </button>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
