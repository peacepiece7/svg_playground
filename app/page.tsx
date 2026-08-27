"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SvgObject = HTMLObjectElement & { contentDocument: Document | null };

function NativeSvgArtwork({ playing, replayKey, squiggle, strength }: { playing: boolean; replayKey: number; squiggle: boolean; strength: number }) {
  const objectRef = useRef<SvgObject>(null);

  const syncPlayState = useCallback(() => {
    // object 안쪽의 실제 SVG 루트에 class를 넣어 모든 원본 path 애니메이션을 제어합니다.
    objectRef.current?.contentDocument?.documentElement.classList.toggle("is-paused", !playing);
    const svgDocument = objectRef.current?.contentDocument;
    // 필터 강도(scale)와 활성 여부를 object 내부의 실제 SVG 노드에 직접 반영합니다.
    svgDocument?.querySelector("#squiggle-displacement")?.setAttribute("scale", String(strength));
    svgDocument?.querySelector("#native-artwork")?.setAttribute("filter", squiggle ? "url(#squiggle-filter)" : "none");
  }, [playing, squiggle, strength]);

  useEffect(() => {
    syncPlayState();
  }, [syncPlayState]);

  return (
    <div className="artwork native-artwork">
      <object
        key={replayKey}
        ref={objectRef}
        data="/vectorized-animated.svg"
        type="image/svg+xml"
        aria-label="원본 별과 종잇조각 path가 직접 움직이는 벡터 일러스트"
        onLoad={syncPlayState}
      >
        <img src="/vectorized.svg" alt="펼친 책을 읽는 여성의 흑백 벡터 일러스트" />
      </object>
      <span className="native-badge"><i /> ORIGINAL PATHS · 12 NODES</span>
    </div>
  );
}

function ControlPanel({ playing, squiggle, strength, onToggle, onReplay, onSquiggle, onStrength }: { playing: boolean; squiggle: boolean; strength: number; onToggle: () => void; onReplay: () => void; onSquiggle: () => void; onStrength: (value: number) => void }) {
  return (
    <section className="controls" aria-label="애니메이션 컨트롤">
      <div><span className="eyebrow">PATH INSPECTOR</span><h2>이번엔 진짜 SVG를<br />움직이고 있어요.</h2></div>
      <div className="control-actions">
        <button className="primary" onClick={onToggle} aria-pressed={!playing}><span>{playing ? "Ⅱ" : "▶"}</span>{playing ? "잠시 멈춤" : "다시 재생"}</button>
        <button className="secondary" onClick={onReplay}><span>↻</span> 처음부터 재생</button>
        <button className="secondary" onClick={onSquiggle} aria-pressed={squiggle}><span>≈</span> 스퀴글 {squiggle ? "끄기" : "켜기"}</button>
      </div>
      <label className="strength-control">
        <span>뒤틀림 강도 <b>{strength.toFixed(1)}</b></span>
        <input type="range" min="0" max="10" step="0.5" value={strength} onChange={(event) => onStrength(Number(event.target.value))} />
      </label>
      <ul>
        <li><i className="dot violet" />원본 별 path <b>2 NODES</b></li>
        <li><i className="dot blue" />원본 종잇조각 <b>10 NODES</b></li>
        <li><i className="dot white" />추가 오버레이 <b>NONE</b></li>
      </ul>
    </section>
  );
}

export default function Home() {
  const [playing, setPlaying] = useState(true);
  const [replayKey, setReplayKey] = useState(0);
  const [squiggle, setSquiggle] = useState(true);
  const [strength, setStrength] = useState(3.5);

  return (
    <main>
      <header><a className="brand" href="#top" aria-label="SVG 플레이그라운드 홈"><span>✦</span> SVG PLAYGROUND</a><span className="index">EXPERIMENT 002 / NATIVE PATH</span></header>
      <section id="top" className="hero">
        <div className="intro">
          <p className="kicker">INSIDE THE VECTOR</p>
          <h1>그림 속 조각이,<br /><em>직접 움직인다.</em></h1>
          <p className="description">8,256개의 익명 path를 분석해 원본 별과 종잇조각 12개를 찾았습니다. 새 효과를 얹지 않고, 선택한 벡터 노드 자체를 움직입니다.</p>
        </div>
        <div className="stage-wrap"><span className="stage-label">INLINE SVG OBJECT</span><NativeSvgArtwork playing={playing} replayKey={replayKey} squiggle={squiggle} strength={strength} /><span className="caption">TURBULENCE · DISPLACEMENT MAP · NATIVE MOTION</span></div>
        <ControlPanel
          playing={playing}
          squiggle={squiggle}
          strength={strength}
          onToggle={() => {
            setPlaying((value) => {
              const next = !value;
              // React 상태 변경과 동시에 object 내부 문서의 재생 상태를 갱신합니다.
              requestAnimationFrame(() => document.querySelector<HTMLObjectElement>(".native-artwork object")?.contentDocument?.documentElement.classList.toggle("is-paused", !next));
              return next;
            });
          }}
          onReplay={() => { setPlaying(true); setReplayKey((value) => value + 1); }}
          onSquiggle={() => setSquiggle((value) => !value)}
          onStrength={setStrength}
        />
      </section>
    </main>
  );
}
