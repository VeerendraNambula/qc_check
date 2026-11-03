import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { type QcTask, ResponseStatus } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Textarea, Radio } from '../components/ui/Forms';
import { Modal } from '../components/ui/Modal';
import { AddItemModal } from '../components/AddItemModal';
import { EditTaskModal } from '../components/EditTaskModal';
import {
    ArrowLeft,
    ChevronRight,
    Camera,
    Upload,
    CheckCircle2,
    XCircle,
    Printer,
    Info,
    RefreshCw,
    X,
    FileCheck2,
    CheckSquare,
    Plus,
    Trash2,
    Pencil
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clsx } from 'clsx';

export const TaskDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [comments, setComments] = useState<Record<string, string>>({});
    const [uploadedImages, setUploadedImages] = useState<Record<string, string>>({});
    const [responses, setResponses] = useState<Record<string, ResponseStatus>>({});
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
    const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);

    const { data: task, isLoading } = useQuery<QcTask>({
        queryKey: ['task', id],
        queryFn: async () => {
            const res = await api.get(`/qc/tasks/${id}`);
            return res.data;
        },
        enabled: !!id,
    });

    const uploadMutation = useMutation({
        mutationFn: async ({ checklistId, file }: { checklistId: string; file: File }) => {
            const formData = new FormData();
            formData.append('file', file);
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return { checklistId, url: res.data.url };
        },
        onSuccess: (data) => {
            setUploadedImages((prev) => ({ ...prev, [data.checklistId]: data.url }));
        },
    });

    const addChecklistMutation = useMutation({
        mutationFn: async (title: string) => {
            if (!id) return;
            await api.post(`/qc/tasks/${id}/checklists`, { title });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['task', id] });
            setIsAddItemModalOpen(false);
        },
        onError: (err) => {
            console.error("Failed to add item", err);
            alert("Failed to add item. Please try again.");
        }
    });

    const deleteChecklistMutation = useMutation({
        mutationFn: async (checklistId: string) => {
            await api.delete(`/qc/tasks/checklists/${checklistId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['task', id] });
            toast.success('Item deleted successfully');
        },
        onError: () => {
            toast.error('Failed to delete item');
        }
    });

    const submitTaskMutation = useMutation({
        mutationFn: async () => {
            if (!task) return;

            // Save all responses first
            const promises = task.checklists.map(async (item) => {
                const response = responses[item.id];
                const comment = comments[item.id] || '';
                const imageUrl = uploadedImages[item.id] || '';

                // Only submit if there's a decision
                if (response) {
                    await api.post(`/qc/tasks/${id}/submit`, {
                        checklistId: item.id,
                        status: response,
                        comment,
                        imageUrl
                    });
                }
            });

            await Promise.all(promises);

            // Determine final status
            const hasRejections = Object.values(responses).some(status => status === 'REJECTED');
            const finalStatus = hasRejections ? 'REJECTED' : 'COMPLETED';

            // Then mark task as completed/rejected
            await api.patch(`/qc/tasks/${id}`, { status: finalStatus });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['task', id] });
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            setIsSubmitModalOpen(false);
            navigate('/tasks');
        },
        onError: (error) => {
            console.error("Failed to submit task:", error);
            alert("Failed to submit QC. Please try again.");
        }
    });

    const handleFileUpload = (checklistId: string, file: File) => {
        uploadMutation.mutate({ checklistId, file });
    };

    const handleRemoveImage = (checklistId: string) => {
        setUploadedImages(prev => {
            const next = { ...prev };
            delete next[checklistId];
            return next;
        });
    };

    if (isLoading || !task) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-4 w-32 bg-slate-200 rounded" />
                <div className="h-12 w-64 bg-slate-200 rounded" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-32 bg-white rounded-qc-lg border border-qc-border" />
                    <div className="h-32 bg-white rounded-qc-lg border border-qc-border" />
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-white rounded-qc-lg border border-qc-border" />
                    ))}
                </div>
            </div>
        );
    }

    const completedCount = task.checklists.filter(item => !!item.response).length;
    const progress = (completedCount / task.checklists.length) * 100;
    const isAllResponded = task.checklists.every(item => !!item.response || (responses[item.id] && uploadedImages[item.id] && comments[item.id]));

    return (
        <div className="max-w-5xl mx-auto pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Breadcrumbs & Navigation */}
            <nav className="mb-6 flex items-center gap-2 text-[10px] font-black text-qc-text-muted uppercase tracking-widest no-print">
                <Link to="/tasks" className="hover:text-qc-primary transition-colors">QC Tasks</Link>
                <ChevronRight size={10} />
                <span className="text-qc-text-main">#{task.id.slice(0, 8).toUpperCase()}</span>
            </nav>

            {/* Header Pane */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-10">
                <div className="space-y-4">
                    <div className="flex items-center justify-between md:justify-start gap-4 no-print -ml-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            icon={ArrowLeft}
                            onClick={() => navigate('/tasks')}
                        >
                            Return to List
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            icon={Pencil}
                            onClick={() => setIsEditTaskModalOpen(true)}
                        >
                            Edit Task
                        </Button>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-black text-qc-text-main tracking-tight leading-tight">{task.title}</h1>
                            <Badge status={task.status} />
                        </div>
                        <p className="text-base font-bold text-qc-text-muted max-w-2xl">{task.description}</p>
                    </div>
                </div>

                {/* Task Stats Pane */}
                <div className="bg-white p-6 rounded-qc-lg border border-qc-border shadow-qc-md w-full md:w-80 shrink-0 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-qc-text-muted uppercase tracking-widest">Inspector</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-qc-text-main">{task.assignedTo?.name || 'Unassigned'}</span>
                            {(!task.assignedTo || task.assignedTo.id !== localStorage.getItem('userId')) && (
                                <button
                                    onClick={() => {
                                        const userId = localStorage.getItem('userId');
                                        if (userId) {
                                            api.post(`/qc/tasks/${id}/claim`)
                                                .then(() => queryClient.invalidateQueries({ queryKey: ['task', id] }));
                                        }
                                    }}
                                    className="text-[10px] text-qc-primary font-bold hover:underline"
                                >
                                    Assign to Me
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-qc-text-muted uppercase tracking-widest">Start Date</span>
                        <span className="text-xs font-bold text-qc-text-main">{new Date(task.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="h-px bg-qc-border" />
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black text-qc-text-muted uppercase tracking-widest">Task Progress</span>
                            <span className="text-lg font-black text-qc-primary">{completedCount}/{task.checklists.length}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-qc-primary rounded-full transition-all duration-700 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Checklist Pane */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-qc-text-main flex items-center gap-2">
                        <FileCheck2 size={24} className="text-qc-primary" />
                        Quality Checklist
                    </h2>
                    {task.status !== 'COMPLETED' && (
                        <Button
                            variant="secondary"
                            size="sm"
                            icon={Plus}
                            onClick={() => setIsAddItemModalOpen(true)}
                        >
                            Add Item
                        </Button>
                    )}
                </div>

                <div className="space-y-6">
                    {task.checklists.map((item, idx) => {
                        const existingResponse = item.response;
                        const currentResponse = responses[item.id];
                        const currentImage = uploadedImages[item.id];
                        const currentComment = comments[item.id];

                        return (
                            <section
                                key={item.id}
                                className={clsx(
                                    "bg-white rounded-qc-lg border transition-all duration-300 overflow-hidden",
                                    existingResponse
                                        ? (existingResponse.status === 'APPROVED' ? "border-qc-success/30 bg-qc-success-light/10" : "border-qc-error/30 bg-qc-error-light/10")
                                        : "border-qc-border shadow-qc-sm"
                                )}
                            >
                                {/* Item Header */}
                                <div className="px-6 py-4 border-b border-qc-border/50 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={clsx(
                                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 border-2",
                                            existingResponse
                                                ? (existingResponse.status === 'APPROVED' ? "bg-qc-success border-qc-success text-white" : "bg-qc-error border-qc-error text-white")
                                                : "bg-white border-qc-border text-qc-text-muted"
                                        )}>
                                            {existingResponse ? (existingResponse.status === 'APPROVED' ? <CheckCircle2 size={16} /> : <XCircle size={16} />) : idx + 1}
                                        </div>
                                        <h3 className="font-black text-qc-text-main text-lg">{item.title}</h3>
                                        {task?.status !== 'COMPLETED' && task?.status !== 'REJECTED' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (confirm('Are you sure you want to delete this item?')) {
                                                        deleteChecklistMutation.mutate(item.id);
                                                    }
                                                }}
                                                className="text-qc-text-muted hover:text-red-500 transition-colors p-1"
                                                title="Delete Item"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                    {existingResponse && <Badge status={existingResponse.status} />}
                                </div>

                                {/* Item Body */}
                                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-10">
                                    {/* Decision & Comments */}
                                    <div className="space-y-6">
                                        {!existingResponse && (
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-qc-text-muted uppercase tracking-widest">Inspection Decision</label>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <Radio
                                                        label="Approve"
                                                        name={`decision-${item.id}`}
                                                        checked={currentResponse === 'APPROVED'}
                                                        onChange={() => setResponses(prev => ({ ...prev, [item.id]: 'APPROVED' }))}
                                                    />
                                                    <Radio
                                                        label="Reject"
                                                        name={`decision-${item.id}`}
                                                        checked={currentResponse === 'REJECTED'}
                                                        onChange={() => setResponses(prev => ({ ...prev, [item.id]: 'REJECTED' }))}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-3">
                                            <Textarea
                                                label="Inspector Notes"
                                                placeholder="Provide detailed observations..."
                                                value={existingResponse?.comment || currentComment || ''}
                                                onChange={(e) => setComments(prev => ({ ...prev, [item.id]: e.target.value }))}
                                                readOnly={!!existingResponse}
                                                maxCount={500}
                                                currentCount={existingResponse?.comment?.length || currentComment?.length || 0}
                                            />
                                        </div>
                                    </div>

                                    {/* Evidence Upload */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-qc-text-muted uppercase tracking-widest flex items-center gap-2">
                                            <Camera size={12} /> Evidence Documentation
                                        </label>

                                        {(existingResponse?.imageUrl || currentImage) ? (
                                            <div className="relative group rounded-qc-lg overflow-hidden border border-qc-border aspect-video bg-slate-50">
                                                <img
                                                    src={existingResponse?.imageUrl ? existingResponse.imageUrl : currentImage}
                                                    alt="Evidence"
                                                    className="w-full h-full object-cover"
                                                />
                                                {!existingResponse && (
                                                    <div className="absolute top-2 right-2 flex gap-2">
                                                        <button
                                                            onClick={() => handleRemoveImage(item.id)}
                                                            className="p-1.5 bg-white/90 text-qc-error rounded-full shadow-lg hover:bg-white transition-all scale-0 group-hover:scale-100 duration-200"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                                                    <span className="text-white font-black text-xs uppercase tracking-widest">View Image</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-qc-border rounded-qc-lg hover:border-qc-primary hover:bg-qc-primary-light/30 cursor-pointer transition-all group">
                                                <div className="p-4 bg-slate-50 rounded-full group-hover:bg-qc-primary-light transition-colors mb-3">
                                                    {uploadMutation.isPending && uploadMutation.variables?.checklistId === item.id ? (
                                                        <RefreshCw className="text-qc-primary animate-spin" size={24} />
                                                    ) : (
                                                        <Upload className="text-slate-400 group-hover:text-qc-primary" size={24} />
                                                    )}
                                                </div>
                                                <p className="text-sm font-black text-qc-text-main">Click to upload photo</p>
                                                <p className="text-[10px] font-bold text-qc-text-muted mt-1 uppercase tracking-widest">JPG, PNG allowed</p>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => e.target.files?.[0] && handleFileUpload(item.id, e.target.files[0])}
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>
                                <div className="print-signature">Inspector Signature</div>
                            </section>
                        );
                    })}
                </div>
            </div>

            {/* Sticky Action Pane */}
            <div className="fixed bottom-0 left-0 right-0 md:left-auto md:right-0 bg-white/90 backdrop-blur-md border-t border-qc-border p-4 z-40 shadow-2xl no-print transition-all duration-500" style={{ left: 'var(--sidebar-width, 0px)' }}>
                <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 px-4 md:px-8">
                    <div className="hidden sm:flex items-center gap-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-qc-text-muted uppercase tracking-widest">Inspection Status</span>
                            <span className="text-sm font-black text-qc-text-main">{isAllResponded ? 'Ready for submission' : 'Incomplete'}</span>
                        </div>
                    </div>

                    <div className="flex flex-1 sm:flex-initial gap-3 items-center justify-end">
                        <Button
                            variant="secondary"
                            icon={Printer}
                            onClick={() => window.print()}
                            className="hidden sm:inline-flex"
                        >
                            Print Report
                        </Button>

                        {task.status !== 'COMPLETED' && (
                            <div className="flex flex-col items-end gap-1">
                                <Button
                                    variant="primary"
                                    icon={CheckSquare}
                                    onClick={() => setIsSubmitModalOpen(true)}
                                    disabled={!isAllResponded}
                                    className="sm:px-10"
                                >
                                    Submit QC
                                </Button>
                                {!isAllResponded && (
                                    <span className="text-[10px] text-qc-error font-bold hidden md:inline">
                                        * Complete all checks (Decision, Note, Photo)
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            <Modal
                isOpen={isSubmitModalOpen}
                onClose={() => setIsSubmitModalOpen(false)}
                title="Submit Inspection Report?"
                size="sm"
                footer={(
                    <>
                        <Button variant="ghost" onClick={() => setIsSubmitModalOpen(false)}>Cancel</Button>
                        <Button
                            variant="primary"
                            isLoading={submitTaskMutation.isPending}
                            onClick={() => submitTaskMutation.mutate()}
                        >
                            Confirm Submit
                        </Button>
                    </>
                )}
            >
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 bg-qc-primary-light rounded-full text-qc-primary">
                        <Info size={32} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-qc-text-main">Are you sure you want to finalize this QC?</p>
                        <p className="text-xs text-qc-text-muted mt-2">Once submitted, the report will be locked and cannot be modified.</p>
                    </div>
                </div>
            </Modal>

            <AddItemModal
                isOpen={isAddItemModalOpen}
                onClose={() => setIsAddItemModalOpen(false)}
                onAdd={(title) => addChecklistMutation.mutate(title)}
                isLoading={addChecklistMutation.isPending}
                title="Add Checklist Item"
                placeholder="e.g. Check emergency exit..."
            />

            {isEditTaskModalOpen && task && (
                <EditTaskModal
                    isOpen={isEditTaskModalOpen}
                    onClose={() => setIsEditTaskModalOpen(false)}
                    task={{ id: task.id, title: task.title, description: task.description || '' }}
                />
            )}
        </div>
    );
};
