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
    <svg className="developer-character" viewBox="0 0 82 64" focusable="false">
      <g className="developer-body">
        <circle className="developer-head" cx="36" cy="14" r="7" />
        <path className="developer-hair" d="M29 14c0-8 13-11 16-2-5-2-10-2-16 2Z" />
        <g className="developer-front-features"><circle cx="33.5" cy="14.5" r=".75" /><circle cx="39" cy="14.5" r=".75" /><path d="M34 18c2 1 4 1 5 0" /></g>
        <path className="developer-profile-feature" d="M29 15l-3 2.5 3 1" />
        <path className="developer-torso" d="M30 23c5-2 12-1 15 3l1 19H27l1-16c0-3 1-5 2-6Z" />
        <path className="developer-arm developer-home-arm" d="M43 27c8-1 15-5 21-7l11 1" />
        <circle className="developer-home-hand" cx="77" cy="21" r="2" />
        <path className="developer-arm developer-laptop-arm" d="M30 28c-8 1-14 5-21 8l-6-1" />
        <circle className="developer-laptop-hand" cx="2" cy="35" r="2" />
        <path className="developer-arm developer-walk-arm-front" d="M30 27l-8 14" />
        <path className="developer-arm developer-walk-arm-back" d="M43 28l8 13" />
        <path className="developer-leg developer-leg-front" d="M32 44l-3 16" />
        <path className="developer-leg developer-leg-back" d="M41 44l4 16" />
        <path className="developer-shoe" d="M25 61h7m11 0h7" />
      </g>
    </svg>
  </span>;
}
