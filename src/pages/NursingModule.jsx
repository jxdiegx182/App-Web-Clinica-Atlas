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

const nombrePrincipal = [
  'DESCARGO MEDICACION',
  'CARGO CUENTA',
  
];
const names = [
  'SIGNOS VITALES',
  'HIDRATACION',
  'INGESTA Y ELIMINACIÓN',
  'INFORME ENFERMERIA',
  'REGISTRO MEDICACION',
  'SCREEN RN',
  ];

 const namess = [
    'REGISTRO OXIGENO',
    'PRE QUIRURGICO ENFERMERIA',
    'INFORME RECUPERACION',
    'SOLICITUD DIETAS',
    'GUIA ENFERMERIA',
    'PARTE OPERATORIO',
    ];

    const NurseModulePanel = () => {
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
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const formattedTime = time.toLocaleTimeString('es-ES');

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-[#ffffff] via-[#EAF4FB] to-[#1a5784]">
      
      <div className="relative mb-1">
        <button
           onClick={() => window.history.back()}
           className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#4b6bb3] text-white font-semibold py-1 px-3 rounded hover:bg-[#2b8d8f] shadow"
          > 
          ← Volver
        </button>
      <h1 className="text-3xl text-[#5dbfc1] font-bold text-center">MODULO ENFERMERIA</h1>
        </div>
      
      <div className="min-h-screen bg-[#4b6bb3]/20 p-2">
      <header className="bg-[#ffffff]/90 rounded-md p-4 shadow-md text-[#0E2942]">
          
        
        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-9 text-sm">
        <div className="max-w-6xl mx-auto p-4">
            {/*la imagen de la clinica atlas y su fecha */}
               <img
                  src="https://clinicas-atlas.com/wp-content/uploads/2024/11/clinicas-atlas-ecuador.png"
                  alt="Imagen médica decorativa"
                  className="w-48 h-auto mcx-auto mb-4"
              />
          </div>
          
         
         

          <div className="bg-[#4b6bb3]/60 absolute rounded text-center p-4     text-white font-bold top-30 right-10">
                          PISO 2<br />
                          HAB 201
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
                  <strong>Alergias:</strong> {admisiones.secondaryData?.numero || 'No registrado'}   <br/>
                  
                
                </div>
                
              </>
            ) : (
              <p className="text-red-600 font-bold">
                ❌ No se encontró información de admisiones.estoy arto
              </p>
            )}

            {/*HASTA AQUI DE FIREBASE */}


        </div>
        <p className="absolute left-40 top-36  text-lg font-bold  ">
            {formattedTime}
          </p>
          <p className="absolute left-24 top-44 text-sm uppercase tracking-wide">
            {formattedDate.toUpperCase()}
          </p>
      </header>

      <main className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-white rounded-lg p-4 col-span-1 text-sm shadow">
                    <h2 className="font-semibold text-gray-800 mb-2">HISTORIAL DE INGRESOS</h2>
                    <div className="overflow-y-auto max-h-[250px] pr-2"> {/* contenedor con scroll */}
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
                        <p><strong>PESO:</strong> 70 KG</p>
                        <p><strong>TALLA:</strong> 1.60</p>
                        <p><strong>PULSO:</strong> 7</p>
                        <p><strong>TEMPERATURA:</strong> 36.5</p>
                        <p><strong>FRECUENCIA RESPIRATORIA:</strong> 23</p>
                        <p><strong>PRESIÓN ARTERIAL:</strong> 120/70</p>
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
                  MODULO ENFERMERIA
                </h2>
              </div>
              <div className="flex flex-col md:flex-row justify-center gap-20">
                            <div className=" mt-20 grid grid-cols-1 md:grid-cols-1 ">
                              {nombrePrincipal.map((mod, index) => (
                                <Button 
                                  key={index}
                                  onClick={() => {
                                    if (mod === '') {
                                      navigate('/evolucion');
                                    } else {
                                      toast({ title: "🚧 Esta función no está implementada aún." });
                                    } 
                                  }
                                  }
                                    className="bg-[#4b6bb3] text-[#FFFFFF] font-bold py-8 hover:bg-[#cfddec] transition rounded shadow"
                                  >
                                    {mod}
                                </Button>
                                  ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                              {names.map((mod, index) => (
                                <Button 
                                  key={index}
                                  onClick={() => {
                                    if (mod === 'EVOLUCION DIARIA Y PRESCRIPCION') {
                                      navigate('/evolucion');
                                    } else {
                                      toast({ title: "🚧 Esta función no está implementada aún." });
                                    } 
                                  }
                                  }
                                    className="bg-[#dee6f1] text-[#1c396b] font-bold py-2 hover:bg-[#cfddec] transition rounded shadow"
                                  >
                                    {mod}
                                </Button>
                                  ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                              {namess.map((mod, index) => (
                                <Button 
                                  key={index}
                                  onClick={() => {
                                    if (mod === 'EVOLUCION DIARIA Y PRESCRIPCION') {
                                      navigate('/evolucion');
                                    } else {
                                      toast({ title: "🚧 Esta función no está implementada aún." });
                                    } 
                                  }
                                  }
                                    className="bg-[#dee6f1] text-[#1c396b] font-bold py-2 hover:bg-[#cfddec] transition rounded shadow"
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

export default NurseModulePanel;
