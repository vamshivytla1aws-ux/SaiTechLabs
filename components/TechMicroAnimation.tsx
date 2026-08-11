export function TechMicroAnimation() {
  return <span className="header-tech-animation" aria-hidden="true">
    <svg className="header-coding-laptop" viewBox="0 0 76 56" focusable="false">
      <g className="header-laptop-screen">
        <rect className="header-laptop-frame" x="10" y="5" width="54" height="37" rx="3.5" />
        <rect className="header-laptop-fill" x="14" y="9" width="46" height="29" rx="1.8" />
        <path className="header-laptop-code header-laptop-code-one" d="M20 17h25" />
        <path className="header-laptop-code header-laptop-code-two" d="M20 23h16" />
        <path className="header-laptop-code header-laptop-code-three" d="M20 29h21" />
        <path className="header-laptop-cursor" d="M45 29h5" />
      </g>
      <path className="header-laptop-base" d="M4 45h66l-5 6H9l-5-6Z" />
      <path className="header-laptop-detail" d="M31 47h12" />
    </svg>
    <span className="header-ball-landing header-ball-landing-logo" />
    <span className="header-ball-landing header-ball-landing-home" />
    <span className="header-ball-shadow" />
    <span className="header-ball-shuttle">
      <span className="header-motion-ball"><span /></span>
    </span>
  </span>;
}
