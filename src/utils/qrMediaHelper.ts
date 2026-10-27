import { Question, QrScanPayload, FieldSpotInfo } from '../types/game';
import { CHECKPOINT_TASK_IDS } from '../data/masterTaskPool';

/**
 * Returns normalized field spot and media information for any task.
 * Supports explicit fieldSpot property, qr_scan payload, or falls back to
 * universal task videoUrl / imageUrl and checkpoint metadata.
 */
export function getQuestionFieldSpot(question: Question): FieldSpotInfo | null {
  if (!question) return null;

  // 1. Explicit fieldSpot defined on question
  if (question.fieldSpot && (question.fieldSpot.spotCode || question.fieldSpot.mediaUrl)) {
    return {
      spotCode: question.fieldSpot.spotCode || generateDefaultSpotCode(question),
      spotName: question.fieldSpot.spotName || question.title,
      spotName_en: question.fieldSpot.spotName_en || question.title_en,
      mediaType: question.fieldSpot.mediaType || (question.fieldSpot.mediaUrl?.includes('youtu') || question.fieldSpot.mediaUrl?.endsWith('.mp4') ? 'video' : 'image'),
      mediaUrl: question.fieldSpot.mediaUrl,
      mediaTitle: question.fieldSpot.mediaTitle || question.title,
      mediaTitle_en: question.fieldSpot.mediaTitle_en || question.title_en,
      caption: question.fieldSpot.caption || question.description,
      caption_en: question.fieldSpot.caption_en || question.description_en
    };
  }

  // 2. QrScan Task Payload
  if (question.type === 'qr_scan') {
    const p = question.payload as QrScanPayload;
    const media = p?.unlockedMedia;
    const mediaUrl = media?.url || p?.unlockedVideoUrl || p?.unlockedImageUrl || question.videoUrl || question.imageUrl || '';
    const isVideo = media?.type === 'video' || !!p?.unlockedVideoUrl || !!question.videoUrl || (mediaUrl.includes('youtu') || mediaUrl.endsWith('.mp4'));

    return {
      spotCode: p?.targetCode || `VULTURE-${question.id.toUpperCase()}`,
      spotName: p?.locationHint || question.title,
      spotName_en: question.title_en || question.title,
      mediaType: isVideo ? 'video' : 'image',
      mediaUrl,
      mediaTitle: media?.title || question.title,
      mediaTitle_en: question.title_en || question.title,
      caption: media?.caption || question.description,
      caption_en: question.description_en || question.description
    };
  }

  // 3. Known Checkpoints or Tasks with Video / Image Media
  const cpMeta = CHECKPOINT_TASK_IDS[question.id];
  const hasMedia = Boolean(question.videoUrl || question.imageUrl);

  if (cpMeta || hasMedia) {
    const isVideo = Boolean(question.videoUrl);
    const mediaUrl = (isVideo ? question.videoUrl : question.imageUrl) || '';

    return {
      spotCode: generateDefaultSpotCode(question),
      spotName: cpMeta ? `${cpMeta.label}` : question.title,
      spotName_en: cpMeta ? `${cpMeta.label_en}` : question.title_en || question.title,
      mediaType: isVideo ? 'video' : 'image',
      mediaUrl,
      mediaTitle: question.title,
      mediaTitle_en: question.title_en || question.title,
      caption: cpMeta ? cpMeta.desc : question.description,
      caption_en: cpMeta ? cpMeta.desc_en : question.description_en || question.description
    };
  }

  return null;
}

/**
 * Generates a clean, consistent QR target code for a given question.
 */
export function generateDefaultSpotCode(question: Question): string {
  if (!question) return 'SPOT-VULTURE-QUEST';
  if (question.id === 'cyprus-vulture-qr-56') return 'VULTURE-PARK-STATION-56';
  if (question.id === 'cyprus-vulture-36') return 'SPOT-VULTURE-REPLICA-36';
  if (question.id === 'cyprus-vulture-23') return 'SPOT-THERMAL-CURRENTS-23';
  if (question.id === 'cyprus-vulture-30') return 'SPOT-EPISKOPI-CLIFFS-30';
  if (question.id === 'cyprus-vulture-38') return 'SPOT-GASTRIC-PH-38';
  if (question.id === 'cyprus-vulture-50') return 'SPOT-K9-DOG-UNIT-50';

  const sanitized = question.id.toUpperCase().replace(/[^A-Z0-9-]/g, '-');
  return `SPOT-${sanitized}`;
}

/**
 * Searches the task list for a question matching the scanned QR code.
 * Handles exact codes, lowercase/uppercase, URL query parameters (e.g. ?spot=...),
 * and target codes.
 */
export function findQuestionByQrScan(
  scannedText: string,
  questions: Question[]
): { question: Question; fieldSpot: FieldSpotInfo } | null {
  if (!scannedText || !Array.isArray(questions) || questions.length === 0) return null;

  const raw = scannedText.trim();
  let extractedCode = raw.toUpperCase();

  // If scan is a URL, extract potential spot, code, or quest parameter
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    try {
      const url = new URL(raw);
      const spotParam = url.searchParams.get('spot') || url.searchParams.get('code') || url.searchParams.get('quest') || url.searchParams.get('id');
      if (spotParam) {
        extractedCode = spotParam.trim().toUpperCase();
      }
    } catch {
      // Not a standard URL, continue with raw
    }
  }

  // Pass 1: Check explicit fieldSpot.spotCode or QrScanPayload.targetCode
  for (const q of questions) {
    const fs = getQuestionFieldSpot(q);
    if (!fs) continue;

    const spotCode = fs.spotCode?.trim().toUpperCase();
    if (spotCode && (spotCode === extractedCode || extractedCode.includes(spotCode))) {
      return { question: q, fieldSpot: fs };
    }

    if (q.type === 'qr_scan') {
      const p = q.payload as QrScanPayload;
      const target = p?.targetCode?.trim().toUpperCase();
      if (target && (target === extractedCode || extractedCode.includes(target))) {
        return { question: q, fieldSpot: fs };
      }
    }
  }

  // Pass 2: Match by question ID or default generated code
  for (const q of questions) {
    const defaultCode = generateDefaultSpotCode(q).toUpperCase();
    const idUpper = q.id.trim().toUpperCase();

    if (
      extractedCode === defaultCode ||
      extractedCode === idUpper ||
      extractedCode.includes(idUpper) ||
      defaultCode.includes(extractedCode)
    ) {
      const fs = getQuestionFieldSpot(q) || {
        spotCode: defaultCode,
        spotName: q.title,
        spotName_en: q.title_en,
        mediaType: q.videoUrl ? 'video' : 'image',
        mediaUrl: q.videoUrl || q.imageUrl || '',
        mediaTitle: q.title,
        caption: q.description
      };
      return { question: q, fieldSpot: fs };
    }
  }

  return null;
}
