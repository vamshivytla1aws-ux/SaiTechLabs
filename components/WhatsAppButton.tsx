import { MessageCircle } from "lucide-react";
const message = encodeURIComponent("Hello SaiTech Labs, I would like to know more about your training programs.");
export function WhatsAppButton() { return <a className="whatsapp" href={`https://wa.me/919493969696?text=${message}`} target="_blank" rel="noreferrer" aria-label="Chat with SaiTech Labs on WhatsApp"><MessageCircle /><span>WhatsApp</span></a>; }
