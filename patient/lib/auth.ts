import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    // Request access to Google Fit API scopes for smartwatch data
                    scope: [
                        "openid",
                        "email",
                        "profile",
                        "https://www.googleapis.com/auth/fitness.activity.read",
                        "https://www.googleapis.com/auth/fitness.blood_glucose.read",
                        "https://www.googleapis.com/auth/fitness.blood_pressure.read",
                        "https://www.googleapis.com/auth/fitness.body.read",
                        "https://www.googleapis.com/auth/fitness.body_temperature.read",
                        "https://www.googleapis.com/auth/fitness.heart_rate.read",
                        "https://www.googleapis.com/auth/fitness.location.read",
                        "https://www.googleapis.com/auth/fitness.nutrition.read",
                        "https://www.googleapis.com/auth/fitness.oxygen_saturation.read",
                        "https://www.googleapis.com/auth/fitness.reproductive_health.read",
                        "https://www.googleapis.com/auth/fitness.sleep.read",
                    ].join(" "),
                    // Request offline access to get refresh token
                    access_type: "offline",
                    prompt: "consent",
                },
            },
        }),
    ],
    pages: {
        signIn: "/sign-in",
        signOut: "/",
        error: "/sign-in",
    },
    callbacks: {
        async jwt({ token, account, profile }) {
            // Persist the OAuth access_token and refresh token to the token right after signin
            if (account) {
                token.accessToken = account.access_token;
                token.refreshToken = account.refresh_token;
                token.accessTokenExpires = account.expires_at;
            }
            return token;
        },
        async session({ session, token }) {
            // Send properties to the client, like an access_token from a provider
            if (session.user) {
                (session as any).accessToken = token.accessToken;
                (session as any).refreshToken = token.refreshToken;
                (session.user as any).id = token.sub;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
