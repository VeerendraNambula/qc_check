import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FileText, Download, Filter } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { api } from '../api';
import type { QcTask } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { SearchInput, Select } from '../components/ui/Forms';
import { Pagination } from '../components/ui/Pagination';

export const ReportsPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'REJECTED'>('ALL');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const { data: tasks, isLoading } = useQuery<QcTask[]>({
        queryKey: ['tasks'],
        queryFn: async () => {
            const res = await api.get('/qc/tasks');
            return res.data;
        },
    });

    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('role');

    // Filter tasks based on role AND completion status (Completed OR Rejected)
    const filteredReports = useMemo(() => {
        if (!tasks) return [];
        return tasks.filter(task => {
            const isFinished = task.status === 'COMPLETED' || task.status === 'REJECTED';
            let roleCheck = false;
            if (userRole === 'ADMIN') roleCheck = true;
            else roleCheck = task.assignedToId === userId;

            if (!isFinished || !roleCheck) return false;

            const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.id.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [tasks, userRole, userId, searchQuery, statusFilter]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
    const paginatedReports = filteredReports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Reset pagination
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);


    const handleExport = () => {
        if (!filteredReports.length) return;

        // Generate CSV content
        const headers = ['Report ID', 'Task Title', 'Completed By', 'Completion Date', 'Status'];
        const rows = filteredReports.map(task => [
            task.id,
            task.title,
            task.assignedTo?.name || 'Unknown',
            new Date(task.updatedAt).toLocaleDateString(),
            task.status
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'qc_reports.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleDownload = async (taskSummary: QcTask) => {
        // ... (pdf generation logic remains same, omitting for brevity in diff but including in actual replacement to avoid code loss)
        try {
            const res = await api.get(`/qc/tasks/${taskSummary.id}`);
            const fullTask: QcTask = res.data;
            const doc = new jsPDF();
            doc.setFontSize(22);
            doc.setTextColor(41, 128, 185);
            doc.text("QC INSPECTION REPORT", 14, 20);
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Report ID: ${fullTask.id}`, 14, 30);
            doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 35);
            doc.setDrawColor(200);
            doc.setFillColor(245, 247, 250);
            doc.rect(14, 42, 182, 35, 'FD');
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text(fullTask.title, 20, 52);
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Status:`, 20, 60);
            doc.text(`Inspector:`, 90, 60);
            doc.text(`Date Completed:`, 150, 60);
            doc.setFontSize(10);
            doc.setTextColor(0);
            doc.setFont("helvetica", "bold");
            doc.text(fullTask.status, 20, 65);
            doc.text(fullTask.assignedTo?.name || 'Unassigned', 90, 65);
            doc.text(new Date(fullTask.updatedAt).toLocaleDateString(), 150, 65);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(80);
            const descLines = doc.splitTextToSize(fullTask.description || 'No description provided', 170);
            doc.text(descLines, 20, 72);
            doc.setFontSize(12);
            doc.setTextColor(0);
            doc.text("Inspection Checklists", 14, 90);
            const tableBody = (fullTask.checklists || []).map((item, index) => {
                const status = item.response?.status || 'PENDING';
                const comment = item.response?.comment || '-';
                return [index + 1, item.title, status, comment];
            });
            autoTable(doc, {
                startY: 95,
                head: [['#', 'Checklist Item', 'Status', 'Notes']],
                body: tableBody,
                theme: 'grid',
                headStyles: { fillColor: [41, 128, 185], textColor: 255 },
                styles: { fontSize: 9, cellPadding: 4 },
                columnStyles: {
                    0: { cellWidth: 10 },
                    1: { cellWidth: 70 },
                    2: { cellWidth: 30, fontStyle: 'bold' },
                    3: { cellWidth: 'auto' }
                },
                didParseCell: function (data) {
                    if (data.section === 'body' && data.column.index === 2) {
                        const status = data.cell.raw;
                        if (status === 'APPROVED') {
                            data.cell.styles.textColor = [39, 174, 96];
                        } else if (status === 'REJECTED') {
                            data.cell.styles.textColor = [192, 57, 43];
                        }
                    }
                }
            });
            doc.save(`Report-${fullTask.id.slice(0, 8)}.pdf`);
        } catch (error) {
            console.error("Failed to download report:", error);
            alert("Failed to generate PDF. Please try again.");
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="flex justify-between">
                    <div className="h-10 w-48 bg-slate-200 rounded" />
                    <div className="h-10 w-32 bg-slate-200 rounded" />
                </div>
                <div className="h-64 bg-white rounded-qc-lg border border-qc-border" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-black text-qc-text-main">QC Reports</h1>
                    <p className="text-sm font-bold text-qc-text-muted mt-1">Review finalized inspection reports.</p>
                </div>
                <Button
                    variant="primary"
                    icon={Download}
                    onClick={handleExport}
                    disabled={filteredReports.length === 0}
                >
                    Export All
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-qc-lg border border-qc-border shadow-qc-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 w-full md:w-auto">
                    <SearchInput
                        placeholder="Search Report ID or Title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onClear={() => setSearchQuery('')}
                    />
                </div>
                <div className="w-full md:w-48">
                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        options={[
                            { value: 'ALL', label: 'All Status' },
                            { value: 'COMPLETED', label: 'Completed' },
                            { value: 'REJECTED', label: 'Rejected' },
                        ]}
                    />
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-qc-text-muted">
                    <Filter size={16} />
                    <span>Showing {filteredReports.length} reports</span>
                </div>
            </div>

            {filteredReports.length === 0 ? (
                <div className="bg-white rounded-qc-lg shadow-qc-sm border border-qc-border p-16 flex flex-col items-center justify-center text-center">
                    <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border-2 border-slate-100">
                        <FileText className="text-slate-300 h-10 w-10" />
                    </div>
                    <h3 className="text-xl font-black text-qc-text-main">No Reports Found</h3>
                    <p className="text-sm font-bold text-qc-text-muted mt-2 max-w-sm">
                        {tasks?.some(t => t.status === 'COMPLETED' || t.status === 'REJECTED')
                            ? "Try adjusting your search filters to find what you're looking for."
                            : "Completed inspections will appear here automatically."}
                    </p>
                </div>
            ) : (
                <div className="bg-white border border-qc-border rounded-qc-lg shadow-qc-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-qc-border">
                                    <th className="px-6 py-4 text-[10px] font-black text-qc-text-muted uppercase tracking-widest">Report ID</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-qc-text-muted uppercase tracking-widest">Task Title</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-qc-text-muted uppercase tracking-widest">Completed By</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-qc-text-muted uppercase tracking-widest">Completion Date</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-qc-text-muted uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-qc-text-muted uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-qc-border">
                                {paginatedReports.map((task) => (
                                    <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs font-bold text-qc-text-main">#{task.id.slice(0, 8).toUpperCase()}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-sm text-qc-text-main">{task.title}</div>
                                            <div className="text-[10px] text-qc-text-muted truncate max-w-[200px]">{task.description}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-qc-primary text-white flex items-center justify-center text-[10px] font-black">
                                                    {task.assignedTo?.name.charAt(0) || '?'}
                                                </div>
                                                <span className="text-xs font-bold text-qc-text-main">{task.assignedTo?.name || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-mono text-qc-text-muted">
                                                {new Date(task.updatedAt).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge status={task.status} size="sm" />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link to={`/tasks/${task.id}`} target="_blank">
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        icon={FileText}
                                                        className="text-xs"
                                                    >
                                                        View
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => handleDownload(task)}
                                                    icon={Download}
                                                    title="Download Report (PDF)"
                                                    className="!px-2"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredReports.length > 0 && (
                        <div className="bg-slate-50">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                itemsPerPage={itemsPerPage}
                                totalItems={filteredReports.length}
                                onPageChange={setCurrentPage}
                                onItemsPerPageChange={setItemsPerPage}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
