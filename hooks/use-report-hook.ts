
import { createReport } from '@/lib/actions/admin/report-action';
import { CreateReportForm } from '@/models/report/reportDTO';
import { useAuth } from '@clerk/nextjs';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useCreateReport = () => {
  const { getToken } = useAuth();
  return useMutation({
    mutationKey: ['create-report'],
    mutationFn: async (data: CreateReportForm) => {
      const token = await getToken();
      if (!token) throw new Error('Unauthorized');
      return await createReport(token, data);
    },
    onSuccess: () => {
      toast.success('Tạo báo cáo thành công');
    },
    onError: (error) => {
      toast.error(error?.message || 'Đã có lỗi xảy ra khi tạo báo cáo');
    },
  });
};
