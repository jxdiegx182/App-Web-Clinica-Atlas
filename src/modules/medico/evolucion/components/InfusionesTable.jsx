import { useState } from "react";

export default function InfusionesTable() {
  const [infusiones, setInfusiones] = useState([]);

  const handleAddRow = () => {
    setInfusiones([
      ...infusiones,
      {
        solucion: "",
        volumen: "",
        velocidad: "",
        aditivos: "",
        via: "",
        inicio: "",
        duracion: "",
        estado: "",
      },
    ]);
  };

  const handleChange = (index, field, value) => {
    const updated = [...infusiones];
    updated[index][field] = value;
    setInfusiones(updated);
  };

  const handleDelete = (index) => {
    const updated = infusiones.filter((_, i) => i !== index);
    setInfusiones(updated);
  };

  return (
    <div className="card">
      <div className="card-header ch-teal">
        <div className="card-icon">💧</div>
        <span className="card-title">Infusiones Intravenosas</span>
      </div>

      <div className="card-body">
        <table className="tbl">
          <thead>
            <tr>
              <th>Solución</th>
              <th>Volumen</th>
              <th>Velocidad</th>
              <th>Aditivos</th>
              <th>Vía</th>
              <th>Inicio</th>
              <th>Duración</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {infusiones.map((row, i) => (
              <tr key={i}>
                <td>
                  <input
                    className="fi"
                    value={row.solucion}
                    onChange={(e) =>
                      handleChange(i, "solucion", e.target.value)
                    }
                  />
                </td>

                <td>
                  <input
                    className="fi"
                    value={row.volumen}
                    onChange={(e) =>
                      handleChange(i, "volumen", e.target.value)
                    }
                  />
                </td>

                <td>
                  <input
                    className="fi"
                    value={row.velocidad}
                    onChange={(e) =>
                      handleChange(i, "velocidad", e.target.value)
                    }
                  />
                </td>

                <td>
                  <input
                    className="fi"
                    value={row.aditivos}
                    onChange={(e) =>
                      handleChange(i, "aditivos", e.target.value)
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
                    type="datetime-local"
                    value={row.inicio}
                    onChange={(e) =>
                      handleChange(i, "inicio", e.target.value)
                    }
                  />
                </td>

                <td>
                  <input
                    className="fi"
                    value={row.duracion}
                    onChange={(e) =>
                      handleChange(i, "duracion", e.target.value)
                    }
                  />
                </td>

                <td>
                  <select
                    className="fs"
                    value={row.estado}
                    onChange={(e) =>
                      handleChange(i, "estado", e.target.value)
                    }
                  >
                    <option value="">--</option>
                    <option value="activa">Activa</option>
                    <option value="suspendida">Suspendida</option>
                    <option value="finalizada">Finalizada</option>
                  </select>
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
          + Agregar infusión
        </button>
      </div>
    </div>
  );
}
