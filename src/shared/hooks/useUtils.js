/**
 * useDebounce - Debounce para búsquedas y filtros
 * Uso: const debouncedSearch = useDebounce(searchTerm, 500);
 */
import { useState, useEffect } from 'react';

export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

/**
 * useAsync - Hook para ejecutar lógica asíncrona
 * Uso: const { data, error, loading } = useAsync(() => fetchData());
 */
export const useAsync = (asyncFunction, immediate = true, dependencies = []) => {
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const execute = async () => {
    setStatus('pending');
    setData(null);
    setError(null);

    try {
      const response = await asyncFunction();
      setData(response);
      setStatus('success');
      return response;
    } catch (err) {
      setError(err);
      setStatus('error');
    }
  };

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, dependencies);

  return { execute, status, data, error, loading: status === 'pending' };
};

/**
 * usePaginationMedical - Hook para paginación en listados médicos
 * Uso: const pagination = usePaginationMedical(allPatients, 10);
 */
export const usePaginationMedical = (items = [], itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  const goToPage = (pageNum) => {
    const page = Math.max(1, Math.min(pageNum, totalPages));
    setCurrentPage(page);
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  return {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
    nextPage,
    prevPage,
    itemsPerPage,
    startIndex,
    endIndex,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
};

/**
 * usePreviousValue - Guarda valor anterior para comparación
 * Uso: const prevValue = usePreviousValue(currentValue);
 */
import { useRef, useEffect } from 'react';

export const usePreviousValue = (value) => {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};

/**
 * useLocalStorage - Sincroniza state con localStorage
 * Uso: const [name, setName] = useLocalStorage('userName', '');
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

/**
 * useWindowSize - Obtiene dimensiones de ventana para responsive
 */
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

/**
 * useToggle - Hook para manejar estados booleanos
 * Uso: const [isOpen, toggleOpen] = useToggle(false);
 */
import { useState, useCallback } from 'react';

export const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue(v => !v);
  }, []);

  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return [value, toggle, setTrue, setFalse];
};

/**
 * useCountdown - Timer para contadores (útil en formularios médicos con timeout)
 * Uso: const { seconds, start, stop } = useCountdown(60);
 */
export const useCountdown = (initialSeconds = 60) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(prev => prev - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds]);

  return {
    seconds,
    isActive,
    start: () => setIsActive(true),
    stop: () => setIsActive(false),
    reset: () => {
      setSeconds(initialSeconds);
      setIsActive(false);
    },
  };
};

/**
 * useOutsideClick - Detecta clics fuera de un elemento
 * Uso: const ref = useRef(); useOutsideClick(ref, onClickOutside);
 */
export const useOutsideClick = (ref, callback) => {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback]);
};

export default {
  useDebounce,
  useAsync,
  usePaginationMedical,
  usePreviousValue,
  useLocalStorage,
  useWindowSize,
  useToggle,
  useCountdown,
  useOutsideClick,
};
