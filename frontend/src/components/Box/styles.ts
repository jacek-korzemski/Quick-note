import { css, styled } from "styled-components";
import { BoxContainerProps, BoxLabel } from "./types";

const getLabelColors = (label: BoxLabel, theme: { colors: Record<string, string> }) => {
  switch (label) {
    case 'info':
      return { bg: theme.colors.info, text: '#fff' };
    case 'warning':
      return { bg: theme.colors.warning, text: '#fff' };
    case 'error':
      return { bg: theme.colors.error, text: '#fff' };
    case 'success':
      return { bg: theme.colors.success, text: '#fff' };
    default:
      return null;
  }
};

export const BoxContainer = styled.div<BoxContainerProps>`
  display: flex;
  flex-direction: column;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
  
  ${({ $fullHeight }) => $fullHeight && css`
    height: 100%;
  `}
  
  ${({ $maxHeight }) => $maxHeight && css`
    max-height: ${$maxHeight};
  `}
  
  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'elevated':
        return css`
          background-color: ${theme.colors.surface};
          box-shadow: ${theme.shadows.md};
        `;
      case 'outlined':
        return css`
          background-color: ${theme.colors.background};
          border: 1px solid ${theme.colors.border};
        `;
      case 'ghost':
        return css`
          background-color: transparent;
        `;
      default:
        return css`
          background-color: ${theme.colors.surface};
          border: 1px solid ${theme.colors.border};
        `;
    }
  }}
`;

export const BoxHeader = styled.div<{ $label?: BoxLabel }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  background-color: ${({ theme, $label }) => {
    const colors = $label && $label !== 'none' ? getLabelColors($label, theme) : null;
    return colors ? colors.bg : theme.colors.backgroundLighter;
  }};
  color: ${({ theme, $label }) => {
    const colors = $label && $label !== 'none' ? getLabelColors($label, theme) : null;
    return colors ? colors.text : theme.colors.text;
  }};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  min-height: 36px;
`;

export const BoxTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSize.lg};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: inherit;
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  color: inherit;
  opacity: 0.85;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: rgba(128, 128, 128, 0.25);
    opacity: 1;
  }
  
  &:active {
    background-color: rgba(128, 128, 128, 0.35);
  }
`;

export const BoxContent = styled.div<{ $padding?: string; $collapsed?: boolean }>`
  flex: 1;
  overflow: auto;
  padding: ${({ $padding, theme }) => $padding || theme.spacing.md};
  
  ${({ $collapsed }) => $collapsed && css`
    display: none;
  `}
`;

export const BoxFooter = styled.div`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  background-color: ${({ theme }) => theme.colors.backgroundLighter};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

export const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1;
`;

export const BoxWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
`;