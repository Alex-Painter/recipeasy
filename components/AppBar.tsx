"use client";

import React, { useEffect } from "react";
import Avatar from "./Avatar";
import Image from "next/image";
import Link from "next/link";
import { EnrichedUser } from "../lib/auth";
import { useBalanceStore } from "../hooks/useStores";

const AppBar = ({ user }: { user: Omit<EnrichedUser, "id"> | undefined }) => {
  const { balance, setBalance } = useBalanceStore((state) => state);

  useEffect(() => {
    if (user?.coinBalance !== null && user?.coinBalance !== undefined) {
      setBalance(user.coinBalance);
    }
  }, [user, setBalance]);

  return (
    <div className="navbar sticky top-0 z-10 bg-white">
      <div className="flex-1">
        <Link href="/">
          <Image
            src="/logo-img.jpg"
            alt="Cartoon image of an AI-generated omlette"
            className="w-8 h-8 mr-4"
            width={1024}
            height={1024}
          />
        </Link>
        <div className="prose text-orange-400 text-sm">
          What will you create today?
        </div>
      </div>
      {balance !== null && (
        <Link href="/coins">
          <Image
            src="/10-coins.png"
            alt="Cartoon coin icon"
            className="w-6 h-6 mr-1"
            width={1024}
            height={1024}
          />
          <span className="mr-4">{balance}</span>
        </Link>
      )}
      <Avatar imageSrc={user?.image} name={user?.name} shouldShowMenu={true} />
    </div>
  );
};

export default AppBar;
