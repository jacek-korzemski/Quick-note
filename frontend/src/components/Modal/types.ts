export type ModalVariant = 'center' | 'fullscreen' | 'fit-content' | 'draggable';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  variant?: ModalVariant;
  showOverlay?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  width?: string;
  maxWidth?: string;
  maxHeight?: string;
  footer?: React.ReactNode;
  className?: string;
  loading?: boolean;
}

export interface ModalContainerProps {
  $variant: ModalVariant;
  $width?: string;
  $maxWidth?: string;
  $maxHeight?: string;
  $isDragging?: boolean;
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  title?: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}