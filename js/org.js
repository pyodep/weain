// ============================================================
//  We_AIn  —  org.js
//  팀 페이지: 구성원 선택 드롭다운 + 이미지 포커스
// ============================================================

// ── DOM 참조 ────────────────────────────────────────────────
const dropdown = document.querySelector('.org-dropdown');
const trigger  = document.querySelector('.org-trigger');
const menu     = document.getElementById('orgMenu');
const image    = document.getElementById('orgImage');
const infoBox  = document.getElementById('memberInfo');

// ── 데이터 ──────────────────────────────────────────────────
const FACE_FOCUS = {
  all:  { x: 0.5,  y: 0.5,  zoom: 0   },
  lee:  { x: 0.53, y: 0.52, zoom: 2.1 },
  kim:  { x: 0.76, y: 0.35, zoom: 2.3 },
  ham:  { x: 0.76, y: 0.76, zoom: 2.1 },
  yoon: { x: 0.29, y: 0.36, zoom: 2.3 },
  won:  { x: 0.24, y: 0.53, zoom: 2.1 },
};

const PROFILES = {
  all:  { name: '소개', description: '구성원을 선택하면 각 인물의 정보를 확인할 수 있습니다.' },
  lee:  { role: 'CEO / CTO',          name: '이은표', education: ['한국애니메이션고등학교 컴퓨터게임제작과 (졸)', '학점은행제 학사 (졸)'],         interests: 'OCR, Computer Vision, Deep Learning, LLM' },
  kim:  { role: 'PM',                  name: '김건우', education: ['하남경영고등학교 스마트IT과 (졸)', '경민대학교 (재)'],                          interests: 'Planning, Marketing, Management' },
  ham:  { role: 'SW Engineer',         name: '함승민', education: ['하남경영고등학교 스마트IT과 (졸)', '용인대학교 (휴)'],                          interests: 'AI, Machine Learning, Data Science' },
  yoon: { role: 'SW Engineer',         name: '윤성찬', education: ['하남경영고등학교 스마트IT과 (졸)', '한림대학교 (휴)'],                          interests: 'Data analysis, Full Stack Development' },
  won:  { role: 'Full-Stack Engineer', name: '원윤성', education: ['하남경영고등학교 스마트IT과 (졸)', '한성대학교 (재)'],                          interests: 'Data Engineering, Full Stack Development' },
};

let activeMember = 'all';
let closeTimer = null;

// ── 이미지 포커스 ───────────────────────────────────────────
const applyFocus = (key) => {
  if (!image) return;
  const f = FACE_FOCUS[key];
  if (!f) return;

  const { clientWidth: w, clientHeight: h } = image;
  const zoom = f.zoom || 1;
  const tx = w / 2 - w * f.x * zoom;
  const ty = h / 2 - h * f.y * zoom;

  image.style.transform = `translate(${tx}px, ${ty}px) scale(${zoom})`;
  activeMember = key;
};

// ── 구성원 정보 렌더링 ─────────────────────────────────────
const renderInfo = (key) => {
  if (!infoBox) return;
  const p = PROFILES[key];
  if (!p) {
    infoBox.innerHTML = '<p class="member-info-empty">소개</p>';
    return;
  }
  if (!Array.isArray(p.education)) {
    infoBox.innerHTML = `<h3>${p.name}</h3><p class="member-info-empty">${p.description || ''}</p>`;
    return;
  }
  infoBox.innerHTML = `
    <div class="member-meta">
      <p><strong>Name</strong><span>${p.name || '-'}</span></p>
      <p><strong>Position</strong><span>${p.role || '-'}</span></p>
      <p><strong>Education</strong><span>${p.education.join('<br>')}</span></p>
      <p><strong>Focus</strong><span>${p.interests || '-'}</span></p>
    </div>`;
};

// ── 드롭다운 메뉴 ──────────────────────────────────────────
if (dropdown && menu) {
  const openMenu = () => {
    clearTimeout(closeTimer);
    dropdown.classList.add('open');
  };

  const closeMenu = (delay = 0) => {
    clearTimeout(closeTimer);
    if (delay) {
      closeTimer = setTimeout(() => dropdown.classList.remove('open'), delay);
    } else {
      dropdown.classList.remove('open');
    }
  };

  dropdown.addEventListener('mouseenter', openMenu);
  dropdown.addEventListener('mouseleave', () => closeMenu(180));
  trigger?.addEventListener('focus', openMenu);

  // 외부 클릭 시 닫기
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) closeMenu();
  });

  // 메뉴 항목 선택 (이벤트 위임)
  menu.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-member]');
    if (!btn) return;

    const { member, value } = btn.dataset;
    if (!member || !value) return;

    if (trigger) trigger.textContent = btn.textContent || '구성원 선택';
    applyFocus(member);
    renderInfo(member);
    closeMenu();
    trigger?.blur();
  });
}

// ── 이미지 초기화 + 리사이즈 ────────────────────────────────
if (image) {
  const init = () => applyFocus(activeMember);
  image.complete ? init() : image.addEventListener('load', init);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => applyFocus(activeMember), 100);
  }, { passive: true });
}

renderInfo(activeMember);
