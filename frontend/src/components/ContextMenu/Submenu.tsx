import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import ChevronRightIcon from "../Icon/ChevronRightIcon";
import { MenuContainer, MenuDivider, MenuItemStyled, MenuItemIcon, MenuItemLabel, MenuItemShortcut, SubmenuIndicator } from "./styles";
import { MenuItem, MenuItemSubmenu, SubmenuProps } from "./types";

const Submenu: React.FC<SubmenuProps> = ({ items, parentRect, onClose, level }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [openDirection, setOpenDirection] = useState<{ h: 'left' | 'right'; v: 'up' | 'down' }>({
    h: 'right',
    v: 'down',
  });
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [submenuRect, setSubmenuRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (menuRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Horizontal positioning
      let x = parentRect.right;
      let hDir: 'left' | 'right' = 'right';
      
      if (parentRect.right + menuRect.width > viewportWidth) {
        x = parentRect.left - menuRect.width;
        hDir = 'left';
      }
      
      // Vertical positioning
      let y = parentRect.top;
      let vDir: 'up' | 'down' = 'down';
      
      if (parentRect.top + menuRect.height > viewportHeight) {
        y = parentRect.bottom - menuRect.height;
        vDir = 'up';
      }
      
      setPosition({ x: Math.max(0, x), y: Math.max(0, y) });
      setOpenDirection({ h: hDir, v: vDir });
    }
  }, [parentRect]);

  const handleItemClick = (item: MenuItem) => {
    if ('type' in item && item.type === 'divider') return;
    if (item.disabled) return;
    if ('children' in item && item.children) return;
    if ('onClick' in item && item.onClick) {
      item.onClick();
      onClose();
    }
  };

  const handleSubmenuEnter = (itemId: string, e: React.MouseEvent) => {
    setActiveSubmenu(itemId);
    setSubmenuRect((e.currentTarget as HTMLElement).getBoundingClientRect());
  };

  return createPortal(
    <MenuContainer
      ref={menuRef}
      $x={position.x}
      $y={position.y}
      $openDirection={openDirection.v}
      style={{ transformOrigin: openDirection.v === 'up' ? 'bottom' : 'top' }}
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
            onMouseLeave={() => !hasSubmenu && setActiveSubmenu(null)}
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
                onClose={onClose}
                level={level + 1}
              />
            )}
          </MenuItemStyled>
        );
      })}
    </MenuContainer>,
    document.body
  );
};

export default Submenu;