// ============================================================
//  We_AIn  —  main.js
//  index.html 전용 스크롤 리빌 애니메이션
//  (다크모드 토글, Lucide 초기화, 헤더 그림자는 header.js에서 처리)
// ============================================================

// ── We-Hero 재진입 애니메이션 ─────────────────────────────
(function () {
  const hero = document.querySelector('.we-hero');
  if (!hero) return;

  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // 클래스를 제거 후 다음 프레임에 다시 추가해 애니메이션 재실행
        hero.classList.remove('we-hero--animate');
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            hero.classList.add('we-hero--animate');
          });
        });
      }
    });
  }, { threshold: 0.1 });

  heroObserver.observe(hero);
}());

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
//  History 타임라인 렌더러 — HISTORY_DATA(history.js)를 읽어 DOM 생성
// ============================================================
(function () {
  'use strict';

  if (typeof HISTORY_DATA === 'undefined') return;

  const section = document.querySelector('.hist-timeline-section');
  const yearNav = document.getElementById('yearNav');
  if (!section) return;

  HISTORY_DATA.forEach((yearData, idx) => {
    // ── Year Nav 아이템 ──────────────────────────────────────
    if (yearNav) {
      const navItem = document.createElement('a');
      navItem.href = `#year-${yearData.year}`;
      navItem.className = 'year-nav-item' + (idx === 0 ? ' active' : '');
      navItem.dataset.year = String(yearData.year);
      navItem.innerHTML = `<span class="year-nav-dot"></span><span class="year-nav-label">${yearData.year}</span>`;
      yearNav.appendChild(navItem);
    }

    // ── Year Group ──────────────────────────────────────────
    const group = document.createElement('div');
    group.className = 'hist-year-group' + (yearData.future ? ' hist-year-group--future' : '');
    group.id = `year-${yearData.year}`;
    group.dataset.year = String(yearData.year);

    // Year Header
    const subtitleExtra = yearData.subtitleClass ? ` ${yearData.subtitleClass}` : '';
    const circleClass = 'hist-year-circle' + (yearData.future ? ' hist-year-circle--future' : '');
    const header = document.createElement('div');
    header.className = 'hist-year-header';
    header.innerHTML = `
      <div class="${circleClass}">
        <span class="hist-year-num">${yearData.year}</span>
      </div>
      <p class="hist-year-subtitle${subtitleExtra}">${yearData.subtitle}</p>`;
    group.appendChild(header);

    if (yearData.future) {
      const futureCard = document.createElement('div');
      futureCard.className = 'hist-future-card';
      futureCard.innerHTML = `
        <div class="hist-future-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <h3>${yearData.futureTitle}</h3>
        <p>${yearData.futureDesc}</p>
        <div class="hist-future-dots"><span></span><span></span><span></span></div>`;
      group.appendChild(futureCard);
    } else {
      yearData.events.forEach(ev => {
        const eventEl = document.createElement('div');
        eventEl.className = `hist-event hist-event--${ev.side}`;
        const tagClass = 'hist-event-tag' + (ev.highlight ? ' highlight' : '');
        eventEl.innerHTML = `
          <div class="hist-event-connector">
            <div class="hist-event-dot"></div>
          </div>
          <div class="hist-event-card">
            <div class="hist-event-date">
              <span class="hist-event-month">${ev.month}</span>
              <span class="hist-event-day">${ev.day}</span>
            </div>
            <div class="hist-event-content">
              <h3>${ev.title}</h3>
              <p>${ev.description}</p>
              <div class="${tagClass}">${ev.tag}</div>
            </div>
          </div>`;
        group.appendChild(eventEl);
      });
    }

    section.appendChild(group);
  });

}());

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

  // 이벤트 위임: 동적으로 생성된 카드도 처리
  document.addEventListener('mousemove', (e) => {
    const card = e.target.closest('.hist-event-card');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--glow-x', x + '%');
    card.style.setProperty('--glow-y', y + '%');
  });

  updateTimelineProgress();
  updateActiveYear();

}());
