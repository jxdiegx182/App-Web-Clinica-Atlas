import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import MedicalModule from '@/pages/MedicalModule';
import Registro from '@/pages/Registro';
import NursingModule from '@/pages/NursingModule';
import Anamnesis from '@/pages/Anamnesis';
import Evolucion from '@/pages/Evolucion';
import Interconsulta from '@/pages/Interconsulta';
import Protocolo from '@/pages/Protocolo';
import Consentimientos from '@/pages/Consentimientos';
import { AuthProvider, 
  useAuth
} from '@/contexts/AuthContext';
//NUEVOS
import ModalCita from '@/pages/ModalCita';
import Chatbot from '@/pages/Chatbot';
import Receta from '@/pages/Receta';
import Certificado from '@/pages/Certificado';
import Admision from '@/pages/Admision';
import Quirofano from '@/pages/Quirofano';
import RegAnestesia from '@/pages/RegAnestesia';
import Calendar from '@/components/Calendar';
import { useState, 
  useEffect
} from 'react';
import { getCalendarDays } from '@/utils/dateUtils';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  console.log('ProtectedRoute: ', isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Helmet>
          <title>Clínica Atlas</title>
          <meta
            name="description"
            content="Sistema integral de gestión hospitalaria para el control de pacientes y módulos médicos"
          />
        </Helmet>
        <div className="min-h-screen w-full bg-gradient-to-bl from-[#1E3D5C] via-[#ffffff] to-[#1E3D5C]">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/modulo-medico/:mainId"
              element={
                <ProtectedRoute>
                  <MedicalModule />
                </ProtectedRoute>
              }
            />
              {/**Pagina de Anamnesis con cada ID */}
              <Route
              path="/anamnesis/:mainId"
              element={
                <ProtectedRoute>
                  <Anamnesis />
                </ProtectedRoute>
              }
            />
            {/**Pagina de Evolucion desde firebase el ID */}
            <Route
              path="/evolucion/:mainId"
              element={
                <ProtectedRoute>
                  <Evolucion />
                </ProtectedRoute>
              }
            />
            {/**Pagina de Interconsulta con cada ID */}
            <Route
              path="/interconsulta/:mainId"
              element={
                <ProtectedRoute>
                  <Interconsulta />
                </ProtectedRoute>
              }
            />
            {/**Pagina de PROTOCOLO con cada ID */}
            <Route
              path="/protocolo/:mainId"
              element={
                <ProtectedRoute>
                  <Protocolo/>
                </ProtectedRoute>
              }
            />
            {/**Pagina de Chatbot con cada ID */}
            <Route
              path="/chatbot"
              element={
                <ProtectedRoute>
                  <Chatbot />
                </ProtectedRoute>
              }
            />
            {/**Pagina de receta con cada ID */}
            <Route
              path="/receta/:mainId"
              element={
                <ProtectedRoute>
                  <Receta />
                </ProtectedRoute>
              }
            />
            {/**Pagina de Certificado con cada ID */}
            <Route
              path="/certificado/:mainId"
              element={
                <ProtectedRoute>
                  <Certificado />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admision"
              element={
                <ProtectedRoute>
                  <Admision />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agendar"
              element={
                <ProtectedRoute>
                  <Calendar />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cita"
              element={
                <ProtectedRoute>
                  <ModalCita />
                </ProtectedRoute>
              }
            />
            <Route
              path="/consentimientos/:mainId"
              element={
                <ProtectedRoute>
                  <Consentimientos />
                </ProtectedRoute>
              }
            />

            <Route
              path="/registro"
              element={
                <ProtectedRoute>
                  <Registro />
                </ProtectedRoute>
              }
            />
            <Route
              path="/modulo-medico/reganestesia/:mainId"
              element={
                <ProtectedRoute>
                  <RegAnestesia />
                </ProtectedRoute>
              }
            />

            <Route
              path="/modulo-enfermeria/:mainId"
              element={
                <ProtectedRoute>
                  <NursingModule />
                </ProtectedRoute>
              }
            />

            <Route
              path="/Parte-Operatorio"
              element={
                <ProtectedRoute>
                  <Quirofano />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
          <Toaster />
        </div>

        <footer className="grid grid-cols-7 md:grid-cols-7 bg-[#0b4f6c]/90">
          {/**Aqui va los derechos reseervados */}
          <div className="ml-3 mt-2 font-bold">
            <img
              src="https://i.postimg.cc/9MHfPv55/Gemini-Generated-Image-4e7mun4e7mun4e7m.png"
              className="w-[120px] h-[30px] rounded-lg shadow-lg " //-translate-x-[-20px] -translate-y-[37px]
            />
          </div>

          <div className="mt-2 text-[9.5px] font-medium">
            <p>MEDIX➇ HIS VERSION V3.18.798</p>
          </div>

          <div className="font-bold"></div>

          <div className="text-[9.5px] text-center font-medium text-white/90 bg-[#0b4f6c]/40 tracking-wide min-h-[10px] hover:text-[gray]/100">
            <h1>Clinicas Atlas © 2026 </h1>
            <p>Todos los Derechos Reservados</p>
          </div>

          <div className="font-bold"></div>
          <div className="font-bold"></div>

          <div className="text-end item-center mr-10 text-[9.5px] ">
            <p>Desarollado por MANHFER SYSTEMS S.A.S</p>
          </div>
        </footer>
      </Router>
    </AuthProvider>
  );
}

export default App;
