import type { Metadata } from "next";

import ResetForm from "@/components/auth/ResetForm";

export const metadata: Metadata = {
    title: "Reset your password",
};

export default function ResetPage() {
    return <ResetForm />;
}
