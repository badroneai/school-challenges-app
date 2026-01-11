
import React, { useEffect, useState } from 'react';
import { FaPrint, FaTimes, FaPaperPlane, FaCheckCircle } from 'react-icons/fa';
import Button from './Button';
import { doc, getDoc, updateDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationType } from '../../types';

interface OfficialLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    school_id?: string;
    agency_id?: string;
    school_name?: string;
    schoolName?: string;
    agency_name?: string;
    agencyName?: string;
    topic: string;
    dates?: string[];
    suggested_dates?: string[];
    id: string;
    createdDate?: string;
    status?: string;
  } | null;
  onStatusChange?: (id: string, newStatus: string) => void;
}

const OfficialLetterModal: React.FC<OfficialLetterModalProps> = ({ isOpen, onClose, data, onStatusChange }) => {
  const { user } = useAuth();
  const [schoolDetails, setSchoolDetails] = useState<{
      name_ar?: string,
      manager_name?: string, 
      logo_url?: string, 
      stamp_url?: string, 
      signature_url?: string,
      show_stamp?: boolean,
      show_signature?: boolean
  }>({});
  const [isSending, setIsSending] = useState(false);
  const [isSentSuccess, setIsSentSuccess] = useState(false);

  const agencyName = data?.agency_name || data?.agencyName || 'الجهة المختصة';
  const schoolName = data?.school_name || data?.schoolName || 'المدرسة';
  const displayDates = data?.suggested_dates || data?.dates || [];
  const agencyId = data?.agency_id;

  useEffect(() => {
    if (isOpen && data?.school_id) {
        const fetchDetails = async () => {
            try {
                const docRef = doc(db, 'schools', data.school_id!);
                const snap = await getDoc(docRef);
                if (snap.exists()) setSchoolDetails(snap.data() as any);
            } catch (e) { console.error(e); }
        };
        fetchDetails();
    }
    setIsSentSuccess(data?.status === 'sent' || data?.status === 'entity_approved');
  }, [isOpen, data]);

  if (!isOpen || !data) return null;

  const today = new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const letterRef = `REF-${data.id.substring(0, 5).toUpperCase()}`;

  const handleSendToEntity = async () => {
    if (!data.id || isSending) return;
    
    setIsSending(true);
    try {
        const requestRef = doc(db, 'event_requests', data.id);
        await updateDoc(requestRef, { 
            status: 'sent',
            sent_date: serverTimestamp()
        });

        if (agencyId) {
            await addDoc(collection(db, 'notifications'), {
                userId: `AGENCY_${agencyId}`, 
                type: NotificationType.NEW_REQUEST,
                title: 'طلب فعالية جديد بالمنصة',
                message: `وصلكم طلب تعاون رسمي من مدرسة ${schoolName} بخصوص ${data.topic}`,
                createdAt: serverTimestamp(),
                read: false,
                data: { requestId: data.id }
            });
        }

        setIsSentSuccess(true);
        if (onStatusChange) onStatusChange(data.id, 'sent');
        alert("تم إرسال الخطاب إلكترونياً للجهة بنجاح.");
    } catch (error) {
        console.error(error);
        alert("فشل الإرسال، يرجى المحاولة لاحقاً");
    } finally {
        setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 md:p-4">
      <style>
        {`@media print { 
            body * { visibility: hidden; } 
            #official-letter-container, #official-letter-container * { visibility: visible; } 
            #official-letter-container { 
                position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 1.2cm; 
                background: white; color: black; border: none !important; box-shadow: none !important;
            } 
            .no-print { display: none !important; } 
            @page { size: A4; margin: 0; } 
        }`}
      </style>

      <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl w-full max-w-5xl h-full md:h-auto max-h-[95vh] relative flex flex-col border border-slate-200 dark:border-slate-800 animate-in zoom-in duration-300">
        
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-100 dark:border-slate-800 no-print shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
             <div className="p-2.5 md:p-3 bg-teal-50 dark:bg-teal-900/30 text-teal-600 rounded-xl md:rounded-2xl">
                <FaPaperPlane />
             </div>
             <h3 className="text-sm md:text-xl font-black text-slate-800 dark:text-white">معاينة وإرسال الخطاب المعتمد</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 transition-colors active:scale-90"><FaTimes size={20} /></button>
        </div>

        <div className="overflow-auto flex-1 p-2 md:p-10 bg-slate-100 dark:bg-slate-950 no-print">
          <div id="official-letter-container" className="bg-white p-[1cm] md:p-[2cm] mx-auto shadow-xl text-black w-full md:w-[210mm] min-h-[297mm] relative font-serif border border-gray-200 origin-top">
            {/* الترويسة */}
            <div className="flex flex-col w-full mb-8">
              <div className="w-full flex justify-between items-start px-4">
                <div className="text-right space-y-0.5 md:space-y-1">
                  <p className="font-bold text-[10px] md:text-sm">المملكة العربية السعودية</p>
                  <p className="font-bold text-[10px] md:text-sm">وزارة التعليم</p>
                  <p className="font-bold text-[10px] md:text-sm">{schoolDetails?.name_ar || schoolName}</p>
                </div>
                <div className="w-12 h-12 md:w-20 md:h-20 border border-slate-200 rounded-full flex items-center justify-center text-[8px] md:text-[10px] font-black text-center">شعار<br/>الوزارة</div>
                <div className="text-left space-y-0.5 md:space-y-1" dir="rtl">
                   <p className="text-[10px] md:text-sm font-bold">التاريخ: <span className="font-normal">{today}</span></p>
                   <p className="text-[10px] md:text-sm font-bold">الرقم: <span className="font-normal">{letterRef}</span></p>
                </div>
              </div>
              <div className="w-full h-px bg-black my-4"></div>
            </div>

            <div className="space-y-6 md:space-y-10 text-right leading-relaxed text-sm md:text-xl px-4">
              <div className="mt-4 md:mt-8">
                <p className="font-black text-base md:text-2xl mb-1">سعادة مدير / {agencyName} المحترم</p>
                <p className="text-xs md:text-lg">السلام عليكم ورحمة الله وبركاته،،، وبعد</p>
              </div>

              <div className="pt-2 md:pt-4">
                <h2 className="font-black text-center underline underline-offset-[8px] md:underline-offset-[14px] text-sm md:text-2xl mb-6 md:mb-12 decoration-1 md:decoration-2">
                    الموضوع: طلب تعاون لتنفيذ فعالية "{data.topic}"
                </h2>
                <p className="text-justify indent-6 md:indent-12 leading-loose">
                  تتقدم إدارة مدرسة <span className="font-bold">{schoolName}</span> بوافر التحية والتقدير لجهودكم المميزة. وانطلاقاً من الشراكة المجتمعية، نأمل التكرم بالموافقة على تنفيذ الفعالية المذكورة لطلابنا.
                </p>
                
                <div className="bg-slate-50 p-4 md:p-8 rounded-2xl md:rounded-3xl border border-slate-100 mt-6 md:mt-10">
                    <p className="font-black mb-2 md:mb-4 text-indigo-900 border-r-4 border-indigo-600 pr-2 md:pr-3 text-xs md:text-base">المواعيد المقترحة:</p>
                    <ul className="space-y-1 md:space-y-3 pr-4 md:pr-6 list-inside list-disc font-bold text-gray-800 text-[10px] md:text-lg">
                      {displayDates.length > 0 ? displayDates.map((date, i) => <li key={i}>{date}</li>) : <li>سيتم التنسيق معكم لاحقاً</li>}
                    </ul>
                </div>
              </div>

              <p className="text-center font-black text-sm md:text-xl pt-6 md:pt-10">وتقبلوا خالص التحية والتقدير،،،</p>
            </div>

            <div className="mt-16 md:mt-28 flex justify-between items-end px-6">
              <div className="w-1/3 flex flex-col items-center">
                {(schoolDetails.stamp_url && schoolDetails.show_stamp !== false) && (
                    <img src={schoolDetails.stamp_url} className="w-24 md:w-40 opacity-80 mix-blend-multiply" alt="الختم" />
                )}
              </div>
              <div className="text-center w-1/2">
                <p className="font-black text-sm md:text-xl mb-4 md:mb-6">مدير المدرسة</p>
                <div className="h-16 md:h-28 flex items-center justify-center mb-1 md:mb-2">
                    {(schoolDetails.signature_url && schoolDetails.show_signature !== false) && <img src={schoolDetails.signature_url} className="max-h-12 md:max-h-24 object-contain" alt="التوقيع" />}
                </div>
                <p className="border-t border-black pt-2 font-black text-xs md:text-xl">{schoolDetails.manager_name || '........................'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 border-t border-gray-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 rounded-b-[1.5rem] md:rounded-b-[2.5rem] no-print shrink-0">
          <div className="flex items-center gap-2">
            {isSentSuccess && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-xl text-[10px] md:text-xs font-black">
                    <FaCheckCircle /> تم الإرسال للجهة
                </div>
            )}
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="secondary" onClick={onClose} className="flex-1 md:flex-none rounded-xl md:rounded-2xl px-6 py-3 text-xs">إغلاق</Button>
            <Button onClick={() => window.print()} variant="secondary" className="hidden sm:flex items-center gap-2 font-black rounded-2xl px-6 border-2 border-slate-200 text-xs">
                <FaPrint /> طباعة
            </Button>
            {!isSentSuccess && (
                <Button onClick={handleSendToEntity} isLoading={isSending} className="flex-2 md:flex-none flex items-center justify-center gap-2 font-black px-6 md:px-10 rounded-xl md:rounded-2xl bg-teal-600 text-xs md:text-sm">
                    <FaPaperPlane /> إرسال إلكتروني
                </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficialLetterModal;