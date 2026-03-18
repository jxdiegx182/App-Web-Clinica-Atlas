import React from 'react';
import hojaAnestesiaHtml from './borrador-hoja-anestesia.html?raw';

const HojaDeAnestecia = () => {
  return (
    <div className="w-full rounded-xl border border-[#007e8f]/20 bg-white/40 p-2 shadow-sm">
      <iframe
        title="Hoja de Anestesia"
        srcDoc={hojaAnestesiaHtml}
        className="h-[calc(100vh-180px)] min-h-[760px] w-full rounded-lg border border-[#007e8f]/20 bg-white"
      />
    </div>
  );
};

export default HojaDeAnestecia;
