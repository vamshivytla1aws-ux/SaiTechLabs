import Link from "next/link";
import { Instagram, Linkedin, MapPin, Phone, Youtube } from "lucide-react";
import { Logo } from "./Logo";

const quick = [["Home", "/"], ["About", "/about"], ["Program", "/program"], ["Courses", "/courses"], ["Trainers", "/trainers"], ["Admissions", "/admissions"], ["Contact", "/contact"]];
const training = ["Cloud", "AI", "DevOps", "Databricks", "Data Engineering", "Interview Preparation"];

export function Footer() {
  return <footer className="footer">
    <div className="container footer-grid">
      <div className="footer-brand"><Logo light /><p className="tagline">Innovate <span>•</span> Educate <span>•</span> Accelerate</p><p>Industry-focused learning built around practical skills, confident communication and career readiness.</p><div className="socials" aria-label="Social media placeholders"><span title="LinkedIn profile coming soon"><Linkedin /></span><span title="Instagram profile coming soon"><Instagram /></span><span title="YouTube channel coming soon"><Youtube /></span></div></div>
      <div><h3>Quick links</h3><ul>{quick.map(([label, href]) => <li key={href}><Link href={href}>{label}</Link></li>)}</ul></div>
      <div><h3>Training</h3><ul>{training.map(item => <li key={item}><Link href="/courses">{item}</Link></li>)}</ul></div>
      <div><h3>Contact</h3><div className="footer-contact"><a href="tel:+919493969696"><Phone />+91 94939 69696</a><p><MapPin /> <span>Kalyandurgam Road,<br />Opp. Zudio, Anantapur</span></p></div><Link className="button button-gold" href="/contact">Talk to a counselor</Link></div>
    </div>
    <div className="container footer-bottom"><p>© 2026 SaiTech Labs. All Rights Reserved.</p><div><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms</Link><Link href="/disclaimer">Disclaimer</Link></div></div>
  </footer>;
}
