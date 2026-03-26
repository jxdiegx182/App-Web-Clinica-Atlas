import { useState } from "react";

export default function SolicitudFarmaciaModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState({
    nombre: "",
    conc: "",
    dosis: "",
    via: "",
    frecuencia: "",
    indicaciones: "",
  });

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setForm({
      ...form,
      [field]: value,
    });
  };

  const handleSubmit = () => {
    if (!form.nombre) {
      alert("El nombre del medicamento es obligatorio");
      return;
    }

    onSubmit(form);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header ch-amber">
          <div className="card-icon">🔎</div>
          <span className="card-title">Solicitar Medicamento a Farmacia</span>
        </div>

        <div className="modal-body">
          <div className="rx-item rx-urgente">
            <div className="rx-body">
              El medicamento no está en el listado de la clínica. Farmacia
              validará disponibilidad.
            </div>
          </div>

          <div className="fg">
            <label className="fl">Nombre del Medicamento *</label>
            <input
              className="fi"
              value={form.nombre}
              onChange={(e) => handleChange("nombre", e.target.value)}
              placeholder="Nombre del medicamento"
            />
          </div>

          <div className="g2">
            <div className="fg">
              <label className="fl">Concentración / Presentación</label>
              <input
                className="fi"
                placeholder="Concentración"
                value={form.conc}
                onChange={(e) => handleChange("conc", e.target.value)}
              />
            </div>

            <div className="fg">
              <label className="fl">Dosis requerida</label>
              <input
                className="fi"
                placeholder="Dosis"
                value={form.dosis}
                onChange={(e) => handleChange("dosis", e.target.value)}
              />
            </div>
          </div>

          <div className="g2">
            <div className="fg">
              <label className="fl">Vía</label>
              <select
                className="fs"
                value={form.via}
                onChange={(e) => handleChange("via", e.target.value)}
              >
                <option value="">— Vía —</option>
                <option>VO</option>
                <option>IV</option>
                <option>IM</option>
                <option>SC</option>
                <option>Tópico</option>
              </select>
            </div>

            <div className="fg">
              <label className="fl">Frecuencia</label>
              <select
                className="fs"
                value={form.frecuencia}
                onChange={(e) => handleChange("frecuencia", e.target.value)}
              >
                <option value="">— Frec. —</option>
                <option>c/4h</option>
                <option>c/6h</option>
                <option>c/8h</option>
                <option>c/12h</option>
                <option>c/24h</option>
                <option>PRN</option>
              </select>
            </div>
          </div>

          <div className="fg">
            <label className="fl">Indicaciones / Motivo clínico</label>
            <textarea
              className="fta"
              placeholder="Indicaciones"
              value={form.indicaciones}
              onChange={(e) => handleChange("indicaciones", e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-outline" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={handleSubmit}>
            🔎 Enviar Solicitud a Farmacia
          </button>
        </div>
      </div>
    </div>
  );
}
