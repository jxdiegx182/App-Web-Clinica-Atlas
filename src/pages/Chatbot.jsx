import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
function CalendarApp() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [time, setTime] = useState(new Date());
  const navigate = useNavigate();
  const handleDayClick = (day) => {
    navigate(`/cita?day=${day}&year=${selectedYear}`);
  };
  const formattedTime = time.toLocaleTimeString('es-ES');
  const formattedDate = time.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const renderCalendar = () => {
    const daysInMonth = 30;
    return (
      <div className="grid grid-cols-7 gap-2 mt-4">
        {Array.from({ length: daysInMonth }, (_, i) => (
          <div
            key={i}
            className="p-4 border text-center cursor-pointer rounded bg-gray-100 hover:bg-blue-300"
            onClick={() => handleDayClick(i + 1)}
          >
            {i + 1}
          </div>
        ))}
      </div>
    );
  };
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ffffff] via-[#ffffff] to-[#1a5784] ">
      {/* Encabezado */}
      <div className="relative mb-2">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 rounded-lg bg-[#1c3f6e] px-3 py-1.5 text-sm font-semibold text-white shadow transition hover:bg-[#007e8f]"
        >
          ← Volver
        </button>
        <h1 className="text-2xl text-[#007e8f] font-extrabold tracking-wide text-center">
          CHATBOT
        </h1>
      </div>

      {/* Fecha y Logo */}
      <header className="relative rounded-2xl border border-[#007e8f]/25 bg-white/85 p-2 md:p-3 shadow-md text-[#1c3f6e] backdrop-blur mb-4">
        <div className="mt-1 grid grid-cols-2 md:grid-cols-6 gap-9 text-sm">
          <div className="max-w-6xl mx-auto">
            <img
              src="https://clinicas-atlas.com/wp-content/uploads/2024/11/clinicas-atlas-ecuador.png"
              alt="Imagen médica decorativa"
              className="w-37 h-14"
            />
          </div>
          <div className="max-w-6xl mx-auto"></div>
          <div className="max-w-6xl mx-auto"></div>
          <div className="max-w-6xl mx-auto"></div>
          <div className="max-w-6xl mx-auto"></div>
          
          <div>
            <p className="text-lg  font-bold">{formattedTime}</p>
            <p className=" text-sm mr-10 uppercase tracking-wide">
              {formattedDate.toUpperCase()}
            </p>
          </div>
        </div>
      </header>
      <main className="flex justify-between items-start px-20 py-10 gap-8">
        {/* TEXTAREA A LA IZQUIERDA */}
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white shadow-lg p-6 w-1/2 rounded-3xl transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105"
        >
          <div className=" text-black bg-white">
            <label className=" font-bold text-md text-gray-700 block mb-2">
              {/* Puedes poner un título aquí si quieres */}
            </label>
            <textarea
              rows="6"
              placeholder="¡Hola! SOY TU ASISTENTE VIRTUAL ¡EN QUÉ PUEDO AYUDAR?"
              className=" w-full border border-gray-300 py-3 px-4 text-black text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-xl transition duration-300"
            />
          </div>
        </motion.div>

        {/* ANIMACIÓN A LA DERECHA */}
        <DotLottieReact
          src="https://lottie.host/f74c0cf3-0976-4b50-afb6-d340a24f4090/tHlrlKrybm.lottie"
          loop
          autoplay
        />
      </main>
    </div>
  );
}
export default CalendarApp;
