import ReserveButton from "@/components/ReserveButton";

async function getProducts() {

  const res = await fetch(
    "http://localhost:3000/api/products",
    {
      cache: "no-store",
    }
  );

  return res.json();
}

export default async function HomePage() {

  const products = await getProducts();

  return (
    <main className="min-h-screen bg-gray-100 p-10">

      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Inventory System
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {products.map((item: any) => (

            <div
              key={item.inventoryId}
              className="bg-white rounded-xl shadow-md p-6"
            >

              <h2 className="text-2xl font-semibold mb-3">
                {item.product}
              </h2>

              <div className="space-y-2 text-gray-700">

                <p>
                  Warehouse:
                  {" "}
                  {item.warehouse}
                </p>

                <p>
                  Total Stock:
                  {" "}
                  {item.totalStock}
                </p>

                <p>
                  Reserved Stock:
                  {" "}
                  {item.reservedStock}
                </p>

                <p className="font-semibold text-black">
                  Available Stock:
                  {" "}
                  {item.availableStock}
                </p>

              </div>

              <ReserveButton
                productId={item.productId}
                warehouseId={item.warehouseId}
              />

            </div>

          ))}

        </div>

      </div>

    </main>
  );
}