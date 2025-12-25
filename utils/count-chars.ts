export function countChars(text: string) {
  const t = (text ?? '').normalize('NFC');
  // fallback nếu môi trường không hỗ trợ Intl.Segmenter
  const hasSegmenter = typeof Intl !== 'undefined' && 'Segmenter' in Intl;
  if (!hasSegmenter) return t.length;

  const SegmenterCtor = (Intl as { Segmenter: typeof Intl.Segmenter }).Segmenter;
  const seg = new SegmenterCtor('vi', { granularity: 'grapheme' });
  let count = 0;
  for (const segment of seg.segment(t)) {
    if (segment) count++;
  }
  return count;
}
