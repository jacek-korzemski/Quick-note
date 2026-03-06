import styled, { keyframes } from "styled-components";
import { SnackbarItemStyledProps, SnackbarType } from "./types";

export const  slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

export const  slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

export const  SnackbarContainer = styled.div`
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: ${({ theme }) => theme.zIndex.snackbar};
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  pointer-events: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const SnackbarItemStyled = styled.div<SnackbarItemStyledProps>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  min-width: 300px;
  max-width: 500px;
  pointer-events: auto;
  animation: ${({ $isExiting }) => $isExiting ? slideOut : slideIn} 0.3s ease forwards;
  
  border-left: 4px solid ${({ $type, theme }) => {
    switch ($type) {
      case 'success': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'error': return theme.colors.error;
      default: return theme.colors.info;
    }
  }};
`;

export const SnackbarIcon = styled.div<{ $type: SnackbarType }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: ${({ $type, theme }) => {
    switch ($type) {
      case 'success': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'error': return theme.colors.error;
      default: return theme.colors.info;
    }
  }};
`;

export const SnackbarMessage = styled.div`
  flex: 1;
  font-size: ${({ theme }) => theme.fontSize.md};
  color: ${({ theme }) => theme.colors.text};
`;

export const SnackbarAction = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSize.md};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  cursor: pointer;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: background-color ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

export const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: all ${({ theme }) => theme.transitions.fast};
  flex-shrink: 0;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.text};
  }
`;

export const ProgressBar = styled.div<{ $duration: number }>`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background-color: ${({ theme }) => theme.colors.primary};
  animation: shrink ${({ $duration }) => $duration}ms linear forwards;
  
  @keyframes shrink {
    from { width: 100%; }
    to { width: 0%; }
  }
`;