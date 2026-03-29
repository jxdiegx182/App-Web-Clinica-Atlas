const CAMPOS_NUMERICOS = [
  { key: "pa", label: "PA (mmHg)", placeholder: "120/80" },
  { key: "fc", label: "FC (lpm)", placeholder: "72" },
  { key: "fr", label: "FR (rpm)", placeholder: "16" },
  { key: "temp", label: "Temp (C)", placeholder: "36.5" },
  { key: "spo2", label: "SpO2 (%)", placeholder: "98" },
  { key: "glucosa", label: "Glucosa (mg/dL)", placeholder: "-" },
  { key: "peso", label: "Peso (kg)", placeholder: "-" },
  { key: "diuresis", label: "Diuresis (mL/h)", placeholder: "0" },
];

function getBadgeLabel({ loading, hasData, hasError }) {
  if (loading) return "Cargando";
  if (hasError) return "Error";
  return hasData ? "Cargado" : "Pendiente";
}

export default function SignosVitales({
  value,
  loading,
  hasData,
  hasError,
  lastUpdated,
  onFieldChange,
}) {
  const badgeLabel = getBadgeLabel({ loading, hasData, hasError });

  return (
    <div className="card">
      <div className="card-header ch-teal">
        <div className="card-icon">💊</div>
        <span className="card-title">Signos Vitales</span>
        <span className="card-badge">{badgeLabel}</span>
      </div>

      <div className="card-body">
        {lastUpdated ? (
          <div className="vitals-meta">Ultimo registro: {lastUpdated}</div>
        ) : null}

        <div className="vitals-grid">
          {CAMPOS_NUMERICOS.map((campo) => (
            <div key={campo.key} className="fg">
              <label className="fl">{campo.label}</label>
              <input
                className="fi"
                value={value[campo.key] || ""}
                onChange={(event) => onFieldChange(campo.key, event.target.value)}
                placeholder={campo.placeholder}
                disabled={loading}
              />
            </div>
          ))}
        </div>

        <div className="vitals-grid-2" style={{ marginTop: 8 }}>
          <div className="fg">
            <label className="fl">Actividad / Movilizacion</label>
            <input
              className="fi"
              value={value.actividadMovilizacion || ""}
              onChange={(event) => onFieldChange("actividadMovilizacion", event.target.value)}
              placeholder="Reposo absoluto / deambulacion asistida..."
              disabled={loading}
            />
          </div>

          <div className="fg">
            <label className="fl">Dieta indicada</label>
            <input
              className="fi"
              value={value.dietaIndicada || ""}
              onChange={(event) => onFieldChange("dietaIndicada", event.target.value)}
              placeholder="Ayuno / dieta blanda / normal..."
              disabled={loading}
            />
          </div>
        </div>

        {hasError ? (
          <div className="rx-devolucion-alert" style={{ marginTop: 8 }}>
            No se pudo leer signos vitales desde Supabase. Puedes ingresar datos y guardar.
          </div>
        ) : null}
      </div>
    </div>
  );
}
