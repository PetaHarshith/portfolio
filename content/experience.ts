export type Experience = {
  id: string;
  role: string;
  company: string;
  location: string;
  start: string;
  end: string;
  tag: "RESEARCH" | "STARTUP" | "ENTERPRISE";
  summary: string;
  kda: { label: string; value: string }[];
  bullets: string[];
  stack: string[];
};

export const experience: Experience[] = [
  {
    id: "uw-neuro",
    role: "Undergraduate Research Assistant",
    company: "UW–Madison · Computational Development Neuroscience Lab",
    location: "Madison, WI",
    start: "Jun 2025",
    end: "Present",
    tag: "RESEARCH",
    summary:
      "Building reusable Python pipelines that turn raw fMRI and behavioral data into reviewable, subject-level reports.",
    kda: [
      { label: "SESSIONS", value: "1,000+" },
      { label: "METRICS", value: "20+" },
      { label: "TIME SAVED", value: "−60%" },
    ],
    bullets: [
      "Built a behavioral analysis framework processing 1,000+ experiment sessions across 5 cognitive tasks.",
      "Automated 20+ behavioral and linguistic metrics, reducing recurring analysis time by 60%.",
      "Developed an NLP pipeline using Word2Vec features with a Ridge / RBF-SVR / XGBoost ensemble, evaluated via 50-repeat nested split-half validation.",
      "Implemented an fMRI reliability pipeline computing Cronbach's α and Guttman's G6 across Schaefer-atlas parcels.",
    ],
    stack: ["Python", "scikit-learn", "XGBoost", "Word2Vec", "fMRI"],
  },
  {
    id: "soundsafe",
    role: "Junior AI/ML Engineer Intern",
    company: "SoundSafe.ai",
    location: "Chicago, IL · Remote",
    start: "May 2025",
    end: "Aug 2025",
    tag: "STARTUP",
    summary:
      "Built shared audio preprocessing and verification services that standardized the ML pipeline across multiple detection models.",
    kda: [
      { label: "DETECTION", value: "98%+" },
      { label: "LATENCY", value: "<750ms" },
      { label: "FUSION", value: "+30%" },
    ],
    bullets: [
      "Developed a configurable SharedAudioPreprocessor (VAD, Mel-spectrogram, MFCC, RMS) that unified preprocessing across 4 downstream models and reduced cross-team data bugs by 50%.",
      "Built a RESTful WatermarkVerificationService reaching 98%+ detection accuracy on test audio with processing latency under 750ms.",
      "Partnered with the anomaly-detection team to integrate deepfake, anomaly, and behavioral models into the UTS pipeline, delivering sub-second inference and improving multi-event detection efficiency by 40%.",
      "Co-designed the AudioFusionEngine, combining multi-model outputs via weighted fusion logic into a unified threat score; improved threat classification accuracy by 30% on benchmark datasets.",
    ],
    stack: ["Python", "PyTorch", "Audio ML", "REST APIs", "Signal Processing"],
  },
  {
    id: "take2",
    role: "Full-Stack Software Engineer Intern",
    company: "Take2",
    location: "Remote",
    start: "Mar 2025",
    end: "May 2025",
    tag: "STARTUP",
    summary:
      "Improved app performance by redesigning Firestore access patterns and eliminating unnecessary React Native re-renders.",
    kda: [
      { label: "LATENCY", value: "−40%" },
      { label: "DEFECTS", value: "−30%" },
      { label: "FPS", value: "+35%" },
    ],
    bullets: [
      "Redesigned Firestore queries and indexes, reducing retrieval latency by 40% and page loads by 1.5 seconds.",
      "Resolved 10+ production issues across TypeScript components and Firebase security rules.",
      "Restructured state flow in React Native screens, improving UI responsiveness by 35%.",
    ],
    stack: ["TypeScript", "React Native", "Firebase", "Firestore"],
  },
  {
    id: "helixotech",
    role: "Backend Java Developer Intern",
    company: "Helixotech Pvt Ltd",
    location: "Chennai, India",
    start: "May 2023",
    end: "Jul 2023",
    tag: "ENTERPRISE",
    summary:
      "Built JWT-secured Spring Boot APIs for a healthcare platform managing 10K+ patient records.",
    kda: [
      { label: "APIS", value: "4" },
      { label: "RECORDS", value: "10K+" },
      { label: "LOOKUP", value: "+20%" },
    ],
    bullets: [
      "Built JWT-secured authentication and authorization APIs using Spring Boot Security.",
      "Refactored the service layer and added SQL indexes, improving patient-record retrieval efficiency by 20%.",
      "Shipped 4 production REST APIs, validated by 15 automated Swagger integration tests.",
    ],
    stack: ["Java", "Spring Boot", "JWT", "SQL", "Swagger"],
  },
];
