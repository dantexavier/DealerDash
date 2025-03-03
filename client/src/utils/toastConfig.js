import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './toastStyles.css';

// Default toast configuration
toast.configure && toast.configure({
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  className: 'toast-container'
});

// Enhanced toast functions
export const successToast = (message) => {
  return toast.success(message, {
    className: 'toast-success',
    icon: '✓'
  });
};

export const errorToast = (message) => {
  return toast.error(message, {
    className: 'toast-error',
    icon: '✗'
  });
};

export const infoToast = (message) => {
  return toast.info(message, {
    className: 'toast-info',
    icon: 'ℹ'
  });
};

export const warningToast = (message) => {
  return toast.warning(message, {
    className: 'toast-warning',
    icon: '⚠'
  });
};

const toastConfig = {
  success: successToast,
  error: errorToast,
  info: infoToast,
  warning: warningToast
};

export default toastConfig;