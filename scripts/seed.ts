import { prisma } from "../lib/prisma";

async function main() {
  // Create products
  const iphone = await prisma.product.create({
    data: {
      name: "iPhone 15",
    },
  });

  const shoes = await prisma.product.create({
    data: {
      name: "Nike Shoes",
    },
  });

  // Create warehouses
  const delhi = await prisma.warehouse.create({
    data: {
      name: "Delhi Warehouse",
    },
  });

  const mumbai = await prisma.warehouse.create({
    data: {
      name: "Mumbai Warehouse",
    },
  });

  // Create inventory
  await prisma.inventory.createMany({
    data: [
      {
        productId: iphone.id,
        warehouseId: delhi.id,
        totalStock: 10,
      },
      {
        productId: iphone.id,
        warehouseId: mumbai.id,
        totalStock: 5,
      },
      {
        productId: shoes.id,
        warehouseId: delhi.id,
        totalStock: 20,
      },
    ],
  });

  console.log("Seed data inserted");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });