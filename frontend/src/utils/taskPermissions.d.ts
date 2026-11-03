export type TaskActor = {
  role: string | null;
  userId: string | null;
  assignedToId: string | null | undefined;
};

export function canInspectTask(actor: TaskActor): boolean;
export function isAdminRole(role: string | null): boolean;
