import {RecentTransaction} from './_components/RecentTransaction';
import Transaction, {Transaction as TransactionType} from './_components/Transaction';
import ProgressBar from './_components/ProgressBar';
import IconSelector from './_components/IconSelector';
import Image from 'next/image';

import {Cake, Dog, Home} from "lucide-react";

export default function HomePage() {
  const defaultStyles = {
        margin: "10px"
  };

  const transactions: TransactionType[] = [
  {
    id: "1",
    title: "Fruits And Vegetables",
    category: "Grocery",
    amount: -12.3,
    date: "Today, 18 May 2025",
    time: "10:30",
    icon: Cake,
    type: "expense",
  },
  {
    id: "2",
    title: "Salary For The Month",
    category: "Income",
    amount: 4000.0,
    date: "Today, 18 May 2025",
    time: "16:27",
    icon: Dog,
    type: "income",
  },
  {
    id: "3",
    title: "Rent For The Month",
    category: "Housing",
    amount: 2000.0,
    date: "Tue, 29 April 2025",
    time: "15:47",
    icon: Home,
    type: "income",
  },
]

  return (
    // Example of Dynamic UI based on screen size
    <div className="text-center mt-10">
      <div className="block lg:hidden text-blue-600 font-bold text-xl">
        Mobile UI
      </div>
      <div className="hidden lg:block text-green-600 font-bold text-xl">
        Laptop UI
      </div>
      <header>
        <Image
          src="/image.svg"
          alt="Logo"
          width={96} 
          height={96}
          className="mx-auto mb-4"
        />
      </header>

      {/* Testing the components */}
      <div className="flex flex-col items-center justify-center min-h-screen">
          <RecentTransaction/>
          <div style={defaultStyles}/>

          <div>
            {transactions.map((item) => (
            <Transaction key={item.id} transaction={item} />
            ))}
          </div>
          <div style={defaultStyles}/>

          <ProgressBar current={2000} total={10000} />
          <IconSelector/>
        </div>
        
    </div>
  );
}
