
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { queryKeys } from '../../lib/queryKeys';
import { Challenge, ChallengeStatus } from '../../types';

/**
 * Mutation لإنشاء تحدي جديد
 * يقوم بإضافة الوثيقة إلى Firestore وتحديث الـ Cache
 */
export const useCreateChallenge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newChallenge: Omit<Challenge, 'id'>) => {
      if (!db) throw new Error("Database not initialized");
      const docRef = await addDoc(collection(db, 'challenges'), newChallenge);
      return docRef.id;
    },
    onSuccess: () => {
      // إلغاء صلاحية كافة استعلامات التحديات لضمان ظهور التحدي الجديد
      queryClient.invalidateQueries({ queryKey: queryKeys.challenges.all });
    },
  });
};

/**
 * Mutation لتحديث حالة التحدي (مثلاً من مسودة إلى منشور)
 */
export const useUpdateChallengeStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ChallengeStatus }) => {
      if (!db) throw new Error("Database not initialized");
      const challengeRef = doc(db, 'challenges', id);
      await updateDoc(challengeRef, { status });
    },
    onSuccess: (data, variables) => {
      // تحديث الاستعلامات العامة
      queryClient.invalidateQueries({ queryKey: queryKeys.challenges.all });
      // تحديث استعلام التفاصيل الخاص بهذا التحدي تحديداً
      // queryClient.invalidateQueries({ queryKey: queryKeys.challenges.detail(variables.id) });
    },
  });
};

/**
 * Mutation لحذف تحدي بشكل نهائي
 */
export const useDeleteChallenge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!db) throw new Error("Database not initialized");
      const challengeRef = doc(db, 'challenges', id);
      await deleteDoc(challengeRef);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.challenges.all });
    },
  });
};
