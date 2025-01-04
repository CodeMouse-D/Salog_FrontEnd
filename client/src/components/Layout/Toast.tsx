import { toast, type ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export enum ToastType {
  success = "success",
  error = "error",
  warning = "warning",
  info = "info",
  action = "action",
}

const toastOptions: ToastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light",
};

let activeToastId: string | number | null = null;

const Toast = (type: ToastType, message: string) => {
  if (activeToastId) return; // 이미 활성화된 토스트가 있는 경우 새 토스트 생성 방지
  const toastId = toast(message, {
    ...toastOptions,
    type: type !== ToastType.action ? type : undefined,
    onClose: () => {
      activeToastId = null; // 토스트가 닫힐 때 activeToastId 초기화
    },
  });

  activeToastId = toastId; // 활성화된 토스트 ID 저장
};

export default Toast;
