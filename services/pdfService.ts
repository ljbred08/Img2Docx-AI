import { jsPDF } from 'jspdf';
import { UploadedImage } from '../types';

export const createPdfFromImages = async (images: UploadedImage[]): Promise<Blob> => {
  if (images.length === 0) throw new Error("No images to convert");

  const doc = new jsPDF();
  
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    if (i > 0) doc.addPage();
    
    const imgProps = doc.getImageProperties(image.previewUrl);
    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = doc.internal.pageSize.getHeight();
    
    // Calculate aspect ratio to fit page
    const imgRatio = imgProps.width / imgProps.height;
    const pageRatio = pdfWidth / pdfHeight;
    
    let renderWidth = pdfWidth;
    let renderHeight = pdfHeight;
    
    if (imgRatio > pageRatio) {
      // Image is wider than page (relative to aspect)
      renderHeight = pdfWidth / imgRatio;
    } else {
      // Image is taller than page
      renderWidth = pdfHeight * imgRatio;
    }
    
    const x = (pdfWidth - renderWidth) / 2;
    const y = (pdfHeight - renderHeight) / 2;

    // We let jsPDF determine format from data if possible, or default to JPEG which is standard for photos
    const format = image.file.type === 'image/png' ? 'PNG' : 'JPEG';
    doc.addImage(image.previewUrl, format, x, y, renderWidth, renderHeight);
  }

  return doc.output('blob');
};