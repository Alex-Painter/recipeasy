"use client";

import { useEffect } from "react";
import { useHistoryStore } from "../hooks/useStores";
import { useRouter } from "next/navigation";

const NavigationEvents = ({ children }: { children: React.ReactNode }) => {
  const { previousPathname, setPreviousPathname } = useHistoryStore(
    (state) => state
  );
  const router = useRouter();

  useEffect(() => {
    window.addEventListener("popstate", (event) => {
      const pathname = window.location.pathname;

      if (pathname === "/" && previousPathname === "/create") {
        setPreviousPathname("/");
        router.refresh();
      }
    });
  }, [previousPathname, setPreviousPathname, router]);

  return children;
};

export default NavigationEvents;
