
import { useState, useCallback } from 'react';
import { Geolocation } from '../types';

export const useGeolocation = () => {
  const [locationError, setLocationError] = useState<string | null>(null);

  const getLocation = useCallback((): Promise<Geolocation | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setLocationError("Geolocalização não é suportada por este navegador.");
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationError(null);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setLocationError("Permissão para geolocalização foi negada.");
              break;
            case error.POSITION_UNAVAILABLE:
              setLocationError("Informação de localização não está disponível.");
              break;
            case error.TIMEOUT:
              setLocationError("A requisição para obter a localização expirou.");
              break;
            default:
              setLocationError("Ocorreu um erro desconhecido ao obter a localização.");
              break;
          }
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }, []);

  return { getLocation, locationError };
};
