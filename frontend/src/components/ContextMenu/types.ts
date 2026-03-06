export interface MenuItemBase {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  shortcut?: string;
}

export interface MenuItemAction extends MenuItemBase {
  disabled?: boolean;
  onClick: () => void;
  children?: never;
}

export interface MenuItemSubmenu extends MenuItemBase {
  disabled?: boolean;
  children: MenuItem[];
  onClick?: never;
}

export interface MenuItemDivider {
  disabled?: boolean;
  id: string;
  type: 'divider';
}

export type MenuItem = (MenuItemAction | MenuItemSubmenu | MenuItemDivider) & {
  label?: string;
  icon?: any;
};

export interface ContextMenuProps {
  trigger: React.ReactNode;
  items: MenuItem[];
  disabled?: boolean;
}

export interface MenuContainerProps {
  $x: number;
  $y: number;
  $openDirection: 'down' | 'up';
}

export interface SubmenuProps {
  items: MenuItem[];
  parentRect: DOMRect;
  onClose: () => void;
  level: number;
}