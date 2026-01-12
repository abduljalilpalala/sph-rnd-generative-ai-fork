import toast from "react-hot-toast";

/**
 * Toast notification utility wrapper for react-hot-toast
 * Provides consistent styling and behavior across the application
 */
export const showToast = {
  /**
   * Show a success toast notification
   * Auto-dismisses after 3 seconds
   */
  success: (message: string) => {
    toast.success(message);
  },

  /**
   * Show an error toast notification
   * Auto-dismisses after 5 seconds
   */
  error: (message: string) => {
    toast.error(message);
  },

  /**
   * Show an info toast notification
   * Auto-dismisses after 4 seconds
   */
  info: (message: string) => {
    toast(message, {
      icon: "ℹ️",
      style: {
        background: "#3b82f6",
        color: "#fff",
      },
    });
  },

  /**
   * Show a warning toast notification
   * Auto-dismisses after 4 seconds
   */
  warning: (message: string) => {
    toast(message, {
      icon: "⚠️",
      style: {
        background: "#f59e0b",
        color: "#fff",
      },
    });
  },

  /**
   * Show a loading toast notification
   * Must be manually dismissed using toast.dismiss(toastId)
   * Returns the toast ID for later dismissal
   */
  loading: (message: string) => {
    return toast.loading(message);
  },

  /**
   * Dismiss a specific toast by ID
   * Useful for dismissing loading toasts
   */
  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },

  /**
   * Show a promise toast
   * Automatically shows loading, success, or error based on promise state
   */
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, messages);
  },
};
