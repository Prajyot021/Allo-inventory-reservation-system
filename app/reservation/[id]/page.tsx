import ReservationActions from "@/components/ReservationActions";
import CountdownTimer from "@/components/CountdownTimer";

async function getReservation(id: string) {

  const res = await fetch(
    `http://localhost:3000/api/reservations/${id}`,
    {
      cache: "no-store",
    }
  );

  return res.json();
}

export default async function ReservationPage({
  params,
}: {
  params: { id: string };
}) {

  const reservation =
    await getReservation(params.id);

  return (
    <main className="min-h-screen bg-gray-100 p-10">

      <div className="max-w-2xl mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Reservation Details
        </h1>

        <div className="bg-white shadow-md rounded-xl p-6 space-y-4">

          <div>
            <p className="text-sm text-gray-500">
              Reservation ID
            </p>

            <p className="font-medium break-all">
              {reservation.id}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Status
            </p>

            <p className="font-semibold capitalize">
              {reservation.status}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Quantity
            </p>

            <p className="font-medium">
              {reservation.quantity}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Expires At
            </p>

            <p className="font-medium">
              {new Date(
                reservation.expiresAt
              ).toLocaleString()}
            </p>
          </div>

          <CountdownTimer
            expiresAt={reservation.expiresAt}
          />

          <ReservationActions
            reservationId={reservation.id}
          />

        </div>

      </div>

    </main>
  );
}