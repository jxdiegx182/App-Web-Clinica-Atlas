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
<pre className="text-xs text-black bg-white p-2">
  {JSON.stringify(admisiones, null, 2)}
</pre>
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
      <div className="relative mb-1">
        <button
          onClick={() => window.history.back()}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#007e8f] text-white font-semibold py-1 px-3 rounded hover:bg-[#2b8d8f] shadow"
        >
          ← Volver
        </button>
        <h1 className="text-3xl text-[#5dbfc1] font-bold  text-center">
          MODULO MEDICO
        </h1>
      </div>

      <div className="min-h-screen bg-[#4b6bb3]/20 p-2">
        <header className="bg-[#ffffff]/90 rounded-md p-4 shadow-md text-[#0E2942]">
          {/*fecha*/}

          <p className="absolute left-40 top-36  text-lg font-bold  ">
            {formattedTime}
          </p>
          <p className="absolute left-24 top-44 text-sm uppercase tracking-wide">
            {formattedDate.toUpperCase()}
          </p>
{/**SE AGREGA COLUMNAS LUEGO DE LA IMAGEN  */}
          <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-9 text-sm">
            <div className="max-w-6xl mx-auto p-4 ">
              {/*la imagen de la clinica atlas y su fecha */}
              <img
                src="https://clinicas-atlas.com/wp-content/uploads/2024/11/clinicas-atlas-ecuador.png"
                alt="Imagen médica decorativa"
                className="w-48 h-auto mcx-auto mb-4"
              />
            </div>

            
            

            {/* 🔄 Mostrar datos del paciente ingresado de firebase se cargan los datos  */}
            {loading ? (
              <p className="text-gray-600">Cargando datos de admisiones...</p>
            ) : admisiones ? (
              <>
                <div>
                  <strong>{admisiones.firstName} {admisiones.lastName}{' '} </strong><br/>
                  <strong>Identificacion:</strong> {admisiones.cedula}<br/>
                  <strong>Edad:</strong> {edad}<br/>
                   <strong>Médico:</strong> {admisiones.medico}<br/>
                   <strong>Fecha Nacimiento:</strong> {admisiones.secondaryData?.dateOfBirth || 'No registrado'}   <br/>
                   <strong>Días de estancia:</strong> {estancia}<br/>
                  
                </div>
                <div>
                <strong>Servicio:</strong> {admisiones.servicio}<br/>
                  <strong>Seguro:</strong> {admisiones.seguro}<br/>
                  <strong>Alertas:</strong> {admisiones.alergiaIconUno || 'No registrado'} {admisiones.alergiaUno || 'No registrado'}   <br/>
                  {admisiones.alergiaIconDos || ''} {admisiones.alergiaDos || ''} <br/>
                  {admisiones.alergiaIconTres || ''} {admisiones.alergiaTres || ''}
                
                </div>
                <div className=" bg-[#007e8f]/60 absolute rounded text-center p-4 text-white font-bold top-30 right-10">
                <strong>PISO:</strong>  {admisiones.ubicacion.piso ||'No Reg'} <br/>
                  <strong></strong> {admisiones.ubicacion.habitacion ||'No Reg'}<br/>
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
