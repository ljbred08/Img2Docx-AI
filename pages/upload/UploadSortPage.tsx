/**
 * pages/upload/UploadSortPage.tsx
 * 
 * The primary view for the first stage of the workflow.
 * Responsibilities include:
 * - Handling file uploads (Images and PDFs).
 * - Processing multi-page PDFs into individual image pages.
 * - Providing a drag-and-drop interface to reorder pages before OCR.
 * - Managing the core collection of UploadedImage objects.
 */

import React, { useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';
import { Upload, Loader2, Trash2, ArrowRight } from 'lucide-react';
import { UploadedImage } from '../../types';
import { SortableImage } from './SortableImage';
import { Button } from '../../components/Button';
import { processPdfToImages, generateId, generateThumbnail } from '../../utils/fileUtils';

interface UploadSortPageProps {
  images: UploadedImage[];
  setImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>;
  isFilesLoading: boolean;
  setIsFilesLoading: (loading: boolean) => void;
  onContinue: () => void;
  onReset: () => void;
  setError: (err: string | null) => void;
}

export const UploadSortPage: React.FC<UploadSortPageProps> = ({
  images,
  setImages,
  isFilesLoading,
  setIsFilesLoading,
  onContinue,
  onReset,
  setError
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Configure sensors for dnd-kit (mouse/touch and keyboard support)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  /**
   * Processes files selected via the hidden input element.
   * Handles both standard images and multi-page PDF files.
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setIsFilesLoading(true);
      const files = Array.from(e.target.files) as File[];

      try {
        const processedFiles = await Promise.all(files.map(async (file) => {
          if (file.type === 'application/pdf') {
            // PDF: Extract individual pages as separate images
            return await processPdfToImages(file);
          } else {
            // Image: Generate ID and thumbnails for display
            return [{
              id: generateId(),
              file,
              previewUrl: URL.createObjectURL(file),
              thumbnailUrl: await generateThumbnail(file)
            }];
          }
        }));

        // Merge new images into the existing state
        const flatNewImages = processedFiles.flat();
        setImages(prev => [...prev, ...flatNewImages]);
      } catch (err: any) {
        console.error("File processing error:", err);
        setError("Failed to process files. Ensure your PDF is valid.");
      } finally {
        setIsFilesLoading(false);
      }
    }
  };

  /**
   * Finalizes the reordering after a successful drag operation.
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  /**
   * Removes a specific image from the collection.
   */
  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const sortableIds = images.map(img => img.id);

  /**
   * commonActionStyles: A centralized style string for primary workflow buttons.
   * - whitespace-nowrap: Prevents text from breaking into multiple lines.
   * - h-10: Consistent height of 40px for a perfectly balanced touch target.
   * - px-8: Generous horizontal padding for better visual balance.
   * - active:scale-95: Micro-interaction that shrinks the button when clicked.
   * - transition-all: Smoothly animates between default, hover, and active states.
   * - font-bold: Increases weight to emphasize the call to action.
   * - shadow-md / hover:shadow-lg: Dynamic shadows to create a layered, "3D" depth.
   */
  const commonActionStyles = "whitespace-nowrap h-10 px-8 active:scale-95 transition-all font-bold shadow-md hover:shadow-lg";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Upload Trigger Area */}
      <div
        className={`border-2 border-dashed rounded-2xl p-12 text-center hover:bg-slate-50 transition-colors cursor-pointer ${isFilesLoading ? 'border-blue-400 bg-blue-50/20 pointer-events-none' : 'border-slate-300'}`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input type="file" multiple accept="image/*,.pdf" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
        <div className="flex flex-col items-center gap-4">
          <div className={`p-4 rounded-full ${isFilesLoading ? 'bg-blue-100 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
            {isFilesLoading ? <Loader2 size={32} className="animate-spin" /> : <Upload size={32} />}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900">{isFilesLoading ? 'Processing Files...' : 'Upload Images or PDF'}</h3>
            <p className="text-slate-500 mt-1">{isFilesLoading ? 'Extracting pages from PDF...' : 'Select files to get started'}</p>
          </div>
        </div>
      </div>

      {/* Grid of uploaded images, visible if items exist */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <h3 className="text-xl font-bold text-slate-900 leading-none">Organize Document ({images.length} pages)</h3>
              <Button
                variant="danger"
                onClick={onReset}
                className={`${commonActionStyles} w-full sm:w-auto`}
              >
                <Trash2 size={20} className="mr-2" /> Reset
              </Button>
            </div>

            <Button
              onClick={onContinue}
              className={`${commonActionStyles} hover:bg-blue-700 w-full md:w-auto`}
            >
              Continue <ArrowRight size={20} className="ml-2" />
            </Button>
          </div>

          {/* Dnd-Kit context for the sortable grid */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {images.map(img => (
                  <SortableImage key={img.id} image={img} onRemove={removeImage} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
};