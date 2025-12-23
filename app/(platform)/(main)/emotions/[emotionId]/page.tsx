'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertTriangle, ImageIcon, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useEmotionDetail } from '@/hooks/use-emotion-journal';
import {
  AnalysisStatus,
  EmotionKey,
  EmotionScoresDTO,
} from '@/models/emotion/emotionDTO';
import { EMOTION_KEYS, emotionMeta, getEmotionMeta } from '../_components/emotion-meta';

const targetLabel: Record<string, string> = {
  POST: 'Bài viết',
  COMMENT: 'Bình luận',
  SHARE: 'Chia sẻ',
};

const formatPercent = (value: number) => {
  const pct = value > 1 ? value : value * 100;
  return `${pct.toFixed(1)}%`;
};

const ScoreRow = ({
  emotion,
  value,
}: {
  emotion: EmotionKey;
  value: number;
}) => {
  const meta = emotionMeta[emotion];
  const percent = Math.min(value > 1 ? value : value * 100, 100);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm text-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">{meta.emoji}</span>
          <span>{meta.label}</span>
        </div>
        <span className="font-semibold text-slate-900">{formatPercent(value)}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full"
          style={{
            width: `${percent}%`,
            backgroundColor: meta.color,
          }}
        />
      </div>
    </div>
  );
};

const ScoreBlock = ({ scores }: { scores: EmotionScoresDTO }) => (
  <div className="grid gap-3">
    {EMOTION_KEYS.map((emotion) => (
      <ScoreRow key={emotion} emotion={emotion} value={(scores as any)[emotion] ?? 0} />
    ))}
  </div>
);

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

  const statusBadge =
    summary?.status === AnalysisStatus.SUCCESS
      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
      : 'bg-rose-50 text-rose-700 border-rose-100';

  const createdAt = useMemo(
    () => (summary ? new Date(summary.createdAt) : null),
    [summary]
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 pb-12">
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
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <Badge variant="outline" className={`border ${statusBadge}`}>
                  {summary.status === AnalysisStatus.SUCCESS ? 'Thành công' : 'Thất bại'}
                </Badge>
                <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
                  {targetLabel[summary.targetType] ?? summary.targetType}
                </Badge>
                {createdAt && (
                  <span className="text-xs text-slate-500">
                    {format(createdAt, 'dd/MM/yyyy HH:mm')}
                  </span>
                )}
              </div>
              {summary.errorReason && (
                <p className="text-sm text-rose-600">Lý do: {summary.errorReason}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-700">Điểm số tổng hợp</p>
                <p className="text-xs text-slate-500">
                  Được tính từ nội dung văn bản và hình ảnh (nếu có).
                </p>
                <div className="mt-3">
                  <ScoreBlock scores={summary.finalScores} />
                </div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-700">Nội dung liên quan</p>
                <p className="mt-2 text-sm text-slate-700">{summary.targetId}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-slate-100 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-sky-700">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Phân tích văn bản
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {summary.textEmotion ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="border-amber-200 bg-amber-50 text-amber-700"
                      >
                        {getEmotionMeta(summary.textEmotion.dominantEmotion).label}
                      </Badge>
                      <span className="text-sm text-slate-600">Cảm xúc chính</span>
                    </div>
                    <ScoreBlock scores={summary.textEmotion.emotionScores} />
                  </>
                ) : (
                  <p className="text-sm text-slate-500">
                    Không có dữ liệu văn bản cho mục này.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-sky-700">
                  <ImageIcon className="h-4 w-4 text-sky-500" />
                  Phân tích hình ảnh
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {summary.imageEmotions.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Không có hình ảnh nào được phân tích cho nội dung này.
                  </p>
                ) : (
                  summary.imageEmotions.map((img, idx) => {
                    const meta = getEmotionMeta(img.dominantEmotion);
                    return (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            className="border-slate-200 bg-white text-slate-700"
                          >
                            Ảnh {idx + 1}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="border-emerald-200 bg-emerald-50 text-emerald-700"
                          >
                            {img.faceCount} khuôn mặt
                          </Badge>
                          <Badge
                            variant="outline"
                            className="border-slate-200 bg-white text-slate-700"
                          >
                            {meta.label}
                          </Badge>
                        </div>
                        {img.error ? (
                          <p className="mt-2 text-sm text-rose-600">
                            Lỗi: {img.error}
                          </p>
                        ) : (
                          <div className="mt-3">
                            <ScoreBlock scores={img.emotionScores} />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
