/**
 * Объединяет tasks и templates в единый массив, избегая дублирования по special_id
 * @param {Array} tasks - массив реальных задач
 * @param {Array} templates - массив шаблонов задач
 * @returns {Array} объединенный массив с флагом __isTemplate
 */
export function mergeTasksAndTemplates(tasks, templates) {
  const items = [];

  // Сначала добавляем все tasks
  items.push(...tasks.map((t) => ({ ...t, __isTemplate: false })));

  // Затем добавляем templates только если task с таким special_id еще не существует
  templates.forEach((template) => {
    const hasExistingTask = items.some(
      (item) => !item.__isTemplate && item.special_id === template.special_id
    );
    if (!hasExistingTask) {
      items.push({ ...template, __isTemplate: true });
    }
  });

  return items;
}
