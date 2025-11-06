import { ChangeEvent } from "react";

// Form types
export interface InputProps {
  type: string;
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

export interface CheckboxProps {
  className?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

// Modal types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  isFullscreen?: boolean;
}


export interface RegistrationData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirm: string;
  agree_to_terms: boolean;
}