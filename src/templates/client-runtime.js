/**
 * Generates the embedded client-side runtime script for *stac.kr pages:
 * - Click-to-copy install pills (`copyInstallPill`)
 * - Prompt box copy button (`copyPromptBox`)
 * - Analogue ASCII logo glitch engine (`initAsciiGlitch`), configurable via `siteConfig.glitch`
 */
export function renderClientRuntime(glitchConfig = {}) {
  if (glitchConfig === false) {
    return `<script>
${renderClipboardHelpers()}
</script>`;
  }

  const minDelay = glitchConfig.minDelay ?? 6500;
  const maxDelaySpread = (glitchConfig.maxDelay ?? 14000) - minDelay;

  return `<script>
${renderClipboardHelpers()}

  // Analogue ASCII Logo Glitch Engine (localized horizontal shear & char static)
  (function initAsciiGlitch() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const logo = document.querySelector('.ascii-logo');
    if (!logo) return;

    const rawLines = logo.textContent.split('\\n');
    const maxLen = Math.max(...rawLines.map((l) => l.length));
    const baseLines = rawLines.map((l) => l.padEnd(maxLen, ' '));
    const baseText = baseLines.join('\\n');
    logo.textContent = baseText;

    const GLITCH_CHARS = '_|/\\\\[]=-~:;+*#░▒▓';

    function renderCorruptedFrame(intensity = 1) {
      // Pick 1 or 2 localized horizontal windows (8 to 18 columns wide)
      const nextLines = baseLines.map((line) => line.split(''));
      const numPatches = Math.random() < 0.45 ? 2 : 1;

      for (let p = 0; p < numPatches; p++) {
        const sliceWidth = 8 + Math.floor(Math.random() * 12 * intensity);
        const sliceStart = Math.floor(Math.random() * Math.max(1, maxLen - sliceWidth));
        const sliceEnd = Math.min(maxLen, sliceStart + sliceWidth);
        const shearRow = Math.floor(Math.random() * baseLines.length);
        const shearShift = (Math.random() < 0.5 ? -1 : 1) * (1 + Math.floor(Math.random() * 2));

        baseLines.forEach((line, r) => {
          // Analogue horizontal scanline shear on the chosen row within/around the slice
          if (r === shearRow) {
            for (let c = Math.max(0, sliceStart - 2); c < Math.min(maxLen, sliceEnd + 2); c++) {
              const srcCol = c - shearShift;
              nextLines[r][c] = (srcCol >= 0 && srcCol < maxLen) ? line[srcCol] : ' ';
            }
          }

          // Localized character static corruption inside the slice
          for (let c = sliceStart; c < sliceEnd; c++) {
            const orig = nextLines[r][c];
            const isInk = orig !== ' ';
            const prob = isInk ? 0.55 * intensity : 0.14 * intensity;
            if (Math.random() < prob) {
              nextLines[r][c] = (isInk && Math.random() < 0.22)
                ? ' '
                : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
            }
          }
        });
      }

      logo.textContent = nextLines.map((chars) => chars.join('')).join('\\n');
    }

    function triggerBurst(intensity = 1) {
      const frames = 3 + Math.floor(Math.random() * 4);
      let step = 0;

      function tick() {
        if (step < frames) {
          // Occasional brief clean frame mid-burst like an analogue sync recovery
          if (step > 0 && Math.random() < 0.2) {
            logo.textContent = baseText;
          } else {
            renderCorruptedFrame(intensity);
          }
          step++;
          setTimeout(tick, 45 + Math.random() * 45);
        } else {
          logo.textContent = baseText;
        }
      }
      tick();
    }

    function scheduleLoop() {
      const delay = ${minDelay} + Math.random() * ${maxDelaySpread};
      setTimeout(() => {
        triggerBurst(1);
        if (Math.random() < 0.25) {
          setTimeout(() => triggerBurst(0.7), 180 + Math.random() * 120);
        }
        scheduleLoop();
      }, delay);
    }

    setTimeout(() => triggerBurst(0.85), 900);
    scheduleLoop();
    logo.addEventListener('mouseenter', () => triggerBurst(1.15));
  })();
</script>`;
}

function renderClipboardHelpers() {
  return `  function copyInstallPill(el, text) {
    navigator.clipboard.writeText(text).then(() => {
      if (!el.dataset.orig) el.dataset.orig = el.innerText;
      el.classList.add('copied');
      el.innerText = 'Copied to clipboard';
      setTimeout(() => {
        el.innerText = el.dataset.orig;
        el.classList.remove('copied');
      }, 1400);
    });
  }
  function copyPromptBox(btn) {
    const box = btn.closest('.agent-prompt-box');
    const pre = box ? box.querySelector('.agent-prompt-content') : null;
    if (!pre) return;
    navigator.clipboard.writeText(pre.innerText).then(() => {
      const orig = btn.innerText;
      btn.innerText = 'Copied';
      setTimeout(() => btn.innerText = orig, 1600);
    });
  }`;
}
