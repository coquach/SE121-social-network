'use client';

/* eslint-disable react/no-children-prop */

import { useForm } from '@tanstack/react-form';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group';

import { cn } from '@/lib/utils';

import { useCreateReport } from '@/hooks/use-report-hook';
import { CreateReportForm, ReportSchema } from '@/models/report/reportDTO';
import { TargetType } from '@/models/social/enums/social.enum'; // chỉnh path

const MAX_REASON = 1000;

type CreateReportModalProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  targetId: string;
  targetType: TargetType;
};

export function CreateReportModal({
  open,
  onOpenChange,
  targetId,
  targetType,
}: CreateReportModalProps) {
  const { mutateAsync, isPending } = useCreateReport();

  const form = useForm({
    defaultValues: {
      targetId,
      targetType,
      reason: '',
    } satisfies CreateReportForm,

    validators: {
      onSubmit: ReportSchema,
    },

    onSubmit: async ({ value }) => {
      // value đã qua zod (targetId/targetType/reason)
      const p = mutateAsync(
        {
          targetId: value.targetId,
          targetType: value.targetType,
          reason: value.reason,
        },
        {
          onSuccess: () => {
            form.reset({
              targetId,
              targetType,
              reason: '',
            });
            onOpenChange(false);
          },
        }
      );
      toast.promise(p, { loading: 'Đang gửi báo cáo...' });
      await p;
    },
  });

  // Sync khi đổi target
  useEffect(() => {
    form.reset({
      targetId,
      targetType,
      reason: '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId, targetType]);

  return (
    <Dialog open={open} onOpenChange={(v) => !isPending && onOpenChange(v)}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b ">
          <DialogTitle className="text-base font-semibold text-rose-600 text-center">
            Báo cáo nội dung
          </DialogTitle>
          <p className="text-center text-xs text-gray-500 mt-1">
            Vui lòng mô tả lý do báo cáo (tối đa {MAX_REASON} ký tự).
          </p>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh]">
          <div className="p-4">
            <form
              id="create-report-form"
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
              className="space-y-4"
            >
              <FieldGroup>
                {/* Reason */}
                <form.Field
                  name="reason"
                  children={(field) => {
                    // giống mẫu: touched + invalid mới show error
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          Lý do báo cáo
                          <span className="text-red-500 ml-0.5">*</span>
                        </FieldLabel>

                        <InputGroup>
                          <InputGroupTextarea
                            id={field.name}
                            name={field.name}
                            value={(field.state.value ?? '') as string}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="Ví dụ: Bài viết có nội dung spam/quấy rối..."
                            rows={5}
                            className={cn('min-h-24 resize-none')}
                            aria-invalid={isInvalid}
                            disabled={isPending}
                          />

                          <InputGroupAddon align="block-end">
                            <InputGroupText className="tabular-nums">
                              {String(field.state.value ?? '').length}/
                              {MAX_REASON}
                            </InputGroupText>
                          </InputGroupAddon>
                        </InputGroup>

                        <FieldDescription className="text-xs">
                          Báo cáo sẽ được đội ngũ kiểm duyệt xem xét.
                        </FieldDescription>

                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    );
                  }}
                />
              </FieldGroup>
            </form>
          </div>
        </ScrollArea>

        <div className="px-4 py-3 border-t bg-white flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => {
              form.reset({ targetId, targetType, reason: '' });
              onOpenChange(false);
            }}
          >
            Hủy
          </Button>

          <Button type="submit" variant='destructive' form="create-report-form" disabled={isPending}>
            Gửi báo cáo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
