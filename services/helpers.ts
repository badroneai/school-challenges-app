
export const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
};

export const formatArabicDate = (dateString: string) => {
    if (!dateString) return '';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ar-SA', options);
};

/**
 * دالة تحويل التاريخ إلى هجري (تقويم أم القرى)
 * تضمن ظهور أسماء الأشهر الهجرية (محرم، صفر...) بدلاً من الميلادية
 */
export const getHijriDate = (dateString: string) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        // استخدام تقويم أم القرى بشكل صريح وقسري مع أرقام لاتينية لسهولة القراءة
        const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        return formatter.format(date);
    } catch (e) {
        console.error("Hijri conversion error:", e);
        return '';
    }
};
