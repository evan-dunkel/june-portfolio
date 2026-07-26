import PhotoSwipeLightbox from 'photoswipe/lightbox';
import DynamicCaption from 'photoswipe-dynamic-caption-plugin';
import { bindCopyButton } from './copy-to-clipboard';
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
  const copyIconSvg = `
    <svg class="pswp-copy-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>`;
  const checkIconSvg = `
    <svg class="pswp-check-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>`;

  lightbox.on('dynamicCaptionUpdateHTML', ({ captionElement }) => {
    if (captionElement.querySelector('.pswp-caption-row')) return;

    // Wrap existing caption text and email in a flex row
    const captionHTML = captionElement.innerHTML;
    captionElement.innerHTML = `
      <div class="pswp-caption-row">
        <span class="pswp-caption-text">${captionHTML}</span>
        <button type="button" class="pswp-caption-email" aria-label="Copy email address: ${email}">
          <span class="pswp-caption-email-text" data-copy-label>${email}</span>
          <span class="pswp-caption-email-icon">${copyIconSvg}${checkIconSvg}</span>
        </button>
      </div>`;

    const emailEl = captionElement.querySelector<HTMLButtonElement>('.pswp-caption-email');
    if (emailEl) bindCopyButton(emailEl, email);
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
