type PageProps = {
  searchParams: Promise<{ order_id?: string; session_id?: string }>;
};

export default async function OrderSuccessPage({ searchParams }: PageProps) {
  const { order_id } = await searchParams;

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center space-y-4">
        <div className="text-6xl">✅</div>
        <h1 className="text-2xl font-bold text-white">Payment Received!</h1>
        <p className="text-zinc-400 text-sm">
          Your order has been placed and your payment was successful. We&apos;ll get started right away.
        </p>
        {order_id && (
          <p className="text-zinc-500 text-xs font-mono break-all">
            Order #{order_id}
          </p>
        )}
      </div>
    </div>
  );
}
