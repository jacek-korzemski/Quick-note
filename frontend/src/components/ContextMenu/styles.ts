import { css, styled } from "styled-components";
import { MenuContainerProps } from "./types";

export const TriggerWrapper = styled.div`
  display: inline-flex;
`;

export const MenuContainer = styled.div<MenuContainerProps>`
  position: fixed;
  left: ${({ $x }) => $x}px;
  top: ${({ $y }) => $y}px;
  z-index: ${({ theme }) => theme.zIndex.popover};
  min-width: 180px;
  max-width: 320px;
  max-height: 400px;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: ${({ theme }) => theme.spacing.xs} 0;
  
  ${({ $openDirection }) => $openDirection === 'up' && css`
    transform: translateY(-100%);
  `}
`;

export const MenuItemIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-right: ${({ theme }) => theme.spacing.sm};
  flex-shrink: 0;
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

export const MenuItemLabel = styled.span`
  flex: 1;
  font-size: ${({ theme }) => theme.fontSize.md};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const MenuItemShortcut = styled.span`
  margin-left: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  flex-shrink: 0;
`;

export const SubmenuIndicator = styled.span`
  margin-left: ${({ theme }) => theme.spacing.sm};
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const MenuDivider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border};
  margin: ${({ theme }) => `${theme.spacing.xs} 0`};
`;

export const MenuItemStyled = styled.div<{ 
  $disabled?: boolean; 
  $danger?: boolean;
  $hasSubmenu?: boolean;
}>`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  transition: background-color ${({ theme }) => theme.transitions.fast};
  position: relative;
  
  ${({ $disabled, theme }) => $disabled && css`
    opacity: 0.5;
    color: ${theme.colors.textDisabled};
  `}
  
  ${({ $danger, theme }) => $danger && css`
    color: ${theme.colors.error};
  `}
  
  ${({ $disabled }) => !$disabled && css`
    &:hover {
      background-color: ${({ theme }) => theme.colors.surfaceHover};
    }
  `}
`;