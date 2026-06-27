import { useState, useEffect } from 'react';

const DEFAULT_CACHE_DURATION = 60000; // 60 segundos en milisegundos

interface CacheData<T> {
  data: T;
  timestamp: number;
}

export function useCache<T>(key: string, fetcher: () => Promise<T>, duration = DEFAULT_CACHE_DURATION) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async (force = false) => {
    try {
      setLoading(true);

      if (!force) {
        // Intentar obtener del caché
        const cached = localStorage.getItem(key);
        if (cached) {
          const { data: cachedData, timestamp }: CacheData<T> = JSON.parse(cached);
          const now = Date.now();

          // Si el caché es válido
          if (now - timestamp < duration) {
            setData(cachedData);
            setLoading(false);
            return;
          }
        }
      }

      // Si no hay caché válido o se fuerza, obtener datos frescos
      const freshData = await fetcher();

      // Guardar en caché
      const cacheEntry: CacheData<T> = {
        data: freshData,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(cacheEntry));

      setData(freshData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [key, fetcher]);

  return { data, loading, error, refetch: () => fetchData(true) };
}
