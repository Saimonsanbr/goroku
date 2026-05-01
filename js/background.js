// Animação de fundo: bolhas flutuantes

export function initBackground() {
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let W, H;
    const bubbles = [];

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function initBubbles() {
        bubbles.length = 0;
        const count = Math.min(15, Math.floor(W / 100));
        for (let i = 0; i < count; i++) {
            bubbles.push({
                x: Math.random() * W,
                y: Math.random() * H,
                r: 20 + Math.random() * 60,
                speed: 0.2 + Math.random() * 0.5,
                phase: Math.random() * Math.PI * 2,
                swing: 0.1 + Math.random() * 0.3,
                color: Math.random() > 0.5
                    ? 'rgba(255, 126, 179, 0.08)'
                    : 'rgba(56, 189, 248, 0.08)'
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);
        for (const b of bubbles) {
            b.y -= b.speed;
            b.x += Math.sin(b.y * 0.02 + b.phase) * b.swing;
            if (b.y < -b.r) {
                b.y = H + b.r;
                b.x = Math.random() * W;
            }
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fillStyle = b.color;
            ctx.fill();
        }
        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', () => { resize(); initBubbles(); });
    resize();
    initBubbles();
    requestAnimationFrame(draw);
}