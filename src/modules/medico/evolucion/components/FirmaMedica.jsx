const truncateHash = (value) => {
  if (!value) return "";
  if (value.length <= 24) return value;
  return `${value.slice(0, 14)}...${value.slice(-8)}`;
};

export default function FirmaMedica({
  data,
  setData,
  signature,
  onOpenSignModal,
  isSigning = false,
}) {
  const handleChange = (field, value) => {
    setData({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="card">
      <div className="card-header ch-teal">
        <div className="card-icon">✍️</div>
        <span className="card-title">Firma y Responsable</span>
      </div>

      <div className="card-body">
        <div className="g3">
          <div className="fg">
            <label className="fl">Médico Responsable</label>
            <input
              className="fi"
              value={data.medico || ""}
              onChange={(e) =>
                handleChange("medico", e.target.value)
              }
              placeholder="Dr. Nombre"
            />
          </div>

          <div className="fg">
            <label className="fl">Código / Matrícula</label>
            <input
              className="fi"
              value={data.codigo || ""}
              onChange={(e) =>
                handleChange("codigo", e.target.value)
              }
              placeholder="SEN-XXXX"
            />
          </div>

          <div className="fg">
            <label className="fl">Fecha y Hora</label>
            <input
              className="fi"
              type="datetime-local"
              value={data.fecha || ""}
              onChange={(e) =>
                handleChange("fecha", e.target.value)
              }
            />
          </div>
        </div>

        {!signature?.firmado ? (
          <div
            style={{
              marginTop: 14,
              padding: 12,
              border: "1px solid var(--border)",
              borderRadius: 10,
              background: "var(--surface)",
            }}
          >
            <div
              style={{
                fontSize: ".72rem",
                fontWeight: 700,
                color: "var(--navy-d)",
                marginBottom: 6,
              }}
            >
              Firma electrónica pendiente
            </div>
            <div style={{ fontSize: ".72rem", color: "var(--dim)", marginBottom: 10 }}>
              Puedes guardar directamente o firmar con PIN para dejar constancia digital.
            </div>
            <button
              type="button"
              className="btn-primary"
              onClick={onOpenSignModal}
              disabled={isSigning}
            >
              {isSigning ? "Validando PIN..." : "Firmar con PIN y guardar"}
            </button>
          </div>
        ) : (
          <div
            style={{
              marginTop: 14,
              padding: 14,
              borderRadius: 10,
              background: "linear-gradient(135deg,var(--navy-d),var(--navy-mid))",
              color: "white",
            }}
          >
            <div style={{ fontSize: ".72rem", fontWeight: 800, marginBottom: 6 }}>
              Firmado digitalmente
            </div>
            <div style={{ fontSize: ".8rem", fontWeight: 700 }}>
              {data.medico || "Médico responsable"}
            </div>
            <div style={{ fontSize: ".7rem", opacity: 0.85, marginTop: 4 }}>
              {data.codigo || "Sin matrícula"} · Serie {signature?.serie || "ATLAS-FE"}
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: ".66rem",
                color: "var(--teal-l)",
                marginTop: 6,
              }}
            >
              {truncateHash(signature?.hash)}
            </div>
            <div style={{ fontSize: ".66rem", opacity: 0.72, marginTop: 6 }}>
              {signature?.ts || "Firma registrada"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
