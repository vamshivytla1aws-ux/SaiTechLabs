export function TechMicroAnimation() {
  return <span className="header-tech-animation" aria-hidden="true">
    <svg viewBox="0 0 52 36" focusable="false">
      <g className="tech-laptop-screen">
        <rect className="tech-screen-frame" x="8.5" y="3.5" width="35" height="23" rx="2.6" />
        <rect className="tech-screen-fill" x="11.5" y="6.5" width="29" height="17" rx="1.2" />
        <path className="tech-code-line tech-code-line-one" d="M15 11.5h15" />
        <path className="tech-code-line tech-code-line-two" d="M15 15.5h9" />
        <path className="tech-code-line tech-code-line-three" d="M15 19.5h12.5" />
        <path className="tech-terminal-cursor" d="M30.5 19.5h3" />
      </g>
      <path className="tech-laptop-base" d="M5 28h42l-3 4H8l-3-4Z" />
      <path className="tech-laptop-detail" d="M22 29.2h8" />
    </svg>
  </span>;
}
