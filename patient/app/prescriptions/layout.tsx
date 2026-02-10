import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Prescriptions | VaidyaSetu",
    description: "View and download your medical prescriptions",
};

export default function PrescriptionsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
