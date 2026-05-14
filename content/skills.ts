export type Skill = { name: string; level: number; primary?: boolean };
export type SkillGroup = { slot: string; label: string; skills: Skill[] };

export const skills: SkillGroup[] = [
  {
    slot: "PRIMARY",
    label: "Languages",
    skills: [
      { name: "TypeScript", level: 95, primary: true },
      { name: "Python", level: 92 },
      { name: "Java", level: 88 },
      { name: "JavaScript", level: 95 },
      { name: "C", level: 78 },
      { name: "SQL", level: 85 },
      { name: "Bash", level: 72 },
    ],
  },
  {
    slot: "SECONDARY",
    label: "Frameworks & Tools",
    skills: [
      { name: "React", level: 94 },
      { name: "React Native", level: 86 },
      { name: "Next.js", level: 90 },
      { name: "Spring Boot", level: 84 },
      { name: "Flask", level: 78 },
      { name: "Docker", level: 80 },
      { name: "GSAP", level: 80 },
      { name: "Selenium / TestNG", level: 72 },
    ],
  },
  {
    slot: "UTILITY",
    label: "Databases, Cloud & Systems",
    skills: [
      { name: "PostgreSQL", level: 88 },
      { name: "Firestore", level: 85 },
      { name: "MongoDB", level: 78 },
      { name: "REST / WebSockets", level: 86 },
      { name: "JWT / Auth", level: 84 },
      { name: "AWS", level: 82 },
      { name: "GCP", level: 76 },
      { name: "Linux / Git / CI-CD", level: 84 },
    ],
  },
];

export const achievements = [
  { label: "B.S. Computer Science", detail: "University of Wisconsin–Madison · 2022 – 2026" },
  { label: "GPA 3.8", detail: "Dean's List — 7 semesters" },
  { label: "Certificate in Consulting", detail: "UW–Madison" },
  { label: "AWS Certified Cloud Practitioner", detail: "Amazon Web Services" },
  { label: "AWS Certified Developer — Associate", detail: "Amazon Web Services" },
];
