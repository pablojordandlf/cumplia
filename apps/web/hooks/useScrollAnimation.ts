'use client';

import { useEffect } from 'react';

export function useScrollAnimation() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const els = document.querySelectorAll('[data-fade],[data-fade-left],[data-fade-right]');
    els.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}
