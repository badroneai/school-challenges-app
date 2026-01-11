
import { ChallengeCategory, ChallengeStatus, EventStatus, EventType, GradeLevel } from "./types";

export const CHALLENGE_CATEGORIES = Object.values(ChallengeCategory);
export const CHALLENGE_STATUSES = Object.values(ChallengeStatus);
export const GRADE_LEVELS = Object.values(GradeLevel);
export const EVENT_TYPES = Object.values(EventType);
export const EVENT_STATUSES = Object.values(EventStatus);

export const AGENCY_CATEGORIES = ['صحة', 'سلامة', 'بلدية', 'بيئة', 'تطوع', 'أخرى'];

export const getChallengeStatusText = (status: ChallengeStatus) => {
    switch(status) {
        case ChallengeStatus.DRAFT: return 'مسودة';
        case ChallengeStatus.PUBLISHED: return 'منشور';
        case ChallengeStatus.ARCHIVED: return 'مؤرشف';
        default: return '';
    }
};

export const getEventStatusText = (status: EventStatus) => {
    switch(status) {
        case EventStatus.DRAFT: return 'مسودة';
        case EventStatus.SENT: return 'مرسل';
        case EventStatus.WAITING_REPLY: return 'بانتظار الرد';
        case EventStatus.CONFIRMED: return 'مؤكد';
        case EventStatus.COMPLETED: return 'مكتمل';
        case EventStatus.CANCELLED: return 'ملغى';
        default: return '';
    }
};

export const getStatusColor = (status: EventStatus | ChallengeStatus) => {
    switch(status) {
        case ChallengeStatus.DRAFT:
        case EventStatus.DRAFT:
            return 'bg-gray-200 text-gray-800';
        case ChallengeStatus.PUBLISHED:
        case EventStatus.SENT:
        case EventStatus.WAITING_REPLY:
            return 'bg-blue-200 text-blue-800';
        case EventStatus.CONFIRMED:
            return 'bg-yellow-200 text-yellow-800';
        case EventStatus.COMPLETED:
            return 'bg-green-200 text-green-800';
        case ChallengeStatus.ARCHIVED:
        case EventStatus.CANCELLED:
            return 'bg-red-200 text-red-800';
        default:
            return 'bg-gray-200 text-gray-800';
    }
};
