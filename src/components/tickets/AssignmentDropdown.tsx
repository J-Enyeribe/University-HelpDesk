'use client';

import { User } from '@/types/user';
import { Dropdown, DropdownItem, DropdownDivider, DropdownLabel } from '@/components/ui/Dropdown';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import { UserGroupIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface AssignmentDropdownProps {
  ticketId: string;
  currentAssignee: User | null;
  technicians: User[];
  onAssign: (assignedToId: string | null) => Promise<void>;
  loading?: boolean;
  currentUserRole: 'TECHNICIAN' | 'DIRECTOR';
}

export function AssignmentDropdown({
  ticketId,
  currentAssignee,
  technicians,
  onAssign,
  loading,
  currentUserRole,
}: AssignmentDropdownProps) {
  const handleAssign = async (assignedToId: string | null) => {
    await onAssign(assignedToId);
  };

  return (
    <Dropdown
      trigger={
        <Button
          variant={currentAssignee ? 'secondary' : 'ghost'}
          size="sm"
          loading={loading}
          className="w-full sm:w-auto justify-start gap-2"
          disabled={loading}
        >
          {currentAssignee ? (
            <>
              <Avatar src={currentAssignee.avatarUrl} name={currentAssignee.name} size="sm" />
              <span className="hidden sm:inline">{currentAssignee.name}</span>
            </>
          ) : (
            <>
              <UserGroupIcon className="h-4 w-4" />
              <span>Assign</span>
            </>
          )}
        </Button>
      }
      content={
        <>
          <DropdownItem
            icon={currentAssignee ? null : <XMarkIcon className="h-4 w-4" />}
            onClick={() => handleAssign(null)}
            disabled={!currentAssignee || loading}
          >
            Unassign (Return to Pool)
          </DropdownItem>
          <DropdownDivider />
          <DropdownLabel>Technicians</DropdownLabel>
          {technicians.map((tech) => (
            <DropdownItem
              key={tech.id}
              icon={
                <Avatar src={tech.avatarUrl} name={tech.name} size="sm" />
              }
              onClick={() => handleAssign(tech.id)}
              disabled={loading || currentAssignee?.id === tech.id}
            >
              <div className="flex flex-col">
                <span className="font-medium text-text">{tech.name}</span>
                <span className="text-xs text-text-muted">{tech.department}</span>
                {currentAssignee?.id === tech.id && (
                  <span className="text-xs text-success">Currently assigned</span>
                )}
              </div>
            </DropdownItem>
          ))}
          {technicians.length === 0 && (
            <DropdownItem disabled>
              No technicians available
            </DropdownItem>
          )}
        </>
      }
    />
  );
}