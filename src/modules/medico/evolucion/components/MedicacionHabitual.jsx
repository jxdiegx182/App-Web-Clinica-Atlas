import { useState } from "react";

export default function MedicacionHabitual() {
  const [rows, setRows] = useState([]);
  const [alergias, setAlergias] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        medicamento: "",
        dosis: "",
        frecuencia: "",
        via: "",
        indicacion: "",
        continuar: "",
        obs: "",
      },
    ]);
  };

  const handleChange = (i, field, value) => {
    const updated = [...rows];
    updated[i][field] = value;
    setRows(updated);
  };

  const handleDelete = (i) => {
    setRows(rows.filter((_, index) => index !== i));
  };

  return (
    <div className="card">
      <div className="card-header ch-teal">
        <div className="card-icon">📋</div>
        <span className="card-title">Medicación Habitual del Paciente</span>
        <span className="card-badge">
          {rows.length > 0 ? `${rows.length} registros` : "Pendiente registro"}
        </span>
      </div>

      <div className="card-body">
        <div className="sl">
          Medicamentos que el paciente toma de forma crónica o habitual
        </div>

        <table className="tbl">
          <thead>
            <tr>
              <th>Medicamento</th>
              <th>Dosis Habitual</th>
              <th>Frecuencia</th>
              <th>Vía</th>
              <th>Indicación / Motivo</th>
              <th>Continuar</th>
              <th>Observación</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td>
                  <input
                    className="fi"
                    value={row.medicamento}
                    onChange={(e) =>
                      handleChange(i, "medicamento", e.target.value)
                    }
                  />
                </td>

                <td>
                  <input
                    className="fi"
                    value={row.dosis}
                    onChange={(e) =>
                      handleChange(i, "dosis", e.target.value)
                    }
                  />
                </td>

                <td>
                  <input
                    className="fi"
                    value={row.frecuencia}
                    onChange={(e) =>
                      handleChange(i, "frecuencia", e.target.value)
                    }
                  />
                </td>

                <td>
                  <input
                    className="fi"
                    value={row.via}
                    onChange={(e) =>
                      handleChange(i, "via", e.target.value)
                    }
                  />
                </td>

                <td>
                  <input
                    className="fi"
                    value={row.indicacion}
                    onChange={(e) =>
                      handleChange(i, "indicacion", e.target.value)
                    }
                  />
                </td>

                <td>
                  <select
                    className="fs"
                    value={row.continuar}
                    onChange={(e) =>
                      handleChange(i, "continuar", e.target.value)
                    }
                  >
                    <option value="">--</option>
                    <option value="si">Si</option>
                    <option value="no">No</option>
                  </select>
                </td>

                <td>
                  <input
                    className="fi"
                    value={row.obs}
                    onChange={(e) =>
                      handleChange(i, "obs", e.target.value)
                    }
                  />
                </td>

                <td>
                  <button
                    type="button"
                    className="btn-del-row"
                    onClick={() => handleDelete(i)}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button onClick={handleAddRow} className="btn-add-row">
          + Agregar medicación habitual
        </button>

        <div className="g2">
          <div className="fg">
            <label className="fl">Alergias a medicamentos conocidas</label>
            <textarea
              className="fta"
              placeholder="Especifique reacciones adversas conocidas..."
              value={alergias}
              onChange={(e) => setAlergias(e.target.value)}
            />
          </div>

          <div className="fg">
            <label className="fl">Observaciones sobre medicación habitual</label>
            <textarea
              className="fta"
              placeholder="Adherencia al tratamiento y observaciones..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
