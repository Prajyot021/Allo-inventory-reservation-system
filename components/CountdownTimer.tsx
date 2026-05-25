"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  expiresAt: string;
};

export default function CountdownTimer({
  expiresAt,
}: Props) {

  const router = useRouter();

  const [timeLeft, setTimeLeft] =
    useState("");

  useEffect(() => {

    const interval = setInterval(() => {

      const now = new Date().getTime();

      const expiry =
        new Date(expiresAt).getTime();

      const distance = expiry - now;

      if (distance <= 0) {

        setTimeLeft("Expired");

        clearInterval(interval);

        router.refresh();

        return;
      }

      const minutes =
        Math.floor(distance / 1000 / 60);

      const seconds =
        Math.floor((distance / 1000) % 60);

      setTimeLeft(
        `${minutes}:${
          seconds < 10
            ? "0"
            : ""
        }${seconds}`
      );

    }, 1000);

    return () => clearInterval(interval);

  }, [expiresAt, router]);

  return (
    <p className="text-red-500 font-semibold">
      Expires In: {timeLeft}
    </p>
  );
}