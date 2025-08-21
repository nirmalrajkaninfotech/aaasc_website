import { Phone, Mail, Megaphone } from "lucide-react";
import Image from "next/image";

const ComponentHeader: React.FC = () => {
  return (
    <header className="w-full max-w-none full-width-header overflow-hidden">
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
      <div className="relative w-[300%] h-32 sm:h-40 md:h-52 lg:h-60 transform -translate-x-1/3 header-image-300">

        <Image
          src="/uploads/cropped-cropped-cropped-aaasc1-1-32x32.png"
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
