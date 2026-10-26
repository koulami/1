import React, { useState, useEffect } from 'react';
import {
  Save,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  HelpCircle,
  SplitSquareVertical,
  Camera,
  QrCode,
  Puzzle,
  Check,
  X,
  ListChecks,
  AlertCircle,
  Sparkles,
  Info,
  Award,
  Image as ImageIcon,
  Film,
  Video,
  Link,
  Sliders,
  Eye,
  FileCheck,
  Layers,
  FileText,
  Upload
} from 'lucide-react';
import { processLocalFile } from '../utils/fileUploadHelper';
import {
  Question,
  QuestionType,
  MultipleChoicePayload,
  TrueFalsePayload,
  TextMatchPayload,
  ImageMatchPayload,
  PhotoUploadPayload,
  TaskPayload,
  QrScanPayload,
  PuzzlePayload
} from '../types/game';

interface Props {
  task: Question;
  lang: 'el' | 'en';
  isCustomized: boolean;
  onSave: (updatedTask: Question) => void;
  onResetToDefault: () => void;
  onCancel: () => void;
}

// Educational preset media assets for Cyprus Griffon Vulture quests
const VULTURE_IMAGE_PRESETS = [
  {
    label: '🦅 Gyps fulvus σε πτήση (2.5m άνοιγμα)',
    url: 'https://images.unsplash.com/photo-1549608276-5786777e6587?auto=format&fit=crop&w=1200&q=80'
  },
  {
    label: '🪨 Γκρεμοί Επισκοπής (Φωλεοποίηση)',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'
  },
  {
    label: '🍽️ Ταΐστρα (Εστιατόριο Γυπών)',
    url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80'
  },
  {
    label: '🔬 Μορφολογία Κεφαλής & Ράμφους',
    url: 'https://images.unsplash.com/photo-1618331835717-801e976710b2?auto=format&fit=crop&w=1200&q=80'
  }
];

const VULTURE_VIDEO_PRESETS = [
  {
    label: '🎥 Εκπαιδευτικό Κλιπ Πεδίου (Field Clip MP4)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  },
  {
    label: '🎥 Καταγραφή Πτήσης & Θερμικών (Flight Observation MP4)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  }
];

export const TaskVisualEditForm: React.FC<Props> = ({
  task,
  lang,
  isCustomized,
  onSave,
  onResetToDefault,
  onCancel
}) => {
  const isEl = lang === 'el';

  // Base question fields
  const [title, setTitle] = useState<string>(task.title || '');
  const [description, setDescription] = useState<string>(task.description || '');
  const [type, setType] = useState<QuestionType>(task.type);
  const [points, setPoints] = useState<number>(task.points || 100);
  const [explanation, setExplanation] = useState<string>(task.explanation || '');

  // Universal Question Reference Media (Image or Video)
  const [imageUrl, setImageUrl] = useState<string>(task.imageUrl || '');
  const [videoUrl, setVideoUrl] = useState<string>(task.videoUrl || '');
  const [mediaTypeTab, setMediaTypeTab] = useState<'image' | 'video' | 'none'>(() => {
    if (task.videoUrl) return 'video';
    if (task.imageUrl) return 'image';
    return 'none';
  });

  // Group Assignment & Time Limit
  const [assignedTeamIds, setAssignedTeamIds] = useState<string[]>(task.assignedTeamIds || []);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(task.timeLimitMinutes || 0);

  // Type-specific Payload state
  // 1. Multiple Choice
  const [mcOptions, setMcOptions] = useState<string[]>(() => {
    const p = task.payload as MultipleChoicePayload;
    if (p && Array.isArray(p.options) && p.options.length > 0) {
      return [...p.options];
    }
    return [
      isEl ? 'Πρώτη επιλογή' : 'Option 1',
      isEl ? 'Δεύτερη επιλογή' : 'Option 2',
      isEl ? 'Τρίτη επιλογή' : 'Option 3',
      isEl ? 'Τέταρτη επιλογή' : 'Option 4'
    ];
  });
  const [mcCorrectIdx, setMcCorrectIdx] = useState<number>(() => {
    const p = task.payload as MultipleChoicePayload;
    return typeof p?.correctOptionIndex === 'number' ? p.correctOptionIndex : 0;
  });

  // 2. True / False
  const [tfCorrectValue, setTfCorrectValue] = useState<boolean>(() => {
    const p = task.payload as TrueFalsePayload;
    return typeof p?.correctValue === 'boolean' ? p.correctValue : true;
  });

  // 3. Text Match
  const [tmPairs, setTmPairs] = useState<{ id: string; left: string; right: string }[]>(() => {
    const p = task.payload as TextMatchPayload;
    if (p && Array.isArray(p.pairs) && p.pairs.length > 0) {
      return p.pairs.map((pair, idx) => ({
        id: pair.id || `pair-${idx + 1}`,
        left: pair.left || '',
        right: pair.right || ''
      }));
    }
    return [
      { id: 'p1', left: isEl ? 'Όρος 1' : 'Term 1', right: isEl ? 'Ορισμός 1' : 'Definition 1' },
      { id: 'p2', left: isEl ? 'Όρος 2' : 'Term 2', right: isEl ? 'Ορισμός 2' : 'Definition 2' }
    ];
  });

  // 4. Image Match
  const [imPairs, setImPairs] = useState<{ id: string; image: string; text: string }[]>(() => {
    const p = task.payload as ImageMatchPayload;
    if (p && Array.isArray(p.pairs) && p.pairs.length > 0) {
      return p.pairs.map((pair, idx) => ({
        id: pair.id || `imp-${idx + 1}`,
        image: pair.image || '',
        text: pair.text || ''
      }));
    }
    return [
      {
        id: 'im1',
        image: VULTURE_IMAGE_PRESETS[0].url,
        text: isEl ? 'Gyps fulvus σε πτήση' : 'Gyps fulvus in flight'
      },
      {
        id: 'im2',
        image: VULTURE_IMAGE_PRESETS[1].url,
        text: isEl ? 'Γκρεμοί Επισκοπής' : 'Episkopi Cliffs'
      }
    ];
  });

  // 5. Photo / Video Upload Mission configuration
  const [photoInstructions, setPhotoInstructions] = useState<string>(() => {
    const p = task.payload as PhotoUploadPayload;
    return p?.instructions || (isEl ? 'Καταγράψτε και ανεβάστε φωτογραφία ή βίντεο τεκμηρίου από το πεδίο παρατήρησης.' : 'Capture and upload photo or video field evidence.');
  });
  const [sampleReferenceUrl, setSampleReferenceUrl] = useState<string>(() => {
    const p = task.payload as PhotoUploadPayload;
    return p?.sampleReferenceUrl || '';
  });
  const [acceptedTypes, setAcceptedTypes] = useState<'photo' | 'video' | 'both'>(() => {
    const p = task.payload as PhotoUploadPayload;
    return p?.acceptedTypes || 'both';
  });
  const [maxFileSizeMb, setMaxFileSizeMb] = useState<number>(() => {
    const p = task.payload as PhotoUploadPayload;
    return p?.maxFileSizeMb || 25;
  });
  const [minWordCount, setMinWordCount] = useState<number>(() => {
    const p = task.payload as PhotoUploadPayload;
    return p?.minWordCount || 0;
  });
  const [promptGuidance, setPromptGuidance] = useState<string>(() => {
    const p = task.payload as PhotoUploadPayload;
    return p?.promptGuidance || '';
  });

  // 6. Puzzle configuration
  const [puzzleImageUrl, setPuzzleImageUrl] = useState<string>(() => {
    const p = task.payload as PuzzlePayload;
    return p?.imageUrl || task.imageUrl || VULTURE_IMAGE_PRESETS[0].url;
  });
  const [puzzleGridPieces, setPuzzleGridPieces] = useState<4 | 6 | 9>(() => {
    const p = task.payload as PuzzlePayload;
    return (p?.gridPieces === 4 || p?.gridPieces === 6 || p?.gridPieces === 9) ? p.gridPieces : 6;
  });

  // 7. Task & Checklist
  const [taskChecklist, setTaskChecklist] = useState<string[]>(() => {
    const p = task.payload as TaskPayload;
    if (p && Array.isArray(p.checklist) && p.checklist.length > 0) {
      return [...p.checklist];
    }
    return [
      isEl ? 'Εντοπισμός σημείου παρατήρησης' : 'Locate observation station',
      isEl ? 'Επαλήθευση στοιχείων' : 'Verify field metrics'
    ];
  });
  const [taskPrompt, setTaskPrompt] = useState<string>(() => {
    const p = task.payload as TaskPayload;
    return p?.completionPrompt || (isEl ? 'Σημειώσεις & Συμπεράσματα Ομάδας:' : 'Team Findings & Notes:');
  });

  // 8. QR Scan
  const [qrTargetCode, setQrTargetCode] = useState<string>(() => {
    const p = task.payload as QrScanPayload;
    return p?.targetCode || 'VULTURE-PARK-STATION-56';
  });
  const [qrLocationHint, setQrLocationHint] = useState<string>(() => {
    const p = task.payload as QrScanPayload;
    return p?.locationHint || (isEl ? 'Σταθμός QR Πεδίου' : 'Field QR Station');
  });

  // Re-initialize state when a different task is selected
  useEffect(() => {
    setTitle(task.title || '');
    setDescription(task.description || '');
    setType(task.type);
    setPoints(task.points || 100);
    setExplanation(task.explanation || '');
    setImageUrl(task.imageUrl || '');
    setVideoUrl(task.videoUrl || '');
    setAssignedTeamIds(task.assignedTeamIds || []);
    setTimeLimitMinutes(task.timeLimitMinutes || 0);
    if (task.videoUrl) {
      setMediaTypeTab('video');
    } else if (task.imageUrl) {
      setMediaTypeTab('image');
    } else {
      setMediaTypeTab('none');
    }

    const photoPayload = task.payload as PhotoUploadPayload;
    if (photoPayload) {
      setPhotoInstructions(photoPayload.instructions || '');
      setSampleReferenceUrl(photoPayload.sampleReferenceUrl || '');
      setAcceptedTypes(photoPayload.acceptedTypes || 'both');
      setMaxFileSizeMb(photoPayload.maxFileSizeMb || 25);
      setMinWordCount(photoPayload.minWordCount || 0);
      setPromptGuidance(photoPayload.promptGuidance || '');
    }

    const puzzlePayload = task.payload as PuzzlePayload;
    if (puzzlePayload) {
      setPuzzleImageUrl(puzzlePayload.imageUrl || task.imageUrl || VULTURE_IMAGE_PRESETS[0].url);
      if (puzzlePayload.gridPieces === 4 || puzzlePayload.gridPieces === 6 || puzzlePayload.gridPieces === 9) {
        setPuzzleGridPieces(puzzlePayload.gridPieces);
      }
    }
  }, [task.id]);

  // Handle Type Change
  const handleTypeChange = (newType: QuestionType) => {
    setType(newType);
    // If switching to puzzle and no puzzle image yet, adopt the task imageUrl if present
    if (newType === 'puzzle' && !puzzleImageUrl) {
      setPuzzleImageUrl(imageUrl || VULTURE_IMAGE_PRESETS[0].url);
    }
  };

  // Submit & Save Form
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    let builtPayload: any = {};

    switch (type) {
      case 'multiple_choice':
        builtPayload = {
          options: mcOptions.filter((o) => o.trim().length > 0),
          correctOptionIndex: Math.min(mcCorrectIdx, Math.max(0, mcOptions.length - 1))
        };
        break;

      case 'true_false':
        builtPayload = {
          correctValue: tfCorrectValue
        };
        break;

      case 'text_match':
        builtPayload = {
          pairs: tmPairs.map((p, idx) => ({
            id: p.id || `pair-${idx + 1}`,
            left: p.left.trim(),
            right: p.right.trim()
          }))
        };
        break;

      case 'image_match':
        builtPayload = {
          pairs: imPairs.map((p, idx) => ({
            id: p.id || `imp-${idx + 1}`,
            image: p.image.trim(),
            text: p.text.trim()
          }))
        };
        break;

      case 'photo_upload':
        builtPayload = {
          instructions: photoInstructions.trim(),
          sampleReferenceUrl: sampleReferenceUrl.trim() || undefined,
          acceptedTypes,
          maxFileSizeMb: Number(maxFileSizeMb) || 25,
          minWordCount: Number(minWordCount) || 0,
          promptGuidance: promptGuidance.trim() || undefined
        };
        break;

      case 'puzzle':
        builtPayload = {
          imageUrl: puzzleImageUrl.trim() || imageUrl.trim() || VULTURE_IMAGE_PRESETS[0].url,
          gridPieces: puzzleGridPieces
        };
        break;

      case 'task':
        builtPayload = {
          instructions: description.trim(),
          checklist: taskChecklist.filter((c) => c.trim().length > 0),
          completionPrompt: taskPrompt.trim()
        };
        break;

      case 'qr_scan':
        builtPayload = {
          targetCode: qrTargetCode.trim().toUpperCase(),
          locationHint: qrLocationHint.trim(),
          unlockedMedia: (task.payload as any)?.unlockedMedia
        };
        break;

      default:
        builtPayload = task.payload || {};
        break;
    }

    const finalImageUrl =
      type === 'puzzle'
        ? puzzleImageUrl.trim() || imageUrl.trim() || undefined
        : (mediaTypeTab === 'image' && imageUrl.trim()) ? imageUrl.trim() : (imageUrl.trim() || undefined);

    const finalVideoUrl =
      (mediaTypeTab === 'video' && videoUrl.trim()) ? videoUrl.trim() : (videoUrl.trim() || undefined);

    const updatedTask: Question = {
      ...task,
      title: title.trim(),
      description: description.trim(),
      type,
      points: Number(points) || 100,
      timeLimitMinutes: Number(timeLimitMinutes) > 0 ? Number(timeLimitMinutes) : undefined,
      assignedTeamIds: assignedTeamIds.length > 0 ? assignedTeamIds : undefined,
      imageUrl: finalImageUrl,
      videoUrl: finalVideoUrl,
      explanation: explanation.trim(),
      payload: builtPayload
    };

    onSave(updatedTask);
  };

  return (
    <form
      onSubmit={handleSave}
      className="mt-4 p-5 rounded-2xl bg-slate-950/95 border-2 border-amber-500/50 shadow-2xl space-y-6 animate-in fade-in duration-200"
    >
      {/* Header Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <span>{isEl ? 'Οπτική Επεξεργασία Αποστολής' : 'Visual Task Editor'}</span>
              <span className="font-mono text-amber-400 text-xs">({task.id})</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              {isEl
                ? 'Επεξεργασία τύπου, τίτλου, πολυμέσων αναφοράς, παραμέτρων μεταφόρτωσης & επιστημονικής σημείωσης'
                : 'Configure task type, title, reference media, upload settings & scientific explanation'}
            </p>
          </div>
        </div>

        {isCustomized && (
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold">
            {isEl ? 'ΠΡΟΣΑΡΜΟΣΜΕΝΟ' : 'CUSTOMIZED'}
          </span>
        )}
      </div>

      {/* Row 1: Type Selector & Points */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Question Type Dropdown */}
        <div className="sm:col-span-2 space-y-1">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>{isEl ? 'Τύπος Αποστολής (Question Type):' : 'Question Type:'}</span>
          </label>
          <select
            value={type}
            onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-400 cursor-pointer shadow-inner"
          >
            <option value="multiple_choice">{isEl ? '1. Πολλαπλής Επιλογής (Multiple Choice)' : '1. Multiple Choice'}</option>
            <option value="true_false">{isEl ? '2. Σωστό / Λάθος (True / False)' : '2. True / False'}</option>
            <option value="text_match">{isEl ? '3. Αντιστοίχιση Κειμένου (Text Matching)' : '3. Text Matching'}</option>
            <option value="image_match">{isEl ? '4. Αντιστοίχιση Εικόνας (Image Matching)' : '4. Image Matching'}</option>
            <option value="puzzle">{isEl ? '5. Παζλ Συναρμολόγησης (Puzzle)' : '5. Puzzle'}</option>
            <option value="photo_upload">{isEl ? '6. Αποστολή Μεταφόρτωσης Φωτογραφίας / Βίντεο (Photo/Video Upload Mission)' : '6. Photo/Video Upload Mission'}</option>
            <option value="task">{isEl ? '7. Αποστολή & Checkpoint Checklist (Task)' : '7. Task & Checklist'}</option>
            <option value="qr_scan">{isEl ? '8. Σάρωση QR Code Πεδίου (QR Code Scan)' : '8. QR Code Scan'}</option>
          </select>
        </div>

        {/* Points */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>{isEl ? 'Πόντοι Αποστολής:' : 'Points Value:'}</span>
          </label>
          <input
            type="number"
            min={10}
            max={500}
            step={10}
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Row 2: Title & Description */}
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300 block">
            {isEl ? 'Τίτλος Αποστολής:' : 'Task Title:'}
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={isEl ? 'Εισαγάγετε τον τίτλο της αποστολής...' : 'Enter task title...'}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300 block">
            {isEl ? 'Περιγραφή / Εκφώνηση Ερώτησης:' : 'Question Description / Prompt:'}
          </label>
          <textarea
            rows={2}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={isEl ? 'Διατυπώστε την ερώτηση ή την οδηγία...' : 'Enter question or instructions...'}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400 leading-relaxed"
          />
        </div>
      </div>

      {/* Row 2b: Group Assignment & Optional Task Time Limit */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="sm:col-span-2 space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isEl ? 'Ανάθεση σε Ομάδες (Group Assignment):' : 'Assigned Groups:'}</span>
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { id: 'team-alpha', label: isEl ? 'Ομάδα 1' : 'Group 1', color: '#10b981' },
              { id: 'team-beta', label: isEl ? 'Ομάδα 2' : 'Group 2', color: '#06b6d4' },
              { id: 'team-gamma', label: isEl ? 'Ομάδα 3' : 'Group 3', color: '#f59e0b' },
              { id: 'team-delta', label: isEl ? 'Ομάδα 4' : 'Group 4', color: '#8b5cf6' }
            ].map((grp) => {
              const isAssigned = assignedTeamIds.includes(grp.id);
              return (
                <button
                  key={grp.id}
                  type="button"
                  onClick={() => {
                    if (assignedTeamIds.includes(grp.id)) {
                      setAssignedTeamIds(assignedTeamIds.filter((t) => t !== grp.id));
                    } else {
                      setAssignedTeamIds([...assignedTeamIds, grp.id]);
                    }
                  }}
                  style={{
                    borderColor: isAssigned ? grp.color : '#334155',
                    backgroundColor: isAssigned ? `${grp.color}25` : 'transparent'
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isAssigned ? 'text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{isAssigned ? '✓' : '+'}</span>
                  <span>{grp.label}</span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setAssignedTeamIds([])}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                assignedTeamIds.length === 0
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 ring-1 ring-amber-400/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              {isEl ? 'Όλες οι Ομάδες (Κοινή)' : 'All Groups (Shared)'}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>{isEl ? 'Χρονικό Όριο Αποστολής (λεπτά):' : 'Task Time Limit (mins):'}</span>
          </label>
          <input
            type="number"
            min={0}
            max={60}
            value={timeLimitMinutes || ''}
            onChange={(e) => setTimeLimitMinutes(Number(e.target.value) || 0)}
            placeholder={isEl ? '0 = Χωρίς όριο' : '0 = No limit'}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SECTION: UNIVERSAL QUESTION REFERENCE MEDIA (IMAGE / VIDEO)           */}
      {/* Allows teachers to attach reference media to ANY question type        */}
      {/* ===================================================================== */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="space-y-0.5">
            <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-amber-400" />
              <span>{isEl ? 'Πολυμέσα Αναφοράς Ερώτησης (Προαιρετικό URL Εικόνας / Βίντεο):' : 'Question Reference Media (Optional Image / Video URL):'}</span>
            </label>
            <p className="text-[11px] text-slate-400">
              {isEl
                ? 'Επισυνάψτε προαιρετικά εικόνα ή βίντεο αναφοράς στην ερώτηση, ώστε να εμφανίζεται στους μαθητές κατά την επίλυσή της.'
                : 'Optionally attach reference media for students to examine while solving the mission.'}
            </p>
          </div>

          {/* Media Format Switcher */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setMediaTypeTab('image')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                mediaTypeTab === 'image'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{isEl ? 'Εικόνα' : 'Image'}</span>
            </button>

            <button
              type="button"
              onClick={() => setMediaTypeTab('video')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                mediaTypeTab === 'video'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>{isEl ? 'Βίντεο' : 'Video'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMediaTypeTab('none');
                setImageUrl('');
                setVideoUrl('');
              }}
              className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                mediaTypeTab === 'none'
                  ? 'bg-slate-800 text-slate-300'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span>{isEl ? 'Χωρίς' : 'None'}</span>
            </button>
          </div>
        </div>

        {/* Direct Local File Upload Trigger */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Upload className="w-4 h-4 text-amber-400" />
            <span className="font-semibold">
              {isEl ? 'Άμεση Μεταφόρτωση από Συσκευή (Φωτογραφία / Βίντεο):' : 'Direct Local Device Upload (Photo / Video):'}
            </span>
          </div>

          <label className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95">
            <Upload className="w-3.5 h-3.5" />
            <span>{isEl ? 'Επιλογή Αρχείου' : 'Choose File'}</span>
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const res = await processLocalFile(file, 800, 0.8);
                  if (res.type === 'video') {
                    setVideoUrl(res.url);
                    setMediaTypeTab('video');
                  } else {
                    setImageUrl(res.url);
                    setMediaTypeTab('image');
                  }
                } catch (err) {
                  console.error('File upload failed:', err);
                }
                e.target.value = '';
              }}
            />
          </label>
        </div>

        {/* Image URL Input & Presets */}
        {mediaTypeTab === 'image' && (
          <div className="space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder={isEl ? 'Εισαγάγετε URL εικόνας ή επιλέξτε αρχείο από τη συσκευή...' : 'Enter image URL or choose file from device...'}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />

              <label className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0">
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>{isEl ? 'Επιλογή' : 'Browse'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const res = await processLocalFile(file, 800, 0.8);
                      setImageUrl(res.url);
                    } catch (err) {
                      console.error(err);
                    }
                    e.target.value = '';
                  }}
                />
              </label>

              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                  title="Καθαρισμός"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Educational Presets for Teachers */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 block">
                {isEl ? '⚡ Γρήγορα Δείγματα Εικόνων Κυπριακού Όρνιου (Presets):' : '⚡ Quick Cyprus Vulture Image Presets:'}
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {VULTURE_IMAGE_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImageUrl(p.url)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-colors cursor-pointer ${
                      imageUrl === p.url
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Image Preview Thumbnail */}
            {imageUrl && (
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <img
                  src={imageUrl}
                  alt="Task preview"
                  className="w-20 h-16 object-cover rounded-lg border border-slate-700 shrink-0 bg-slate-900 shadow-md"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="text-xs space-y-0.5 overflow-hidden flex-1">
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isEl ? 'Προεπισκόπηση Εικόνας Ενεργή' : 'Image Preview Active'}</span>
                  </span>
                  <p className="text-[11px] text-slate-400 truncate max-w-md font-mono">
                    {imageUrl.startsWith('data:') ? (isEl ? 'Τοπικό Αρχείο (Base64 Thumbnail)' : 'Local File (Base64 Thumbnail)') : imageUrl}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Video URL Input & Presets */}
        {mediaTypeTab === 'video' && (
          <div className="space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder={isEl ? 'Εισαγάγετε URL βίντεο MP4 / WebM ή επιλέξτε αρχείο...' : 'Enter video MP4/WebM URL or choose file...'}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />

              <label className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0">
                <Upload className="w-3.5 h-3.5 text-purple-400" />
                <span>{isEl ? 'Επιλογή' : 'Browse'}</span>
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const res = await processLocalFile(file, 800, 0.8);
                      setVideoUrl(res.url);
                    } catch (err) {
                      console.error(err);
                    }
                    e.target.value = '';
                  }}
                />
              </label>

              {videoUrl && (
                <button
                  type="button"
                  onClick={() => setVideoUrl('')}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                  title="Καθαρισμός"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Video Presets */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 block">
                {isEl ? '⚡ Γρήγορα Δείγματα Βίντεο Πεδίου (Presets):' : '⚡ Quick Educational Video Presets:'}
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {VULTURE_VIDEO_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setVideoUrl(p.url)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-colors cursor-pointer ${
                      videoUrl === p.url
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Video Player Preview Thumbnail */}
            {videoUrl && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isEl ? 'Προεπισκόπηση Αναπαραγωγής Βίντεο:' : 'Video Playback Preview:'}</span>
                </span>
                <video
                  src={videoUrl}
                  controls
                  className="w-full max-h-48 rounded-lg bg-black object-contain border border-slate-700 shadow-md"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* TYPE-SPECIFIC DYNAMIC FORM BUILDER                                    */}
      {/* ===================================================================== */}

      {/* 1. MULTIPLE CHOICE OPTIONS BUILDER */}
      {type === 'multiple_choice' && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEl ? 'Επιλογές Απάντησης (Επιλέξτε το Radio της Σωστής):' : 'Options (Select Radio for Correct):'}</span>
            </label>
            {mcOptions.length < 6 && (
              <button
                type="button"
                onClick={() => setMcOptions((prev) => [...prev, `${isEl ? 'Νέα επιλογή' : 'New Option'} ${prev.length + 1}`])}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1 hover:bg-amber-500/30 transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>{isEl ? 'Προσθήκη Επιλογής' : 'Add Option'}</span>
              </button>
            )}
          </div>

          <div className="space-y-2">
            {mcOptions.map((opt, idx) => {
              const isCorrect = mcCorrectIdx === idx;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                    isCorrect
                      ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/30'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <label className="flex items-center cursor-pointer px-1">
                    <input
                      type="radio"
                      name="mc-correct-option"
                      checked={isCorrect}
                      onChange={() => setMcCorrectIdx(idx)}
                      className="w-4 h-4 accent-emerald-500 cursor-pointer"
                    />
                  </label>

                  <span className="text-xs font-mono font-bold text-slate-500 w-5">
                    {String.fromCharCode(65 + idx)}.
                  </span>

                  <input
                    type="text"
                    required
                    value={opt}
                    onChange={(e) => {
                      const updated = [...mcOptions];
                      updated[idx] = e.target.value;
                      setMcOptions(updated);
                    }}
                    placeholder={`${isEl ? 'Κείμενο επιλογής' : 'Option text'} ${idx + 1}`}
                    className="flex-1 bg-transparent text-xs text-white focus:outline-none"
                  />

                  {isCorrect && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold shrink-0">
                      {isEl ? 'Σωστή' : 'Correct'}
                    </span>
                  )}

                  {mcOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = mcOptions.filter((_, i) => i !== idx);
                        setMcOptions(updated);
                        if (mcCorrectIdx >= updated.length) {
                          setMcCorrectIdx(0);
                        }
                      }}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title={isEl ? 'Διαγραφή επιλογής' : 'Delete option'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. TRUE / FALSE BUILDER */}
      {type === 'true_false' && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <label className="text-xs font-bold text-amber-400 block mb-1">
            {isEl ? 'Σωστή Απάντηση (Correct Value):' : 'Correct Value:'}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTfCorrectValue(true)}
              className={`p-3.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                tfCorrectValue === true
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-400 font-black'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{isEl ? 'Σωστό (True)' : 'True'}</span>
            </button>

            <button
              type="button"
              onClick={() => setTfCorrectValue(false)}
              className={`p-3.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                tfCorrectValue === false
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300 ring-2 ring-rose-400 font-black'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <X className="w-4 h-4 text-rose-400" />
              <span>{isEl ? 'Λάθος (False)' : 'False'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. TEXT MATCHING BUILDER */}
      {type === 'text_match' && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
              <SplitSquareVertical className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isEl ? 'Ζεύγη Αντιστοίχισης Κειμένου (Αριστερό <-> Δεξί):' : 'Matching Pairs (Left <-> Right):'}</span>
            </label>
            <button
              type="button"
              onClick={() => setTmPairs((prev) => [...prev, { id: `p-${Date.now()}`, left: '', right: '' }])}
              className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold flex items-center gap-1 hover:bg-cyan-500/30 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>{isEl ? 'Προσθήκη Ζεύγους' : 'Add Pair'}</span>
            </button>
          </div>

          <div className="space-y-2">
            {tmPairs.map((pair, idx) => (
              <div key={pair.id || idx} className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 relative">
                <input
                  type="text"
                  value={pair.left}
                  onChange={(e) => {
                    const updated = [...tmPairs];
                    updated[idx].left = e.target.value;
                    setTmPairs(updated);
                  }}
                  placeholder={isEl ? `Αριστερό στοιχείο #${idx + 1}` : `Left item #${idx + 1}`}
                  className="bg-slate-900 border border-slate-700/60 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={pair.right}
                    onChange={(e) => {
                      const updated = [...tmPairs];
                      updated[idx].right = e.target.value;
                      setTmPairs(updated);
                    }}
                    placeholder={isEl ? `Δεξί ταίρι #${idx + 1}` : `Right match #${idx + 1}`}
                    className="flex-1 bg-slate-900 border border-slate-700/60 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                  {tmPairs.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setTmPairs(tmPairs.filter((_, i) => i !== idx))}
                      className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. IMAGE MATCHING BUILDER */}
      {type === 'image_match' && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
              <span>{isEl ? 'Ζεύγη Αντιστοίχισης Εικόνας & Περιγραφής:' : 'Image & Label Matching Pairs:'}</span>
            </label>
            <button
              type="button"
              onClick={() =>
                setImPairs((prev) => [
                  ...prev,
                  { id: `imp-${Date.now()}`, image: VULTURE_IMAGE_PRESETS[0].url, text: '' }
                ])
              }
              className="px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[11px] font-bold flex items-center gap-1 hover:bg-sky-500/30 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>{isEl ? 'Προσθήκη Εικόνας' : 'Add Image Pair'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {imPairs.map((pair, idx) => (
              <div key={pair.id || idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-3">
                  {pair.image ? (
                    <img
                      src={pair.image}
                      alt="Pair preview"
                      className="w-14 h-14 rounded-lg object-cover bg-slate-900 border border-slate-700 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 shrink-0">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="url"
                        value={pair.image}
                        onChange={(e) => {
                          const updated = [...imPairs];
                          updated[idx].image = e.target.value;
                          setImPairs(updated);
                        }}
                        placeholder={isEl ? 'URL Εικόνας ή επιλογή αρχείου...' : 'Image URL or choose file...'}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                      <label className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer shrink-0" title={isEl ? 'Επιλογή εικόνας από συσκευή' : 'Choose image from device'}>
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const res = await processLocalFile(file, 600, 0.8);
                              const updated = [...imPairs];
                              updated[idx].image = res.url;
                              setImPairs(updated);
                            } catch (err) {
                              console.error(err);
                            }
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>

                    <input
                      type="text"
                      value={pair.text}
                      onChange={(e) => {
                        const updated = [...imPairs];
                        updated[idx].text = e.target.value;
                        setImPairs(updated);
                      }}
                      placeholder={isEl ? 'Συνοδευτική Ετικέτα / Περιγραφή' : 'Matching Label / Description'}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  {imPairs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setImPairs(imPairs.filter((_, i) => i !== idx))}
                      className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer self-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. PUZZLE BUILDER */}
      {type === 'puzzle' && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
          <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
            <Puzzle className="w-3.5 h-3.5 text-amber-400" />
            <span>{isEl ? 'Παράμετροι Παζλ Συναρμολόγησης (Puzzle):' : 'Puzzle Assembly Configuration:'}</span>
          </label>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] text-slate-300 block mb-1">
                {isEl ? 'Εικόνα Παζλ (URL ή Επιλογή Αρχείου από Συσκευή):' : 'Puzzle Image (URL or Choose File from Device):'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  required
                  value={puzzleImageUrl}
                  onChange={(e) => setPuzzleImageUrl(e.target.value)}
                  placeholder={isEl ? 'Εισαγάγετε URL ή επιλέξτε τοπικό αρχείο εικόνας...' : 'Enter URL or choose local image file...'}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
                <label className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0">
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isEl ? 'Επιλογή' : 'Browse'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const res = await processLocalFile(file, 800, 0.82);
                        setPuzzleImageUrl(res.url);
                      } catch (err) {
                        console.error(err);
                      }
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Grid pieces count */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-300 block">
                {isEl ? 'Πλήθος Κομματιών (Grid Pieces):' : 'Number of Pieces:'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { count: 4, label: isEl ? '4 Κομμάτια (2x2 - Εύκολο)' : '4 Pieces (2x2 - Easy)' },
                  { count: 6, label: isEl ? '6 Κομμάτια (3x2 - Μεσαίο)' : '6 Pieces (3x2 - Medium)' },
                  { count: 9, label: isEl ? '9 Κομμάτια (3x3 - Δύσκολο)' : '9 Pieces (3x3 - Hard)' }
                ].map((item) => (
                  <button
                    key={item.count}
                    type="button"
                    onClick={() => setPuzzleGridPieces(item.count as 4 | 6 | 9)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                      puzzleGridPieces === item.count
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Puzzle Image Preview */}
            {puzzleImageUrl && (
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <img
                  src={puzzleImageUrl}
                  alt="Puzzle preview"
                  className="w-24 h-18 object-cover rounded-lg border border-slate-700"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-amber-400">{isEl ? 'Προεπισκόπηση Εικόνας Παζλ' : 'Puzzle Preview'}</span>
                  <p className="text-[11px] text-slate-400">
                    {isEl ? `Διάταξη: ${puzzleGridPieces} κομμάτια` : `Grid: ${puzzleGridPieces} pieces`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. PHOTO / VIDEO UPLOAD MISSION & FILE CONFIGURATION SECTION */}
      {type === 'photo_upload' && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/40 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Camera className="w-4 h-4 text-emerald-400" />
            <h5 className="text-xs font-black text-emerald-400 uppercase tracking-wider">
              {isEl ? 'Ρυθμίσεις Αποστολής Μεταφόρτωσης Τεκμηρίου (File/Media Config)' : 'Photo/Video Upload Mission & File Settings'}
            </h5>
          </div>

          {/* Upload Instructions */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 block">
              {isEl ? 'Οδηγίες Μεταφόρτωσης προς τους Μαθητές:' : 'Student Upload Instructions:'}
            </label>
            <textarea
              rows={2}
              value={photoInstructions}
              onChange={(e) => setPhotoInstructions(e.target.value)}
              placeholder={isEl ? 'Περιγράψτε τι φωτογραφία ή βίντεο απαιτείται να καταγράψουν οι μαθητές...' : 'Describe what photo or video evidence students need to capture...'}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
            />
          </div>

          {/* Student Upload Requirements Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Accepted Types */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 block">
                {isEl ? 'Επιτρεπόμενος Τύπος Αρχείου:' : 'Accepted Submission Type:'}
              </label>
              <select
                value={acceptedTypes}
                onChange={(e) => setAcceptedTypes(e.target.value as 'photo' | 'video' | 'both')}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 cursor-pointer"
              >
                <option value="both">{isEl ? '📸+🎥 Φωτογραφία ή Βίντεο' : 'Photo or Video'}</option>
                <option value="photo">{isEl ? '📸 Φωτογραφία Μόνο' : 'Photo Only'}</option>
                <option value="video">{isEl ? '🎥 Βίντεο Μόνο' : 'Video Only'}</option>
              </select>
            </div>

            {/* Max File Size */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 block">
                {isEl ? 'Μέγιστο Μέγεθος Αρχείου (MB):' : 'Max File Size Limit:'}
              </label>
              <select
                value={maxFileSizeMb}
                onChange={(e) => setMaxFileSizeMb(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 cursor-pointer"
              >
                <option value={10}>10 MB (Συνιστώμενο)</option>
                <option value={25}>25 MB</option>
                <option value={50}>50 MB</option>
                <option value={100}>100 MB</option>
              </select>
            </div>

            {/* Min Word Count */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 block">
                {isEl ? 'Ελάχιστες Λέξεις Σχολίου:' : 'Min Caption Word Count:'}
              </label>
              <select
                value={minWordCount}
                onChange={(e) => setMinWordCount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 cursor-pointer"
              >
                <option value={0}>{isEl ? '0 (Προαιρετικό Σχόλιο)' : '0 (Optional)'}</option>
                <option value={5}>{isEl ? '5 λέξεις τουλάχιστον' : '5 words min'}</option>
                <option value={15}>{isEl ? '15 λέξεις τουλάχιστον' : '15 words min'}</option>
                <option value={30}>{isEl ? '30 λέξεις τουλάχιστον' : '30 words min'}</option>
              </select>
            </div>
          </div>

          {/* Sample Reference Media URL (What students should emulate) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isEl ? 'URL Δείγματος / Υποδείγματος Τεκμηρίου (Sample Reference Media):' : 'Sample / Exemplar Reference Media URL:'}</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={sampleReferenceUrl}
                onChange={(e) => setSampleReferenceUrl(e.target.value)}
                placeholder={isEl ? 'Εισαγάγετε URL εικόνας υποδείγματος ή επιλέξτε αρχείο...' : 'Enter sample image URL or choose file...'}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
              />
              <label className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0">
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isEl ? 'Επιλογή' : 'Browse'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const res = await processLocalFile(file, 800, 0.8);
                      setSampleReferenceUrl(res.url);
                    } catch (err) {
                      console.error(err);
                    }
                    e.target.value = '';
                  }}
                />
              </label>
              {sampleReferenceUrl && (
                <button
                  type="button"
                  onClick={() => setSampleReferenceUrl('')}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Live Sample Preview */}
            {sampleReferenceUrl && (
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <img
                  src={sampleReferenceUrl}
                  alt="Sample reference"
                  className="w-16 h-14 object-cover rounded-lg border border-slate-700 shrink-0"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="text-xs">
                  <span className="font-bold text-emerald-400 block">{isEl ? 'Υπόδειγμα Ενεργό' : 'Sample Exemplar Active'}</span>
                  <p className="text-[11px] text-slate-400 truncate max-w-sm">{sampleReferenceUrl}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. TASK & CHECKLIST BUILDER */}
      {type === 'task' && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <ListChecks className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEl ? 'Βήματα Επαλήθευσης Checkpoint (Checklist):' : 'Verification Steps (Checklist):'}</span>
            </label>
            <button
              type="button"
              onClick={() => setTaskChecklist((prev) => [...prev, `${isEl ? 'Νέο βήμα επαλήθευσης' : 'New verification step'} ${prev.length + 1}`])}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1 hover:bg-amber-500/30 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>{isEl ? 'Προσθήκη Βήματος' : 'Add Step'}</span>
            </button>
          </div>

          <div className="space-y-2">
            {taskChecklist.map((step, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">#{idx + 1}</span>
                <input
                  type="text"
                  value={step}
                  onChange={(e) => {
                    const updated = [...taskChecklist];
                    updated[idx] = e.target.value;
                    setTaskChecklist(updated);
                  }}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
                {taskChecklist.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setTaskChecklist(taskChecklist.filter((_, i) => i !== idx))}
                    className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="pt-2">
            <label className="text-[11px] font-bold text-slate-400 block mb-1">
              {isEl ? 'Προτροπή Καταγραφής Παρατηρήσεων:' : 'Completion Prompt:'}
            </label>
            <input
              type="text"
              value={taskPrompt}
              onChange={(e) => setTaskPrompt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
            />
          </div>
        </div>
      )}

      {/* 8. QR CODE SCAN BUILDER */}
      {type === 'qr_scan' && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
          <label className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
            <QrCode className="w-3.5 h-3.5 text-purple-400" />
            <span>{isEl ? 'Παράμετροι Σταθμού QR:' : 'QR Station Parameters:'}</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                {isEl ? 'Κωδικός Στόχος (Target QR Code):' : 'Target Code:'}
              </label>
              <input
                type="text"
                value={qrTargetCode}
                onChange={(e) => setQrTargetCode(e.target.value.toUpperCase())}
                placeholder="π.χ. VULTURE-PARK-STATION-56"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono uppercase"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                {isEl ? 'Υπόδειξη Τοποθεσίας / Ονομασία Σταθμού:' : 'Location Hint / Station Name:'}
              </label>
              <input
                type="text"
                value={qrLocationHint}
                onChange={(e) => setQrLocationHint(e.target.value)}
                placeholder="π.χ. Σταθμός 56 - Ταΐστρα"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Scientific Explanation */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isEl ? 'Επιστημονική Τεκμηρίωση / Σημείωση (Εμφανίζεται μετά την επίλυση):' : 'Scientific Note / Feedback:'}</span>
        </label>
        <textarea
          rows={2}
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder={isEl ? 'Καταγράψτε την επιστημονική εξήγηση...' : 'Enter scientific explanation...'}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400 leading-relaxed"
        />
      </div>

      {/* Form Action Buttons */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {isCustomized && (
            <button
              type="button"
              onClick={onResetToDefault}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title={isEl ? 'Επαναφορά στις αρχικές ρυθμίσεις του Master Pool' : 'Reset to Master Pool default'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isEl ? 'Επαναφορά Αρχικού' : 'Reset to Default'}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            {isEl ? 'Ακύρωση' : 'Cancel'}
          </button>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{isEl ? 'Αποθήκευση Αλλαγών' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </form>
  );
};
