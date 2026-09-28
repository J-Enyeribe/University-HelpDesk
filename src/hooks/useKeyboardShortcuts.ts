'use client';

import { useEffect, useCallback, useState } from 'react';

export interface ShortcutConfig {
  key: string;
  description: string;
  action: () => void;
  requireMeta?: boolean;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[], enabled = true) {
  const [showHelp, setShowHelp] = useState(false);

  const handler = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable;
      // Allow ? even in input, block others when typing
      if (isInput && e.key !== '?' && e.key !== 'Escape') return;

      // ? toggles help
      if (e.key === '?') {
        e.preventDefault();
        setShowHelp((v) => !v);
        return;
      }
      if (e.key === 'Escape' && showHelp) {
        setShowHelp(false);
        return;
      }

      for (const sc of shortcuts) {
        if (e.key.toLowerCase() === sc.key.toLowerCase()) {
          // Ignore if typing and not explicit
          if (isInput) continue;
          e.preventDefault();
          sc.action();
          break;
        }
      }
    },
    [shortcuts, enabled, showHelp]
  );

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handler, enabled]);

  return { showHelp, setShowHelp };
}

export function useListNavigation(length: number, onSelect: (index: number) => void, enabled = true) {
  const [selected, setSelected] = useState(0);

  const shortcuts: ShortcutConfig[] = [
    {
      key: 'j',
      description: 'Next ticket',
      action: () => setSelected((prev) => Math.min(prev + 1, Math.max(length - 1, 0))),
    },
    {
      key: 'k',
      description: 'Previous ticket',
      action: () => setSelected((prev) => Math.max(prev - 1, 0)),
    },
    {
      key: 'Enter',
      description: 'Open selected ticket',
      action: () => {
        if (length > 0) onSelect(selected);
      },
    },
  ];

  const { showHelp, setShowHelp } = useKeyboardShortcuts(shortcuts, enabled && length > 0);

  // Keep selected in bounds
  useEffect(() => {
    if (selected >= length) setSelected(Math.max(length - 1, 0));
  }, [length, selected]);

  return { selected, setSelected, showHelp, setShowHelp };
}
