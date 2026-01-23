import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { Select } from './Forms';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (items: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    onPageChange,
    onItemsPerPageChange,
}) => {
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-t border-qc-border">
            <div className="flex items-center gap-2 text-sm font-bold text-qc-text-muted">
                <span>Rows per page:</span>
                <div className="w-20">
                    <Select
                        value={String(itemsPerPage)}
                        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                        options={[
                            { value: '5', label: '5' },
                            { value: '10', label: '10' },
                            { value: '20', label: '20' },
                            { value: '50', label: '50' },
                        ]}
                    />
                </div>
                <span className="hidden sm:inline">
                    Showing {Math.min(itemsPerPage * (currentPage - 1) + 1, totalItems)} - {Math.min(itemsPerPage * currentPage, totalItems)} of {totalItems}
                </span>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="secondary"
                    size="sm"
                    icon={ChevronLeft}
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Prev
                </Button>
                <span className="text-sm font-black text-qc-text-main">
                    Page {currentPage} of {totalPages || 1}
                </span>
                <Button
                    variant="secondary"
                    size="sm"
                    iconPosition="right"
                    icon={ChevronRight}
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                >
                    Next
                </Button>
            </div>
        </div>
    );
};
