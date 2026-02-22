// ============================================================
//  We_AIn  —  history.js
//  History 페이지 전용 스크롤 기반 애니메이션
//  - 타임라인 진행 라인 (scroll progress)
//  - 연도별 헤더 / 이벤트 카드 reveal
//  - 사이드 네비게이션 활성 상태 추적
//  - 부드러운 앵커 스크롤
// ============================================================

(function () {
  'use strict';

  // ── DOM References ──────────────────────────────────────
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

  // ── Intersection Observer: 요소가 뷰포트에 들어올 때 ──
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      } else if (entry.boundingClientRect.top > 0) {
        // 위로 스크롤해서 뷰포트 아래로 나간 경우 → 리셋
        entry.target.classList.remove('in-view');
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -60px 0px'
  });

  // Observe all animated elements
  yearHeaders.forEach(el => revealObserver.observe(el));
  events.forEach(el => revealObserver.observe(el));
  if (futureCard) revealObserver.observe(futureCard);

  // ── Timeline Progress Line ────────────────────────────
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

  // ── Year Nav: 활성 연도 업데이트 ───────────────────────
  function updateActiveYear() {
    if (!yearNav) return;

    // Show/hide nav based on scroll position
    const heroBottom = hero ? hero.getBoundingClientRect().bottom : 0;
    if (heroBottom > 100) {
      yearNav.classList.remove('visible');
    } else {
      yearNav.classList.add('visible');
    }

    // Find active year group
    let activeYear = null;
    const viewportCenter = window.innerHeight * 0.4;

    yearGroups.forEach(group => {
      const rect = group.getBoundingClientRect();
      if (rect.top <= viewportCenter && rect.bottom > viewportCenter) {
        activeYear = group.dataset.year;
      }
    });

    // Fallback: if past all groups, activate the last one
    if (!activeYear) {
      const lastGroup = yearGroups[yearGroups.length - 1];
      if (lastGroup && lastGroup.getBoundingClientRect().top < viewportCenter) {
        activeYear = lastGroup.dataset.year;
      }
    }

    // Update nav items
    navItems.forEach(item => {
      if (item.dataset.year === activeYear) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update nav progress bar
    if (navProgress && yearGroups.length > 0) {
      const yearArray = Array.from(navItems);
      const activeIndex = yearArray.findIndex(item => item.classList.contains('active'));
      if (activeIndex >= 0) {
        const progressPercent = ((activeIndex + 0.5) / yearArray.length) * 100;
        navProgress.style.height = progressPercent + '%';
      }
    }
  }

  // ── Smooth scroll for nav links ────────────────────────
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

  // ── Scroll handler (throttled via rAF) ─────────────────
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

  // ── Parallax effect for year circles ───────────────────
  function updateParallax() {
    yearHeaders.forEach(header => {
      const circle = header.querySelector('.hist-year-circle');
      if (!circle) return;

      const rect = header.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;
      const distance = (centerY - viewportCenter) / window.innerHeight;

      // Subtle floating effect
      const translateY = distance * -20;
      circle.style.transform = `translateY(${translateY}px)`;
    });
  }

  // Add parallax to scroll
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

  // ── Counter animation for year numbers ─────────────────
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
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startYear + (targetYear - startYear) * eased);
      el.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  // ── Card hover glow effect ─────────────────────────────
  document.querySelectorAll('.hist-event-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--glow-x', x + '%');
      card.style.setProperty('--glow-y', y + '%');
    });
  });

  // ── Initial call ───────────────────────────────────────
  updateTimelineProgress();
  updateActiveYear();

}());
