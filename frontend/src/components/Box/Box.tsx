import React from 'react';
import { BoxProps } from './types';
import CloseIcon from '../Icon/CloseIcon';
import CollapseIcon from '../Icon/CollapseIcon';
import { BoxContainer, BoxWrapper, LoadingOverlay, BoxHeader, BoxTitle, IconButton, HeaderActions, BoxContent, BoxFooter } from './styles';
import { Spinner } from '../Spinner/Spinner';

export const Box: React.FC<BoxProps> = ({
  children,
  title,
  closable = false,
  collapsible = false,
  onClose,
  padding,
  variant = 'default',
  headerActions,
  headerLabel = 'none',
  footer,
  fullHeight = false,
  maxHeight,
  loading = false,
  className,
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  
  const hasHeader = title || closable || collapsible || headerActions;
  
  return (
    <BoxContainer 
      $variant={variant} 
      $fullHeight={fullHeight} 
      $maxHeight={maxHeight}
      className={className}
    >
      <BoxWrapper>
        {loading && (
          <LoadingOverlay>
            <Spinner />
          </LoadingOverlay>
        )}
        
        {hasHeader && (
          <BoxHeader $label={headerLabel}>
            <BoxTitle>
              {collapsible && (
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <CollapseIcon isCollapsed={isCollapsed} />
                </IconButton>
              )}
              {title}
            </BoxTitle>
            <HeaderActions>
              {headerActions}
              {closable && onClose && (
                <IconButton onClick={onClose}>
                  <CloseIcon />
                </IconButton>
              )}
            </HeaderActions>
          </BoxHeader>
        )}
        
        <BoxContent $padding={padding} $collapsed={isCollapsed}>
          {children}
        </BoxContent>
        
        {footer && !isCollapsed && (
          <BoxFooter>{footer}</BoxFooter>
        )}
      </BoxWrapper>
    </BoxContainer>
  );
};