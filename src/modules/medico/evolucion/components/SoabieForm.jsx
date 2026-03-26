export default function SOABIEForm({ data, setData }) {
  const handleChange = (field, value) => {
    setData({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="card">
      <div className="card-header ch-teal">
        <div className="card-icon">📋</div>
        <span className="card-title">Evolución — Método SOABIE</span>
      </div>

      <div className="card-body">
        <div className="soabie-grid">
          <div className="soabie-card">
            <div className="soabie-header ch-blue">
              <span>S</span> Subjetivo
            </div>
            <div className="soabie-body">
              <textarea
                className="fta"
                value={data.subjetivo || ""}
                onChange={(e) => handleChange("subjetivo", e.target.value)}
                placeholder="Lo que el paciente refiere..."
              />
            </div>
          </div>

          <div className="soabie-card">
            <div className="soabie-header ch-purple">
              <span>O</span> Objetivo
            </div>
            <div className="soabie-body">
              <textarea
                className="fta"
                value={data.objetivo || ""}
                onChange={(e) => handleChange("objetivo", e.target.value)}
                placeholder="Hallazgos clinicos..."
              />
            </div>
          </div>

          <div className="soabie-card">
            <div className="soabie-header ch-amber">
              <span>A</span> Análisis
            </div>
            <div className="soabie-body">
              <textarea
                className="fta"
                value={data.analisis || ""}
                onChange={(e) => handleChange("analisis", e.target.value)}
                placeholder="Impresión diagnóstica..."
              />
            </div>
          </div>

          <div className="soabie-card">
            <div className="soabie-header ch-teal">
              <span>B</span> Bienestar
            </div>
            <div className="soabie-body">
              <textarea
                className="fta"
                value={data.bienestar || ""}
                onChange={(e) => handleChange("bienestar", e.target.value)}
                placeholder="Estado emocional..."
              />
            </div>
          </div>

          <div className="soabie-card">
            <div className="soabie-header ch-green">
              <span>I</span> Intervenciones
            </div>
            <div className="soabie-body">
              <textarea
                className="fta"
                value={data.intervenciones || ""}
                onChange={(e) => handleChange("intervenciones", e.target.value)}
                placeholder="Procedimientos realizados..."
              />
            </div>
          </div>

          <div className="soabie-card">
            <div className="soabie-header ch-red">
              <span>E</span> Evaluación / Plan
            </div>
            <div className="soabie-body">
              <textarea
                className="fta"
                value={data.evaluacion || ""}
                onChange={(e) => handleChange("evaluacion", e.target.value)}
                placeholder="Plan y evolución..."
              />
            </div>
          </div>
        </div>

        <div className="g2">
          <div className="fg">
            <label className="fl">Comunicar a Enfermería</label>
            <textarea
              className="fta"
              value={data.enfermeria || ""}
              onChange={(e) => handleChange("enfermeria", e.target.value)}
              placeholder="Indicaciones específicas para el equipo de enfermería..."
            />
          </div>

          <div className="fg">
            <label className="fl">Observaciones Generales</label>
            <textarea
              className="fta"
              value={data.observaciones || ""}
              onChange={(e) => handleChange("observaciones", e.target.value)}
              placeholder="Notas generales del equipo médico..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
