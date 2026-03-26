import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient.js";
import SolicitudFarmaciaModal from "./SolicitudFarmaciaModal";

const MEDICAMENTOS_CATALOGO_TABLE =
  import.meta.env.VITE_SUPABASE_MEDICAMENTOS_CATALOGO_TABLE ||
  "medicamentos_catalogo";

const CLINICAL_EVOLUTION_TABLE =
  import.meta.env.VITE_SUPABASE_CLINICAL_EVOLUTION_TABLE || "clinical_evolution";

const MEDICAMENTOS_TABLE =
  import.meta.env.VITE_SUPABASE_MEDICAMENTOS_TABLE || "medicamentos";

const mapCatalogRowToItem = (row, index = 0) => ({
  id: row?.id || `med-catalog-${Date.now()}-${index}`,
  nombre: row?.nombre || row?.comercial || "",
  comercial: row?.comercial || "",
  concentracion: row?.concentracion || "",
  dosis: row?.dosis || "",
  via: row?.via || "",
  presentacion: row?.presentacion || "",
  frecuencia: row?.frecuencia || "",
  duracion: row?.duracion || "",
  categoria: row?.categoria || "",
});

const mapPrescriptionRowToItem = (row, index = 0) => ({
  id: row?.id || `med-pres-${Date.now()}-${index}`,
  nombre: row?.medicamento || "",
  dosis: row?.dosis || "",
  frecuencia: row?.frecuencia || "",
  duracion: row?.duracion || "",
  via: row?.via || "",
  presentacion: row?.presentacion || "",
  administra: row?.administra || "",
  cantidad: row?.cantidad || "",
  indicacion: row?.indicacion || "",
  clinical_evolution_id: row?.clinical_evolution_id || null,
});

export default function PrescripcionMedica() {
  const { mainId } = useParams();
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [prescripciones, setPrescripciones] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const searchTimeoutRef = useRef(null);
  const searchRequestRef = useRef(0);

  useEffect(() => {
    const loadExistingPrescriptions = async () => {
      if (!mainId) return;

      try {
        const { data: evolutionData, error: evolutionError } = await supabase
          .from(CLINICAL_EVOLUTION_TABLE)
          .select("id, admision_id, created_at")
          .eq("admision_id", mainId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        console.log("[PrescripcionMedica] mainId:", mainId);
        console.log("[PrescripcionMedica] clinical_evolution data:", evolutionData);
        console.log("[PrescripcionMedica] clinical_evolution error:", evolutionError);

        if (evolutionError) {
          console.error(
            "[PrescripcionMedica] Error cargando clinical_evolution:",
            evolutionError
          );
          return;
        }

        const evolutionId = evolutionData?.id;
        if (!evolutionId) {
          console.warn("[PrescripcionMedica] No se encontró evolución para mainId:", mainId);
          setPrescripciones([]);
          return;
        }

        const { data: medsData, error: medsError } = await supabase
          .from(MEDICAMENTOS_TABLE)
          .select("*")
          .eq("clinical_evolution_id", evolutionId)
          .order("created_at", { ascending: true });

        console.log("[PrescripcionMedica] medicamentos data:", medsData);
        console.log("[PrescripcionMedica] medicamentos error:", medsError);

        if (medsError) {
          console.error("[PrescripcionMedica] Error cargando medicamentos:", medsError);
          return;
        }

        const meds = Array.isArray(medsData) ? medsData : [];
        if (!meds.length) {
          setPrescripciones([]);
          return;
        }

        setPrescripciones(meds.map((row, index) => mapPrescriptionRowToItem(row, index)));
      } catch (err) {
        console.error("[PrescripcionMedica] Error inesperado cargando prescripciones:", err);
      }
    };

    loadExistingPrescriptions();
  }, [mainId]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const query = search.trim();
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      const requestId = ++searchRequestRef.current;
      const escaped = query.replace(/,/g, "\\,").replace(/\*/g, "");
      const pattern = `%${escaped}%`;

      try {
        const { data, error } = await supabase
          .from(MEDICAMENTOS_CATALOGO_TABLE)
          .select(
            "id, nombre, comercial, concentracion, dosis, via, presentacion, frecuencia, duracion, categoria"
          )
          .or(`nombre.ilike.${pattern},comercial.ilike.${pattern}`)
          .limit(12);

        console.log("[PrescripcionMedica] Query:", query);
        console.log("[PrescripcionMedica] Resultados:", data);
        console.log("[PrescripcionMedica] Error:", error);

        if (requestId !== searchRequestRef.current) return;

        if (error) {
          console.error("[PrescripcionMedica] Error buscando medicamentos:", error);
          setSearchResults([]);
          return;
        }

        const clean = Array.isArray(data)
          ? data.map((row, index) => mapCatalogRowToItem(row, index))
          : [];
        setSearchResults(clean);
      } catch (err) {
        if (requestId !== searchRequestRef.current) return;
        console.error("[PrescripcionMedica] Error inesperado en búsqueda:", err);
        setSearchResults([]);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [search]);

  const handleAddMed = (med) => {
    const alreadyExists = prescripciones.some(
      (item) =>
        item.nombre?.toLowerCase().trim() === med.nombre?.toLowerCase().trim()
    );
    if (alreadyExists) {
      setSearch("");
      setSearchResults([]);
      return;
    }

    setPrescripciones([
      ...prescripciones,
      {
        ...med,
        dosis: med.dosis || "",
        frecuencia: med.frecuencia || "",
        duracion: med.duracion || "",
        via: med.via || "",
      },
    ]);
    setSearch("");
    setSearchResults([]);
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
            {search && searchResults.length === 0 && (
              <div className="cie-opt">
                <div className="cie-opt-desc">Sin resultados</div>
              </div>
            )}

            {searchResults.map((med) => (
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
