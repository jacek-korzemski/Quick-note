import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ContextMenuProps, MenuItem, MenuItemSubmenu } from './types';
import ChevronRightIcon from '../Icon/ChevronRightIcon';
import { TriggerWrapper, MenuContainer, MenuDivider, MenuItemStyled, MenuItemIcon, MenuItemLabel, MenuItemShortcut, SubmenuIndicator } from './styles';
import Submenu from './Submenu';

export const ContextMenu: React.FC<ContextMenuProps> = ({
  trigger,
  items,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [openDirection, setOpenDirection] = useState<'up' | 'down'>('down');
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [submenuRect, setSubmenuRect] = useState<DOMRect | null>(null);

  const handleTriggerClick = () => {
    if (disabled) return;
    
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    // Calculate position
    let x = rect.left;
    let y = rect.bottom + 4;
    let direction: 'up' | 'down' = 'down';
    
    // Check if menu would overflow viewport
    const menuHeight = 400; // max-height
    const viewportHeight = window.innerHeight;
    
    if (y + menuHeight > viewportHeight && rect.top > menuHeight) {
      y = rect.top - 4;
      direction = 'up';
    }
    
    setPosition({ x, y });
    setOpenDirection(direction);
    setIsOpen(!isOpen);
    setActiveSubmenu(null);
  };

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setActiveSubmenu(null);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        menuRef.current?.contains(e.target as Node)
      ) {
        return;
      }
      handleClose();
    };
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleClose]);

  const handleItemClick = (item: MenuItem) => {
    if ('type' in item && item.type === 'divider') return;
    if (item.disabled) return;
    if ('children' in item && item.children) return;
    if ('onClick' in item && item.onClick) {
      item.onClick();
      handleClose();
    }
  };

  const handleSubmenuEnter = (itemId: string, e: React.MouseEvent) => {
    setActiveSubmenu(itemId);
    setSubmenuRect((e.currentTarget as HTMLElement).getBoundingClientRect());
  };

  return (
    <>
      <TriggerWrapper ref={triggerRef} onClick={handleTriggerClick}>
        {trigger}
      </TriggerWrapper>
      
      {isOpen && createPortal(
        <MenuContainer
          ref={menuRef}
          $x={position.x}
          $y={position.y}
          $openDirection={openDirection}
        >
          {items.map((item) => {
            if ('type' in item && item.type === 'divider') {
              return <MenuDivider key={item.id} />;
            }

            const hasSubmenu = 'children' in item && item.children && item.children.length > 0;

            return (
              <MenuItemStyled
                key={item.id}
                $disabled={item.disabled}
                $danger={'danger' in item ? item.danger : false}
                $hasSubmenu={hasSubmenu}
                onClick={() => handleItemClick(item)}
                onMouseEnter={(e) => hasSubmenu && handleSubmenuEnter(item.id, e)}
                onMouseLeave={() => setActiveSubmenu(null)}
              >
                {item.icon && <MenuItemIcon>{item.icon}</MenuItemIcon>}
                <MenuItemLabel>{item.label}</MenuItemLabel>
                {'shortcut' in item && item.shortcut && (
                  <MenuItemShortcut>{item.shortcut}</MenuItemShortcut>
                )}
                {hasSubmenu && (
                  <SubmenuIndicator>
                    <ChevronRightIcon />
                  </SubmenuIndicator>
                )}
                {hasSubmenu && activeSubmenu === item.id && submenuRect && (
                  <Submenu
                    items={(item as MenuItemSubmenu).children}
                    parentRect={submenuRect}
                    onClose={handleClose}
                    level={1}
                  />
                )}
              </MenuItemStyled>
            );
          })}
        </MenuContainer>,
        document.body
      )}
    </>
  );
};