"use client";

import { BriefcaseBusiness, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { Trainer } from "@/data/trainers";

export function TrainerCard({ trainer }: { trainer: Trainer }) {
  const [open, setOpen] = useState(false);
  return <>
    <article className="trainer-card"><div className="trainer-photo">{trainer.image ? <Image src={trainer.image} alt={`${trainer.name}, ${trainer.role}`} fill sizes="(max-width: 600px) 100vw, 33vw" /> : <span>{trainer.initials}</span>}<div className="trainer-accent" /></div><div className="trainer-copy"><p className="trainer-role">{trainer.role}</p><h3>{trainer.name}</h3><p className="experience"><BriefcaseBusiness />{trainer.experience}</p><div className="tags">{trainer.expertise.map(item => <span key={item}>{item}</span>)}</div><button type="button" className="text-button" onClick={() => setOpen(true)}>View profile <span>→</span></button></div></article>
    {open && <div className="modal-backdrop"><button type="button" className="modal-dismiss" onClick={() => setOpen(false)} aria-label="Close trainer profile" /><section className="profile-modal" role="dialog" aria-modal="true" aria-labelledby={`profile-${trainer.initials}`}><button className="modal-close" type="button" onClick={() => setOpen(false)} aria-label="Close profile"><X /></button><div className="trainer-photo small"><span>{trainer.initials}</span></div><p className="trainer-role">Industry Expert</p><h2 id={`profile-${trainer.initials}`}>{trainer.name}</h2><h3>{trainer.role}</h3><p>{trainer.summary}</p><p className="experience"><BriefcaseBusiness />{trainer.experience}</p><div className="tags">{trainer.expertise.map(item => <span key={item}>{item}</span>)}</div></section></div>}
  </>;
}
