import React from 'react';
import parteOperatorioHtml from './parte-operatorio.html?raw';

const ParteOperatorio = () => {
  return (
    <div className="w-full rounded-xl border border-[#007e8f]/20 bg-white/40 p-2 shadow-sm">
      <iframe
        title="Parte Operatorio"
        srcDoc={parteOperatorioHtml}
        className="h-[calc(100vh-180px)] min-h-[760px] w-full rounded-lg border border-[#007e8f]/20 bg-white"
      />
    </div>
  );
};

export default ParteOperatorio;
