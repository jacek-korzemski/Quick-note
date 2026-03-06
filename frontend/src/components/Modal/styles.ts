import { css, keyframes, styled } from "styled-components";
import { ModalContainerProps } from "./types";

export const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

export const slideIn = keyframes`
  from { 
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.95);
  }
  to { 
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
`;

export const slideInDraggable = keyframes`
  from { 
    opacity: 0;
    transform: scale(0.95);
  }
  to { 
    opacity: 1;
    transform: scale(1);
  }
`;

export const Overlay = styled.div<{ $showOverlay: boolean }>`
  position: fixed;
  inset: 0;
  z-index: ${({ theme }) => theme.zIndex.modal};
  animation: ${fadeIn} 0.2s ease;
  
  ${({ $showOverlay, theme }) => $showOverlay && css`
    background-color: ${theme.colors.overlay};
  `}
`;

export const ModalContainer = styled.div<ModalContainerProps>`
  position: relative;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: ${({ theme }) => theme.zIndex.modal + 1};
  
  ${({ $variant, $width, $maxWidth, $maxHeight }) => {
    switch ($variant) {
      case 'fullscreen':
        return css`
          position: fixed;
          inset: 0;
          border-radius: 0;
          animation: ${fadeIn} 0.2s ease;
        `;
      case 'fit-content':
        return css`
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: ${$width || 'auto'};
          max-width: ${$maxWidth || '90vw'};
          max-height: ${$maxHeight || '90vh'};
          animation: ${slideIn} 0.2s ease;
        `;
      case 'draggable':
        return css`
          position: fixed;
          width: ${$width || '500px'};
          max-width: ${$maxWidth || '90vw'};
          max-height: ${$maxHeight || '90vh'};
          animation: ${slideInDraggable} 0.2s ease;
        `;
      default: // center
        return css`
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: ${$width || '500px'};
          max-width: ${$maxWidth || '90vw'};
          max-height: ${$maxHeight || '90vh'};
          animation: ${slideIn} 0.2s ease;
        `;
    }
  }}
  
  ${({ $isDragging }) => $isDragging && css`
    user-select: none;
    cursor: grabbing;
  `}
`;

export const ModalHeader = styled.div<{ $isDraggable: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.backgroundLighter};
  
  ${({ $isDraggable }) => $isDraggable && css`
    cursor: grab;
    
    &:active {
      cursor: grabbing;
    }
  `}
`;

export const ModalTitle = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSize.xl};
  font-weight: ${({ theme }) => theme.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
`;

export const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.text};
  }
`;

export const ModalBody = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.lg};
  overflow-y: auto;
`;

export const ModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.backgroundLighter};
`;

export const ModalLoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 10;
  pointer-events: all;
`;

export const StyledButton = styled.button<{ $variant: string }>`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fontSize.md};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  ${({ $variant, theme }) => {
    if ($variant === 'secondary') {
      return css`
        background: ${theme.colors.secondary};
        color: ${theme.colors.text};
        border: 1px solid ${theme.colors.border};
        
        &:hover {
          background: ${theme.colors.secondaryHover};
        }
      `;
    }
    if ($variant === 'danger') {
      return css`
        background: ${theme.colors.error};
        color: white;
        border: 1px solid ${theme.colors.error};
        
        &:hover {
          background: ${theme.colors.errorDark};
        }
      `;
    }
    return css`
      background: ${theme.colors.primary};
      color: white;
      border: 1px solid ${theme.colors.primary};
      
      &:hover {
        background: ${theme.colors.primaryHover};
      }
    `;
  }}
`;