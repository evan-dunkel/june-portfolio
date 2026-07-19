import PhotoSwipeLightbox from 'photoswipe/lightbox';
import DynamicCaption from 'photoswipe-dynamic-caption-plugin';
import 'photoswipe/style.css';
import 'photoswipe-dynamic-caption-plugin/photoswipe-dynamic-caption-plugin.css';

function init() {
  const gallery = document.getElementById('portfolio-gallery');
  if (!gallery) return;

  const email = gallery.dataset.email || '';

  // Build slug → index map from gallery items
  const items = document.querySelectorAll<HTMLElement>('.gallery-item');
  const slugs: string[] = [];
  items.forEach((el) => {
    slugs.push(el.dataset.galleryId || '');
  });

  const HASH_PREFIX = 'image/';

  function hashFromSlug(slug: string): string {
    return `#${HASH_PREFIX}${slug}`;
  }

  function slideIndexFromHash(): number | null {
    const hash = window.location.hash;
    if (!hash.startsWith(`#${HASH_PREFIX}`)) return null;
    const targetSlug = hash.slice(HASH_PREFIX.length + 1);
    const idx = slugs.indexOf(targetSlug);
    return idx >= 0 ? idx : null;
  }

  const lightbox = new PhotoSwipeLightbox({
    gallery: '#portfolio-gallery',
    children: '.gallery-item',
    pswpModule: () => import('photoswipe'),
    bgOpacity: 0.9,
    spacing: 0.08,
    padding: { top: 40, bottom: 60, left: 20, right: 20 },
    showHideAnimationType: 'zoom',
    imageClickAction: 'zoom-or-close',
    tapAction: 'zoom-or-close',
    bgClickAction: 'close',
  });

  // ── Dynamic caption plugin ────────────────────────────────────────
  new DynamicCaption(lightbox, {
    type: 'below',
    mobileLayoutBreakpoint: 600,
    captionContent: (slide) => {
      const el = slide.data.element;
      return el?.dataset.caption || '';
    },
  });

  // ── Deep-link: update URL hash when slide changes ──────────────────
  lightbox.on('change', () => {
    if (!lightbox.pswp) return;
    const index = lightbox.pswp.currIndex;
    const slug = slugs[index];
    if (slug) {
      history.replaceState(null, '', hashFromSlug(slug));
    }
  });

  // ── Deep-link: remove hash when lightbox closes ────────────────────
  lightbox.on('close', () => {
    if (window.location.hash.startsWith(`#${HASH_PREFIX}`)) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  });

  // ── Deep-link: handle browser back/forward ─────────────────────────
  window.addEventListener('popstate', () => {
    const idx = slideIndexFromHash();
    if (idx !== null && lightbox.pswp) {
      lightbox.pswp.goTo(idx);
    } else if (idx === null && lightbox.pswp) {
      lightbox.pswp.close();
    }
  });

  // ── Email in caption area ─────────────────────────────────────────
  function copyEmail(target: HTMLButtonElement) {
    if (target.hasAttribute('data-copied')) return;

    navigator.clipboard.writeText(email).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = email;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    });

    target.setAttribute('data-copied', '');
    setTimeout(() => {
      target.removeAttribute('data-copied');
    }, 2000);
  }

  lightbox.on('dynamicCaptionUpdateHTML', ({ captionElement }) => {
    if (captionElement.querySelector('.pswp-caption-row')) return;

    // Wrap existing caption text and email in a flex row
    const row = document.createElement('div');
    row.className = 'pswp-caption-row';

    const textSpan = document.createElement('span');
    textSpan.className = 'pswp-caption-text';
    textSpan.innerHTML = captionElement.innerHTML;

    // Build the copy button with inline icons
    const emailEl = document.createElement('button');
    emailEl.type = 'button';
    emailEl.className = 'pswp-caption-email';
    emailEl.setAttribute('aria-label', `Copy email address: ${email}`);

    const emailText = document.createElement('span');
    emailText.className = 'pswp-caption-email-text';
    emailText.textContent = email;

    const iconWrap = document.createElement('span');
    iconWrap.className = 'pswp-caption-email-icon';

    // Copy icon
    const copySvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    copySvg.setAttribute('class', 'pswp-copy-icon');
    copySvg.setAttribute('width', '14');
    copySvg.setAttribute('height', '14');
    copySvg.setAttribute('viewBox', '0 0 24 24');
    copySvg.setAttribute('fill', 'none');
    copySvg.setAttribute('stroke', 'currentColor');
    copySvg.setAttribute('stroke-width', '2');
    copySvg.setAttribute('stroke-linecap', 'round');
    copySvg.setAttribute('stroke-linejoin', 'round');
    copySvg.setAttribute('aria-hidden', 'true');
    const copyRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    copyRect.setAttribute('x', '9');
    copyRect.setAttribute('y', '9');
    copyRect.setAttribute('width', '13');
    copyRect.setAttribute('height', '13');
    copyRect.setAttribute('rx', '2');
    copyRect.setAttribute('ry', '2');
    const copyPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    copyPath.setAttribute('d', 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1');
    copySvg.appendChild(copyRect);
    copySvg.appendChild(copyPath);

    // Check icon
    const checkSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    checkSvg.setAttribute('class', 'pswp-check-icon');
    checkSvg.setAttribute('width', '14');
    checkSvg.setAttribute('height', '14');
    checkSvg.setAttribute('viewBox', '0 0 24 24');
    checkSvg.setAttribute('fill', 'none');
    checkSvg.setAttribute('stroke', 'currentColor');
    checkSvg.setAttribute('stroke-width', '2.5');
    checkSvg.setAttribute('stroke-linecap', 'round');
    checkSvg.setAttribute('stroke-linejoin', 'round');
    checkSvg.setAttribute('aria-hidden', 'true');
    const checkPoly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    checkPoly.setAttribute('points', '20 6 9 17 4 12');
    checkSvg.appendChild(checkPoly);

    iconWrap.appendChild(copySvg);
    iconWrap.appendChild(checkSvg);
    emailEl.appendChild(emailText);
    emailEl.appendChild(iconWrap);

    emailEl.addEventListener('click', (e) => {
      e.stopPropagation();
      copyEmail(emailEl);
    });
    emailEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        copyEmail(emailEl);
      }
    });

    row.appendChild(textSpan);
    row.appendChild(emailEl);
    captionElement.innerHTML = '';
    captionElement.appendChild(row);
  });

  // ── Deep-link: open directly to a hashed image on page load ────────
  const startIndex = slideIndexFromHash();
  if (startIndex !== null) {
    lightbox.loadAndOpen(startIndex);
  } else {
    lightbox.init();
  }
}

init();
