/**
 * Utility for Safe Local File Uploads (Images & Videos)
 * Supports native file inputs with automatic image compression (via HTML5 Canvas)
 * and video thumbnail extraction so files can be previewed immediately and stored
 * safely in local state without crashing the browser or exhausting memory limits.
 */

export interface ProcessedMediaFile {
  type: 'image' | 'video';
  url: string;
  name: string;
  size: number;
  thumbnail?: string;
}

/**
 * Process a user-selected File from native <input type="file" />
 * Compresses images to fit in localStorage/local state smoothly.
 */
export function processLocalFile(
  file: File,
  maxDimension = 800,
  quality = 0.8
): Promise<ProcessedMediaFile> {
  return new Promise((resolve, reject) => {
    try {
      if (!file) {
        return reject(new Error('No file provided'));
      }

      // 1. Image Processing with Canvas Compression
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const rawData = event.target?.result as string;
          if (!rawData) {
            return reject(new Error('Failed to read image file data'));
          }

          const img = new Image();
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              let w = img.width;
              let h = img.height;
              if (w > maxDimension || h > maxDimension) {
                const ratio = Math.min(maxDimension / w, maxDimension / h);
                w = Math.round(w * ratio);
                h = Math.round(h * ratio);
              }
              canvas.width = Math.max(1, w);
              canvas.height = Math.max(1, h);
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0, w, h);
                const compressed = canvas.toDataURL('image/jpeg', quality);
                resolve({
                  type: 'image',
                  url: compressed,
                  thumbnail: compressed,
                  name: file.name,
                  size: Math.round(compressed.length * 0.75)
                });
              } else {
                resolve({
                  type: 'image',
                  url: rawData,
                  thumbnail: rawData,
                  name: file.name,
                  size: file.size
                });
              }
            } catch {
              resolve({
                type: 'image',
                url: rawData,
                thumbnail: rawData,
                name: file.name,
                size: file.size
              });
            }
          };

          img.onerror = () => {
            resolve({
              type: 'image',
              url: rawData,
              thumbnail: rawData,
              name: file.name,
              size: file.size
            });
          };

          img.src = rawData;
        };

        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
      }
      // 2. Video Processing with ObjectURL & Thumbnail Capture
      else if (file.type.startsWith('video/')) {
        const objectUrl = URL.createObjectURL(file);
        const tempVideo = document.createElement('video');
        tempVideo.src = objectUrl;
        tempVideo.muted = true;
        tempVideo.playsInline = true;
        tempVideo.currentTime = 0.5;

        let hasResolved = false;
        const fallbackResolve = () => {
          if (!hasResolved) {
            hasResolved = true;
            resolve({
              type: 'video',
              url: objectUrl,
              name: file.name,
              size: file.size
            });
          }
        };

        const timeout = setTimeout(fallbackResolve, 2500);

        tempVideo.onloadeddata = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = Math.min(480, tempVideo.videoWidth || 480);
            canvas.height = Math.min(270, tempVideo.videoHeight || 270);
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
              const thumb = canvas.toDataURL('image/jpeg', 0.75);
              clearTimeout(timeout);
              if (!hasResolved) {
                hasResolved = true;
                resolve({
                  type: 'video',
                  url: objectUrl,
                  thumbnail: thumb,
                  name: file.name,
                  size: file.size
                });
              }
            } else {
              fallbackResolve();
            }
          } catch {
            fallbackResolve();
          }
        };

        tempVideo.onerror = fallbackResolve;
      } else {
        reject(new Error('Unsupported file type. Please choose an image or video file.'));
      }
    } catch (err) {
      reject(err);
    }
  });
}
