'use client';

import { Modal } from '@/components/ui/Modal';

interface ShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts?: { key: string; description: string }[];
}

const defaultShortcuts = [
  { key: 'j', description: 'Next ticket in queue' },
  { key: 'k', description: 'Previous ticket in queue' },
  { key: 'Enter', description: 'Open selected ticket' },
  { key: 's', description: 'Focus status dropdown' },
  { key: 'c', description: 'Focus comment box' },
  { key: '?', description: 'Toggle this help' },
  { key: 'Esc', description: 'Close modal / help' },
];

export function ShortcutsHelp({ isOpen, onClose, shortcuts = defaultShortcuts }: ShortcutsHelpProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts" size="sm">
      <div className="space-y-3">
        <p className="text-sm text-text-muted">Navigate quickly without leaving the keyboard. Shortcuts are disabled while typing.</p>
        <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
          {shortcuts.map((sc) => (
            <div key={sc.key} className="flex items-center justify-between px-4 py-2.5 bg-surface">
              <span className="text-sm text-text">{sc.description}</span>
              <kbd className="px-2 py-1 bg-surface-muted border border-border rounded text-xs font-mono text-navy min-w-[40px] text-center">{sc.key}</kbd>
            </div>
          ))}
        </div>
        <p className="text-xs text-text-muted text-center">Press <kbd className="px-1 border rounded bg-surface-muted">?</kbd> again to close</p>
      </div>
    </Modal>
  );
}
