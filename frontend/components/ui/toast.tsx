import * as React from "react";
import {
  ToastProvider,
  ToastViewport,
  Toast as RadixToast,
  ToastTitle,
  ToastDescription,
} from "@radix-ui/react-toast";

type ToastState = {
  open: boolean;
  title: string;
  description?: string;
  color?: "success" | "error";
};

type ToastContextType = {
  showToast: (options: { title: string; description?: string; color?: "success" | "error" }) => void;
};

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function Toast({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = React.useState<ToastState>({
    open: false,
    title: "",
    description: "",
    color: "success",
  });

  const showToast = (options: { title: string; description?: string; color?: "success" | "error" }) => {
    setToast({
      open: true,
      title: options.title,
      description: options.description,
      color: options.color || "success",
    });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      <ToastProvider>
        {children}
        <RadixToast
          open={toast.open}
          onOpenChange={(open) => setToast((t) => ({ ...t, open }))}
          className={`${
            toast.color === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          } px-4 py-2 rounded shadow-lg`}
        >
          <ToastTitle>{toast.title}</ToastTitle>
          {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
        </RadixToast>
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProviderWithContext");
  return ctx;
}
