
import React from 'react';
import { FaCheck, FaTimes, FaCircle, FaHourglassHalf, FaBuilding, FaUserTie, FaPaperPlane, FaBan } from 'react-icons/fa';

interface RequestStepperProps {
  status: string;
}

const RequestStepper: React.FC<RequestStepperProps> = ({ status }) => {
  // States: 'pending', 'current', 'completed', 'error', 'cancelled'
  
  // Step 1: Sent (Always completed if the request exists in list)
  let step1State = 'completed'; 
  // Step 2: Supervisor (المشرف)
  let step2State = 'pending'; 
  // Step 3: Partner/Entity (الجهة)
  let step3State = 'pending'; 
  // Step 4: Approved/Completed (مكتمل)
  let step4State = 'pending'; 

  switch (status) {
    case 'pending':
      // Waiting for Supervisor
      step2State = 'current';
      break;
      
    case 'approved': // Internal Supervisor Approved (Central)
      step2State = 'completed';
      step3State = 'pending'; // Waiting to be sent to Entity
      break;

    case 'delegated_to_school': // Supervisor Approved & Delegated
      step2State = 'completed';
      step3State = 'current'; // Waiting for School to send to Entity
      break;
      
    case 'sent': // Submitted to Entity
      step2State = 'completed';
      step3State = 'current';
      break;
      
    case 'in_progress': // Coordination
      step2State = 'completed';
      step3State = 'current';
      break;
      
    case 'entity_approved':
      step2State = 'completed';
      step3State = 'completed';
      step4State = 'completed';
      break;
      
    case 'entity_rejected':
      step2State = 'completed';
      step3State = 'error';
      break;
      
    case 'rejected': // Internal Rejection
      step2State = 'error';
      break;

    case 'cancelled': // Cancelled by School
      step2State = 'cancelled';
      break;
      
    case 'completed':
      step2State = 'completed';
      step3State = 'completed';
      step4State = 'completed';
      break;
      
    default:
      step2State = 'pending';
  }

  const renderStepIcon = (state: string, defaultIcon?: React.ReactNode) => {
    if (state === 'completed') return <FaCheck size={10} />;
    if (state === 'error') return <FaTimes size={10} />;
    if (state === 'cancelled') return <FaBan size={10} />;
    if (state === 'current') return <FaHourglassHalf size={10} />;
    return defaultIcon || <FaCircle size={6} />;
  };

  const getStepClasses = (state: string) => {
    if (state === 'completed') return 'bg-green-500 text-white border-green-500';
    if (state === 'error') return 'bg-red-500 text-white border-red-500';
    if (state === 'cancelled') return 'bg-gray-400 text-white border-gray-400';
    if (state === 'current') return 'bg-blue-500 text-white border-blue-500 ring-2 ring-blue-200 animate-pulse';
    return 'bg-white text-gray-300 border-gray-300';
  };

  const getLineClasses = (prevState: string) => {
    if (prevState === 'completed') return 'bg-green-500';
    return 'bg-gray-200';
  };

  const Step = ({ state, label, icon }: { state: string, label: string, icon?: React.ReactNode }) => (
    <div className="flex flex-col items-center relative z-10 group min-w-[40px]">
      <div 
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${getStepClasses(state)}`}
        title={label}
      >
        {renderStepIcon(state, icon)}
      </div>
      <span className={`text-[10px] mt-1 font-medium whitespace-nowrap transition-colors ${state === 'current' ? 'text-blue-600 font-bold' : state === 'error' ? 'text-red-600' : state === 'cancelled' ? 'text-gray-500' : 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex items-center w-full min-w-[280px] select-none" dir="rtl">
      {/* Step 1: Sent */}
      <Step state={step1State} label="تم الإرسال" icon={<FaPaperPlane size={10} />} />
      
      {/* Line 1 */}
      <div className={`flex-1 h-0.5 mx-1 mb-4 transition-colors duration-500 ${getLineClasses(step1State)}`} />
      
      {/* Step 2: Supervisor */}
      <Step state={step2State} label={status === 'cancelled' ? 'ملغي' : 'المشرف'} icon={<FaUserTie size={10} />} />
      
      {/* Line 2 */}
      <div className={`flex-1 h-0.5 mx-1 mb-4 transition-colors duration-500 ${getLineClasses(step2State)}`} />
      
      {/* Step 3: Entity */}
      <Step state={step3State} label="الجهة" icon={<FaBuilding size={10} />} />
      
      {/* Line 3 */}
      <div className={`flex-1 h-0.5 mx-1 mb-4 transition-colors duration-500 ${getLineClasses(step3State)}`} />
      
      {/* Step 4: Approved */}
      <Step state={step4State} label="مكتمل" />
    </div>
  );
};

export default RequestStepper;
