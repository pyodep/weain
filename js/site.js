const historyItems = document.querySelectorAll('.history-step');

if (historyItems.length > 0) {
  historyItems.forEach((item, index) => {
    item.style.transitionDelay = `${index * 80}ms`;
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          } else {
            entry.target.classList.remove('in-view');
          }
        });
      },
      {
        threshold: 0.55,
        rootMargin: '-8% 0px -8% 0px',
      }
    );

    historyItems.forEach((item) => observer.observe(item));
  } else {
    historyItems.forEach((item) => item.classList.add('in-view'));
  }
}
