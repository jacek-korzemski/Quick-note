import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import CloseIcon from '../Icon/CloseIcon';
import { Spinner } from '../Spinner/Spinner';
import { Overlay, ModalContainer, ModalHeader, ModalTitle, CloseButton, ModalBody, ModalFooter, ModalLoadingOverlay } from './styles';
import { ModalProps } from './types';

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  variant = 'center',
  showOverlay = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  width,
  maxWidth,
  maxHeight,
  footer,
  className,
  loading = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const positionStartRef = useRef({ x: 0, y: 0 });

  // Center the draggable modal initially
  useEffect(() => {
    if (isOpen && variant === 'draggable') {
      const x = window.innerWidth / 2 - 250; // half of default width
      const y = window.innerHeight / 2 - 150;
      setPosition({ x, y });
    }
  }, [isOpen, variant]);

  // Handle escape key (disabled when loading)
  useEffect(() => {
    if (!closeOnEscape || loading) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeOnEscape, isOpen, onClose, loading]);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen && showOverlay) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, showOverlay]);

  // Drag handlers
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (variant !== 'draggable') return;
    
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    positionStartRef.current = { x: position.x, y: position.y };
  }, [variant, position]);

  const handleDrag = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    
    setPosition({
      x: positionStartRef.current.x + deltaX,
      y: positionStartRef.current.y + deltaY,
    });
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDrag);
      document.addEventListener('mouseup', handleDragEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, handleDrag, handleDragEnd]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (!loading && closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalStyle = variant === 'draggable' ? {
    left: position.x,
    top: position.y,
  } : {};

  return createPortal(
    <Overlay $showOverlay={showOverlay} onClick={handleOverlayClick}>
      <ModalContainer
        ref={modalRef}
        $variant={variant}
        $width={width}
        $maxWidth={maxWidth}
        $maxHeight={maxHeight}
        $isDragging={isDragging}
        style={modalStyle}
        className={className}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {loading && (
          <ModalLoadingOverlay>
            <Spinner />
          </ModalLoadingOverlay>
        )}
        {(title || showCloseButton) && (
          <ModalHeader 
            $isDraggable={variant === 'draggable'}
            onMouseDown={handleDragStart}
          >
            {title && <ModalTitle id="modal-title">{title}</ModalTitle>}
            {!title && <div />}
            {showCloseButton && !loading && (
              <CloseButton onClick={onClose} aria-label="Close modal">
                <CloseIcon />
              </CloseButton>
            )}
          </ModalHeader>
        )}
        
        <ModalBody>{children}</ModalBody>
        
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContainer>
    </Overlay>,
    document.body
  );
};

export default Modal;