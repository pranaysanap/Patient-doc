import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
            <div className="w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Create Your Account</h1>
                    <p className="text-muted-foreground">
                        Join EchoMed and start your health journey today
                    </p>
                </div>
                <SignUp
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
                    path="/sign-up"
                    signInUrl="/sign-in"
                />
            </div>
        </div>
    );
}
