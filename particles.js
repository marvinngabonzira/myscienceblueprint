/* ============================================================
   TSB PARTICLE NETWORK — Neural Node Canvas Animation
   ============================================================ */

class ParticleNetwork {
  constructor(canvasId) {
    this.canvas  = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx     = this.canvas.getContext('2d');

    this.COUNT   = 65;
    this.CONNECT = 130;
    this.REPEL   = 90;
    this.SPEED   = 0.28;

    this.mouse = { x: -9999, y: -9999 };
    this.particles = [];
    this.raf = null;

    this.resize();
    this.init();
    this.bindEvents();
    this.animate();
  }

  resize() {
    this.W = this.canvas.width  = this.canvas.offsetWidth;
    this.H = this.canvas.height = this.canvas.offsetHeight;
  }

  init() {
    this.particles = Array.from({ length: this.COUNT }, () => ({
      x:  Math.random() * this.W,
      y:  Math.random() * this.H,
      vx: (Math.random() - 0.5) * this.SPEED,
      vy: (Math.random() - 0.5) * this.SPEED,
      r:  Math.random() * 1.2 + 0.6,
      a:  Math.random() * 0.45 + 0.15,
    }));
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.init();
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.x = -9999;
      this.mouse.y = -9999;
    });
  }

  update() {
    for (const p of this.particles) {
      const dx = p.x - this.mouse.x;
      const dy = p.y - this.mouse.y;
      const d  = Math.hypot(dx, dy);

      if (d < this.REPEL && d > 0) {
        const f = (this.REPEL - d) / this.REPEL;
        p.vx += (dx / d) * f * 0.45;
        p.vy += (dy / d) * f * 0.45;
      }

      // Damping & speed cap
      p.vx *= 0.988;
      p.vy *= 0.988;
      const spd = Math.hypot(p.vx, p.vy);
      if (spd > this.SPEED * 4) {
        p.vx = (p.vx / spd) * this.SPEED * 4;
        p.vy = (p.vy / spd) * this.SPEED * 4;
      }

      p.x += p.vx;
      p.y += p.vy;

      // Wrap edges
      if (p.x < 0)      p.x = this.W;
      if (p.x > this.W) p.x = 0;
      if (p.y < 0)      p.y = this.H;
      if (p.y > this.H) p.y = 0;
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.W, this.H);

    // Connections
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const a = this.particles[i];
        const b = this.particles[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < this.CONNECT) {
          const alpha = (1 - d / this.CONNECT) * 0.28;
          this.ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
          this.ctx.lineWidth = 0.6;
          this.ctx.beginPath();
          this.ctx.moveTo(a.x, a.y);
          this.ctx.lineTo(b.x, b.y);
          this.ctx.stroke();
        }
      }
    }

    // Nodes
    for (const p of this.particles) {
      this.ctx.fillStyle = `rgba(0, 212, 255, ${p.a})`;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  animate() {
    this.update();
    this.draw();
    this.raf = requestAnimationFrame(() => this.animate());
  }

  destroy() {
    if (this.raf) cancelAnimationFrame(this.raf);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('particles-canvas')) {
    window._tsb_particles = new ParticleNetwork('particles-canvas');
  }
});
