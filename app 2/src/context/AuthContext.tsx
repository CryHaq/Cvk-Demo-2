import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { API_ENDPOINTS, AUTH_STORAGE_KEY, USER_STORAGE_KEY, setAuthToken, clearAuthStorage, getAuthToken } from '@/lib/api';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
  role: 'customer' | 'admin';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
  updateProfile: (userData: Partial<User>) => Promise<{ success: boolean; message?: string }>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored auth on mount
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch (e) {
        console.error('Failed to parse user:', e);
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.auth, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
        setAuthToken(data.token);
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Giriş başarısız' };
      }
    } catch (error) {
      return { success: false, message: 'Bağlantı hatası. Lütfen tekrar deneyin.' };
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await fetch(API_ENDPOINTS.auth, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', ...userData }),
      });

      const data = await response.json();

      if (data.success) {
        return { success: true, message: 'Kayıt başarılı! Giriş yapabilirsiniz.' };
      } else {
        return { success: false, message: data.message || 'Kayıt başarısız' };
      }
    } catch (error) {
      return { success: false, message: 'Bağlantı hatası. Lütfen tekrar deneyin.' };
    }
  };

    const logout = () => {
    setUser(null);
    clearAuthStorage();
    
    // Optional: Call logout endpoint to invalidate token on server
    fetch(API_ENDPOINTS.auth, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    }).catch(() => {});
  };

  const forgotPassword = async (email: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.auth, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'forgot_password', email }),
      });

      const data = await response.json();
      return { 
        success: data.success, 
        message: data.message || 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.' 
      };
    } catch (error) {
      return { success: false, message: 'Bağlantı hatası. Lütfen tekrar deneyin.' };
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.auth, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_password', token, newPassword }),
      });

      const data = await response.json();
      return { 
        success: data.success, 
        message: data.message || 'Şifreniz başarıyla değiştirildi.' 
      };
    } catch (error) {
      return { success: false, message: 'Bağlantı hatası. Lütfen tekrar deneyin.' };
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      const token = getAuthToken();
      const response = await fetch(API_ENDPOINTS.auth, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'update_profile', ...userData }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
        return { success: true, message: 'Profil güncellendi.' };
      } else {
        return { success: false, message: data.message || 'Güncelleme başarısız' };
      }
    } catch (error) {
      return { success: false, message: 'Bağlantı hatası. Lütfen tekrar deneyin.' };
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      const token = getAuthToken();
      const response = await fetch(API_ENDPOINTS.auth, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'change_password', oldPassword, newPassword }),
      });

      const data = await response.json();
      return { 
        success: data.success, 
        message: data.message || 'Şifreniz başarıyla değiştirildi.' 
      };
    } catch (error) {
      return { success: false, message: 'Bağlantı hatası. Lütfen tekrar deneyin.' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      forgotPassword,
      resetPassword,
      updateProfile,
      changePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
