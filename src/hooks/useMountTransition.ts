import { useEffect, useState } from "react";

export function useMountTransition(shown: boolean, durationMs: number) {
  const [shouldRender, setShouldRender] = useState(shown);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame: number;
    let timeout: ReturnType<typeof setTimeout>;

    if (shown) {
      setShouldRender(true);
      frame = requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      timeout = setTimeout(() => setShouldRender(false), durationMs);
    }

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
    };
  }, [shown, durationMs]);

  return { shouldRender, visible };
}
