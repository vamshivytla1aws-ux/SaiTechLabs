import Link from "next/link";
import { ArrowRight, PhoneCall } from "lucide-react";

export function CTASection({ title = "Ready to build your IT career?", text = "Take the next step with structured, practical and industry-focused learning.", id, navSection }: { title?: string; text?: string; id?: string; navSection?: boolean }) {
  return <section id={id} data-nav-section={navSection ? id : undefined} className="cta-section"><div className="container cta-inner"><div><p className="eyebrow">Your next step</p><h2>{title}</h2><p>{text}</p></div><div className="cta-actions"><Link className="button button-light" href="/admissions">Start your journey <ArrowRight /></Link><a className="button button-ghost-light" href="tel:+919493969696"><PhoneCall /> Talk to a counselor</a></div></div></section>;
}
