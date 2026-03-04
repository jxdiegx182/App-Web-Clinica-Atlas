import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const nombres = ['SUSPENDER'];

function CalendarApp() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [appointments, setAppointments] = useState({});
  const [time, setTime] = useState(new Date());

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDayClick = (day) => {
    navigate(`/cita?day=${day}&year=${selectedYear}`);
  };

  const formattedDate = time.toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const formattedTime = time.toLocaleTimeString('es-ES');

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

  return (
    <div className="min-h-screen bg-white p-4">
      {/* Encabezado */}
      <div className="relative mb-4">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 rounded-lg bg-[#1c3f6e] px-3 py-1.5 text-sm font-semibold text-white shadow transition hover:bg-[#007e8f]"
        >
          ← Volver
        </button>
        <h1 className="text-2xl text-[#007e8f] font-extrabold tracking-wide text-center">REGISTRO OPERATORIO</h1>
      </div>

      {/* Fecha y Logo */}
      <header className="relative rounded-2xl border border-[#007e8f]/25 bg-white/85 p-2 md:p-3 shadow-md text-[#1c3f6e] backdrop-blur mb-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="absolute left-36 top-1 text-lg font-bold">{formattedTime}</p>
            <p className="absolute left-24 top-20 text-sm uppercase tracking-wide">{formattedDate.toUpperCase()}</p>
          </div>

          <div className="absolute right-11 top-12 z-20">
            <div
              className="bg-[#4b6bb3]/60 text-white px-7 py-2 rounded hover:bg-[#87D1D4] flex items-center"
              title="Imprimir PDF">
              <img
                src="https://cdn-icons-png.flaticon.com/512/4659/4659495.png"
                alt="Imprimir"
                className="w-8 h-8"
              />
            </div>
          </div>

          <div className="mt-1 grid grid-cols-2 md:grid-cols-7 gap-9 text-sm">
            <div className="max-w-6xl mx-auto">
              <img
                src="https://clinicas-atlas.com/wp-content/uploads/2024/11/clinicas-atlas-ecuador.png"
                alt="Imagen médica decorativa"
                className="w-48 h-auto"
              />
            </div>
            
          </div>
        </div>
      </header>

      <main className="flex gap-6">
        {/* Panel izquierdo */}
        <div className="w-64">
          <h2 className="text-black text-lg font-bold mb-1">Año</h2>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-9 mt-5">
            {nombres.map((mod, index) => (
              <Button
                key={index}
                onClick={() => {
                  if (mod === 'SUSPENDER') {
                    toast({ title: "🚧 Cita suspendida." });
                  } else {
                    toast({ title: "🚧 Esta función no está implementada aún." });
                  }
                }}
                className="bg-[#dee6f1] text-[#1c396b] font-bold py-3 hover:bg-[#cfddec] transition rounded shadow"
              >
                {mod}
              </Button>
            ))}
          </div>
        </div>

        {/* Calendario */}
        <div className="text-black flex-1 bg-white p-4 rounded shadow">
                  
        <div className="mt-1 grid grid-cols-2 md:grid-cols-4 gap-9 text-sm">
                  <div className="mb-2 flex items-center gap-4">
                    <label className="font-bold text-base text-gray-700">HORA:</label>
                    <input
                      type="text"
                      placeholder="Ej: 10:30"
                      className="border rounded px-2 py-1 w-32 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </div>
                  <div className="mb-2 flex items-center gap-4">
                    <label className="font-bold text-base text-gray-700">TIEMPO:</label>
                    <input
                      type="text"
                      placeholder="Ej: 10:30"
                      className="border rounded px-2 py-1 w-32 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </div>
                  </div>
                          <div className="mt-2">
                            <label className="font-bold text-base text-gray-700 mb-2 block">OBSERVACIÓN:</label>
                            <textarea
                              rows="1"
                              placeholder="Escribe una observación..."
                              className="w-full border rounded p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                          </div>
                         
          
          {renderCalendar()}
        </div>
      </main>

      {/* Modal externo */}
      {showModal && (
        <ModalCita
          day={selectedDay}
          year={selectedYear}
          onClose={() => setShowModal(false)}
        />
      )}
      <div className="mt-2 flex gap-9 justify-center">
    <button className="bg-[#4b6bb3] text-white px-6 py-2 rounded hover:bg-[#3a5794] transition font-semibold shadow">
      GUARDAR
    </button>
    <button className="bg-gray-300 text-black px-6 py-2 rounded hover:bg-gray-400 transition font-semibold shadow">
      EDITAR
    </button>
  </div>

    </div>
    

  );
}

export default CalendarApp;

