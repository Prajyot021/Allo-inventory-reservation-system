import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { productId, warehouseId, quantity } = body;

    const result = await prisma.$transaction(async (tx) => {

      // Find inventory
      const inventory = await tx.inventory.findFirst({
        where: {
          productId,
          warehouseId,
        },
      });

      if (!inventory) {
        throw new Error("Inventory not found");
      }

      // Calculate available stock
      const availableStock =
        inventory.totalStock - inventory.reservedStock;

      // Check stock
      if (availableStock < quantity) {
        throw new Error("Not enough stock");
      }

      // Update reserved stock
      await tx.inventory.update({
        where: {
          id: inventory.id,
        },
        data: {
          reservedStock: {
            increment: quantity,
          },
        },
      });

      // Create reservation
      const reservation = await tx.reservation.create({
        data: {
          productId,
          warehouseId,
          quantity,
          status: "pending",
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
      });

      return reservation;
    });

    return NextResponse.json(result);

  } catch (error) {

    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong";

    if (
      message === "Not enough stock"
    ) {
      return NextResponse.json(
        { error: message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}