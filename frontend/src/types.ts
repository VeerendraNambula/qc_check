export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
export const TaskStatus = {
    PENDING: 'PENDING' as TaskStatus,
    IN_PROGRESS: 'IN_PROGRESS' as TaskStatus,
    COMPLETED: 'COMPLETED' as TaskStatus,
    REJECTED: 'REJECTED' as TaskStatus,
};

export type ResponseStatus = 'APPROVED' | 'REJECTED';
export const ResponseStatus = {
    APPROVED: 'APPROVED' as ResponseStatus,
    REJECTED: 'REJECTED' as ResponseStatus,
};

export interface User {
    id: string;
    name: string;
    role: 'ADMIN' | 'USER';
    profilePictureUrl?: string;
}

export interface QcResponse {
    id: string;
    status: ResponseStatus;
    comment: string;
    imageUrl: string;
    createdAt: string;
}

export interface QcChecklist {
    id: string;
    title: string;
    order: number;
    response?: QcResponse;
}

export interface QcTask {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    assignedTo?: User;
    assignedToId?: string;
    checklists: QcChecklist[];
    createdAt: string;
    updatedAt: string;
}
