
import { Timestamp } from 'firebase/firestore';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SCHOOL_COORDINATOR = 'SCHOOL_COORDINATOR',
  ENTITY_MANAGER = 'ENTITY_MANAGER',
  USER = 'user', 
}

export interface UserProfile {
  uid: string;
  role: UserRole;
  school_id: string | null;
  agency_id?: string | null;
  display_name: string;
  email: string;
  created_date: string;
  is_approved: boolean;
}

export enum NotificationType {
  NEW_CHALLENGE = 'new_challenge',
  CHALLENGE_REMINDER = 'challenge_reminder',
  REQUEST_STATUS = 'request_status',
  NEW_REQUEST = 'new_request',
  EVENT_APPROVED = 'event_approved',
  POINTS_EARNED = 'points_earned',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: {
    challengeId?: string;
    eventId?: string;
    requestId?: string;
  };
  read: boolean;
  createdAt: any; // Firestore Timestamp
}

export interface School {
  id: string;
  name_ar: string;
  city: string;
  region: string;
  is_active: boolean;
  created_date: string;
  manager_name?: string; 
  logo_url?: string;     // شعار المدرسة/الجهة
  stamp_url?: string;    // الختم الرسمي
  signature_url?: string; // توقيع المدير
  show_stamp?: boolean;   // اختيار ظهور الختم في الخطاب
  show_signature?: boolean; // اختيار ظهور التوقيع في الخطاب
}

export interface Agency {
  id: string;
  name_ar: string;
  category: 'Government' | 'Non-Profit' | 'Private' | string;
  description: string;
  is_active: boolean;
  logo_url?: string;
  stamp_url?: string;
  service_types?: string[];
  manager_name?: string;
  contact_notes?: string;
  // Sprint 1 Adds:
  vision?: string;
  work_hours?: string;
  website_url?: string;
  location_map_url?: string;
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface AgencyService {
  id: string;
  agency_id: string;
  title: string;
  description: string;
  duration_minutes: number;
  target_audience: GradeLevel[];
  max_capacity: number;
  requirements: string; 
  is_active: boolean;
  created_date: string;
  // Sprint 1.5 Adds:
  approval_status?: ApprovalStatus;
  target_schools?: string[]; // Array of School IDs or ['ALL']
  rejection_reason?: string;
}

export enum ChallengeCategory {
  WATER = 'ماء',
  WASTE = 'نفايات',
  ENERGY = 'طاقة',
  TREES = 'تشجير',
  AWARENESS = 'توعية',
}

export enum ChallengeStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export interface Challenge {
  id: string;
  school_id: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  start_date: string;
  end_date: string;
  measurement_method: string;
  points_multiplier: number;
  status: ChallengeStatus;
  created_by_uid: string;
  created_date: string;
}

export enum GradeLevel {
  PRIMARY = 'ابتدائي',
  MIDDLE = 'متوسط',
  HIGH = 'ثانوي',
}

export interface Submission {
  id: string;
  school_id: string;
  challenge_id: string;
  grade_level: GradeLevel;
  class_count_participated: number;
  student_count_participated: number;
  evidence_notes: string;
  evidence_image_paths: string[];
  date: string;
  created_by_uid: string;
}

export enum EventType {
  FIRE_SAFETY = 'سلامة من الحرائق',
  EVACUATION = 'تدريب إخلاء',
  FIRST_AID = 'إسعافات أولية',
  RECYCLING = 'إعادة تدوير',
  TREE_PLANTING = 'تشجير',
  OTHER = 'أخرى',
}

export enum EventStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  WAITING_REPLY = 'waiting_reply',
  ENTITY_APPROVED = 'entity_approved',
  ENTITY_REJECTED = 'entity_rejected',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface PreferredSlot {
  date: string;
  start_time: string;
  end_time: string;
}

export interface EventRequest {
  id: string;
  school_id: string;
  agency_id: string;
  school_name?: string; 
  agency_name?: string;
  service_id?: string;
  event_type: EventType;
  audience: GradeLevel[];
  estimated_students_count: number;
  location: string;
  preferred_slots: PreferredSlot[];
  duration_minutes: number;
  notes: string;
  status: EventStatus;
  assigned_team?: string;
  rejection_reason?: string;
  entity_response_notes?: string;
  entity_response_date?: string;
  created_by_uid: string;
  created_date: string;
  topic?: string;
  suggested_dates?: string[];
}

export enum InitiativeStatus {
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface Initiative {
  id: string;
  agency_id: string;
  agency_name?: string;
  title: string;
  type: string;
  description: string;
  target_audience: GradeLevel[];
  capacity: number;
  date: string;
  start_time: string;
  status: InitiativeStatus;
  location?: string;
  created_by_uid: string;
  created_date: string;
  // Sprint 1.5 Adds:
  target_schools?: string[];
  rejection_reason?: string;
}

export * from './types/internalEvent';
