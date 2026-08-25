"use client";

import { useEffect, useRef } from "react";

const pendingGetRequests = new Map();
const GET_DEDUPLICATION_WINDOW_MS = 1000;

function isDashboardApiRequest(input) {
  const url = typeof input === "string" ? input : input.url;
  return new URL(url, window.location.href).pathname.startsWith("/api/");
}

function getRequestMethod(input, init) {
  return init?.method || (input instanceof Request ? input.method : "GET");
}

export function DashboardRequestScope({ children }) {
  const controllerRef = useRef(new AbortController());

  const cancel = () => {
    controllerRef.current.abort();
    controllerRef.current = new AbortController();
    pendingGetRequests.clear();
  };

  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = (input, init) => {
      if (!isDashboardApiRequest(input)) return originalFetch(input, init);
      const requestSignal = init?.signal || (input instanceof Request ? input.signal : null);
      const signal = requestSignal
        ? AbortSignal.any([requestSignal, controllerRef.current.signal])
        : controllerRef.current.signal;
      if (getRequestMethod(input, init).toUpperCase() !== "GET" || requestSignal) {
        return originalFetch(input, { ...init, signal });
      }

      const url = new URL(typeof input === "string" ? input : input.url, window.location.href).href;
      let pending = pendingGetRequests.get(url);
      if (!pending) {
        pending = originalFetch(input, { ...init, signal });
        pendingGetRequests.set(url, pending);
        pending.then(
          () => {
            setTimeout(() => {
              if (pendingGetRequests.get(url) === pending) pendingGetRequests.delete(url);
            }, GET_DEDUPLICATION_WINDOW_MS);
          },
          () => {
            if (pendingGetRequests.get(url) === pending) pendingGetRequests.delete(url);
          },
        );
      }
      return pending.then((response) => response.clone());
    };
    const cancelForDashboardNavigation = (event) => {
      const link = event.target.closest("a[href]");
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = new URL(link.href, window.location.href);
      if (target.origin === window.location.origin && target.pathname.startsWith("/dashboard/") && target.pathname !== window.location.pathname) cancel();
    };
    document.addEventListener("click", cancelForDashboardNavigation, true);
    return () => {
      window.fetch = originalFetch;
      document.removeEventListener("click", cancelForDashboardNavigation, true);
    };
  }, []);

  return children;
}
