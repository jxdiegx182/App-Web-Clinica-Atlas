import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import React, { useState } from 'react';
import {
  X, Clock, CheckCircle, User, Phone, Mail, FileText, Edit, MailCheck,  Trash2, Plus
} from 'lucide-react';
import { generateTimeSlots, formatDateDisplay } from '../utils/dateUtils';

const AppointmentModal = ({
  isOpen,
  selectedDate,
  onClose,
  onConfirm,
  bookedSlots,
  onDeleteAppointment
}) => {
  const [mode, setMode] = useState('list'); // 'list' | 'select-time' | 'form'
  const [selectedTime, setSelectedTime] = useState('');
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [patientData, setPatientData] = useState({
    patientNombre: '',
    patientEdad: '',
    patientCirujia: '',
    patientCirujano: '',
    patientAyudante: '',
    patientTiempo: '',
    patientTipo: '',
    patientQuirofano: '',




    patientCedula: '',
    patientTelefono: '',
    patientSeguro: '',
    patientEmail: '',
    reason: ''
  });
  const [errors, setErrors] = useState({});

  const timeSlots = generateTimeSlots();
  if (!isOpen || !selectedDate) return null;
  const dateKey = selectedDate.toISOString().split('T')[0];
  const existingAppointments = bookedSlots[dateKey] || [];

  const validateForm = () => {
    const newErrors = {};
    if (!patientData.patientNombre.trim()) {
      newErrors.patientNombre = 'El nombre es requerido';
    }
    if (!patientData.patientEdad.trim()) {
      newErrors.patientEdad = 'El nombre es requerido';
    }
    if (!patientData.patientCirujia.trim()) {
      newErrors.patientCirujia = 'Cirujia es requerida';
    }
    if (!patientData.patientCirujano.trim()) {
      newErrors.patientCirujano = 'Cirujano es requerido';
    }
    if (!patientData.patientAyudante.trim()) {
      newErrors.patientAyudante = 'Ayudante es requerido';
    }
    if (!patientData.patientTiempo.trim()) {
      newErrors.patientTiempo = 'Tiempo de cirujia es requerido';
    }
    if (!patientData.patientTipo.trim()) {
      newErrors.patientTipo = 'Tipo es requerida';
    }
    if (!patientData.patientQuirofano.trim()) {
      newErrors.patientQuirofano = 'Quirofano es requerido';
    }





    if (!patientData.patientCedula.trim()) {
      newErrors.patientCedula = 'La cedula es requerida';
    }
    if (!patientData.patientSeguro.trim()) {
      newErrors.patientSeguro = 'El seguro es requerido';
    }
    if (!patientData.patientTelefono.trim()) {
      newErrors.patientTelefono = 'El teléfono es requerido';
    } else if (!/^\d{10}$/.test(patientData.patientTelefono.replace(/\D/g, ''))) {
      newErrors.patientTelefono = 'Ingrese un teléfono válido (10 dígitos)';
    }
    if (!patientData.patientEmail.trim()) {
      newErrors.patientEmail = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(patientData.patientEmail)) {
      newErrors.patientEmail = 'Ingrese un email válido';
    }
    if (!patientData.reason.trim()) {
      newErrors.reason = 'El motivo de la consulta es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTimeSelect = (time) => {
    if (!isSlotBooked(time)) {
      setSelectedTime(time);
      setMode('form');
      setEditingAppointment(null);
    }
  };

  const handleConfirm = async () => {
    if (validateForm()) {
      try {
        // Guardar en Firestore
        await addDoc(collection(db, "citas"), {
          nombre: patientData.patientNombre,
          edad: patientData.patientEdad,
          cirujia: patientData.patientCirujia, 
          cirujano: patientData.patientCirujano,
          ayudante: patientData.patientAyudante,
          tiempo: patientData.patientTiempo,
          tipo: patientData.patientTipo,
          quirofano: patientData.patientQuirofano,






          cedula: patientData.patientCedula || "000910000",
          medico: patientData.medico || "Dr. Fabricio Picoita",
          especialidad: patientData.especialidad || "Medicina Crítica",
          telefono: patientData.patientTelefono,
          seguro: patientData.patientSeguro,
          email: patientData.patientEmail,
          motivo: patientData.reason,
          fecha: selectedDate.toISOString().split("T")[0],
          hora: selectedTime,
          estado: "En Atención",
          timestamp: new Date()
        });
  
        if (editingAppointment) {
          onConfirm(selectedDate, selectedTime, patientData, editingAppointment.originalTime);
        } else {
          onConfirm(selectedDate, selectedTime, patientData);
        }
  
        handleClose();
        alert("✅ Cita guardada correctamente en Firestore");
      } catch (error) {
        console.error("Error al guardar en Firestore:", error);
        alert("❌ Error al guardar en Firestore");
      }
    }
  };

  const handleEditAppointment = (appointment) => {
    setEditingAppointment({ ...appointment, originalTime: appointment.time });
    setSelectedTime(appointment.time);
    setPatientData({
      patientNombre: appointment.patientNombre,
      patientEdad: appointment.patientEdad,
      patientCirujia: appointment.patientCirujia,
      patientCirujano: appointment.patientCirujano,
      patientAyudante: appointment.patientAyudante,
      patientTiempo: appointment.patientTiempo,
      patientTipo: appointment.patientTipo,
      patientQuirofano: appointment.patientQuirofano,






      patientCedula: appointment.patientCedula,
      patientTelefono: appointment.patientTelefono,
      patientSeguro: appointment.patientSeguro,
      patientEmail: appointment.patientEmail,
      reason: appointment.reason
    });
    setMode('form');
  };

  const handleDeleteAppointment = (time) => {
    onDeleteAppointment(selectedDate, time);
  };

  const handleClose = () => {
    setSelectedTime('');
    setPatientData({
      patientNombre: '',
      patientEdad: '',
      patientCirujia: '',
      patientCirujano: '',
      patientAyudante: '',
      patientTiempo: '',
      patientTipo: '',
      patientQuirofano: '',







      patientCedula: '',
      patientTelefono: '',
      patientSeguro: '',
      patientEmail: '',
      reason: ''
    });
    setErrors({});
    setEditingAppointment(null);
    setMode('list');
    onClose();
  };

  const handleInputChange = (field, value) => {
    setPatientData((prev) => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const isSlotBooked = (time) => {
    return existingAppointments.some((appointment) => appointment.time === time);
  };

  const renderTitle = () => {
    if (mode === 'form') return editingAppointment ? '✏️ Modificar Cita' : '📋 Datos del Paciente';
    if (mode === 'select-time') return '🕑 Seleccionar Horario';
    return existingAppointments.length > 0 ? '📅 Cirugías del Día' : '📅 Sin Cirugías Programadas';
  };
  const goBack = () => {
    if (mode === 'form') {
      setMode('select-time');
    } else {
      setMode('list');
    }
    setSelectedTime('');
    setEditingAppointment(null);
    setErrors({});
  };

  const addNewAppointment = () => {
    setSelectedTime('');
    setEditingAppointment(null);
    setPatientData({
      patientNombre: '',
      patientEdad: '',
      patientCirujia: '',
      patientCirujano: '',
      patientAyudante: '',
      patientTiempo: '',
      patientTipo: '',
      patientQuirofano: '',






      patientCedula: '',
      patientTelefono: '',
      patientSeguro: '',
      patientEmail: '',
      reason: ''
    });
    setErrors({});
    setMode('select-time');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{renderTitle()}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {formatDateDisplay(selectedDate)}
              {selectedTime && ` - ${selectedTime}`}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {mode === 'list' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Citas Programadas ({existingAppointments.length})
                </h3>
                <button
                  onClick={addNewAppointment}
                  className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  <Plus size={16} className="mr-1" />
                  Nueva Cita
                </button>
              </div>

              {existingAppointments.map((appointment, index) => (
                <div
                  key={index}
                  className="bg-green-50 rounded-lg p-4 border border-green-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Clock className="text-green-600 mr-2" size={16} />
                        <span className="font-semibold text-green-800">
                          {appointment.time}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-1">
                        <strong>Paciente:</strong> {appointment.patientNombre}
                      </p>
                      <p className="text-gray-700 mb-1">
                        <strong>Edad:</strong> {appointment.patientEdad}
                      </p>
                      <p className="text-gray-700 mb-1">
                        <strong>Cirujia:</strong> {appointment.patientCirujia}
                      </p>
                      <p className="text-gray-700 mb-1">
                        <strong>Cirujano:</strong> {appointment.patientCirujano}
                      </p>
                      <p className="text-gray-700 mb-1">
                        <strong>Ayudante:</strong> {appointment.patientAyudante}
                      </p>
                      <p className="text-gray-700 mb-1">
                        <strong>Tiempo:</strong> {appointment.patientTiempo}
                      </p>
                      <p className="text-gray-700 mb-1">
                        <strong>Tipo:</strong> {appointment.patientTipo}
                      </p>
                      <p className="text-gray-700 mb-1">
                        <strong>Quirofano:</strong> {appointment.patientQuirofano}
                      </p>













                      <p className="text-gray-700 mb-1">
                        <strong>Cedula:</strong> {appointment.patientCedula}
                      </p>
                      <p className="text-gray-700 mb-1">
                        <strong>Teléfono:</strong> {appointment.patientTelefono}
                      </p>
                      <p className="text-gray-700 mb-1">
                        <strong>Seguro:</strong> {appointment.patientSeguro}
                      </p>
                      <p className="text-gray-700 mb-1">
                        <strong>Email:</strong> {appointment.patientEmail}
                      </p>
                      <p className="text-gray-700">
                        <strong>Motivo:</strong> {appointment.reason}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => handleEditAppointment(appointment)}
                        className="flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm"
                      >
                        <Edit size={14} className="mr-1" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteAppointment(appointment.time)}
                        className="flex items-center px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
                      >
                        <Trash2 size={14} className="mr-1" />
                        Eliminar
                      </button>
                      <button
                        onClick={() => enviarSms(appointment)}
                        className="flex items-center px-2 py-1 bg-blue-10 text-black rounded hover:bg-blue-200 transition-colors text-sm"
                      >
                        <MailCheck size={14} className="mr-1" />
                        Enviar SMS
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {mode === 'select-time' && (
            <>
              <div className="flex items-center mb-4">
                <Clock className="text-blue-500 mr-2" size={20} />
                <span className="text-sm font-medium text-gray-700">
                  Horarios Disponibles
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {timeSlots.map((time) => {
                  const isBooked = isSlotBooked(time);
                  return (
                    <button
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      disabled={isBooked}
                      className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isBooked
                          ? 'bg-red-100 text-red-600 cursor-not-allowed border-2 border-red-300'
                          : 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:scale-105 border-2 border-transparent hover:border-blue-200'
                      }`}
                    >
                      {time}
                      {isBooked && (
                        <div className="text-xs mt-1 font-semibold">OCUPADO</div>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4">
                <button
                  onClick={goBack}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Volver
                </button>
              </div>
            </>
          )}

          {mode === 'form' && (
            <>
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>{editingAppointment ? 'Modificando cita:' : 'Horario seleccionado:'}</strong>{' '}
                  {selectedTime} - {formatDateDisplay(selectedDate)}
                </p>
              </div>
              {/* Campos del formulario (los tuyos originales) */}
              {['patientNombre', 'patientEdad', 'patientCirujia', 'patientCirujano', 'patientAyudante', 'patientTiempo', 'patientTipo', 'patientQuirofano', 'patientCedula', 'patientTelefono', 'patientSeguro', 'patientEmail', 'reason'].map((field) => (
                <div key={field}>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    {field === 'patientNombre' && <User size={16} className="mr-2" />}
                    {field === 'patientEdad'}
                    {field === 'patientCirujia'}
                    {field === 'patientCirujano'}
                    {field === 'patientAyudante'}
                    {field === 'patientTiempo'}
                    {field === 'patientTipo'}
                    {field === 'patientQuirofano'}
                   
                   

                    {field === 'patientCedula'}
                    {field === 'patientTelefono' && <Phone size={16} className="mr-2" />}
                    {field === 'patientSeguro'}
                    {field === 'patientEmail' && <Mail size={16} className="mr-2" />}
                    {field === 'reason' && <FileText size={16} className="mr-2" />}
                    {field === 'reason' ? 'Motivo de la consulta *' : `${field.replace('patient', '')} *`}
                  </label>
                  {field === 'reason' ? (
                    <textarea
                      value={patientData[field]}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      rows={3}
                      className={`text-black w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                        errors[field] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Describa brevemente el motivo de la consulta"
                    />
                  ) : (
                    <input
                      type={field === 'patientEmail' ? 'email' : 'text'}
                      value={patientData[field]}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      className={`text-black w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors[field] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={`Ingrese ${field === 'patientTelefono' ? 'un teléfono válido' : 'el dato'}`}
                    />
                  )}
                  {errors[field] && (
                    <p className="text-red-500 text-xs mt-1">{errors[field]}</p>
                  )}
                </div>
              ))}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={goBack}
                  className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Volver
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md"
                >
                  {editingAppointment ? 'Actualizar Cita' : 'Guardar Cita'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentModal;
