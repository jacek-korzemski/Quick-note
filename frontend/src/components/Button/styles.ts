import styled, {css} from "styled-components";
import { ButtonSize, ButtonVariant, StyledButtonProps } from "./types";

const getVariantStyles = (variant: ButtonVariant) => {
  switch (variant) {
    case 'primary':
      return css`
        background-color: ${({ theme }) => theme.colors.primary};
        color: white;
        border: 1px solid ${({ theme }) => theme.colors.primary};
        
        &:hover:not(:disabled) {
          background-color: ${({ theme }) => theme.colors.primaryHover};
          border-color: ${({ theme }) => theme.colors.primaryHover};
        }
        
        &:active:not(:disabled) {
          background-color: ${({ theme }) => theme.colors.primaryActive};
          border-color: ${({ theme }) => theme.colors.primaryActive};
        }
      `;
    case 'secondary':
      return css`
        background-color: ${({ theme }) => theme.colors.secondary};
        color: ${({ theme }) => theme.colors.text};
        border: 1px solid ${({ theme }) => theme.colors.border};
        
        &:hover:not(:disabled) {
          background-color: ${({ theme }) => theme.colors.secondaryHover};
          border-color: ${({ theme }) => theme.colors.borderLight};
        }
        
        &:active:not(:disabled) {
          background-color: ${({ theme }) => theme.colors.secondaryActive};
        }
      `;
    case 'tertiary':
      return css`
        background-color: transparent;
        color: ${({ theme }) => theme.colors.text};
        border: 1px solid ${({ theme }) => theme.colors.border};
        
        &:hover:not(:disabled) {
          background-color: ${({ theme }) => theme.colors.surfaceHover};
        }
        
        &:active:not(:disabled) {
          background-color: ${({ theme }) => theme.colors.surfaceActive};
        }
      `;
    case 'ghost':
      return css`
        background-color: transparent;
        color: ${({ theme }) => theme.colors.primary};
        border: 1px solid transparent;
        
        &:hover:not(:disabled) {
          background-color: ${({ theme }) => theme.colors.surfaceHover};
        }
        
        &:active:not(:disabled) {
          background-color: ${({ theme }) => theme.colors.surfaceActive};
        }
      `;
    case 'danger':
      return css`
        background-color: ${({ theme }) => theme.colors.error};
        color: white;
        border: 1px solid ${({ theme }) => theme.colors.error};
        
        &:hover:not(:disabled) {
          background-color: ${({ theme }) => theme.colors.errorDark};
          border-color: ${({ theme }) => theme.colors.errorDark};
        }
        
        &:active:not(:disabled) {
          background-color: ${({ theme }) => theme.colors.errorDark};
        }
      `;
    case 'success':
      return css`
        background-color: ${({ theme }) => theme.colors.success};
        color: white;
        border: 1px solid ${({ theme }) => theme.colors.success};
        
        &:hover:not(:disabled) {
          background-color: ${({ theme }) => theme.colors.successDark};
          border-color: ${({ theme }) => theme.colors.successDark};
        }
        
        &:active:not(:disabled) {
          background-color: ${({ theme }) => theme.colors.successDark};
        }
      `;
  }
};

const getSizeStyles = (size: ButtonSize) => {
  switch (size) {
    case 'sm':
      return css`
        padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
        font-size: ${({ theme }) => theme.fontSize.sm};
        height: 28px;
      `;
    case 'md':
      return css`
        padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
        font-size: ${({ theme }) => theme.fontSize.md};
        height: 34px;
      `;
    case 'lg':
      return css`
        padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
        font-size: ${({ theme }) => theme.fontSize.xl};
        height: 42px;
      `;
  }
};

export const StyledButton = styled.button<StyledButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  white-space: nowrap;
  user-select: none;
  
  ${({ $variant }) => getVariantStyles($variant)}
  ${({ $size }) => getSizeStyles($size)}
  
  ${({ $fullWidth }) => $fullWidth && css`
    width: 100%;
  `}
  
  ${({ $asLink }) => $asLink && css`
    background: transparent;
    border: none;
    padding: 0;
    height: auto;
    color: ${({ theme }) => theme.colors.primary};
    
    &:hover:not(:disabled) {
      background: transparent;
      text-decoration: underline;
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  ${({ $loading }) => $loading && css`
    position: relative;
    color: transparent;
    pointer-events: none;
    
    &::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      border: 2px solid currentColor;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `}
  
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

export const IconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

export const StyledIconButton = styled.button<{ $size: 'sm' | 'md' | 'lg'; $variant: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  ${({ $size }) => {
    switch ($size) {
      case 'sm':
        return css`width: 24px; height: 24px;`;
      case 'md':
        return css`width: 32px; height: 32px;`;
      case 'lg':
        return css`width: 40px; height: 40px;`;
    }
  }}
  
  ${({ $variant, theme }) => {
    if ($variant === 'primary') {
      return css`
        color: ${theme.colors.primary};
        &:hover:not(:disabled) {
          background-color: ${theme.colors.surfaceHover};
          color: ${theme.colors.primaryHover};
        }
      `;
    }
    return css`
      &:hover:not(:disabled) {
        background-color: ${theme.colors.surfaceHover};
        color: ${theme.colors.text};
      }
    `;
  }}
  
  &:active:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.surfaceActive};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

export const StyledButtonGroup = styled.div<{ $attached?: boolean }>`
  display: inline-flex;
  
  ${({ $attached }) => $attached && css`
    > button {
      border-radius: 0;
      
      &:first-child {
        border-top-left-radius: ${({ theme }) => theme.borderRadius.sm};
        border-bottom-left-radius: ${({ theme }) => theme.borderRadius.sm};
      }
      
      &:last-child {
        border-top-right-radius: ${({ theme }) => theme.borderRadius.sm};
        border-bottom-right-radius: ${({ theme }) => theme.borderRadius.sm};
      }
      
      &:not(:first-child) {
        margin-left: -1px;
      }
    }
  `}
  
  ${({ $attached }) => !$attached && css`
    gap: ${({ theme }) => theme.spacing.sm};
  `}
`;