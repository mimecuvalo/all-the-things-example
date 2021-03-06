import { useEffect, useRef } from 'react';

import { useLocation } from 'react-router-dom';

export default function ScrollToTop({ children }) {
  const routerLocation = useLocation();
  const prevLocationPathname = useRef();

  useEffect(() => {
    if (routerLocation.pathname !== prevLocationPathname) {
      window.scrollTo(0, 0);
    }
    prevLocationPathname.current = routerLocation.pathname;
  });

  return children;
}
