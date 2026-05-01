$(function () {
  const targets = $('.fade-up');

  $(window).on('scroll', function () {
    targets.each(function () {
      const rect = $(this).offset().top;
      const trigger = $(window).height() * 0.8;

      if ($(window).scrollTop() > rect - trigger) {
        $(this).addClass('show');
      }
    });
  });

  $(window).trigger('scroll');

  // =========================
  // ハンバーガーメニュー
  // =========================
  const btn = $('#menubtn');
  const header = $('.header');
  const navLink = $('.header-nav a');

  btn.on('click', function () {
    header.toggleClass('open');
  });

  navLink.on('click', function () {
    header.removeClass('open');
  });

  // =========================
  // タイピング
  // =========================
  const text = "design that stays with you.";
  const target = document.querySelector('.typing');

  if (target) {
    let i = 0;

    function type() {
      if (i < text.length) {
        target.textContent += text[i];
        i++;
        setTimeout(type, 80);
      }
    }

    type();
  }

  // =========================
  // オーブアニメーション
  // =========================
  const canvas = document.getElementById('orbCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let orbs = [];
  let particles = [];
  let fadeOrbs = [];

  function resizeCanvas() {
    const fv = document.querySelector('.fv');

    if (fv) {
      canvas.width = fv.offsetWidth;
      canvas.height = fv.offsetHeight;
    } else {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }

  resizeCanvas();
  $(window).on('resize', resizeCanvas);

  // =========================
  // オーブ生成
  // =========================
  function createOrb(x, y) {
    return {
      x: x ?? Math.random() * canvas.width,
      y: y ?? Math.random() * canvas.height,
      r: Math.random() * 18 + 16,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      color: `hsl(${Math.random() * 360}, 60%, 85%)`
    };
  }

  for (let i = 0; i < 10; i++) {
    orbs.push(createOrb());
  }

  // =========================
  // 衝突時の星粒
  // =========================
  function createExplosion(x, y, baseColor) {
    const particleCount = 6;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 0.8 + 0.2;

      particles.push({
        x,
        y,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        r: Math.random() * 2 + 1.5,
        alpha: 1,
        decay: Math.random() * 0.04 + 0.03,
        color: baseColor,
        flash: true
      });
    }
  }

  // =========================
  // ふわっと消える残像オーブ
  // =========================
  function createFadeOrb(x, y, r, color) {
    fadeOrbs.push({
      x: x,
      y: y,
      r: r,
      alpha: 0.18,
      scale: 1,
      color: color
    });
  }

  // =========================
  // 描画
  // =========================
  function drawOrb(o) {
    ctx.save();
    ctx.globalAlpha = 0.22;

    ctx.beginPath();
    ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
    ctx.fillStyle = o.color;
    ctx.fill();

    ctx.restore();
  }

  function drawFadeOrb(o) {
    ctx.save();
    ctx.globalAlpha = o.alpha;

    ctx.beginPath();
    ctx.arc(o.x, o.y, o.r * o.scale, 0, Math.PI * 2);
    ctx.fillStyle = o.color;
    ctx.fill();

    ctx.restore();
  }

  function drawParticle(p) {
    ctx.save();

    let alpha = p.alpha;
    if (p.flash) {
      alpha = Math.min(1, p.alpha * 1.8);
      p.flash = false;
    }

    ctx.globalAlpha = alpha;

    // 中心の光
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // 十字の光
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(p.x - p.r * 2, p.y);
    ctx.lineTo(p.x + p.r * 2, p.y);
    ctx.moveTo(p.x, p.y - p.r * 2);
    ctx.lineTo(p.x, p.y + p.r * 2);
    ctx.stroke();

    ctx.restore();
  }

  // =========================
  // 更新
  // =========================
  function updateOrbs() {
    orbs.forEach(o => {
      o.x += o.dx;
      o.y += o.dy;

      if (o.x - o.r < 0) {
        o.x = o.r;
        o.dx *= -1;
      } else if (o.x + o.r > canvas.width) {
        o.x = canvas.width - o.r;
        o.dx *= -1;
      }

      if (o.y - o.r < 0) {
        o.y = o.r;
        o.dy *= -1;
      } else if (o.y + o.r > canvas.height) {
        o.y = canvas.height - o.r;
        o.dy *= -1;
      }
    });
  }

  function handleCollisions() {
    const removeSet = new Set();

    for (let i = 0; i < orbs.length; i++) {
      for (let j = i + 1; j < orbs.length; j++) {
        if (removeSet.has(i) || removeSet.has(j)) continue;

        const dx = orbs[i].x - orbs[j].x;
        const dy = orbs[i].y - orbs[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < orbs[i].r + orbs[j].r) {
          const hitX = (orbs[i].x + orbs[j].x) / 2;
          const hitY = (orbs[i].y + orbs[j].y) / 2;

          // 残像オーブを作る
          createFadeOrb(orbs[i].x, orbs[i].y, orbs[i].r, orbs[i].color);
          createFadeOrb(orbs[j].x, orbs[j].y, orbs[j].r, orbs[j].color);

          // 星粒を少し出す
          createExplosion(hitX, hitY, orbs[i].color);

          removeSet.add(i);
          removeSet.add(j);
        }
      }
    }

    if (removeSet.size > 0) {
      orbs = orbs.filter((_, index) => !removeSet.has(index));

      while (orbs.length < 10) {
        orbs.push(createOrb());
      }
    }
  }

  function updateParticles() {
    particles = particles.filter(p => {
      p.x += p.dx;
      p.y += p.dy;
      p.alpha -= p.decay;
      p.r *= 0.97;

      return p.alpha > 0.03 && p.r > 0.3;
    });
  }

  function updateFadeOrbs() {
    fadeOrbs = fadeOrbs.filter(o => {
      o.alpha -= 0.008;
      o.scale += 0.004;

      return o.alpha > 0;
    });
  }

  // =========================
  // アニメーションループ
  // =========================
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateOrbs();
    handleCollisions();
    updateParticles();
    updateFadeOrbs();

    fadeOrbs.forEach(drawFadeOrb);
    orbs.forEach(drawOrb);
    particles.forEach(drawParticle);

    requestAnimationFrame(draw);
  }

  draw();
});