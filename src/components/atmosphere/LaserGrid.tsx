import "./laser-grid.css";

/** Beam end points in a 1000x1000 viewBox, radiating from behind the wordmark. */
const BEAMS = [
  { x: -200, y: 40, o: 0.35 },
  { x: 150, y: -120, o: 0.5 },
  { x: 430, y: -200, o: 0.3 },
  { x: 600, y: -200, o: 0.3 },
  { x: 850, y: -120, o: 0.5 },
  { x: 1200, y: 40, o: 0.35 },
];

/** Perspective laser grid and beams. Decorative only. */
export function LaserGrid() {
  return (
    <div aria-hidden="true" className="rd-laser-root">
      <svg
        className="rd-laser-lasers"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
        focusable="false"
      >
        <defs>
          <filter id="rd-beam-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
        <g className="rd-laser-beams">
          {BEAMS.map((b) => (
            <g key={`${b.x}-${b.y}`} opacity={b.o}>
              <line
                x1="500"
                y1="560"
                x2={b.x}
                y2={b.y}
                stroke="var(--accent)"
                strokeWidth="6"
                filter="url(#rd-beam-glow)"
              />
              <line
                x1="500"
                y1="560"
                x2={b.x}
                y2={b.y}
                stroke="var(--accent-glow)"
                strokeWidth="1"
              />
            </g>
          ))}
        </g>
      </svg>
      <div className="rd-laser-horizon" />
      <div className="rd-laser-floor">
        <div className="rd-laser-plane" />
      </div>
    </div>
  );
}
