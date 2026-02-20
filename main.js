// ============================================================
//  We_AIn  —  main.js
//  모든 인터랙션 로직을 여기서 관리합니다.
// ============================================================

// ── Lucide 아이콘 초기화 ──────────────────────────────────
lucide.createIcons();

// ── Dark Mode 토글 ────────────────────────────────────────
// 초기 상태는 <head> 인라인 스크립트에서 설정됨 (깜빡임 방지)
const themeToggleBtn = document.getElementById('themeToggle');

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }
  });
}

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

// ── Header shadow on scroll ───────────────────────────────
const siteHeader = document.querySelector('.site-header');
if (siteHeader) {
  window.addEventListener('scroll', () => {
    siteHeader.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });
}
