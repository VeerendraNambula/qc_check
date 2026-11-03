export function canInspectTask({ role, userId, assignedToId }) {
  return role === 'ADMIN' || Boolean(userId && assignedToId && userId === assignedToId);
}

export function isAdminRole(role) {
  return role === 'ADMIN';
}
