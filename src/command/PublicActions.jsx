import React, { createContext, useContext, useEffect, useState } from 'react';
import { mergePublishedActions } from './publicActionPolicy.js';

const emptyActions = Object.freeze(Object.create(null));
const PublishedActionsContext = createContext(emptyActions);

export function PublishedActionsProvider({ children }) {
  const [actions, setActions] = useState(emptyActions);

  useEffect(() => {
    let mounted = true;
    let request = 0;
    let controller;

    const refresh = async () => {
      const currentRequest = ++request;
      controller?.abort();
      const currentController = new AbortController();
      controller = currentController;
      const timeout = setTimeout(() => currentController.abort(), 6000);
      try {
        const response = await fetch('/api/public/actions', {
          method: 'GET',
          headers: { Accept: 'application/json' },
          cache: 'no-store',
          credentials: 'omit',
          signal: currentController.signal,
        });
        if (!response.ok) throw new Error('Published actions unavailable');
        const payload = await response.json();
        if (mounted && currentRequest === request) setActions((previous) => mergePublishedActions(previous, payload));
      } catch {
        // Keep confirmed published destinations during a temporary outage.
      } finally {
        clearTimeout(timeout);
      }
    };

    refresh();
    window.addEventListener('command:published', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      mounted = false;
      controller?.abort();
      window.removeEventListener('command:published', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  return <PublishedActionsContext.Provider value={actions}>{children}</PublishedActionsContext.Provider>;
}

export function usePublishedAction(id, fallback) {
  const actions = useContext(PublishedActionsContext);
  return actions[id] || fallback;
}
