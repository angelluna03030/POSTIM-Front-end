import { useState, useRef, useCallback } from "react";
import { MessageCircle } from "lucide-react";

interface DraggableTextWidgetProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  title: string;
  subtitle: string;
  onTitleChange: (v: string) => void;
  onSubtitleChange: (v: string) => void;
  visible: boolean;
}

const DraggableTextWidget = ({
  canvasRef,
  title,
  subtitle,
  onTitleChange,
  onSubtitleChange,
  visible,
}: DraggableTextWidgetProps) => {
  const [pos, setPos] = useState({ x: 40, y: 40 });
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("[data-editable]")) return;
    dragging.current = true;
    offset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [pos]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    setPos({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y });
  }, []);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  if (!visible) return null;

  return (
    <div
      className="absolute z-20 select-none cursor-grab active:cursor-grabbing"
      style={{ left: pos.x, top: pos.y }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div className="flex items-start gap-3 px-5 py-4 rounded-2xl border border-white/20 bg-white/15 backdrop-blur-xl shadow-lg max-w-[260px]">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <div
            data-editable
            contentEditable
            suppressContentEditableWarning
            className="text-sm font-semibold text-white outline-none cursor-text"
            onBlur={(e) => onTitleChange(e.currentTarget.textContent || "")}
          >
            {title}
          </div>
          <div
            data-editable
            contentEditable
            suppressContentEditableWarning
            className="text-xs text-white/70 outline-none cursor-text"
            onBlur={(e) => onSubtitleChange(e.currentTarget.textContent || "")}
          >
            {subtitle}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraggableTextWidget;
