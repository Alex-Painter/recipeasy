"use client";

import React, { useEffect } from "react";
import Avatar from "./Avatar";
import Image from "next/image";
import Link from "next/link";
import { EnrichedUser } from "../lib/auth";
import { useBalanceStore } from "../hooks/useStores";
import Button from "./UI/Button";
import { usePathname } from "next/navigation";

const AppBar = ({ user }: { user: Omit<EnrichedUser, "id"> | undefined }) => {
  const { balance, setBalance } = useBalanceStore((state) => state);
  const pathname = usePathname();

  console.log(user);

  useEffect(() => {
    if (user?.coinBalance !== null && user?.coinBalance !== undefined) {
      setBalance(user.coinBalance);
    }
  }, [user, setBalance]);

  const taglineStyle = pathname === "/" ? "block" : "hidden sm:block";
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
        <div
          className={`${taglineStyle} prose text-orange-400 text-sm overflow-hidden whitespace-nowrap text-ellipsis mr-2`}
        >
          What will you create today?
        </div>
      </div>
      {pathname !== "/" && (
        <div className="mr-4 md:mr-16">
          <Link href="/">
            <Button>Create</Button>
          </Link>
        </div>
      )}
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
