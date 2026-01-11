import { EventTemplate } from '../types/internalEvent';

export const EVENT_TEMPLATES: EventTemplate[] = [
  // ==================== توعوية (Awareness) ====================
  {
    id: 'awareness-1',
    title_ar: 'إذاعة مدرسية بيئية',
    type: 'توعوية',
    category: 'وعي_عام',
    description_ar: 'برنامج إذاعي صباحي يتضمن فقرات توعوية عن البيئة والمحافظة عليها، يشمل: آيات قرآنية، حديث شريف، كلمة توعوية، هل تعلم، ومسابقة بيئية.',
    default_duration_minutes: 15,
    suggested_location: 'ساحة المدرسة',
    default_points: 20
  },
  {
    id: 'awareness-2',
    title_ar: 'معرض ملصقات بيئية',
    type: 'توعوية',
    category: 'وعي_عام',
    description_ar: 'معرض لعرض ملصقات ورسومات الطلاب التوعوية عن البيئة في ساحة المدرسة أو الممرات، مع التصويت لأفضل ملصق.',
    default_duration_minutes: 120,
    suggested_location: 'ساحة المدرسة',
    default_points: 40
  },
  {
    id: 'awareness-3',
    title_ar: 'مسابقة أفضل شعار بيئي',
    type: 'توعوية',
    category: 'وعي_عام',
    description_ar: 'مسابقة لابتكار شعارات بيئية قصيرة ومؤثرة، يتم تقييمها من قبل لجنة وتكريم الفائزين.',
    default_duration_minutes: 480,
    suggested_location: 'الفصول الدراسية',
    default_points: 50
  },
  {
    id: 'awareness-4',
    title_ar: 'ركن التوعية البيئية',
    type: 'توعوية',
    category: 'وعي_عام',
    description_ar: 'ركن تفاعلي في الفسحة يقدم معلومات ونشاطات توعوية قصيرة للطلاب، مع توزيع منشورات ومطويات.',
    default_duration_minutes: 30,
    suggested_location: 'ساحة المدرسة',
    default_points: 25
  },

  // ==================== عملية (Practical) ====================
  {
    id: 'practical-1',
    title_ar: 'يوم النظافة الكبير',
    type: 'عملية',
    category: 'نفايات',
    description_ar: 'حملة تنظيف شاملة للمدرسة تشمل الفصول والساحات والحدائق، مع توزيع المهام على الفصول وتوفير أدوات النظافة.',
    default_duration_minutes: 120,
    suggested_location: 'جميع أرجاء المدرسة',
    default_points: 60
  },
  {
    id: 'practical-2',
    title_ar: 'حملة تشجير المدرسة',
    type: 'عملية',
    category: 'تشجير',
    description_ar: 'غرس شتلات وأشجار في حديقة المدرسة أو الأماكن المخصصة، مع تعليم الطلاب طريقة الغرس والعناية بالنباتات.',
    default_duration_minutes: 60,
    suggested_location: 'حديقة المدرسة',
    default_points: 50
  },
  {
    id: 'practical-3',
    title_ar: 'يوم فرز النفايات',
    type: 'عملية',
    category: 'نفايات',
    description_ar: 'تدريب عملي على فرز النفايات إلى فئات (بلاستيك، ورق، عضوي) مع وضع حاويات ملونة وشرح أهمية إعادة التدوير.',
    default_duration_minutes: 60,
    suggested_location: 'ساحة المدرسة',
    default_points: 40
  },
  {
    id: 'practical-4',
    title_ar: 'صيانة حديقة المدرسة',
    type: 'عملية',
    category: 'تشجير',
    description_ar: 'أعمال صيانة دورية للحديقة تشمل: التنظيف، الري، التقليم، إزالة الأعشاب الضارة.',
    default_duration_minutes: 60,
    suggested_location: 'حديقة المدرسة',
    default_points: 35
  },

  // ==================== تنافسية (Competitive) ====================
  {
    id: 'competitive-1',
    title_ar: 'مسابقة أنظف فصل',
    type: 'تنافسية',
    category: 'نفايات',
    description_ar: 'مسابقة أسبوعية بين الفصول لتقييم النظافة والترتيب، مع معايير واضحة وجوائز للفصول الفائزة.',
    default_duration_minutes: 10080,
    suggested_location: 'الفصول الدراسية',
    default_points: 70
  },
  {
    id: 'competitive-2',
    title_ar: 'تحدي ترشيد الطاقة',
    type: 'تنافسية',
    category: 'طاقة',
    description_ar: 'منافسة بين الفصول على ترشيد استهلاك الكهرباء (إطفاء الأنوار والمكيفات عند عدم الحاجة) مع متابعة يومية.',
    default_duration_minutes: 10080,
    suggested_location: 'الفصول الدراسية',
    default_points: 70
  },
  {
    id: 'competitive-3',
    title_ar: 'مسابقة أفضل فكرة بيئية',
    type: 'تنافسية',
    category: 'وعي_عام',
    description_ar: 'مسابقة للطلاب لتقديم أفكار إبداعية لحل مشكلات بيئية في المدرسة أو الحي، مع عرض الأفكار أمام لجنة تحكيم.',
    default_duration_minutes: 4320,
    suggested_location: 'قاعة الأنشطة',
    default_points: 60
  },
  {
    id: 'competitive-4',
    title_ar: 'بطولة الفصول الخضراء',
    type: 'تنافسية',
    category: 'وعي_عام',
    description_ar: 'منافسة شاملة على مدار شهر تجمع عدة معايير: النظافة، الترشيد، المشاركة في الأنشطة البيئية، مع تتويج الفصل الأخضر.',
    default_duration_minutes: 43200,
    suggested_location: 'جميع أرجاء المدرسة',
    default_points: 100
  },

  // ==================== تعليمية (Educational) ====================
  {
    id: 'educational-1',
    title_ar: 'ورشة إعادة التدوير',
    type: 'تعليمية',
    category: 'نفايات',
    description_ar: 'ورشة عملية لتحويل المخلفات إلى منتجات مفيدة (صناعة حافظات أقلام من العلب، لوحات من الورق المستعمل).',
    default_duration_minutes: 60,
    suggested_location: 'قاعة الأنشطة',
    default_points: 35
  },
  {
    id: 'educational-2',
    title_ar: 'تجربة علمية: دورة الماء',
    type: 'تعليمية',
    category: 'ماء',
    description_ar: 'تجربة علمية مبسطة لشرح دورة الماء في الطبيعة، مع أدوات بسيطة وشرح تفاعلي عن أهمية المحافظة على الماء.',
    default_duration_minutes: 45,
    suggested_location: 'المختبر',
    default_points: 30
  },
  {
    id: 'educational-3',
    title_ar: 'درس ميداني: الأشجار',
    type: 'تعليمية',
    category: 'تشجير',
    description_ar: 'جولة تعليمية في حديقة المدرسة للتعرف على أنواع الأشجار وفوائدها وكيفية العناية بها.',
    default_duration_minutes: 30,
    suggested_location: 'حديقة المدرسة',
    default_points: 25
  }
];

// Helper function to get templates by type
export const getTemplatesByType = (type: string): EventTemplate[] => {
  return EVENT_TEMPLATES.filter(t => t.type === type);
};

// Helper function to get template by ID
export const getTemplateById = (id: string): EventTemplate | undefined => {
  return EVENT_TEMPLATES.find(t => t.id === id);
};

// Get all unique types
export const getAllEventTypes = (): string[] => {
  return [...new Set(EVENT_TEMPLATES.map(t => t.type))];
};

// Get all unique categories
export const getAllEventCategories = (): string[] => {
  return [...new Set(EVENT_TEMPLATES.map(t => t.category))];
};