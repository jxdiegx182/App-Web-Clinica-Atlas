import './styles/global.css';
import React from 'react';
import ProtocoloBody from './components/ProtocoloBody';

const ProtocoloOperatorio = () => {
  return (
    <div className="protocolo-operatorio">
      <React.StrictMode>
        <ProtocoloBody />
      </React.StrictMode>
    </div>
  );
};

export default ProtocoloOperatorio;
