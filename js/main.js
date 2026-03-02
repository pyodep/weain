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

// ============================================================
//  History 스크롤 애니메이션 (history.js 통합)
// ============================================================
(function () {
  'use strict';

  const yearNav      = document.getElementById('yearNav');
  const lineFill     = document.getElementById('lineFill');
  const navProgress  = document.getElementById('yearNavProgress');
  const navItems     = document.querySelectorAll('.year-nav-item');
  const yearGroups   = document.querySelectorAll('.hist-year-group');
  const yearHeaders  = document.querySelectorAll('.hist-year-header');
  const events       = document.querySelectorAll('.hist-event');
  const futureCard   = document.querySelector('.hist-future-card');
  const hero         = document.querySelector('.hist-hero');
  const timelineSection = document.querySelector('.hist-timeline-section');

  if (!timelineSection) return;

  const histRevealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      } else if (entry.boundingClientRect.top > 0) {
        entry.target.classList.remove('in-view');
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -60px 0px'
  });

  yearHeaders.forEach(el => histRevealObserver.observe(el));
  events.forEach(el => histRevealObserver.observe(el));
  if (futureCard) histRevealObserver.observe(futureCard);

  function updateTimelineProgress() {
    if (!timelineSection || !lineFill) return;
    const rect = timelineSection.getBoundingClientRect();
    const sectionTop = rect.top + window.scrollY;
    const sectionHeight = rect.height;
    const scrollPos = window.scrollY + window.innerHeight * 0.5;
    let progress = (scrollPos - sectionTop) / sectionHeight;
    progress = Math.max(0, Math.min(1, progress));
    lineFill.style.height = (progress * 100) + '%';
  }

  function updateActiveYear() {
    if (!yearNav) return;
    const heroBottom = hero ? hero.getBoundingClientRect().bottom : 0;
    if (heroBottom > 100) {
      yearNav.classList.remove('visible');
    } else {
      yearNav.classList.add('visible');
    }
    let activeYear = null;
    const viewportCenter = window.innerHeight * 0.4;
    yearGroups.forEach(group => {
      const rect = group.getBoundingClientRect();
      if (rect.top <= viewportCenter && rect.bottom > viewportCenter) {
        activeYear = group.dataset.year;
      }
    });
    if (!activeYear) {
      const lastGroup = yearGroups[yearGroups.length - 1];
      if (lastGroup && lastGroup.getBoundingClientRect().top < viewportCenter) {
        activeYear = lastGroup.dataset.year;
      }
    }
    navItems.forEach(item => {
      if (item.dataset.year === activeYear) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
    if (navProgress && yearGroups.length > 0) {
      const yearArray = Array.from(navItems);
      const activeIndex = yearArray.findIndex(item => item.classList.contains('active'));
      if (activeIndex >= 0) {
        const progressPercent = ((activeIndex + 0.5) / yearArray.length) * 100;
        navProgress.style.height = progressPercent + '%';
      }
    }
  }

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = item.getAttribute('href');
      const target = document.querySelector(targetId);
      if (target) {
        const offset = target.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }
    });
  });

  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateTimelineProgress();
        updateActiveYear();
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  function updateParallax() {
    yearHeaders.forEach(header => {
      const circle = header.querySelector('.hist-year-circle');
      if (!circle) return;
      const rect = header.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;
      const distance = (centerY - viewportCenter) / window.innerHeight;
      circle.style.transform = `translateY(${distance * -20}px)`;
    });
  }

  const parallaxObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const update = () => {
          if (entry.target.getBoundingClientRect().top < window.innerHeight &&
              entry.target.getBoundingClientRect().bottom > 0) {
            updateParallax();
            requestAnimationFrame(update);
          }
        };
        requestAnimationFrame(update);
      }
    });
  }, { threshold: 0 });
  yearHeaders.forEach(header => parallaxObserver.observe(header));

  const yearNums = document.querySelectorAll('.hist-year-num');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = 'true';
        animateCounter(entry.target);
      }
    });
  }, { threshold: 0.5 });
  yearNums.forEach(el => counterObserver.observe(el));

  function animateCounter(el) {
    const targetYear = parseInt(el.textContent, 10);
    const startYear = targetYear - 5;
    const duration = 600;
    const startTime = performance.now();
    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startYear + (targetYear - startYear) * eased);
      el.textContent = current;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  document.querySelectorAll('.hist-event-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--glow-x', x + '%');
      card.style.setProperty('--glow-y', y + '%');
    });
  });

  updateTimelineProgress();
  updateActiveYear();

}());
