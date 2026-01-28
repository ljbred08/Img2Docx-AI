/**
 * components/SortableImage.tsx
 * 
 * A UI component representing an image item within a sortable grid.
 * Leverages @dnd-kit to provide drag-and-drop capabilities.
 */

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import { UploadedImage } from '../types';

interface SortableImageProps {
  /** The image metadata and file information */
  image: UploadedImage;
  /** Callback to trigger removal of this image from the project */
  onRemove: (id: string) => void;
}

export const SortableImage: React.FC<SortableImageProps> = ({ image, onRemove }) => {
  // Initialize sortable hooks from dnd-kit
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: image.id });

  // Compute transformation styles for the dragging animation
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
      className={`relative group bg-background p-2 rounded-xl border shadow-sm transition-all cursor-grab active:cursor-grabbing touch-none ${isDragging ? 'border-primary shadow-xl scale-105 opacity-90' : 'border-border hover:shadow-md'}`}
    >
      {/* Visual drag handle */}
      <div className="absolute top-2 left-2 z-10 p-1.5 bg-primary/10 text-foreground rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <GripVertical size={16} />
      </div>

      {/* Remove button */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onRemove(image.id);
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute top-2 right-2 z-10 p-1.5 bg-destructive text-destructive-foreground rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90 cursor-pointer"
      >
        <X size={16} />
      </button>

      {/* Image thumbnail display */}
      <div className="aspect-[3/4] overflow-hidden rounded-lg bg-muted pointer-events-none">
        <img src={image.thumbnailUrl} alt="preview" className="w-full h-full object-cover" />
      </div>

      {/* File name footer */}
      <div className="mt-2 text-xs text-muted-foreground truncate px-1 pointer-events-none">{image.file.name}</div>
    </div>
  );
};