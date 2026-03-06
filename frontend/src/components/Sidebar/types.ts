export interface SidebarProps {
  children: React.ReactNode;
  position?: 'left' | 'right';
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  collapsedWidth?: number;
  resizable?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export interface SidebarContainerProps {
  $position: 'left' | 'right';
  $width: number;
  $collapsed: boolean;
  $collapsedWidth: number;
  $isResizing: boolean;
}

export interface ResizeHandleProps {
  $position: 'left' | 'right';
  $isResizing: boolean;
}

export interface SidebarLayoutProps {
  children: React.ReactNode;
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
}