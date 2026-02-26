import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import './index.css';
import './i18n';
import App from './App.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { WishlistProvider } from './context/WishlistContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';

// Force light-only mode.
if (typeof window !== 'undefined') {
  const root = window.document.documentElement;
  root.classList.remove('dark');
  root.classList.add('light');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <App />
          <Toaster 
            position="top-center"
            richColors
            closeButton
          />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
)
