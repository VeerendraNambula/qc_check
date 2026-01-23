import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Forms';
import { Plus } from 'lucide-react';

interface AddItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (title: string) => void;
    isLoading?: boolean;
    title?: string;
    placeholder?: string;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
    isOpen,
    onClose,
    onAdd,
    isLoading = false,
    title = "Add New Item",
    placeholder = "Enter item title..."
}) => {
    const [value, setValue] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (value.trim()) {
            onAdd(value);
            setValue('');
        }
    };

    const handleClose = () => {
        setValue('');
        onClose();
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={title}
            size="sm"
            footer={(
                <>
                    <Button variant="ghost" onClick={handleClose}>Cancel</Button>
                    <Button
                        variant="primary"
                        icon={Plus}
                        isLoading={isLoading}
                        disabled={!value.trim()}
                        onClick={handleSubmit}
                    >
                        Add Item
                    </Button>
                </>
            )}
        >
            <form onSubmit={handleSubmit}>
                <Input
                    autoFocus
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                />
            </form>
        </Modal>
    );
};
