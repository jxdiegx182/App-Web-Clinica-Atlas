import { useEffect, useState } from 'react';

export const useReloj = () => {
  const [reloj, setReloj] = useState('');

  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setReloj(
        n.toLocaleDateString('es-EC', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()
        + '\n' + n.toTimeString().slice(0, 8)
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return reloj;
};
