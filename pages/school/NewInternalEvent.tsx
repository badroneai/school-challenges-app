
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { 
    EventType, EventCategory, EventTemplate, InternalEventFormData,
    EVENT_TYPE_LABELS, EVENT_CATEGORY_LABELS, COMMON_LOCATIONS, GRADE_LEVELS 
} from '../../types/internalEvent';
import { EVENT_TEMPLATES, getTemplatesByType } from '../../constants/eventTemplates';
import SchoolLayout from '../../components/Layout/SchoolLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import { getCurrentDate } from '../../services/helpers';
import Spinner from '../../components/ui/Spinner';

const NewInternalEvent: React.FC = () => {
    const navigate = useNavigate();
    const { user, userProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<1 | 2>(1); // Step 1: Choose Template, Step 2: Edit Details
    const [selectedTypeFilter, setSelectedTypeFilter] = useState<EventType | 'all'>('all');

    const [formData, setFormData] = useState<InternalEventFormData>({
        title: '',
        type: 'توعوية',
        category: 'وعي_عام',
        description: '',
        date: getCurrentDate(),
        start_time: '08:00',
        end_time: '09:00',
        location: 'ساحة المدرسة',
        target_audience: 'all',
        target_grades: [],
        expected_participants: 0,
        linked_challenge_id: '',
        points_enabled: true,
        points_value: 10,
        recurrence: 'none',
        recurrence_end_date: ''
    });

    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

    const handleTemplateSelect = (template: EventTemplate | null) => {
        if (template) {
            setFormData({
                ...formData,
                title: template.title_ar,
                type: template.type,
                category: template.category,
                description: template.description_ar,
                location: template.suggested_location,
                points_value: template.default_points,
            });
            setSelectedTemplateId(template.id);
        } else {
            setFormData({
                ...formData,
                title: '',
                description: '',
            });
            setSelectedTemplateId(null);
        }
        setStep(2);
    };

    const handleGradeToggle = (grade: string) => {
        const current = formData.target_grades;
        if (current.includes(grade)) {
            setFormData({...formData, target_grades: current.filter(g => g !== grade)});
        } else {
            setFormData({...formData, target_grades: [...current, grade]});
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Ensure we have the necessary user and school info from the Auth context
        if (!user?.uid || !userProfile?.school_id) {
            console.error("Missing user credentials or school ID", { 
                uid: user?.uid, 
                schoolId: userProfile?.school_id 
            });
            alert("عذراً، لا يمكن إنشاء الفعالية. يرجى التأكد من أن حسابك مرتبط بمدرسة نشطة ومفعلة.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                school_id: userProfile.school_id,
                created_by_uid: user.uid,
                status: 'scheduled',
                created_date: getCurrentDate(),
                updated_date: getCurrentDate(),
                template_id: selectedTemplateId || null
            };

            await addDoc(collection(db, 'internal_events'), payload);
            navigate('/school/internal-events');
        } catch (error) {
            console.error("Error creating event:", error);
            alert("حدث خطأ أثناء حفظ الفعالية. يرجى المحاولة مرة أخرى.");
        } finally {
            setLoading(false);
        }
    };

    // --- STEP 1: Template Selection ---
    if (step === 1) {
        const filteredTemplates = selectedTypeFilter === 'all' 
            ? EVENT_TEMPLATES 
            : getTemplatesByType(selectedTypeFilter);

        return (
            <SchoolLayout title="إضافة فعالية جديدة">
                <div className="mb-6 flex flex-wrap gap-2 justify-center">
                    <Button 
                        variant={selectedTypeFilter === 'all' ? 'primary' : 'secondary'} 
                        onClick={() => setSelectedTypeFilter('all')}
                        className="text-sm"
                    >
                        الكل
                    </Button>
                    {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
                        <Button 
                            key={key}
                            variant={selectedTypeFilter === key ? 'primary' : 'secondary'}
                            onClick={() => setSelectedTypeFilter(key as EventType)}
                            className="text-sm"
                        >
                            {label}
                        </Button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div 
                        onClick={() => handleTemplateSelect(null)}
                        className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-gray-700 cursor-pointer transition flex flex-col items-center justify-center text-center min-h-[200px]"
                    >
                        <div className="bg-teal-100 dark:bg-teal-900 p-3 rounded-full mb-3 text-teal-600 dark:text-teal-300 text-2xl">+</div>
                        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">فعالية مخصصة</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">إنشاء فعالية جديدة من الصفر</p>
                    </div>

                    {filteredTemplates.map(template => (
                        <div 
                            key={template.id}
                            onClick={() => handleTemplateSelect(template)}
                            className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-5 border border-transparent hover:border-teal-500 cursor-pointer transition flex flex-col h-full"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                                    {EVENT_CATEGORY_LABELS[template.category]}
                                </span>
                                <span className="text-teal-600 dark:text-teal-400 font-bold text-sm">
                                    {template.default_points} نقطة
                                </span>
                            </div>
                            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-2">{template.title_ar}</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4 flex-grow">
                                {template.description_ar}
                            </p>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-auto pt-3 border-t dark:border-gray-700">
                                الموقع المقترح: {template.suggested_location}
                            </div>
                        </div>
                    ))}
                </div>
            </SchoolLayout>
        );
    }

    return (
        <SchoolLayout title="تفاصيل الفعالية">
            <Card>
                <div className="mb-4 pb-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">بيانات الفعالية</h2>
                    <button 
                        onClick={() => setStep(1)} 
                        className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-800 underline"
                    >
                        تغيير القالب
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input 
                            label="عنوان الفعالية" 
                            value={formData.title} 
                            onChange={e => setFormData({...formData, title: e.target.value})} 
                            required 
                        />
                        <Select 
                            label="نوع الفعالية" 
                            value={formData.type} 
                            onChange={e => setFormData({...formData, type: e.target.value as EventType})}
                        >
                            {Object.entries(EVENT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select 
                            label="الفئة (المجال)" 
                            value={formData.category} 
                            onChange={e => setFormData({...formData, category: e.target.value as EventCategory})}
                        >
                            {Object.entries(EVENT_CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </Select>
                        <Input 
                            label="الموقع" 
                            value={formData.location} 
                            onChange={e => setFormData({...formData, location: e.target.value})} 
                            list="locations"
                            required
                        />
                        <datalist id="locations">
                            {COMMON_LOCATIONS.map(loc => <option key={loc} value={loc} />)}
                        </datalist>
                    </div>

                    <Textarea 
                        label="وصف الفعالية" 
                        value={formData.description} 
                        onChange={e => setFormData({...formData, description: e.target.value})} 
                        required 
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <Input 
                            label="التاريخ" 
                            type="date" 
                            value={formData.date} 
                            onChange={e => setFormData({...formData, date: e.target.value})} 
                            required 
                        />
                        <Input 
                            label="من الساعة" 
                            type="time" 
                            value={formData.start_time} 
                            onChange={e => setFormData({...formData, start_time: e.target.value})} 
                            required 
                        />
                        <Input 
                            label="إلى الساعة" 
                            type="time" 
                            value={formData.end_time} 
                            onChange={e => setFormData({...formData, end_time: e.target.value})} 
                            required 
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-900 dark:text-gray-200">الفئة المستهدفة</label>
                        <div className="flex items-center gap-4 mb-2">
                            <label className="inline-flex items-center text-gray-900 dark:text-gray-300">
                                <input 
                                    type="radio" 
                                    className="form-radio text-teal-600" 
                                    name="audience" 
                                    checked={formData.target_audience === 'all'} 
                                    onChange={() => setFormData({...formData, target_audience: 'all'})}
                                />
                                <span className="mr-2">جميع الطلاب</span>
                            </label>
                            <label className="inline-flex items-center text-gray-900 dark:text-gray-300">
                                <input 
                                    type="radio" 
                                    className="form-radio text-teal-600" 
                                    name="audience" 
                                    checked={formData.target_audience === 'specific_grades'} 
                                    onChange={() => setFormData({...formData, target_audience: 'specific_grades'})}
                                />
                                <span className="mr-2">مراحل محددة</span>
                            </label>
                        </div>
                        
                        {formData.target_audience === 'specific_grades' && (
                            <div className="flex gap-3 pr-6">
                                {GRADE_LEVELS.map(grade => (
                                    <label key={grade} className="inline-flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-200">
                                        <input 
                                            type="checkbox" 
                                            className="form-checkbox text-teal-600 rounded"
                                            checked={formData.target_grades.includes(grade)}
                                            onChange={() => handleGradeToggle(grade)}
                                        />
                                        <span className="mr-2 text-sm">{grade}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input 
                            label="عدد المشاركين المتوقع" 
                            type="number" 
                            value={formData.expected_participants} 
                            onChange={e => setFormData({...formData, expected_participants: Number(e.target.value)})} 
                        />
                         <div className="flex items-center pt-6">
                            <input 
                                type="checkbox" 
                                id="points" 
                                checked={formData.points_enabled} 
                                onChange={e => setFormData({...formData, points_enabled: e.target.checked})}
                                className="h-5 w-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                            />
                            <label htmlFor="points" className="mr-2 block font-bold text-gray-900 dark:text-gray-200">
                                احتساب نقاط لهذه الفعالية ({formData.points_value} نقطة)
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t dark:border-gray-700">
                        <Button variant="secondary" type="button" onClick={() => navigate('/school/internal-events')}>إلغاء</Button>
                        <Button type="submit" isLoading={loading}>حفظ وجدولة الفعالية</Button>
                    </div>
                </form>
            </Card>
        </SchoolLayout>
    );
};

export default NewInternalEvent;
