const orgDropdown = document.querySelector(".org-dropdown");
const orgTrigger = document.querySelector(".org-trigger");
const orgMenu = document.getElementById("orgMenu");
const orgImage = document.getElementById("orgImage");
const memberInfoBox = document.getElementById("memberInfo");

const faceFocus = {
  all: { x: 0.5, y: 0.5, zoom: 0 },
  lee: { x: 0.53, y: 0.52, zoom: 2.1 },
  kim: { x: 0.76, y: 0.35, zoom: 2.3 },
  ham: { x: 0.76, y: 0.76, zoom: 2.1 },
  yoon: { x: 0.29, y: 0.36, zoom: 2.3 },
  won: { x: 0.24, y: 0.53, zoom: 2.1 },
};

let activeMember = "all";
let closeMenuTimer = null;

const memberProfiles = {
  all: {
    name: "소개",
    description: "구성원을 선택하면 각 인물의 정보를 확인할 수 있습니다.",
  },
  lee: {
    role: "CEO / CTO",
    name: "이은표",
    education: [
      "한국애니메이션고등학교 컴퓨터게임제작과 (졸)",
      "학점은행제 학사 (졸)",
    ],
    interests: "OCR, Computer Vision, Deep Learning, LLM",
  },
  kim: {
    role: "PM",
    name: "김건우",
    education: ["하남경영고등학교 스마트IT과 (졸)", "경민대학교 (재)"],
    interests: "Planning, Marketing, Management",
  },
  ham: {
    role: "SW Engineer",
    name: "함승민",
    education: ["하남경영고등학교 스마트IT과 (졸)", "용인대학교 (휴)"],
    interests: "AI, Machine Learning, Data Science",
  },
  yoon: {
    role: "SW Engineer",
    name: "윤성찬",
    education: ["하남경영고등학교 스마트IT과 (졸)", "한림대학교 (재)"],
    interests: "Data analysis, Full Stack Development",
  },
  won: {
    role: "Full-Stack Engineer",
    name: "원윤성",
    education: ["하남경영고등학교 스마트IT과 (졸)", "한성대학교 (재)"],
    interests: "Data Engineering, Full Stack Development",
  },
};

const applyFocus = (memberKey) => {
  if (!(orgImage instanceof HTMLImageElement)) {
    return;
  }

  const focus = faceFocus[memberKey];
  if (!focus) {
    return;
  }

  const width = orgImage.clientWidth;
  const height = orgImage.clientHeight;
  const zoom = focus.zoom <= 0 ? 1 : focus.zoom;
  const targetX = width * focus.x;
  const targetY = height * focus.y;

  const translateX = width / 2 - targetX * zoom;
  const translateY = height / 2 - targetY * zoom;

  orgImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoom})`;
  activeMember = memberKey;
};

const renderMemberInfo = (memberKey) => {
  if (!memberInfoBox) {
    return;
  }

  const profile = memberProfiles[memberKey];
  if (!profile) {
    memberInfoBox.innerHTML = "<p class=\"member-info-empty\">소개</p>";
    return;
  }

  if (!Array.isArray(profile.education)) {
    memberInfoBox.innerHTML = `
      <h3>${profile.name}</h3>
      <p class="member-info-empty">${profile.description || ""}</p>
    `;
    return;
  }

  const educationText = profile.education.join("<br />");
  memberInfoBox.innerHTML = `
    <div class="member-meta">
      <p><strong>Name</strong><span>${profile.name || "-"}</span></p>
      <p><strong>Position</strong><span>${profile.role || "-"}</span></p>
      <p><strong>Education</strong><span>${educationText || "-"}</span></p>
      <p><strong>Focus</strong><span>${profile.interests || "-"}</span></p>
    </div>
  `;
};

if (orgDropdown && orgMenu) {
  const openMenu = () => {
    if (closeMenuTimer) {
      window.clearTimeout(closeMenuTimer);
      closeMenuTimer = null;
    }
    orgDropdown.classList.add("open");
  };

  const closeMenuWithDelay = () => {
    if (closeMenuTimer) {
      window.clearTimeout(closeMenuTimer);
    }
    closeMenuTimer = window.setTimeout(() => {
      orgDropdown.classList.remove("open");
      closeMenuTimer = null;
    }, 180);
  };

  orgDropdown.addEventListener("mouseenter", () => {
    openMenu();
  });

  orgDropdown.addEventListener("mouseleave", () => {
    closeMenuWithDelay();
  });

  if (orgTrigger instanceof HTMLButtonElement) {
    orgTrigger.addEventListener("focus", () => {
      openMenu();
    });
  }

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }
    if (!orgDropdown.contains(target)) {
      if (closeMenuTimer) {
        window.clearTimeout(closeMenuTimer);
        closeMenuTimer = null;
      }
      orgDropdown.classList.remove("open");
    }
  });

  orgMenu.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLButtonElement)) {
      return;
    }

    const selectedText = target.dataset.value;
    const selectedMember = target.dataset.member;

    if (selectedText && selectedMember) {
      if (orgTrigger instanceof HTMLButtonElement) {
        orgTrigger.textContent = target.textContent || "구성원 선택";
      }
      applyFocus(selectedMember);
      renderMemberInfo(selectedMember);
      orgDropdown.classList.remove("open");
      if (closeMenuTimer) {
        window.clearTimeout(closeMenuTimer);
        closeMenuTimer = null;
      }
      if (orgTrigger instanceof HTMLButtonElement) {
        orgTrigger.blur();
      }
    }
  });
}

if (orgImage instanceof HTMLImageElement) {
  if (orgImage.complete) {
    applyFocus(activeMember);
  } else {
    orgImage.addEventListener("load", () => {
      applyFocus(activeMember);
    });
  }

  window.addEventListener("resize", () => {
    applyFocus(activeMember);
  });
}

renderMemberInfo(activeMember);
