export interface CollapsibleProps {
  children: React.ReactNode;
  title: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  indent?: number;
  className?: string;
  onHeaderClick?: () => void;
  selected?: boolean;
}

export interface CollapsibleHeaderProps {
  $indent: number;
  $selected?: boolean;
}

export interface TreeItemProps {
  children?: React.ReactNode;
  label: React.ReactNode;
  icon?: React.ReactNode;
  indent?: number;
  onClick?: () => void;
  onHeaderClick?: () => void;
  selected?: boolean;
  actions?: React.ReactNode;
}
