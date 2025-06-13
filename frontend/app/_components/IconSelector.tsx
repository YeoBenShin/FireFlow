// Need to find a way to make the dropdown disappear when clicking outside of it
'use client';

import { useState } from "react";
import {
  MousePointerClick,
  Cake,
  Gift,
  Dog,
  Cat,
  Home,
  ShoppingCart,
  DollarSign,
  PiggyBank,
  Calendar,
  Dumbbell,
  Plane,
  Bus,
  CarFront,
  Wrench,
  Heart,
  Rss,
  LucideIcon,
} from "lucide-react";

type IconName =
   "mousePointerClick"
  | "cake"
  | "gift"
  | "dog"
  | "cat"
  | "home"
  | "cart"
  | "dollar"
  | "piggyBank"
  | "calendar"
  | "dumbbell"
  | "plane"
  | "bus"
  | "carFront"
  | "wrench"
  | "heart"
  | "rss";

const iconOptions: Record<IconName, LucideIcon> = {
  mousePointerClick: MousePointerClick,
  cake: Cake,
  gift: Gift,
  dog: Dog,
  cat: Cat,
  home: Home,
  cart: ShoppingCart,
  dollar: DollarSign,
  piggyBank: PiggyBank,
  calendar: Calendar,
  dumbbell: Dumbbell,
  plane: Plane,
  bus: Bus,
  carFront: CarFront,
  wrench: Wrench,
  heart: Heart,
  rss: Rss,
};

export default function IconSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<IconName>("mousePointerClick");
  const SelectedIcon = iconOptions[selected];

  const handleSelect = (name: IconName) => {
    setSelected(name);
    setIsOpen(false);
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 flex bg-orange-500 p-3 rounded-lg hover:bg-orange-600 transition">
        <span className="flex items-center justify-center text-white gap-2"> 
          {<SelectedIcon className="w-6 h-6" />}
        </span>
      </button>
      

      {isOpen && (
        <div className="absolute mt-2 max-h-48 overflow-y-scroll bg-white shadow-md border rounded-md z-10">
          {Object.entries(iconOptions).map(([name, Icon]) => (
            <button
              key={name}
              onClick={() => handleSelect(name as IconName)}
              className="flex justify-center p-2 hover:bg-gray-100 w-full"
            >
              <Icon className="w-6 h-6" />
            </button>
          ))}
        </div>
      )}

    </div>
  );
}