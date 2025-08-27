

"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// This page is deprecated. The functionality has been moved to a dialog
// in the main layaways page. Redirecting to the layaways list.
export default function NewLayawayPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/dashboard/layaways');
    }, [router]);

    return null; // Render nothing while redirecting
}
