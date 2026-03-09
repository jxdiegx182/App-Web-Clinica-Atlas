/**
 * useFirestoreQuery - Hook para consultas en tiempo real de Firestore
 * 
 * Características:
 * - Suscripción automática a cambios
 * - Limpieza automática
 * - Manejo de errores
 * - Loading states
 * 
 * Uso:
 * const { data, loading, error } = useFirestoreQuery(
 *   query(collection(db, 'patients'), where('estado', '==', 'Atención'))
 * );
 */

import { useEffect, useState, useRef } from 'react';

export const useFirestoreQuery = (queryReference, options = {}) => {
  const { errorHandler = null } = options;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    setLoading(true);
    setError(null);

    let unsubscribe;

    try {
      // queryReference debe ser resultado de query()
      unsubscribe = queryReference((snapshot) => {
        if (!isMountedRef.current) return;

        const documents = [];
        snapshot.forEach((doc) => {
          documents.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        setData(documents);
        setLoading(false);
      });
    } catch (err) {
      if (isMountedRef.current) {
        setError(err);
        setLoading(false);
        if (errorHandler) errorHandler(err);
      }
    }

    return () => {
      isMountedRef.current = false;
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [queryReference, errorHandler]);

  return { data, loading, error };
};

/**
 * useFirestoreDocument - Hook para obtener un documento específico
 * 
 * Uso:
 * const { data: patient, loading } = useFirestoreDocument(
 *   doc(db, 'patients', patientId)
 * );
 */
export const useFirestoreDocument = (docReference, options = {}) => {
  const { errorHandler = null } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    if (!docReference) {
      setData(null);
      setLoading(false);
      return;
    }

    isMountedRef.current = true;
    setLoading(true);
    setError(null);

    let unsubscribe;

    try {
      unsubscribe = docReference((docSnap) => {
        if (!isMountedRef.current) return;

        if (docSnap.exists()) {
          setData({
            id: docSnap.id,
            ...docSnap.data(),
          });
        } else {
          setData(null);
        }
        setLoading(false);
      });
    } catch (err) {
      if (isMountedRef.current) {
        setError(err);
        setLoading(false);
        if (errorHandler) errorHandler(err);
      }
    }

    return () => {
      isMountedRef.current = false;
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [docReference, errorHandler]);

  return { data, loading, error };
};

/**
 * useFirestoreCollection - Hook para colecciones con caché
 * 
 * Uso:
 * const { docs, loading, error, refetch } = useFirestoreCollection('patients');
 */
export const useFirestoreCollection = (collectionName, options = {}) => {
  const { where: whereConditions = [], orderBy: orderByField = null, limit: limitDocs = null } = options;

  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCollection = async () => {
    try {
      setLoading(true);
      setError(null);

      // Nota: Aquí deberías importar db, collection, query, etc. de Firebase
      // Este hook es un template que debe adaptarse a tu setup

      // const q = query(collection(db, collectionName));
      // const querySnapshot = await getDocs(q);
      // const data = querySnapshot.docs.map(doc => ({...}));
      // setDocs(data);

      console.warn('useFirestoreCollection: Implementación incompleta. Configura Firebase imports.');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollection();
  }, [collectionName]);

  return {
    docs,
    loading,
    error,
    refetch: fetchCollection,
  };
};

export default {
  useFirestoreQuery,
  useFirestoreDocument,
  useFirestoreCollection,
};
