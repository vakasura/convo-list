"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Props = {
  id: string;
  title: string;
  onDelete: (id: string) => void;
};

export default function SortableItem({ id, title, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    touchAction: "none",
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between rounded-2xl border border-black/10 dark:border-white/10 glass shadow-soft px-4 py-3"
    >
      <button
        className="mr-3 w-6 h-6 flex items-center justify-center cursor-grab active:cursor-grabbing select-none text-xl opacity-70 hover:opacity-100"
        aria-label="Drag handle"
        {...attributes}
        {...listeners}
      >
        ☰
      </button>
      <span className="text-base flex-1 truncate">{title}</span>
      <button
        onClick={() => onDelete(id)}
        className="text-sm text-red-600 dark:text-red-400 ml-3 hover:underline"
        aria-label="Delete"
      >
        Delete
      </button>
    </li>
  );
}


