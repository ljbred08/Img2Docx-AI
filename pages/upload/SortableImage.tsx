/**
 * pages/upload/SortableImage.tsx
 * 
 * An upload-page specific version of the sortable image card.
 * Handles the visual rendering of a page thumbnail and exposes the dnd-kit sortable hooks.
 */

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import { UploadedImage } from '../../types';

interface SortableImageProps {
  /** The specific image object for this grid cell */
  image: UploadedImage;
  /** Callback to trigger file removal */
  onRemove: (id: string) => void;
}

export const SortableImage: React.FC<SortableImageProps> = ({ image, onRemove }) => {
  // Hook to integrate with @dnd-kit/sortable
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: image.id });

  // Translation style for smooth dragging feedback
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      {...attributes} 
      {...listeners} 
      className={`relative group bg-white p-2 rounded-xl border shadow-sm transition-all cursor-grab active:cursor-grabbing touch-none ${isDragging ? 'border-blue-500 shadow-xl scale-105 opacity-90' : 'border-slate-200 hover:shadow-md'}`}
    >
      {/* Drag overlay handle */}
      <div className="absolute top-2 left-2 z-10 p-1.5 bg-black/50 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <GripVertical size={16} />
      </div>

      {/* Delete button (positioned to avoid accidental drag triggers) */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onRemove(image.id);
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute top-2 right-2 z-10 p-1.5 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 cursor-pointer"
      >
        <X size={16} />
      </button>

      {/* Visual content: Thumbnail */}
      <div className="aspect-[3/4] overflow-hidden rounded-lg bg-slate-100 pointer-events-none">
        <img src={image.thumbnailUrl} alt="preview" className="w-full h-full object-cover" />
      </div>

      {/* Subtext: Filename */}
      <div className="mt-2 text-xs text-slate-500 truncate px-1 pointer-events-none">{image.file.name}</div>
    </div>
  );
};