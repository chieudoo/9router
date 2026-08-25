"use client";

import { useEffect, useRef } from "react";

function isDashboardApiRequest(input) {
  const url = typeof input === "string" ? input : input.url;
  return new URL(url, window.location.href).pathname.startsWith("/api/");
}

export function DashboardRequestScope({ children }) {
  const controllerRef = useRef(new AbortController());

  const cancel = () => {
    controllerRef.current.abort();
    controllerRef.current = new AbortController();
  };

  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = (input, init) => {
      if (!isDashboardApiRequest(input)) return originalFetch(input, init);
      const requestSignal = init?.signal || (input instanceof Request ? input.signal : null);
      const signal = requestSignal
        ? AbortSignal.any([requestSignal, controllerRef.current.signal])
        : controllerRef.current.signal;
      return originalFetch(input, { ...init, signal });
    };
    const cancelForDashboardNavigation = (event) => {
      const link = event.target.closest("a[href]");
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = new URL(link.href, window.location.href);
      if (target.origin === window.location.origin && target.pathname.startsWith("/dashboard/") && target.pathname !== window.location.pathname) cancel();
    };
    document.addEventListener("click", cancelForDashboardNavigation, true);
    return () => {
      controllerRef.current.abort();
      window.fetch = originalFetch;
      document.removeEventListener("click", cancelForDashboardNavigation, true);
    };
  }, []);

  return children;
}
