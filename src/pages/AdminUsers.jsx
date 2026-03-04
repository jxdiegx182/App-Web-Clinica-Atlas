import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ROLES } from '@/constants/roles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const INITIAL_FORM = {
  nombre: '',
  email: '',
  password: '',
  rol: ROLES.ASISTENTE,
};

function AdminUsers() {
  const { registerUser, profile } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await registerUser(form);
      toast({
        title: 'Usuario creado',
        description: `Se registró correctamente a ${form.email}.`,
      });
      setForm(INITIAL_FORM);
    } catch (error) {
      toast({
        title: 'No se pudo registrar el usuario',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Administración de Usuarios - Clínica Atlas</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-[#f7fbff] via-white to-[#e5f3f6] p-4 md:p-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-[#007e8f]/20 bg-white p-6 shadow-lg">
          <div className="mb-6 flex items-center gap-3">
            <UserPlus className="h-8 w-8 text-[#007e8f]" />
            <div>
              <h1 className="text-2xl font-bold text-[#1c3f6e]">Gestión de Usuarios</h1>
              <p className="text-sm text-gray-600">
                Admin actual: <strong>{profile?.nombre || profile?.email}</strong>
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nombre" className="mb-1 block text-sm font-semibold text-[#1c3f6e]">
                Nombre completo
              </label>
              <Input
                id="nombre"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Ej: Dra. Ana Flores"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-semibold text-[#1c3f6e]">
                Correo electrónico
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="usuario@clinica.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-semibold text-[#1c3f6e]">
                Contraseña temporal
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                minLength={6}
                value={form.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>

            <div>
              <label htmlFor="rol" className="mb-1 block text-sm font-semibold text-[#1c3f6e]">
                Rol del usuario
              </label>
              <select
                id="rol"
                name="rol"
                value={form.rol}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                required
              >
                <option value={ROLES.ADMIN}>admin</option>
                <option value={ROLES.MEDICO}>medico</option>
                <option value={ROLES.ENFERMERA}>enfermera</option>
                <option value={ROLES.ASISTENTE}>asistente</option>
              </select>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#007e8f] font-semibold text-white hover:bg-[#066e7c]"
            >
              {loading ? 'Creando usuario...' : 'Registrar usuario'}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}

export default AdminUsers;
