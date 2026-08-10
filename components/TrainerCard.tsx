"use client";

import { BriefcaseBusiness, Check, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { Trainer } from "@/data/trainers";

export function TrainerCard({ trainer }: { trainer: Trainer }) {
  const [open, setOpen] = useState(false);

  const portrait = (sizes: string) => (
    <Image
      src={trainer.image}
      alt={`${trainer.name}, ${trainer.role}`}
      fill
      sizes={sizes}
    />
  );

  return <>
    <article className={`trainer-card premium-card-interaction${trainer.featured ? " trainer-card-featured" : ""}`}>
      <div className="trainer-photo">
        {portrait("(max-width: 600px) 100vw, (max-width: 820px) 50vw, 33vw")}
        <div className="trainer-accent" />
        {trainer.featured && <span className="founder-badge">Founder</span>}
      </div>
      <div className="trainer-copy">
        <p className="trainer-role">{trainer.role}</p>
        <h3>{trainer.name}</h3>
        <div className="trainer-experience-block">
          <span>Experience</span>
          <p className="experience"><BriefcaseBusiness />{trainer.experience}</p>
        </div>
        <ul className="trainer-highlights">
          {trainer.highlights.map(item => <li key={item}><Check /> <span>{item}</span></li>)}
        </ul>
        <div className="tags">{trainer.expertise.map(item => <span key={item}>{item}</span>)}</div>
        <button type="button" className="text-button" onClick={() => setOpen(true)}>View profile <span>→</span></button>
      </div>
    </article>
    {open && <div className="modal-backdrop">
      <button type="button" className="modal-dismiss" onClick={() => setOpen(false)} aria-label="Close trainer profile" />
      <section className="profile-modal" role="dialog" aria-modal="true" aria-labelledby={`profile-${trainer.initials}`}>
        <button className="modal-close" type="button" onClick={() => setOpen(false)} aria-label="Close profile"><X /></button>
        <div className="trainer-photo small">{portrait("90px")}</div>
        <p className="trainer-role">{trainer.role}</p>
        <h2 id={`profile-${trainer.initials}`}>{trainer.name}</h2>
        <p>{trainer.summary}</p>
        <div className="trainer-experience-block">
          <span>Experience</span>
          <p className="experience"><BriefcaseBusiness />{trainer.experience}</p>
        </div>
        <ul className="trainer-highlights">
          {trainer.highlights.map(item => <li key={item}><Check /> <span>{item}</span></li>)}
        </ul>
        <div className="tags">{trainer.expertise.map(item => <span key={item}>{item}</span>)}</div>
      </section>
    </div>}
  </>;
}
