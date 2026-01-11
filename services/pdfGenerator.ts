
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { EventRequest, Agency, School } from '../types';
import { AmiriFont } from './AmiriFont';

const configureFont = (doc: jsPDF) => {
    try {
        if (AmiriFont && AmiriFont.length > 500) {
            doc.addFileToVFS("Amiri-Regular.ttf", AmiriFont);
            doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
            doc.setFont("Amiri");
            return true;
        }
        return false;
    } catch (e) {
        return false;
    }
};

export const generateEventRequestPDF = (
    eventRequest: EventRequest, 
    agency: Agency, 
    school: School,
    coordinatorEmail: string
) => {
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true
    });
    
    const hasArabic = configureFont(doc);
    doc.setR2L(true);

    const today = new Date().toLocaleDateString('ar-SA');
    const letterRef = `REF-${eventRequest.id.substring(0, 5).toUpperCase()}`;

    // --- 1. Header Logic ---
    doc.setFontSize(10);
    doc.text('المملكة العربية السعودية', 190, 20, { align: 'right' });
    doc.text('وزارة التعليم', 190, 25, { align: 'right' });
    doc.text(school.name_ar, 190, 30, { align: 'right' });

    // Center Placeholder for Ministry Logo (since we don't have the actual URL here sometimes)
    doc.setFontSize(8);
    doc.text('وزارة التعليم', 105, 25, { align: 'center' });
    doc.setLineWidth(0.5);
    doc.circle(105, 20, 8, 'S');

    doc.setFontSize(10);
    doc.text(`التاريخ: ${today}`, 20, 20, { align: 'left' });
    doc.text(`الرقم: ${letterRef}`, 20, 25, { align: 'left' });
    doc.text(`المرفقات: ( )`, 20, 30, { align: 'left' });

    // --- 2. Body ---
    doc.setFontSize(16);
    doc.text(`سعادة مدير / ${agency.name_ar} المحترم`, 190, 60, { align: 'right' });
    doc.setFontSize(12);
    doc.text('السلام عليكم ورحمة الله وبركاته،،، وبعد', 190, 70, { align: 'right' });

    doc.setFontSize(16);
    doc.text(`الموضوع: طلب تعاون لتنفيذ فعالية "${eventRequest.topic || eventRequest.event_type}"`, 105, 85, { align: 'center' });

    doc.setFontSize(13);
    const bodyText = `تتقدم إدارة مدرسة ${school.name_ar} بوافر التحية والتقدير لجهودكم المميزة. رغبةً منا في تعزيز الوعي الطلابي، نأمل من سعادتكم التكرم بالموافقة على إقامة الفعالية المذكورة أعلاه في مقر المدرسة، وذلك حسب التفاصيل التالية:`;
    doc.text(bodyText, 190, 100, { align: 'right', maxWidth: 170 });

    const dates = eventRequest.suggested_dates?.join(' ، ') || 'يتم التنسيق لاحقاً';

    autoTable(doc, {
        startY: 120,
        head: [['البيان', 'التفاصيل']],
        body: [
            ['موضوع الفعالية', eventRequest.topic || eventRequest.event_type],
            ['الموقع المقترح', eventRequest.location || 'مقر المدرسة'],
            ['المواعيد المقترحة', dates],
        ],
        styles: { font: hasArabic ? 'Amiri' : 'helvetica', halign: 'right', fontSize: 11 },
        headStyles: { fillColor: [30, 41, 59] },
        margin: { right: 20, left: 20 }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.text('شاكرين لكم تعاونكم الدائم، وتقبلوا تحياتنا،،،', 105, finalY, { align: 'center' });
    
    // --- 3. Footer (Principal & Stamp) ---
    const footerY = finalY + 20;
    
    // Stamp on the Right side
    if (school.stamp_url) {
        try { doc.addImage(school.stamp_url, 'PNG', 140, footerY + 5, 35, 35); } catch(e) {}
    }

    // Principal Signature on the Left side
    doc.text('مدير المدرسة', 55, footerY, { align: 'center' });
    if (school.signature_url) {
        try { doc.addImage(school.signature_url, 'PNG', 40, footerY + 5, 30, 15); } catch(e) {}
    }
    doc.setLineWidth(0.2);
    doc.line(30, footerY + 25, 80, footerY + 25);
    doc.text(school.manager_name || '', 55, footerY + 32, { align: 'center' });

    doc.save(`Official_Request_${letterRef}.pdf`);
};

export const generateSchoolReportPDF = (
    school: School,
    stats: {
        totalChallenges: number;
        totalSubmissions: number;
        totalParticipants: number;
        totalPoints: number;
        eventsByStatus: { [key: string]: number };
    }
) => {
    const doc = new jsPDF();
    const hasArabic = configureFont(doc);
    doc.setR2L(true);

    doc.setFontSize(22);
    doc.setTextColor(20, 148, 136);
    doc.text('تقرير الأداء المدرسي البيئي', 105, 25, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(80, 80, 80);
    doc.text(school.name_ar, 105, 35, { align: 'center' });

    autoTable(doc, {
        startY: 50,
        head: [['المؤشر', 'القيمة']],
        body: [
            ['إجمالي التحديات المنشورة', stats.totalChallenges],
            ['عدد المشاركات الموثقة', stats.totalSubmissions],
            ['إجمالي الطلاب المشاركين', stats.totalParticipants],
            ['مجموع النقاط المكتسبة', stats.totalPoints],
        ],
        styles: { font: hasArabic ? 'Amiri' : 'helvetica', halign: 'right', fontSize: 12 },
        headStyles: { fillColor: [20, 148, 136] }
    });

    doc.save(`Report_${school.name_ar}.pdf`);
};
