// components/Navbar.tsx
import { Menu } from "lucide-react";
import Image from 'next/image';


export default function Navbar() {
  return (
    <nav className="flex items-center justify-between bg-white px-6 py-3 shadow-md">
      {/* Left: Logo */}
      <div className="text-xl font-bold text-blue-600">Multi-Techno</div>

      {/* Right: Profile + Menu */}
      <div className="flex items-center gap-4">
        <Image
          src="/user_profile.png" // Replace with actual image path or dynamic avatar
          alt="Profile"
          width="100"
          height="100"
          className="w-8 h-8 rounded-full object-cover"
        />
        <button className="md:hidden">
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
      </div>
    </nav>
  );
}
