
import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import SchoolLayout from '../../components/Layout/SchoolLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import { FaCamera, FaSave, FaSignature, FaCheckCircle, FaExclamationCircle, FaImage, FaStamp, FaEye, FaEyeSlash } from 'react-icons/fa';

type AssetType = 'logo' | 'stamp' | 'signature';

const Settings: React.FC = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  const [schoolData, setSchoolData] = useState({
    name_ar: '',
    manager_name: '',
    logo_url: '',
    stamp_url: '',
    signature_url: '',
    show_stamp: true,
    show_signature: true
  });
  
  const [previews, setPreviews] = useState<Record<AssetType, string>>({ logo: '', stamp: '', signature: '' });

  useEffect(() => {
    const fetchSchoolData = async () => {
      if (!userProfile?.school_id) return;
      try {
        const docRef = doc(db, 'schools', userProfile.school_id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSchoolData({
            name_ar: data.name_ar || '',
            manager_name: data.manager_name || '',
            logo_url: data.logo_url || '',
            stamp_url: data.stamp_url || '',
            signature_url: data.signature_url || '',
            show_stamp: data.show_stamp ?? true,
            show_signature: data.show_signature ?? true
          });
          setPreviews({ logo: data.logo_url || '', stamp: data.stamp_url || '', signature: data.signature_url || '' });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchoolData();
  }, [userProfile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: AssetType) => {
    setStatusMessage(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 300 * 1024) {
          setStatusMessage({ type: 'error', text: 'حجم الملف كبير جداً. يرجى استخدام صورة أقل من 300 كيلوبايت.' });
          return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreviews(prev => ({ ...prev, [type]: base64 }));
        setSchoolData(prev => ({ ...prev, [`${type}_url`]: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.school_id) return;
    setSaving(true);
    setStatusMessage(null);
    try {
      const docRef = doc(db, 'schools', userProfile.school_id);
      await updateDoc(docRef, { ...schoolData });
      setStatusMessage({ type: 'success', text: 'تم تحديث بيانات الهوية الرسمية بنجاح' });
    } catch (error) {
      setStatusMessage({ type: 'error', text: 'حدث خطأ أثناء الحفظ' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <SchoolLayout title="الإعدادات"><Spinner /></SchoolLayout>;

  return (
    <SchoolLayout title="إعدادات الهوية والختم الرسمي">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="rounded-[2.5rem] p-10 border-none shadow-sm">
          <div className="flex items-center justify-end gap-4 mb-10 border-b pb-6 text-right">
            <div>
                <h2 className="text-2xl font-black">ملف الهوية والختم</h2>
                <p className="text-gray-500 text-xs font-bold mt-1">تستخدم هذه المرفقات في إصدار الخطابات الرسمية المعتمدة</p>
            </div>
            <div className="p-4 bg-teal-50 rounded-3xl text-teal-600 shadow-sm"><FaSignature size={28} /></div>
          </div>

          <form onSubmit={handleSave} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-right">
                <Input label="اسم المدرسة الرسمي" value={schoolData.name_ar} onChange={e => setSchoolData({...schoolData, name_ar: e.target.value})} required className="font-black" />
                <Input label="اسم مدير/ة المدرسة" placeholder="الاسم المعتمد للتوقيع" value={schoolData.manager_name} onChange={e => setSchoolData({...schoolData, manager_name: e.target.value})} required className="font-black" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* الشعار */}
                <div className="space-y-4">
                    <label className="block text-xs font-black text-slate-800 text-right">1. شعار الجهة / المدرسة</label>
                    <div className={`relative h-44 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center transition-all ${previews.logo ? 'border-teal-500 bg-teal-50/10' : 'border-slate-200 bg-slate-50'}`}>
                        {previews.logo ? <img src={previews.logo} className="h-32 object-contain" alt="Logo" /> : <FaImage className="text-slate-300 text-4xl" />}
                        <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'logo')} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                    <div className="text-center"><span className="text-[9px] text-teal-600 font-black uppercase">سيظهر دائماً في الترويسة</span></div>
                </div>

                {/* الختم */}
                <div className="space-y-4">
                    <label className="block text-xs font-black text-slate-800 text-right">2. الختم الرسمي</label>
                    <div className={`relative h-44 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center transition-all ${previews.stamp ? 'border-indigo-500 bg-indigo-50/10' : 'border-slate-200 bg-slate-50'}`}>
                        {previews.stamp ? <img src={previews.stamp} className="h-32 object-contain" style={{ mixBlendMode: 'multiply' }} alt="Stamp" /> : <FaStamp className="text-slate-300 text-4xl" />}
                        <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'stamp')} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                    <button type="button" onClick={() => setSchoolData({...schoolData, show_stamp: !schoolData.show_stamp})} className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black transition-all ${schoolData.show_stamp ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                        <span>{schoolData.show_stamp ? 'الختم مفعل في الخطاب' : 'الختم مخفي من الخطاب'}</span>
                        {schoolData.show_stamp ? <FaEye /> : <FaEyeSlash />}
                    </button>
                </div>

                {/* التوقيع */}
                <div className="space-y-4">
                    <label className="block text-xs font-black text-slate-800 text-right">3. توقيع المدير</label>
                    <div className={`relative h-44 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center transition-all ${previews.signature ? 'border-orange-500 bg-orange-50/10' : 'border-slate-200 bg-slate-50'}`}>
                        {previews.signature ? <img src={previews.signature} className="h-32 object-contain" alt="Signature" /> : <FaSignature className="text-slate-300 text-4xl" />}
                        <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'signature')} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                    <button type="button" onClick={() => setSchoolData({...schoolData, show_signature: !schoolData.show_signature})} className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black transition-all ${schoolData.show_signature ? 'bg-orange-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                        <span>{schoolData.show_signature ? 'التوقيع مفعل في الخطاب' : 'التوقيع مخفي من الخطاب'}</span>
                        {schoolData.show_signature ? <FaEye /> : <FaEyeSlash />}
                    </button>
                </div>
            </div>

            <div className="bg-indigo-50 p-5 rounded-2xl text-indigo-900 text-[11px] font-black flex gap-3 items-center border border-indigo-100">
                <FaExclamationCircle size={20} className="text-indigo-500 shrink-0" />
                <p>نصيحة: تأكد من تفعيل خيار العرض لكل مرفق ترغب بظهوره في الخطابات الرسمية. يمكنك معاينة النتيجة مباشرة في سجل الطلبات.</p>
            </div>

            <div className="flex flex-col items-center pt-6 border-t gap-4">
                {statusMessage && (
                    <div className={`p-4 rounded-xl w-full text-center font-black text-xs ${statusMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        <span>{statusMessage.text}</span>
                        <FaCheckCircle className="inline mr-2"/>
                    </div>
                )}
                <Button type="submit" isLoading={saving} className="flex items-center gap-3 px-16 py-4 rounded-2xl shadow-xl shadow-teal-500/20 bg-teal-600 font-black">
                    <span>حفظ كافة البيانات</span>
                    <FaSave />
                </Button>
            </div>
          </form>
        </Card>
      </div>
    </SchoolLayout>
  );
};

export default Settings;
