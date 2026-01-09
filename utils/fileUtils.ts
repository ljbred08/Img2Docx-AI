
import * as pdfjsLib from 'pdfjs-dist';
import { UploadedImage } from '../types';

export const generateId = () => {
  try {
    return crypto.randomUUID();
  } catch {
    return Math.random().toString(36).substring(2, 15);
  }
};

export const generateThumbnail = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_SIZE = 300;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      } else {
        resolve(url);
      }
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve(url); 
    };
    img.src = url;
  });
};

export const processPdfToImages = async (file: File): Promise<UploadedImage[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const result: UploadedImage[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) continue;

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Fix: Adding canvas property to satisfy RenderParameters type requirement
    await page.render({
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    } as any).promise;

    const blob = await new Promise<Blob>((resolve) => 
      canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.9)
    );
    
    const pageFile = new File([blob], `${file.name.replace('.pdf', '')}-p${i}.jpg`, { type: 'image/jpeg' });
    
    result.push({
      id: generateId(),
      file: pageFile,
      previewUrl: URL.createObjectURL(pageFile),
      thumbnailUrl: await generateThumbnail(pageFile)
    });
  }
  
  return result;
};
