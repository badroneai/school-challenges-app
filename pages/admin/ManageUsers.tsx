
import React, { useState, useEffect } from 'react';
import { collection, doc, updateDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { UserProfile, UserRole } from '../../types';
import AdminLayout from '../../components/Layout/AdminLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import BottomSheet from '../../components/ui/BottomSheet';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import TableSkeleton from '../../components/skeletons/TableSkeleton';
import { useToast } from '../../contexts/ToastContext';
import { FaCheck, FaTimes, FaUserShield, FaSchool, FaUserClock, FaChevronLeft, FaBuilding, FaEnvelope, FaUserCheck, FaUserMinus, FaTrash, FaExclamationTriangle } from 'react-icons/fa';

const ManageUsers: React.FC = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Custom Delete Confirmation State
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Mobile Sheet State
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!db) return;
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersList = snapshot.docs.map(doc => ({
        ...doc.data(),
        uid: doc.id
      } as UserProfile));
      setUsers(usersList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleToggleApproval = async (uid: string, currentStatus: boolean) => {
    if (!db || !uid) return;
    setActionLoading(uid);
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { is_approved: !currentStatus });
      showToast(currentStatus ? 'تم إيقاف الحساب' : 'تم تفعيل الحساب بنجاح', 'success');
      setIsSheetOpen(false);
    } catch (error) {
      showToast('حدث خطأ أثناء التحديث', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const confirmDeleteUser = (uid: string) => {
    setUserToDelete(uid);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete || !db) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'users', userToDelete));
      showToast('تم حذف المستخدم بنجاح', 'info');
      setIsDeleteConfirmOpen(false);
      setIsSheetOpen(false);
    } catch (error) {
      showToast('فشل في الحذف', 'error');
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
    }
  };

  const handleRowClick = (user: UserProfile) => {
    if (window.innerWidth < 768) {
      setSelectedUser(user);
      setIsSheetOpen(true);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN: return <FaUserShield className="text-rose-500" />;
      case UserRole.SCHOOL_COORDINATOR: return <FaSchool className="text-indigo-500" />;
      case UserRole.ENTITY_MANAGER: return <FaBuilding className="text-teal-600" />;
      default: return <FaUserClock className="text-slate-500" />;
    }
  };

  const getRoleLabel = (role: UserRole) => {
      switch (role) {
          case UserRole.SUPER_ADMIN: return "مشرف عام";
          case UserRole.SCHOOL_COORDINATOR: return "منسق مدرسة";
          case UserRole.ENTITY_MANAGER: return "مندوب جهة";
          default: return "مستخدم";
      }
  };

  return (
    <AdminLayout title="إدارة مستخدمي النظام">
      <div className="mb-6 px-1 text-right">
        <p className="text-slate-500 font-bold text-xs md:text-sm">مراجعة وتفعيل حسابات المنسقين والشركاء الجدد.</p>
      </div>

      {loading ? (
        <TableSkeleton rows={8} />
      ) : (
        <div className="space-y-3">
          <Card className="hidden md:block overflow-hidden rounded-2xl border border-slate-100 shadow-sm p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                    <th className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200 text-xs">المستخدم</th>
                    <th className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200 text-xs">الدور</th>
                    <th className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200 text-xs">الحالة</th>
                    <th className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200 text-xs text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                  {users.map((user) => (
                    <tr key={user.uid} className="hover:bg-slate-50/50 transition-all group">
                      <td className="px-6 py-4">
                          <div className="font-black text-slate-900 dark:text-white text-sm">{user.display_name}</div>
                          <div className="text-[10px] text-slate-400 font-bold">{user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                          {getRoleIcon(user.role)}
                          <span className="uppercase tracking-wider">{getRoleLabel(user.role)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{user.is_approved ? <Badge variant="success">نشط</Badge> : <Badge variant="warning">بانتظار التفعيل</Badge>}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          {user.role !== UserRole.SUPER_ADMIN ? (
                            <>
                              <button onClick={() => handleToggleApproval(user.uid, !!user.is_approved)} disabled={actionLoading === user.uid} className={`p-2 rounded-lg transition-all ${user.is_approved ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`} title={user.is_approved ? 'إيقاف الحساب' : 'تفعيل الحساب'}>
                                {user.is_approved ? <FaUserMinus size={14}/> : <FaUserCheck size={14}/>}
                              </button>
                              <button onClick={() => confirmDeleteUser(user.uid)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all" title="حذف المستخدم"><FaTrash size={14}/></button>
                            </>
                          ) : <span className="text-[10px] font-black text-slate-300 italic">نظام محمي</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="md:hidden space-y-2">
              {users.map(user => (
                  <div key={user.uid} onClick={() => handleRowClick(user)} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-50 dark:border-slate-700 active:scale-[0.98] transition-all">
                      <div className="w-11 h-11 rounded-xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-500 shrink-0">{getRoleIcon(user.role)}</div>
                      <div className="flex-1 min-w-0 text-right"><h4 className="font-black text-slate-900 dark:text-white text-sm truncate">{user.display_name}</h4><p className="text-[10px] text-slate-400 font-bold truncate">{user.email}</p></div>
                      <div className="flex flex-col items-end gap-1.5">{user.is_approved ? <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></div> : <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>}<FaChevronLeft className="text-slate-300" size={10} /></div>
                  </div>
              ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} title="تأكيد حذف المستخدم">
          <div className="text-center p-4">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"><FaExclamationTriangle /></div>
              <h3 className="text-lg font-black text-slate-900 mb-2">حذف الحساب نهائياً؟</h3>
              <p className="text-sm text-slate-500 mb-8 font-bold leading-relaxed">سيتم مسح صلاحيات الدخول والبيانات الشخصية لهذا المستخدم فوراً. لا يمكن الرجوع عن هذه الخطوة.</p>
              <div className="grid grid-cols-2 gap-3">
                  <Button variant="secondary" onClick={() => setIsDeleteConfirmOpen(false)} className="rounded-xl py-3 font-bold">إلغاء</Button>
                  <Button onClick={handleDeleteUser} isLoading={isDeleting} className="bg-red-600 text-white rounded-xl py-3 font-black shadow-lg shadow-red-500/20">تأكيد الحذف</Button>
              </div>
          </div>
      </Modal>

      <BottomSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} title="إدارة الحساب" footer={selectedUser?.role !== UserRole.SUPER_ADMIN && (
          <div className="flex flex-col gap-2 w-full">
            <Button onClick={() => handleToggleApproval(selectedUser!.uid, !!selectedUser!.is_approved)} isLoading={actionLoading === selectedUser?.uid} className={`w-full py-4 rounded-2xl font-black shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95 ${selectedUser?.is_approved ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'}`}>
                {selectedUser?.is_approved ? (<><span>إيقاف الحساب مؤقتاً</span> <FaUserMinus /></>) : (<><span>تفعيل الحساب الآن</span> <FaUserCheck /></>)}
            </Button>
            <Button variant="danger" onClick={() => confirmDeleteUser(selectedUser!.uid)} className="w-full py-4 rounded-2xl font-black flex items-center justify-center gap-3"><span>حذف المستخدم نهائياً</span> <FaTrash /></Button>
          </div>
        )}>
        {selectedUser && (
            <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <div className="p-3 bg-white dark:bg-slate-700 rounded-2xl text-2xl shadow-sm shrink-0">{getRoleIcon(selectedUser.role)}</div>
                    <div className="text-right"><h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 leading-tight">{selectedUser.display_name}</h3><div className="bg-indigo-50 text-indigo-700 px-3 py-0.5 rounded-lg text-[10px] font-black w-fit mr-auto inline-block">{getRoleLabel(selectedUser.role)}</div></div>
                </div>
                <div className="space-y-3 px-2 text-right">
                    <div className="flex items-center justify-between text-xs font-black"><span className="text-slate-400 uppercase tracking-widest">البريد الإلكتروني</span><span className="text-slate-800 dark:text-slate-200 flex items-center gap-2">{selectedUser.email} <FaEnvelope className="text-indigo-400" /></span></div>
                    <div className="flex items-center justify-between text-xs font-black"><span className="text-slate-400 uppercase tracking-widest">حالة الحساب</span>{selectedUser.is_approved ? <span className="text-emerald-600">مفعل</span> : <span className="text-amber-600">بانتظار الموافقة</span>}</div>
                </div>
            </div>
        )}
      </BottomSheet>
    </AdminLayout>
  );
};

export default ManageUsers;
