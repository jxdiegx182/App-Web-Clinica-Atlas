import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  User,
  Activity,
  Stethoscope,
  Pill,
  PanelTopOpen,
} from 'lucide-react';

const AnimatedNumber = ({ value }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 40;
    const increment = value / (duration / 160);

    const counter = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplay(value);
        clearInterval(counter);
      } else {
        setDisplay(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(counter);
  }, [value]);

  return <span>{display}</span>;
};

const formatearFechaHora = (fecha) => {
  return new Intl.DateTimeFormat('es-EC', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(fecha);
};

const DashboardHeader = ({
  isAdminUser,
  profile,
  user,
  role,
  handleLogout,
  fechaHoraActual,
  camasOcupadas,
  TOTAL_CAMAS,
  porcentajeOcupacion,
  totalTerapiaIntensiva,
  totalAltasMedicas,
  totalQuirofano,
  searchTerm,
  setSearchTerm,
}) => {
  const navigate = useNavigate();

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow p-1"
      >
        <div className="max-w-9xl mx-[0.3rem] flex justify-between items-center">
          <div className="flex-1 ml-[21rem] pointer-events-none select-none text-[#4ea685] font-bold text-3xl text-center">
            RACK HOSPITALARIO
          </div>

          <div className="relative z-20 flex items-center gap-2">
            {isAdminUser && (
              <div className="flex gap-3">
                <Button
                  title="Ir a Farmacia"
                  onClick={() => navigate('/farmacia')}
                  className="relative z-50 text-white h-10 px-5 rounded-xl bg-[#69c9ba] font-bold hover:bg-[#4ea685] shadow-md"
                >
                  <Pill className="text-white w-6 h-6 text-[#000000]/60 font-bold" />
                </Button>
                <Button
                  title="Ir a Panel Administrativo"
                  onClick={() => navigate('/Panel-Administrativo')}
                  className="relative z-50 h-10 px-5 rounded-xl bg-[#69c9ba] font-bold hover:bg-[#4ea685] shadow-md"
                >
                  <PanelTopOpen className="text-[#000000]/60 w-6 h-6 " />
                </Button>
              </div>
            )}
            <div className="text-[0.8rem] text-gray-700 font-medium flex items-right gap-1">
              <User className="w-8 h-8" />
              {profile?.nombre || user?.email || 'Usuario'}<br />
              {role ? ` (${role})` : ''}
            </div>

            <Button
              title="Salir del sistema"
              onClick={handleLogout}
              variant="outline"
              className="h-10 px-5 rounded-xl border-[#69c9ba] bg-[#69c9ba] text-[#000000]/60 font-bold hover:bg-[#4ea685] shadow-md"
            >
              <LogOut className=" w-4 h-4 mr-2 text-[#000000]/60 font-bold" /> Salir
            </Button>
          </div>
        </div>
      </motion.header>

      <header className="grid grid-cols-3 items-center px-8 py-6 backdrop-blur-xl bg-white/70 border-b border-gray-200 shadow-sm ">
        {/* IZQUIERDA */}
        <div className="flex flex-col">
          <img
            src="https://clinicas-atlas.com/wp-content/uploads/2024/11/clinicas-atlas-ecuador.png"
            alt="Logo"
            className="w-44"
          />
          <span className="text-gray-500 text-sm mt-2 tracking-wide">
            {formatearFechaHora(fechaHoraActual)}
          </span>
        </div>

        {/* CENTRO KPIs */}
        <div className="flex justify-center">
          <div className="flex gap-3">
            {/*++++++++++++++++++++++++++++++++++++++++++++++++ OCUPACIÓN CAMAS++++++++++++++++++++++++++++++++++++++++++++++++ */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="relative w-30  p-2 rounded-3xl bg-gradient-to-br from-[#e6f6f6] to-white text-[#007e8f] shadow-lg border border-[#bde3e3]"
            >
              <div className="text-xs text-gray-500 uppercase tracking-wider">
                Ocupación de Camas
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="text-4xl font-bold text-blue-600">
                  <AnimatedNumber value={camasOcupadas} />
                  <span className="text-lg text-gray-500 font-medium">
                    {' '}
                    / {TOTAL_CAMAS}
                  </span>
                </div>

                <div className="text-blue-500 text-sm font-semibold">
                  {porcentajeOcupacion}%
                </div>
              </div>

              {/* Barra progreso */}
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${porcentajeOcupacion}%` }}
                  transition={{ duration: 0.8 }}
                  className={`h-2 rounded-full ${
                    porcentajeOcupacion > 80
                      ? 'bg-red-500'
                      : porcentajeOcupacion > 60
                        ? 'bg-yellow-500'
                        : 'bg-blue-500'
                  }`}
                />
              </div>

              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-blue-500 rounded-full" />
            </motion.div>
            {/*++++++++++++++++++++++++++++++++++++++++++++++++ OCUPACIÓN CAMAS++++++++++++++++++++++++++++++++++++++++++++++++ */}

            {/* ++++++++++++++++++++++++++++++++++++++TERAPIA INTENSIVA++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="relative w-40 p-2 rounded-3xl bg-gradient-to-br from-orange-50 to-white shadow-lg border border-orange-100"
            >
              <div className="text-xs text-gray-500 uppercase tracking-wider">
                Terapia Intensiva
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="text-4xl font-bold text-orange-600">
                  <AnimatedNumber value={totalTerapiaIntensiva} />
                </div>

                <div className="text-orange-600 text-sm font-semibold">
                  Críticos
                </div>
              </div>

              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-orange-500 rounded-b-2xl" />
            </motion.div>
            {/* ++++++++++++++++++++++++++++++++++++++TERAPIA INTENSIVA++++++++++++++++++++++++++++++++++++++++++++++++++++ */}

            {/* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ALTAS++++++++++++++++++++++++++++++++++++++++++++ */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="relative w-40 p-2 rounded-3xl bg-gradient-to-br from-[#e6f6f6] to-white shadow-lg border border-green-100"
            >
              <div className="text-xs text-gray-500 uppercase tracking-wider">
                Altas Médicas
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="text-4xl font-bold text-[#008C8C]">
                  <AnimatedNumber value={totalAltasMedicas} />
                </div>

                <div className="text-[#008C8C] text-sm font-semibold">
                  + Activas
                </div>
              </div>

              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-[#008C8C] rounded-b-3xl" />
            </motion.div>
            {/* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ALTAS++++++++++++++++++++++++++++++++++++++++++++ */}

            {/* +++++++++++++++++++++++++++++++++++++++++++QUIRÓFANO+++++++++++++++++++++++++++++++++++++++++++++++++ */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="relative w-40 p-2 rounded-3xl bg-gradient-to-br from-[#e0f2f2] to-white shadow-lg border border-purple-100 "
            >
              <div className="text-xs text-gray-500 uppercase tracking-wider">
                En Quirófano
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="text-4xl font-bold text-purple-600">
                  <AnimatedNumber value={totalQuirofano} />
                </div>

                <div className="text-purple-500 text-sm font-semibold">
                  En proceso
                </div>
              </div>

              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-purple-500 rounded-full" />
            </motion.div>
          </div>
        </div>
        {/* +++++++++++++++++++++++++++++++++++++++++++QUIRÓFANO+++++++++++++++++++++++++++++++++++++++++++++++++ */}

        {/* DERECHA */}
        <div className="flex flex-col items-end gap-4">
          <div className="flex gap-4">
            <Button
              className="text-white h-10 px-5 rounded-xl bg-[#69c9ba] hover:bg-[#595759] shadow-md"
              onClick={() => navigate('/ParteOperatorio')}
            >
              <Activity className="text-white w-4 h-4 mr-2" />
              Parte Operatorio
            </Button>

            <Button
              className=" text-white h-10 px-5 rounded-xl bg-[#69c9ba] hover:bg-[#595759] shadow-md"
              onClick={() => navigate('/admision')}
            >
              <Stethoscope className="w-4 h-4 mr-2" />
              Admisión
            </Button>
          </div>

          <Input
            type="text"
            placeholder="Buscar paciente o médico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#007e8f]/60"
          />
        </div>
      </header>
    </>
  );
};

export default DashboardHeader;
