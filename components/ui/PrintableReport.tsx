
import React from 'react';
import { FaPrint, FaTimes, FaFileSignature } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface PrintableReportProps {
  title: string;
  subtitle?: string;
  refNumber: string;
  children: React.ReactNode;
  schoolName?: string;
  managerName?: string;
  logoUrl?: string;
}

const PrintableReport: React.FC<PrintableReportProps> = ({
  title,
  subtitle,
  refNumber,
  children,
  schoolName = "إدارة مدرسة النموذجية",
  managerName = "مدير المدرسة",
  logoUrl
}) => {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString('ar-SA');

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-0 md:p-10 font-sans no-scrollbar">
      {/* Control Bar (Screen Only) */}
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center no-print px-4">
        <div className="flex items-center gap-3">
            <button 
                onClick={() => navigate(-1)} 
                className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-slate-400 hover:text-indigo-600 transition-all active:scale-90"
            >
                <FaTimes />
            </button>
            <h1 className="font-black text-slate-800 dark:text-white">معاينة التقرير الرسمي</h1>
        </div>
        <button 
            onClick={() => window.print()}
            className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-indigo-500/20 active:scale-95 transition-all"
        >
            <span>طباعة المستند</span>
            <FaPrint />
        </button>
      </div>

      {/* A4 Paper Container */}
      <div className="bg-white mx-auto shadow-2xl overflow-hidden print:shadow-none print:w-full w-full max-w-[210mm] min-h-[297mm] relative text-black p-[2cm] print:p-0 flex flex-col">
        
        {/* Official Header */}
        <header className="flex justify-between items-start mb-12 border-b-2 border-black pb-8">
            <div className="text-right space-y-1">
                <p className="font-black text-sm">المملكة العربية السعودية</p>
                <p className="font-bold text-sm">وزارة التعليم</p>
                <p className="font-bold text-sm">{schoolName}</p>
                {logoUrl && <img src={logoUrl} className="h-12 mt-2 object-contain" alt="Logo" />}
            </div>
            <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-2 border-black rounded-full flex items-center justify-center mb-1">
                    <span className="text-[10px] font-black text-center leading-tight">شعار<br/>الوزارة</span>
                </div>
            </div>
            <div className="text-left text-xs space-y-1" dir="rtl">
                <p><span className="font-black">التاريخ:</span> {today}</p>
                <p><span className="font-black">الرقم:</span> {refNumber}</p>
                <p><span className="font-black">المرفقات:</span> ( ... )</p>
            </div>
        </header>

        {/* Report Content */}
        <main className="flex-1">
            <div className="text-center mb-12">
                <h2 className="text-2xl font-black underline underline-offset-8 decoration-2">{title}</h2>
                {subtitle && <p className="text-slate-600 font-bold mt-3">{subtitle}</p>}
            </div>

            <div className="report-body text-right">
                {children}
            </div>
        </main>

        {/* Footer / Signatures */}
        <footer className="mt-20">
            <div className="flex justify-between items-end mb-16">
                <div className="w-1/3 text-center">
                    <p className="font-black text-sm mb-12">الختم الرسمي</p>
                    <div className="w-32 h-32 border border-dashed border-gray-300 rounded-full mx-auto"></div>
                </div>
                <div className="w-1/3 text-center">
                    <p className="font-black text-sm mb-12">مدير المدرسة</p>
                    <p className="font-bold border-t border-black pt-2">{managerName}</p>
                </div>
            </div>
            <div className="text-center text-[10px] text-slate-400 font-medium border-t pt-4">
                تم استخراج هذا التقرير آلياً عبر منصة تحديات المدارس - {new Date().toLocaleString('ar-SA')}
            </div>
        </footer>
      </div>
    </div>
  );
};

export default PrintableReport;