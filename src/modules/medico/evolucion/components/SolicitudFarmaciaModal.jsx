import { useEffect, useState } from "react";

const INITIAL_FORM = {
  nombre: "",
  conc: "",
  dosis: "",
  via: "",
  frecuencia: "",
  duracion: "",
  indicaciones: "",
};

export default function SolicitudFarmaciaModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setForm(INITIAL_FORM);
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    if (!form.nombre.trim()) {
      setError("El nombre del medicamento es obligatorio");
      return;
    }

    onSubmit({
      ...form,
      nombre: form.nombre.trim(),
      conc: form.conc.trim(),
      dosis: form.dosis.trim(),
      indicaciones: form.indicaciones.trim(),
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header ch-amber">
          <div className="card-icon">🔎</div>
          <span className="card-title">Solicitud de medicamento a farmacia</span>
        </div>

        <div className="modal-body">
          <div className="rx-item rx-urgente">
            <div className="rx-body">
              Este medicamento no esta en catalogo local. Se enviara como solicitud pendiente a farmacia.
            </div>
          </div>

          {error ? <div className="rx-devolucion-alert">{error}</div> : null}

          <div className="fg">
            <label className="fl">Nombre del medicamento *</label>
            <input
              className="fi"
              value={form.nombre}
              onChange={(event) => handleChange("nombre", event.target.value)}
              placeholder="Nombre del medicamento"
            />
          </div>

          <div className="g2">
            <div className="fg">
              <label className="fl">Concentracion / presentacion</label>
              <input
                className="fi"
                value={form.conc}
                onChange={(event) => handleChange("conc", event.target.value)}
                placeholder="Ej: 500mg/tab"
              />
            </div>

            <div className="fg">
              <label className="fl">Dosis</label>
              <input
                className="fi"
                value={form.dosis}
                onChange={(event) => handleChange("dosis", event.target.value)}
                placeholder="Ej: 1g"
              />
            </div>
          </div>

          <div className="g3">
            <div className="fg">
              <label className="fl">Via</label>
              <select
                className="fs"
                value={form.via}
                onChange={(event) => handleChange("via", event.target.value)}
              >
                <option value="">- Via -</option>
                <option value="VO">VO</option>
                <option value="IV">IV</option>
                <option value="IM">IM</option>
                <option value="SC">SC</option>
                <option value="Topico">Topico</option>
              </select>
            </div>

            <div className="fg">
              <label className="fl">Frecuencia</label>
              <select
                className="fs"
                value={form.frecuencia}
                onChange={(event) => handleChange("frecuencia", event.target.value)}
              >
                <option value="">- Frecuencia -</option>
                <option value="c/4h">c/4h</option>
                <option value="c/6h">c/6h</option>
                <option value="c/8h">c/8h</option>
                <option value="c/12h">c/12h</option>
                <option value="c/24h">c/24h</option>
                <option value="PRN">PRN</option>
                <option value="Una sola dosis (dosis unica)">Dosis unica</option>
              </select>
            </div>

            <div className="fg">
              <label className="fl">Duracion</label>
              <input
                className="fi"
                value={form.duracion}
                onChange={(event) => handleChange("duracion", event.target.value)}
                placeholder="Ej: 3 dias"
              />
            </div>
          </div>

          <div className="fg">
            <label className="fl">Indicaciones</label>
            <textarea
              className="fta"
              value={form.indicaciones}
              onChange={(event) => handleChange("indicaciones", event.target.value)}
              placeholder="Motivo clinico / observaciones"
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-outline" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={handleSubmit}>
            Enviar solicitud
          </button>
        </div>
      </div>
    </div>
  );
}
