import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { db } from '../firebaseConfig'; // 👈 AJUSTAr la ruta si es necesario
import { doc, getDoc } from 'firebase/firestore';

import { toast } from '@/components/ui/use-toast';

{/*const AllergyWarning = ({ allergy }) => (
  <span className="allergy-warning text-[#FF0000] font-semibold">
    <span className="allergy-icon">⚠️</span>
    ALERGIAS: {allergy}
  </span>
);*/}

const names = [
  'EMERGENCIAS',
  'ANAMNESIS',
  'EVOLUCION DIARIA Y PRESCRIPCION',
  'INTERCONSULTA',
  'EPICRISIS',
  'CERTIFICADO MEDICO',
];
const nombres = [
  'CHEQUEO PREQUIRURGICO',
  'REGISTRO ANESTESIA',
  'PROTOCOLO OPERATORIO',
  'RECETA',

  'CONSENTIMIENTOS INFORMADOS',
  'PEDIDO EXAMENES',
];

const nombresT = ['REVIT', 'EXAMEN FISICO RN', 'CHATBOT'];

const MedicalModulePanel = () => {
  const { mainId } = useParams();
  const [time, setTime] = useState(new Date());
  const [admisiones, setAdmisiones] = useState(null); // <-- aquí se guardan los datos desde Firestore
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  // 📦 Traer admisiones desde Firestore

  useEffect(() => {
    const fetchAdmisiones = async () => {
      console.log('🧪 mainId recibido:', mainId);

      if (!mainId) {
        console.warn('⚠️ mainId es undefined o null'); 
        setLoading(false);
        return;
      }
      

      try {

        const ref = doc(db, 'admisiones', mainId);

        const snap = await getDoc(ref);

        console.log('📄 Documento Firestore:', snap.data());
        console.log('🧩 mainData:', snap.data()?.mainData);

        if (!snap.exists()) {
          console.warn('❌ Documento no existe');
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
        console.error('❌ Error al obtener admisiones:', error);
        setAdmisiones(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAdmisiones();
  }, [mainId]);

//AQUI CREO LA ESTANCIA DE CADA PACIOENTE SUMANDO LOS DIAS 
const [estancia, setEstancia] = useState(0);
useEffect(() => {
  if (!admisiones?.createdAt) return;

  const fechaIngreso = admisiones.createdAt.toDate();
  const hoy = new Date();

  const dias = Math.floor(
    (hoy - fechaIngreso) / (1000 * 60 * 60 * 24) + 1
  );

  setEstancia(dias);
}, [admisiones]);
//*******************************************************HASTA AQUI ESTANCIAS */
//AQUI CREO LA edad DE CADA PACIOENTE SUMANDO LOS años 
const [edad, setEdad] = useState(0);
useEffect(() => {
  if (!admisiones?.secondaryData?.dateOfBirth) return;

  let fechaNacimiento = admisiones.secondaryData.dateOfBirth;
   // 🔥 Si viene como Timestamp de Firestore
   if (fechaNacimiento.toDate) {
    fechaNacimiento = fechaNacimiento.toDate();
  } else {
    fechaNacimiento = new Date(fechaNacimiento);
  }

  const hoy = new Date();

  let años = hoy.getFullYear() - fechaNacimiento.getFullYear();

  const mesActual = hoy.getMonth();
  const mesNacimiento = fechaNacimiento.getMonth();

  // Si aún no cumple años este año
  if (
    mesActual < mesNacimiento ||
    (mesActual === mesNacimiento && hoy.getDate() < fechaNacimiento.getDate())
  ) {
    años--;
  }

  setEdad(años);
}, [admisiones]);
//*******************************************************HASTA AQUI edad */

  const formattedDate = time.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = time.toLocaleTimeString('es-ES');

  {
    /*/encabezado inicio de la ventana /*/
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ffffff] via-[#EAF4FB] to-[#1a5784]">
      <div className="relative mb-2">
        <button
          onClick={() => window.history.back()}
          className="absolute left-0 top-1/2 -translate-y-1/2 rounded-lg bg-[#1c3f6e] px-3 py-1.5 text-sm font-semibold text-white shadow transition hover:bg-[#007e8f]"
        >
          ← Volver
        </button>
        <h1 className="text-2xl text-[#007e8f] font-extrabold tracking-wide text-center">
          MODULO MEDICO
        </h1>
      </div>

      <div className="min-h-screen bg-[#4b6bb3]/20 p-2">
        <header className="relative rounded-2xl border border-[#007e8f]/25 bg-white/85 p-2 md:p-3 shadow-md text-[#1c3f6e] backdrop-blur">
{/**SE AGREGA COLUMNAS LUEGO DE LA IMAGEN  */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs leading-tight">
            <div className="rounded-xl bg-[#007e8f]/5 p-2">
              {/*la imagen de la clinica atlas y su fecha */}
              <img
                src="https://clinicas-atlas.com/wp-content/uploads/2024/11/clinicas-atlas-ecuador.png"
                alt="Logo Clinica Atlas"
                className="w-36 h-auto"
              />
              <p className="mt-1 text-sm font-bold text-[#1c3f6e]">{formattedTime}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#007e8f]">
                {formattedDate.toUpperCase()}
              </p>
            </div>

            
            

            {/* 🔄 Mostrar datos del paciente ingresado de firebase se cargan los datos  */}
            {loading ? (
              <p className="text-gray-600">Cargando datos de admisiones...</p>
            ) : admisiones ? (
              <>
                <div className="rounded-xl border border-[#007e8f]/15 bg-white p-2">
                  <p className="font-bold text-sm text-[#1c3f6e]">{admisiones.firstName} {admisiones.lastName}{' '}</p>
                  <p><strong>Identificacion:</strong> {admisiones.cedula}</p>
                  <p><strong>Edad:</strong> {edad}</p>
                  <p><strong>Medico:</strong> {admisiones.medico}</p>
                  <p><strong>Nacimiento:</strong> {admisiones.secondaryData?.dateOfBirth || 'No registrado'}</p>
                  <p><strong>Estancia:</strong> {estancia} dias</p>
                </div>
                <div className="rounded-xl border border-[#007e8f]/15 bg-white p-2">
                  <p><strong>Servicio:</strong> {admisiones.servicio}</p>
                  <p><strong>Seguro:</strong> {admisiones.seguro}</p>
                  <p><strong>Alertas:</strong> {admisiones.alergiaIconUno || 'No registrado'} {admisiones.alergiaUno || 'No registrado'}</p>
                  <p>{admisiones.alergiaIconDos || ''} {admisiones.alergiaDos || ''}</p>
                  <p>{admisiones.alergiaIconTres || ''} {admisiones.alergiaTres || ''}</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-[#ffffff] to-[#f3f8fc] border border-[#007e8f]/15 p-2 text-center font-semibold text-[#1c3f6e]">
                  <p>PISO: {admisiones.ubicacion?.piso || 'No Reg'}</p>
                  <p>{admisiones.ubicacion?.habitacion || 'No Reg'}</p>
                  <p className="mt-1 text-[10px] font-bold text-[#007e8f]">Turno Medico</p>
                </div>
                
              </>
            ) : (
              <p className="text-red-600 font-bold">
                ❌ No se encontró información de admisiones.estoy arto
              </p>
            )}
          </div>

        </header>

        <main className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white rounded-lg p-4 col-span-1 text-sm shadow">
            <h2 className="font-semibold text-gray-800 mb-2">
              HISTORIAL DE INGRESOS
            </h2>
            <div className="overflow-y-auto max-h-[250px] pr-2">
              {' '}
              {/* contenedor con scroll */}
              <ul className="bg-[#E9F5F2] rounded-2xl p-4 mt-1 text-sm list-disc list-inside text-gray-700">
                <li>21/12/2023</li>
                <li>15/10/2019</li>
                <li>15/12/2015</li>
                <li>10/08/2013</li>
                <li>22/04/2011</li>
                <li>05/08/2024</li>
                <li>05/07/2009</li>
                <li>05/01/2024</li>
                <li>05/02/2024</li>
                <li>05/08/2023</li>
                <li>05/07/2024</li>
                <li>05/09/2009</li>
                <li>05/06/2025</li>
                <li>05/01/2025</li>
                {/* puedes agregar más elementos sin que se desborde */}
              </ul>
            </div>
            <div className="bg-[#d3efe9] rounded-lg p-4 mt-4 text-sm text-gray-700">
              <p>
                <strong>PESO:</strong> 70 KG
              </p>
              <p>
                <strong>TALLA:</strong> 1.60
              </p>
              <p>
                <strong>PULSO:</strong> 7
              </p>
              <p>
                <strong>TEMPERATURA:</strong> 36.5
              </p>
              <p>
                <strong>FRECUENCIA RESPIRATORIA:</strong> 23
              </p>
              <p>
                <strong>PRESIÓN ARTERIAL:</strong> 120/70
              </p>
            </div>
          </Card>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full col-span-3 md:col-span-3 bg-white rounded-lg p-5 shadow mx-auto max-w-6xl"
          >
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold bg-[#162f5c] text-white inline-block px-4 py-2 rounded-full">
                MODULO MEDICOS
              </h2>
            </div>

            <div className="flex flex-col md:flex-row justify-center gap-12">
              {/* Columna de los modulos pero la izquierda */}
              <div className="grid grid-cols-1 md:grid-cols-1 gap-9 mt-5 ">
                {names.map((mod, index) => (
                  <Button
                    key={index}
                    onClick={() => {
                      if (mod === 'EVOLUCION DIARIA Y PRESCRIPCION') {
                        navigate(`/evolucion/${mainId}`);

                      } else if (mod === 'ANAMNESIS') {
                        navigate(`/anamnesis/${mainId}`);

                      } else if (mod === 'CERTIFICADO MEDICO') {
                        navigate(`/certificado/${mainId}`);
                       
                    } else if (mod === 'INTERCONSULTA') {
                      navigate(`/interconsulta/${mainId}`);
                    }
                      else {
                        toast({
                          title: '🚧 Esta función no está implementada aún.',
                        });
                      }
                    }}
                    className="bg-[#dee6f1] text-[#1c396b] font-bold py-3 hover:bg-[#cfddec] transition rounded shadow"
                  >
                    {mod}
                  </Button>
                ))}
              </div>

              {/* Columna derecha */}
              <div className="grid grid-cols-1 md:grid-cols-1 gap-7 mt-5 ">
                {nombres.map((mod, index) => (
                  <Button
                    key={index}
                    onClick={() => {
                      if (mod === 'REGISTRO ANESTESIA') {
                        navigate(`/modulo-medico/reganestesia/${mainId}`);
                      } else if (mod === 'PROTOCOLO OPERATORIO') {
                        navigate(`/protocolo/${mainId}`);
                      } else if (mod === 'RECETA') {
                        navigate(`/receta/${mainId}`);
                      } else if (mod === 'CONSENTIMIENTOS INFORMADOS') {
                        navigate(`/consentimientos/${mainId}`);
                      } else if (mod === 'AGENDAMIENTO') {
                        navigate('/registro');
                      } else {
                        toast({
                          title: '🚧 Esta función no está implementada aún.',
                        });
                      }
                    }}
                    className="bg-[#dee6f1] text-[#1c396b] font-bold py-3 hover:bg-[#cfddec] transition rounded shadow"
                  >
                    {mod}
                  </Button>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-7 mt-5 ">
                {nombresT.map((mod, index) => (
                  <Button
                    key={index}
                    onClick={() => {
                      if (mod === 'CHATBOT') {
                        navigate('/chatbot');
                      } else {
                        toast({
                          title: '🚧 Esta función no está implementada aún.',
                        });
                      }
                    }}
                    className="bg-[#dee6f1] text-[#1c396b] font-bold py-3 hover:bg-[#cfddec] transition rounded shadow"
                  >
                    {mod}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default MedicalModulePanel;
