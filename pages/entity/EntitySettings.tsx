
import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import EntityLayout from '../../components/Layout/EntityLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Spinner from '../../components/ui/Spinner';
import { Agency } from '../../types';
import { FaSave, FaBuilding, FaImage, FaMapMarkedAlt, FaClock, FaLock } from 'react-icons/fa';

const EntitySettings: React.FC = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [agencyData, setAgencyData] = useState<Partial<Agency>>({});
  const [logoPreview, setLogoPreview] = useState('');

  useEffect(() => {
    const fetchAgency = async () => {
      if (!userProfile?.agency_id) return;
      try {
        const docRef = doc(db, 'agencies', userProfile.agency_id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data() as Agency;
          setAgencyData(data);
          setLogoPreview(data.logo_url || '');
        }
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchAgency();
  }, [userProfile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 500 * 1024) { alert("حجم الصورة كبير جداً"); return; }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogoPreview(base64);
        setAgencyData(prev => ({ ...prev, logo_url: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.agency_id) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'agencies', userProfile.agency_id), agencyData);
      alert("تم حفظ البيانات بنجاح");
    } catch (error) { alert("حدث خطأ أثناء الحفظ"); }
    finally { setSaving(false); }
  };

  if (loading) return <EntityLayout title="الإعدادات"><Spinner /></EntityLayout>;

  return (
    <EntityLayout title="الملف التعريفي والإعدادات">
      <div className="max-w-4xl mx-auto">
        <Card className="rounded-[2.5rem] p-10 border-none shadow-sm text-right">
          <div className="flex items-center justify-end gap-4 mb-10 border-b pb-6">
            <div>
              <h2 className="text-2xl font-black">بيانات الجهة</h2>
              <p className="text-gray-500 text-xs font-bold mt-1">هذه المعلومات ستظهر للمدارس عند تقديم الطلبات.</p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-3xl text-indigo-700 shadow-sm"><FaBuilding size={28} /></div>
          </div>

          <form onSubmit={handleSave} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="md:col-span-2 space-y-6">
                <Input label="اسم الجهة الرسمي" value={agencyData.name_ar || ''} onChange={e => setAgencyData({...agencyData, name_ar: e.target.value})} required className="font-black" />
                <Textarea label="الرؤية / نبذة عن الجهة" placeholder="وصف مختصر لدور الجهة..." value={agencyData.vision || agencyData.description || ''} onChange={e => setAgencyData({...agencyData, vision: e.target.value})} rows={5} className="font-bold leading-relaxed" />
              </div>

              <div className="md:col-span-1">
                <label className="block text-xs font-black text-slate-800 mb-3">شعار الجهة الرسمي</label>
                <div className={`relative h-56 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center transition-all cursor-pointer ${logoPreview ? 'border-indigo-500 bg-indigo-50/10' : 'border-slate-200 bg-slate-50'}`}>
                  {logoPreview ? <img src={logoPreview} className="h-40 w-40 object-contain" alt="Logo" /> : (
                    <div className="text-slate-300 flex flex-col items-center gap-2">
                      <FaImage size={48} />
                      <span className="text-[10px] font-black uppercase">اضغط للرفع</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-50">
              <Input label="ساعات العمل / التوفر" placeholder="مثال: الأحد - الخميس، 8 ص - 2 م" value={agencyData.work_hours || ''} onChange={e => setAgencyData({...agencyData, work_hours: e.target.value})} className="font-bold" />
              <Input label="الموقع الإلكتروني" placeholder="https://..." value={agencyData.website_url || ''} onChange={e => setAgencyData({...agencyData, website_url: e.target.value})} className="font-bold" />
            </div>

            <div className="pt-8 border-t border-slate-50">
               <label className="block text-xs font-black text-slate-800 mb-4 flex items-center justify-end gap-2">
                 <span>رابط الموقع الجغرافي (Google Maps)</span>
                 <FaMapMarkedAlt className="text-indigo-500" />
               </label>
               <Input label="" placeholder="https://maps.google.com/..." value={agencyData.location_map_url || ''} onChange={e => setAgencyData({...agencyData, location_map_url: e.target.value})} className="font-bold" />
               <p className="text-[10px] text-slate-400 mt-2 font-bold">يساعد المدارس في الوصول لمقركم في حال تنفيذ مبادرات داخلية لديهم.</p>
            </div>

            <div className="flex justify-center pt-8 border-t border-slate-50">
              <Button type="submit" isLoading={saving} className="flex items-center gap-3 px-16 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 font-black text-lg">
                <span>حفظ التغييرات</span>
                <FaSave />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </EntityLayout>
  );
};

export default EntitySettings;
