"use client";

import dynamic from "next/dynamic";

const SaiTechAssistant = dynamic(() => import("@/components/assistant/SaiTechAssistant").then((module) => module.SaiTechAssistant), { ssr: false });

export function AssistantLoader() { return <SaiTechAssistant />; }
