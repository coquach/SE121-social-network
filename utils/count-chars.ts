/* eslint-disable @typescript-eslint/no-explicit-any */
export function countChars(text: string) {
  const t = (text ?? '').normalize('NFC');
  // fallback nếu môi trường không hỗ trợ Intl.Segmenter
  if (typeof Intl === 'undefined' || !(Intl as any).Segmenter) return t.length;

  const seg = new (Intl as any).Segmenter('vi', { granularity: 'grapheme' });
  let count = 0;
  for (const _ of seg.segment(t)) count++;
  return count;
}
