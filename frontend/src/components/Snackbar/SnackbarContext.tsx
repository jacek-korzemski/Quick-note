import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import CloseIcon from '../Icon/CloseIcon';
import ErrorIcon from '../Icon/ErrorIcon';
import InfoIcon from '../Icon/InfoIcon';
import SuccessIcon from '../Icon/SuccessIcon';
import WarningIcon from '../Icon/WarningIcon';
import { SnackbarItemStyled, SnackbarIcon, SnackbarMessage, SnackbarAction, CloseButton, ProgressBar, SnackbarContainer } from './styles';
import { SnackbarContextType, SnackbarType, SnackbarItemComponentProps, SnackbarProviderProps, SnackbarItem } from './types';

const SnackbarContext = createContext<SnackbarContextType | null>(null);

const getIcon = (type: SnackbarType) => {
  switch (type) {
    case 'success': return <SuccessIcon />;
    case 'warning': return <WarningIcon />;
    case 'error': return <ErrorIcon />;
    default: return <InfoIcon />;
  }
};

const SnackbarItemComponent: React.FC<SnackbarItemComponentProps> = ({ item, onClose }) => {
  const [isExiting, setIsExiting] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout>(null);

  const handleClose = React.useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onClose(item.id), 300);
  }, [item.id, onClose]);

  React.useEffect(() => {
    if (item.duration && item.duration > 0) {
      timeoutRef.current = setTimeout(handleClose, item.duration);
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [item.duration, handleClose]);

  return (
    <SnackbarItemStyled $type={item.type} $isExiting={isExiting} style={{ position: 'relative' }}>
      <SnackbarIcon $type={item.type}>{getIcon(item.type)}</SnackbarIcon>
      <SnackbarMessage>{item.message}</SnackbarMessage>
      {item.action && (
        <SnackbarAction onClick={() => {
          item.action!.onClick();
          handleClose();
        }}>
          {item.action.label}
        </SnackbarAction>
      )}
      <CloseButton onClick={handleClose}>
        <CloseIcon />
      </CloseButton>
      {item.duration && item.duration > 0 && (
        <ProgressBar $duration={item.duration} />
      )}
    </SnackbarItemStyled>
  );
};

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ 
  children, 
  maxSnackbars = 5 
}) => {
  const [snackbars, setSnackbars] = useState<SnackbarItem[]>([]);

  const showSnackbar = useCallback((options: Omit<SnackbarItem, 'id'>) => {
    const id = `snackbar-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newSnackbar: SnackbarItem = { ...options, id };
    
    setSnackbars(prev => {
      const updated = [...prev, newSnackbar];
      // Limit max snackbars
      if (updated.length > maxSnackbars) {
        return updated.slice(-maxSnackbars);
      }
      return updated;
    });
    
    return id;
  }, [maxSnackbars]);

  const hideSnackbar = useCallback((id: string) => {
    setSnackbars(prev => prev.filter(s => s.id !== id));
  }, []);

  const hideAll = useCallback(() => {
    setSnackbars([]);
  }, []);

  return (
    <SnackbarContext.Provider value={{ showSnackbar, hideSnackbar, hideAll }}>
      {children}
      {createPortal(
        <SnackbarContainer>
          {snackbars.map(snackbar => (
            <SnackbarItemComponent
              key={snackbar.id}
              item={snackbar}
              onClose={hideSnackbar}
            />
          ))}
        </SnackbarContainer>,
        document.body
      )}
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};