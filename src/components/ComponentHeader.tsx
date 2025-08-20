import { Phone, Mail, Megaphone } from "lucide-react";
import Image from "next/image";

const ComponentHeader: React.FC = () => {
  return (
    <header className="w-full">
      {/* Top bar */}
      <div className="bg-white text-black text-sm flex flex-col sm:flex-row justify-between items-center px-4 py-1 gap-2 w-full">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">
            <Phone size={16} /> 04288 – 260333
          </span>
          <span className="flex items-center gap-2">
            <Mail size={16} /> aaascollege2021@gmail.com
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Megaphone size={16} />
          <span>Notice:</span>
          <a href="#" className="underline font-semibold">
            Admission Open
          </a>
        </div>
      </div>

      {/* Full-width image */}
      <div className="relative w-full h-24 sm:h-32 md:h-32 lg:h-20">
        <Image
          src="/uploads/image.png"
          alt="College Header"
          fill
          className="object-contain"
          priority
        />
      </div>
    </header>
  );
};

export default ComponentHeader;
