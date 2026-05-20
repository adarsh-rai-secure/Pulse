import { useEffect, useState } from 'react';

export function useScrollSpy(ids: string[], offsetTop = 120): string | null {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);

  useEffect(() => {
    if (ids.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target as HTMLElement)
          .sort((a, b) => a.offsetTop - b.offsetTop);
        if (visible[0]?.id) setActive(visible[0].id);
      },
      {
        rootMargin: `-${offsetTop}px 0px -55% 0px`,
        threshold: [0, 0.25, 0.5, 1],
      }
    );

    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids.join('|'), offsetTop]);

  return active;
}
