// ============================================================
//  We_AIn  —  header.js
//  공유 헤더 컴포넌트
//  - 헤더 HTML을 #header-placeholder에 동기 주입
//  - 현재 페이지에 맞는 active 링크 자동 설정
//  - 다크모드 토글 + 헤더 스크롤 그림자 처리
//  - Lucide 아이콘 초기화 (DOMContentLoaded 시점)
// ============================================================

(function () {
  // ── 현재 페이지 파일명 감지 ──────────────────────────────
  const page = location.pathname.split('/').pop() || 'index.html';

  const NAV = [
    { href: 'index.html',    label: 'main',    match: ['index.html', ''] },
    { href: 'company.html',  label: 'about',   match: ['company.html'] },
    { href: 'org.html',      label: 'team',    match: ['org.html'] },
    { href: 'products.html', label: 'product', match: ['products.html'] },
  ];

  const navHTML = NAV.map(({ href, label, match }) =>
    `<a ${match.includes(page) ? 'class="active" ' : ''}href="${href}">${label}</a>`
  ).join('\n      ');

  // ── 헤더 동기 주입 ────────────────────────────────────────
  const placeholder = document.getElementById('header-placeholder');
  if (placeholder) {
    placeholder.outerHTML = `
<header class="site-header">
  <div class="header-inner">
    <div class="logo-box">
      <img src="./img/logo.png" alt="We_AIn" class="logo-img">
    </div>
    <nav class="top-nav">
      ${navHTML}
      <button class="theme-toggle" id="themeToggle" aria-label="Toggle dark mode">
        <i data-lucide="moon" class="icon-moon"></i>
        <i data-lucide="sun" class="icon-sun"></i>
      </button>
    </nav>
  </div>
</header>`;
  }

  // ── DOM 완전 로드 후 인터랙션 설정 ──────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    // Lucide 아이콘 초기화
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // 다크모드 토글
    const btn = document.getElementById('themeToggle');
    btn?.addEventListener('click', () => {
      const html = document.documentElement;
      const isDark = html.getAttribute('data-theme') === 'dark';
      if (isDark) {
        html.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
      } else {
        html.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
      }
    });

    // 헤더 스크롤 그림자
    const header = document.querySelector('.site-header');
    if (header) {
      window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', scrollY > 10);
      }, { passive: true });
    }
  });
}());
