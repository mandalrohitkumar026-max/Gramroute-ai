import { useState, useEffect, useCallback, useRef } from 'react';

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number | null;
  heading: number | null;
  altitude: number | null;
  timestamp: number;
}

export interface GeolocationState {
  coordinates: GeolocationCoordinates | null;
  error: string | null;
  isLoading: boolean;
  isWatching: boolean;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'unknown';
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  autoWatch?: boolean;
}

/**
 * Custom hook for GPS position capture and real-time transit telemetry tracking
 */
export const useGeolocation = (options: GeolocationOptions = {}) => {
  const {
    enableHighAccuracy = true,
    timeout = 15000,
    maximumAge = 10000,
    autoWatch = false
  } = options;

  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    error: null,
    isLoading: false,
    isWatching: false,
    permissionStatus: 'unknown'
  });

  const watchIdRef = useRef<number | null>(null);

  // Check browser permissions if supported
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((result) => {
          setState((prev) => ({ ...prev, permissionStatus: result.state }));
          result.onchange = () => {
            setState((prev) => ({ ...prev, permissionStatus: result.state }));
          };
        })
        .catch(() => {
          setState((prev) => ({ ...prev, permissionStatus: 'unknown' }));
        });
    }
  }, []);

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    setState((prev) => ({
      ...prev,
      coordinates: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        speed: position.coords.speed,
        heading: position.coords.heading,
        altitude: position.coords.altitude,
        timestamp: position.timestamp
      },
      error: null,
      isLoading: false
    }));
  }, []);

  const handleError = useCallback((error: GeolocationPositionError) => {
    let errorMessage = 'Failed to retrieve location.';
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location permission denied by user.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information is currently unavailable.';
        break;
      case error.TIMEOUT:
        errorMessage = 'Location request timed out.';
        break;
    }
    setState((prev) => ({
      ...prev,
      error: errorMessage,
      isLoading: false
    }));
  }, []);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocation is not supported by your browser.',
        isLoading: false
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy,
      timeout,
      maximumAge
    });
  }, [enableHighAccuracy, timeout, maximumAge, handleSuccess, handleError]);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation || watchIdRef.current !== null) return;

    setState((prev) => ({ ...prev, isWatching: true, isLoading: true, error: null }));
    watchIdRef.current = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy,
      timeout,
      maximumAge
    });
  }, [enableHighAccuracy, timeout, maximumAge, handleSuccess, handleError]);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setState((prev) => ({ ...prev, isWatching: false, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    if (autoWatch) {
      startWatching();
    }
    return () => {
      stopWatching();
    };
  }, [autoWatch, startWatching, stopWatching]);

  return {
    ...state,
    getCurrentLocation,
    startWatching,
    stopWatching
  };
};

export default useGeolocation;
