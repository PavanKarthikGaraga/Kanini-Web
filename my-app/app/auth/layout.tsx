export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex flex-col items-center justify-center bg-secondary text-secondary-content p-12 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-20 -left-20 w-64 h-64 rounded-full border border-secondary-content/5"></div>
                <div className="absolute bottom-10 -right-10 w-48 h-48 rounded-full border border-secondary-content/5"></div>
                <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-primary"></div>

                <div className="max-w-sm text-center relative z-10">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary-content/40 mb-4">AI-Powered Triage</p>
                    <h1 className="text-4xl font-bold mb-4 tracking-tight">Kairo</h1>
                    <p className="text-sm text-secondary-content/50 leading-relaxed mb-10">
                        Rapidly assess patient risk, prioritize care, and make faster clinical decisions with explainable AI.
                    </p>
                    <div className="flex flex-col gap-4 text-left text-sm">
                        <div className="flex items-center gap-3 text-secondary-content/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>
                            <span>Classify patients into Low, Medium & High risk</span>
                        </div>
                        <div className="flex items-center gap-3 text-secondary-content/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>
                            <span>Recommend the right medical department</span>
                        </div>
                        <div className="flex items-center gap-3 text-secondary-content/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>
                            <span>Transparent, explainable insights</span>
                        </div>
                        <div className="flex items-center gap-3 text-secondary-content/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>
                            <span>Voice capture & document uploads</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex items-center justify-center bg-base-100 p-6 lg:p-12">
                <div className="w-full max-w-lg">
                    {/* Mobile branding header */}
                    <div className="lg:hidden text-center mb-8">
                        <h1 className="text-2xl font-bold text-base-content">Kairo</h1>
                        <p className="text-xs text-base-content/40 uppercase tracking-wider">AI-Powered Patient Triage</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
