import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../api';
import type { QcTask } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { SearchInput, Select, Checkbox } from '../components/ui/Forms';
import { CreateTaskModal } from '../components/CreateTaskModal';
import { AssignTaskModal } from '../components/AssignTaskModal';
import { ClipboardList, ChevronRight, FilterX, RotateCw, ExternalLink, Plus, Trash2, ArrowUpDown } from 'lucide-react';

import { Pagination } from '../components/ui/Pagination';

export const TaskListPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [myTasksOnly, setMyTasksOnly] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const queryClient = useQueryClient();
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('role');

    const { data: tasks, isLoading, refetch, isRefetching } = useQuery<QcTask[]>({
        queryKey: ['tasks'],
        queryFn: async () => {
            const res = await api.get('/qc/tasks');
            return res.data;
        },
    });

    const filteredTasks = React.useMemo(() => {
        if (!tasks) return [];
        return tasks.filter(task => {
            const matchesSearch = task.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;

            const isAssignedToOther = task.assignedToId && task.assignedToId !== userId;
            const visibilityAllowed = userRole === 'ADMIN' || !isAssignedToOther;

            const matchesMyTasks = !myTasksOnly || task.assignedToId === userId;

            return matchesSearch && matchesStatus && visibilityAllowed && matchesMyTasks;
        });
    }, [tasks, searchQuery, statusFilter, myTasksOnly, userId, userRole]);

    const resetFilters = () => {
        setSearchQuery('');
        setStatusFilter('ALL');
        setMyTasksOnly(false);
        setCurrentPage(1);
    };

    const [sortConfig, setSortConfig] = useState<{ key: keyof QcTask | 'assignedTo'; direction: 'asc' | 'desc' } | null>(null);

    const handleSort = (key: keyof QcTask | 'assignedTo') => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const deleteTaskMutation = useMutation({
        mutationFn: async (taskId: string) => {
            await api.delete(`/qc/tasks/${taskId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
        onError: (error) => {
            console.error("Failed to delete task:", error);
            alert("Failed to delete task. Please try again.");
        }
    });

    const handleDelete = (taskId: string) => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            deleteTaskMutation.mutate(taskId);
        }
    };

    const statusOptions = [
        { value: 'ALL', label: 'All Statuses' },
        { value: 'PENDING', label: 'Pending' },
        { value: 'IN_PROGRESS', label: 'In Progress' },
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'REJECTED', label: 'Rejected' },
    ];

    const sortedTasks = React.useMemo(() => {
        let sortableItems = [...filteredTasks];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                let aValue: any = a[sortConfig.key as keyof QcTask];
                let bValue: any = b[sortConfig.key as keyof QcTask];

                if (sortConfig.key === 'assignedTo') {
                    aValue = a.assignedTo?.name || '';
                    bValue = b.assignedTo?.name || '';
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredTasks, sortConfig]);

    // Pagination Logic
    const totalPages = Math.ceil(sortedTasks.length / itemsPerPage);
    const paginatedTasks = sortedTasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, myTasksOnly]);


    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
                <div className="h-20 bg-white border border-qc-border rounded-qc-lg animate-pulse" />
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-24 bg-white border border-qc-border rounded-qc-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    const [assignModal, setAssignModal] = useState<{ isOpen: boolean; taskId: string | null; assigneeId?: string | null }>({ isOpen: false, taskId: null });

    const openAssignModal = (taskId: string, assigneeId?: string | null) => {
        setAssignModal({ isOpen: true, taskId, assigneeId });
    };

    const closeAssignModal = () => {
        setAssignModal({ isOpen: false, taskId: null });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {userRole === 'ADMIN' && (
                <AssignTaskModal
                    isOpen={assignModal.isOpen}
                    onClose={closeAssignModal}
                    taskId={assignModal.taskId}
                    currentAssigneeId={assignModal.assigneeId}
                />
            )}

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black text-qc-text-main tracking-tight">QC Tasks</h1>
                    <p className="text-sm font-bold text-qc-text-muted">Assigned and available quality checks across the floor.</p>
                </div>
                {userRole === 'ADMIN' && (
                    <Button
                        variant="primary"
                        icon={Plus}
                        onClick={() => setIsCreateModalOpen(true)}
                        className="md:px-8 shadow-qc-md ring-4 ring-qc-primary/10"
                    >
                        Create New Task
                    </Button>
                )}
            </div>

            {userRole === 'ADMIN' && (
                <CreateTaskModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                />
            )}

            {/* Filter Pane */}
            <section className="bg-white border border-qc-border rounded-qc-lg shadow-qc-sm overflow-hidden">
                <div className="p-4 md:p-6 flex flex-col lg:flex-row lg:items-end gap-6">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-qc-text-muted uppercase tracking-widest">Search Task</label>
                            <SearchInput
                                placeholder="Search by Task ID or Name"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onClear={() => setSearchQuery('')}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-qc-text-muted uppercase tracking-widest">Status Filter</label>
                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                options={statusOptions}
                            />
                        </div>

                        <div className="flex items-center h-10 lg:mt-0 mt-2">
                            <Checkbox
                                label="My Tasks Only"
                                checked={myTasksOnly}
                                onChange={(e) => setMyTasksOnly(e.target.checked)}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 shrink-0">
                        <Button
                            variant="secondary"
                            icon={FilterX}
                            onClick={resetFilters}
                        >
                            Reset Filters
                        </Button>
                        <Button
                            variant="primary"
                            icon={RotateCw}
                            isLoading={isRefetching}
                            onClick={() => refetch()}
                        >
                            Sync
                        </Button>
                    </div>
                </div>
            </section>

            {/* Task List Pane */}
            <div className="space-y-4">
                {filteredTasks?.length === 0 ? (
                    <div className="bg-white border border-qc-border rounded-qc-lg py-16 px-6 flex flex-col items-center justify-center text-center shadow-qc-sm">
                        <div className="bg-slate-50 p-6 rounded-full border border-qc-border mb-6">
                            <ClipboardList className="text-slate-300" size={48} />
                        </div>
                        <h3 className="text-xl font-black text-qc-text-main">No QC tasks found</h3>
                        <p className="text-sm font-bold text-qc-text-muted mt-2">Try adjusting your filters or search keywords.</p>
                        <Button variant="ghost" className="mt-6" onClick={resetFilters}>Clear all filters</Button>
                    </div>
                ) : (
                    <>
                        {/* Desktop View */}
                        <div className="hidden md:block bg-white border border-qc-border rounded-qc-lg shadow-qc-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-qc-border">
                                        <th className="px-6 py-4 text-[10px] font-black text-qc-text-muted uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('id')}>
                                            <div className="flex items-center gap-2">
                                                Task ID <ArrowUpDown size={12} className={sortConfig?.key === 'id' ? 'text-qc-primary' : 'text-slate-300'} />
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-[10px] font-black text-qc-text-muted uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('title')}>
                                            <div className="flex items-center gap-2">
                                                Task Name <ArrowUpDown size={12} className={sortConfig?.key === 'title' ? 'text-qc-primary' : 'text-slate-300'} />
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-[10px] font-black text-qc-text-muted uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('status')}>
                                            <div className="flex items-center gap-2">
                                                Status <ArrowUpDown size={12} className={sortConfig?.key === 'status' ? 'text-qc-primary' : 'text-slate-300'} />
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-[10px] font-black text-qc-text-muted uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('assignedTo')}>
                                            <div className="flex items-center gap-2">
                                                Assigned To <ArrowUpDown size={12} className={sortConfig?.key === 'assignedTo' ? 'text-qc-primary' : 'text-slate-300'} />
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-[10px] font-black text-qc-text-muted uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-qc-border">
                                    {paginatedTasks.map((task) => (
                                        <tr key={task.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-black text-qc-primary bg-qc-primary-light px-2 py-1 rounded">
                                                    #{task.id.slice(0, 8).toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-qc-text-main group-hover:text-qc-primary transition-colors">
                                                        {task.title}
                                                    </span>
                                                    <span className="text-[10px] font-medium text-qc-text-muted mt-0.5 line-clamp-1">
                                                        {task.description || 'No description provided'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge status={task.status} size="sm" />
                                            </td>
                                            <td className="px-6 py-4">
                                                {task.assignedTo ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-qc-text-main border border-qc-border overflow-hidden">
                                                            {task.assignedTo.profilePictureUrl ? (
                                                                <img src={task.assignedTo.profilePictureUrl} alt={task.assignedTo.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                task.assignedTo.name.charAt(0)
                                                            )}
                                                        </div>
                                                        <span className="text-xs font-bold text-qc-text-main">{task.assignedTo.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs font-bold text-qc-text-muted italic">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {userRole === 'ADMIN' && (
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => openAssignModal(task.id, task.assignedToId)}
                                                        >
                                                            {task.assignedToId ? 'Reassign' : 'Assign'}
                                                        </Button>
                                                    )}
                                                    <Link to={`/tasks/${task.id}`}>
                                                        <Button variant="primary" size="sm" icon={ChevronRight}>Open Task</Button>
                                                    </Link>
                                                    {userRole === 'ADMIN' && (
                                                        <button
                                                            onClick={() => handleDelete(task.id)}
                                                            className="p-1.5 text-qc-text-muted hover:text-qc-error hover:bg-qc-error-light rounded transition-colors"
                                                            title="Delete Task"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {sortedTasks.length > 0 && (
                                <div className="bg-slate-50">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        itemsPerPage={itemsPerPage}
                                        totalItems={sortedTasks.length}
                                        onPageChange={setCurrentPage}
                                        onItemsPerPageChange={setItemsPerPage}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Mobile View */}
                        <div className="grid grid-cols-1 gap-4 md:hidden">
                            {paginatedTasks.map((task) => (
                                <div key={task.id} className="bg-white border border-qc-border rounded-qc-lg p-5 shadow-qc-sm space-y-4">
                                    <div className="flex justify-between items-start">
                                        <span className="text-[10px] font-black text-qc-primary bg-qc-primary-light px-2 py-0.5 rounded">
                                            #{task.id.slice(0, 8).toUpperCase()}
                                        </span>
                                        <Badge status={task.status} size="sm" />
                                    </div>

                                    <div>
                                        <h3 className="text-base font-black text-qc-text-main">{task.title}</h3>
                                        <p className="text-xs font-medium text-qc-text-muted mt-1">{task.description}</p>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-qc-border">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-qc-text-main border border-qc-border">
                                                {task.assignedTo?.name.charAt(0) || '?'}
                                            </div>
                                            <span className="text-[10px] font-black text-qc-text-muted uppercase tracking-wider">
                                                {task.assignedTo?.name || 'Unassigned'}
                                            </span>
                                        </div>

                                        <div className="flex gap-2">
                                            {userRole === 'ADMIN' && !task.assignedToId && (
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => openAssignModal(task.id)}
                                                >
                                                    Assign
                                                </Button>
                                            )}
                                            <Link to={`/tasks/${task.id}`}>
                                                <Button variant="primary" size="sm" icon={ExternalLink}>Open</Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {sortedTasks.length > 0 && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    itemsPerPage={itemsPerPage}
                                    totalItems={sortedTasks.length}
                                    onPageChange={setCurrentPage}
                                    onItemsPerPageChange={setItemsPerPage}
                                />
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
