/**
 * Toast Notification Component
 * 
 * Sonner wrapper for consistent toast notifications
 */

import { toast as sonnerToast } from 'sonner';

export const toast = {
  success: (message: string) => {
    sonnerToast.success(message, {
      duration: 3000,
      position: 'top-center',
    });
  },
  
  error: (message: string) => {
    sonnerToast.error(message, {
      duration: 4000,
      position: 'top-center',
    });
  },
  
  info: (message: string) => {
    sonnerToast.info(message, {
      duration: 3000,
      position: 'top-center',
    });
  },
  
  warning: (message: string) => {
    sonnerToast.warning(message, {
      duration: 3000,
      position: 'top-center',
    });
  },
  
  loading: (message: string) => {
    return sonnerToast.loading(message, {
      position: 'top-center',
    });
  },
  
  dismiss: (toastId: string | number) => {
    sonnerToast.dismiss(toastId);
  },
};

export default toast;
