import { toast } from 'sonner';

/**
 * Toast utility functions for consistent notifications across the app
 */

export const showToast = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
    });
  },

  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
    });
  },

  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
    });
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
    });
  },

  loading: (message: string) => {
    return toast.loading(message);
  },

  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId);
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => {
    return toast.promise(promise, messages);
  },
};

/**
 * Handle API errors and show appropriate toast
 */
export function handleApiError(error: unknown, fallbackMessage = 'Something went wrong') {
  console.error('API Error:', error);

  // Extract error message
  let message = fallbackMessage;
  let description: string | undefined;

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'object' && error !== null) {
    const err = error as { response?: { data?: { message?: string }; status?: number }; message?: string };
    
    if (err.response?.data?.message) {
      message = err.response.data.message;
    } else if (err.message) {
      message = err.message;
    }

    // Add status-specific descriptions
    if (err.response?.status === 401) {
      message = 'Session expired';
      description = 'Please log in again to continue.';
    } else if (err.response?.status === 403) {
      message = 'Access denied';
      description = 'You don\'t have permission to perform this action.';
    } else if (err.response?.status === 404) {
      message = 'Not found';
      description = 'The requested resource could not be found.';
    } else if (err.response?.status === 429) {
      message = 'Too many requests';
      description = 'Please wait a moment before trying again.';
    } else if (err.response?.status && err.response.status >= 500) {
      message = 'Server error';
      description = 'Something went wrong on our end. Please try again later.';
    }
  }

  showToast.error(message, description);
  return message;
}

export default showToast;
