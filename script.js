// ── State ──────────────────────────────────────────────────────────────────
const cards = Array.from(document.querySelectorAll('.card'));
const dotsContainer = document.getElementById('dots');
const hint = document.getElementById('hint');
let activeIndex = 0;
let touchStartX = 0;
let hintTimer;

// ── Wrap each card's content in a .card-inner div ──────────────────────────
// This separates carousel translation (on .card) from flip rotation (on .card-inner)
cards.forEach(card => {
    const inner = document.createElement('div');
    inner.className = 'card-inner';
    while (card.firstChild) inner.appendChild(card.firstChild);
    card.appendChild(inner);
});

// ── Dot indicators ─────────────────────────────────────────────────────────
cards.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dotsContainer.appendChild(dot);
});

function updateDots() {
    document.querySelectorAll('.dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === activeIndex);
    });
}

// ── Position layout ────────────────────────────────────────────────────────
function getPositions() {
    const isMobile = window.innerWidth <= 768;
    const sideOffset = isMobile ? window.innerWidth * 0.95 : 560;

    return {
        center: { x: 0,            y: 0,   rotate: 0,   scale: 1,    opacity: 1,   z: 50  },
        right:  { x: sideOffset,   y: 120, rotate: 12,  scale: 0.84, opacity: 0.7, z: 0   },
        left:   { x: -sideOffset,  y: 120, rotate: -12, scale: 0.84, opacity: 0.7, z: 0   },
        hidden: { x: 0,            y: 600, rotate: 0,   scale: 0.7,  opacity: 0,   z: -50 }
    };
}

function applyPosition(card, pos, isCenter) {
    card.style.transform = `
        translate(-50%, -50%)
        translate3d(${pos.x}px, ${pos.y}px, ${pos.z}px)
        rotate(${pos.rotate}deg)
        scale(${pos.scale})
    `;
    card.style.opacity = pos.opacity;
    card.style.zIndex = isCenter ? 100 : 1;
}

// ── Render carousel positions ──────────────────────────────────────────────
function updateCards() {
    const positions = getPositions();
    const n = cards.length;

    cards.forEach((card, i) => {
        const offset = (i - activeIndex + n) % n;
        const isCenter = offset === 0;
        const isRight = offset === 1;
        const isLeft = offset === n - 1;

        const pos = isCenter ? positions.center
                  : isRight  ? positions.right
                  : isLeft   ? positions.left
                  : positions.hidden;

        applyPosition(card, pos, isCenter);

        if (!isCenter) card.classList.remove('flipped');
        card.classList.toggle('active', isCenter);
    });

    updateDots();
}

// ── Navigation ─────────────────────────────────────────────────────────────
function rotateCarousel(direction) {
    activeIndex = (activeIndex + direction + cards.length) % cards.length;
    updateCards();
    hideHint();
}

function hideHint() {
    clearTimeout(hintTimer);
    hint.classList.add('hidden');
}

// ── Event: card click ──────────────────────────────────────────────────────
cards.forEach((card, i) => {
    card.addEventListener('click', () => {
        if (card.classList.contains('active')) {
            card.classList.toggle('flipped');
            hideHint();
        } else {
            // Move toward the clicked card (shortest path)
            const offset = (i - activeIndex + cards.length) % cards.length;
            rotateCarousel(offset <= cards.length / 2 ? 1 : -1);
        }
    });
});

// ── Event: nav buttons ─────────────────────────────────────────────────────
document.getElementById('btn-prev').addEventListener('click', () => rotateCarousel(-1));
document.getElementById('btn-next').addEventListener('click', () => rotateCarousel(1));

// ── Event: keyboard ────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  rotateCarousel(-1);
    if (e.key === 'ArrowRight') rotateCarousel(1);
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter') {
        const active = document.querySelector('.card.active');
        if (active) { active.classList.toggle('flipped'); hideHint(); }
    }
    if (e.key === 'Escape') {
        const active = document.querySelector('.card.active');
        if (active) active.classList.remove('flipped');
    }
});

// ── Event: touch swipe ─────────────────────────────────────────────────────
document.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
}, { passive: true });

document.addEventListener('touchend', e => {
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 50) rotateCarousel(delta > 0 ? -1 : 1);
});

// ── Event: resize ──────────────────────────────────────────────────────────
window.addEventListener('resize', updateCards);

// ── Init ───────────────────────────────────────────────────────────────────
updateCards();

// Hide hint after 5 seconds
hintTimer = setTimeout(hideHint, 5000);
