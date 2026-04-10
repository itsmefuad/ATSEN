import { useEffect } from 'react';

export const usePageTitle = (title) => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title ? `${title} | ATSEN` : 'ATSEN - Educational Management Platform';
    
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
};