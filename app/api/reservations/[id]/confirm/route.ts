import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {

    const reservationId = params.id;

    const result = await prisma.$transaction(async (tx) => {

      // Find reservation
      const reservation = await tx.reservation.findUnique({
        where: {
          id: reservationId,
        },
      });

      if (!reservation) {
        throw new Error("Reservation not found");
      }

      // Check expiry
      if (
        reservation.expiresAt < new Date()
      ) {
        throw new Error("Reservation expired");
      }

      // Already confirmed
      if (reservation.status !== "pending") {
        throw new Error("Reservation already processed");
      }

      // Find inventory
      const inventory = await tx.inventory.findFirst({
        where: {
          productId: reservation.productId,
          warehouseId: reservation.warehouseId,
        },
      });

      if (!inventory) {
        throw new Error("Inventory not found");
      }

      // Permanently reduce stock
      await tx.inventory.update({
        where: {
          id: inventory.id,
        },
        data: {
          totalStock: {
            decrement: reservation.quantity,
          },
          reservedStock: {
            decrement: reservation.quantity,
          },
        },
      });

      // Confirm reservation
      const updatedReservation =
        await tx.reservation.update({
          where: {
            id: reservation.id,
          },
          data: {
            status: "confirmed",
          },
        });

      return updatedReservation;
    });

    return NextResponse.json(result);

  } catch (error) {

    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong";

    if (message === "Reservation expired") {
      return NextResponse.json(
        { error: message },
        { status: 410 }
      );
    }

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}