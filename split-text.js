(() => {
  const targets = [...document.querySelectorAll('.split-text')];
  if (!targets.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const normalizeLabel = text => text.replace(/\s+/g, ' ').trim();

  const splitTextNodesIntoWords = element => {
    if (element.dataset.splitReady === 'true') return [];

    const label = normalizeLabel(element.innerText || element.textContent || '');
    if (label && !element.hasAttribute('aria-label')) element.setAttribute('aria-label', label);

    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent || parent.closest('[aria-hidden="true"]')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    const words = [];
    nodes.forEach(node => {
      const fragment = document.createDocumentFragment();
      const tokens = node.nodeValue.split(/(\s+)/);

      tokens.forEach(token => {
        if (!token) return;
        if (/^\s+$/.test(token)) {
          fragment.appendChild(document.createTextNode(token));
          return;
        }

        const mask = document.createElement('span');
        mask.className = 'split-word-mask';
        mask.setAttribute('aria-hidden', 'true');

        const word = document.createElement('span');
        word.className = 'split-word';
        word.textContent = token;
        word.style.setProperty('--split-index', words.length);

        mask.appendChild(word);
        fragment.appendChild(mask);
        words.push(word);
      });

      node.parentNode.replaceChild(fragment, node);
    });

    const delay = Math.max(0, Number(element.dataset.splitDelay || 55));
    const duration = Math.max(0.2, Number(element.dataset.splitDuration || 0.9));
    element.style.setProperty('--split-delay', `${delay}ms`);
    element.style.setProperty('--split-duration', `${duration}s`);
    element.dataset.splitReady = 'true';
    element.classList.add('split-parent');

    return words;
  };

  const prepared = targets.map(element => ({
    element,
    words: splitTextNodesIntoWords(element)
  }));

  const showImmediately = item => {
    item.element.classList.add('split-visible', 'split-complete');
  };

  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    prepared.forEach(showImmediately);
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const item = prepared.find(candidate => candidate.element === entry.target);
      if (!item) return;

      entry.target.classList.add('split-visible');
      observer.unobserve(entry.target);

      const lastWord = item.words[item.words.length - 1];
      if (!lastWord) {
        entry.target.classList.add('split-complete');
        return;
      }

      const finish = () => {
        entry.target.classList.add('split-complete');
        entry.target.dispatchEvent(new CustomEvent('splittext:complete'));
      };
      lastWord.addEventListener('transitionend', finish, { once: true });
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  });

  prepared.forEach(item => observer.observe(item.element));

  reduceMotion.addEventListener?.('change', event => {
    if (!event.matches) return;
    observer.disconnect();
    prepared.forEach(showImmediately);
  });
})();
