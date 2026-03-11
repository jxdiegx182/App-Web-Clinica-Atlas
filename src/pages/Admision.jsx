import {
  collection,
  query,
  where,
  orderBy,
  startAt,
  endAt,
  getDocs,
} from 'firebase/firestore';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { NavBar } from '@/components/ui/tubelight-navbar'; // 👈 corregí la ruta
import { addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
//borrar si sale mal
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  IconBrandGithub,
  IconBrandGoogle,
  IconBrandOnlyfans,
} from '@tabler/icons-react';

function Admision() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [time, setTime] = useState(new Date());
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Datos principales');
  //ESTA CONSTANTE ALMACENA LOS DATOS DE INGRESO
  const [mainData, setMainData] = useState({
    firstName: '',
    firstName_lower: '',
    lastName: '',
    lastName_lower: '',
    idType: '',
    cedula: '',
    phone: '',
    gender: '',
    maritalStatus: '',
    servicio: '',
     ubicacion: {
        piso: '',
        habitacion: '',
                },
    seguro: '',
    medico: '',
  });
  const [secondaryData, setSecondaryData] = useState({
    nacionalidad: '',
    placeOfBirth: '',
    dateOfBirth: '',
    country: '',
    province: '',
    canton: '',
    direccion: '',
    calleprin: '',
    callesecun: '',
    numero: '',
    referencia: '',
    ocupacion: '',
    instituto: '',
    puesto: '',
    descripcion: '',
    correo: '',
  });
  // Items para el NavBar
  const navItems = [
    { name: 'Datos principales' },
    { name: 'Datos complementarios' },
  ];
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [docId, setDocId] = useState(null);
  const [ingresoHistorial, setIngresoHistorial] = useState([]);
//handleMainChange
  const handleMainChange = (e) => {
    const { name, value } = e.target;
    setMainData((prev) => ({ ...prev, [name]: value }));
  };
//handleSecondaryChange
  const handleSecondaryChange = (e) => {
    const { name, value } = e.target;
    setSecondaryData((prev) => ({ ...prev, [name]: value }));
  };

  //aqui le fusiono CON FIREBASE TODO EL PROCESO CON NOMBRE DE ADMISI ONES DESDE AQUI HASTA//
  const handleMainSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSave = {
        mainData: {
          ...mainData,
          firstName_lower: mainData.firstName.toLowerCase(),
          lastName_lower: mainData.lastName.toLowerCase(),
        },
        admitido: false,
        createdAt: serverTimestamp(),
      };

      if (docId) {
        // 🔁 ACTUALIZAR PACIENTE EXISTENTE
        await updateDoc(doc(db, 'admisiones', docId), dataToSave);
        alert('✅ DATOS DEL PACIENTE ACTUALIZADOS');
        
      } else {
        // 🆕 CREAR NUEVO PACIENTE ADDDOC +++++++++++++++++++ IMPORTANTE
        const docRef = await addDoc(collection(db, 'admisiones'), dataToSave);

        setDocId(docRef.id);
        alert('✅ PACIENTE CREADO CORRECTAMENTE');
      }
    } catch (error) {
      console.error('Firebase error:', error);
      alert('❌ Error al guardar datos principales');
    }
  };

  //AQUI LO QUE ES FIREBASE CONFIGURACION ADMI SIONES
  //aqui EN CAMBIO GUARDA LOS datos complementarios
  const handleSecondarySubmit = async (e) => {
    e.preventDefault();
    if (!docId) {
      alert('Primero guarda los datos principales');
      return;
    }
    try {
      await updateDoc(doc(db, 'admisiones', docId), {
        secondaryData,
        updatedAt: serverTimestamp(),
      });
      //RESETEAR LOS DATOS PRINCIPALES Y SECUNDARIOS
      setMainData({
        firstName: '',
        lastName: '',
        idType: '',
        cedula: '',
        idNumber: '',
        phone: '',
        gender: '',
        maritalStatus: '',
        servicio: '',
        ubicacion: {
          piso: '',
          habitacion: '',
                  },
        insurance: '',
        medico: '',
      });

      setSecondaryData({
        nacionalidad: '',
        placeOfBirth: '',
        dateOfBirth: '',
        country: '',
        province: '',
        canton: '',
        direccion: '',
        calleprin: '',
        callesecun: '',
        numero: '',
        referencia: '',
        ocupacion: '',
        instituto: '',
        puesto: '',
        descripcion: '',
        correo: '',
      });
      setDocId(null);
      setActiveTab('Datos principales');
      //RESETEAR LOS DATOS PRINCIPALES Y SECUNDARIOS

      alert('✅ Datos complementarios guardados');
    } catch (error) {
      console.error('Firebase error:', error.code, error.message);
      alert('❌ Error al guardar datos complementarios');
    }
  };
  //hasta aqui guardar los datos complementarios
  //aqui admito  o no al paciente con el boton admitir paciente
  const handleAdmitirPaciente = async () => {
    if (!docId) {
      alert('Primero debes guardar los datos del paciente');
      return;
    }
    try {
      // Actualizar documento principal
      await updateDoc(doc(db, 'admisiones', docId), {
        admitido: true,
        admittedAt: serverTimestamp(),
      });

      // Guardar en historial de ingresos (sub-colección)
      const ingresoHistorialRef = collection(db, 'admisiones', docId, 'ingreso_historial');
      await addDoc(ingresoHistorialRef, {
        admitido: true,
        admittedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        servicio: mainData.servicio || '',
        medico: mainData.medico || '',
        ubicacion: mainData.ubicacion || {},
      });

      alert('✅ Paciente admitido correctamente');
    } catch (error) {
      console.error(error);
      alert('❌ Error al admitir paciente');
    }
  };


  //FUNCION DE BUSQUEDA EN FIRESTORE CLAVE++++++++++++++++++++++++++++++++++++++++++++
  const searchPatients = async (text, field) => {
    if (!text || text.length < 2) {
      setSearchResults([]);
      return;
    }
    //aqui pongo cambiar la busqueda a minusculas
    const searchText = text.toLowerCase();
    const q = query(
      collection(db, 'admisiones'),
      orderBy(`mainData.${field}`),
      startAt(searchText),
      endAt(searchText + '\uf8ff')
    );

    const querySnapshot = await getDocs(q);

    const results = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    //hasta aqui cambio de busqueda a minusculas
    setSearchResults(results);
  };
  //FIN DE BUSQUEDA EN FIRESTORE

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 🆕 Cargar historial de ingresos desde Firebase
  useEffect(() => {
    const loadIngresoHistorial = async () => {
      if (!docId) return;

      try {
        const ingresoHistorialRef = collection(db, 'admisiones', docId, 'ingreso_historial');
        const q = query(ingresoHistorialRef, orderBy('admittedAt', 'desc'));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          console.log('📋 Historial de Ingresos: No hay registros');
          setIngresoHistorial([]);
          return;
        }

        const historial = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log('✅ Historial de Ingresos cargado:', historial);
        setIngresoHistorial(historial);
      } catch (error) {
        console.error('Error al cargar historial de ingresos:', error);
      }
    };
    loadIngresoHistorial();
  }, [docId]);

  const handleDayClick = (day) => {
    navigate(`/cita?day=${day}&year=${selectedYear}`);
  };

  const formattedDate = time.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = time.toLocaleTimeString('es-ES');
  //esta parte es el sombreado azul de las casillas
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted');
  };
  //hasta aqui
  return (
    <div className="min-h-screen bg-white p-4">
      {/* Encabezado */}
      <div className="relative mb-2">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 rounded-lg bg-[#1c3f6e] px-3 py-1.5 text-sm font-semibold text-white shadow transition hover:bg-[#007e8f]"
        >
          ← Volver
        </button>
        <h1 className="text-2xl text-[#007e8f] font-extrabold tracking-wide text-center">
          ADMISION CLINICA
        </h1>
      </div>
      {/* Panel izquierdo */}
      <main className="flex gap-4">
        {/* Fecha y Logo */}

        <div className="flex flex-col items-center">
          <div>
            <p className="text-black text-lg ">{formattedTime}</p>
            <p className="text-black text-sm">{formattedDate.toUpperCase()}</p>
          </div>
          <div className="mt-1 text-sm">
            <div className="max-w-6xl mx-auto">
              <img
                src="https://clinicas-atlas.com/wp-content/uploads/2024/11/clinicas-atlas-ecuador.png"
                alt="Imagen médica decorativa"
                className="w-40 h-16"
              />
            </div>
          </div>
          <div className="mt-1 text-sm">
            <div className="max-w-6xl mx-auto">
              <img
                src="https://static.vecteezy.com/system/resources/previews/004/996/073/non_2x/face-recognition-and-identification-line-icon-face-id-line-icon-facial-scan-and-identification-facial-recognition-system-sign-biometric-facial-detection-pictogram-illustration-vector.jpg"
                alt="Imagen médica decorativa"
                className="w-40 h-30"
              />
            </div>
          </div>
          <Button
            className="mt-3 mb-2 bg-[#4b6bb3]/90 text-white hover:bg-[#cfddec] transition rounded shadow flex items-center"
            onClick={() =>
              toast({
                title: '🚧 Esta función no está implementada aún.',
              })
            }
          >
            EDITAR
          </Button>
          <Button
            className="mb-2 bg-[#4b6bb3]/90 text-white hover:bg-[#cfddec] transition rounded shadow flex items-center"
            onClick={() =>
              toast({
                title: '🚧 Esta función no está implementada aún.',
              })
            }
          >
            GUARDAR
          </Button>
          <Button
            className="mb-2 bg-[#4b6bb3]/90 text-white hover:bg-[#cfddec] transition rounded shadow flex items-center"
            onClick={() =>
              toast({
                title: '🚧 Esta función no está implementada aún.',
              })
            }
          >
            DATOS DE FACTURACIÓN
          </Button>
          <Button
            className="mb-2 bg-[#4b6bb3]/60 text-white hover:bg-[#cfddec] transition rounded shadow flex items-center"
            onClick={() =>
              toast({ title: '🚧 Esta función no está implementada aún.' })
            }
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/4659/4659495.png"
              alt="Imprimir"
              className="w-8 h-8"
            />
          </Button>
          <Button
            className="mb-2 bg-[#4b6bb3]/90 text-white hover:bg-[#cfddec] transition rounded shadow flex items-center"
            onClick={handleAdmitirPaciente}
          >
            ADMITIR PACIENTE
          </Button>
        </div>
        {/* ADQUICICION DE DATOS*/}
        {/* Sección de formularios */}
        <div className="p-1 mt-5 bg-gray-100 w-full">
          {/* NavBar integrado */}
          {/**AQUI va NavBar CAMBIO NavBar */}
          <NavBar
            items={navItems}
            className="mr-32 w-[33%]"
            onChange={setActiveTab} // 👈 importante para cambiar entre tabs
          />
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 1 }}
            transition={{ duration: 0.5 }}
            className="p-10"
          >
            <div className="p-1">
              {activeTab === 'Datos principales' && (
                <form
                  onSubmit={handleMainSubmit}
                  className="text-black space-y-2"
                >
                  {/**AQUI ES EL CAMBIO PARA QUE LEA EN FIRESTORE LA BUSQUEDA AL INGRESAR EL NOMBRE */}
                  <Input
                    type="text"
                    name="firstName"
                    placeholder="Nombres"
                    value={mainData.firstName}
                    onChange={(e) => {
                      handleMainChange(e);
                      searchPatients(e.target.value, 'firstName_lower');
                    }}
                    className=" bg-white text-black border border-gray-300  rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {/**HASTA AQUI LEA EN FIRESTORE LA BUSQUEDA AL INGRESAR EL NOMBRE */}
                  <Input
                    type="text"
                    name="lastName"
                    placeholder="Apellidos"
                    value={mainData.lastName}
                    onChange={(e) => {
                      handleMainChange(e);
                      searchPatients(e.target.value, 'lastName_lower');
                    }}
                    className="w-full p-1 border rounded"
                  />
                  {/**AQUI EMPIEZA MOSTRAR LOS RESULTADOS DE LA BUSQUEDA POR APELLIDO */}
                  {searchResults.length > 0 && (
                    <div className="border rounded bg-white shadow max-h-40 overflow-y-auto">
                      {searchResults.map((patient) => (
                        <div
                          key={patient.cedula}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setMainData(prev => ({
                              ...prev,
                              ...patient.mainData,
                              ubicacion: {
                                piso: patient.mainData?.ubicacion?.piso || '',
                                habitacion: patient.mainData?.ubicacion?.habitacion || ''
                              }
                            }));
                            setSecondaryData(patient.secondaryData || {});
                            setDocId(patient.id); // 🔥 CLAVE ABSOLUTA
                            setSearchResults([]);
                          }}
                        >
                          <strong>
                            {patient.mainData.firstName}{' '}
                            {patient.mainData.lastName}{' '}
                            {patient.mainData.cedula}
                          </strong>{' '}
                        </div>
                      ))}
                    </div>
                  )}

                  {/**HASTA AQUI LEA EN FIRESTORE LA BUSQUEDA AL INGRESAR EL APELLIDO */}

                  <div className="flex items-center gap-4">
                    <h1 className="whitespace-nowrap text-sm font-medium">
                      Tipo Identificación
                    </h1>
                    <select
                      name="idType"
                      value={mainData.idType}
                      onChange={handleMainChange}
                      className="w-full max-w-[500px] border border-[#007e8f]/40 rounded-md px-3 py-1 text-sm text-gray-800 
                    focus:ring-2 focus:ring-[#007e8f]/60 focus:border-[#007e8f] transition"
                    >
                      <option value="Cedula">Cédula</option>
                      <option value="Pasaporte">Pasaporte</option>
                      <option value="Temporal">Temporal</option>
                    </select>
                  </div>

                  <Input
                    type="text"
                    name="cedula"
                    placeholder="(Cedula)"
                    value={mainData.cedula}
                    onChange={(e) => {
                      handleMainChange(e);
                      searchPatients(e.target.value, 'cedula');
                    }}
                    className="w-full p-1 border rounded"
                  />

                  <Input
                    type="text"
                    name="phone"
                    placeholder="Telefono"
                    value={mainData.phone}
                    onChange={handleMainChange}
                    className="w-full p-1 border rounded"
                  />

                  <div className="flex items-center gap-4">
                    <h1 className="whitespace-nowrap text-sm font-medium">
                      Genero
                    </h1>
                    <select
                      name="gender"
                      value={mainData.gender}
                      onChange={handleMainChange}
                      className="w-full max-w-[500px] border border-[#007e8f]/40 rounded-md px-3 py-1 text-sm text-gray-800 
                    focus:ring-2 focus:ring-[#007e8f]/60 focus:border-[#007e8f] transition"
                    >
                      <option value="Masculino">Hombre</option>
                      <option value="Femenino">Mujer</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <h1 className="whitespace-nowrap text-sm font-medium">
                      Estado civil
                    </h1>
                    <select
                      name="maritalStatus"
                      value={mainData.maritalStatus}
                      onChange={handleMainChange}
                      className="w-full max-w-[500px] border border-[#007e8f]/40 rounded-md px-3 py-1 text-sm text-gray-800 
                    focus:ring-2 focus:ring-[#007e8f]/60 focus:border-[#007e8f] transition"
                    >
                      <option value="">Estado Civil</option>
                      <option value="Single">Soltero</option>
                      <option value="Married">Casado</option>
                      <option value="Divorced">Divorciado</option>
                      <option value="Widowed">Apegado</option>
                    </select>
                  </div>
                  <Input
                    type="text"
                    name="seguro"
                    placeholder="Seguro Médico"
                    value={mainData.seguro}
                    onChange={handleMainChange}
                    className="w-full border rounded"
                  />
                  <div className="flex items-center gap-2">
                    <h1 className="whitespace-nowrap text-sm font-medium">
                      Médico Tratante
                    </h1>
                    <Input
                      type="text"
                      name="medico"
                      placeholder="MEDICO TRATANTE"
                      value={mainData.medico}
                      onChange={handleMainChange}
                      className="w-full p-1 border rounded"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <h1 className="whitespace-nowrap text-sm font-medium">
                      Servicio
                    </h1>

                    <select
                      name="servicio"
                      value={mainData.servicio}
                      //AQUI SE CAMBIA EL ONCHANGE PARA ACCEDA A LAS SUB CATEGORIAS SOLO SI SE ELIGE LOS PISOS
                      onChange={(e) => {
                        const value = e.target.value;
                        setMainData((prev) => ({
                          ...prev,
                          servicio: value,
                          ubicacion:{
                          piso: '',
                          habitacion: ''
                          }
                        }));
                      }}
                      //HASTA AQUI
                      className="w-full max-w-[500px] border border-[#007e8f]/40 rounded-md px-3 py-1 text-sm text-gray-800 
                      focus:ring-2 focus:ring-[#007e8f]/60 focus:border-[#007e8f] transition"
                    >
                      <option value="EMERGENCIA">EMERGENCIA</option>
                      <option value="HOSPITAL DIA">HOSPITAL DEL DÍA</option>
                      <option value="HOSPITALIZACION">HOSPITALIZACIÓN</option>
                      <option value="UCI">UCI</option>
                      <option value="UCI PEDIATRICA">UCI PEDIATRICA</option>
                      <option value="NEONATOLOGÍA">NEONATOLOGÍA</option>
                    </select>
                  </div>

                  {mainData.servicio === 'EMERGENCIA' && (
                    <select
                      value={mainData.ubicacion.habitacion}
                      onChange={(e) =>
                        setMainData(prev => ({
                          ...prev,
                          ubicacion: {
                            ...prev.ubicacion,
                            habitacion: e.target.value
                          }
                        }))
                      }
                      className="w-full max-w-[500px] border border-[#007e8f]/40 rounded-md px-3 py-1 text-sm text-gray-800 
                      focus:ring-2 focus:ring-[#007e8f]/60 focus:border-[#007e8f] transition"
                    >
                      <option value="">Seleccione habitación</option>
                      <option value="CUBICULO 1">CUBICULO-1</option>
                      <option value="CUBICULO 2">CUBICULO-2</option>
                      <option value="CUBICULO 3">CUBICULO-3</option>
                      <option value="CUBICULO 4">CUBICULO-4</option>
                      <option value="CUBICULO 5">CUBICULO-5</option>
                      <option value="CUBICULO 6">CUBICULO-6</option>
                      <option value="CUBICULO 7">CUBICULO-7</option>
                    </select>
                  )}

                  {mainData.servicio === 'HOSPITAL DIA' && (
                    <select
                    value={mainData.ubicacion.habitacion}
                    onChange={(e) =>
                      setMainData(prev => ({
                        ...prev,
                        ubicacion: {
                          ...prev.ubicacion,
                          habitacion: e.target.value
                        }
                      }))
                    }
                      className="w-full p-1 border rounded mt-2"
                    >
                      <option value="">Seleccione habitación</option>
                      <option value="HD-01">HD-1</option>
                      <option value="HD-02">HD-2</option>
                      <option value="HD-03">HD-3</option>
                      <option value="HD-03">HD-4</option>
                      <option value="HD-03">HD-5</option>
                      <option value="HD-03">HD-6</option>
                    </select>
                  )}
                  {/**AQUI OJO AQUI SE HACE DOBLE SELECCION SE HACE HOSPITALIZACION Y LUEGO PRIMER PISO Y LUEGO HAB*/}

                  {mainData.servicio === 'HOSPITALIZACION' && (
                    <select
                       value={mainData.ubicacion.piso}
//+++++++++++++++++++++++++++++++++++chat gpt 5 AQUI SE CAMBIA EL ONCHANGE PARA ACCEDA A LAS SUB CATEGORIAS SOLO SI SE ELIGE LOS PISOS +++++++++++++++++++++++++++++++++
                      onChange={(e) => {
                        setMainData(prev => ({
                          ...prev,
                          ubicacion: {
                            ...prev.ubicacion,
                            piso: e.target.value,
                            habitacion: ''
                          }
                          
                        }));
                      }}

                      className="w-full p-1 border rounded mt-2"
                    >
                      <option value="">Seleccione el Piso</option>
                      <option value="1">Primer Piso</option>
                      <option value="2">Segundo Piso</option>
                      <option value="3">Tercer Piso</option>
                    </select>
                  )}





{mainData.servicio === 'HOSPITALIZACION' && mainData.ubicacion.piso && (
                    <select
                     value={mainData.ubicacion.habitacion}
                      onChange={(e) => {
                        setMainData(prev => ({
                          ...prev,
                           ubicacion: {
                              ...prev.ubicacion,
                                habitacion: e.target.value
    }
  }));
}}
                      className="w-full p-1 border rounded mt-2"
                    >
                      <option value="">Seleccione la habitación</option>
    <option value={`HAB ${mainData.ubicacion.piso}-1`}>HAB {mainData.ubicacion.piso}-1</option>
    <option value={`HAB ${mainData.ubicacion.piso}-2`}>HAB {mainData.ubicacion.piso}-2</option>
    <option value={`HAB ${mainData.ubicacion.piso}-3`}>HAB {mainData.ubicacion.piso}-3</option>
    <option value={`HAB ${mainData.ubicacion.piso}-4`}>HAB {mainData.ubicacion.piso}-4</option>
    <option value={`HAB ${mainData.ubicacion.piso}-5`}>HAB {mainData.ubicacion.piso}-5</option>
  </select>
                  )}

                  

               
                  {/**AQUI OJO AQUI SE HACE DOBLE SELECCION SE HACE HOSPITALIZACION Y LUEGO PRIMER PISO Y LUEGO HAB*/}
                  {mainData.servicio === 'UCI' && (
                    <select
                      value={mainData.ubicacion.habitacion}
                      onChange={(e) =>
                        setMainData(prev => ({
                          ...prev,
                          ubicacion: {
                            ...prev.ubicacion,
                            habitacion: e.target.value
                          }
                        }))
                      }
                      className="w-full p-1 border rounded mt-2"
                    >
                      <option value="">Seleccione habitación</option>
                      <option value="UCI-1">UCI-1</option>
                      <option value="UCI-2">UCI-2</option>
                      <option value="UCI-3">UCI-3</option>
                      <option value="UCI-4">UCI-4</option>
                    </select>
                  )}

                  {mainData.servicio === 'UCI PEDIATRICA' && (
                    <select
                    value={mainData.ubicacion.habitacion}
                    onChange={(e) =>
                      setMainData(prev => ({
                        ...prev,
                        ubicacion: {
                          ...prev.ubicacion,
                          habitacion: e.target.value
                        }
                      }))
                    }
                      className="w-full p-1 border rounded mt-2"
                    >
                      <option value="">Seleccione habitación</option>
                      <option value="UCI PEDIATRICA-1">UCI PEDIATRICA-1</option>
                      <option value="UCI PEDIATRICA-2">UCI PEDIATRICA-2</option>
                      <option value="UCI PEDIATRICA-3">UCI PEDIATRICA-3</option>
                      <option value="UCI PEDIATRICA-4">UCI PEDIATRICA-4</option>
                    </select>
                  )}

                  {mainData.servicio === 'NEONATOLOGÍA' && (
                    <select
                    value={mainData.ubicacion.habitacion}
                    onChange={(e) =>
                      setMainData(prev => ({
                        ...prev,
                        ubicacion: {
                          ...prev.ubicacion,
                          habitacion: e.target.value
                        }
                      }))
                    }
                      className="w-full p-1 border rounded mt-2"
                    >
                      <option value="">Seleccione habitación</option>
                      <option value="NEO-1">NEO-1</option>
                      <option value="NEO-2">NEO-2</option>
                      <option value="NEO-3">NEO-3</option>
                      <option value="NEO-4">NEO-4</option>
                      <option value="NEO-5">NEO-5</option>
                      <option value="NEO-6">NEO-6</option>
                    </select>
                  )}
                  <button
                    type="submit"
                    className="bg-[#4b6bb3]/90 text-white px-4 py-1 rounded hover:bg-[#124364]"
                  >
                    GUARDAR DATOS PRINCIPALES
                  </button>
                  <br />
                </form>
              )}

              {activeTab === 'Datos complementarios' && (
                <form
                  onSubmit={handleSecondarySubmit}
                  className="text-black space-y-2"
                >
                  <Input
                    type="text"
                    name="nacionalidad"
                    placeholder="Nacionalidad"
                    value={secondaryData.nacionalidad}
                    onChange={handleSecondaryChange}
                    className="w-full p-1 border rounded"
                  />
                  <Input
                    type="text"
                    name="placeOfBirth"
                    placeholder="Lugar de Nacimiento"
                    value={secondaryData.placeOfBirth}
                    onChange={handleSecondaryChange}
                    className="w-full p-1 border rounded"
                  />
                  <Input
                    type="date"
                    name="dateOfBirth"
                    value={secondaryData.dateOfBirth}
                    onChange={handleSecondaryChange}
                    className="w-full p-1 border rounded"
                  />
                  <Input
                    type="text"
                    name="country"
                    placeholder="País"
                    value={secondaryData.country}
                    onChange={handleSecondaryChange}
                    className="w-full p-1 border rounded"
                  />
                  <Input
                    type="text"
                    name="province"
                    placeholder="Provincia"
                    value={secondaryData.province}
                    onChange={handleSecondaryChange}
                    className="w-full p-1 border rounded"
                  />
                  <Input
                    type="text"
                    name="canton"
                    placeholder="Cantón"
                    value={secondaryData.canton}
                    onChange={handleSecondaryChange}
                    className="w-full p-1 border rounded"
                  />
                  <Input
                    type="text"
                    name="direccion"
                    placeholder="Dirección"
                    value={secondaryData.direccion}
                    onChange={handleSecondaryChange}
                    className="w-full p-1 border rounded"
                  />
                  <Input
                    type="text"
                    name="calleprin"
                    placeholder="Calle Principal"
                    value={secondaryData.calleprin}
                    onChange={handleSecondaryChange}
                    className="w-full p-1 border rounded"
                  />
                  <Input
                    type="text"
                    name="callesecun"
                    placeholder="Calle Secundaria"
                    value={secondaryData.callesecun}
                    onChange={handleSecondaryChange}
                    className="w-full p-1 border rounded"
                  />
                  <Input
                    type="text"
                    name="numero"
                    placeholder="Numero"
                    value={secondaryData.numero}
                    onChange={handleSecondaryChange}
                    className="w-full p-1 border rounded"
                  />
                  <Input
                    type="text"
                    name="referencia"
                    placeholder="Referencia"
                    value={secondaryData.referencia}
                    onChange={handleSecondaryChange}
                    className="w-full p-1 border rounded"
                  />
                  <Input
                    type="text"
                    name="ocupacion"
                    placeholder="Ocupación"
                    value={secondaryData.ocupacion}
                    onChange={handleSecondaryChange}
                    className="w-full p-1 border rounded"
                  />
                  <Input
                    type="text"
                    name="instituto"
                    placeholder="Insituto/Empresa:"
                    value={secondaryData.instituto}
                    onChange={handleSecondaryChange}
                    className="w-full p-1 border rounded"
                  />
                  <Input
                    type="text"
                    name="puesto"
                    placeholder="Puesto de trabajo Paciente:"
                    value={secondaryData.puesto}
                    onChange={handleSecondaryChange}
                    className="w-full p-1 border rounded"
                  />
                  <Input
                    type="text"
                    name="descripcion"
                    placeholder="Descripción Laboral:"
                    value={secondaryData.descripcion}
                    onChange={handleSecondaryChange}
                    className="w-full p-1 border rounded"
                  />
                  <Input
                    type="text"
                    name="correo"
                    placeholder="Correo Electrónico:"
                    value={secondaryData.correo}
                    onChange={handleSecondaryChange}
                    className="w-full p-1 border rounded"
                  />
                  <button
                    type="submit"
                    disabled={!docId}
                    className={`px-4 py-1 rounded text-white ${
                      docId ? 'bg-[#4b6bb3]' : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    GUARDAR DATOS COMPLEMENTARIOS
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </main>
      {/* Modal externo */}
    </div>
  );
}

export default Admision;
const LabelInputContainer = ({ children, className }) => {
  return (
    <div className={cn('flex w-full flex-col space-y-2', className)}>
      {children}
    </div>
  );
};
//872 lineas de codigo en Admision
