import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Lock, User, Shield, Activity, Loader, UserCheck   } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const success = login(username, password);
      if (success) {
        toast({
          title: '¡Bienvenido!',
          description: 'Acceso autorizado al sistema hospitalario',
        });
        navigate('/dashboard');
      } else {
        toast({
          title: 'Error de autenticación',
          description: 'Usuario o contraseña incorrectos',
          variant: 'destructive',
        });
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <>
      <Helmet>
        <title>Iniciar Sesión - Sistema Hospitalario</title>
      </Helmet>

      <div className="min-h-[38rem] bg-gradient-to-br from-[#ffffff] via-[#ffffff] to-[#1a5784] relative px-4 py-1">
        {/* Título superior con línea negra*/}
        <div className="border-b-4 border-black-9 pb-1 pl-1 items-start">
          <div className= "">
            <img 
            src="https://i.postimg.cc/9MHfPv55/Gemini-Generated-Image-4e7mun4e7mun4e7m.png" alt="logoEmpresa" 
            className="w-[300px] h-[100px] object-contain "
            style={{
                  WebkitMaskImage:
                    'radial-gradient(circle, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)',
                  WebkitMaskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  WebkitMaskSize: 'cover',
                  maskImage:
                    'radial-gradient(circle, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)',
                  maskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  maskSize: 'cover',
                }}
                />
          </div>
          <h1 className="text-4xl font-bold  text-center text-[#3aa7aa]">
            INGRESO SISTEMA
          </h1>
        </div>
        
        <div className="flex  mt-4 bg-[#000000]/10 rounded-lg border border-[#337375] shadow-md mx-1 max-w-9xl p-5">
          <div className="flex justify-center  items-center mt-1 bg-[#1a5784]/10 rounded-lg border border-[#337375] shadow-md mx-auto max-w-5x1 p-10">
            {/* Imagen médica con efectos de desvanecimiento */}
            <div className="hidden md:flex items-center justify-center w-1/2">
              <img
                src="https://future-health.care/wp-content/uploads/2023/07/Tendencias_1200x800_blog.jpg"
                className="w-auto mr-9 h-auto rounded-lg shadow-lg"
                style={{
                  WebkitMaskImage:
                    'radial-gradient(circle, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)',
                  WebkitMaskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  WebkitMaskSize: 'cover',
                  maskImage:
                    'radial-gradient(circle, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
                  maskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  maskSize: 'cover',
                }}
              />
            </div>

            {/* Formulario */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full md:w-1/2 bg-[#b1b7c6] p-8 rounded-lg border border-[#337375]"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-white bg-[#7690AC] px-2 py-1 rounded shadow font-bold uppercase text-sm mb-1 inline-block">
                    Usuario
                  </label>

                  <div className="relative bg-white rounded shadow p-1">
                    <User className="absolute left-3 top-3 w-5 h-5 text-black" />
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 py-3 bg-white text-black border border-gray-300  rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ingrese su usuario"
                      required
                    />
                  </div>

                  
                </div>

                <div>
                  <label className="text-white bg-[#7690AC] px-2 py-1 rounded shadow font-bold uppercase text-sm mb-1 inline-block">
                    Contraseña
                  </label>
                  <div className="relative bg-white rounded shadow p-1">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-black" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 py-3 bg-white text-black border border-gray-300  rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ingrese su contraseña"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#3aa7aa] hover:bg-gray-300 text-black font-bold py-3 rounded border-2 border-black-500 transition-all"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <Loader  className="w-5 h-5 mr-2 animate-spin" />
                      Verificando...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center ">
                      <UserCheck className="w-5 h-5 mr-2" />
                      INGRESAR
                    </div>
                  )}
                </Button>
              </form>
            </motion.div>

            {/* Credenciales de prueba */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-8 p-4 ml-3 glass-effect rounded-lg border border-white/10"
            >
              <p className="text-sm text-gray-200 mb-2 font-medium">
                Credenciales de prueba:
              </p>
              <div className="text-xs text-gray-300 space-y-1">
                <p>• admin / admin123 (Administrador)</p>
                <p>• doctor / doctor123 (Médico)</p>
                <p>• enfermera / nurse123 (Enfermera)</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
    </>
  );
};

export default Login;