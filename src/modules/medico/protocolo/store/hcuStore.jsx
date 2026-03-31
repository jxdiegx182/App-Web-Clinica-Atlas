import React, { createContext, useContext, useReducer } from 'react';
import { PROTOCOLO_INITIAL_STATE, protocoloReducerCases } from './protocoloStore';

// 1. Creamos el Contexto
const HCUContext = createContext();

// 2. Estado Inicial Consolidado
const INITIAL_STATE = {
  ...PROTOCOLO_INITIAL_STATE,
  // Aquí irían otros estados de Atlas HIS (ej: consulta externa, recetas)
};

// 3. Reducer Principal
function hcuReducer(state, action) {
  // Intentamos procesar la acción con el reducer del protocolo
  const newState = protocoloReducerCases(state, action);
  
  // Si el reducer del protocolo no cambió el estado, devolvemos el original o manejamos otros casos
  if (newState !== state) return newState;

  switch (action.type) {
    // Casos generales de la aplicación
    default:
      return state;
  }
}

// 4. Proveedor del Contexto (Provider)
export function HCUProvider({ children }) {
  const [state, dispatch] = useReducer(hcuReducer, INITIAL_STATE);

  return (
    <HCUContext.Provider value={{ state, dispatch }}>
      {children}
    </HCUContext.Provider>
  );
}

// 5. Hook personalizado para usar el Store
export const useHCU = () => {
  const context = useContext(HCUContext);
  if (!context) {
    throw new Error('useHCU debe usarse dentro de un HCUProvider');
  }
  return context;
};