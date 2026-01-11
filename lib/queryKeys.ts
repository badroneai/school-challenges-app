
/**
 * تنظيم مفاتيح الاستعلام (Query Keys) بشكل هرمي
 * يساعد هذا التنظيم في:
 * 1. تجنب تكرار المفاتيح في أماكن مختلفة
 * 2. سهولة إلغاء صلاحية البيانات (Invalidation) لمجموعة معينة (مثلاً كل ما يخص مدرسة واحدة)
 * 3. تحسين تجربة التطوير من خلال الـ Autocomplete
 */
export const queryKeys = {
  schools: {
    all: ['schools'] as const,
    detail: (id: string) => ['schools', id] as const,
    stats: (id: string) => ['schools', id, 'stats'] as const,
  },
  challenges: {
    all: ['challenges'] as const,
    bySchool: (schoolId: string) => ['challenges', 'school', schoolId] as const,
    weekly: (weekNumber: number) => ['challenges', 'weekly', weekNumber] as const,
  },
  events: {
    internal: (schoolId: string) => ['events', 'internal', schoolId] as const,
    external: (schoolId: string) => ['events', 'external', schoolId] as const,
  },
  requests: {
    byEntity: (entityId: string) => ['requests', 'entity', entityId] as const,
    bySchool: (schoolId: string) => ['requests', 'school', schoolId] as const,
  },
} as const;
