import styled, { css, keyframes } from "styled-components";
import { TooltipContentProps } from "./types";

export const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

export const TooltipContent = styled.div<TooltipContentProps>`
  position: fixed;
  z-index: ${({ theme }) => theme.zIndex.tooltip};
  background-color: ${({ theme }) => theme.colors.backgroundLighter};
  color: ${({ theme }) => theme.colors.text};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fontSize.sm};
  box-shadow: ${({ theme }) => theme.shadows.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  max-width: 300px;
  word-wrap: break-word;
  animation: ${fadeIn} 0.15s ease;
  pointer-events: none;
  
  left: ${({ $coords }) => $coords.x}px;
  top: ${({ $coords }) => $coords.y}px;
  
  ${({ $position }) => {
    switch ($position) {
      case 'top':
        return css`
          transform: translateX(-50%) translateY(-100%);
          margin-top: -8px;
        `;
      case 'bottom':
        return css`
          transform: translateX(-50%);
          margin-top: 8px;
        `;
      case 'left':
        return css`
          transform: translateX(-100%) translateY(-50%);
          margin-left: -8px;
        `;
      case 'right':
        return css`
          transform: translateY(-50%);
          margin-left: 8px;
        `;
    }
  }}
  
  &::before {
    content: '';
    position: absolute;
    border: 6px solid transparent;
    
    ${({ $position, theme }) => {
      switch ($position) {
        case 'top':
          return css`
            bottom: -12px;
            left: 50%;
            transform: translateX(-50%);
            border-top-color: ${theme.colors.border};
          `;
        case 'bottom':
          return css`
            top: -12px;
            left: 50%;
            transform: translateX(-50%);
            border-bottom-color: ${theme.colors.border};
          `;
        case 'left':
          return css`
            right: -12px;
            top: 50%;
            transform: translateY(-50%);
            border-left-color: ${theme.colors.border};
          `;
        case 'right':
          return css`
            left: -12px;
            top: 50%;
            transform: translateY(-50%);
            border-right-color: ${theme.colors.border};
          `;
      }
    }}
  }
`;

export const TriggerWrapper = styled.div`
  display: inline-block;
`;