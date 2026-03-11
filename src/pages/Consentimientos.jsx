import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { FileText, Clock, MapPin, AlertCircle } from 'lucide-react';
import { db } from '../firebaseConfig';
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
];

const MedicalModuleConsen = () => {
  const { mainId } = useParams();
  const [time, setTime] = useState(new Date());
  const [admisiones, setAdmisiones] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  const formattedDate = time.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = time.toLocaleTimeString('es-ES');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ffffff] via-[#EAF4FB] to-[#76c4d5] p-4">
      
      

      {/* TARJETA PRINCIPAL CON INFORMACIÓN */}
     

      {/* SECCIÓN DE CONSENTIMIENTOS */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-[#007e8f]/20 shadow-lg p-6"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#595759] to-[#595759]/90 text-white px-6 py-3 rounded-full inline-block">
            Consentimientos Disponibles
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {nombres.map((mod, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => {
                  toast({
                    title: `${mod}`,
                    description: 'Esta función se implementará pronto.',
                  });
                }}
                className="w-full bg-gradient-to-br from-[#76c4d5] to-[#76c4d5] text-[#ffffff] font-bold py-3 hover:from-[#4ea685] hover:to-[#76c4d5] transition-all shadow-md border border-[#007e8f]/20 rounded-lg text-xs md:text-sm"
              >
                {mod}
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default MedicalModuleConsen;

