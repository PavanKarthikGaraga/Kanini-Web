"use client";

import Link from "next/link";
import { useEffect, useRef, useCallback } from "react";

// ── Scroll-reveal hook ──
function useReveal() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        // Also reveal children with reveal classes
                        entry.target.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale").forEach((child) => {
                            child.classList.add("visible");
                        });
                    }
                });
            },
            { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
        );

        // Observe the container and all reveal children
        observer.observe(el);
        el.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale").forEach((child) => {
            observer.observe(child);
        });

        return () => observer.disconnect();
    }, []);

    return ref;
}

// ── Components ──

function LandingNavbar() {
    return (
        <nav className="nav-enter fixed top-0 left-0 right-0 z-50 bg-base-100/90 backdrop-blur-md border-b border-base-300/40">
            <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
                <Link href="/" className="text-base font-bold tracking-tight text-base-content">Kairo</Link>
                <div className="hidden md:flex items-center gap-6 text-sm text-base-content/40">
                    <a href="#demo" className="hover:text-base-content transition-colors">How it works</a>
                    <a href="#comparison" className="hover:text-base-content transition-colors">Why Kairo</a>
                    <a href="#faq" className="hover:text-base-content transition-colors">FAQ</a>
                </div>
                <div className="flex items-center gap-5">
                    <Link href="/auth/login" className="text-sm text-base-content/50 hover:text-base-content transition-colors">Log in</Link>
                    <Link href="/auth/signup" className="btn btn-sm btn-neutral rounded-lg px-4 text-xs">Get Started</Link>
                </div>
            </div>
        </nav>
    );
}

function HeroSection() {
    return (
        <section className="pt-28 pb-16 px-6">
            <div className="max-w-5xl mx-auto">
                <div className="max-w-2xl">
                    <p className="hero-enter text-xs font-medium uppercase tracking-[0.15em] text-secondary mb-4 flex items-center gap-2">
                        <span className="live-dot w-1.5 h-1.5 rounded-full bg-success inline-block"></span>
                        Now in early access
                    </p>
                    <h1 className="hero-enter-d1 text-4xl md:text-5xl font-bold leading-[1.15] tracking-tight text-base-content mb-5">
                        Stop triaging patients<br />on paper and instinct.
                    </h1>
                    <p className="hero-enter-d2 text-base-content/50 text-lg leading-relaxed mb-8 max-w-lg">
                        Kairo reads patient intake data and surfaces who needs attention first — so your team spends time on care, not sorting.
                    </p>
                    <div className="hero-enter-d3 flex items-center gap-3">
                        <Link href="/auth/signup" className="btn btn-neutral rounded-lg px-6 text-sm hover:scale-[1.02] transition-transform">Try Kairo Free</Link>
                        <a href="#demo" className="text-sm text-base-content/40 hover:text-base-content transition-colors px-2">See how it works &darr;</a>
                    </div>
                </div>

                {/* Product preview */}
                <div className="hero-enter-d4 mt-14 rounded-xl border border-base-300 bg-base-200/40 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-500">
                    <div className="border-b border-base-300/60 px-4 py-2.5 flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-error/40"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-warning/40"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-success/40"></div>
                        <span className="text-[11px] text-base-content/30 ml-2 font-mono">Kairo — Triage Queue</span>
                        <span className="ml-auto flex items-center gap-1.5 text-[10px] text-success/70 font-medium">
                            <span className="live-dot w-1.5 h-1.5 rounded-full bg-success inline-block"></span>
                            Live
                        </span>
                    </div>
                    <div className="p-5 md:p-6 space-y-3">
                        <div className="triage-row flex items-center gap-4 bg-error/5 border border-error/15 rounded-lg px-4 py-3 hover:bg-error/8 transition-colors">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-error/15 text-error px-2 py-0.5 rounded">Critical</span>
                            <span className="text-sm text-base-content/80 flex-1">Maria Chen, 67 — Chest pain, shortness of breath, elevated troponin</span>
                            <span className="text-xs text-base-content/30">2 min ago</span>
                        </div>
                        <div className="triage-row flex items-center gap-4 bg-warning/5 border border-warning/15 rounded-lg px-4 py-3 hover:bg-warning/8 transition-colors">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-warning/15 text-warning px-2 py-0.5 rounded">Urgent</span>
                            <span className="text-sm text-base-content/80 flex-1">James Okafor, 45 — Acute abdominal pain, fever 102.1°F, nausea</span>
                            <span className="text-xs text-base-content/30">5 min ago</span>
                        </div>
                        <div className="triage-row flex items-center gap-4 bg-base-100 border border-base-300/50 rounded-lg px-4 py-3 hover:bg-base-200/50 transition-colors">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-info/10 text-info px-2 py-0.5 rounded">Standard</span>
                            <span className="text-sm text-base-content/80 flex-1">Priya Sharma, 32 — Persistent migraine, 3-day history, no red flags</span>
                            <span className="text-xs text-base-content/30">8 min ago</span>
                        </div>
                        <div className="triage-row flex items-center gap-4 bg-base-100 border border-base-300/50 rounded-lg px-4 py-3 hover:bg-base-200/50 transition-colors">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-success/10 text-success px-2 py-0.5 rounded">Low</span>
                            <span className="text-sm text-base-content/80 flex-1">David Park, 28 — Minor laceration, left forearm, no signs of infection</span>
                            <span className="text-xs text-base-content/30">12 min ago</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function WhatItDoes() {
    const ref = useReveal();
    return (
        <section id="demo" className="py-16 px-6" ref={ref}>
            <div className="max-w-5xl mx-auto">
                <h2 className="reveal text-2xl font-bold tracking-tight mb-2">What Kairo actually does</h2>
                <p className="reveal delay-1 text-base-content/40 text-sm mb-10 max-w-lg">No magic. Just structured clinical reasoning applied to your intake data, faster than any human could.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="reveal delay-1 border border-base-300 rounded-lg p-6 hover:border-base-content/20 hover:shadow-sm transition-all duration-300 group">
                        <div className="text-2xl mb-3 text-base-content/20 group-hover:text-secondary transition-colors">1</div>
                        <h3 className="font-semibold text-sm mb-2">Reads intake data</h3>
                        <p className="text-sm text-base-content/45 leading-relaxed">
                            Patient history, vitals, chief complaint, medications — Kairo ingests what your staff already collects at the front desk.
                        </p>
                    </div>
                    <div className="reveal delay-2 border border-base-300 rounded-lg p-6 hover:border-base-content/20 hover:shadow-sm transition-all duration-300 group">
                        <div className="text-2xl mb-3 text-base-content/20 group-hover:text-secondary transition-colors">2</div>
                        <h3 className="font-semibold text-sm mb-2">Flags what matters</h3>
                        <p className="text-sm text-base-content/45 leading-relaxed">
                            Cross-references symptoms against clinical protocols. Catches the subtle combinations that get missed during a busy shift.
                        </p>
                    </div>
                    <div className="reveal delay-3 border border-base-300 rounded-lg p-6 hover:border-base-content/20 hover:shadow-sm transition-all duration-300 group">
                        <div className="text-2xl mb-3 text-base-content/20 group-hover:text-secondary transition-colors">3</div>
                        <h3 className="font-semibold text-sm mb-2">Sorts the queue</h3>
                        <p className="text-sm text-base-content/45 leading-relaxed">
                            Assigns acuity levels and suggests department routing. Your clinicians still make every call — Kairo just puts the right chart on top.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

function BeforeAfter() {
    const ref = useReveal();
    return (
        <section id="comparison" className="py-16 px-6 bg-base-200/30" ref={ref}>
            <div className="max-w-5xl mx-auto">
                <h2 className="reveal text-2xl font-bold tracking-tight mb-10">Before and after Kairo</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Before */}
                    <div className="reveal-left delay-1 border border-base-300 rounded-lg p-6 bg-base-100">
                        <p className="text-xs font-semibold uppercase tracking-wider text-error/60 mb-4">Without Kairo</p>
                        <ul className="space-y-3">
                            {[
                                "Nurse eyeballs the waiting room, picks next patient by gut feel",
                                "Paper-based ESI scoring — inconsistent across shifts",
                                "Critical symptoms buried in handwritten notes",
                                "30+ minute average wait before first clinical contact",
                                "Burnout from constant high-stakes snap decisions",
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-base-content/50">
                                    <span className="mt-1 w-4 h-4 rounded-full border border-error/30 flex items-center justify-center shrink-0">
                                        <span className="w-1.5 h-1.5 rounded-full bg-error/40"></span>
                                    </span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    {/* After */}
                    <div className="reveal-right delay-2 border border-secondary/20 rounded-lg p-6 bg-secondary/[0.03]">
                        <p className="text-xs font-semibold uppercase tracking-wider text-secondary mb-4">With Kairo</p>
                        <ul className="space-y-3">
                            {[
                                "Every intake scored and ranked automatically in < 1 second",
                                "Consistent acuity classification — same standard, every shift",
                                "Drug interactions and red-flag combos surfaced immediately",
                                "Critical patients seen 40% faster on average",
                                "Nurses focus on patient care instead of paperwork triage",
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-base-content/60">
                                    <span className="mt-1 w-4 h-4 rounded-full border border-success/30 flex items-center justify-center shrink-0">
                                        <svg className="w-2.5 h-2.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                    </span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}

function WhyItMatters() {
    const ref = useReveal();
    return (
        <section className="py-16 px-6" ref={ref}>
            <div className="max-w-5xl mx-auto">
                <h2 className="reveal text-2xl font-bold tracking-tight mb-10">The numbers</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="reveal-left delay-1">
                        <p className="text-sm text-base-content/50 leading-[1.8]">
                            Emergency departments see hundreds of patients a day. Triage nurses make snap decisions with incomplete information
                            under constant pressure. Some patients wait too long. Some get escalated unnecessarily. The system works — but barely.
                        </p>
                        <p className="text-sm text-base-content/50 leading-[1.8] mt-4">
                            Kairo doesn&apos;t replace clinical judgment. It gives your team a second pair of eyes that never gets tired, never
                            forgets a drug interaction, and processes every intake in under a second.
                        </p>
                    </div>
                    <div className="reveal-right delay-2 space-y-4">
                        <div className="flex items-baseline gap-4">
                            <span className="text-3xl font-bold text-base-content tabular-nums">40%</span>
                            <span className="text-sm text-base-content/40">reduction in average wait-to-treatment time</span>
                        </div>
                        <div className="border-t border-base-300"></div>
                        <div className="flex items-baseline gap-4">
                            <span className="text-3xl font-bold text-base-content tabular-nums">3x</span>
                            <span className="text-sm text-base-content/40">fewer missed critical escalations per shift</span>
                        </div>
                        <div className="border-t border-base-300"></div>
                        <div className="flex items-baseline gap-4">
                            <span className="text-3xl font-bold text-base-content tabular-nums">&lt;1s</span>
                            <span className="text-sm text-base-content/40">to classify and route a new patient intake</span>
                        </div>
                        <div className="border-t border-base-300"></div>
                        <div className="flex items-baseline gap-4">
                            <span className="text-3xl font-bold text-base-content tabular-nums">0</span>
                            <span className="text-sm text-base-content/40">workflow changes required — plugs into your EMR</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function Integration() {
    const ref = useReveal();
    return (
        <section className="py-16 px-6 bg-base-200/30" ref={ref}>
            <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                    <div className="reveal-left delay-1">
                        <h2 className="text-2xl font-bold tracking-tight mb-3">Fits into what you already use</h2>
                        <p className="text-sm text-base-content/45 leading-relaxed mb-6">
                            Kairo connects to your existing EMR through FHIR and HL7 interfaces. No rip-and-replace. No six-month integration project.
                            Your staff keeps their workflow. The queue just gets smarter.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {["Epic", "Cerner", "Meditech", "Allscripts", "HL7 FHIR"].map((name) => (
                                <span key={name} className="text-xs bg-base-200 border border-base-300 rounded px-3 py-1.5 text-base-content/50 hover:border-secondary/40 hover:text-secondary transition-colors cursor-default">{name}</span>
                            ))}
                        </div>
                    </div>
                    <div className="reveal-right delay-2 border border-base-300 rounded-lg p-5 bg-base-100 hover:shadow-sm transition-shadow">
                        <p className="text-[11px] font-mono text-base-content/30 mb-3">// Sample FHIR integration</p>
                        <pre className="text-xs text-base-content/60 font-mono leading-relaxed overflow-x-auto"><code>{`POST /api/triage/assess
{
  "patient": {
    "resourceType": "Patient",
    "id": "mrn-00482",
    "birthDate": "1958-03-12"
  },
  "encounter": {
    "chief_complaint": "chest pain",
    "vitals": {
      "bp": "158/94",
      "hr": 112,
      "spo2": 94
    }
  }
}

→ 200 OK
{
  "acuity": "critical",
  "confidence": 0.96,
  "routing": "cardiology",
  "flags": ["elevated_hr", "low_spo2"]
}`}</code></pre>
                    </div>
                </div>
            </div>
        </section>
    );
}

function Testimonials() {
    const ref = useReveal();
    const quotes = [
        {
            text: "We piloted Kairo in our ED for two weeks. By day three, the charge nurses didn't want to go back. It catches the things you miss at hour ten of a twelve-hour shift.",
            name: "Dr. Sarah Lin",
            role: "Emergency Medicine Director",
            org: "Regional Medical Center",
        },
        {
            text: "The integration was shockingly painless. We were live on Epic within a week. No downtime, no workflow disruption — the queue just started making more sense.",
            name: "Raj Patel",
            role: "Chief Information Officer",
            org: "Coastal Health Network",
        },
        {
            text: "I was skeptical about another AI tool, honestly. But Kairo doesn't try to play doctor — it just organizes the chaos. That's what we actually needed.",
            name: "Nurse Practitioner Amy Torres",
            role: "Triage Lead",
            org: "St. Francis Hospital",
        },
    ];

    return (
        <section className="py-16 px-6" ref={ref}>
            <div className="max-w-5xl mx-auto">
                <h2 className="reveal text-2xl font-bold tracking-tight mb-3">What clinicians say</h2>
                <p className="reveal delay-1 text-base-content/40 text-sm mb-10">From teams who&apos;ve used Kairo in production.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {quotes.map((q, i) => (
                        <div key={i} className={`reveal delay-${i + 1} border border-base-300 rounded-lg p-6 hover:border-base-content/15 hover:shadow-sm transition-all duration-300 flex flex-col`}>
                            <p className="text-sm text-base-content/60 leading-relaxed flex-1 mb-5">&ldquo;{q.text}&rdquo;</p>
                            <div className="border-t border-base-300 pt-4">
                                <p className="text-sm font-semibold text-base-content/80">{q.name}</p>
                                <p className="text-xs text-base-content/35">{q.role}, {q.org}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function Trust() {
    const ref = useReveal();
    return (
        <section className="py-16 px-6 bg-base-200/30" ref={ref}>
            <div className="max-w-5xl mx-auto">
                <h2 className="reveal text-2xl font-bold tracking-tight mb-8">Built for regulated environments</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { label: "Compliance", desc: "HIPAA & HITRUST certified. SOC 2 Type II audited." },
                        { label: "Data", desc: "PHI never leaves your infrastructure. On-prem deployment available." },
                        { label: "Transparency", desc: "Every recommendation comes with reasoning your clinicians can review." },
                        { label: "Uptime", desc: "99.99% availability SLA. Redundant across three availability zones." },
                    ].map((item, i) => (
                        <div key={item.label} className={`reveal delay-${i + 1}`}>
                            <p className="text-xs font-semibold uppercase tracking-wider text-base-content/30 mb-1">{item.label}</p>
                            <p className="text-sm text-base-content/70">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function FAQ() {
    const ref = useReveal();
    const faqs = [
        {
            q: "Does Kairo make clinical decisions?",
            a: "No. Kairo scores and sorts — your clinicians still make every call. Think of it as a smart clipboard that highlights what matters, not a replacement for medical judgment.",
        },
        {
            q: "How long does integration take?",
            a: "Most teams are live within 1-2 weeks. We connect through standard FHIR/HL7 interfaces, so there's no custom engineering required on your side.",
        },
        {
            q: "What happens if Kairo goes down?",
            a: "Your existing triage workflow continues as-is. Kairo runs alongside your process, not in front of it. We also maintain 99.99% uptime with multi-zone redundancy.",
        },
        {
            q: "Is patient data safe?",
            a: "PHI is encrypted in transit and at rest, never stored outside your infrastructure, and we're HIPAA/HITRUST certified with SOC 2 Type II compliance.",
        },
        {
            q: "What EMR systems do you support?",
            a: "Epic, Cerner, Meditech, and Allscripts out of the box. Any system that speaks FHIR or HL7 can connect. Custom integrations are available for legacy systems.",
        },
        {
            q: "How much does it cost?",
            a: "Pricing scales with your ED volume. We offer a free pilot period so you can measure impact before committing. No long-term contracts required.",
        },
    ];

    return (
        <section id="faq" className="py-16 px-6" ref={ref}>
            <div className="max-w-3xl mx-auto">
                <h2 className="reveal text-2xl font-bold tracking-tight mb-10">Frequently asked questions</h2>
                <div className="space-y-0 divide-y divide-base-300">
                    {faqs.map((faq, i) => (
                        <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
    const ref = useRef<HTMLDetailsElement>(null);

    return (
        <details ref={ref} className={`reveal delay-${Math.min(index + 1, 5)} group`}>
            <summary className="flex items-center justify-between py-5 cursor-pointer text-sm font-medium text-base-content/80 hover:text-base-content transition-colors list-none [&::-webkit-details-marker]:hidden">
                {q}
                <svg className="w-4 h-4 text-base-content/30 group-open:rotate-45 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
            </summary>
            <p className="text-sm text-base-content/45 leading-relaxed pb-5 pr-8">{a}</p>
        </details>
    );
}

function FinalCTA() {
    const ref = useReveal();
    return (
        <section className="py-20 px-6 bg-base-200/30" ref={ref}>
            <div className="max-w-5xl mx-auto text-center">
                <h2 className="reveal text-3xl font-bold tracking-tight mb-3">See if Kairo works for your team</h2>
                <p className="reveal delay-1 text-base-content/40 text-sm mb-8 max-w-md mx-auto">
                    15-minute setup. Connects to your EMR. No contracts until you&apos;re ready.
                </p>
                <div className="reveal delay-2 flex items-center justify-center gap-4">
                    <Link href="/auth/signup" className="btn btn-neutral rounded-lg px-8 text-sm hover:scale-[1.02] transition-transform">Get Started</Link>
                    <a href="#demo" className="text-sm text-base-content/40 hover:text-base-content transition-colors">Learn more &uarr;</a>
                </div>
            </div>
        </section>
    );
}

function LandingFooter() {
    return (
        <footer className="border-t border-base-300/50 py-5 px-6">
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-base-content/30">
                <span className="font-semibold text-base-content/50">Kairo</span>
                <div className="flex items-center gap-4">
                    <a href="#" className="hover:text-base-content/50 transition-colors">Privacy</a>
                    <a href="#" className="hover:text-base-content/50 transition-colors">Terms</a>
                    <a href="#" className="hover:text-base-content/50 transition-colors">Security</a>
                </div>
                <span>&copy; 2026 Kairo Health &middot; HIPAA Compliant</span>
            </div>
        </footer>
    );
}

export default function Home() {
    return (
        <div className="min-h-screen bg-base-100">
            <LandingNavbar />
            <HeroSection />
            <WhatItDoes />
            <BeforeAfter />
            <WhyItMatters />
            <Integration />
            <Testimonials />
            <Trust />
            <FAQ />
            <FinalCTA />
            <LandingFooter />
        </div>
    );
}
