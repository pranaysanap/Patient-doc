export { default } from "next-auth/middleware";

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/fitness-tracker/:path*",
        "/heart-monitor/:path*",
        "/mental-wellness/:path*",
        "/symptom-checker/:path*",
        "/analysis/:path*",
        "/doctor-appointments/:path*",
        "/learning-center/:path*",
        "/patient-report/:path*",
        "/prescriptions/:path*",
        "/menstruation-tracker/:path*",
        "/hospital-locator/:path*",
        "/vision/:path*",
        "/health-hub/:path*",
        "/privacy-consent/:path*",
    ],
};
