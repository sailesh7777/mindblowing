/* ============================================================
   Hero backdrop — programmatically generates:
     • Two starfields (far, near — near ones twinkle)
     • AI neural-network overlay (12 nodes + 12 dashed data-stream lines)
   Runs only if the corresponding SVG hosts are present on the page.
   ============================================================ */

(function () {
  "use strict";

  // ── Deterministic pseudo-random so layouts are stable across renders ─
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ── Star colours (cyan / violet / white — brand-keyed) ──────
  const STAR_COLORS = {
    cyan: "hsl(190 100% 78%)",
    violet: "hsl(268 100% 82%)",
    white: "hsl(0 0% 100%)",
  };

  function pickStarColor(r) {
    if (r < 0.2) return STAR_COLORS.cyan;
    if (r < 0.35) return STAR_COLORS.violet;
    return STAR_COLORS.white;
  }

  // ── Populate far starfield (dim, static) ────────────────────
  const farHost = document.querySelector("[data-far-stars]");
  if (farHost) {
    const rnd = mulberry32(7);
    const svgns = "http://www.w3.org/2000/svg";
    for (let i = 0; i < 80; i++) {
      const cx = rnd() * 100;
      const cy = rnd() * 100;
      const r = (0.6 + rnd() * 1.5) * 0.6;
      const c = pickStarColor(rnd());
      const el = document.createElementNS(svgns, "circle");
      el.setAttribute("cx", cx + "%");
      el.setAttribute("cy", cy + "%");
      el.setAttribute("r", String(r));
      el.setAttribute("fill", c);
      el.setAttribute("opacity", "0.35");
      farHost.appendChild(el);
    }
  }

  // ── Populate near starfield (brighter, twinkling) ───────────
  const nearHost = document.querySelector("[data-near-stars]");
  if (nearHost) {
    const rnd = mulberry32(42);
    const svgns = "http://www.w3.org/2000/svg";
    for (let i = 0; i < 30; i++) {
      const cx = rnd() * 100;
      const cy = rnd() * 100;
      const r = 0.6 + rnd() * 1.5;
      const c = pickStarColor(rnd());
      const delay = rnd() * 5;
      const duration = 3 + rnd() * 4;
      const el = document.createElementNS(svgns, "circle");
      el.setAttribute("cx", cx + "%");
      el.setAttribute("cy", cy + "%");
      el.setAttribute("r", String(r));
      el.setAttribute("fill", c);
      el.style.animation = `star-twinkle ${duration}s ease-in-out infinite`;
      el.style.animationDelay = delay + "s";
      el.style.transformOrigin = "center";
      nearHost.appendChild(el);
    }
  }

  // ── AI neural network — 12 nodes + 12 edges ─────────────────
  const netHost = document.querySelector("[data-ai-network]");
  if (netHost) {
    const svgns = "http://www.w3.org/2000/svg";
    // Nodes stay in outer gutters so lines don't cross the centred content
    const nodes = [
      { x:  8, y: 18, delay: 0   },
      { x: 14, y: 42, delay: 1.2 },
      { x:  6, y: 68, delay: 2.4 },
      { x: 18, y: 82, delay: 0.6 },
      { x: 12, y: 30, delay: 1.8 },
      { x: 92, y: 22, delay: 0.3 },
      { x: 86, y: 44, delay: 1.5 },
      { x: 94, y: 60, delay: 2.1 },
      { x: 88, y: 78, delay: 0.9 },
      { x: 82, y: 32, delay: 2.7 },
      { x: 78, y: 88, delay: 1.1 },
      { x: 20, y: 10, delay: 3.3 },
    ];
    const edges = [
      [0,1],[1,2],[2,3],[1,4],[0,4],[4,11],
      [5,6],[6,7],[7,8],[5,9],[9,6],[8,10],
    ];

    // Draw edges first (behind nodes)
    edges.forEach(([a, b], i) => {
      const na = nodes[a], nb = nodes[b];
      const line = document.createElementNS(svgns, "line");
      line.setAttribute("x1", String(na.x));
      line.setAttribute("y1", String(na.y));
      line.setAttribute("x2", String(nb.x));
      line.setAttribute("y2", String(nb.y));
      line.setAttribute("stroke", "hsl(215 100% 60%)");
      line.setAttribute("stroke-width", "0.08");
      line.setAttribute("stroke-opacity", "0.35");
      line.setAttribute("stroke-dasharray", "0.6 0.8");
      line.setAttribute("vector-effect", "non-scaling-stroke");
      line.style.animation = "data-stream 6s linear infinite";
      line.style.animationDelay = (i * 0.3) + "s";
      netHost.appendChild(line);
    });

    // Draw nodes
    nodes.forEach((n) => {
      const c = document.createElementNS(svgns, "circle");
      c.setAttribute("cx", String(n.x));
      c.setAttribute("cy", String(n.y));
      c.setAttribute("r", "0.55");
      c.setAttribute("fill", "hsl(215 100% 65%)");
      c.style.filter = "drop-shadow(0 0 3px hsl(215 100% 60%))";
      c.style.animation = "ai-node-pulse 3.5s ease-in-out infinite";
      c.style.animationDelay = n.delay + "s";
      c.style.transformOrigin = `${n.x}% ${n.y}%`;
      netHost.appendChild(c);
    });
  }
})();
