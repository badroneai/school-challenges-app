
import React from 'react';
import Modal from './Modal';
import { FaUserTie, FaSchool, FaCheckCircle } from 'react-icons/fa';

interface ApprovalDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (mode: 'central' | 'delegated') => void;
  isLoading?: boolean;
}

const ApprovalDecisionModal: React.FC<ApprovalDecisionModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  isLoading = false
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="قرار اعتماد الطلب"
    >
      <div className="text-center mb-6">
        <p className="text-gray-600 text-lg">
          كيف تود إتمام المراسلة مع الجهة الخارجية؟
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Option A: Central */}
        <button
          onClick={() => onConfirm('central')}
          disabled={isLoading}
          className="flex flex-col items-center p-6 border-2 border-gray-200 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all group text-right"
        >
          <div className="bg-teal-100 text-teal-600 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
            <FaUserTie size={32} />
          </div>
          <h3 className="font-bold text-lg text-gray-800 mb-2">مراسلة مركزية</h3>
          <p className="text-sm text-gray-500 text-center">
            سأقوم أنا (المشرف) بإصدار الخطاب ومراسلة الجهة بنفسي.
          </p>
        </button>

        {/* Option B: Delegated */}
        <button
          onClick={() => onConfirm('delegated')}
          disabled={isLoading}
          className="flex flex-col items-center p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group text-right"
        >
          <div className="bg-blue-100 text-blue-600 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
            <FaSchool size={32} />
          </div>
          <h3 className="font-bold text-lg text-gray-800 mb-2">تفويض المدرسة</h3>
          <p className="text-sm text-gray-500 text-center">
            أمنح المدرسة الصلاحية لطباعة الخطاب ومراسلة الجهة مباشرة.
          </p>
        </button>
      </div>

      <div className="mt-6 text-center">
        <button 
          onClick={onClose}
          disabled={isLoading}
          className="text-gray-500 hover:text-gray-700 underline text-sm"
        >
          إلغاء الأمر
        </button>
      </div>
    </Modal>
  );
};

export default ApprovalDecisionModal;
