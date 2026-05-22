import { useState } from "react";

const SLIDES = [
  {
    icon: "💍",
    title: "Meet your coordinator",
    text: "Start with a master planner who shapes your full wedding vision and timeline.",
  },
  {
    icon: "🏛️",
    title: "Specialist agents",
    text: "Switch between venue, catering, photography, music, and décor experts anytime.",
  },
  {
    icon: "✨",
    title: "Personalized advice",
    text: "Save your date, guest count, budget, and style — every agent remembers your details.",
  },
];

export function OnboardingScreen({ onComplete }) {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  function next() {
    if (isLast) onComplete();
    else setIndex((i) => i + 1);
  }

  return (
    <div className="auth-screen onboarding-screen">
      <div className="onboarding-progress">
        {SLIDES.map((_, i) => (
          <span
            key={i}
            className={`onboarding-dot ${i === index ? "active" : ""} ${i < index ? "done" : ""}`}
          />
        ))}
      </div>

      <div className="onboarding-card" key={index}>
        <div className="onboarding-icon">{slide.icon}</div>
        <h2 className="onboarding-title">{slide.title}</h2>
        <p className="onboarding-text">{slide.text}</p>
      </div>

      <div className="auth-footer">
        <button type="button" className="btn-gradient" onClick={next}>
          {isLast ? "Continue to sign in" : "Next"}
        </button>
        {!isLast && (
          <button type="button" className="btn-text" onClick={onComplete}>
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
