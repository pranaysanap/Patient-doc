import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
            <div className="w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                    <p className="text-muted-foreground">
                        Sign in to access your VaidyaSetu dashboard
                    </p>
                </div>
                <SignIn
                    appearance={{
                        elements: {
                            formButtonPrimary:
                                "bg-primary hover:bg-primary/90 text-primary-foreground",
                            card: "shadow-xl",
                            headerTitle: "hidden",
                            headerSubtitle: "hidden",
                        },
                    }}
                    routing="path"
                    path="/sign-in"
                    signUpUrl="/sign-up"
                />
            </div>
        </div>
    );
}
