import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import type { User } from '../types';
import { User as UserIcon, Check } from 'lucide-react';

interface AssignTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    taskId: string | null;
    currentAssigneeId?: string | null;
}

export const AssignTaskModal: React.FC<AssignTaskModalProps> = ({ isOpen, onClose, taskId, currentAssigneeId }) => {
    const queryClient = useQueryClient();
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    // Initialize selection with current assignee
    React.useEffect(() => {
        if (isOpen) {
            setSelectedUserId(currentAssigneeId || null);
        }
    }, [isOpen, currentAssigneeId]);

    const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await api.get('/users');
            return res.data;
        },
        enabled: isOpen,
    });

    const assignMutation = useMutation({
        mutationFn: async () => {
            if (!taskId || !selectedUserId) return;
            await api.post(`/qc/tasks/${taskId}/assign`, { userId: selectedUserId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            resetAndClose();
        },
        onError: (error) => {
            console.error("Failed to assign task:", error);
            alert("Failed to assign task. Please try again.");
        }
    });

    const unassignMutation = useMutation({
        mutationFn: async () => {
            if (!taskId) return;
            await api.post(`/qc/tasks/${taskId}/unassign`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            resetAndClose();
        },
        onError: (error) => {
            console.error("Failed to unassign task:", error);
            alert("Failed to unassign task. Please try again.");
        }
    });

    const resetAndClose = () => {
        setSelectedUserId(null);
        onClose();
    };

    const handleAssign = () => {
        if (selectedUserId) {
            assignMutation.mutate();
        }
    };

    const handleUnassign = () => {
        if (confirm("Are you sure you want to remove the current assignment?")) {
            unassignMutation.mutate();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={resetAndClose}
            title={currentAssigneeId ? "Reassign Task" : "Assign Task"}
            size="md"
            footer={(
                <div className="flex justify-between w-full">
                    {currentAssigneeId ? (
                        <Button
                            variant="secondary"
                            className="text-qc-error hover:bg-qc-error-light hover:text-qc-error"
                            onClick={handleUnassign}
                            isLoading={unassignMutation.isPending}
                        >
                            Unassign
                        </Button>
                    ) : (
                        <div /> /* Spacer */
                    )}
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={resetAndClose}>Cancel</Button>
                        <Button
                            variant="primary"
                            isLoading={assignMutation.isPending}
                            disabled={!selectedUserId || selectedUserId === currentAssigneeId}
                            onClick={handleAssign}
                        >
                            {currentAssigneeId ? 'Update Assignment' : 'Confirm Assignment'}
                        </Button>
                    </div>
                </div>
            )}
        >
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {isLoadingUsers ? (
                    <div className="space-y-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-2">
                        {users?.map(user => (
                            <button
                                key={user.id}
                                onClick={() => setSelectedUserId(user.id)}
                                className={`flex items-center gap-3 p-3 rounded-qc-base border transition-all text-left ${selectedUserId === user.id
                                    ? 'bg-qc-primary/5 border-qc-primary ring-1 ring-qc-primary'
                                    : 'bg-white border-qc-border hover:bg-slate-50'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${selectedUserId === user.id ? 'bg-qc-primary text-white border-qc-primary' : 'bg-slate-100 text-qc-text-muted border-qc-border'
                                    }`}>
                                    {user.profilePictureUrl ? (
                                        <img src={user.profilePictureUrl} alt={user.name} className="w-full h-full object-cover rounded-full" />
                                    ) : (
                                        user.name.charAt(0)
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-qc-text-main text-sm">{user.name}</div>
                                    <div className="text-xs text-qc-text-muted flex items-center gap-1">
                                        <UserIcon size={10} />
                                        {user.role}
                                    </div>
                                </div>
                                {selectedUserId === user.id && (
                                    <Check className="text-qc-primary" size={18} />
                                )}
                            </button>
                        ))}
                        {users?.length === 0 && (
                            <p className="text-center text-qc-text-muted text-sm py-4">No users found.</p>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};
