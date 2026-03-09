import React from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

/**
 * COMPONENTE: PatientSearchBar
 * Barra de búsqueda de pacientes
 */
export const PatientSearchBar = ({
  searchTerm,
  onSearchChange,
  placeholder = 'Buscar por nombre, cédula...',
}) => {
  return (
    <div className="relative">
      <Search
        size={18}
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
      />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 pr-10"
      />
      {searchTerm && (
        <button
          onClick={() => onSearchChange('')}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export default PatientSearchBar;
