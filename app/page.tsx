"use client";

import { MouseEvent, useCallback, useState } from "react";

type Point = { x: number; y: number; id: number };
const SPARKS = [
  { x: 27, y: 34, delay: "0s", size: 18 }, { x: 35, y: 43, delay: ".8s", size: 12 },
  { x: 22, y: 50, delay: "1.4s", size: 9 }, { x: 15, y: 41, delay: "2.1s", size: 7 },
  { x: 31, y: 58, delay: "2.7s", size: 10 },
];

function Sparkle({ x, y, delay, size }: (typeof SPARKS)[number]) {
  return (
    // 반짝이는 별: scale과 rotate를 반복해 책에서 마법이 피어나는 느낌을 냅니다.
    <span className="sparkle" style={{ left: `${x}%`, top: `${y}%`, animationDelay: delay, width: size, height: size }} aria-hidden="true"><span /></span>
  );
}

function Firework({ delay = "0s", variant = "violet" }: { delay?: string; variant?: "violet" | "blue" }) {
  return (
    // 폭죽: 한 점에서 여러 선이 바깥으로 뻗었다가 사라지는 방사형 애니메이션입니다.
    <span className={`firework ${variant}`} style={{ animationDelay: delay }} aria-hidden="true">
      {Array.from({ length: 10 }).map((_, index) => <i key={index} style={{ "--angle": `${index * 36}deg` } as React.CSSProperties} />)}
      <b />
    </span>
  );
}

function MagicTrail() {
  return (
    <svg className="magic-trail" viewBox="0 0 100 100" aria-hidden="true">
      <path d="M12 84 C 21 72, 15 53, 33 47 S 48 24, 68 32 S 82 22, 91 12" />
      {/* 점이 path를 따라 이동해 책에서 솟아나는 빛의 흐름을 표현합니다. */}
      <circle className="trail-dot" r="2.2" />
    </svg>
  );
}

function ClickBurst({ point }: { point: Point }) {
  return (
    // 클릭할 때 새 컴포넌트가 생기므로 애니메이션이 매번 처음부터 재생됩니다.
    <span className="click-burst" style={{ left: `${point.x}%`, top: `${point.y}%` }} aria-hidden="true">
      {Array.from({ length: 12 }).map((_, index) => <i key={index} style={{ "--angle": `${index * 30}deg` } as React.CSSProperties} />)}
    </span>
  );
}

function Artwork({ playing, burstSeed }: { playing: boolean; burstSeed: number }) {
  const [clicks, setClicks] = useState<Point[]>([]);
  const addBurst = useCallback((event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const next = { x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100, id: Date.now() };
    setClicks((items) => [...items.slice(-3), next]);
  }, []);

  return (
    <div className={`artwork ${playing ? "is-playing" : "is-paused"}`} onClick={addBurst}>
      <img src="/vectorized.svg" alt="펼친 책을 읽는 여성의 흑백 벡터 일러스트" draggable={false} />
      <div className="book-glow" aria-hidden="true" />
      <MagicTrail />
      {SPARKS.map((spark, index) => <Sparkle key={index} {...spark} />)}
      <div className="firework-one"><Firework delay=".2s" /></div>
      <div className="firework-two"><Firework delay="1.3s" variant="blue" /></div>
      <div className="paper paper-one" aria-hidden="true" /><div className="paper paper-two" aria-hidden="true" />
      {clicks.map((point) => <ClickBurst key={point.id} point={point} />)}
      {burstSeed > 0 ? <div key={burstSeed} className="button-burst"><Firework /><Firework delay=".12s" variant="blue" /></div> : null}
      <span className="click-hint">책 위를 눌러보세요</span>
    </div>
  );
}

function ControlPanel({ playing, onToggle, onBurst }: { playing: boolean; onToggle: () => void; onBurst: () => void }) {
  return (
    <section className="controls" aria-label="애니메이션 컨트롤">
      <div><span className="eyebrow">INTERACTION LAB</span><h2>작은 움직임을<br />직접 깨워보세요.</h2></div>
      <div className="control-actions">
        <button className="primary" onClick={onToggle} aria-pressed={!playing}><span>{playing ? "Ⅱ" : "▶"}</span>{playing ? "잠시 멈춤" : "다시 재생"}</button>
        <button className="secondary" onClick={onBurst}><span>✦</span> 폭죽 터뜨리기</button>
      </div>
      <ul>
        <li><i className="dot violet" />자동 재생 <b>{playing ? "ON" : "OFF"}</b></li>
        <li><i className="dot blue" />클릭 이벤트 <b>READY</b></li>
        <li><i className="dot white" />CSS + SVG <b>LIVE</b></li>
      </ul>
    </section>
  );
}

export default function Home() {
  const [playing, setPlaying] = useState(true);
  const [burstSeed, setBurstSeed] = useState(0);
  return (
    <main>
      <header><a className="brand" href="#top" aria-label="SVG 플레이그라운드 홈"><span>✦</span> SVG PLAYGROUND</a><span className="index">EXPERIMENT 001 / 2026</span></header>
      <section id="top" className="hero">
        <div className="intro"><p className="kicker">A STUDY IN MOTION</p><h1>책장을 넘기면,<br /><em>상상이 움직인다.</em></h1><p className="description">한 장의 SVG 위에 선 그리기, 반짝임, 폭죽과 클릭 반응을 겹쳤습니다. 마우스로 장면을 깨워보세요.</p></div>
        <div className="stage-wrap"><span className="stage-label">LIVE CANVAS</span><Artwork playing={playing} burstSeed={burstSeed} /><span className="caption">VECTOR ILLUSTRATION · INTERACTIVE MOTION</span></div>
        <ControlPanel playing={playing} onToggle={() => setPlaying((value) => !value)} onBurst={() => setBurstSeed((value) => value + 1)} />
      </section>
    </main>
  );
}
