'use client';

import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useEmotionDetail } from '@/hooks/use-emotion-journal';
import { DetailMetaCard } from '../_components/detail-meta-card';
import { getEmotionMeta } from '../_components/emotion-meta';
import { EmotionScoreBlock } from '../_components/emotion-score-block';
import { ImageAnalysisCard } from '../_components/image-analysis-card';
import { TextAnalysisCard } from '../_components/text-analysis-card';

const targetLabel: Record<string, string> = {
  POST: 'Bài viết',
  COMMENT: 'Bình luận',
  SHARE: 'Chia sẻ',
};

export default function EmotionDetailPage({
  params,
}: {
  params: { emotionId: string };
}) {
  const router = useRouter();
  const { emotionId } = params;
  const detailQuery = useEmotionDetail(emotionId);

  const summary = detailQuery.data;
  const finalMeta = getEmotionMeta(summary?.finalEmotion as string);

  const createdAt = useMemo(
    () => (summary ? new Date(summary.createdAt) : null),
    [summary]
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          className="border-slate-200 text-slate-700 hover:border-slate-300"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
        <h1 className="text-2xl font-semibold text-sky-700">Chi tiết cảm xúc</h1>
      </div>

      {detailQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : detailQuery.error || !summary ? (
        <Card className="border-slate-100 shadow-sm">
          <CardContent className="flex items-center gap-3 p-6 text-sm text-rose-600">
            <AlertTriangle className="h-5 w-5" />
            Không thể tải thông tin chi tiết. Vui lòng thử lại sau.
          </CardContent>
        </Card>
      ) : (
        <>
          <DetailMetaCard
            summary={summary}
            analysisId={emotionId}
            createdAt={createdAt}
            targetLabel={targetLabel}
          />

          <Card className="border-slate-100 shadow-sm">
            <CardHeader className="space-y-2">
              <CardTitle className="flex items-center gap-3 text-lg font-semibold text-sky-700">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                  style={{ backgroundColor: `${finalMeta.color}22` }}
                >
                  {finalMeta.emoji}
                </div>
                <div>
                  <p className="text-sm text-slate-500">Cảm xúc tổng hợp</p>
                  <p className="text-xl font-semibold text-slate-900">{finalMeta.label}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-700">Điểm số tổng hợp</p>
                <p className="text-xs text-slate-500">
                  Được tính từ nội dung văn bản và hình ảnh (nếu có).
                </p>
                <div className="mt-3">
                  <EmotionScoreBlock scores={summary.finalScores} />
                </div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-700">Nội dung liên quan</p>
                <p className="mt-2 text-sm text-slate-700">{summary.targetId}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <TextAnalysisCard textEmotion={summary.textEmotion} />
            <ImageAnalysisCard images={summary.imageEmotions} />
          </div>
        </>
      )}
    </div>
  );
}
