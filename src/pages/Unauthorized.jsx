import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <ShieldAlert className="mb-4 h-12 w-12 text-red-600" />
      <h1 className="mb-2 text-3xl font-bold text-slate-800">Acceso no autorizado</h1>
      <p className="mb-6 max-w-md text-slate-600">
        No tienes permisos para acceder a esta sección del sistema clínico.
      </p>
      <Button onClick={() => navigate('/dashboard')} className="bg-[#007e8f] hover:bg-[#066e7c]">
        Volver al dashboard
      </Button>
    </div>
  );
}

export default Unauthorized;
