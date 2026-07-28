import type { ReactNode } from 'react';

export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'default' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface CardProps extends BaseComponentProps {
  variant?: 'default' | 'outlined';
}

export interface TabsProps extends BaseComponentProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export interface SelectProps extends BaseComponentProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'url';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
}

export interface ToastProps {
  id: number;
  message: string;
  placement: ToastPlacement;
  duration?: number;
}

export type ToastPlacement = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

export interface ResultViewerProps {
  showShareButton?: boolean;
}

export interface AccessibilityAnalyzerProps {
  onAnalysisStart?: () => void;
  onAnalysisComplete?: () => void;
  onAnalysisError?: (error: string) => void;
}
