/**
 * Traditional Indian Wedding Invitation — Ultra-Smooth Interactive Experience
 * Configure couple details, dates, venue, and Google Sheets Web App URL below.
 */
const WEDDING_CONFIG = {
  groom: {
    name: 'Siddhesh Laxman Bhande',
    lineage: 'Son of Mr Laxman and Mrs Priyanka Bhande',
  },
  bride: {
    name: 'Nikita Dnyaneshwar Desai',
    lineage: 'Daughter of Mr Dnyaneshwar and Mrs Trupti Desai',
  },
  weddingTargetISO: '2027-01-02T12:32:00+05:30',
  venue: {
    name: 'Kalpana River Villa',
    address: 'Kalpana River Villa, Khutghar, Shahapur, Maharashtra 421601',
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=Kalpana+River+Villa,+Khutghar,+Shahapur,+Maharashtra+421601',
  },
  /**
   * Direct Google Form POST configuration (https://forms.gle/58w74jZkjKkoE8yv7)
   * Keeps the custom palace-themed RSVP UI while saving directly into the
   * linked Google Sheet ("Form Responses 1" tab of 1TrQlGHmzZ7k2Iw6d_zRxy4rb64MmalTqTYvsoFzZB-Q).
   */
  googleFormActionUrl:
    'https://docs.google.com/forms/d/e/1FAIpQLScVd7zi3qHpQUwCKK_d-kzbd3mfp-lqnHKFL3KDXv_gf284fQ/formResponse',
  googleFormEntries: {
    name: 'entry.107880043',
    guestCount: 'entry.605238274',
    foodPreference: 'entry.380952230',
    arrivalPlan: 'entry.1772788153',
    arrivalNote: 'entry.1168825779',
  },
  googleSheetWebAppUrl: '',
};

/* ============================================================================
   1. INITIALIZATION & COUPLE CONFIG BINDING
   ============================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  applyCoupleConfig();
  initEntranceController();
  initSoundController();
  initAmbientPetals();
  initScratchHeart();
  initCalendarActions();
  initCountdownTimer();
  initScrollRevealFallback();
  initRsvpForm();
});

function applyCoupleConfig() {
  const params = new URLSearchParams(window.location.search);
  const groomName = params.get('groom') || WEDDING_CONFIG.groom.name;
  const brideName = params.get('bride') || WEDDING_CONFIG.bride.name;
  const groomLineage = params.get('groomLineage') || WEDDING_CONFIG.groom.lineage;
  const brideLineage = params.get('brideLineage') || WEDDING_CONFIG.bride.lineage;

  const groomNameEl = document.getElementById('groom-name');
  const brideNameEl = document.getElementById('bride-name');
  const groomLineageEl = document.getElementById('groom-lineage');
  const brideLineageEl = document.getElementById('bride-lineage');

  if (groomNameEl) groomNameEl.textContent = groomName;
  if (brideNameEl) brideNameEl.textContent = brideName;
  if (groomLineageEl) groomLineageEl.textContent = groomLineage;
  if (brideLineageEl) brideLineageEl.textContent = brideLineage;
}

/* ============================================================================
   2. UNIFIED 60/120FPS ENTRANCE CHOREOGRAPHY:
      - Stage A (0.00s - 1.55s): Embossed Green Botanical Doors split & slide apart
      - Stage B (0.85s - 2.95s): 3D Silk Pleated Curtain parts in a curved `/\` arch
        and settles into the Top 3 Scalloped Pearl Valances & Side Drapes
      - Stage C (2.45s - 3.35s): Center Heart Line draws outward, followed by
        Couple Names & Scroll Indicator cascading into view
   ============================================================================ */
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 4);
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function initEntranceController() {
  const openTrigger = document.getElementById('door-open-trigger');
  const doorsContainer = document.getElementById('entrance-doors');
  const leftDoor = document.getElementById('door-leaf-left');
  const rightDoor = document.getElementById('door-leaf-right');
  const leftPlaqueWing = document.getElementById('plaque-wing-left');
  const rightPlaqueWing = document.getElementById('plaque-wing-right');
  const replayBtn = document.getElementById('replay-entrance-btn');
  const curtainCanvas = document.getElementById('silk-curtain-canvas');

  if (!curtainCanvas) return;
  const ctx = curtainCanvas.getContext('2d');

  let cssW = 460;
  let cssH = 840;
  let dpr = 1;
  let currentCurtainProgress = 0;
  let animRafId = null;
  let isAnimatingEntrance = false;

  function resizeCurtainCanvas() {
    const rect = curtainCanvas.parentElement.getBoundingClientRect();
    cssW = rect.width || 460;
    cssH = rect.height || window.innerHeight || 840;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    curtainCanvas.width = Math.round(cssW * dpr);
    curtainCanvas.height = Math.round(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    renderSilkCurtain(currentCurtainProgress);
  }

  window.addEventListener('resize', resizeCurtainCanvas, { passive: true });

  /**
   * Draws a single 3D shaded pearl bead at (x, y) with radius r
   */
  function drawPearlBead(x, y, r) {
    ctx.save();
    // Subtle warm shadow
    ctx.fillStyle = 'rgba(72, 52, 22, 0.28)';
    ctx.beginPath();
    ctx.arc(x, y + 1.2, r, 0, Math.PI * 2);
    ctx.fill();

    // Pearl base body
    const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.45, '#f9f0de');
    grad.addColorStop(0.82, '#d8c29d');
    grad.addColorStop(1, '#9d8054');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * Evaluates a quadratic Bezier point at parameter u in [0, 1]
   */
  function quadPoint(p0, p1, p2, u) {
    const inv = 1 - u;
    return inv * inv * p0 + 2 * inv * u * p1 + u * u * p2;
  }

  /**
   * Renders the complete 3D cream silk pleated curtain & top scalloped swags
   * for any continuous opening progress `p` in [0, 1].
   * - At p = 0: Full-height closed pleated silk curtain with center double pearl seam
   *   and golden side moldings (Matches Screenshots 2 & 3).
   * - At p = 0.3..0.7: Curtains part from the center in a graceful `/\` arch tied back
   *   by pearl strings, revealing the courtyard fountain below (Matches Screenshots 4 & 5).
   * - At p = 1.0: Settled upper-left/right side drapes + 3 scalloped pearl-trimmed
   *   top valances framing the invitation (Matches Screenshots 6 & 7).
   */
  function renderSilkCurtain(p) {
    ctx.clearRect(0, 0, cssW, cssH);

    const openEase = easeInOutCubic(clamp01(p));
    const valanceEase = easeOutQuart(clamp01((p - 0.28) / 0.72));
    const pilasterFade = 1 - clamp01(p / 0.35);

    const numPleats = 7;

    // Helper to draw either Left side (dir = 1) or Right side (dir = -1)
    const drawCurtainWing = (isRight) => {
      ctx.save();
      if (isRight) {
        ctx.translate(cssW, 0);
        ctx.scale(-1, 1);
      }

      // Key control points for the inner pearl-trimmed edge of the left curtain:
      // 1. Top attachment point along y = 0:
      //    Stays near center (0.50 * cssW) initially so the parting forms `/\`,
      //    then glides to 0.35 * cssW as the top valances settle.
      const topSlide = easeInOutCubic(clamp01((p - 0.32) / 0.68));
      const innerTopX = lerp(cssW * 0.5, cssW * 0.35, topSlide);

      // 2. Tieback waist point (waistX, tieY):
      //    Pulls smoothly from center (0.50 * cssW) to the outer side (0.085 * cssW)
      //    while rising slightly from 0.62 * cssH to 0.41 * cssH.
      const tieY = lerp(cssH * 0.62, cssH * 0.41, openEase);
      const innerWaistX = lerp(cssW * 0.5, cssW * 0.085, openEase);

      // 3. Lower cascading tail end (bottomX, bottomY):
      //    Sweeps from bottom-center (0.50 * cssW, cssH) to the outer edge (0, 0.58 * cssH)
      //    so the courtyard rose urns and fountain at the bottom are completely clear!
      const bottomX = lerp(cssW * 0.5, 0, clamp01(openEase * 1.18));
      const bottomY = lerp(cssH, cssH * 0.58, openEase);

      // Cast soft drop shadow from the inner curtain edge onto the courtyard behind it
      ctx.save();
      ctx.fillStyle = `rgba(42, 31, 16, ${lerp(0.12, 0.22, openEase)})`;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(innerTopX + 7, 0);
      ctx.quadraticCurveTo(
        lerp(innerTopX, innerWaistX, 0.55) + 8,
        tieY * 0.52,
        innerWaistX + 6,
        tieY
      );
      ctx.quadraticCurveTo(
        lerp(innerWaistX, bottomX, 0.5) + 5,
        lerp(tieY, bottomY, 0.55),
        bottomX + 4,
        bottomY
      );
      ctx.lineTo(0, bottomY);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Draw each 3D cylindrical silk pleat ribbon (k = 0 .. numPleats - 1)
      for (let k = 0; k < numPleats; k++) {
        const f0 = k / numPleats;
        const f1 = (k + 1) / numPleats;

        const topX0 = innerTopX * f0;
        const topX1 = innerTopX * f1;

        const waistX0 = innerWaistX * f0;
        const waistX1 = innerWaistX * f1;

        const botX0 = bottomX * f0;
        const botX1 = bottomX * f1;

        const ctrlUpperX0 = lerp(topX0, waistX0, 0.56);
        const ctrlUpperX1 = lerp(topX1, waistX1, 0.56);
        const ctrlUpperY = tieY * 0.52;

        const ctrlLowerX0 = lerp(waistX0, botX0, 0.5);
        const ctrlLowerX1 = lerp(waistX1, botX1, 0.5);
        const ctrlLowerY = lerp(tieY, bottomY, 0.52);

        // Horizontal silk sheen gradient across this pleat
        const midX0 = (topX0 + waistX0) * 0.5;
        const midX1 = (topX1 + waistX1) * 0.5;
        const pleatGrad = ctx.createLinearGradient(midX0, 0, Math.max(midX0 + 2, midX1), 0);
        pleatGrad.addColorStop(0, '#cbb798');
        pleatGrad.addColorStop(0.22, '#ebe0cc');
        pleatGrad.addColorStop(0.48, '#fcf8f0');
        pleatGrad.addColorStop(0.76, '#e3d4bc');
        pleatGrad.addColorStop(1, '#bfa987');

        ctx.fillStyle = pleatGrad;
        ctx.beginPath();
        ctx.moveTo(topX0, 0);
        ctx.lineTo(topX1, 0);
        ctx.quadraticCurveTo(ctrlUpperX1, ctrlUpperY, waistX1, tieY);
        ctx.quadraticCurveTo(ctrlLowerX1, ctrlLowerY, botX1, bottomY);
        ctx.lineTo(botX0, bottomY);
        ctx.quadraticCurveTo(ctrlLowerX0, ctrlLowerY, waistX0, tieY);
        ctx.quadraticCurveTo(ctrlUpperX0, ctrlUpperY, topX0, 0);
        ctx.closePath();
        ctx.fill();

        // Subtle silk crease shadow line along the valley of each pleat
        ctx.strokeStyle = 'rgba(158, 134, 98, 0.42)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(topX1, 0);
        ctx.quadraticCurveTo(ctrlUpperX1, ctrlUpperY, waistX1, tieY);
        ctx.quadraticCurveTo(ctrlLowerX1, ctrlLowerY, botX1, bottomY);
        ctx.stroke();
      }

      // Golden architectural side pilaster when curtain is initially closed (Screenshot 3)
      if (pilasterFade > 0.01) {
        ctx.save();
        ctx.globalAlpha = pilasterFade;
        const pilGrad = ctx.createLinearGradient(0, 0, 16, 0);
        pilGrad.addColorStop(0, '#7d5e28');
        pilGrad.addColorStop(0.4, '#e5cc94');
        pilGrad.addColorStop(0.7, '#b5904b');
        pilGrad.addColorStop(1, '#7a5b24');
        ctx.fillStyle = pilGrad;
        ctx.fillRect(0, 0, 16, cssH);
        ctx.restore();
      }

      // Golden tieback cord at the waist when curtain opens
      if (openEase > 0.15) {
        ctx.save();
        ctx.globalAlpha = clamp01((openEase - 0.15) / 0.4);
        ctx.strokeStyle = '#c4a262';
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, tieY - 12);
        ctx.quadraticCurveTo(innerWaistX * 0.55, tieY - 2, innerWaistX + 2, tieY + 2);
        ctx.stroke();
        ctx.restore();
      }

      // Draw continuous 3D Pearl Chain along the inner edge (from top -> waist -> lower hem)
      const ctrlUpperX = lerp(innerTopX, innerWaistX, 0.56);
      const ctrlUpperY = tieY * 0.52;
      const upperSteps = 22;
      for (let i = 0; i <= upperSteps; i++) {
        const u = i / upperSteps;
        const px = quadPoint(innerTopX, ctrlUpperX, innerWaistX, u) - 3.5;
        const py = quadPoint(0, ctrlUpperY, tieY, u);
        drawPearlBead(px, py, 3.8);
      }

      // Lower pearl chain & hanging tassel below the tieback waist
      const ctrlLowerX = lerp(innerWaistX, bottomX, 0.5);
      const ctrlLowerY = lerp(tieY, bottomY, 0.52);
      const lowerSteps = 14;
      for (let i = 1; i <= lowerSteps; i++) {
        const u = i / lowerSteps;
        const px = quadPoint(innerWaistX, ctrlLowerX, bottomX, u) - 3.5;
        const py = quadPoint(tieY, ctrlLowerY, bottomY, u);
        if (px > -4 && py < cssH + 4) {
          drawPearlBead(px, py, 3.6);
        }
      }

      ctx.restore();
    };

    // Draw Left & Right Curtain Wings
    drawCurtainWing(false);
    drawCurtainWing(true);

    // Draw Top Three Scalloped Silk Valances (Swags) with Pearl Trim (Screenshots 5, 6, 7)
    if (valanceEase > 0.01) {
      ctx.save();
      const slideY = lerp(-95, 0, valanceEase);
      ctx.translate(0, slideY);

      const drawScallopSwag = (xStart, xEnd, dipHeight, isCenter) => {
        const xMid = (xStart + xEnd) * 0.5;

        // Soft shadow under swag
        ctx.fillStyle = 'rgba(52, 38, 18, 0.16)';
        ctx.beginPath();
        ctx.moveTo(xStart, 0);
        ctx.quadraticCurveTo(xMid, dipHeight + 7, xEnd, 0);
        ctx.closePath();
        ctx.fill();

        // Silk swag body
        const swagGrad = ctx.createLinearGradient(xStart, 0, xEnd, dipHeight * 0.6);
        swagGrad.addColorStop(0, '#dfd0b8');
        swagGrad.addColorStop(0.3, '#f4ebdc');
        swagGrad.addColorStop(0.5, isCenter ? '#fffcf6' : '#faf4e8');
        swagGrad.addColorStop(0.72, '#eadcc6');
        swagGrad.addColorStop(1, '#cbb696');

        ctx.fillStyle = swagGrad;
        ctx.beginPath();
        ctx.moveTo(xStart, 0);
        ctx.quadraticCurveTo(xMid, dipHeight, xEnd, 0);
        ctx.closePath();
        ctx.fill();

        // Concentric internal silk drape fold highlights & shadows
        for (const ratio of [0.38, 0.62, 0.82]) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.62)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(lerp(xStart, xMid, 1 - ratio), 0);
          ctx.quadraticCurveTo(xMid, dipHeight * ratio, lerp(xEnd, xMid, 1 - ratio), 0);
          ctx.stroke();

          ctx.strokeStyle = 'rgba(168, 142, 104, 0.48)';
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(lerp(xStart, xMid, 1 - ratio * 1.05), 0);
          ctx.quadraticCurveTo(
            xMid,
            dipHeight * (ratio + 0.06),
            lerp(xEnd, xMid, 1 - ratio * 1.05),
            0
          );
          ctx.stroke();
        }

        // 3D Pearl string along the scalloped bottom curve
        const pearlCount = isCenter ? 15 : 11;
        for (let i = 1; i < pearlCount; i++) {
          const u = i / pearlCount;
          const px = quadPoint(xStart, xMid, xEnd, u);
          const py = quadPoint(0, dipHeight, 0, u);
          drawPearlBead(px, py, isCenter ? 3.9 : 3.6);
        }
      };

      // Left & Right Outer Swags first, then Dominant Center Swag on top
      drawScallopSwag(-8, cssW * 0.34, 86, false);
      drawScallopSwag(cssW * 0.66, cssW + 8, 86, false);
      drawScallopSwag(cssW * 0.29, cssW * 0.71, 108, true);

      ctx.restore();
    }
  }

  // Initial render at progress = 0 (Closed Curtain ready behind the Closed Doors)
  resizeCurtainCanvas();

  function runMasterEntranceAnimation() {
    if (isAnimatingEntrance || document.body.classList.contains('is-opened')) return;
    isAnimatingEntrance = true;

    startSoundOnFirstInteraction();
    if (doorsContainer) doorsContainer.classList.add('is-opening');

    const startTime = performance.now();
    const doorDuration = 1550; // 0.00s -> 1.55s: Doors split & slide apart
    const curtainDelay = 820; // 0.82s: Curtain begins parting as doors near outer edges
    const curtainDuration = 2050; // 0.82s -> 2.87s: Curtain parts into `/\` and settles
    const lineRevealTime = 2350; // 2.35s: Center `─── ♥ ───` line draws in (Screenshot 6)
    const textRevealTime = 2680; // 2.68s: Couple names & SCROLL cascade in (Screenshot 7)
    const totalDuration = 3000;

    let lineTriggered = false;
    let textTriggered = false;

    function tick(now) {
      const elapsed = now - startTime;

      // 1. Update Left & Right Botanical Doors & Plaque Wings via GPU translate3d
      const doorRaw = clamp01(elapsed / doorDuration);
      const doorEase = easeInOutCubic(doorRaw);
      const doorOffsetPx = doorEase * (cssW * 0.52);
      if (leftDoor) leftDoor.style.transform = `translate3d(-${doorOffsetPx}px, 0, 0)`;
      if (rightDoor) rightDoor.style.transform = `translate3d(${doorOffsetPx}px, 0, 0)`;
      if (leftPlaqueWing) {
        leftPlaqueWing.style.transform = `translate3d(calc(-50% - ${doorOffsetPx}px), -50%, 0)`;
      }
      if (rightPlaqueWing) {
        rightPlaqueWing.style.transform = `translate3d(calc(-50% + ${doorOffsetPx}px), -50%, 0)`;
      }

      // 2. Update 3D Silk Curtain & Scalloped Valances Canvas
      const curtainRaw = clamp01((elapsed - curtainDelay) / curtainDuration);
      currentCurtainProgress = curtainRaw;
      renderSilkCurtain(currentCurtainProgress);

      // 3. Trigger Center Line (`─── ♥ ───`) first (Screenshot 6)
      if (!lineTriggered && elapsed >= lineRevealTime) {
        lineTriggered = true;
        document.body.classList.add('hero-line-visible');
      }

      // 4. Trigger Full Hero Text Cascade & Unlock Scroll (Screenshot 7)
      if (!textTriggered && elapsed >= textRevealTime) {
        textTriggered = true;
        document.body.classList.add('hero-text-visible', 'is-opened');
        document.body.classList.remove('is-locked');
        if (doorsContainer) doorsContainer.setAttribute('aria-hidden', 'true');
        if (replayBtn) replayBtn.hidden = false;
      }

      if (elapsed < totalDuration) {
        animRafId = requestAnimationFrame(tick);
      } else {
        currentCurtainProgress = 1;
        renderSilkCurtain(1);
        isAnimatingEntrance = false;
      }
    }

    animRafId = requestAnimationFrame(tick);
  }

  if (openTrigger) {
    openTrigger.addEventListener('click', runMasterEntranceAnimation);
  }

  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      if (animRafId) cancelAnimationFrame(animRafId);
      isAnimatingEntrance = false;
      window.scrollTo({ top: 0, behavior: 'instant' });
      replayBtn.hidden = true;

      document.body.classList.remove('is-opened', 'hero-line-visible', 'hero-text-visible');
      document.body.classList.add('is-locked');

      if (doorsContainer) {
        doorsContainer.classList.remove('is-opening');
        doorsContainer.removeAttribute('aria-hidden');
      }
      if (leftDoor) leftDoor.style.transform = 'translate3d(0, 0, 0)';
      if (rightDoor) rightDoor.style.transform = 'translate3d(0, 0, 0)';
      if (leftPlaqueWing) leftPlaqueWing.style.transform = 'translate3d(-50%, -50%, 0)';
      if (rightPlaqueWing) rightPlaqueWing.style.transform = 'translate3d(-50%, -50%, 0)';

      currentCurtainProgress = 0;
      renderSilkCurtain(0);
    });
  }
}

/* ============================================================================
   3. WEB AUDIO SYNTHESIZED TRADITIONAL CHIME / SITAR-HARP AMBIENCE
   ============================================================================ */
let audioCtx = null;
let isPlayingSound = false;
let soundLoopTimer = null;
let userMutedSound = false;

function initSoundController() {
  const soundBtn = document.getElementById('sound-toggle-btn');
  if (!soundBtn) return;

  soundBtn.addEventListener('click', () => {
    if (isPlayingSound) {
      userMutedSound = true;
      stopAmbientMusic();
      soundBtn.setAttribute('aria-pressed', 'false');
    } else {
      userMutedSound = false;
      startAmbientMusic();
      soundBtn.setAttribute('aria-pressed', 'true');
    }
  });
}

function startSoundOnFirstInteraction() {
  if (userMutedSound || isPlayingSound) return;
  const soundBtn = document.getElementById('sound-toggle-btn');
  startAmbientMusic();
  if (soundBtn && isPlayingSound) {
    soundBtn.setAttribute('aria-pressed', 'true');
  }
}

function startAmbientMusic() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    isPlayingSound = true;

    const notes = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
    let step = 0;
    const pattern = [0, 2, 3, 5, 4, 3, 2, 1, 0, 3, 4, 7, 5, 4, 3, 2];

    const playPluck = (freq, duration = 2.4, volume = 0.04) => {
      if (!audioCtx || !isPlayingSound) return;
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const subOsc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      subOsc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      subOsc.frequency.setValueAtTime(freq * 2, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      subOsc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      subOsc.start(now);
      osc.stop(now + duration + 0.05);
      subOsc.stop(now + duration + 0.05);
    };

    playPluck(notes[0], 3.0, 0.038);
    setTimeout(() => playPluck(notes[2], 2.8, 0.032), 140);
    setTimeout(() => playPluck(notes[3], 2.8, 0.032), 280);
    setTimeout(() => playPluck(notes[5], 3.2, 0.038), 420);

    clearInterval(soundLoopTimer);
    soundLoopTimer = setInterval(() => {
      if (!isPlayingSound) return;
      const noteIndex = pattern[step % pattern.length];
      playPluck(notes[noteIndex], 2.6, 0.03);
      step++;
    }, 950);
  } catch {
    // Ignore audio context restrictions
  }
}

function stopAmbientMusic() {
  isPlayingSound = false;
  clearInterval(soundLoopTimer);
}

/* ============================================================================
   4. AMBIENT FLOATING PETALS & GOLDEN LIGHT MOTES OVER COURTYARD
   ============================================================================ */
function initAmbientPetals() {
  const canvas = document.getElementById('ambient-petals-canvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = canvas.offsetWidth || 460);
  let height = (canvas.height = canvas.offsetHeight || 840);

  window.addEventListener(
    'resize',
    () => {
      width = canvas.width = canvas.offsetWidth || 460;
      height = canvas.height = canvas.offsetHeight || 840;
    },
    { passive: true }
  );

  const particles = Array.from({ length: 16 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: 2 + Math.random() * 3.2,
    vx: -0.2 + Math.random() * 0.4,
    vy: 0.22 + Math.random() * 0.38,
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.012,
    alpha: 0.24 + Math.random() * 0.4,
    isPetal: Math.random() > 0.45,
  }));

  function renderFrame() {
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      p.x += p.vx + Math.sin(p.angle) * 0.15;
      p.y += p.vy;
      p.angle += p.spin;

      if (p.y > height + 12) {
        p.y = -10;
        p.x = Math.random() * width;
      }
      if (p.x < -12) p.x = width + 10;
      if (p.x > width + 12) p.x = -10;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.globalAlpha = p.alpha;

      if (p.isPetal) {
        ctx.fillStyle = '#f6dfda';
        ctx.beginPath();
        ctx.ellipse(0, 0, p.r * 1.35, p.r * 0.82, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#e8cf96';
        ctx.beginPath();
        ctx.arc(0, 0, p.r * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    requestAnimationFrame(renderFrame);
  }

  requestAnimationFrame(renderFrame);
}

/* ============================================================================
   5. ULTRA-SMOOTH CONTINUOUS BEZIER SCRATCH-OFF HEART
      - Conceals the wedding date completely before the user scratches
      - Uses continuous quadratic curve interpolation for silky finger scratching
      - Uses a 60fps canvas particle emitter for zero-GC sparkle dust
   ============================================================================ */
function initScratchHeart() {
  const canvas = document.getElementById('scratch-heart-canvas');
  const revealedBox = document.getElementById('heart-revealed-content');
  const progressLabel = document.getElementById('scratch-progress-label');
  const gcalQuickLinks = document.getElementById('gcal-quick-links');
  const particlesCanvas = document.getElementById('scratch-particles-canvas');

  if (!canvas) return;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const width = canvas.width;
  const height = canvas.height;

  const pCtx = particlesCanvas ? particlesCanvas.getContext('2d') : null;
  const dustParticles = [];
  let dustRafId = null;

  let isDrawing = false;
  let isRevealed = false;
  let hasUnconcealedText = false;
  let lastPt = null;
  let moveCounter = 0;

  // Paint opaque metallic gold foil with NO date spoilers
  function paintGoldFoilSurface() {
    ctx.globalCompositeOperation = 'source-over';

    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#be954b');
    grad.addColorStop(0.24, '#f3e1b2');
    grad.addColorStop(0.5, '#b3883e');
    grad.addColorStop(0.76, '#f8e9c2');
    grad.addColorStop(1, '#8b6523');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle Diagonal Metallic Sheen Lines
    ctx.strokeStyle = 'rgba(255, 253, 244, 0.24)';
    ctx.lineWidth = 1;
    for (let i = -height; i < width + height; i += 12) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i - height, height);
      ctx.stroke();
    }

    // Concentric Ornamental Mandala Rings on the Foil
    ctx.strokeStyle = 'rgba(90, 64, 21, 0.32)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2 - 12, 76, 0, Math.PI * 2);
    ctx.stroke();

    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.arc(width / 2, height / 2 - 12, 66, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Non-spoiler invitation prompt inside the foil heart
    ctx.fillStyle = '#4a3410';
    ctx.font = '600 13.5px "Cinzel", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨ SCRATCH HERE ✨', width / 2, height / 2 - 14);

    ctx.font = 'italic 17px "Cormorant Garamond", Georgia, serif';
    ctx.fillText('to reveal our wedding date', width / 2, height / 2 + 10);
  }

  paintGoldFoilSurface();

  // 60fps Canvas Gold Dust Particle Loop
  function emitGoldDust(x, y, count = 4) {
    if (!pCtx) return;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.6 + Math.random() * 2.2;
      dustParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.8,
        r: 1.8 + Math.random() * 2.4,
        alpha: 1,
        color: Math.random() > 0.4 ? '#fffdf2' : '#e6c373',
      });
    }
    if (!dustRafId) {
      dustRafId = requestAnimationFrame(stepGoldDust);
    }
  }

  function stepGoldDust() {
    if (!pCtx || !particlesCanvas) return;
    pCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);

    for (let i = dustParticles.length - 1; i >= 0; i--) {
      const p = dustParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.04; // gentle gravity
      p.alpha -= 0.028;

      if (p.alpha <= 0) {
        dustParticles.splice(i, 1);
        continue;
      }

      pCtx.save();
      pCtx.globalAlpha = p.alpha;
      pCtx.fillStyle = p.color;
      pCtx.shadowColor = '#d4af37';
      pCtx.shadowBlur = 6;
      pCtx.beginPath();
      pCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      pCtx.fill();
      pCtx.restore();
    }

    if (dustParticles.length > 0) {
      dustRafId = requestAnimationFrame(stepGoldDust);
    } else {
      dustRafId = null;
    }
  }

  function getCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function scratchSegment(pt) {
    if (isRevealed) return;

    // Unconceal the underlying wedding date only once the user starts scratching
    if (!hasUnconcealedText && revealedBox) {
      hasUnconcealedText = true;
      revealedBox.classList.remove('is-concealed');
    }

    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 44;
    ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
    ctx.shadowColor = 'rgba(0, 0, 0, 1)';
    ctx.shadowBlur = 8;

    ctx.beginPath();
    if (!lastPt) {
      ctx.arc(pt.x, pt.y, 22, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const midX = (lastPt.x + pt.x) * 0.5;
      const midY = (lastPt.y + pt.y) * 0.5;
      ctx.moveTo(lastPt.x, lastPt.y);
      ctx.quadraticCurveTo(lastPt.x, lastPt.y, midX, midY);
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
    }
    ctx.restore();

    lastPt = pt;
    moveCounter++;

    if (moveCounter % 2 === 0) {
      emitGoldDust(pt.x + 10, pt.y + 10, 3);
    }
    if (moveCounter % 8 === 0) {
      checkScratchCompletion();
    }
  }

  function checkScratchCompletion() {
    if (isRevealed) return;
    const sampleW = 170;
    const sampleH = 160;
    const data = ctx.getImageData(65, 38, sampleW, sampleH).data;
    let cleared = 0;
    const total = sampleW * sampleH;

    for (let i = 3; i < data.length; i += 16) {
      if (data[i] < 128) cleared++;
    }

    const ratio = cleared / (total / 4);
    if (ratio >= 0.38) {
      completeReveal();
    } else if (progressLabel && ratio > 0.06) {
      const pct = Math.min(99, Math.round((ratio / 0.38) * 100));
      progressLabel.textContent = `✨ Keep scratching... (${pct}% revealed)`;
    }
  }

  function completeReveal() {
    if (isRevealed) return;
    isRevealed = true;
    if (revealedBox) revealedBox.classList.remove('is-concealed');
    canvas.classList.add('is-cleared');
    if (progressLabel) {
      progressLabel.textContent = '🎉 January 2, 2027 • Click below to Save the Date!';
    }
    if (gcalQuickLinks) {
      gcalQuickLinks.hidden = false;
    }
    // Celebratory sparkle burst across the heart
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        emitGoldDust(80 + Math.random() * 160, 60 + Math.random() * 140, 8);
      }, i * 60);
    }
  }

  canvas.addEventListener('pointerdown', (e) => {
    if (isRevealed) return;
    isDrawing = true;
    canvas.setPointerCapture(e.pointerId);
    const pt = getCoords(e);
    lastPt = pt;
    scratchSegment(pt);
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!isDrawing || isRevealed) return;
    // Use coalesced events when available for ultra-smooth 120Hz touch/stylus paths
    const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ev of events) {
      scratchSegment(getCoords(ev));
    }
  });

  const endScratch = () => {
    if (!isDrawing) return;
    isDrawing = false;
    lastPt = null;
    checkScratchCompletion();
  };

  canvas.addEventListener('pointerup', endScratch);
  canvas.addEventListener('pointercancel', endScratch);
}

/* ============================================================================
   6. ADD TO CALENDAR (.ICS MULTI-EVENT GENERATOR + GOOGLE CALENDAR LINKS)
   Adds both:
   - 1st Jan 2027: Haldi and Sangeet
   - 2nd Jan 2027: Wedding and Reception
   ============================================================================ */
function initCalendarActions() {
  const saveBtn = document.getElementById('save-to-calendar-btn');
  const gcalQuickLinks = document.getElementById('gcal-quick-links');
  const gcalDay1 = document.getElementById('gcal-day1-link');
  const gcalDay2 = document.getElementById('gcal-day2-link');

  const groom = document.getElementById('groom-name')?.textContent || WEDDING_CONFIG.groom.name;
  const bride = document.getElementById('bride-name')?.textContent || WEDDING_CONFIG.bride.name;
  const location = WEDDING_CONFIG.venue.address;

  if (gcalDay1) {
    const day1Params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `${groom} & ${bride} — Haldi and Sangeet`,
      dates: '20270101T053000Z/20270101T173000Z',
      details:
        'Friday, January 1, 2027:\n• Engagement (Sakharpuda): 11:00 AM\n• Haldi Ceremony: 4:00 PM\n• Tel (Oil) Ceremony: 7:00 PM\n• Sangeet Celebration',
      location,
    });
    gcalDay1.href = `https://calendar.google.com/calendar/render?${day1Params.toString()}`;
  }

  if (gcalDay2) {
    const day2Params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `${groom} & ${bride} — Wedding and Reception`,
      dates: '20270102T070200Z/20270102T163000Z',
      details: `Saturday, January 2, 2027:\n• Auspicious Wedding Ceremony at 12:32 PM\n• Followed by Wedding Reception\nVenue: ${location}`,
      location,
    });
    gcalDay2.href = `https://calendar.google.com/calendar/render?${day2Params.toString()}`;
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      if (gcalQuickLinks) gcalQuickLinks.hidden = false;

      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Traditional Indian Wedding Invitation//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        'UID:wedding-day1-20270101@weddinginvitation',
        'DTSTAMP:20261115T000000Z',
        'DTSTART:20270101T053000Z',
        'DTEND:20270101T173000Z',
        `SUMMARY:${groom} & ${bride} — Haldi and Sangeet`,
        'DESCRIPTION:Friday\\, January 1\\, 2027 Ceremony Schedule:\\n- Engagement (Sakharpuda): 11:00 AM\\n- Haldi Ceremony: 4:00 PM\\n- Tel (Oil) Ceremony: 7:00 PM\\n- Sangeet Celebration',
        `LOCATION:${location.replace(/,/g, '\\,')}`,
        'BEGIN:VALARM',
        'TRIGGER:-PT12H',
        'ACTION:DISPLAY',
        'DESCRIPTION:Reminder: Haldi and Sangeet Today!',
        'END:VALARM',
        'END:VEVENT',
        'BEGIN:VEVENT',
        'UID:wedding-day2-20270102@weddinginvitation',
        'DTSTAMP:20261115T000000Z',
        'DTSTART:20270102T070200Z',
        'DTEND:20270102T163000Z',
        `SUMMARY:${groom} & ${bride} — Wedding and Reception`,
        'DESCRIPTION:Saturday\\, January 2\\, 2027:\\n- Auspicious Wedding Ceremony: 12:32 PM\\n- Followed by Wedding Reception',
        `LOCATION:${location.replace(/,/g, '\\,')}`,
        'BEGIN:VALARM',
        'TRIGGER:-PT3H',
        'ACTION:DISPLAY',
        'DESCRIPTION:Reminder: Auspicious Wedding at 12:32 PM!',
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${groom}-${bride}-Wedding.ics`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    });
  }
}

/* ============================================================================
   7. LIVE COUNTDOWN TIMER TO SATURDAY, JANUARY 2, 2027 • 12:32 PM IST
   ============================================================================ */
function initCountdownTimer() {
  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl = document.getElementById('cd-minutes');
  const secsEl = document.getElementById('cd-seconds');

  if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

  const targetTime = new Date(WEDDING_CONFIG.weddingTargetISO).getTime();

  function updateClock() {
    const now = Date.now();
    const diff = Math.max(0, targetTime - now);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minsEl.textContent = String(minutes).padStart(2, '0');
    secsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateClock();
  setInterval(updateClock, 1000);
}

/* ============================================================================
   8. SCROLL-DRIVEN ANIMATIONS FALLBACK (Per modern-web-guidance)
   ============================================================================ */
function initScrollRevealFallback() {
  if (
    !CSS.supports('(animation-timeline: view()) and (animation-range: entry)') &&
    window.matchMedia('(prefers-reduced-motion: no-preference)').matches
  ) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const ratio = Math.min(1, entry.intersectionRatio / 0.35);
          entry.target.style.opacity = String(0.25 + ratio * 0.75);
          entry.target.style.transform = `translate3d(0, ${(1 - ratio) * 22}px, 0)`;
        }
      },
      {
        threshold: Array.from({ length: 21 }, (_, i) => i / 20),
      }
    );

    document.querySelectorAll('.scroll-reveal-section').forEach((el) => {
      observer.observe(el);
    });
  }
}

/* ============================================================================
   9. RSVP FORM WITH GOOGLE SHEETS PRE-FILL & ANYTIME MODIFICATION
      - Single "Veg only" reversible checkbox
      - All fields optional
      - Auto-prefills saved RSVP from Google Sheets / local storage
   ============================================================================ */
const STORAGE_KEY_LAST = 'wedding_rsvp_last_guest_v1';
const STORAGE_KEY_BY_NAME = 'wedding_rsvp_records_by_name_v1';

function normalizeGuestKey(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function getLocalRsvpStore() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_BY_NAME) || '{}');
  } catch {
    return {};
  }
}

function saveLocalRsvpRecord(payload) {
  try {
    localStorage.setItem(STORAGE_KEY_LAST, JSON.stringify(payload));
    const key = normalizeGuestKey(payload.name);
    if (key) {
      const store = getLocalRsvpStore();
      store[key] = payload;
      localStorage.setItem(STORAGE_KEY_BY_NAME, JSON.stringify(store));
    }
  } catch {
    // Ignore storage quota errors
  }
}

function initRsvpForm() {
  const form = document.getElementById('rsvp-form');
  const nameInput = document.getElementById('rsvp-name');
  const guestsInput = document.getElementById('rsvp-guests');
  const vegCheckbox = document.getElementById('food-veg');
  const decBtn = document.getElementById('guest-dec-btn');
  const incBtn = document.getElementById('guest-inc-btn');
  const customArrivalInput = document.getElementById('rsvp-custom-arrival');
  const submitBtn = document.getElementById('rsvp-submit-btn');
  const submitText = document.getElementById('rsvp-submit-text');
  const statusMsg = document.getElementById('rsvp-status-msg');

  if (!form) return;

  // Allow clicking an already-checked radio button (Arrival Plan) to uncheck it
  let lastCheckedRadio = null;
  form.querySelectorAll('input[type="radio"]').forEach((radio) => {
    radio.addEventListener('pointerdown', () => {
      lastCheckedRadio = radio.checked ? radio : null;
    });
    radio.addEventListener('click', () => {
      if (lastCheckedRadio === radio) {
        radio.checked = false;
        lastCheckedRadio = null;
      }
    });
  });

  if (decBtn && guestsInput) {
    decBtn.addEventListener('click', () => {
      const current = parseInt(guestsInput.value, 10) || 1;
      guestsInput.value = String(Math.max(1, current - 1));
    });
  }
  if (incBtn && guestsInput) {
    incBtn.addEventListener('click', () => {
      const current = parseInt(guestsInput.value, 10) || 0;
      guestsInput.value = String(Math.min(10, current + 1));
    });
  }

  function populateFormWithRecord(record) {
    if (!record) return;
    if (nameInput && record.name && !nameInput.value) {
      nameInput.value = record.name;
    }
    if (guestsInput && record.guestCount !== undefined && record.guestCount !== '') {
      guestsInput.value = record.guestCount;
    }
    if (vegCheckbox && record.foodPreference !== undefined) {
      vegCheckbox.checked =
        record.foodPreference === 'Vegetarian Only' || record.foodPreference === 'Veg only';
    }
    if (record.arrivalPlan !== undefined) {
      form.querySelectorAll('input[name="arrivalPlan"]').forEach((r) => {
        r.checked = r.value === record.arrivalPlan;
      });
    }
    if (customArrivalInput && record.arrivalNote !== undefined) {
      customArrivalInput.value = record.arrivalNote;
    }
  }

  async function lookupExistingRsvpByName(rawName) {
    const key = normalizeGuestKey(rawName);
    if (!key) return null;

    if (WEDDING_CONFIG.googleSheetWebAppUrl) {
      try {
        const url = new URL(WEDDING_CONFIG.googleSheetWebAppUrl);
        url.searchParams.set('action', 'lookup');
        url.searchParams.set('name', rawName.trim());
        const res = await fetch(url.toString(), { method: 'GET' });
        if (res.ok) {
          const data = await res.json();
          if (data && data.found && data.record) {
            saveLocalRsvpRecord(data.record);
            return data.record;
          }
        }
      } catch {
        // Fall through to local store
      }
    }

    const store = getLocalRsvpStore();
    return store[key] || null;
  }

  (async () => {
    const params = new URLSearchParams(window.location.search);
    const urlGuestName = params.get('guest') || params.get('name');

    if (urlGuestName) {
      if (nameInput) nameInput.value = urlGuestName;
      const found = await lookupExistingRsvpByName(urlGuestName);
      if (found) {
        populateFormWithRecord(found, true);
        return;
      }
    }

    try {
      const lastSaved = JSON.parse(localStorage.getItem(STORAGE_KEY_LAST) || 'null');
      if (lastSaved) {
        populateFormWithRecord(lastSaved, true);
        if (lastSaved.name && WEDDING_CONFIG.googleSheetWebAppUrl) {
          const cloudRecord = await lookupExistingRsvpByName(lastSaved.name);
          if (cloudRecord) populateFormWithRecord(cloudRecord, true);
        }
      }
    } catch {
      // Ignore parse errors
    }
  })();

  let lookupDebounceTimer = null;
  if (nameInput) {
    nameInput.addEventListener('input', () => {
      clearTimeout(lookupDebounceTimer);
      const val = nameInput.value.trim();
      if (val.length < 2) return;

      lookupDebounceTimer = setTimeout(async () => {
        const record = await lookupExistingRsvpByName(val);
        if (record) {
          populateFormWithRecord(record, true);
        }
      }, 400);
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submitBtn) submitBtn.disabled = true;
    if (statusMsg) statusMsg.textContent = 'Saving your RSVP...';

    const formData = new FormData(form);
    const rawGuests = parseInt((formData.get('guestCount') || '').toString().trim(), 10);
    const validGuestCount =
      !Number.isNaN(rawGuests) && rawGuests >= 1
        ? String(Math.min(10, Math.max(1, rawGuests)))
        : '';

    const payload = {
      name: (formData.get('name') || '').toString().trim(),
      guestCount: validGuestCount,
      foodPreference: vegCheckbox && vegCheckbox.checked ? 'Vegetarian Only' : '',
      arrivalPlan: (formData.get('arrivalPlan') || '').toString(),
      arrivalNote: (formData.get('arrivalNote') || '').toString().trim(),
      updatedAt: new Date().toISOString(),
    };

    saveLocalRsvpRecord(payload);

    // 1. Submit directly to the linked Google Form (https://forms.gle/58w74jZkjKkoE8yv7)
    if (WEDDING_CONFIG.googleFormActionUrl && WEDDING_CONFIG.googleFormEntries) {
      try {
        const entries = WEDDING_CONFIG.googleFormEntries;
        const formParams = new URLSearchParams();

        if (payload.name) {
          formParams.append(entries.name, payload.name);
        }
        if (payload.guestCount) {
          formParams.append(entries.guestCount, payload.guestCount);
        }
        if (payload.foodPreference === 'Vegetarian Only') {
          formParams.append(entries.foodPreference, 'Vegetarian Only');
        }
        if (
          payload.arrivalPlan === 'Arriving on the wedding day' ||
          payload.arrivalPlan === 'Arriving one day prior' ||
          payload.arrivalPlan === 'Arriving two or more days prior'
        ) {
          formParams.append(entries.arrivalPlan, payload.arrivalPlan);
        }
        if (payload.arrivalNote) {
          formParams.append(entries.arrivalNote, payload.arrivalNote);
        }

        await fetch(WEDDING_CONFIG.googleFormActionUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          },
          body: formParams.toString(),
        });
      } catch {
        // Saved locally even if network hiccups
      }
    }

    // 2. Optional Apps Script Web App fallback if configured
    if (WEDDING_CONFIG.googleSheetWebAppUrl) {
      try {
        await fetch(WEDDING_CONFIG.googleSheetWebAppUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
        });
      } catch {
        // Saved locally even if network hiccups
      }
    }

    if (submitBtn) submitBtn.disabled = false;
    if (statusMsg) {
      statusMsg.textContent = '✨ Thank you! Your RSVP has been saved.';
    }
  });
}
