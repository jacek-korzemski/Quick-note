import styled, { css } from "styled-components";
import { ResizeHandleProps, SidebarContainerProps } from "./types";

export const SidebarContainer = styled.div<SidebarContainerProps>`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.surface};
  position: relative;
  overflow: hidden;
  flex-shrink: 0;

  /* Dynamiczna szerokość */
  width: ${({ $collapsed, $collapsedWidth, $width }) =>
    $collapsed ? `${$collapsedWidth}px` : `${$width}px`};

  min-width: ${({ $collapsed, $collapsedWidth }) =>
    $collapsed ? `${$collapsedWidth}px` : "auto"};

  /* Transition tylko gdy nie resizujemy */
  transition: ${({ $isResizing }) =>
    $isResizing ? "none" : "width 0.2s ease"};

  /* Border po odpowiedniej stronie - zamiast interpolacji w nazwie właściwości */
  ${({ $position, theme }) =>
    $position === "left"
      ? css`
          border-right: 1px solid ${theme.colors.border};
        `
      : css`
          border-left: 1px solid ${theme.colors.border};
        `}
`;

export const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  min-height: 40px;
`;

export const SidebarContent = styled.div<{ $collapsed: boolean }>`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: ${({ theme }) => theme.spacing.sm};

  ${({ $collapsed }) =>
    $collapsed &&
    css`
      display: none;
    `}
`;

export const SidebarFooter = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

export const ResizeHandle = styled.div<ResizeHandleProps>`
  position: absolute;
  top: 0;
  width: 4px;
  height: 100%;
  cursor: col-resize;
  z-index: 10;
  transition: background-color ${({ theme }) => theme.transitions.fast};

  /* Pozycja handle - lewa lub prawa strona */
  ${({ $position }) =>
    $position === "left"
      ? css`
          right: 0;
        `
      : css`
          left: 0;
        `}

  /* Hover state */
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
  }

  /* Active/resizing state */
  ${({ $isResizing, theme }) =>
    $isResizing &&
    css`
      background-color: ${theme.colors.primary};
    `}
`;

export const CollapseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
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

  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

export const CollapsedContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm};
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const LayoutContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  overflow: hidden;
`;

export const MainContent = styled.main`
  flex: 1;
  overflow: auto;
  background-color: ${({ theme }) => theme.colors.background};
`;