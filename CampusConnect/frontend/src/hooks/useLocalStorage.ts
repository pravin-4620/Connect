import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
    // Parse stored JSON or if none return initialValue
    const readValue = (): T => {
        if (typeof window === "undefined") {
            return initialValue;
        }

        try {
            const item = window.localStorage.getItem(key);
            return item ? (JSON.parse(item) as T) : initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    };

    const [storedValue, setStoredValue] = useState<T>(readValue);

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            if (typeof window !== "undefined") {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
                window.dispatchEvent(new Event("local-storage")); // Custom event to signal change
            }
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    };

    useEffect(() => {
        setStoredValue(readValue());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const handleStorageChange = () => {
            setStoredValue(readValue());
        };

        // Standard storage event (other tabs)
        window.addEventListener("storage", handleStorageChange);
        // Custom event (same tab)
        window.addEventListener("local-storage", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("local-storage", handleStorageChange);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    return [storedValue, setValue] as const;
}
