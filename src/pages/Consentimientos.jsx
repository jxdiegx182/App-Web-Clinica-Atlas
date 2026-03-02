import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { PlusCircle } from 'lucide-react';
import { db } from '../firebaseConfig'; // 👈 AJUSTAr la ruta si es necesario
import { doc, getDoc } from 'firebase/firestore';

const nombres = [
  'ANESTESIA',
  'CESAREA',
  'HISTERCTOMIA',
  'MIOMECTOMIA',
  'LEGRADO',
  'APENDILAP',
  'HISTEROSCOPIA',
  'HERNIOLAP',
  'HERNIA UMB.',
  'SAFENECTOMIA',
  'ARTROPLASTIA',
  'COLELAP',
  'PUNCION LUMBAR',
  'RTU',
  'CISTOSCOPIA',
  'LAMINECTOMIA',
  'ARTROSCOPIA',
  'RTU',
];

const MedicalModuleConsen = () => {
  const { mainId } = useParams();
  const [time, setTime] = useState(new Date());
  const [admisiones, setAdmisiones] = useState(null); // <-- aquí se guardan los datos desde Firestore
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

//Aqui traigo de firebase para el encabezado
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
//hasta aqui traigo de firebase

  const formattedDate = time.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = time.toLocaleTimeString('es-ES');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ffffff] via-[#EAF4FB] to-[#1a5784]">
      <div className="relative mb-1">
        <button
          onClick={() => window.history.back()}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#4b6bb3] text-white py-1 px-3 font-semibold rounded hover:bg-[#2b8d8f] shadow"
        >
          ← Volver
        </button>
        <h1 className="text-3xl text-[#5dbfc1] font-bold text-center">
          CONSENTIMIENTOS INFORMADOS
        </h1>
      </div>

      <div className=" min-h-screen bg-[#4e6fb5]/30 p-4">
        <header className="bg-[#ffffff]/70 rounded-md p-4 shadow-md text-black">
          <p className="absolute left-40 top-40  text-lg font-bold  ">
            {formattedTime}
          </p>
          <p className="absolute left-24 top-48 text-sm uppercase tracking-wide">
            {formattedDate.toUpperCase()}
          </p>

          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-9 text-sm">
            <div className="max-w-6xl mx-auto p-4">
              {/*la imagen de la clinica atlas y su fecha */}
              <img
                src="https://clinicas-atlas.com/wp-content/uploads/2024/11/clinicas-atlas-ecuador.png"
                alt="Imagen médica decorativa"
                className="w-48 h-auto mcx-auto mb-4"
              />
            </div>
           

{/* 🔄 Mostrar datos del citas o cargando */}
{loading ? (
              <p className="text-gray-600">Cargando datos de admisiones...</p>
            ) : admisiones ? (
              <>
                <div>
                  <strong>{admisiones.firstName} {admisiones.lastName}{' '} </strong><br/>
                  <strong>Identificacion:</strong> {admisiones.cedula}<br/>
                  <strong>Edad:</strong> {admisiones.seguro}<br/>
                   <strong>Médico:</strong> {admisiones.medico}<br/>
                   <strong>Fecha Nacimiento:</strong> {admisiones.secondaryData?.dateOfBirth || 'No registrado'}   <br/>
                   <strong>Días de estancia:</strong> {admisiones.dias}<br/>
                  
                </div>
                <div>
                <strong>Servicio:</strong> {admisiones.servicio}<br/>
                  <strong>Seguro:</strong> {admisiones.seguro}<br/>
                  <strong>Alertas:</strong> {admisiones.alergiaIconUno || 'No registrado'} {admisiones.alergiaUno || 'No registrado'}   <br/>
                  {admisiones.alergiaIconDos || ''} {admisiones.alergiaDos || ''} <br/>
                  {admisiones.alergiaIconTres || ''} {admisiones.alergiaTres || ''}
                   </div>
                   <div className=" bg-[#4b6bb3]/60 absolute rounded text-center p-4 text-white font-bold top-30 right-10">
                <strong>PISO:</strong> {admisiones.ubicacion.piso ||'No Reg'} <br/>
                  <strong></strong> {admisiones.ubicacion.habitacion ||'No Reg'} <br/>
                </div>
                
              </>
            ) : (
              <p className="text-red-600 font-bold">
                ❌ No se encontró información de admisiones.estoy arto
              </p>
            )}

            {/*HASTA AQUI DE FIREBASE */}


          </div>
        </header>

        <main className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="col-span-1 md:col-span-3 bg-white rounded-lg p-4 shadow"
          >
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold bg-[#162f5c] text-white text-sm inline-block px-4 py-2 rounded-full">
                CONSENTIMIENTOS INFORMADOS
              </h2>
            </div>
            <div className=" grid grid-cols-2 md:grid-cols-6 gap-4 ">
              {nombres.map((mod, index) => (
                <Button
                  key={index}
                  onClick={() => {
                    if (mod === '') {
                      navigate('/registro');
                    } else if (mod === '') {
                      navigate('/registro');
                    } else {
                      toast({
                        title: '🚧 Esta función no está implementada aún.',
                      });
                    }
                  }}
                  className="bg-[#dee6f1] text-[#1c396b] text-lg font-bold py-2 hover:bg-[#cfddec] transition rounded shadow"
                >
                  {mod}
                </Button>
              ))}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default MedicalModuleConsen;
