import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type LinkItem = {
  label: string;
  name: string;
  href: string;
  kind: "text" | "image";
  icon?: string;
  textIcon?: string;
  className?: string;
};

const ASSETS = {
  avatar: "/avatar.gif",
  introVideo: "/intro.mp4",
  vrchat: "/vrchat.png",
  youtube: "/youtube.png",
  discord: "/discord.png",
  booth: ""
};

const links: LinkItem[] = [
  {
    label: "Twitter / X",
    name: "@kotachan_vrc",
    href: "https://x.com/kotachan_vrc?s=21",
    kind: "text",
    textIcon: "𝕏",
    className: "xIcon"
  },
  {
    label: "VRChat",
    name: "KotaroChan",
    href: "https://vrchat.com/home/user/usr_ffe576c4-b1ce-4878-b440-74222605de5a",
    kind: "image",
    icon: ASSETS.vrchat,
    className: "vrIcon"
  },
  {
    label: "YouTube",
    name: "@kotarochan_vrc",
    href: "https://youtube.com/@kotarochan_vrc?si=L3BfUZbEYtKppAHL",
    kind: "image",
    icon: ASSETS.youtube,
    className: "youtubeIcon"
  },
  {
    label: "Discord",
    name: "kotarochan",
    href: "https://discord.com/users/684939611893661793",
    kind: "image",
    icon: ASSETS.discord,
    className: "discordIcon"
  },
  {
    label: "Booth",
    name: "kotachanshop.booth.pm",
    href: "https://kotachanshop.booth.pm",
    kind: "image",
    icon: ASSETS.booth,
    className: "boothIcon"
  }
];

function CursorNoise() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const noise = ref.current;
    if (!noise || matchMedia("(hover: none), (pointer: coarse)").matches) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let x = targetX;
    let y = targetY;
    let prevX = x;
    let prevY = y;
    let hideTimer = 0;
    let raf = 0;

    const tick = () => {
      x += (targetX - x) * 0.28;
      y += (targetY - y) * 0.28;

      const vx = x - prevX;
      const vy = y - prevY;
      prevX = x;
      prevY = y;

      noise.style.setProperty("--noise-x", `${x}px`);
      noise.style.setProperty("--noise-y", `${y}px`);
      noise.style.setProperty("--noise-shift-x", `${Math.max(-8, Math.min(8, -vx * 0.45))}px`);
      noise.style.setProperty("--noise-shift-y", `${Math.max(-8, Math.min(8, -vy * 0.45))}px`);

      if (
        Math.abs(targetX - x) > 0.2 ||
        Math.abs(targetY - y) > 0.2 ||
        noise.classList.contains("active")
      ) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    };

    const onMove = (event: MouseEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      noise.classList.add("active");
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => noise.classList.remove("active"), 130);
      if (!raf) raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.clearTimeout(hideTimer);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={ref} id="cursor-noise" aria-hidden="true" />;
}

function IntroVideo() {
  const [done, setDone] = useState(false);

  if (done || !ASSETS.introVideo) return null;

  return (
    <div id="intro" className={done ? "fade-out" : ""}>
      <video
        id="intro-video"
        autoPlay
        muted
        playsInline
        onEnded={() => setDone(true)}
        onError={() => setDone(true)}
      >
        <source src={ASSETS.introVideo} type="video/mp4" />
      </video>
      <button className="skipIntro" onClick={() => setDone(true)}>SKIP</button>
    </div>
  );
}

function LinkButton({ item, pc = false }: { item: LinkItem; pc?: boolean }) {
  const iconClass = pc ? "pc-link-icon" : "link-icon";
  const infoClass = pc ? "pc-link-info" : "link-info";
  const labelClass = pc ? "pc-link-label" : "link-label";
  const nameClass = pc ? "pc-link-name" : "link-name";
  const btnClass = pc ? "pc-link-btn" : "link-btn";

  return (
    <a href={item.href} className={btnClass} target="_blank" rel="noreferrer">
      <div className={`${iconClass} ${item.kind === "image" ? iconClass + "-img" : ""} ${item.className ?? ""}`}>
        {item.kind === "image" && item.icon ? <img src={item.icon} alt={item.label} /> : item.textIcon}
      </div>
      <div className={infoClass}>
        <span className={labelClass}>{item.label}</span>
        <span className={nameClass}>{item.name}</span>
      </div>
    </a>
  );
}

function SecretGate({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const expected = useMemo(() => {
    const pieces = ["8e16", "dab4", "21ab", "39a7", "8291", "6819", "4a17", "6847", "221c", "a678", "c4c0", "ea1d", "8baa", "de64", "29e0", "373c"];
    return pieces
      .map((v, i) => (i % 2 ? v.split("").reverse().join("") : v))
      .map((v, i) => (i % 2 ? v.split("").reverse().join("") : v))
      .join("");
  }, []);

  async function sha256(value: string) {
    const data = new TextEncoder().encode(value);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  async function tryUnlock() {
    const hash = await sha256(input);
    if (hash === expected) {
      setUnlocked(true);
      setStatus("ACCESS GRANTED");
    } else {
      setUnlocked(false);
      setStatus("ACCESS DENIED");
      setInput("");
    }
  }

  useEffect(() => {
    if (!open) return;
    setStatus("");
    setUnlocked(false);
    setInput("");
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div id="secret-overlay" className="open" aria-hidden="false" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="secret-panel" role="dialog" aria-modal="true" aria-label="Hidden storage">
        <div className="secret-title">Hidden Storage</div>
        <div className="secret-name">password</div>
        <input
          className="secret-input"
          type="password"
          autoComplete="off"
          placeholder="PASSWORD"
          value={input}
          autoFocus
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void tryUnlock();
            if (e.key === "Escape") onClose();
          }}
        />
        <div className="secret-actions">
          <button className="secret-button" type="button" onClick={() => void tryUnlock()}>UNLOCK</button>
          <button className="secret-button secret-close" type="button" onClick={onClose}>CLOSE</button>
        </div>
        <div className="secret-status">{status}</div>
        <div className={`secret-files ${unlocked ? "unlocked" : ""}`}>
          <div className="secret-empty">
            ファイル置き場はまだ未設定です。<br />
            リンクを追加したらここに表示されます。
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileLayout({ onSecret }: { onSecret: () => void }) {
  return (
    <div className="mobile-layout" id="main-content">
      <div className="card">
        <div className="avatar">
          {ASSETS.avatar ? <img src={ASSETS.avatar} alt="KotaroChan" /> : null}
        </div>
        <div className="name"><span className="dagger">†</span>КотароЧан<span className="dagger">†</span></div>
        <div className="bio">Shader Creator / SFX Animator / Avatar Animator</div>
        <div className="divider" />
        <div className="links">
          {links.map((item) => <LinkButton key={item.label} item={item} />)}
        </div>
        <button className="footer secret-trigger" type="button" onClick={onSecret}>†КотароЧан† — 2026</button>
      </div>
    </div>
  );
}

function PcLayout({ onSecret }: { onSecret: () => void }) {
  return (
    <div className="pc-layout">
      <div className="pc-left">
        <div className="pc-avatar">
          {ASSETS.avatar ? <img src={ASSETS.avatar} alt="KotaroChan" /> : null}
        </div>
        <div className="pc-name">†КотароЧан†</div>
        <div className="pc-bio">Shader Creator / SFX Animator / Avatar Animator</div>
        <button className="footer secret-trigger" type="button" onClick={onSecret}>†КотароЧан† — 2026</button>
      </div>
      <div className="pc-right">
        <div className="pc-section-label">LINKS</div>
        <div className="pc-links">
          {links.map((item) => <LinkButton key={item.label} item={item} pc />)}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [secretOpen, setSecretOpen] = useState(false);

  return (
    <>
      <CursorNoise />
      <IntroVideo />
      <MobileLayout onSecret={() => setSecretOpen(true)} />
      <PcLayout onSecret={() => setSecretOpen(true)} />
      <SecretGate open={secretOpen} onClose={() => setSecretOpen(false)} />
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
