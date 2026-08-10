import { programSteps } from "@/data/program";

export function ProgramTimeline() {
  return <div className="timeline">{programSteps.map((step, index) => { const Icon = step.icon; return <div className="timeline-item" key={step.number}><div className="timeline-marker"><Icon /></div><div className="timeline-copy"><span>Step {step.number}</span><h3>{step.title}</h3></div>{index < programSteps.length - 1 && <div className="timeline-line" />}</div>; })}</div>;
}
