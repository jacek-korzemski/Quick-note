import Collapsible from "./Collapsible";
import { TreeItemContainer, TreeItemButton, IconWrapper, TitleWrapper, ActionsWrapper } from "./styles";
import { TreeItemProps } from "./types";

const TreeItem: React.FC<TreeItemProps> = ({
  children,
  label,
  icon,
  indent = 0,
  onClick,
  onHeaderClick,
  selected,
  actions,
}) => {
  if (children) {
    return (
      <Collapsible
        title={label}
        icon={icon}
        indent={indent}
        actions={actions}
        onHeaderClick={onHeaderClick}
        selected={selected}
      >
        {children}
      </Collapsible>
    );
  }

  return (
    <TreeItemContainer>
      <TreeItemButton
        $indent={indent + 1}
        $selected={selected}
        onClick={onClick}
      >
        {icon && <IconWrapper>{icon}</IconWrapper>}
        <TitleWrapper>{label}</TitleWrapper>
        {actions && (
          <ActionsWrapper onClick={e => e.stopPropagation()}>
            {actions}
          </ActionsWrapper>
        )}
      </TreeItemButton>
    </TreeItemContainer>
  );
};

export default TreeItem;