"use client";

import { useRouter } from "next/navigation";

type Props = {
  productId: string;
  warehouseId: string;
};

export default function ReserveButton({
  productId,
  warehouseId,
}: Props) {

  const router = useRouter();

  async function handleReserve() {
    console.log("clicked");
    const res = await fetch(
      "/api/reservations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          warehouseId,
          quantity: 1,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    router.push(
      `/reservation/${data.id}`
    );
  }

  return (
    <button
      onClick={handleReserve}
      className="mt-4 bg-black text-white px-4 py-2 rounded"
    >
      Reserve
    </button>
  );
}