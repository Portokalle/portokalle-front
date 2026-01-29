"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { pageview, isAnalyticsEnabled } from "@/presentation/analytics/gtag";

export default function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isAnalyticsEnabled()) return;
    const qs = searchParams?.toString();
    const url = pathname + (qs ? `?${qs}` : "");
    pageview(url);
  }, [pathname, searchParams]);

  return null;
}
