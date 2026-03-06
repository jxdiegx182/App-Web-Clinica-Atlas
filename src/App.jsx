import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ALL_ROLES, ROLES } from '@/constants/roles';
import { ROUTE_ALLOWED_ROLES } from '@/constants/accessControl';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import MedicalModule from '@/pages/MedicalModule';
import Registro from '@/pages/Registro';
import NursingModule from '@/pages/NursingModule';
import Anamnesis from '@/pages/Anamnesis';
import Emergencia from '@/pages/Emergencia';
import Epicrisis from '@/pages/Epicrisis';
import Evolucion from '@/pages/Evolucion';
import Interconsulta from '@/pages/Interconsulta';
import Protocolo from '@/pages/Protocolo';
import Consentimientos from '@/pages/Consentimientos';
import ModalCita from '@/pages/ModalCita';
import Chatbot from '@/pages/Chatbot';
import Receta from '@/pages/Receta';
import Certificado from '@/pages/Certificado';
import Admision from '@/pages/Admision';
import Quirofano from '@/pages/Quirofano';
import RegAnestesia from '@/pages/RegAnestesia';
import Calendar from '@/components/Calendar';
import Unauthorized from '@/pages/Unauthorized';
import AdminUsers from '@/pages/AdminUsers';

function withAuth(element, allowedRoles = ALL_ROLES) {
  return <ProtectedRoute allowedRoles={allowedRoles}>{element}</ProtectedRoute>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Helmet>
          <title>Clínica Atlas</title>
          <meta
            name="description"
            content="Sistema integral de gestion hospitalaria para el control de pacientes y modulos medicos"
          />
        </Helmet>

        <div className="min-h-screen w-full bg-gradient-to-bl from-[#1E3D5C] via-[#ffffff] to-[#1E3D5C]">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Ejemplos solicitados de rutas protegidas por rol */}
            <Route
              path="/dashboard"
              element={withAuth(<Dashboard />, ROUTE_ALLOWED_ROLES.DASHBOARD)}
            />
            <Route
              path="/emergencia"
              element={withAuth(<Emergencia />, [ROLES.ADMIN, ROLES.MEDICO])}
            />
            <Route path="/admin" element={withAuth(<AdminUsers />, [ROLES.ADMIN])} />

            <Route
              path="/anamnesis"
              element={withAuth(<Anamnesis />, [ROLES.ADMIN, ROLES.MEDICO])}
            />
            

             <Route
              path="/epicrisis"
              element={withAuth(<Epicrisis />, [ROLES.ADMIN, ROLES.MEDICO])}
            />
            {/* Rutas actuales del sistema */}
            <Route
              path="/modulo-medico/:mainId"
              element={withAuth(<MedicalModule />, ROUTE_ALLOWED_ROLES.MEDICAL_MODULE)}
            />
            <Route path="/anamnesis/:mainId" element={withAuth(<Anamnesis />, [ROLES.ADMIN, ROLES.MEDICO])} />
            <Route path="/emergencia/:mainId" element={withAuth(<Emergencia />, [ROLES.ADMIN, ROLES.MEDICO])} />
            <Route path="/epicrisis/:mainId" element={withAuth(<Epicrisis />)} />
            <Route path="/evolucion/:mainId" element={withAuth(<Evolucion />)} />
            <Route path="/interconsulta/:mainId" element={withAuth(<Interconsulta />)} />
            <Route path="/protocolo/:mainId" element={withAuth(<Protocolo />)} />
            <Route path="/chatbot" element={withAuth(<Chatbot />)} />
            <Route path="/receta/:mainId" element={withAuth(<Receta />)} />
            <Route path="/certificado/:mainId" element={withAuth(<Certificado />)} />
            <Route path="/admision" element={withAuth(<Admision />)} />
            <Route path="/agendar" element={withAuth(<Calendar />)} />
            <Route path="/cita" element={withAuth(<ModalCita />)} />
            <Route path="/consentimientos/:mainId" element={withAuth(<Consentimientos />)} />
            <Route path="/registro" element={withAuth(<Registro />)} />
            <Route
              path="/modulo-medico/reganestesia/:mainId"
              element={withAuth(<RegAnestesia />, ROUTE_ALLOWED_ROLES.MEDICAL_ANESTHESIA)}
            />
            <Route
              path="/modulo-enfermeria/:mainId"
              element={withAuth(<NursingModule />, ROUTE_ALLOWED_ROLES.NURSING_MODULE)}
            />
            <Route path="/Parte-Operatorio" element={withAuth(<Quirofano />)} />

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>

          <Toaster />
        </div>

        <footer className="grid grid-cols-7 md:grid-cols-7 bg-[#0b4f6c]/90">
          <div className="ml-3 mt-2 font-bold">
            <img
              src="https://i.postimg.cc/9MHfPv55/Gemini-Generated-Image-4e7mun4e7mun4e7m.png"
              className="w-[120px] h-[30px] rounded-lg shadow-lg"
              alt="logo medix"
            />
          </div>

          <div className="mt-2 text-[9.5px] font-medium">
            <p>MEDIX➇ HIS VERSION V3.18.798</p>
          </div>

          <div className="font-bold" />

          <div className="text-[9.5px] text-center font-medium text-white/90 bg-[#0b4f6c]/40 tracking-wide min-h-[10px] hover:text-[gray]/100">
            <h1>Clinicas Atlas © 2026 </h1>
            <p>Todos los Derechos Reservados</p>
          </div>

          <div className="font-bold" />
          <div className="font-bold" />

          <div className="text-end item-center mr-10 text-[9.5px] ">
            <p>Desarollado por MANHFER SYSTEMS S.A.S</p>
          </div>
        </footer>
      </Router>
    </AuthProvider>
  );
}

export default App;
