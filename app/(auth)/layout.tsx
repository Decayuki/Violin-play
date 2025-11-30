export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-accent-400 to-accent-600 bg-clip-text text-transparent">
                        ViolinApp
                    </h1>
                    <p className="text-text-secondary mt-2">Sign in to continue your practice</p>
                </div>
                {children}
            </div>
        </div>
    );
}
