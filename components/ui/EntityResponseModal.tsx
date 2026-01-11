import React from 'react';
import { FaPrint, FaTimes } from 'react-icons/fa';
import Button from './Button';
import { Agency, EventRequest } from '../../types';

interface EntityResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: EventRequest;
  agency: Agency;
  schoolName: string;
}

const EntityResponseModal: React.FC<EntityResponseModalProps> = ({ isOpen, onClose, request, agency, schoolName }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            #entity-letter-container, #entity-letter-container * { visibility: visible; }
            #entity-letter-container {
              position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px;
              background: white; color: black;
            }
            .no-print { display: none !important; }
            @page { size: A4; margin: 2cm; }
          }
        `}
      </style>

      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl m-4 relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 no-print">
          <h3 className="text-lg font-bold text-gray-800">معاينة خطاب الموافقة الرسمي</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-8 bg-gray-50">
          <div id="entity-letter-container" className="bg-white p-12 mx-auto shadow-sm border border-gray-200 text-black max-w-[210mm] min-h-[297mm] relative">
            
            {/* Letter Head */}
            <div className="flex justify-between items-start mb-12 border-b-2 border-indigo-900 pb-6">
              <div className="text-center w-1/3">
                 {/* Entity Logo */}
                 {agency.logo_url ? (
                     <img src={agency.logo_url} alt="Logo" className="h-24 mx-auto object-contain" />
                 ) : (
                     <div className="h-24 flex items-center justify-center border border-dashed text-gray-400">شعار الجهة</div>
                 )}
              </div>
              <div className="text-center w-1/3 pt-4">
                <h1 className="font-bold text-xl mb-1">{agency.name_ar}</h1>
                <p className="text-sm text-gray-600">إدارة الشراكات المجتمعية</p>
              </div>
              <div className="text-right w-1/3 text-sm pt-4">
                <p className="mb-1"><span className="font-bold">إلى:</span> {schoolName}</p>
                <p className="mb-1"><span className="font-bold">التاريخ:</span> {request.entity_response_date || new Date().toLocaleDateString('ar-SA')}</p>
                <p className="mb-1"><span className="font-bold">رقم المرجع:</span> REF-{request.id.substring(0, 6)}</p>
              </div>
            </div>

            {/* Body */}
            <div className="space-y-8 text-right font-serif leading-loose text-lg px-8">
              
              <div>
                <p className="font-bold text-xl mb-2">سعادة مدير / {schoolName} <span className="float-left text-base font-normal">المحترم</span></p>
                <p className="text-base">السلام عليكم ورحمة الله وبركاته،،،</p>
              </div>

              <div>
                <p className="font-bold text-center underline underline-offset-8 mb-6 text-xl">
                  الموضوع: الموافقة على طلب تنفيذ فعالية "{request.event_type}"
                </p>
                <p className="text-justify indent-8">
                  إشارة إلى خطابكم بشأن طلب التعاون لتنفيذ الفعالية المذكورة، يسرنا في <span className="font-bold">{agency.name_ar}</span> إبلاغكم بالموافقة على الطلب.
                </p>
                <p className="text-justify indent-8 mt-4">
                  نؤكد لكم حرصنا الدائم على دعم الأنشطة التعليمية والتوعوية. وقد تم تكليف الفريق المختص للقيام بالمهمة في الموعد المحدد.
                </p>
              </div>

              <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="font-bold mb-2 underline">تفاصيل الاعتماد:</p>
                <p><strong>الفريق المكلف / المندوب:</strong> {request.assigned_team}</p>
                {request.entity_response_notes && <p><strong>ملاحظات:</strong> {request.entity_response_notes}</p>}
              </div>

              <p className="mt-8 text-center font-bold">
                وتقبلوا خالص التحية والتقدير،،،
              </p>
            </div>

            {/* Footer / Signature */}
            <div className="mt-24 flex justify-end relative px-8">
              <div className="text-center w-64 relative">
                <p className="font-bold mb-16">مدير الجهة / المسؤول المفوض</p>
                
                {/* Stamp Overlay */}
                {agency.stamp_url && (
                    <img 
                        src={agency.stamp_url} 
                        alt="Stamp" 
                        className="absolute top-8 left-1/2 transform -translate-x-1/2 w-32 opacity-90"
                        style={{ mixBlendMode: 'multiply' }}
                    />
                )}
                 <p className="border-t border-gray-400 pt-2 font-semibold">
                    {agency.manager_name || '........................'}
                </p>
              </div>
            </div>

             {/* System Footer */}
             <div className="absolute bottom-10 left-0 right-0 text-center text-xs text-gray-400">
                تم إصدار هذا الخطاب إلكترونياً عبر منصة الشراكات المدرسية
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 no-print">
          <Button variant="secondary" onClick={onClose}>إغلاق</Button>
          <Button onClick={handlePrint} className="flex items-center gap-2">
             <FaPrint /> طباعة / حفظ PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EntityResponseModal;