"use client";

import { useEffect } from "react";
import { useHistoryStore } from "../hooks/useStores";
import { useRouter } from "next/navigation";

const NavigationEvents = () => {
  const { previousPathname, setPreviousPathname } = useHistoryStore(
    (state) => state
  );
  const router = useRouter();

  useEffect(() => {
    window.addEventListener("popstate", (event) => {
      const pathname = window.location.pathname;
      if (pathname === "/" && previousPathname === "/create") {
        router.refresh();
        setPreviousPathname("/");
      }
    });
  }, [previousPathname, setPreviousPathname, router]);

  return null;
};

export default NavigationEvents;
