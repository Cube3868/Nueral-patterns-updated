  (() => {
    'use strict';
    const MODEL = JSON.parse(atob(window.MODEL_B64));
    const TARGET_URI = MODEL.targetUri;

    const STATIC_MODE = new URLSearchParams(location.search).has('static');

    const W = MODEL.width, H = MODEL.height, C = MODEL.channels, HC = MODEL.hidden;
    const N = W * H;
    const decodeF32 = b64 => { const raw = atob(b64), bytes = new Uint8Array(raw.length); for (let i=0;i<raw.length;i++) bytes[i]=raw.charCodeAt(i); return new Float32Array(bytes.buffer); };
    const w1 = decodeF32(MODEL.w1), b1 = decodeF32(MODEL.b1);
    const w2 = decodeF32(MODEL.w2), b2 = decodeF32(MODEL.b2);
    let state = new Float32Array(N * C);
    let next = new Float32Array(N * C);
    const perception = new Float32Array(C * 3);
    const hidden = new Float32Array(HC);
    const preAlive = new Uint8Array(N);
    const fireMask = new Uint8Array(N);

    const canvas = document.getElementById('view');
    const ctx = canvas.getContext('2d', { alpha: false });
    const tiny = document.createElement('canvas');
    tiny.width = W; tiny.height = H;
    const tinyCtx = tiny.getContext('2d', { alpha: false });
    const pixels = tinyCtx.createImageData(W, H);
    const targetImage = new Image();
    targetImage.src = TARGET_URI;

    let playing = true;
    let steps = 0;
    let lastAutoDamage = 0;
    let dragging = false;
    let lastFrame = performance.now();
    let smoothedFps = 0;

    const el = id => document.getElementById(id);
    const clamp01 = x => x < 0 ? 0 : x > 1 ? 1 : x;
    const sigmoidColor = x => 1 / (1 + Math.exp(-x * 2));

    function reset() {
      state.fill(0);
      const center = ((H >> 1) * W + (W >> 1)) * C;
      for (let c = 3; c < C; c++) state[center + c] = 1;
      steps = 0;
      lastAutoDamage = 0;
      render();
    }

    function computeAlive(src, out) {
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          let alive = 0;
          for (let oy = -1; oy <= 1 && !alive; oy++) {
            const yy = y + oy;
            if (yy < 0 || yy >= H) continue;
            for (let ox = -1; ox <= 1; ox++) {
              const xx = x + ox;
              if (xx < 0 || xx >= W) continue;
              if (src[(yy * W + xx) * C + 3] > MODEL.aliveThreshold) { alive = 1; break; }
            }
          }
          out[y * W + x] = alive;
        }
      }
    }

    function cellValue(src, x, y, c) {
      if (x < 0 || x >= W || y < 0 || y >= H) return 0;
      return src[(y * W + x) * C + c];
    }

    function caStep() {
      computeAlive(state, preAlive);
      const rate = Number(el('fire').value) / 100;
      for (let i = 0; i < N; i++) fireMask[i] = Math.random() <= rate ? 1 : 0;

      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const cell = y * W + x;
          const base = cell * C;

          for (let c = 0; c < C; c++) {
            const tl = cellValue(state, x-1, y-1, c), tc = cellValue(state, x, y-1, c), tr = cellValue(state, x+1, y-1, c);
            const ml = cellValue(state, x-1, y, c), mr = cellValue(state, x+1, y, c);
            const bl = cellValue(state, x-1, y+1, c), bc = cellValue(state, x, y+1, c), br = cellValue(state, x+1, y+1, c);
            perception[c] = state[base + c];
            perception[C + c] = (-tl + tr - 2*ml + 2*mr - bl + br) * 0.125;
            perception[C*2 + c] = (-tl - 2*tc - tr + bl + 2*bc + br) * 0.125;
          }

          for (let h = 0; h < HC; h++) {
            let sum = b1[h];
            const row = h * C * 3;
            for (let p = 0; p < C * 3; p++) sum += w1[row + p] * perception[p];
            hidden[h] = sum > 0 ? sum : 0;
          }

          if (fireMask[cell]) {
            for (let c = 0; c < C; c++) {
              let delta = b2[c];
              const row = c * HC;
              for (let h = 0; h < HC; h++) delta += w2[row + h] * hidden[h];
              next[base + c] = state[base + c] + delta;
            }
          } else {
            for (let c = 0; c < C; c++) next[base + c] = state[base + c];
          }
        }
      }

      const postAlive = fireMask;
      computeAlive(next, postAlive);
      for (let cell = 0; cell < N; cell++) {
        if (!(preAlive[cell] && postAlive[cell])) {
          const base = cell * C;
          for (let c = 0; c < C; c++) next[base + c] = 0;
        }
      }
      const tmp = state; state = next; next = tmp;
      steps++;

      if (el('autoDamage').checked && steps - lastAutoDamage >= 350) {
        damageAt(4 + Math.random() * (W - 8), 4 + Math.random() * (H - 8), Number(el('radius').value));
        lastAutoDamage = steps;
      }
    }

    function damageAt(gx, gy, radius) {
      const r2 = radius * radius;
      for (let y = Math.max(0, Math.floor(gy-radius)); y <= Math.min(H-1, Math.ceil(gy+radius)); y++) {
        for (let x = Math.max(0, Math.floor(gx-radius)); x <= Math.min(W-1, Math.ceil(gx+radius)); x++) {
          const dx = x-gx, dy = y-gy;
          if (dx*dx + dy*dy <= r2) {
            const base = (y*W+x)*C;
            for (let c=0;c<C;c++) state[base+c]=0;
          }
        }
      }
      el('canvasWrap').classList.add('used');
      render();
    }

    function render() {
      const mode = el('viewMode').value;
      const data = pixels.data;
      for (let i = 0; i < N; i++) {
        const base = i * C, p = i * 4;
        if (mode === 'rgba') {
          const a = clamp01(state[base + 3]);
          data[p] = Math.round(clamp01(1 - a + state[base]) * 255);
          data[p+1] = Math.round(clamp01(1 - a + state[base+1]) * 255);
          data[p+2] = Math.round(clamp01(1 - a + state[base+2]) * 255);
        } else if (mode === 'alpha') {
          const a = Math.round(clamp01(state[base + 3]) * 255);
          data[p] = data[p+1] = data[p+2] = a;
        } else {
          const ch = Number(mode.split(':')[1]);
          const v = state[base + ch];
          const pos = sigmoidColor(v), neg = sigmoidColor(-v);
          data[p] = Math.round(pos * 255);
          data[p+1] = Math.round((1 - Math.min(1, Math.abs(v))) * 80);
          data[p+2] = Math.round(neg * 255);
        }
        data[p+3] = 255;
      }
      tinyCtx.putImageData(pixels, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.drawImage(tiny, 0, 0, canvas.width, canvas.height);
      if (el('ghost').checked && targetImage.complete) {
        ctx.save();
        ctx.globalAlpha = .22;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(targetImage, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      }
      el('stepsStat').textContent = steps.toLocaleString();
    }

    function loop(now) {
      const dt = Math.max(1, now - lastFrame);
      lastFrame = now;
      const fps = 1000 / dt;
      smoothedFps = smoothedFps ? smoothedFps * .9 + fps * .1 : fps;
      el('fpsStat').textContent = Math.round(smoothedFps);
      if (playing) {
        const amount = Number(el('speed').value);
        for (let i = 0; i < amount; i++) caStep();
        render();
      }
      requestAnimationFrame(loop);
    }

    function canvasPoint(event) {
      const rect = canvas.getBoundingClientRect();
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;
      return [(clientX-rect.left)/rect.width*W, (clientY-rect.top)/rect.height*H];
    }

    function woundEvent(e) {
      e.preventDefault();
      const [x,y] = canvasPoint(e);
      damageAt(x,y,Number(el('radius').value));
    }

    canvas.addEventListener('pointerdown', e => { dragging = true; canvas.setPointerCapture(e.pointerId); woundEvent(e); });
    canvas.addEventListener('pointermove', e => { if (dragging) woundEvent(e); });
    canvas.addEventListener('pointerup', () => dragging = false);
    canvas.addEventListener('pointercancel', () => dragging = false);

    el('play').addEventListener('click', () => {
      playing = !playing;
      el('play').textContent = playing ? 'Pause' : 'Play';
    });
    el('step').addEventListener('click', () => { caStep(); render(); });
    el('reset').addEventListener('click', reset);
    el('damage').addEventListener('click', () => damageAt(W*.58,H*.5,Number(el('radius').value)));
    el('burst').addEventListener('click', () => { for(let i=0;i<100;i++) caStep(); render(); });
    el('speed').addEventListener('input', e => el('speedOut').textContent = e.target.value);
    el('fire').addEventListener('input', e => el('fireOut').textContent = e.target.value + '%');
    el('radius').addEventListener('input', e => el('radiusOut').textContent = e.target.value + ' cells');
    el('viewMode').addEventListener('change', render);
    el('ghost').addEventListener('change', render);
    document.addEventListener('keydown', e => {
      if (e.target.matches('input,select,button')) return;
      if (e.code === 'Space') { e.preventDefault(); el('play').click(); }
      if (e.key.toLowerCase() === 'r') reset();
      if (e.key.toLowerCase() === 'd') el('damage').click();
    });

    el('gridStat').textContent = W + '×' + H;
    el('trainStat').textContent = (MODEL.metadata.trainingSteps || 0).toLocaleString() + ' steps';
    reset();
    if (STATIC_MODE) {
      for (let i = 0; i < 120; i++) caStep();
      render();
    } else {
      requestAnimationFrame(loop);
    }
  })();
