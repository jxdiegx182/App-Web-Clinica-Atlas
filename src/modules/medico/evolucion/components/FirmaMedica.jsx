export default function FirmaMedica({ data, setData }) {
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
      </div>
    </div>
  );
}
