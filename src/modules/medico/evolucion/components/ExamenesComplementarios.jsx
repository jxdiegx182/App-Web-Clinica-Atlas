export default function ExamenesComplementarios({ data, setData }) {
  const handleChange = (field, value) => {
    setData({
      ...data,
      [field]: value,
    });
  };

  return (
    <div className="card">
      <div className="card-header ch-teal">
        <div className="card-icon">🔬</div>
        <span className="card-title">Exámenes Complementarios</span>
      </div>

      <div className="card-body">
        <div className="g2">
          <div className="fg">
            <label className="fl">Exámenes Solicitados</label>
            <textarea
              className="fta"
              value={data.examenesSolicitados || ""}
              onChange={(e) =>
                handleChange("examenesSolicitados", e.target.value)
              }
              placeholder="Lab, imagen, otros..."
            />
          </div>

          <div className="fg">
            <label className="fl">Resultados / Interpretación</label>
            <textarea
              className="fta"
              value={data.examenesResultados || ""}
              onChange={(e) =>
                handleChange("examenesResultados", e.target.value)
              }
              placeholder="Resultados clínicos..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
