
import { z } from 'zod';

/**
 * مخطط التحقق لبيانات المدرسة
 */
export const schoolSchema = z.object({
  name_ar: z.string().min(3, 'اسم المدرسة يجب أن يكون 3 أحرف على الأقل'),
  city: z.string().min(1, 'المدينة مطلوبة'),
  region: z.string().min(1, 'المنطقة مطلوبة'),
  manager_name: z.string().min(3, 'اسم مدير المدرسة مطلوب'),
  is_active: z.boolean().default(true),
});

/**
 * مخطط التحقق لبيانات التحدي (من طرف المشرف)
 */
export const challengeSchema = z.object({
  title: z.string().min(5, 'عنوان التحدي قصير جداً'),
  description: z.string().min(20, 'الوصف يجب أن يكون 20 حرفاً على الأقل لضمان وضوح التعليمات'),
  category: z.enum(['ماء', 'نفايات', 'طاقة', 'تشجير', 'توعية'], {
    errorMap: () => ({ message: 'يرجى اختيار فئة صحيحة' }),
  }),
  points_multiplier: z.number()
    .min(1, 'يجب أن يكون معامل النقاط 1 على الأقل')
    .max(100, 'لا يمكن تجاوز 100 نقطة لكل طالب'),
  start_date: z.string().min(1, 'تاريخ البدء مطلوب'),
  end_date: z.string().min(1, 'تاريخ الانتهاء مطلوب'),
});

/**
 * مخطط التحقق للمشاركة في التحدي (من طرف المدرسة)
 */
export const submissionSchema = z.object({
  grade_level: z.enum(['ابتدائي', 'متوسط', 'ثانوي'], {
    errorMap: () => ({ message: 'يرجى اختيار المرحلة الدراسية' }),
  }),
  class_count_participated: z.number().int().min(1, 'يجب مشاركة فصل واحد على الأقل'),
  student_count_participated: z.number().int().min(1, 'يجب مشاركة طالب واحد على الأقل'),
  evidence_notes: z.string().min(10, 'يرجى كتابة وصف موجز لكيفية تنفيذ التحدي (10 أحرف كحد أدنى)'),
});

/**
 * مخطط التحقق للفعاليات الداخلية
 */
export const internalEventSchema = z.object({
  title: z.string().min(5, 'عنوان الفعالية يجب أن يكون واضحاً ومميزاً'),
  type: z.enum(['توعوية', 'عملية', 'تنافسية', 'تعليمية']),
  category: z.enum(['ماء', 'نفايات', 'طاقة', 'تشجير', 'وعي_عام']),
  date: z.string().min(1, 'تاريخ الفعالية مطلوب'),
  location: z.string().min(3, 'يرجى تحديد مكان إقامة الفعالية'),
  expected_participants: z.number().min(1, 'يرجى إدخال العدد المتوقع'),
  description: z.string().min(15, 'يرجى كتابة وصف تفصيلي للفعالية'),
});

/**
 * مخطط التحقق لطلبات الجهات الخارجية
 */
export const agencyRequestSchema = z.object({
  agency_id: z.string().min(1, 'يرجى اختيار الجهة المطلوبة'),
  topic: z.string().min(5, 'موضوع الفعالية مطلوب'),
  estimated_students_count: z.number().min(10, 'يجب أن يكون العدد 10 طلاب على الأقل'),
  duration_minutes: z.number().min(15, 'المدة يجب أن لا تقل عن 15 دقيقة'),
  location: z.string().min(3, 'موقع التنفيذ مطلوب'),
});

/**
 * دالة مساعدة لتنسيق أخطاء Zod إلى شكل يمكن عرضه للمستخدم
 */
export const formatZodError = (error: z.ZodError) => {
  return error.errors.map(err => ({
    path: err.path.join('.'),
    message: err.message
  }));
};
