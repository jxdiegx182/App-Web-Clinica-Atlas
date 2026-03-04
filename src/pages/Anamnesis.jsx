import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle, Trash2, Activity } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const quickSymptoms = [
  'Fiebre',
  'Nausea',
  'Mareo',
  'Tos',
  'Dolor torácico',
  'Disnea',
];

const evaState = (eva) => {
  if (eva <= 3) return { label: 'Leve', color: 'bg-emerald-500' };
  if (eva <= 6) return { label: 'Moderado', color: 'bg-amber-500' };
  return { label: 'Severo', color: 'bg-rose-600' };
};

const formatDateValue = (rawValue) => {
  if (!rawValue) return 'No registrado';
  if (rawValue?.toDate) return rawValue.toDate().toLocaleDateString('es-EC');
  const parsed = new Date(rawValue);
  if (Number.isNaN(parsed.getTime())) return String(rawValue);
  return parsed.toLocaleDateString('es-EC');
};

export default function Anamnesis() {
  const { mainId } = useParams();
  const navigate = useNavigate();

  const [time, setTime] = useState(new Date());
  const [admisiones, setAdmisiones] = useState(null);
  const [loading, setLoading] = useState(true);
  const [estancia, setEstancia] = useState(0);
  const [edad, setEdad] = useState(0);

  const [consulta, setConsulta] = useState({
    tipoConsulta: '',
    servicio: '',
    motivoConsulta: '',
    localizacion: '',
    inicio: '',
    tipoDolor: '',
    irradiacion: '',
    cronologia: '',
    factoresAgravantes: '',
    factoresAtenuantes: '',
    sintomasAsociados: '',
  });

  const [eva, setEva] = useState(0);
  const [activeSymptoms, setActiveSymptoms] = useState([]);

  const [cirugias, setCirugias] = useState([
    { procedimiento: '', anio: '', complicaciones: '' },
  ]);
  const [medicamentos, setMedicamentos] = useState([
    { nombre: '', dosis: '', frecuencia: '' },
  ]);
  const [alergias, setAlergias] = useState([
    { nombre: '', tipo: '', severidad: '' },
  ]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchAdmisiones = async () => {
      if (!mainId) {
        setLoading(false);
        return;
      }
      try {
        const ref = doc(db, 'admisiones', mainId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setAdmisiones(null);
          return;
        }

        const data = snap.data();
        setAdmisiones({
          id: snap.id,
          ...data,
          ...data.mainData,
        });
      } catch (error) {
        console.error('Error al obtener admisiones:', error);
        setAdmisiones(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmisiones();
  }, [mainId]);

  useEffect(() => {
    if (!admisiones?.createdAt?.toDate) return;
    const fechaIngreso = admisiones.createdAt.toDate();
    const dias = Math.floor((new Date() - fechaIngreso) / (1000 * 60 * 60 * 24)  + 1);
    setEstancia(dias);
  }, [admisiones]);

  useEffect(() => {
    if (!admisiones?.secondaryData?.dateOfBirth) return;
    let fechaNacimiento = admisiones.secondaryData.dateOfBirth;
    if (fechaNacimiento?.toDate) fechaNacimiento = fechaNacimiento.toDate();
    else fechaNacimiento = new Date(fechaNacimiento);

    const hoy = new Date();
    let anios = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mesDiff = hoy.getMonth() - fechaNacimiento.getMonth();
    if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
      anios -= 1;
    }
    setEdad(anios);
  }, [admisiones]);

  const formattedDate = time.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = time.toLocaleTimeString('es-ES');

  const completion = useMemo(() => {
    const required = ['tipoConsulta', 'servicio', 'motivoConsulta'];
    const ok = required.filter((field) => consulta[field]?.trim()).length;
    return Math.round((ok / required.length) * 100);
  }, [consulta]);

  const handleConsultaChange = (e) => {
    const { name, value } = e.target;
    setConsulta((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSymptom = (item) => {
    const next = activeSymptoms.includes(item)
      ? activeSymptoms.filter((s) => s !== item)
      : [...activeSymptoms, item];

    setActiveSymptoms(next);
    setConsulta((prev) => ({
      ...prev,
      sintomasAsociados: next.join(', '),
    }));
  };

  const updateArrayItem = (setter, list, index, field, value) => {
    const next = [...list];
    next[index][field] = value;
    setter(next);
  };

  const addArrayItem = (setter, list, payload) => setter([...list, payload]);
  const removeArrayItem = (setter, list, index) => {
    if (list.length === 1) return;
    setter(list.filter((_, i) => i !== index));
  };

  const evaMeta = evaState(eva);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f6fcfc] via-[#e8f5f8] to-[#d9edf4] p-3 md:p-5">
      <div className="relative mb-3">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 rounded-lg bg-[#1c3f6e] px-3 py-1.5 font-semibold text-white shadow transition hover:bg-[#007e8f]"
        >
          ← Volver
        </button>
        <h1 className="text-center text-3xl font-extrabold tracking-wide text-[#007e8f]">
          ANAMNESIS
        </h1>
      </div>

      <header className="relative rounded-2xl border border-[#007e8f]/25 bg-white/80 p-4 shadow-lg backdrop-blur">
        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-4">
          <div className="rounded-xl bg-[#007e8f]/5 p-3">
            <img
              src="https://clinicas-atlas.com/wp-content/uploads/2024/11/clinicas-atlas-ecuador.png"
              alt="Logo Clinica Atlas"
              className="h-auto w-44"
            />
            <p className="mt-2 text-lg font-bold text-[#1c3f6e]">{formattedTime}</p>
            <p className="text-xs font-semibold uppercase text-[#007e8f]">
              {formattedDate.toUpperCase()}
            </p>
          </div>

          {loading ? (
            <p className="text-gray-600">Cargando datos de admisiones...</p>
          ) : admisiones ? (
            <>
              <div className="rounded-xl border border-[#007e8f]/15 text-[#1c3f6e] bg-white p-3">
                <p className="text-base font-bold text-[#1c3f6e]">
                  {admisiones.firstName} {admisiones.lastName}
                </p>
                <p>
                  <strong>Identificación:</strong> {admisiones.cedula}
                </p>
                <p>
                  <strong>Edad:</strong> {edad} años
                </p>
                <p>
                  <strong>Médico:</strong> {admisiones.medico}
                </p>
                <p>
                  <strong>Nacimiento:</strong>{' '}
                  {formatDateValue(admisiones.secondaryData?.dateOfBirth)}
                </p>
              </div>
              <div className="rounded-xl border text-[#1c3f6e] border-[#007e8f]/15 bg-white p-3">
                <p>
                  <strong>Servicio:</strong> {admisiones.servicio}
                </p>
                <p>
                  <strong>Seguro:</strong> {admisiones.seguro}
                </p>
                <p>
                  <strong>Estancia:</strong> {estancia} días
                </p>
                <p>
                  <strong>Alertas:</strong> {admisiones.alergiaIconUno || ''} {admisiones.alergiaUno || 'No registrado'}
                </p>
                <p>
                  {admisiones.alergiaIconDos || ''} {admisiones.alergiaDos || ''}
                </p>
                <p>
                  {admisiones.alergiaIconTres || ''} {admisiones.alergiaTres || ''}
                </p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-[#ffffff] to-[#ffffff] text-[#1c3f6e] p-3 text-center font-bold text-white">
                <p>PISO: {admisiones.ubicacion?.piso || 'No Reg'}</p>
                <p>{admisiones.ubicacion?.habitacion || 'No Reg'}</p>
              </div>
            </>
          ) : (
            <p className="font-bold text-red-600">No se encontró información de admisiones.</p>
          )}
        </div>
      </header>

      <main className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
        <motion.aside
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4 rounded-2xl border border-[#007e8f]/20 bg-white/90 p-4 shadow-md"
        >
          <h2 className="rounded-lg bg-[#1c3f6e] px-4 py-2 text-center text-sm font-bold text-white">
            NUEVA ANAMNESIS
          </h2>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="font-semibold text-[#1c3f6e]">Progreso de llenado</p>
              <span className="text-sm font-bold text-[#007e8f]">{completion}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completion}%` }}
                className="h-2 rounded-full bg-gradient-to-r from-[#007e8f] to-[#1c3f6e]"
              />
            </div>
          </div>

          <div className="rounded-xl border border-[#007e8f]/20 bg-[#eaf9fa] p-3 text-sm">
            <p className="mb-2 font-bold text-[#1c3f6e]">Historial reciente</p>
            <ul className="space-y-1 text-[#007e8f]">
              <li>Dr. Delgado Zurita</li>
              <li>Dr. Delgado Zurita</li>
            </ul>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-[#007e8f] to-[#4cb6c4] p-4 text-sm text-white shadow">
            <p><strong>PESO:</strong> 70 KG</p>
            <p><strong>TALLA:</strong> 1.60</p>
            <p><strong>PULSO:</strong> 70</p>
            <p><strong>TEMPERATURA:</strong> 36.5</p>
            <p><strong>FR:</strong> 23</p>
            <p><strong>PA:</strong> 120/70</p>
          </div>
        </motion.aside>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 md:col-span-3"
        >
          <div className="rounded-2xl border border-[#007e8f]/20 bg-white/95 p-4 shadow-md">
            <div className="mb-3 flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#007e8f]" />
              <h2 className="text-lg font-bold text-[#1c3f6e]">Motivo de Consulta</h2>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-[#1c3f6e]">Tipo de Consulta *</label>
                <select
                  name="tipoConsulta"
                  value={consulta.tipoConsulta}
                  onChange={handleConsultaChange}
                  className="mt-1 w-full rounded-lg border border-[#007e8f]/30 bg-white text-[#1c3f6e] px-3 py-2 outline-none focus:border-[#007e8f]"
                >
                  <option value="">Seleccionar...</option>
                  <option value="primera_vez">Primera Vez</option>
                  <option value="control">Control</option>
                  <option value="urgencia">Urgencia</option>
                  <option value="hospitalizacion">Hospitalización</option>
                  <option value="interconsulta">Interconsulta</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-[#1c3f6e]">Servicio / Especialidad *</label>
                <select
                  name="servicio"
                  value={consulta.servicio}
                  onChange={handleConsultaChange}
                  className="mt-1 w-full rounded-lg border border-[#007e8f]/30 bg-white text-[#1c3f6e] px-3 py-2 outline-none focus:border-[#007e8f]"
                >
                  <option value="">Seleccionar...</option>
                  <option value="medicina_general">Medicina General</option>
                  <option value="pediatria">Pediatría</option>
                  <option value="ginecologia">Ginecología y Obstetricia</option>
                  <option value="cirugia">Cirugía General</option>
                  <option value="traumatologia">Traumatología</option>
                  <option value="cardiologia">Cardiología</option>
                </select>
              </div>
            </div>

            <div className="mt-3">
              <label className="text-sm font-semibold text-[#1c3f6e]">
                Motivo de Consulta (palabras del paciente) *
              </label>
              <textarea
                name="motivoConsulta"
                value={consulta.motivoConsulta}
                onChange={handleConsultaChange}
                rows={3}
                className="mt-1 w-full rounded-lg border border-[#007e8f]/30 text-[#1c3f6e] bg-white px-3 py-2 outline-none focus:border-[#007e8f]"
                placeholder="Descripción del motivo de consulta..."
              />
            </div>

            <div className="mt-4 rounded-xl border border-[#007e8f]/20 bg-[#f6fcfc] p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-semibold text-[#1c3f6e]">Intensidad del dolor (EVA)</p>
                <span className={`rounded-full px-2 py-1 text-xs font-bold text-white ${evaMeta.color}`}>
                  {eva}/10 {evaMeta.label}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                value={eva}
                onChange={(e) => setEva(Number(e.target.value))}
                className="w-full accent-[#007e8f]"
              />
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label className="text-sm font-semibold text-[#1c3f6e]">Localización</label>
                <Input name="localizacion" value={consulta.localizacion} onChange={handleConsultaChange} />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#1c3f6e]">Inicio / evolución</label>
                <Input name="inicio" value={consulta.inicio} onChange={handleConsultaChange} />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#1c3f6e]">Tipo / Calidad</label>
                <Input name="tipoDolor" value={consulta.tipoDolor} onChange={handleConsultaChange} />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label className="text-sm font-semibold text-[#1c3f6e]">Irradiación</label>
                <Input name="irradiacion" value={consulta.irradiacion} onChange={handleConsultaChange} />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#1c3f6e]">Cronología</label>
                <select
                  name="cronologia"
                  value={consulta.cronologia}
                  onChange={handleConsultaChange}
                  className="mt-1 w-full rounded-lg border border-[#007e8f]/30 text-[#1c3f6e] bg-white px-3 py-2 outline-none focus:border-[#007e8f]"
                >
                  <option value="">Seleccionar...</option>
                  <option value="continuo">Continuo</option>
                  <option value="intermitente">Intermitente</option>
                  <option value="progresivo">Progresivo</option>
                  <option value="episodico">Episódico</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-[#1c3f6e]">Factores Agravantes</label>
                <Input
                  name="factoresAgravantes"
                  value={consulta.factoresAgravantes}
                  onChange={handleConsultaChange}
                  className="text-[#1c3f6e] bg-white px-3 py-2 outline-none focus:border-[#007e8f]"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="text-sm font-semibold text-[#1c3f6e]">Factores Atenuantes</label>
              <Input
                name="factoresAtenuantes"
                value={consulta.factoresAtenuantes}
                onChange={handleConsultaChange}
                 className="text-[#1c3f6e] bg-white px-3 py-2 outline-none focus:border-[#007e8f]"
              />
            </div>

            <div className="mt-4">
              <p className="text-sm font-semibold text-[#1c3f6e]">Síntomas frecuentes (rápido)</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {quickSymptoms.map((item) => {
                  const active = activeSymptoms.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleSymptom(item)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                        active
                          ? 'bg-[#007e8f] text-white shadow'
                          : 'bg-[#eaf9fa] text-[#1c3f6e] hover:bg-[#d8f1f3]'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
              <textarea
                name="sintomasAsociados"
                value={consulta.sintomasAsociados}
                onChange={handleConsultaChange}
                rows={2}
                className="mt-2 w-full rounded-lg border text-[#1c3f6e] border-[#007e8f]/30 bg-white px-3 py-2 outline-none focus:border-[#007e8f]"
                placeholder="Otros síntomas asociados..."
              />
            </div>
          </div>

          <div className="rounded-2xl border border-[#007e8f]/20 bg-white/95 p-4 shadow-md">
            <h3 className="mb-3 text-lg font-bold text-[#1c3f6e]">Antecedentes Quirúrgicos</h3>
            {cirugias.map((item, index) => (
              <div key={`cir-${index}`} className="mb-3 grid grid-cols-1 gap-2 rounded-xl border p-3 md:grid-cols-4">
                <Input
                  placeholder="Procedimiento"
                  value={item.procedimiento}
                  onChange={(e) =>
                    updateArrayItem(setCirugias, cirugias, index, 'procedimiento', e.target.value)
                  }
                />
                <Input
                  type="number"
                  min={1900}
                  max={2099}
                  placeholder="Año"
                  value={item.anio}
                  onChange={(e) => updateArrayItem(setCirugias, cirugias, index, 'anio', e.target.value)}
                />
                <Input
                  placeholder="Complicaciones"
                  value={item.complicaciones}
                  onChange={(e) =>
                    updateArrayItem(setCirugias, cirugias, index, 'complicaciones', e.target.value)
                  }
                />
                <div className="flex items-center justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-rose-300 text-rose-600 hover:bg-rose-50"
                    onClick={() => removeArrayItem(setCirugias, cirugias, index)}
                  >
                    <Trash2 className="mr-1 h-4 w-4" /> Quitar
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              onClick={() =>
                addArrayItem(setCirugias, cirugias, { procedimiento: '', anio: '', complicaciones: '' })
              }
              className="bg-[#007e8f] text-white hover:bg-[#066e7c]"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Agregar cirugía
            </Button>
          </div>

          <div className="rounded-2xl border border-[#007e8f]/20 bg-white/95 p-4 shadow-md">
            <h3 className="mb-3 text-lg font-bold text-[#1c3f6e]">Medicamentos Actuales</h3>
            {medicamentos.map((item, index) => (
              <div key={`med-${index}`} className="mb-3 grid grid-cols-1 gap-2 rounded-xl border p-3 md:grid-cols-4">
                <Input
                  placeholder="Medicamento"
                  value={item.nombre}
                  onChange={(e) => updateArrayItem(setMedicamentos, medicamentos, index, 'nombre', e.target.value)}
                />
                <Input
                  placeholder="Dosis"
                  value={item.dosis}
                  onChange={(e) => updateArrayItem(setMedicamentos, medicamentos, index, 'dosis', e.target.value)}
                />
                <Input
                  placeholder="Frecuencia"
                  value={item.frecuencia}
                  onChange={(e) =>
                    updateArrayItem(setMedicamentos, medicamentos, index, 'frecuencia', e.target.value)
                  }
                />
                <div className="flex items-center justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-rose-300 text-rose-600 hover:bg-rose-50"
                    onClick={() => removeArrayItem(setMedicamentos, medicamentos, index)}
                  >
                    <Trash2 className="mr-1 h-4 w-4" /> Quitar
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              onClick={() => addArrayItem(setMedicamentos, medicamentos, { nombre: '', dosis: '', frecuencia: '' })}
              className="bg-[#007e8f] text-white hover:bg-[#066e7c]"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Agregar medicamento
            </Button>
          </div>

          <div className="rounded-2xl border border-[#007e8f]/20 bg-white/95 p-4 shadow-md">
            <h3 className="mb-3 text-lg font-bold text-[#1c3f6e]">Alergias</h3>
            {alergias.map((item, index) => (
              <div key={`alg-${index}`} className="mb-3 grid grid-cols-1 gap-2 rounded-xl border p-3 md:grid-cols-4">
                <Input
                  placeholder="Alérgeno"
                  value={item.nombre}
                  onChange={(e) => updateArrayItem(setAlergias, alergias, index, 'nombre', e.target.value)}
                />
                <select
                  value={item.tipo}
                  onChange={(e) => updateArrayItem(setAlergias, alergias, index, 'tipo', e.target.value)}
                  className="rounded-lg text-[#1c3f6e] border border-[#007e8f]/30 bg-white px-3 py-2 outline-none focus:border-[#007e8f]"
                >
                  <option value="">Tipo de reacción</option>
                  <option value="cutanea">Cutánea</option>
                  <option value="anafilaxia">Anafilaxia</option>
                  <option value="respiratoria">Respiratoria</option>
                  <option value="digestiva">Digestiva</option>
                </select>
                <select
                  value={item.severidad}
                  onChange={(e) => updateArrayItem(setAlergias, alergias, index, 'severidad', e.target.value)}
                  className="rounded-lg border text-[#1c3f6e] border-[#007e8f]/30 bg-white px-3 py-2 outline-none focus:border-[#007e8f]"
                >
                  <option value="">Severidad</option>
                  <option value="leve">Leve</option>
                  <option value="moderada">Moderada</option>
                  <option value="grave">Grave</option>
                </select>
                <div className="flex items-center justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-rose-300 text-rose-600 hover:bg-rose-50"
                    onClick={() => removeArrayItem(setAlergias, alergias, index)}
                  >
                    <Trash2 className="mr-1 h-4 w-4" /> Quitar
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              onClick={() => addArrayItem(setAlergias, alergias, { nombre: '', tipo: '', severidad: '' })}
              className="bg-[#007e8f] text-white hover:bg-[#066e7c]"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Agregar alergia
            </Button>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
