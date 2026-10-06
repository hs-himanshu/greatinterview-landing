document.documentElement.classList.remove("no-js");
document.getElementById("year").textContent = new Date().getFullYear();

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover = window.matchMedia("(hover: hover)").matches;

/* ---------- Nav background on scroll ---------- */

const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 20);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

/* ---------- Reveal on scroll ---------- */

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

/* ---------- Cursor glow + card spotlight + editor tilt ---------- */

if (canHover && !reduceMotion) {
  const glow = document.querySelector(".cursor-glow");
  window.addEventListener("pointermove", (e) => {
    glow.style.setProperty("--mx", e.clientX + "px");
    glow.style.setProperty("--my", e.clientY + "px");
  }, { passive: true });

  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--x", e.clientX - r.left + "px");
      card.style.setProperty("--y", e.clientY - r.top + "px");
    });
  });

  const editor = document.getElementById("editor");
  const visual = document.querySelector(".hero-visual");
  visual.addEventListener("pointermove", (e) => {
    if (window.innerWidth <= 980) return;
    const r = visual.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    editor.style.setProperty("--ry", (px * 14 - 4).toFixed(2) + "deg");
    editor.style.setProperty("--rx", (-py * 10 + 2).toFixed(2) + "deg");
  });
  visual.addEventListener("pointerleave", () => {
    editor.style.removeProperty("--ry");
    editor.style.removeProperty("--rx");
  });
}

/* ---------- Typing code editor ---------- */

// [className, text] tokens — rendered progressively so highlighting holds while typing.
const CODE = [
  ["k", "class "], ["t", "LRUCache"], ["", " {\n"],
  ["", "  "], ["k", "private final "], ["t", "Map"], ["", "<"], ["t", "Integer"], ["", ", "], ["t", "Node"], ["", "> map;\n"],
  ["", "  "], ["k", "private final "], ["t", "Node"], ["", " head, tail;\n\n"],
  ["", "  "], ["k", "public int "], ["f", "get"], ["", "("], ["k", "int "], ["", "key) {\n"],
  ["", "    "], ["t", "Node"], ["", " n = map."], ["f", "get"], ["", "(key);\n"],
  ["", "    "], ["k", "if "], ["", "(n == "], ["k", "null"], ["", ") "], ["k", "return "], ["n", "-1"], ["", ";\n"],
  ["", "    "], ["f", "moveToFront"], ["", "(n); "], ["c", "// O(1) recency bump"], ["", "\n"],
  ["", "    "], ["k", "return "], ["", "n.value;\n"],
  ["", "  }\n"],
  ["", "}"],
];

const codeEl = document.getElementById("code");
const gutterEl = document.getElementById("gutter");
const tests = [...document.querySelectorAll("#tests .test")];
const runChip = document.getElementById("runChip");
const passCard = document.querySelector(".fc-2");
const totalChars = CODE.reduce((n, [, t]) => n + t.length, 0);
const lineCount = CODE.map(([, t]) => t).join("").split("\n").length;

gutterEl.textContent = Array.from({ length: lineCount }, (_, i) => i + 1).join("\n");

const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function renderCode(chars) {
  let html = "";
  let left = chars;
  for (const [cls, text] of CODE) {
    if (left <= 0) break;
    const part = escapeHtml(text.slice(0, left));
    html += cls ? `<span class="tk-${cls}">${part}</span>` : part;
    left -= text.length;
  }
  codeEl.innerHTML = html;
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function setChip(text, state) {
  runChip.textContent = text;
  runChip.className = "run-chip" + (state ? " " + state : "");
}

async function playEditor() {
  if (reduceMotion) {
    renderCode(totalChars);
    tests.forEach((t) => t.classList.add("pass"));
    setChip("Accepted", "done");
    passCard.classList.add("show");
    return;
  }

  while (true) {
    tests.forEach((t) => t.classList.remove("pass"));
    passCard.classList.remove("show");
    setChip("Waiting…", "");

    for (let i = 0; i <= totalChars; i++) {
      renderCode(i);
      await wait(14 + Math.random() * 26);
    }

    await wait(500);
    setChip("● Running in sandbox…", "running");
    await wait(900);
    for (const t of tests) {
      t.classList.add("pass");
      await wait(380);
    }
    setChip("Accepted", "done");
    passCard.classList.add("show");
    await wait(5000);
  }
}

playEditor();

/* ---------- Feature-card micro animations (start when visible) ---------- */

function whenVisible(el, fn) {
  if (!el) return;
  const io = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      io.disconnect();
      fn();
    }
  }, { threshold: 0.4 });
  io.observe(el);
}

whenVisible(document.getElementById("terminal"), () => {
  document.getElementById("terminal").classList.add("play");
});

whenVisible(document.querySelector(".checklist"), async () => {
  const items = [...document.querySelectorAll(".checklist li")];
  if (reduceMotion) return items.forEach((li) => li.classList.add("on"));
  while (true) {
    for (const li of items) {
      await wait(650);
      li.classList.add("on");
    }
    await wait(2600);
    items.forEach((li) => li.classList.remove("on"));
    await wait(500);
  }
});

whenVisible(document.querySelector(".tag-cloud"), () => {
  if (reduceMotion) return;
  const tags = [...document.querySelectorAll(".tag-cloud span")];
  let i = 0;
  setInterval(() => {
    tags.forEach((t) => t.classList.remove("hl"));
    tags[i % tags.length].classList.add("hl");
    tags[(i + 3) % tags.length].classList.add("hl");
    i++;
  }, 1100);
});

/* ---------- Starfield ---------- */

(function starfield() {
  const canvas = document.getElementById("stars");
  const ctx = canvas.getContext("2d");
  let stars = [];
  let w, h, dpr;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round((w * h) / 9000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.2 + 0.2,
      a: Math.random(),
      s: Math.random() * 0.015 + 0.004,
      vy: Math.random() * 0.12 + 0.02,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const st of stars) {
      st.a += st.s;
      st.y -= st.vy;
      if (st.y < -2) { st.y = h + 2; st.x = Math.random() * w; }
      const alpha = 0.25 + Math.abs(Math.sin(st.a)) * 0.55;
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220, 235, 200, ${alpha})`;
      ctx.fill();
    }
    if (!reduceMotion) requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize);
  draw();
})();

/* ---------- Waitlist forms (Formspree) ---------- */

function showStatus(form, message, kind) {
  const statusEl = form.parentElement.querySelector(".form-status");
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.className = "form-status" + (kind ? " " + kind : "");
}

async function handleSubmit(event) {
  const form = event.target;
  event.preventDefault();

  const button = form.querySelector("button");
  const originalLabel = button.textContent;
  button.disabled = true;
  button.textContent = "Joining…";
  showStatus(form, "", "");

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });

    if (response.ok) {
      form.reset();
      showStatus(form, "You're on the list — we'll email you when early access opens.", "success");
    } else {
      const data = await response.json().catch(() => null);
      const message =
        data && data.errors && data.errors[0] && data.errors[0].message
          ? data.errors[0].message
          : "Something went wrong — try again in a moment.";
      showStatus(form, message, "error");
    }
  } catch (err) {
    showStatus(form, "Couldn't reach the server — check your connection and try again.", "error");
  } finally {
    button.disabled = false;
    button.textContent = originalLabel;
  }
}

document.querySelectorAll(".signup-form").forEach((form) => {
  form.addEventListener("submit", handleSubmit);
});
