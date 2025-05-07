/**
 * Преобразует priority в числовой ранг:
 *  high   → 1
 *  medium → 2
 *  low    → 3
 *  null/undefined → 4
 */
function getPriorityRank(priority) {
  switch (priority) {
    case 'high':
      return 1;
    case 'medium':
      return 2;
    case 'low':
      return 3;
    default:
      return 4;
  }
}

/**
 * Сортирует массив задач по приоритету:
 * сначала high, затем medium, затем low, затем без приоритета.
 *
 * @param {Array<{ priority?: 'low'|'medium'|'high' }>} tasks
 * @returns {Array} новый массив, отсортированный по приоритету
 */
export function sortByPriority(tasks) {
  return [...tasks].sort((a, b) => {
    return getPriorityRank(a.priority) - getPriorityRank(b.priority);
  });
}
