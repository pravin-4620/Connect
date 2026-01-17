import { useState, useEffect, useCallback, useRef } from 'react';

interface QueryState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
}

interface UseQueryOptions<T> {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    enabled?: boolean;
    dependencies?: any[];
}

/**
 * Custom hook for data fetching with loading/error states and refetch capability.
 * Supports inline query functions via ref pattern to prevent infinite loops.
 */
export function useQuery<T>(
    queryFn: () => Promise<any>,
    options: UseQueryOptions<T> = {}
) {
    const {
        onSuccess,
        onError,
        enabled = true,
        dependencies = []
    } = options;

    const [state, setState] = useState<QueryState<T>>({
        data: null,
        loading: enabled,
        error: null,
    });

    const queryFnRef = useRef(queryFn);
    const onSuccessRef = useRef(onSuccess);
    const onErrorRef = useRef(onError);

    // Update refs to always have latest functions without triggering effect
    useEffect(() => {
        queryFnRef.current = queryFn;
        onSuccessRef.current = onSuccess;
        onErrorRef.current = onError;
    }, [queryFn, onSuccess, onError]);

    const execute = useCallback(async () => {
        if (!enabled) return;

        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response = await queryFnRef.current();
            // Handle standard Axios response structure
            // If response.data.data exists (our standardized API format), use it.
            // Otherwise fallback to response.data or response itself.
            const result = response.data && response.data.data !== undefined
                ? response.data.data
                : (response.data !== undefined ? response.data : response);

            setState({ data: result, loading: false, error: null });
            if (onSuccessRef.current) onSuccessRef.current(result);
        } catch (error: any) {
            const err = error instanceof Error ? error : new Error(error.message || 'Unknown error');
            setState({ data: null, loading: false, error: err });
            if (onErrorRef.current) onErrorRef.current(err);
        }
    }, [enabled]);

    // Trigger fetch when dependencies change or enabled becomes true
    useEffect(() => {
        execute();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [execute, ...dependencies]);

    return { ...state, refetch: execute };
}
