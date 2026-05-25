import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {

    const inventory = await prisma.inventory.findMany({
      include: {
        product: true,
        warehouse: true,
      },
    });

    const formattedData = inventory.map((item) => ({

      inventoryId: item.id,

      productId: item.productId,
      warehouseId: item.warehouseId,

      product: item.product.name,
      warehouse: item.warehouse.name,

      totalStock: item.totalStock,
      reservedStock: item.reservedStock,

      availableStock:
        item.totalStock - item.reservedStock,

    }));

    return NextResponse.json(formattedData);

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );

  }
}