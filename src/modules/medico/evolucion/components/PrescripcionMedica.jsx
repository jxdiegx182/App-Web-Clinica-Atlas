import { useState } from "react";
import SolicitudFarmaciaModal from "./SolicitudFarmaciaModal";

export default function PrescripcionMedica() {
  const [search, setSearch] = useState("");
  const [prescripciones, setPrescripciones] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  const fakeMeds = [
    { id: 1, nombre: "Paracetamol 500mg" },
    { id: 2, nombre: "Ibuprofeno 400mg" },
    { id: 3, nombre: "Amoxicilina 500mg" },
  ];

  const filtered = fakeMeds.filter((m) =>
    m.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddMed = (med) => {
    setPrescripciones([
      ...prescripciones,
      {
        ...med,
        dosis: "",
        frecuencia: "",
        duracion: "",
        via: "",
      },
    ]);
    setSearch("");
  };

  const handleChange = (index, field, value) => {
    const updated = [...prescripciones];
    updated[index][field] = value;
    setPrescripciones(updated);
  };

  const handleDelete = (index) => {
    setPrescripciones(prescripciones.filter((_, i) => i !== index));
  };

  return (
    <div className="card">
      <div className="card-header ch-teal">
        <div className="card-icon">💊</div>
        <span className="card-title">Prescripción Médica</span>
        <span className="card-badge">{prescripciones.length} medicamentos</span>
      </div>

      <div className="card-body">
        <div className="sl">Buscador de Medicamentos</div>

        <div className="cie-wrap">
          <input
            className="cie-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar medicamento..."
            autoComplete="off"
          />

          <span className="cie-icon">💊</span>

          <div className={`cie-drop ${search ? "open" : ""}`}>
            {search && filtered.length === 0 && (
              <div className="cie-opt">
                <div className="cie-opt-desc">Sin resultados</div>
              </div>
            )}

            {filtered.map((med) => (
              <div
                key={med.id}
                className="cie-opt"
                onClick={() => handleAddMed(med)}
              >
                <span className="cie-opt-code">MED</span>
                <div className="cie-opt-desc">{med.nombre}</div>
              </div>
            ))}
          </div>
        </div>

        {prescripciones.length === 0 ? (
          <div className="rx-item">
            <div className="rx-body">Sin prescripciones</div>
          </div>
        ) : (
          prescripciones.map((med, i) => (
            <div key={i} className="rx-item">
              <div className="rx-num">{i + 1}</div>

              <div className="rx-body">
                <div className="sl">{med.nombre}</div>

                <div className="g4">
                  <div className="fg">
                    <label className="fl">Dosis</label>
                    <input
                      className="fi"
                      placeholder="Dosis"
                      value={med.dosis}
                      onChange={(e) => handleChange(i, "dosis", e.target.value)}
                    />
                  </div>

                  <div className="fg">
                    <label className="fl">Frecuencia</label>
                    <input
                      className="fi"
                      placeholder="Frecuencia"
                      value={med.frecuencia}
                      onChange={(e) =>
                        handleChange(i, "frecuencia", e.target.value)
                      }
                    />
                  </div>

                  <div className="fg">
                    <label className="fl">Duración</label>
                    <input
                      className="fi"
                      placeholder="Duración"
                      value={med.duracion}
                      onChange={(e) =>
                        handleChange(i, "duracion", e.target.value)
                      }
                    />
                  </div>

                  <div className="fg">
                    <label className="fl">Vía</label>
                    <input
                      className="fi"
                      placeholder="Vía"
                      value={med.via}
                      onChange={(e) => handleChange(i, "via", e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-del-row"
                  onClick={() => handleDelete(i)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}

        <button className="btn-add-row" onClick={() => setOpenModal(true)}>
          🔎 Solicitar medicamento no disponible en listado
        </button>

        <SolicitudFarmaciaModal
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          onSubmit={(data) => {
            console.log("Solicitud enviada:", data);
          }}
        />
      </div>
    </div>
  );
}
