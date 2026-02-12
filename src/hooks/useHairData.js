import { useState, useEffect } from 'react';
import { getHairForecast } from '../services/dataService';

export const useHairData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getHairForecast();
        setData(result);
      } catch (err) {
        console.error("Failed to fetch hair data:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};
