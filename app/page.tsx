export default function Home() {
  return (
    // Example of Dynamic UI based on screen size
    <div className="text-center mt-10">
      <div className="block lg:hidden text-blue-600 font-bold text-xl">
        Mobile UI
      </div>
      <div className="hidden lg:block text-green-600 font-bold text-xl">
        Laptop UI
      </div>
    </div>
  );
}
