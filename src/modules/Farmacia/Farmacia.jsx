import React from 'react';
import FarmaciaHtml from './Farmacia.html?raw';

const Farmacia = () => {
  return (
    <div className="w-full rounded-xl border border-[#007e8f]/20 bg-white/40 p-2 shadow-sm">
      <iframe
        title="Farmacia"
        srcDoc={FarmaciaHtml}
        className="h-[calc(100vh-180px)] min-h-[760px] w-full rounded-lg border border-[#007e8f]/20 bg-white"
      />
    </div>
  );
};

export default Farmacia;
