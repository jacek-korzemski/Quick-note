import React, { useState } from 'react';
import ChevronIcon from '../Icon/ChevronIcon';
import { CollapsibleContainer, CollapsibleHeader, ChevronWrapper, IconWrapper, TitleWrapper, ActionsWrapper, CollapsibleContent } from './styles';
import { CollapsibleProps } from './types';

const Collapsible: React.FC<CollapsibleProps> = ({
  children,
  title,
  defaultOpen = false,
  icon,
  actions,
  indent = 0,
  className,
  onHeaderClick,
  selected = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <CollapsibleContainer className={className}>
      <CollapsibleHeader 
        $indent={indent}
        $selected={selected}
        onClick={() => {
          setIsOpen(!isOpen);
          onHeaderClick?.();
        }}
        aria-expanded={isOpen}
      >
        <ChevronWrapper>
          <ChevronIcon isOpen={isOpen} />
        </ChevronWrapper>
        {icon && <IconWrapper>{icon}</IconWrapper>}
        <TitleWrapper>{title}</TitleWrapper>
        {actions && (
          <ActionsWrapper onClick={e => e.stopPropagation()}>
            {actions}
          </ActionsWrapper>
        )}
      </CollapsibleHeader>
      <CollapsibleContent $isOpen={isOpen}>
        {children}
      </CollapsibleContent>
    </CollapsibleContainer>
  );
};

export default Collapsible;