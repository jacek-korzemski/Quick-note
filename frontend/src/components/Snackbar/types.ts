export type SnackbarType = 'info' | 'success' | 'warning' | 'error';

export interface SnackbarItem {
  id: string;
  message: React.ReactNode;
  type: SnackbarType;
  duration?: number; // 0 or undefined for manual dismiss
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface SnackbarContextType {
  showSnackbar: (options: Omit<SnackbarItem, 'id'>) => string;
  hideSnackbar: (id: string) => void;
  hideAll: () => void;
}

export interface SnackbarItemStyledProps {
  $type: SnackbarType;
  $isExiting?: boolean;
}

export interface SnackbarItemComponentProps {
  item: SnackbarItem;
  onClose: (id: string) => void;
}

export interface SnackbarProviderProps {
  children: React.ReactNode;
  maxSnackbars?: number;
}