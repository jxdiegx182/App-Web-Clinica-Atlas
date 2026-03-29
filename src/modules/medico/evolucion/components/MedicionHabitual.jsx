import { useMemo, useState } from "react";

const EMPTY_ROW = {
  medicamento: "",
  comercial: "",
  dosis: "",
  frecuencia: "",
  via: "",
  indicacion: "",
  continuar: "",
  obs: "",
};

export default function MedicionHabitual({ searchMedicamentos }) {
  const [rows, setRows] = useState([]);
  const [alergias, setAlergias] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);

  const openDropdown = search.trim().length >= 2;

  const filteredResults = useMemo(() => {
    if (!openDropdown) return [];
    const q = search.toLowerCase().trim();
    return results.filter((item) => {
      const nom = (item.nombre || "").toLowerCase();
      const com = (item.comercial || "").toLowerCase();
      const cat = (item.categoria || "").toLowerCase();
      return nom.includes(q) || com.includes(q) || cat.includes(q);
    });
  }, [openDropdown, results, search]);

  const handleSearch = async (value) => {
    setSearch(value);
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }

    const data = await searchMedicamentos(value);
    setResults(data);
  };

  const handleAddRow = () => {
    setRows((prev) => [...prev, { ...EMPTY_ROW }]);
  };

  const handleChange = (index, field, value) => {
    setRows((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: value,
      };
      return next;
    });
  };

  const handleDelete = (index) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSelectCatalog = (med) => {
    setRows((prev) => [
      ...prev,
      {
        ...EMPTY_ROW,
        medicamento: med.nombre || "",
        comercial: med.comercial || "",
        dosis: med.dosis || "",
        frecuencia: med.frecuencia || "",
        via: med.via || "",
      },
    ]);
    setSearch("");
    setResults([]);
  };

  return (
    <div className="card">
      <div className="card-header ch-teal">
        <div className="card-icon">📋</div>
        <span className="card-title">Medicacion habitual del paciente</span>
        <span className="card-badge">
          {rows.length > 0 ? `${rows.length} registros` : "Pendiente registro"}
        </span>
      </div>

      <div className="card-body">
        <div className="sl">Antecedente farmacologico cronico</div>

        <div className="cie-wrap" style={{ marginBottom: 10 }}>
          <input
            className="cie-input"
            value={search}
            onChange={(event) => handleSearch(event.target.value)}
            placeholder="Agregar desde catalogo (generico/comercial/categoria)"
          />
          <span className="cie-icon">💊</span>

          <div className={`cie-drop ${openDropdown ? "open" : ""}`}>
            {openDropdown && filteredResults.length === 0 ? (
              <div className="cie-opt">Sin resultados</div>
            ) : null}

            {filteredResults.map((med) => (
              <div key={med.id} className="cie-opt" onClick={() => handleSelectCatalog(med)}>
                <span className="cie-opt-code">MED</span>
                <div>
                  <div className="cie-opt-desc">{med.nombre}</div>
                  <div style={{ fontSize: ".72rem", color: "var(--dim)" }}>
                    {med.comercial || "Sin comercial"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <table className="tbl">
          <thead>
            <tr>
              <th>Medicamento</th>
              <th>Dosis</th>
              <th>Frecuencia</th>
              <th>Via</th>
              <th>Indicacion</th>
              <th>Continuar</th>
              <th>Observacion</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, i) => (
              <tr key={`habitual-${i}`}>
                <td>
                  <input
                    className="fi"
                    value={row.medicamento}
                    onChange={(event) => handleChange(i, "medicamento", event.target.value)}
                    placeholder="Nombre generico"
                  />
                </td>

                <td>
                  <input
                    className="fi"
                    value={row.dosis}
                    onChange={(event) => handleChange(i, "dosis", event.target.value)}
                    placeholder="Ej: 10mg"
                  />
                </td>

                <td>
                  <input
                    className="fi"
                    value={row.frecuencia}
                    onChange={(event) => handleChange(i, "frecuencia", event.target.value)}
                    placeholder="c/12h"
                  />
                </td>

                <td>
                  <input
                    className="fi"
                    value={row.via}
                    onChange={(event) => handleChange(i, "via", event.target.value)}
                    placeholder="VO"
                  />
                </td>

                <td>
                  <input
                    className="fi"
                    value={row.indicacion}
                    onChange={(event) => handleChange(i, "indicacion", event.target.value)}
                    placeholder="HTA, DM2..."
                  />
                </td>

                <td>
                  <select
                    className="fs"
                    value={row.continuar}
                    onChange={(event) => handleChange(i, "continuar", event.target.value)}
                  >
                    <option value="">-</option>
                    <option value="si">Continuar</option>
                    <option value="no">Suspender</option>
                    <option value="ajustar">Ajustar</option>
                  </select>
                </td>

                <td>
                  <input
                    className="fi"
                    value={row.obs}
                    onChange={(event) => handleChange(i, "obs", event.target.value)}
                    placeholder="Observacion"
                  />
                </td>

                <td>
                  <button type="button" className="btn-del-row" onClick={() => handleDelete(i)}>
                    x
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button onClick={handleAddRow} className="btn-add-row">
          + Agregar medicacion habitual
        </button>

        <div className="g2" style={{ marginTop: 10 }}>
          <div className="fg">
            <label className="fl">Alergias medicamentosas conocidas</label>
            <textarea
              className="fta"
              placeholder="Reacciones adversas conocidas"
              value={alergias}
              onChange={(event) => setAlergias(event.target.value)}
            />
          </div>

          <div className="fg">
            <label className="fl">Observaciones sobre adherencia</label>
            <textarea
              className="fta"
              placeholder="Adherencia / barreras / recomendaciones"
              value={observaciones}
              onChange={(event) => setObservaciones(event.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
