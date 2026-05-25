import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {

    // Find expired reservations
    const expiredReservations =
      await prisma.reservation.findMany({
        where: {
          status: "pending",
          expiresAt: {
            lt: new Date(),
          },
        },
      });

    for (const reservation of expiredReservations) {

      await prisma.$transaction(async (tx) => {

        // Find inventory
        const inventory =
          await tx.inventory.findFirst({
            where: {
              productId: reservation.productId,
              warehouseId: reservation.warehouseId,
            },
          });

        if (!inventory) {
          return;
        }

        // Release stock
        await tx.inventory.update({
          where: {
            id: inventory.id,
          },
          data: {
            reservedStock: {
              decrement: reservation.quantity,
            },
          },
        });

        // Mark reservation released
        await tx.reservation.update({
          where: {
            id: reservation.id,
          },
          data: {
            status: "released",
          },
        });

      });

    }

    return NextResponse.json({
      message: "Expired reservations released",
      count: expiredReservations.length,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}