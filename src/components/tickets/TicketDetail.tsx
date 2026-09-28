'use client';

import { useState, useEffect } from 'react';
import { Ticket, TicketStatus, TicketPriority, TicketCategory, Comment, TicketLog, User } from '@/types/ticket';
import { formatDate, formatRelativeTime, getStatusLabel, getPriorityLabel, getCategoryLabel, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { CommentForm } from '@/components/forms/CommentForm';
import { StatusTransitionForm } from '@/components/forms/StatusTransitionForm';
import { Dropdown, DropdownItem, DropdownDivider } from '@/components/ui/Dropdown';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { ShortcutsHelp } from '@/components/ui/ShortcutsHelp';
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline';

interface TicketDetailProps {
  ticket: Ticket & {
    createdBy: User;
    assignedTo: User | null;
    logs: (TicketLog & { changedBy: User })[];
    comments: (Comment & { user: User })[];
    attachments?: Array<{ fileName: string; fileUrl: string; fileSize: number; mimeType: string }>;
  };
  currentUser: User;
  onStatusChange: (ticketId: string, status: TicketStatus, note?: string) => Promise<void>;
  onAssign: (ticketId: string, assignedToId: string | null) => Promise<void>;
  onAddComment: (ticketId: string, message: string, isInternal?: boolean) => Promise<void>;
  onGeneratePDF: (ticketId: string) => Promise<void>;
  onReassign?: (ticketId: string) => void;
  loading?: boolean;
}

export function TicketDetail({
  ticket,
  currentUser,
  onStatusChange,
  onAssign,
  onAddComment,
  onGeneratePDF,
  onReassign,
  loading,
}: TicketDetailProps) {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [techLoading, setTechLoading] = useState(false);
  const { showHelp, setShowHelp } = useKeyboardShortcuts(
    [
      {
        key: 's',
        description: 'Focus status',
        action: () => setShowStatusModal(true),
      },
      {
        key: 'c',
        description: 'Focus comment',
        action: () => {
          const el = document.getElementById('comment-box') as HTMLTextAreaElement | null;
          if (el) el.focus();
          else {
            const fallback = document.querySelector('textarea[placeholder*="comment" i]') as HTMLTextAreaElement | null;
            fallback?.focus();
          }
        },
      },
    ],
    true
  );

  const getBadgeVariant = (status: TicketStatus): 'navy' | 'gold' | 'green' | 'gray' | 'orange' | 'default' => {
    switch (status) {
      case 'OPEN': return 'navy';
      case 'ASSIGNED': return 'gold';
      case 'IN_PROGRESS': return 'default';
      case 'RESOLVED': return 'green';
      case 'CLOSED': return 'gray';
      case 'REOPENED': return 'orange';
      default: return 'default';
    }
  };

  const getPriorityVariant = (priority: TicketPriority): 'gray' | 'gold' | 'orange' | 'red' | 'default' => {
    switch (priority) {
      case 'LOW': return 'gray';
      case 'MEDIUM': return 'gold';
      case 'HIGH': return 'orange';
      case 'CRITICAL': return 'red';
      default: return 'default';
    }
  };

  const canTransition = () => {
    // Role-aware: check valid next statuses exist for current status + role
    const role = currentUser.role as TicketStatus extends string ? string : never;
    // Import logic inline to avoid circular import — mirror permissions.ts
    const studentTransitions: Record<string, string[]> = {
      RESOLVED: ['CLOSED'],
      CLOSED: ['REOPENED'],
    };
    const techTransitions: Record<string, string[]> = {
      OPEN: ['ASSIGNED'],
      ASSIGNED: ['IN_PROGRESS', 'OPEN'],
      IN_PROGRESS: ['RESOLVED', 'ASSIGNED'],
      RESOLVED: ['CLOSED', 'REOPENED'],
      CLOSED: ['REOPENED'],
      REOPENED: ['ASSIGNED'],
    };
    if (currentUser.role === 'STUDENT') return (studentTransitions[ticket.status] ?? []).length > 0;
    if (currentUser.role === 'TECHNICIAN') return (techTransitions[ticket.status] ?? []).length > 0;
    return true; // DIRECTOR can always transition
  };

  useEffect(() => {
    if (!showAssignModal) return;
    const fetchTechs = async () => {
      setTechLoading(true);
      try {
        const res = await fetch('/api/users?role=TECHNICIAN&isActive=true&pageSize=50');
        if (res.ok) {
          const data = await res.json();
          setTechnicians(data.data ?? []);
        }
      } catch (e) {
        console.warn('Failed to fetch technicians', e);
      } finally {
        setTechLoading(false);
      }
    };
    fetchTechs();
  }, [showAssignModal]);

  const handleStatusChange = async (data: { status: TicketStatus; note?: string }) => {
    await onStatusChange(ticket.id, data.status, data.note);
    setShowStatusModal(false);
  };

  const handleAssign = async (assignedToId: string | null) => {
    await onAssign(ticket.id, assignedToId);
    setShowAssignModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap mb-3">
            <Badge variant={getBadgeVariant(ticket.status)} className="text-sm px-3 py-1">
              {getStatusLabel(ticket.status)}
            </Badge>
            <Badge variant={getPriorityVariant(ticket.priority)} className="text-sm px-3 py-1">
              {getPriorityLabel(ticket.priority)}
            </Badge>
            <Badge variant="navy" className="text-sm px-3 py-1">
              {getCategoryLabel(ticket.category)}
            </Badge>
            {ticket.id && (
              <span className="font-mono text-sm text-text-muted bg-surface-muted px-2 py-1 rounded">
                {ticket.id}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-display font-bold text-navy mb-2">{ticket.title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => onGeneratePDF(ticket.id)} icon={<ArrowDownTrayIcon className="h-4 w-4" />}>
            PDF
          </Button>
          <Button variant="ghost" size="sm" className="h-11 w-11 px-0" onClick={() => setShowHelp(true)} aria-label="Keyboard shortcuts">
            ?
          </Button>
          <Dropdown
            trigger={
              <Button variant="ghost" size="sm" icon={<ChatBubbleLeftRightIcon className="h-4 w-4" />}>
                Actions
              </Button>
            }
            content={
              <>
                <DropdownItem onClick={() => setShowStatusModal(true)} disabled={!canTransition()}>
                  Change Status
                </DropdownItem>
                {currentUser.role === 'DIRECTOR' && (
                  <>
                    <DropdownDivider />
                    <DropdownItem onClick={() => setShowAssignModal(true)}>Assign Technician</DropdownItem>
                    {ticket.assignedTo && (
                      <DropdownItem onClick={() => onReassign?.(ticket.id)}>Reassign to Pool</DropdownItem>
                    )}
                  </>
                )}
                {currentUser.role === 'TECHNICIAN' && ticket.assignedToId === currentUser.id && (
                  <>
                    <DropdownDivider />
                    <DropdownItem onClick={() => setShowReassignModal(true)}>Return to Pool</DropdownItem>
                  </>
                )}
                <DropdownDivider />
                <DropdownItem onClick={() => onGeneratePDF(ticket.id)} icon={<ArrowDownTrayIcon className="h-4 w-4" />}>
                  Download PDF
                </DropdownItem>
              </>
            }
          />
        </div>
      </div>

      {/* Meta Info */}
      <div className="card p-4">
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <dt className="text-xs font-medium text-text-muted uppercase tracking-wider">Reported By</dt>
            <dd className="mt-1 flex items-center gap-2">
              <Avatar src={ticket.createdBy.avatarUrl} name={ticket.createdBy.name} size="sm" />
              <div>
                <p className="font-medium text-text">{ticket.createdBy.name}</p>
                <p className="text-sm text-text-muted">{ticket.createdBy.email}</p>
                {ticket.createdBy.registrationNo && (
                  <p className="text-xs text-text-muted">{ticket.createdBy.registrationNo}</p>
                )}
              </div>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-text-muted uppercase tracking-wider">Assigned To</dt>
            <dd className="mt-1 flex items-center gap-2">
              {ticket.assignedTo ? (
                <>
                  <Avatar src={ticket.assignedTo.avatarUrl} name={ticket.assignedTo.name} size="sm" />
                  <div>
                    <p className="font-medium text-text">{ticket.assignedTo.name}</p>
                    <p className="text-sm text-text-muted">{ticket.assignedTo.email}</p>
                  </div>
                </>
              ) : (
                <span className="text-text-muted">Unassigned</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-text-muted uppercase tracking-wider">Created</dt>
            <dd className="mt-1 flex items-center gap-2">
              <ClockIcon className="h-4 w-4 text-text-muted" />
              <time dateTime={new Date(ticket.createdAt).toISOString()}>
                {formatDate(ticket.createdAt, 'PPp')}
              </time>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-text-muted uppercase tracking-wider">Last Updated</dt>
            <dd className="mt-1 flex items-center gap-2">
              <ArrowPathIcon className="h-4 w-4 text-text-muted" />
              <time dateTime={new Date(ticket.updatedAt).toISOString()}>
                {formatRelativeTime(ticket.updatedAt)}
              </time>
            </dd>
          </div>
          {ticket.deviceInfo && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-text-muted uppercase tracking-wider">Device</dt>
              <dd className="mt-1 flex items-center gap-2">
                <CpuChipIcon className="h-4 w-4 text-text-muted" />
                <span className="text-text">{ticket.deviceInfo}</span>
              </dd>
            </div>
          )}
          {ticket.location && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-text-muted uppercase tracking-wider">Location</dt>
              <dd className="mt-1 flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-text-muted" />
                <span className="text-text">{ticket.location}</span>
              </dd>
            </div>
          )}
          {ticket.resolvedAt && (
            <div>
              <dt className="text-xs font-medium text-text-muted uppercase tracking-wider">Resolved</dt>
              <dd className="mt-1 flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-success" />
                <time dateTime={new Date(ticket.resolvedAt).toISOString()}>
                  {formatDate(ticket.resolvedAt, 'PPp')}
                </time>
              </dd>
            </div>
          )}
          {ticket.closedAt && (
            <div>
              <dt className="text-xs font-medium text-text-muted uppercase tracking-wider">Closed</dt>
              <dd className="mt-1 flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-text-muted" />
                <time dateTime={new Date(ticket.closedAt).toISOString()}>
                  {formatDate(ticket.closedAt, 'PPp')}
                </time>
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Description */}
      <div className="card p-4">
        <h2 className="text-lg font-semibold text-navy mb-3 flex items-center gap-2">
          <TagIcon className="h-5 w-5" />
          Description
        </h2>
        <div className="prose prose-sm max-w-none text-text whitespace-pre-wrap">
          {ticket.description}
        </div>
      </div>

      {/* Timeline */}
      {ticket.logs.length > 0 && (
        <div className="card p-4">
          <h2 className="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
            <ClockIcon className="h-5 w-5" />
            Status Timeline
          </h2>
          <div className="space-y-4">
            {ticket.logs.map((log, index) => (
              <div key={log.id} className="flex gap-3">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className={cn(
                      'h-3 w-3 rounded-full border-2 border-surface',
                      index === ticket.logs.length - 1 ? 'bg-navy' : 'bg-border'
                    )}
                  />
                  {index < ticket.logs.length - 1 && (
                    <div className="h-full w-0.5 bg-border mt-1" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getBadgeVariant(log.newStatus)} className="text-xs">
                      {getStatusLabel(log.newStatus)}
                    </Badge>
                    {log.oldStatus && (
                      <span className="text-text-muted text-xs">{getStatusLabel(log.oldStatus)} →</span>
                    )}
                    <time className="text-xs text-text-muted ml-auto" dateTime={new Date(log.timestamp).toISOString()}>
                      {formatDate(log.timestamp, 'PPp')}
                    </time>
                  </div>
                  <p className="text-sm text-text-muted">By {log.changedBy?.name ?? 'Unknown'} ({log.changedBy?.role ?? '—'})</p>
                  {log.note && (
                    <p className="mt-1 text-sm text-text bg-surface-muted p-2 rounded">{log.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-navy flex items-center gap-2">
            <ChatBubbleLeftRightIcon className="h-5 w-5" />
            Comments ({ticket.comments.length})
          </h2>
        </div>

        <div className="space-y-4 mb-6">
          {ticket.comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar src={comment.user?.avatarUrl} name={comment.user?.name ?? 'Unknown'} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-text">{comment.user?.name ?? 'Unknown'}</span>
                  <span className="text-xs text-text-muted">{comment.user?.role ?? '—'}</span>
                  {comment.isInternal && (
                    <Badge variant="gray" className="text-xs">Internal</Badge>
                  )}
                  <time className="text-xs text-text-muted ml-auto" dateTime={new Date(comment.createdAt).toISOString()}>
                    {formatRelativeTime(comment.createdAt)}
                  </time>
                </div>
                <p className="text-text whitespace-pre-wrap">{comment.message}</p>
              </div>
            </div>
          ))}
          {ticket.comments.length === 0 && (
            <p className="text-center text-text-muted py-8">No comments yet. Be the first to add one.</p>
          )}
        </div>

        {/* Add Comment Form */}
        <div id="comment-box-wrapper">
          <CommentForm
            onSubmit={async (data) => {
              await onAddComment(ticket.id, data.message, data.isInternal);
            }}
            loading={loading}
            placeholder="Add a comment or update... (press c to focus)"
          />
        </div>
        <ShortcutsHelp
          isOpen={showHelp}
          onClose={() => setShowHelp(false)}
          shortcuts={[
            { key: 's', description: 'Open status modal' },
            { key: 'c', description: 'Focus comment box' },
            { key: '?', description: 'Toggle this help' },
            { key: 'Esc', description: 'Close modal' },
          ]}
        />
      </div>

      {/* Status Transition Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Change Ticket Status"
        description="Select the new status for this ticket. A resolution note is required for Resolved, Closed, and Reopened statuses."
        size="md"
      >
        <StatusTransitionForm
          currentStatus={ticket.status}
          userRole={currentUser.role}
          onSubmit={handleStatusChange}
          onCancel={() => setShowStatusModal(false)}
          loading={loading}
        />
      </Modal>

      {/* Assign Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Technician"
        description="Select a technician to assign this ticket to. Assignment will move the ticket to Assigned status."
        size="md"
      >
        <div className="space-y-4">
          {techLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-navy border-t-transparent" />
            </div>
          ) : technicians.length === 0 ? (
            <p className="text-center text-text-muted py-6">No active technicians found.</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {technicians.map((tech) => (
                <button
                  key={tech.id}
                  type="button"
                  onClick={() => handleAssign(tech.id)}
                  disabled={loading || techLoading}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors',
                    ticket.assignedTo?.id === tech.id
                      ? 'bg-navy/10 border-navy/30 text-navy'
                      : 'bg-surface border-border hover:bg-surface-muted hover:border-navy/20 text-text'
                  )}
                >
                  <Avatar src={tech.avatarUrl} name={tech.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{tech.name}</p>
                    <p className="text-xs text-text-muted truncate">{tech.email} {tech.department ? `· ${tech.department}` : ''}</p>
                    {ticket.assignedTo?.id === tech.id && <span className="text-xs text-success font-medium">Currently assigned</span>}
                  </div>
                  {ticket.assignedTo?.id === tech.id ? (
                    <span className="text-xs font-semibold text-navy">✓ Assigned</span>
                  ) : (
                    <span className="text-xs text-navy font-medium">Assign →</span>
                  )}
                </button>
              ))}
            </div>
          )}
          <div className="flex justify-between gap-3 pt-2 border-t border-border">
            <Button variant="ghost" onClick={() => handleAssign(null)} disabled={loading || !ticket.assignedTo}>
              Return to Pool (Unassign)
            </Button>
            <Button variant="secondary" onClick={() => setShowAssignModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Reassign Modal */}
      <Modal
        isOpen={showReassignModal}
        onClose={() => setShowReassignModal(false)}
        title="Return to Pool"
        description="This will unassign the ticket and return it to the unassigned pool."
        size="sm"
      >
        <div className="flex justify-end gap-3">
          <Button variant="secondary" className="h-11" onClick={() => setShowReassignModal(false)}>Cancel</Button>
          <Button variant="danger" className="h-11" onClick={() => { handleAssign(null); setShowReassignModal(false); }}>
            Return to Pool
          </Button>
        </div>
      </Modal>

      {/* Mobile sticky action bar */}
      <div className="lg:hidden sticky bottom-0 -mx-4 sm:-mx-6 px-4 py-3 bg-surface/90 backdrop-blur-md border-t border-border flex items-center justify-between gap-2 z-20 -mb-6 mt-6">
        <Button variant="secondary" size="sm" className="flex-1 h-11" onClick={() => setShowStatusModal(true)} disabled={!canTransition()}>
          Change Status
        </Button>
        {currentUser.role === 'DIRECTOR' ? (
          <Button variant="secondary" size="sm" className="flex-1 h-11" onClick={() => setShowAssignModal(true)}>Assign</Button>
        ) : currentUser.role === 'TECHNICIAN' && ticket.assignedToId === currentUser.id ? (
          <Button variant="ghost" size="sm" className="flex-1 h-11" onClick={() => setShowReassignModal(true)}>Return to Pool</Button>
        ) : null}
        <Button variant="ghost" size="sm" className="h-11 px-3" onClick={() => onGeneratePDF(ticket.id)} aria-label="Download PDF">
          <ArrowDownTrayIcon className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}