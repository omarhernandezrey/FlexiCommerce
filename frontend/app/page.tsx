export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">🚀 FlexiCommerce</h1>
      <p className="mt-4 text-lg text-gray-600">
        Plataforma de e-commerce profesional
      </p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 border rounded-lg hover:shadow-lg transition">
          <h2 className="font-bold">📦 Productos</h2>
          <p className="text-sm text-gray-600">Gestión de catálogo</p>
        </div>
        <div className="p-6 border rounded-lg hover:shadow-lg transition">
          <h2 className="font-bold">🛒 Carrito</h2>
          <p className="text-sm text-gray-600">Sistema de compra</p>
        </div>
      </div>
    </main>
  );
}
