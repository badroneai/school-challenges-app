export type EventType = 'توعوية' | 'عملية' | 'تنافسية' | 'تعليمية';

export type EventCategory = 'ماء' | 'نفايات' | 'طاقة' | 'تشجير' | 'وعي_عام';

export type EventStatus = 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'documented' | 'cancelled';

export type RecurrenceType = 'none' | 'weekly' | 'monthly';

export interface EventTemplate {
  id: string;
  title_ar: string;
  type: EventType;
  category: EventCategory;
  description_ar: string;
  default_duration_minutes: number;
  suggested_location: string;
  default_points: number;
}

export interface EventDocumentation {
  actual_participants: number;
  classes_participated: number;
  photos: string[];
  achievements: string;
  challenges_faced?: string;
  recommendations?: string;
  documented_at: string;
  documented_by_uid: string;
}

export interface InternalEvent {
  id: string;
  school_id: string;
  
  // Basic Info
  title: string;
  type: EventType;
  category: EventCategory;
  description: string;
  
  // Scheduling
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  
  // Target Audience
  target_audience: 'all' | 'specific_grades';
  target_grades?: string[];
  expected_participants: number;
  
  // Optional Links
  linked_challenge_id?: string | null;
  
  // Points System
  points_enabled: boolean;
  points_value: number;
  
  // Recurrence
  recurrence: RecurrenceType;
  recurrence_end_date?: string;
  parent_event_id?: string;
  
  // Status
  status: EventStatus;
  
  // Documentation
  documentation?: EventDocumentation;
  
  // Metadata
  template_id?: string;
  created_by_uid: string;
  created_date: string;
  updated_date: string;
}

// Form data type for creating/editing events
export interface InternalEventFormData {
  title: string;
  type: EventType;
  category: EventCategory;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  target_audience: 'all' | 'specific_grades';
  target_grades: string[];
  expected_participants: number;
  linked_challenge_id: string;
  points_enabled: boolean;
  points_value: number;
  recurrence: RecurrenceType;
  recurrence_end_date: string;
}

// Status labels in Arabic
export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  draft: 'مسودة',
  scheduled: 'مجدولة',
  in_progress: 'قيد التنفيذ',
  completed: 'مكتملة',
  documented: 'موثقة',
  cancelled: 'ملغاة'
};

// Status colors for UI
export const EVENT_STATUS_COLORS: Record<EventStatus, string> = {
  draft: 'gray',
  scheduled: 'yellow',
  in_progress: 'blue',
  completed: 'orange',
  documented: 'green',
  cancelled: 'red'
};

// Type labels
export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  'توعوية': 'توعوية',
  'عملية': 'عملية',
  'تنافسية': 'تنافسية',
  'تعليمية': 'تعليمية'
};

// Category labels
export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  'ماء': 'ماء',
  'نفايات': 'نفايات',
  'طاقة': 'طاقة',
  'تشجير': 'تشجير',
  'وعي_عام': 'وعي عام'
};

// Recurrence labels
export const RECURRENCE_LABELS: Record<RecurrenceType, string> = {
  none: 'لا تكرار',
  weekly: 'أسبوعي',
  monthly: 'شهري'
};

// Grade levels
export const GRADE_LEVELS = ['ابتدائي', 'متوسط', 'ثانوي'];

// Common locations
export const COMMON_LOCATIONS = [
  'ساحة المدرسة',
  'الفصول الدراسية',
  'المختبر',
  'المكتبة',
  'حديقة المدرسة',
  'قاعة الأنشطة',
  'الملعب',
  'أخرى'
];