// ============================================================
//  We_AIn  —  main.js
//  index.html 전용 스크롤 리빌 애니메이션
//  (다크모드 토글, Lucide 초기화, 헤더 그림자는 header.js에서 처리)
// ============================================================

// ── Scroll Reveal ─────────────────────────────────────────
// 아래로 스크롤: 애니메이션으로 등장
// 위로 스크롤:  즉시(애니메이션 없이) 숨김 → 다시 내리면 재등장
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      // 뷰포트 진입 → transition 복원 후 visible 추가
      e.target.style.transition = '';
      e.target.classList.add('visible');
    } else if (e.boundingClientRect.top > 0) {
      // 뷰포트 아래에 있음 = 위로 스크롤해서 벗어난 경우
      // transition 없이 즉시 초기 상태로 리셋
      e.target.style.transition = 'none';
      e.target.classList.remove('visible');
      requestAnimationFrame(() => { e.target.style.transition = ''; });
    }
    // top < 0 (뷰포트 위): 이미 지나쳤으므로 visible 유지
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal-left, .reveal-right, .reveal-fade, .reveal-up')
  .forEach(el => revealObserver.observe(el));
