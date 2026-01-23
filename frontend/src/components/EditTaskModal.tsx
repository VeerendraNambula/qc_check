import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input, Textarea } from './ui/Forms';
import { toast } from 'react-hot-toast';

interface EditTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: { id: string; title: string; description: string };
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({ isOpen, onClose, task }) => {
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description);
    const queryClient = useQueryClient();

    // Reset state when task changes or modal opens
    useEffect(() => {
        if (isOpen) {
            setTitle(task.title);
            setDescription(task.description);
        }
    }, [isOpen, task]);

    const updateTaskMutation = useMutation({
        mutationFn: async (data: { title: string; description: string }) => {
            await api.patch(`/qc/tasks/${task.id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['task', task.id] });
            toast.success('Task updated successfully');
            onClose();
        },
        onError: () => {
            toast.error('Failed to update task');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateTaskMutation.mutate({ title, description });
    };

    return (
        <Modal title="Edit Task" isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Task Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <Textarea
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit" isLoading={updateTaskMutation.isPending}>Save Changes</Button>
                </div>
            </form>
        </Modal>
    );
};
