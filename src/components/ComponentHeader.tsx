import { Phone, Mail, Megaphone } from "lucide-react";
import Image from "next/image";

const ComponentHeader: React.FC = () => {
  return (
    <header className="w-full overflow-hidden">
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

      {/* Full-width image (uses viewport width for reliable centering) */}
      <div className="relative h-32 sm:h-40 md:h-52 lg:h-60 w-[100vw] left-1/2 -translate-x-1/2">
        <Image
          src="/uploads/image.png"
          alt="College Header"
          fill
          className="object-cover"
          priority
        />
      </div>
    </header>
  );
};

export default ComponentHeader;
