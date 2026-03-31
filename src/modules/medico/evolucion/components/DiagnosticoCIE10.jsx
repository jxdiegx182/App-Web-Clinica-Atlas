import { useEffect, useMemo, useRef, useState } from "react";
import { searchCIE } from "../services/cie10Service";

const createEmptyDxRow = () => ({
  id: `dx-empty-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  code: "",
  desc: "",
  tipo: "Principal",
  estado: "Presuntivo",
  obs: "",
});

const createDxRowFromCIE = (cieItem, tipo) => ({
  id: `dx-cie-${cieItem.code}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)}`,
  code: cieItem.code,
  desc: cieItem.description || "",
  tipo,
  estado: "Presuntivo",
  obs: "",
});

export default function DiagnosticoCIE10({ rows = [], onChangeRows }) {
  const [mainSearch, setMainSearch] = useState("");
  const [mainResults, setMainResults] = useState([]);
  const [secSearch, setSecSearch] = useState("");
  const [secResults, setSecResults] = useState([]);

  const mainTimeoutRef = useRef(null);
  const secTimeoutRef = useRef(null);
  const mainRequestRef = useRef(0);
  const secRequestRef = useRef(0);

  const updateRows = (updater) => {
    if (typeof onChangeRows !== "function") return;
    const nextRows = typeof updater === "function" ? updater(rows) : updater;
    onChangeRows(nextRows);
  };

  const handleSearchMain = (value) => {
    setMainSearch(value);

    if (mainTimeoutRef.current) {
      clearTimeout(mainTimeoutRef.current);
    }

    mainTimeoutRef.current = setTimeout(async () => {
      const query = value.trim();

      if (query.length < 2) {
        setMainResults([]);
        return;
      }

      try {
        const requestId = ++mainRequestRef.current;
        const data = await searchCIE(query);
        if (requestId !== mainRequestRef.current) return;
        setMainResults(data);
      } catch (error) {
        console.error("Error in handleSearchMain:", error);
        setMainResults([]);
      }
    }, 300);
  };

  const handleSearchSec = (value) => {
    setSecSearch(value);

    if (secTimeoutRef.current) {
      clearTimeout(secTimeoutRef.current);
    }

    secTimeoutRef.current = setTimeout(async () => {
      const query = value.trim();

      if (query.length < 2) {
        setSecResults([]);
        return;
      }

      try {
        const requestId = ++secRequestRef.current;
        const data = await searchCIE(query);
        if (requestId !== secRequestRef.current) return;
        setSecResults(data);
      } catch (error) {
        console.error("Error in handleSearchSec:", error);
        setSecResults([]);
      }
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (mainTimeoutRef.current) clearTimeout(mainTimeoutRef.current);
      if (secTimeoutRef.current) clearTimeout(secTimeoutRef.current);
    };
  }, []);

  const appendRowFromSelection = (cieItem, tipo) => {
    updateRows((prev) => {
      const alreadyInTable = prev.some((row) => row.code === cieItem.code);
      if (alreadyInTable) return prev;
      return [...prev, createDxRowFromCIE(cieItem, tipo)];
    });
  };

  const selectMainDiagnosis = (cieItem) => {
    updateRows((prev) => {
      const withoutMain = prev.filter((row) => row.tipo !== "Principal");
      const existing = prev.find((row) => row.code === cieItem.code);
      const principalRow = existing
        ? { ...existing, tipo: "Principal" }
        : createDxRowFromCIE(cieItem, "Principal");

      return [...withoutMain.filter((row) => row.code !== cieItem.code), principalRow];
    });
    setMainSearch("");
    setMainResults([]);
  };

  const selectSecondaryDiagnosis = (cieItem) => {
    const exists = rows.some((item) => item.code === cieItem.code);

    if (exists) return;

    appendRowFromSelection(cieItem, "Secundario");
    setSecSearch("");
    setSecResults([]);
  };

  const removeDiagnosis = (scope, code) => {
    updateRows((prev) =>
      prev.filter((row) => {
        if (row.code !== code) return true;
        return scope === "main" ? row.tipo !== "Principal" : row.tipo === "Principal";
      })
    );
  };

  const updateRow = (id, field, value) => {
    updateRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const removeRow = (id) => {
    updateRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleAddRow = () => {
    updateRows((prev) => [...prev, createEmptyDxRow()]);
  };

  const cieSelected = useMemo(() => {
    const main = rows.filter(
      (row) => row.tipo === "Principal" && (row.code?.trim() || row.desc?.trim())
    );
    const sec = rows.filter(
      (row) => row.tipo !== "Principal" && (row.code?.trim() || row.desc?.trim())
    );
    return { main, sec };
  }, [rows]);

  const totalDx = rows.filter((row) => row.code?.trim() || row.desc?.trim()).length;
  const badgeText = totalDx
    ? `${totalDx} diagnóstico${totalDx > 1 ? "s" : ""}`
    : "Sin diagnóstico";

  const showMainDropdown = mainSearch.trim().length >= 2;
  const showSecDropdown = secSearch.trim().length >= 2;

  return (
    <div className="card">
      <div className="card-header ch-teal">
        <div className="card-icon">🔵</div>
        <span className="card-title">Diagnóstico — CIE-10</span>
        <span className="card-badge">{badgeText}</span>
      </div>

      <div className="card-body">
        <div className="g2">
          <div>
            <div className="sl">Diagnóstico Principal</div>

            <div className="cie-wrap">
              <input
                className="cie-input"
                value={mainSearch}
                onChange={(e) => handleSearchMain(e.target.value)}
                placeholder="Buscar por código o descripción CIE-10..."
                autoComplete="off"
              />

              <span className="cie-icon">🔍</span>

              <div className={`cie-drop ${showMainDropdown ? "open" : ""}`}>
                {mainResults.length === 0 ? (
                  <div className="cie-opt">
                    <div className="cie-opt-desc">Sin resultados en CIE-10</div>
                  </div>
                ) : (
                  mainResults.map((item) => (
                    <div
                      key={`main-${item.code}`}
                      className="cie-opt"
                      onClick={() => selectMainDiagnosis(item)}
                    >
                      <span className="cie-opt-code">{item.code}</span>
                      <span className="cie-opt-desc">{item.description}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="cie-tags">
              {cieSelected.main.length === 0 ? (
                <span>Sin diagnóstico principal</span>
              ) : (
                cieSelected.main.map((item) => (
                  <span key={`tag-main-${item.id || item.code}`} className="cie-tag">
                    <span className="cie-tag-code">{item.code}</span>
                    <span className="cie-tag-name">{item.desc || item.description}</span>
                    <button
                      type="button"
                      className="cie-tag-del"
                      onClick={() => removeDiagnosis("main", item.code)}
                    >
                      ✕
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          <div>
            <div className="sl">Diagnósticos Secundarios</div>

            <div className="cie-wrap">
              <input
                className="cie-input"
                value={secSearch}
                onChange={(e) => handleSearchSec(e.target.value)}
                placeholder="Buscar diagnósticos secundarios..."
                autoComplete="off"
              />

              <span className="cie-icon">🔍</span>

              <div className={`cie-drop ${showSecDropdown ? "open" : ""}`}>
                {secResults.length === 0 ? (
                  <div className="cie-opt">
                    <div className="cie-opt-desc">Sin resultados en CIE-10</div>
                  </div>
                ) : (
                  secResults.map((item) => (
                    <div
                      key={`sec-${item.code}`}
                      className="cie-opt"
                      onClick={() => selectSecondaryDiagnosis(item)}
                    >
                      <span className="cie-opt-code">{item.code}</span>
                      <span className="cie-opt-desc">{item.description}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="cie-tags">
              {cieSelected.sec.length === 0 ? (
                <span>Sin diagnósticos secundarios</span>
              ) : (
                cieSelected.sec.map((item) => (
                  <span key={`tag-sec-${item.id || item.code}`} className="cie-tag">
                    <span className="cie-tag-code">{item.code}</span>
                    <span className="cie-tag-name">{item.desc || item.description}</span>
                    <button
                      type="button"
                      className="cie-tag-del"
                      onClick={() => removeDiagnosis("sec", item.code)}
                    >
                      ✕
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="sl">Detalle del Diagnóstico</div>

        <table className="tbl">
          <thead>
            <tr>
              <th>Código CIE-10</th>
              <th>Descripción</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Observación</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <input
                    className="fi"
                    value={row.code}
                    onChange={(e) => updateRow(row.id, "code", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="fi"
                    value={row.desc}
                    onChange={(e) => updateRow(row.id, "desc", e.target.value)}
                  />
                </td>
                <td>
                  <select
                    className="fs"
                    value={row.tipo}
                    onChange={(e) => updateRow(row.id, "tipo", e.target.value)}
                  >
                    <option value="Principal">Principal</option>
                    <option value="Secundario">Secundario</option>
                    <option value="Complicación">Complicación</option>
                  </select>
                </td>
                <td>
                  <select
                    className="fs"
                    value={row.estado}
                    onChange={(e) => updateRow(row.id, "estado", e.target.value)}
                  >
                    <option value="Presuntivo">Presuntivo</option>
                    <option value="Definitivo">Definitivo</option>
                    <option value="Descartado">Descartado</option>
                  </select>
                </td>
                <td>
                  <input
                    className="fi"
                    value={row.obs}
                    onChange={(e) => updateRow(row.id, "obs", e.target.value)}
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="btn-del-row"
                    onClick={() => removeRow(row.id)}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button type="button" onClick={handleAddRow} className="btn-add-row">
          + Agregar diagnóstico
        </button>
      </div>
    </div>
  );
}
