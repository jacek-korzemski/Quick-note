import React, { useState, useRef, useCallback, useEffect } from 'react';
import ChevronLeftIcon from '../Icon/ChevronLeftIcon';
import ChevronRightIcon from '../Icon/ChevronRightIcon';
import { SidebarContainer, ResizeHandle, SidebarHeader, CollapseButton, SidebarContent, SidebarFooter } from './styles';
import { SidebarProps } from './types';

const Sidebar: React.FC<SidebarProps> = ({
  children,
  position = 'left',
  defaultWidth = 260,
  minWidth = 200,
  maxWidth = 500,
  collapsible = true,
  defaultCollapsed = false,
  collapsedWidth = 48,
  resizable = true,
  header,
  footer,
  className,
}) => {
  const [width, setWidth] = useState(defaultWidth);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!resizable || collapsed) return;
    
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [resizable, collapsed, width]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const delta = position === 'left' 
      ? e.clientX - startXRef.current 
      : startXRef.current - e.clientX;
    
    const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidthRef.current + delta));
    setWidth(newWidth);
  }, [isResizing, position, minWidth, maxWidth]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <SidebarContainer
      ref={sidebarRef}
      $position={position}
      $width={width}
      $collapsed={collapsed}
      $collapsedWidth={collapsedWidth}
      $isResizing={isResizing}
      className={className}
    >
      {resizable && !collapsed && (
        <ResizeHandle 
          $position={position} 
          $isResizing={isResizing}
          onMouseDown={handleMouseDown} 
        />
      )}
      
      <SidebarHeader>
        {!collapsed && header}
        {collapsible && (
          <CollapseButton onClick={toggleCollapse} title={collapsed ? 'Expand' : 'Collapse'}>
            {collapsed ? (
              position === 'left' ? <ChevronRightIcon /> : <ChevronLeftIcon />
            ) : (
              position === 'left' ? <ChevronLeftIcon /> : <ChevronRightIcon />
            )}
          </CollapseButton>
        )}
      </SidebarHeader>
      
      {!collapsed && (
        <>
          <SidebarContent $collapsed={collapsed}>
            {children}
          </SidebarContent>
          
          {footer && (
            <SidebarFooter>
              {footer}
            </SidebarFooter>
          )}
        </>
      )}
    </SidebarContainer>
  );
};

export default Sidebar;