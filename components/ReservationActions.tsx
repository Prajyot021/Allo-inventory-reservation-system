"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  reservationId: string;
};

export default function ReservationActions({
  reservationId,
}: Props) {

  const router = useRouter();

  const [reservation, setReservation] =
    useState<any>(null);

  useEffect(() => {

    async function loadReservation() {

      const res = await fetch(
        `/api/reservations/${reservationId}`
      );

      const data = await res.json();

      setReservation(data);
    }

    loadReservation();

  }, [reservationId]);

  if (!reservation) {
    return null;
  }

  const expired =
    new Date(reservation.expiresAt) <
    new Date();

  async function handleConfirm() {

    const res = await fetch(
      `/api/reservations/${reservationId}/confirm`,
      {
        method: "POST",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    alert("Purchase confirmed");

    router.push("/");
    router.refresh();
  }

  async function handleCancel() {

    const res = await fetch(
      `/api/reservations/${reservationId}/release`,
      {
        method: "POST",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    alert("Reservation cancelled");

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex gap-4 mt-6">

      <button
        onClick={handleConfirm}
        disabled={
          expired ||
          reservation.status !== "pending"
        }
        className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        Confirm Purchase
      </button>

      <button
        onClick={handleCancel}
        disabled={
          expired ||
          reservation.status !== "pending"
        }
        className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        Cancel Reservation
      </button>

    </div>
  );
}