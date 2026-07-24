import { useEffect, useRef, useState } from "react";

const DRAG_THRESHOLD_PX = 5;

/**
 * Adds mouse-drag-to-scroll to a horizontally scrollable element, for desktop
 * users without a touchpad/touchscreen. Touch input is left completely alone
 * so mobile/tablet keep native momentum scrolling. The browser's own
 * scrollLeft clamping (0..scrollWidth-clientWidth) is what bounds the drag —
 * no extra limit logic needed.
 *
 * Deliberately does NOT use setPointerCapture: capturing the pointer to the
 * scroll container retargets the resulting `click` event to that container
 * instead of whatever button/link was actually pressed, silently breaking
 * every button inside the carousel (Adicionar, quantity steppers, opening
 * the product modal). Move/up are tracked via window listeners instead, so
 * dragging still works even if the pointer leaves the container mid-drag.
 */
export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [isDragging, setIsDragging] = useState(false);
  const drag = useRef({ active: false, startX: 0, startScrollLeft: 0, moved: false });

  function onPointerDown(e: React.PointerEvent) {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;

    drag.current = { active: true, startX: e.clientX, startScrollLeft: el.scrollLeft, moved: false };
    setIsDragging(true);
  }

  useEffect(() => {
    if (!isDragging) return;

    function handleMove(e: PointerEvent) {
      const el = ref.current;
      if (!el || !drag.current.active) return;

      const delta = e.clientX - drag.current.startX;
      if (Math.abs(delta) > DRAG_THRESHOLD_PX) {
        drag.current.moved = true;
        // Only block native selection/drag-ghosting once it's a real drag —
        // a plain click must never have its default behavior touched.
        e.preventDefault();
      }
      el.scrollLeft = drag.current.startScrollLeft - delta;
    }

    function handleUp() {
      drag.current.active = false;
      setIsDragging(false);
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [isDragging]);

  function onClickCapture(e: React.MouseEvent) {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  }

  return {
    ref,
    isDragging,
    handlers: {
      onPointerDown,
      onClickCapture,
    },
  };
}
