import { Phone, Mail, Megaphone } from "lucide-react";
import Image from "next/image";

const ComponentHeader: React.FC = () => {
  return (
    <header className="w-full overflow-hidden">
      {/* Top bar */}
      <div className="bg-blue-600 text-white text-sm flex flex-col sm:flex-row justify-between items-center px-4 py-1 gap-2 w-full">
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

      {/* Full-width image with optimized height */}
      <div className="relative h-28 md:h-28 w-full overflow-hidden">
        <Image
          src="/uploads/image.png"
          alt="College Campus"
          width={1000}
          height={400}
          className="w-full h-full object-cover object-center"
          priority
          quality={85}
        />
      </div>
    </header>
  );
};

export default ComponentHeader;
