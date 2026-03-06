import { css, styled } from "styled-components";
import { CollapsibleHeaderProps } from "./types";

export const CollapsibleContainer = styled.div`
  width: 100%;
`;

export const CollapsibleHeader = styled.button.attrs({ type: 'button' })<CollapsibleHeaderProps>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  padding-left: ${({ $indent }) => `${8 + $indent * 12}px`};
  background: ${({ $selected, theme }) => 
    $selected ? theme.colors.surfaceActive : 'transparent'};
  border: none;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSize.md};
  text-align: left;
  cursor: pointer;
  transition: background-color ${({ theme }) => theme.transitions.fast};
  gap: ${({ theme }) => theme.spacing.xs};
  min-height: 28px;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceHover};
  }
  
  &:focus-visible {
    outline: 1px solid ${({ theme }) => theme.colors.primary};
    outline-offset: -1px;
  }
`;

export const ChevronWrapper = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
`;

export const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const TitleWrapper = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const TreeItemButton = styled.button.attrs({ type: 'button' })<{ $indent: number; $selected?: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  padding-left: ${({ $indent }) => `${8 + $indent * 12}px`};
  background: ${({ $selected, theme }) => 
    $selected ? theme.colors.surfaceActive : 'transparent'};
  border: none;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSize.md};
  text-align: left;
  cursor: pointer;
  transition: background-color ${({ theme }) => theme.transitions.fast};
  gap: ${({ theme }) => theme.spacing.xs};
  min-height: 24px;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceHover};
  }
  
  ${({ $selected, theme }) => $selected && css`
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 2px;
      background-color: ${theme.colors.primary};
    }
  `}
`;

export const ActionsWrapper = styled.span`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};
  opacity: 0;
  transition: opacity ${({ theme }) => theme.transitions.fast};
  
  ${CollapsibleHeader}:hover &,
  ${TreeItemButton}:hover & {
    opacity: 1;
  }
`;

export const CollapsibleContent = styled.div<{ $isOpen: boolean }>`
  overflow: hidden;
  transition: max-height 0.2s ease;
  max-height: ${({ $isOpen }) => $isOpen ? '2000px' : '0'};
`;

export const TreeItemContainer = styled.div`
  position: relative;
`;