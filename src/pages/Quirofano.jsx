import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

import React, { useEffect, useState } from 'react';

import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// LISTA SOLO PARA MOSTRAR BOTONES
const nombrePrincipal = [
  'SALA OPERACIÓN 1',
  'SALA OPERACIÓN 2',
  'SALA OPERACIÓN 3',
  'SALA OPERACIÓN 4',
  'HOSPITAL DEL DÍA',
  'ENDOSCOPIA',
];

const Quirofano = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [time, setTime] = useState(new Date());
  const [patients, setPatients] = useState([]);

  // 🔥 Fechas únicas con citas
  const [diasConCitas, setDiasConCitas] = useState(new Set());

  // -----------------------------------------
  // 🔥 Cargar citas + fechas para el calendario
  // -----------------------------------------
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "citas"));
        const citasFirebase = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          fechaIngreso: doc.data().fecha || "Sin fecha",
          hora: doc.data().hora || "Sin hora",
          nombre: doc.data().nombre || "Sin nombre",
          edad: doc.data().edad || "Sin edad",
          cirujia: doc.data().cirujia || "Sin cirugía",
          cirujano: doc.data().cirujano || "Sin cirujano",
          ayudante: doc.data().ayudante || "Sin ayudante",
          tiempo: doc.data().tiempo || "Sin tiempo",
          tipo: doc.data().tipo || "Sin tipo",
          quirofano: doc.data().quirofano || "Sin quirófano",

          cedula: doc.data().cedula || "N/A",
          medico: doc.data().medico || "Por asignar",
          telefono: doc.data().telefono || "Por asignar",
          especialidad: doc.data().especialidad || "General",
          estado: "En Atención",
          seguro: doc.data().seguro || "",
          modulos: ["Modulo Médico", "Modulo Examenes", "Modulo Facturación"],
        }));

        // 🔥 Guardamos pacientes
        setPatients(citasFirebase);

        // 🔥 Crear Set de fechas con citas
        const fechas = new Set(
          citasFirebase
            .map((c) => c.fechaIngreso)
            .filter((f) => f && f !== "Sin fecha")
        );
        setDiasConCitas(fechas);

      } catch (error) {
        console.error("Error al obtener citas de Firestore:", error);
      }
    };

    fetchPatients();
  }, []);

  // -----------------------------------------
  // 🔵 Ordenar pacientes por hora
  // -----------------------------------------
  const sortedPatients = [...patients].sort((a, b) => {
    return a.hora.localeCompare(b.hora);
  });

  // -----------------------------------------
  // Formatos de fecha y hora
  // -----------------------------------------
  const formattedDate = time.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).toUpperCase();

  const formattedTime = time.toLocaleTimeString("es-ES");

  // -----------------------------------------
  // Render del calendario (no lo usas aún, pero está listo)
  // -----------------------------------------
  const renderDia = (dia) => {
    const fechaStr = dia.toISOString().split("T")[0];
    const tieneCita = diasConCitas.has(fechaStr);

    return (
      <div className="relative">
        <span>{dia.getDate()}</span>

        {tieneCita && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-green-500"></span>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ffffff] via-[#EAF4FB] to-[#1a5784]">
      <div className="relative mb-1">
        <button
          onClick={() => window.history.back()}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#4b6bb3] text-white font-semibold py-1 px-3 rounded hover:bg-[#2b8d8f] shadow"
        >
          ← Volver
        </button>
        <h1 className="text-3xl text-[#5dbfc1] font-bold text-center">
          PARTE OPERATORIO
        </h1>
      </div>

      <div className="min-h-screen bg-[#4b6bb3]/20 p-2">
        <header className="bg-[#ffffff]/90 rounded-md p-4 shadow-md text-[#0E2942]">
          <div className="mt-2 grid grid-cols-1 md:grid-cols-1 gap-9 ml-9 text-sm">
            <div className="absolute max-w-6xl mx-auto p-4">
              <img
                src="https://clinicas-atlas.com/wp-content/uploads/2024/11/clinicas-atlas-ecuador.png"
                alt="Imagen médica decorativa"
                className="w-48 h-auto mx-auto mb-4"
              />
            </div>

            <div className="flex justify-center">
              <div className="grid grid-cols-1 md:grid-cols-3 ml-10 ">
                {nombrePrincipal.map((mod, index) => (
                  <Button
                    key={index}
                    onClick={() => navigate('/registro')}
                    className="bg-[#4b6bb3] text-[#FFFFFF] font-bold mr-5 h-10 w-35 mt-5 ml-9 hover:bg-[#cfddec]"
                  >
                    {mod}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <p className="absolute left-40 top-44 text-lg font-bold">
            {formattedTime}
          </p>
        </header>

        

        {/* TABLA PRINCIPAL */}
        <main className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full col-span-3 md:col-span-3 bg-white rounded-lg p-5 shadow mx-auto max-w-6xl"
          >
            <div className="text-center mb-2">
              <p className="text-[#4b6bb3] text-2xl font-bold uppercase tracking-wide">
                {formattedDate}
              </p>
            </div>

            <div className="flex flex-col md:flex-row justify-center gap-5">
              <div className="overflow-y-auto max-h-[430px] max-w-[780px] rounded-sm pr-2">
                <table className="min-w-full border border-gray-200 shadow-md text-sm">
                  <thead className="bg-[#4b6bb3] text-white">
                    <tr>
                      <th className="px-3 py-2 border">Hora</th>
                      <th className="px-3 py-2 border">Nombre</th>
                      <th className="px-3 py-2 border">Edad</th>
                      <th className="px-3 py-2 border">Cirugía</th>
                      <th className="px-3 py-2 border">Cirujano</th>
                      <th className="px-3 py-2 border">Ayudante</th>
                      <th className="px-3 py-2 border">Tiempo</th>
                      <th className="px-3 py-2 border">Tipo</th>
                      <th className="px-3 py-2 border">Quirófano</th>
                    </tr>
                  </thead>

                  <tbody>
                    {sortedPatients.map((patient) => (
                      <tr key={patient.id} className="text-black hover:bg-gray-100 ">
                        <td className="px-3 py-2 border text-center">{patient.hora}</td>
                        <td className="px-3 py-2 border text-center">{patient.nombre}</td>
                        <td className="px-3 py-2 border text-center">{patient.edad}</td>
                        <td className="px-3 py-2 border text-center">{patient.cirujia}</td>
                        <td className="px-3 py-2 border text-center">{patient.cirujano}</td>
                        <td className="px-3 py-2 border text-center">{patient.ayudante}</td>
                        <td className="px-3 py-2 border text-center">{patient.tiempo}</td>
                        <td className="px-3 py-2 border text-center">{patient.tipo}</td>
                        <td className="px-3 py-2 border text-center">{patient.quirofano}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Quirofano;
