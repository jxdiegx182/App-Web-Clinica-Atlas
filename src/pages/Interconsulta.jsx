import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { InterconsultaPDF } from '../components/InterconsultaPDF';
import { db } from '../firebaseConfig'; // 👈 AJUSTAr la ruta si es necesario
import { doc, getDoc } from 'firebase/firestore';
import { toast } from '@/components/ui/use-toast';

const AllergyWarning = ({ allergy }) => (
  <span className="allergy-warning text-[#FF0000] font-semibold">
    <span className="allergy-icon">⚠️</span>
    ALERGIAS: {allergy}
  </span>
);

const Interconsulta = () => {
  const { mainId } = useParams();
  const [time, setTime] = useState(new Date());
  const [admisiones, setAdmisiones] = useState(null); // <-- aquí se guardan los datos desde Firestore
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  //agregado
  //le estoy agregando tecnica para que inicialize en cero y ADEMAS ES UNA PROPIEDAD DEL OBJETO formDate
  const [formData, setFormData] = useState({
    tecnica:''
  });
  const [planTratamientoTexto, setPlanTratamientoTexto] = useState('');
  const [planDiagTexto, setPlanDiagTexto] = useState('');
  const [defTexto, setDefTexto] = useState('');
  const [preTexto, setPreTexto] = useState('');
  const [cieDosTexto, setCieDosTexto] = useState('');
  const [diagDosTexto, setDiagDosTexto] = useState('');
  const [resumenTexto, setResumenTexto] = useState('');
  const [cuadroTexto, setCuadroTexto] = useState('');
  const [planesTeTexto, setPlanesTeTexto] = useState('');
  const [defUnoTexto, setDefUnoTexto] = useState('');
  const [preUnoTexto, setPreUnoTexto] = useState('');
  const [servicioTresTexto, setServicioTresTexto] = useState('');
  const [servicioDosTexto, setServicioDosTexto] = useState('');
  const [cieUnoTexto, setCieUnoTexto] = useState('');
  const [diagUnoTexto, setDiagUnoTexto] = useState('');
  const [examenesTexto, setExamenesTexto] = useState('');
  const [cuadroUnoTexto, setCuadroUnoTexto] = useState('');
  const [descTexto, setDescTexto] = useState('');
  const [medicoTexto, setMedicoTexto] = useState('');
  const [establecimientoTexto, setEstablecimientoTexto] = useState('');
  
  const handleGeneratePDF = () => {
    InterconsultaPDF({
      establecimientoTexto,
      servicioDosTexto,
      servicioTresTexto,
      medicoTexto,
      descTexto,
      cuadroUnoTexto,
      examenesTexto,
      diagUnoTexto,
      cieUnoTexto,
      preUnoTexto,
      defUnoTexto,
      planesTeTexto,
      cuadroTexto,
      resumenTexto,
      diagDosTexto,
      cieDosTexto,
      preTexto,
      defTexto,
      planDiagTexto,
      planTratamientoTexto,
      admisiones,
      edad,
      formData,
    });
  };

//AQUI VIENE LA VENTANA DE VISUALIZACION

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

//Aqui traigo de firebase para el encabezado
useEffect(() => {
  const fetchAdmisiones = async () => {
    
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
      const data = snap.data(); //extrae documentos de firebase
         setAdmisiones({
            id: snap.id,
            ...data,
            ...data.mainData,
          });

          
        } 
          
        catch (error) {
      console.error('❌ Error al obtener admisiones:', error);
      setAdmisiones(null);
    } finally {
      setLoading(false);
    }
    
  };
  fetchAdmisiones();
}, [mainId]);
//*******************hasta aqui traigo de firebase****************//

//*****************AQUI CREO LA ESTANCIA DE CADA PACIENTE SUMANDO LOS DIAS **********************//
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
//*******************************HASTA AQUI ESTANCIAS **********************//
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


  //inicia la ventana grafica
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ffffff] via-[#EAF4FB] to-[#1a5784]">
      <div className="relative mb-1">
      <button
        onClick={() => window.history.back()}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#4b6bb3] text-white font-semibold py-1 px-3 rounded hover:bg-[#2b8d8f] shadow"
      >
        ← Volver
      </button>

      <h1 className="text-3xl text-[#5dbfc1] font-bold text-center">
        INTERCONSULTA
      </h1>
      </div>
      {/* HEADER */}
      <header className="bg-[#4b6bb3]/15 p-4 text-black rounded-md shadow relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 text-sm">
          <div className="max-w-6xl mx-auto ">
            <img
              src="https://clinicas-atlas.com/wp-content/uploads/2024/11/clinicas-atlas-ecuador.png"
              alt="Logo Clinica Atlas"
              className="w-44 h-auto"
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
        {/*FECHA */}
        <p className="absolute left-28 top-24  text-lg font-bold  ">
          {formattedTime}
        </p>
        <p className="absolute left-12 top-32 text-sm uppercase tracking-wide font-bold">
          {formattedDate.toUpperCase()}
        </p>
        
        



      </header>
      {/* MAIN PANEL */}
      <main className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 ">
        {/* LEFT PANEL */}
        <div className="bg-white rounded shadow p-4">
          <h2 className="bg-[#162f5c] text-white text-center text-sm font-bold px-4 py-2 rounded-t">
            NUEVA INTERCONSULTA
          </h2>

          <button
            onClick={() => console.log('Agregar nuevo registro')}
            className=" absolute top-60 left-80 text-gray hover:text-[#FF5757] "
            title="Agregar nuevo registro"
          >
            <PlusCircle className="w-5 h-5" />
          </button>

          <div className="border p-2 mt-2 text-sm">
            <h1 className="text-[#010101] font-bold text-center mb-2">
              HISTORIAL
            </h1>
           
            <h1 className="text-[#3aa7aa] font-bold text-center mb-2">Doctor</h1>
            
            <ul className="text-[#3aa7aa] text-center">
              <li>DELGADO ZURITA LUIS MIGUEL</li>
           
              <li>DELGADO ZURITA LUIS MIGUEL</li>
            
            </ul>
          </div>

          <div className="bg-[#7cc4bc] text-white rounded-2xl p-4 mt-4 text-sm">
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
              <strong>PRESION ARTERIAL:</strong> 120/70
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-3 bg-white p-4 rounded shadow"
        >
          <div className="border border-[#3aa7aa] p-4 text-[#000000] text-xs">
           
            
            
           

 {/* Aquí puedes construir las secciones del formulario con líneas horizontales */}
            <div className="grid grid-cols-5 gap-2  py-2 text-xs text-center">
              
{/*tecnica seleccionar ""TIPO DE CONSULTA"" */}
              <div className="col-span- flex items-center gap-1">
                <label className="block font-bold">TIPO DE CONSULTA:</label>
                {['NORMAL', 'URGENTE'].map((opt) => ( //aqui lo que hace map es recorrer los dos nombres para guardarlos en opt
                  <label key={opt}> 
                    <input
                      type="radio"
                      name="tecnica"
                      value={opt}
                      checked={formData.tecnica === opt}
                      onChange={(e) =>
                        setFormData({ ...formData, tecnica: e.target.value })
                      }
                      className="mr-1"
                    />
                    {opt}
                  </label>
                ))}
              </div>
                       {/*FIN tecnica seleccionar */}
<div></div>




{/*ESTABLECIMIENTO */}
              <div className="">
                <label className="block font-bold">ESTABLECIMIENTO</label>
                <textarea
                  value={establecimientoTexto}
                  onChange={(e) => setEstablecimientoTexto(e.target.value)}
                  className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
              </div>







              
{/*servicioDosTexto */}
              <div className="">
                <label className="block font-bold">SERVICIO CONSULTADO</label>
                <textarea
                  value={servicioDosTexto}
                  onChange={(e) => setServicioDosTexto(e.target.value)}
                  className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
              </div>
               {/*servicioTresTexto */}
              <div className="">
                <label className="block font-bold">SERVICIO QUE SOLICITA</label>
                <textarea
                  value={servicioTresTexto}
                  onChange={(e) => setServicioTresTexto(e.target.value)}
                  className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
              </div>
            </div>


{/**********************2DO GRUPO******************************************* */}
            <div className="grid grid-cols-4 gap-1 py-1 text-xs text-center ">
              {/* ESTE ES EL INICIO DE PEQUEÑOS TEXTOS*/}
               {/*medicoTexto */}
              <div className="">
                <label className="block font-bold">MEDICO INTERCONSULTADO</label>
                <textarea
                  value={medicoTexto}
                  onChange={(e) => setMedicoTexto(e.target.value)}
                  className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
              </div>

              <div>LUPA</div>
              <div></div>
{/**CAMBiAR LAS CONSTANTES A DESCRIPCION_MOTIVO */}
{/*descTexto */}
              <div className="">
                <label className="block font-bold">DESCRIPCION DEL MOTIVO</label>
                <textarea
                  value={descTexto}
                  onChange={(e) => setDescTexto(e.target.value)}
                  className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
              </div>             
            </div>
{/**************************2DO GRUPO*************************************** */}

            {/*Ultimo grupo */}
            <div className=" ">
              <label className="block font-bold">CUADRO CLINICO ACTUAL</label>
              <textarea
                value={cuadroUnoTexto}
                onChange={(e) => setCuadroUnoTexto(e.target.value)}
                className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                rows={3}
              />
            </div>
            <div className=" ">
              <label className="block font-bold">EXAMENES Y PROCEDIMIENTOS DIAGNOSTICOS</label>
              <textarea
                value={examenesTexto}
                onChange={(e) => setExamenesTexto(e.target.value)}
                className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                rows={3}
              />
            </div>


           
            <div className="grid grid-cols-7 gap-2 py-2 text-xs">
              <div>aqui va un basurero</div>
              <div className=" ">
                <label className="block font-bold">DIAGNOSTICO</label>
                <textarea
                  value={diagUnoTexto}
                  onChange={(e) => setDiagUnoTexto(e.target.value)}
                  className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
              </div>
              <div className=" ">
                <label className="block font-bold">CIE10</label>
                <textarea
                  value={cieUnoTexto}
                  onChange={(e) => setCieUnoTexto(e.target.value)}
                  className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
              </div>
              <div className=" ">
                <label className="block font-bold">PRE</label>
                <textarea
                  value={preUnoTexto}
                  onChange={(e) => setPreUnoTexto(e.target.value)}
                  className="w-full h-7 text-sm text-center border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
              </div>
              <div className=" ">
                <label className="block font-bold">DEF</label>
                <textarea
                  value={defUnoTexto}
                  onChange={(e) => setDefUnoTexto(e.target.value)}
                  className="w-full h-7 text-sm text-center border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
              </div>
              <div>aqui va un boton mas</div>
              <div></div>
            </div>


            <div className=" ">
              <label className="block font-bold">PLANES TERAPEUTICOS Y EDUCACIONALES REALIZADOS</label>
              <textarea
                value={planesTeTexto}
                onChange={(e) => setPlanesTeTexto(e.target.value)}
                className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                rows={3}
              />
            </div>


{/***AQUI VA EL BOTON QUE GENERA EL INTERCONSULTAPDF.JS */}
         {/**¨¨¨¨¨¨¨¨¨¨¨¨¨¨****ESTA PARTE LE ESTABA DEJANDO PERO NO ME EXPORTA LAS CONSTANTES QUE QUIERO PARA MI PDF  
            <Button
            onClick={() =>
              InterconsultaPDF({
                establecimientoTexto, 
                servicioDosTexto,
                servicioTresTexto,
                medicoTexto,
                descTexto,
                cuadroUnoTexto,
                examenesTexto,
              })
            }
            className="bg-[#4b6bb3]/60 text-white px-7 py-2 rounded hover:bg-[#87D1D4] flex items-center"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/4659/4659495.png"
              alt="Imprimir"
              className="w-8 h-8"
            />
          </Button>
          
  *****************************************************       BORRAR SI SALE MAL */}  
<br/>

          <div className=" right-11 top-28 z-20 ">
          <Button
            onClick={handleGeneratePDF}
            className="bg-[#4b6bb3]/60 text-white px-7 py-2 rounded hover:bg-[#87D1D4] flex items-center"
            title="InterconsultaPDF"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/4659/4659495.png"
              alt="Imprimir"
              className="w-8 h-8"
            />
          </Button>
        </div>
{/***AQUI VA EL BOTON QUE GENERA EL INTERCONSULTAPDF.JS */}

            <div className=" ">
              <label className="block font-bold">CUADRO CLINICO DE INTERCONSULTA</label>
              <textarea
                value={cuadroTexto}
                onChange={(e) => setCuadroTexto(e.target.value)}
                className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                rows={3}
              />
            </div>

            <div className=" ">
              <label className="block font-bold">RESUMEN DE CRITERIO CLINICO</label>
              <textarea
                value={resumenTexto}
                onChange={(e) => setResumenTexto(e.target.value)}
                className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                rows={3}
              />
            </div>

           


            <div className="grid grid-cols-7 gap-2 py-2 text-xs">
              <div>aqui va un basurero</div>
              <div className=" ">
                <label className="block font-bold">DIAGNOSTICOS</label>
                <textarea
                  value={diagDosTexto}
                  onChange={(e) => setDiagDosTexto(e.target.value)}
                  className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
              </div>
              <div className=" ">
                <label className="block font-bold">CIE10</label>
                <textarea
                  value={cieDosTexto}
                  onChange={(e) => setCieDosTexto(e.target.value)}
                  className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
              </div>
              <div className=" ">
                <label className="block font-bold">PRE</label>
                <textarea
                  value={preTexto}
                  onChange={(e) => setPreTexto(e.target.value)}
                  className="w-full h-7 text-sm text-center border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
              </div>
              <div className=" ">
                <label className="block font-bold">DEF</label>
                <textarea
                  value={defTexto}
                  onChange={(e) => setDefTexto(e.target.value)}
                  className="w-full h-7 text-sm text-center border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
              </div>
              <div>aqui va un boton mas</div>
              <div></div>
            </div>


            <div className=" ">
              <label className="block font-bold">PLAN DE DIAGNOSTICO PROPUESTO</label>
              <textarea
                value={planDiagTexto}
                onChange={(e) => setPlanDiagTexto(e.target.value)}
                className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                rows={3}
              />
            </div>



            <div className=" ">
              <label className="block font-bold">PLAN DE TRATAMIENTO PROPUESTO</label>
              <textarea
                value={planTratamientoTexto}
                onChange={(e) => setPlanTratamientoTexto(e.target.value)}
                className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                rows={3}
              />
            </div>




          </div>

          
        </motion.div>
      </main>
    </div>
  );
};
export default Interconsulta;
;
