import { feelingsUI } from "@/lib/types/feeling";
import { Emotion } from "@/models/social/enums/social.enum";

export const DASHBOARD_EMOTION_COLOR: Record<Emotion, string> = {
  [Emotion.JOY]: 'bg-sky-500',
  [Emotion.SURPRISE]: 'bg-sky-400',
  [Emotion.NEUTRAL]: 'bg-sky-300',
  [Emotion.SADNESS]: 'bg-sky-200',
  [Emotion.FEAR]: 'bg-sky-200',
  [Emotion.DISGUST]: 'bg-sky-100',
  [Emotion.ANGER]: 'bg-sky-100',
};

export const emotionStatsMock: Record<Emotion, number> = {
  [Emotion.JOY]: 38,
  [Emotion.SURPRISE]: 12,
  [Emotion.NEUTRAL]: 26,
  [Emotion.SADNESS]: 14,
  [Emotion.FEAR]: 6,
  [Emotion.DISGUST]: 2,
  [Emotion.ANGER]: 2,
};

export function DashboardEmotionOverview() {
  return (
    <div className="rounded-xl border border-sky-100 bg-white p-4">
      <h2 className="font-medium text-slate-700 mb-4">Tổng quan cảm xúc</h2>

      <div className="space-y-3">
        {feelingsUI.map((feeling) => {
          const value = emotionStatsMock[feeling.type] ?? 0;
          const barColor = DASHBOARD_EMOTION_COLOR[feeling.type];

          return (
            <div key={feeling.type}>
              <div className="flex items-center justify-between text-sm mb-1">
                <div className="flex items-center gap-2 text-slate-600">
                  <span>{feeling.emoji}</span>
                  <span>{feeling.name}</span>
                </div>
                <span className="text-slate-500">{value}%</span>
              </div>

              <div className="h-2 rounded-full bg-sky-50 overflow-hidden">
                <div
                  className={`h-full ${barColor}`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
