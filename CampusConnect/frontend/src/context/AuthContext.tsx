/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, Role } from '../types';
import { authAPI } from '../services/api';
import { socketService } from '../services/socket';

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    login: (data: any, isAdmin?: boolean) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    hasRole: (roles: Role[]) => boolean;
    updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check local storage on mount
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        if (storedUser && storedToken) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setToken(storedToken);
            socketService.connect();
            setTimeout(() => socketService.joinUser(parsedUser.id), 500); // Small delay to ensure connection
        }
        setLoading(false);
    }, []);

    const login = async (data: any, isAdmin = false) => {
        setLoading(true);
        setError(null);
        try {
            const response = isAdmin
                ? await authAPI.adminLogin(data)
                : await authAPI.login(data);

            const { user, token } = response.data.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setToken(token);
            setUser(user);
            socketService.connect();
            setTimeout(() => socketService.joinUser(user.id), 500);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
        socketService.disconnect();
        window.location.href = '/login';
    }, []);

    const hasRole = (roles: Role[]) => {
        return user ? roles.includes(user.role) : false;
    };

    const updateUser = (data: Partial<User>) => {
        if (!user) return;
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            error,
            login,
            logout,
            updateUser,
            isAuthenticated: !!user,
            hasRole
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
