import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input, Textarea } from './ui/Forms';
import { Plus, Trash2, ListChecks } from 'lucide-react';

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose }) => {
    const queryClient = useQueryClient();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [checklists, setChecklists] = useState<string[]>(['']);

    const createMutation = useMutation({
        mutationFn: async () => {
            const data = {
                title,
                description,
                checklists: checklists
                    .filter(t => t.trim() !== '')
                    .map((t, i) => ({ title: t, order: i + 1 }))
            };
            await api.post('/qc/tasks', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            resetAndClose();
        }
    });

    const resetAndClose = () => {
        setTitle('');
        setDescription('');
        setChecklists(['']);
        onClose();
    };

    const addChecklistItem = () => {
        setChecklists([...checklists, '']);
    };

    const removeChecklistItem = (index: number) => {
        if (checklists.length > 1) {
            setChecklists(checklists.filter((_, i) => i !== index));
        }
    };

    const updateChecklistItem = (index: number, value: string) => {
        const next = [...checklists];
        next[index] = value;
        setChecklists(next);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={resetAndClose}
            title="Create New QC Task"
            size="lg"
            footer={(
                <>
                    <Button variant="ghost" onClick={resetAndClose}>Cancel</Button>
                    <Button
                        variant="primary"
                        icon={Plus}
                        isLoading={createMutation.isPending}
                        disabled={!title || checklists.every(t => !t.trim())}
                        onClick={() => createMutation.mutate()}
                    >
                        Create Task
                    </Button>
                </>
            )}
        >
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                    <Input
                        label="Task Title"
                        placeholder="e.g., Weekly Fire Safety Check"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <Textarea
                        label="Description (Optional)"
                        placeholder="Provide details about this inspection..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-black text-qc-text-muted uppercase tracking-widest flex items-center gap-2">
                            <ListChecks size={14} /> Checklist Items
                        </label>
                        <Button variant="secondary" size="sm" icon={Plus} onClick={addChecklistItem}>Add Item</Button>
                    </div>

                    <div className="space-y-3">
                        {checklists.map((item, index) => (
                            <div key={index} className="flex gap-3 animate-in slide-in-from-left-2 duration-200">
                                <div className="flex-1">
                                    <Input
                                        placeholder={`Item ${index + 1} title...`}
                                        value={item}
                                        onChange={(e) => updateChecklistItem(index, e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={() => removeChecklistItem(index)}
                                    className="p-2 text-qc-text-muted hover:text-qc-error transition-colors disabled:opacity-30"
                                    disabled={checklists.length === 1}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
};
