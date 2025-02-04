// src/hooks/useLocalStorage.ts
import { useSyncExternalStore, useRef } from 'react';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getSnapshot(key: string) {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const lastValueRef = useRef<T>(initialValue);
  if(localStorage.getItem(key) === null){
    localStorage.setItem(key, JSON.stringify(initialValue));
  }
  const getSnapshotWithCache = () => {
    const currentValue = getSnapshot(key) ?? initialValue;
    if (JSON.stringify(currentValue) === JSON.stringify(lastValueRef.current)) {
      return lastValueRef.current;
    }
    lastValueRef.current = currentValue;
    return currentValue;
  };

  const res = useSyncExternalStore(
    subscribe,
    getSnapshotWithCache,
  );

  const setValue = (value: T) => {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new StorageEvent('storage'));
  };

  return [res, setValue];
}