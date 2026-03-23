import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Lock, Mail, Loader, UserCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const redirectTo = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await login({ email, password });

      toast({
        title: 'Acceso autorizado',
        description: 'Sesion iniciada correctamente.',
      });

      navigate(redirectTo, { replace: true });
    } catch (error) {
      toast({
        title: 'Error de autenticacion',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Iniciar Sesion - Sistema Hospitalario</title>
      </Helmet>

      <div className="min-h-[38rem] bg-gradient-to-br from-[#ffffff] via-[#ffffff] to-[#FFFFFF] relative px-4 py-1">
        <div className="border-b-4 border-black-9 pb-1 pl-1 items-start">
          <div>
            <img
              src="https://i.postimg.cc/9MHfPv55/Gemini-Generated-Image-4e7mun4e7mun4e7m.png"
              alt="logoEmpresa"
              className="w-[300px] h-[100px] object-contain "
              style={{
                WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                WebkitMaskSize: 'cover',
                maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                maskSize: 'cover',
              }}
            />
          </div>
          <h1 className="text-4xl font-bold text-center text-[#69C9BA]">INGRESO SISTEMA</h1>
        </div>

        <div className="flex mt-4 bg-[#69C9BA]/30 rounded-lg border border-[#337375] shadow-md mx-1 max-w-9xl p-1">
          <div className="flex justify-center items-center mt-1 bg-[#76C4D5]/9 rounded-lg border border-[#337375] shadow-md mx-auto max-w-5x1 p-10">
            <div className="hidden md:flex items-center justify-center w-1/2">
              <img
                src="https://future-health.care/wp-content/uploads/2023/07/Tendencias_1200x800_blog.jpg"
                className="w-auto mr-9 h-auto rounded-lg shadow-lg"
                style={{
                  WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)',
                  WebkitMaskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  WebkitMaskSize: 'cover',
                  maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
                  maskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  maskSize: 'cover',
                }}
              />
            </div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full md:w-1/2 bg-[#FFFFFF] p-8 rounded-lg border border-[#337375]"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-[#000000]/70 bg-[#69C9BA] px-2 py-1 rounded shadow font-semibold uppercase text-sm mb-1 inline-block">
                    Correo
                  </label>

                  <div className="relative bg-white rounded shadow p-1">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-black" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="pl-10 py-3 bg-white text-black border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="usuario@clinica.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[#000000]/70 bg-[#69C9BA] px-2 py-1 rounded shadow font-semibold uppercase text-sm mb-1 inline-block">
                    Contraseña
                  </label>
                  <div className="relative bg-white rounded shadow p-1">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-black" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="pl-10 py-3 bg-white text-black border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ingresa tu contrasena"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={submitting || loading}
                  className="w-full bg-[#69C9BA] hover:bg-[#4ea685]/80 text-[#000000]/70 font-bold py-4 rounded border-4 border-[#69c9ba]/90 transition-all"
                >
                  {submitting || loading ? (
                    <div className="flex items-center justify-center">
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Verificando...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <UserCheck className="w-5 h-5 mr-2" />
                      INGRESAR
                    </div>
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
