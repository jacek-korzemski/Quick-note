import React from "react";
import { PageLoaderProps } from "./types";
import Loader from "./Loader";

export const PageLoader: React.FC<PageLoaderProps> = ({ isLoading, text }) => {
  React.useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = 'hidden';
      document.body.style.pointerEvents = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.pointerEvents = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.pointerEvents = '';
    };
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <Loader 
      fullscreen 
      overlay 
      size="lg" 
      text={text} 
    />
  );
};

export default PageLoader;