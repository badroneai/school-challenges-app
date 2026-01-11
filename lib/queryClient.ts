
import { QueryClient } from '@tanstack/react-query';

/**
 * إعداد QueryClient مع خيارات افتراضية لتحسين الأداء
 * staleTime: 5 دقائق (المدة التي تعتبر فيها البيانات حديثة)
 * gcTime: 30 دقيقة (المدة التي يتم فيها الاحتفاظ بالبيانات في الذاكرة قبل حذفها)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 دقائق
      gcTime: 1000 * 60 * 30,    // 30 دقيقة
      retry: 1,                 // المحاولة مرة واحدة في حال الفشل
      refetchOnWindowFocus: false, // عدم التحديث التلقائي عند العودة للنافذة
    },
  },
});
