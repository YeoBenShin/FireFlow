import {RecentTransaction} from './_components/RecentTransaction';
import {ProgressBar} from './_components/ProgressBar';
import {IconSelector} from './_components/IconSelector';

export default function Home() {
  const defaultStyles = {
        margin: "10px"
        };

  return (
    // Example of Dynamic UI based on screen size
    <div className="text-center mt-10">
      <div className="block lg:hidden text-blue-600 font-bold text-xl">
        Mobile UI
      </div>
      <div className="hidden lg:block text-green-600 font-bold text-xl">
        Laptop UI
      </div>

      {/* Testing the components */}
      <div className="flex flex-col items-center justify-center min-h-screen">
          <RecentTransaction/>
          <div style={defaultStyles}></div>
          <ProgressBar current={2000} total={10000} />
          <IconSelector/>
          {/* <IconSelector onSelect={(icon) => console.log("Selected icon:", icon)} /> */}
        </div>

    </div>
  );
}
