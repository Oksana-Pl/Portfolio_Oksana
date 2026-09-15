(() => {
  const form = document.querySelector('.enquiry-form');
  if (form) {
    const button = form.querySelector('button');
    const status = form.querySelector('.form-status');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (button.disabled || !form.reportValidity()) return;
      button.disabled = true;
      form.setAttribute('aria-busy', 'true');
      status.dataset.state = 'pending';
      status.textContent = 'Sending your message…';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      try {
        const response = await fetch(form.action, {
          method: 'POST', body: new FormData(form),
          headers: { Accept: 'application/json' }, signal: controller.signal
        });
        if (!response.ok) throw new Error('Submission failed');
        status.dataset.state = 'success';
        status.textContent = 'Thank you! Your message has been sent.';
        form.reset();
      } catch (error) {
        status.dataset.state = 'error';
        status.textContent = error.name === 'AbortError'
          ? 'The request timed out, so delivery could not be confirmed. Please try again or email me directly.'
          : 'Your message could not be sent. Please try again or email me directly.';
      } finally {
        clearTimeout(timeout);
        button.disabled = false;
        form.removeAttribute('aria-busy');
      }
    });
  }

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches || !('IntersectionObserver' in window)) return;
  const blocks = document.querySelectorAll('.about-intro h1, .section h2, .section > p, .contact-section h1, .contact-section > p');
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add(entry.target.classList.contains('reveal-card') ? 'is-visible' : 'text-visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.08 });
  blocks.forEach(block => {
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const fragment = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(word => {
        if (!word.trim()) fragment.append(document.createTextNode(word));
        else {
          const span = document.createElement('span');
          span.className = 'reveal-word';
          span.textContent = word;
          fragment.append(span);
        }
      });
      node.replaceWith(fragment);
    });
    let previousTop = null, line = -1, wordInLine = 0;
    block.querySelectorAll('.reveal-word').forEach(word => {
      const top = word.getBoundingClientRect().top;
      if (previousTop === null || Math.abs(top - previousTop) > 3) { line++; wordInLine = 0; previousTop = top; }
      word.style.transitionDelay = `${line * .14 + wordInLine++ * .022}s`;
    });
    observer.observe(block);
  });
  document.querySelectorAll('.gallery').forEach(gallery => {
    let previousTop = null, column = 0;
    [...gallery.children].forEach(card => {
      const top = card.getBoundingClientRect().top;
      if (previousTop === null || Math.abs(top - previousTop) > 3) { column = 0; previousTop = top; }
      card.classList.add('reveal-card');
      card.style.transitionDelay = `${column++ * .12}s`;
      observer.observe(card);
    });
  });
  motion.addEventListener('change', event => {
    if (!event.matches) return;
    observer.disconnect();
    blocks.forEach(block => block.classList.add('text-visible'));
    document.querySelectorAll('.reveal-card').forEach(card => card.classList.add('is-visible'));
  });
})();
