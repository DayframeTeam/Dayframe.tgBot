const priorityEmoji = {
  low: '🟢',
  medium: '🟡',
  high: '🟣',
};

export function getPriorityEmoji(priority) {
  return priorityEmoji[priority] || '🔵';
}
