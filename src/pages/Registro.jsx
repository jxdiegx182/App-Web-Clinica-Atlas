import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Users,
  Clock,
} from 'lucide-react';
import Calendar from '../components/Calendar';
import AppointmentModal from '../components/AppointmentModal';
import { getCalendarDays, formatDate } from '../utils/dateUtils';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

function Registro() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointments, setAppointments] = useState({});
  const [time, setTime] = useState(new Date());
  const navigate = useNavigate();

  const formattedDate = time.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = time.toLocaleTimeString('es-ES');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const calendarDays = getCalendarDays(year, month);

  const monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleConfirmAppointment = async (
    date,
    time,
    patientData,
    originalTime = null
  ) => {
    const dateKey = formatDate(date);
    setAppointments((prev) => {
      const existingAppointments = prev[dateKey] || [];
      let updatedAppointments;

      if (originalTime) {
        updatedAppointments = existingAppointments.map((apt) =>
          apt.time === originalTime ? { time, ...patientData } : apt
        );
      } else {
        updatedAppointments = [
          ...existingAppointments,
          { time, ...patientData },
        ];
      }
      return {
        ...prev,
        [dateKey]: updatedAppointments,
      };
    });

    // 🔥 Guardar en Firestore
    try {
      await setDoc(doc(db, 'appointments', dateKey), {
        date: dateKey,
        citas: appointments[dateKey]
          ? [...appointments[dateKey], { time, ...patientData }]
          : [{ time, ...patientData }],
      });
    } catch (error) {
      console.error('Error guardando cita en Firestore:', error);
    }
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'appointments'));
        const data = {};
        querySnapshot.forEach((doc) => {
          data[doc.id] = doc.data().citas || [];
        });
        setAppointments(data);
        console.log('✅ Citas cargadas desde Firestore:', data);
      } catch (error) {
        console.error('❌ Error al cargar citas:', error);
      }
    };

    fetchAppointments();
  }, []);

  const handleDeleteAppointment = (date, time) => {
    const dateKey = formatDate(date);
    setAppointments((prev) => {
      const filteredAppointments = (prev[dateKey] || []).filter(
        (apt) => apt.time !== time
      );
      if (filteredAppointments.length === 0) {
        const { [dateKey]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [dateKey]: filteredAppointments };
    });
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const totalAppointments = Object.values(appointments).reduce(
    (total, dayAppointments) =>
      total + (Array.isArray(dayAppointments) ? dayAppointments.length : 0),
    0
  );

  const todayAppointments = (() => {
    const today = formatDate(new Date());
    const todayAppts = appointments[today] || [];
    return Array.isArray(todayAppts) ? todayAppts.length : 0;
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6f0ff] via-[#f8fbff] to-[#cde3ff] text-[#0E2942]">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <button
          onClick={() => window.history.back()}
          className="left-0 top-1/2 -translate-y-1/2 bg-[#4b6bb3] text-white font-semibold py-1 px-3 rounded-lg hover:bg-[#2b8d8f] shadow transition"
        >
          ← Volver
        </button>
        {/* Encabezado */}
        <div className="relative mb-6">
          <h1 className="text-4xl text-center font-extrabold text-[#5dbfc1] drop-shadow-sm">
            REGISTRO OPERATORIO
          </h1>
        </div>

        {/* Header */}
        <header className="bg-white/90 rounded-2xl shadow-md p-6 mb-8 backdrop-blur-sm border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="mx-40 ">
              <img
                src="https://clinicas-atlas.com/wp-content/uploads/2024/11/clinicas-atlas-ecuador.png"
                alt="Imagen médica decorativa"
                className="w-48 h-auto mx-auto mb-4"
              />
              
                
              
            </div>

            <div className="text-right">
              <p className="text-lg font-semibold">{formattedTime}</p>
              <p className="text-sm uppercase tracking-wide text-gray-600">
                {formattedDate.toUpperCase()}
              </p>
            </div>
          </div>
        </header>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition">
            <CalendarIcon className="mx-auto mb-2 text-blue-500" size={28} />
            <div className="text-2xl font-bold text-gray-900">
              {totalAppointments}
            </div>
            <div className="text-sm text-gray-600">Citas Programadas</div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition">
            <Users className="mx-auto mb-2 text-green-500" size={28} />
            <div className="text-2xl font-bold text-green-600">
              {todayAppointments}
            </div>
            <div className="text-sm text-gray-600">Citas Hoy</div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition">
            <Clock className="mx-auto mb-2 text-orange-500" size={28} />
            <div className="text-2xl font-bold text-orange-600">24 H</div>
            <div className="text-sm text-gray-600">Horario de Atención</div>
          </div>
        </div>

        {/* Calendario */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-[#edf4ff] to-[#f8fbff]">
            <button
              onClick={goToPreviousMonth}
              className="flex items-center px-3 py-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} className="mr-1" />
              Anterior
            </button>

            <h2 className="text-xl font-bold text-gray-900 tracking-wide">
              {monthNames[month]} {year}
            </h2>

            <button
              onClick={goToNextMonth}
              className="flex items-center px-3 py-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Siguiente
              <ChevronRight size={20} className="ml-1" />
            </button>
          </div>

          <div className="p-4">
            <Calendar
              days={calendarDays}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              appointments={appointments}
            />
          </div>
        </div>

        {/* Guía */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-2 border-gray-200">
            Cómo Agendar una Cita
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                num: 1,
                title: 'Selecciona una Fecha',
                desc: 'Haz clic en cualquier fecha disponible',
              },
              {
                num: 2,
                title: 'Elige tu Horario',
                desc: 'Selecciona un horario disponible',
              },
              {
                num: 3,
                title: 'Completa tus Datos',
                desc: 'Ingresa tu información personal',
              },
            ].map((step) => (
              <div key={step.num} className="flex items-start">
                <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center font-bold text-blue-600 mr-3 shadow-sm">
                  {step.num}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{step.title}</h4>
                  <p className="text-sm text-gray-600">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-4 border-t border-gray-200 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded mr-2"></div>
              <span className="text-gray-600">Cita Programada</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded mr-2"></div>
              <span className="text-gray-600">Horario Ocupado</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-100 rounded mr-2"></div>
              <span className="text-gray-600">Fecha Pasada</span>
            </div>
          </div>
        </div>

        {/* Modal de Citas */}
        <AppointmentModal
          isOpen={isModalOpen}
          selectedDate={selectedDate}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmAppointment}
          bookedSlots={appointments}
          onDeleteAppointment={handleDeleteAppointment}
        />
      </div>
    </div>
  );
}

export default Registro;
