import Link from "next/link";

function LandingNavbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-base-100/80 backdrop-blur-lg border-b border-base-300/50">
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="text-lg font-bold tracking-tight text-base-content">Kairo</Link>
                    <div className="hidden md:flex items-center gap-6 text-sm text-base-content/60">
                        <a href="#how-it-works" className="hover:text-base-content transition-colors">How it works</a>
                        <a href="#features" className="hover:text-base-content transition-colors">For Hospitals</a>
                        <a href="#precision" className="hover:text-base-content transition-colors">Research</a>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/auth/login" className="text-sm text-base-content/60 hover:text-base-content transition-colors hidden sm:block">Sign in</Link>
                    <Link href="/auth/signup" className="btn btn-secondary btn-sm rounded-full px-5 text-xs font-semibold uppercase tracking-wider">Request Demo</Link>
                </div>
            </div>
        </nav>
    );
}

function HeroSection() {
    return (
        <section className="pt-32 pb-20 px-6">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        The future of triage
                    </p>
                    <h1 className="text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-base-content mb-6">
                        AI-Powered<br />Patient Triage
                    </h1>
                    <p className="text-base-content/50 text-lg leading-relaxed max-w-md mb-10">
                        Elevate clinical workflow with precision intelligence. Prioritize risk, reduce wait times, and transform the patient experience through automated medical reasoning.
                    </p>
                    <div className="flex items-center gap-4">
                        <Link href="/auth/signup" className="btn btn-secondary rounded-full px-8 text-sm font-medium">Request a Demo</Link>
                        <a href="#how-it-works" className="flex items-center gap-2 text-sm text-base-content/50 hover:text-base-content transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M10 8.5l5 3.5-5 3.5V8.5z"/></svg>
                            See the technology
                        </a>
                    </div>
                </div>
                <div className="hidden lg:block">
                    <div className="bg-base-200/50 rounded-2xl border border-base-300 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-3 h-3 rounded-full bg-base-300"></div>
                            <div className="w-3 h-3 rounded-full bg-base-300"></div>
                            <div className="w-3 h-3 rounded-full bg-base-300"></div>
                        </div>
                        <div className="space-y-4">
                            <div className="h-3 bg-base-300/60 rounded w-2/3"></div>
                            <div className="h-3 bg-base-300/60 rounded w-1/2"></div>
                            <div className="mt-6 p-4 bg-base-100 rounded-lg border border-base-300 shadow-sm">
                                <p className="text-[10px] uppercase tracking-wider text-base-content/40 mb-1">Priority Status</p>
                                <div className="h-1 w-16 bg-primary rounded mb-3"></div>
                                <p className="text-2xl font-semibold italic text-base-content/80">Critical</p>
                            </div>
                            <div className="h-3 bg-base-300/40 rounded w-3/4 mt-4"></div>
                            <div className="h-3 bg-base-300/40 rounded w-1/3"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function StatsSection() {
    const stats = [
        { value: "40%", label: "Efficiency Gain", sublabel: "faster" },
        { value: "99.2%", label: "Diagnostic Accuracy", sublabel: "" },
        { value: "Tier 1", label: "Compliance", sublabel: "" },
        { value: "< 14", label: "Deploy Time", sublabel: "days" },
    ];
    return (
        <section className="pb-20 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-4 h-4 rounded bg-primary/20 border border-primary/30"></div>
                    <div className="w-4 h-4 rounded bg-secondary/20 border border-secondary/30"></div>
                    <div className="w-4 h-4 rounded bg-accent/20 border border-accent/30"></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-base-300 pt-8">
                    {stats.map((s) => (
                        <div key={s.label}>
                            <p className="text-xs text-base-content/40 uppercase tracking-wider mb-2">{s.label}</p>
                            <p className="text-3xl font-bold tracking-tight text-base-content">
                                {s.value} {s.sublabel && <span className="text-lg font-normal text-base-content/40">{s.sublabel}</span>}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function ProblemSolutionSection() {
    const problems = [
        { icon: "!", title: "Inefficient Manual Protocols", desc: "Reliance on static, paper-based assessment tools creates significant latency in critical care decision windows." },
        { icon: "△", title: "Subtle Symptom Oversight", desc: "High-volume environments often mask early-stage clinical deterioration that human observation might miss." },
        { icon: "◇", title: "Cognitive Decision Fatigue", desc: "Constant screening of hundreds of patients leads to burnout and reduced diagnostic accuracy over long shifts." },
    ];
    const solutions = [
        { icon: "⚡", title: "Dynamic Risk Scoring", desc: "Algorithmic risk classification that updates in real-time as patient vitals and documentation are ingested." },
        { icon: "⟐", title: "Automated Triage Routing", desc: "Intelligent load balancing across hospital departments based on clinical urgency and current resource availability." },
        { icon: "◈", title: "Explainable AI Insights", desc: "Transparent logic overlays that explain the 'why' behind every recommendation, fostering physician confidence." },
    ];

    return (
        <section id="how-it-works" className="py-20 px-6 bg-base-200/30">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/30 mb-3">Phase 01</p>
                        <h2 className="text-3xl font-bold tracking-tight mb-8">The Problem:<br/>Patient Bottlenecks</h2>
                        <div className="space-y-8">
                            {problems.map((p) => (
                                <div key={p.title} className="flex gap-4">
                                    <span className="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center text-xs text-base-content/40 shrink-0">{p.icon}</span>
                                    <div>
                                        <h3 className="font-semibold text-sm mb-1">{p.title}</h3>
                                        <p className="text-sm text-base-content/50 leading-relaxed">{p.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">Phase 02</p>
                        <h2 className="text-3xl font-bold tracking-tight mb-8">The AI-Driven<br/>Solution</h2>
                        <div className="space-y-8">
                            {solutions.map((s) => (
                                <div key={s.title} className="flex gap-4">
                                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary shrink-0">{s.icon}</span>
                                    <div>
                                        <h3 className="font-semibold text-sm mb-1">{s.title}</h3>
                                        <p className="text-sm text-base-content/50 leading-relaxed">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function ProcessSection() {
    const steps = [
        { num: "01", title: "Ingestion", desc: "Securely capture patient history and vitals via encrypted clinical gateways." },
        { num: "02", title: "Analysis", desc: "Proprietary LLMs process data against verified peer-reviewed medical datasets." },
        { num: "03", title: "Prioritization", desc: "Generate immediate risk-stratified categories for clinical intervention." },
        { num: "04", title: "Integration", desc: "Direct write-back to EMR systems to optimize hospital resource allocation." },
    ];

    return (
        <section className="py-20 px-6">
            <div className="max-w-6xl mx-auto text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">Methodology</p>
                <h2 className="text-3xl font-bold tracking-tight mb-3">The Triage Process</h2>
                <p className="text-base-content/50 max-w-lg mx-auto mb-16">A streamlined architectural approach to clinical decision support, designed for speed and diagnostic accuracy.</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-0 relative">
                    <div className="hidden md:block absolute top-5 left-[12.5%] right-[12.5%] h-px bg-base-300"></div>
                    {steps.map((s) => (
                        <div key={s.num} className="relative px-4 text-left">
                            <div className="w-10 h-10 rounded-lg border-2 border-primary/30 bg-base-100 flex items-center justify-center text-xs font-bold text-primary mb-4 relative z-10">{s.num}</div>
                            <h3 className="font-semibold text-sm uppercase tracking-wider mb-2">{s.title}</h3>
                            <p className="text-xs text-base-content/50 leading-relaxed">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function PrecisionSection() {
    const features = [
        { label: "Precision", title: "Rapid Risk Classification", desc: "Our classification engine operates with sub-second latency, providing high-fidelity acuity scoring that reduces emergency department wait times by eliminating manual pre-sorting bottlenecks." },
        { label: "Clarity", title: "Seamless Healthcare Integration", desc: "Universal interoperability via FHIR and HL7 standards. We prioritize data clarity by ensuring bi-directional sync with Epic, Cerner, and Meditech without disrupting existing clinical workflows." },
        { label: "Intelligence", title: "Specialist Routing Optimization", desc: "Dynamic routing protocols match complex cases with available on-call specialists. By analyzing clinical depth and shift availability simultaneously, we ensure the right expertise meets every patient." },
    ];

    return (
        <section id="precision" className="py-20 px-6 bg-base-200/30">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold tracking-tight mb-2">Core Precision</h2>
                <div className="w-8 h-0.5 bg-primary mb-12"></div>

                <div className="space-y-0 divide-y divide-base-300">
                    {features.map((f) => (
                        <div key={f.label} className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-4 py-8">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{f.label}</p>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                                <p className="text-sm text-base-content/50 leading-relaxed max-w-2xl">{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function DarkCTASection() {
    return (
        <section className="py-12 px-6" id="features">
            <div className="max-w-6xl mx-auto">
                <div className="bg-secondary text-secondary-content rounded-2xl overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                        {/* Left — Visual */}
                        <div className="p-12 flex items-center justify-center relative">
                            <div className="w-48 h-48 rounded-full border border-secondary-content/10 flex items-center justify-center relative">
                                <div className="w-32 h-32 rounded-full border border-secondary-content/10 flex items-center justify-center">
                                    <div className="w-16 h-16 rounded-full border border-secondary-content/15 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-secondary-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    </div>
                                </div>
                                <div className="absolute top-2 right-8 w-2 h-2 rounded-full bg-primary"></div>
                            </div>
                        </div>
                        {/* Right — Content */}
                        <div className="p-12 flex flex-col justify-center">
                            <h2 className="text-2xl font-bold mb-4 leading-tight">Built for clinicians, <span className="underline decoration-primary underline-offset-4">by medical experts.</span></h2>
                            <p className="text-sm text-secondary-content/60 leading-relaxed mb-6">
                                We understand the cognitive load of high-volume environments. Our system acts as a silent partner, enhancing clinical judgment through data-driven clarity.
                            </p>
                            <div className="flex items-center gap-6 text-xs">
                                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary"></span>HITRUST Certified</span>
                                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-accent"></span>GDPR Compliant</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function FinalCTA() {
    return (
        <section className="py-24 px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Ready to optimize triage?</h2>
            <p className="text-base-content/50 max-w-md mx-auto mb-10">
                Join leading healthcare networks in defining the future of patient outcomes.
            </p>
            <div className="flex items-center justify-center gap-4">
                <Link href="/auth/signup" className="btn btn-primary rounded-full px-8 text-sm">Learn More</Link>
                <a href="#" className="btn btn-ghost border border-base-300 rounded-full px-8 text-sm">Technical Briefing</a>
            </div>
        </section>
    );
}

function LandingFooter() {
    return (
        <footer className="border-t border-base-300 py-6 px-6">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                    <span className="font-bold">Kairo</span>
                </div>
                <p className="text-xs text-base-content/40">&copy; 2026 Kairo Health Systems &middot; HIPAA Compliant</p>
            </div>
        </footer>
    );
}

export default function Home() {
    return (
        <div className="min-h-screen bg-base-100">
            <LandingNavbar />
            <HeroSection />
            <StatsSection />
            <ProblemSolutionSection />
            <ProcessSection />
            <PrecisionSection />
            <DarkCTASection />
            <FinalCTA />
            <LandingFooter />
        </div>
    );
}
