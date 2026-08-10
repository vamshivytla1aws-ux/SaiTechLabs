export type Trainer = {
  name: string;
  initials: string;
  role: string;
  experience: string;
  expertise: string[];
  highlights: string[];
  summary: string;
  image: string;
  featured?: boolean;
};

export const trainers: Trainer[] = [
  {
    name: "Machha",
    initials: "MA",
    role: "Founder",
    experience: "22+ Years of IT Experience in Fortune 500 MNCs",
    expertise: ["Cloud", "Data Lake", "Mentoring"],
    highlights: [
      "15+ Years of Training Experience in Cloud & Data Lake",
      "Mentor & Motivational Speaker",
    ],
    summary: "Founder of SaiTech Labs and an experienced technology professional, trainer, mentor, and motivational speaker.",
    image: "/images/trainers/machha.png",
    featured: true,
  },
  {
    name: "Vasanth",
    initials: "VA",
    role: "CRM & Data Warehousing Expert",
    experience: "27+ Years of IT Experience",
    expertise: ["CRM", "Data Warehousing", "Corporate Ethics"],
    highlights: ["Expert in CRM", "Data Warehousing Expert", "Corporate Ethics Trainer"],
    summary: "An industry expert bringing extensive IT experience across CRM, data warehousing, and corporate ethics training.",
    image: "/images/trainers/vasanth.png",
  },
  {
    name: "Ramesh",
    initials: "RA",
    role: "OLTP Database Specialist",
    experience: "17+ Years of Corporate Experience",
    expertise: ["OLTP", "Databases", "Corporate Training"],
    highlights: ["Specialist in OLTP Database"],
    summary: "A database specialist with deep corporate experience and practical expertise in OLTP systems.",
    image: "/images/trainers/ramesh.png",
  },
  {
    name: "Pradeep",
    initials: "PR",
    role: "Development & DevOps Expert",
    experience: "15+ Years of Experience",
    expertise: ["Development", "DevOps", "Coding"],
    highlights: ["Expert in Development", "Expert in DevOps", "Expert in Coding"],
    summary: "A hands-on technology expert focused on software development, DevOps practices, and coding.",
    image: "/images/trainers/pradeep.png",
  },
  {
    name: "Srini",
    initials: "SR",
    role: "Big Data Administration Expert",
    experience: "15+ Years of Experience",
    expertise: ["Big Data", "Administration", "Motivational Speaking"],
    highlights: ["Expert in Big Data Administration", "Motivational Speaker"],
    summary: "A big data administration expert who combines technical instruction with motivational guidance.",
    image: "/images/trainers/srini.png",
  },
];
