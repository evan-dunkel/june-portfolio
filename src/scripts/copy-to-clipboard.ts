/**
 * Wire a button so it copies `value` to the clipboard and flips a `data-copied`
 * attribute for `timeoutMs` — CSS keys the copy → check icon transition off that
 * attribute. Handles click, Enter/Space, and a legacy execCommand fallback.
 *
 * Single source of truth for the copy-email widget used in the header and the
 * lightbox caption.
 */
/**
 * execCommand fallback for browsers without the async clipboard API. Copying
 * via a throwaway textarea clobbers whatever the user had highlighted, so the
 * existing ranges are saved and restored around it.
 */
function legacyCopy(value: string): void {
  const selection = window.getSelection();
  const saved: Range[] = [];
  if (selection) {
    for (let i = 0; i < selection.rangeCount; i++) {
      saved.push(selection.getRangeAt(i));
    }
  }

  const ta = document.createElement('textarea');
  ta.value = value;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);

  if (selection && saved.length) {
    selection.removeAllRanges();
    saved.forEach((range) => selection.addRange(range));
  }
}

export function bindCopyButton(
  el: HTMLElement,
  value: string,
  timeoutMs = 2000,
): void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const copy = async () => {
    // Bail if already showing the check. Flipping the attribute up front (rather
    // than after the await) also makes the second click of a double-click a
    // no-op instead of a second copy.
    if (el.hasAttribute('data-copied')) return;
    el.setAttribute('data-copied', '');

    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      el.removeAttribute('data-copied');
    }, timeoutMs);

    try {
      await navigator.clipboard.writeText(value);
    } catch {
      legacyCopy(value);
    }
  };

  el.addEventListener('click', (e) => {
    e.stopPropagation();
    copy();
  });

  // Browsers refuse to start a text selection inside a <button>, so a native
  // double-click never highlights the label. Select it by hand instead.
  el.addEventListener('dblclick', (e) => {
    const label = el.querySelector('[data-copy-label]') ?? el;
    const selection = window.getSelection();
    if (!selection) return;

    const range = document.createRange();
    range.selectNodeContents(label);
    selection.removeAllRanges();
    selection.addRange(range);
    e.preventDefault();
  });

  // Keyboard: Enter / Space to copy
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      copy();
    }
  });
}
