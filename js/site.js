// ============================================================
//  We_AIn  —  site.js
//  히스토리 타임라인 IntersectionObserver 애니메이션
// ============================================================

const historyItems = document.querySelectorAll('.history-step');

if (historyItems.length) {
  historyItems.forEach((item, i) => {
    item.style.transitionDelay = `${i * 80}ms`;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('in-view', entry.isIntersecting);
    });
  }, { threshold: 0.55, rootMargin: '-8% 0px -8% 0px' });

  historyItems.forEach((item) => observer.observe(item));
}
