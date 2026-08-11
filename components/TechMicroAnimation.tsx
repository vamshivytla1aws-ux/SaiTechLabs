export function TechMicroAnimation() {
  return <span className="header-tech-animation" aria-hidden="true">
    <svg className="coding-laptop" viewBox="0 0 76 56" focusable="false">
      <g className="developer-laptop-screen">
        <rect className="developer-screen-frame" x="10" y="5" width="54" height="37" rx="3.5" />
        <rect className="developer-screen-fill" x="14" y="9" width="46" height="29" rx="1.8" />
        <path className="developer-code-line developer-code-one" d="M20 17h25" />
        <path className="developer-code-line developer-code-two" d="M20 23h16" />
        <path className="developer-code-line developer-code-three" d="M20 29h21" />
        <path className="developer-terminal-cursor" d="M45 29h5" />
      </g>
      <path className="developer-laptop-base" d="M4 45h66l-5 6H9l-5-6Z" />
      <path className="developer-laptop-detail" d="M31 47h12" />
    </svg>
    <svg className="developer-scene" viewBox="0 0 360 64" focusable="false">
      <g className="developer-travel">
        <g className="office-chair">
          <rect className="chair-back" x="298" y="24" width="8" height="23" rx="3" />
          <path className="chair-frame" d="M302 45h18m-8 0v10m-10 3h20" />
          <circle className="chair-wheel" cx="302" cy="59" r="2" />
          <circle className="chair-wheel" cx="322" cy="59" r="2" />
        </g>
        <g className="developer-body">
          <circle className="developer-head" cx="313" cy="18" r="6" />
          <path className="developer-hair" d="M307 18c0-7 11-9 13-2-4-2-8-2-13 2Z" />
          <path className="developer-torso" d="M309 26c5-2 11-1 14 2l1 17h-18l1-15c0-2 1-3 2-4Z" />
          <path className="developer-arm developer-arm-front" d="M310 29l-8 10 9 3" />
          <path className="developer-arm developer-arm-back" d="M321 30l7 10" />
          <g className="developer-legs">
            <path className="developer-leg developer-leg-front" d="M311 44l12 6-2 10" />
            <path className="developer-leg developer-leg-back" d="M318 44l-5 14" />
          </g>
          <path className="developer-shoe" d="M318 60h7m-15-1h7" />
        </g>
      </g>
    </svg>
  </span>;
}
