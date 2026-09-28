'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, UserRole, UserWithCounts } from '@/types/user';
import { Table, Pagination } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { PlusIcon, MagnifyingGlassIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

const roleOptions = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'TECHNICIAN', label: 'Technician' },
  { value: 'DIRECTOR', label: 'Director' },
];

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<UserWithCounts[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pageSize: 20, totalPages: 1 });
  const [filters, setFilters] = useState({ role: '', isActive: '', search: '' });
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT' as UserRole,
    registrationNo: '',
    department: '',
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUsers();
    }
  }, [status, filters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      params.set('page', String(meta.page));
      params.set('pageSize', String(meta.pageSize));

      const response = await fetch(`/api/users?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data);
        setMeta(data.meta);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setMeta((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setMeta((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setMeta((prev) => ({ ...prev, pageSize, page: 1 }));
  };

  const openCreateModal = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'STUDENT',
      registrationNo: '',
      department: '',
      isActive: true,
    });
    setFormErrors({});
    setShowCreateModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      registrationNo: user.registrationNo || '',
      department: user.department || '',
      isActive: user.isActive,
    });
    setFormErrors({});
    setShowCreateModal(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData['name'].trim()) errors['name'] = 'Name is required';
    if (!formData['email'].trim()) errors['email'] = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData['email'])) errors['email'] = 'Invalid email format';
    if (!editingUser && !formData['password']) errors['password'] = 'Password is required';
    else if (formData['password'] && formData['password'].length < 12) errors['password'] = 'Password must be at least 12 characters';
    if (!formData['role']) errors['role'] = 'Role is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/auth/register';
      const method = editingUser ? 'PATCH' : 'POST';
      const body = editingUser
        ? { ...formData, password: formData.password || undefined }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setEditingUser(null);
        fetchUsers();
      } else {
        const error = await response.json();
        setFormErrors({ submit: error.error || 'Failed to save user' });
      }
    } catch {
      setFormErrors({ submit: 'Something went wrong' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (user: User) => {
    try {
      const response = await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
      if (response.ok) {
        setDeleteConfirm(null);
        fetchUsers();
      }
    } catch {
      console.error('Failed to delete user');
    }
  };

  const columns = [
    { key: 'avatar', header: '', render: (user: User) => (
      <Avatar src={user.avatarUrl} name={user.name} size="sm" />
    )},
    { key: 'name', header: 'Name', render: (user: User) => (
      <div>
        <p className="font-medium text-text">{user.name}</p>
        <p className="text-sm text-text-muted">{user.email}</p>
      </div>
    )},
    { key: 'role', header: 'Role', render: (user: User) => (
      <Badge variant={user.role === 'DIRECTOR' ? 'gold' : user.role === 'TECHNICIAN' ? 'navy' : 'default'}>
        {user.role}
      </Badge>
    )},
    { key: 'registrationNo', header: 'Reg. No.', render: (user: User) => user.registrationNo || '—' },
    { key: 'department', header: 'Department', render: (user: User) => user.department || '—' },
    { key: 'status', header: 'Status', render: (user: User) => (
      <Badge variant={user.isActive ? 'green' : 'gray'}>
        {user.isActive ? 'Active' : 'Inactive'}
      </Badge>
    )},
    { key: 'tickets', header: 'Tickets', render: (user: UserWithCounts) => (
      <span className="text-text-muted">
        Created: {user._count?.createdTickets || 0} | Assigned: {user._count?.assignedTickets || 0}
      </span>
    )},
    { key: 'actions', header: 'Actions', render: (user: User) => (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => openEditModal(user)}>
          Edit
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(user)} className="text-error hover:text-error">
          Delete
        </Button>
      </div>
    )},
  ];

  if (status === 'loading' || loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-border rounded skeleton" />
          <div className="h-10 w-32 bg-border rounded skeleton" />
        </div>
        <div className="card p-6"><div className="h-64 bg-border rounded skeleton" /></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-navy">User Management</h1>
          <p className="text-text-muted mt-1">Manage system users and their roles</p>
        </div>
        <Button onClick={openCreateModal} icon={<UserPlusIcon className="h-4 w-4" />}>
          Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
            <input
              type="search"
              placeholder="Search users..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              className="input pl-10"
            />
          </div>
          <div className="min-w-[160px]">
            <Select
              label="Role"
              placeholder="All Roles"
              options={[{ value: '', label: 'All Roles' }, ...roleOptions]}
              value={filters.role || ''}
              onChange={(e) => handleFilterChange({ role: e.target.value })}
            />
          </div>
          <div className="min-w-[140px]">
            <Select
              label="Status"
              placeholder="All Statuses"
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'true', label: 'Active' },
                { value: 'false', label: 'Inactive' },
              ]}
              value={filters.isActive || ''}
              onChange={(e) => handleFilterChange({ isActive: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <Table
        columns={columns}
        data={users}
        keyExtractor={(user) => user.id}
        loading={loading}
        emptyMessage="No users found"
      />

      {/* Pagination */}
      <Pagination
        currentPage={meta.page}
        totalPages={meta.totalPages}
        onPageChange={handlePageChange}
        showPageSize
        pageSize={meta.pageSize}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); setEditingUser(null); }}
        title={editingUser ? 'Edit User' : 'Create User'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            error={formErrors['name']}
            value={formData['name']}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <Input
            label="Email"
            type="email"
            error={formErrors['email']}
            value={formData['email']}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
          <Input
            label={editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
            type="password"
            error={formErrors['password']}
            value={formData['password']}
            onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
            hint={editingUser ? undefined : 'At least 12 characters'}
            required={!editingUser}
          />
          <Select
            label="Role"
            error={formErrors['role']}
            options={roleOptions}
            value={formData['role']}
            onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value as UserRole }))}
            required
          />
          <Input
            label="Registration Number"
            value={formData['registrationNo']}
            onChange={(e) => setFormData((prev) => ({ ...prev, registrationNo: e.target.value }))}
          />
          <Input
            label="Department"
            value={formData['department']}
            onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border text-navy focus:ring-navy"
              checked={formData['isActive']}
              onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
            />
            <span className="text-sm text-text">Active</span>
          </label>
          {formErrors['submit'] && (
            <p className="text-sm text-error">{formErrors['submit']}</p>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => { setShowCreateModal(false); setEditingUser(null); }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={submitting}>
              {editingUser ? 'Save Changes' : 'Create User'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => { handleDelete(deleteConfirm!); setDeleteConfirm(null); }}
        title="Delete User"
        message={`Are you sure you want to delete ${deleteConfirm?.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}