'use client';

interface DoctorCardProps {
  name: string;
  role: string;
  image?: string;
  bio: string;
}

export function DoctorCard({ name, role, image, bio }: DoctorCardProps) {
  return (
    <div className="group flex flex-col border border-gray-100 bg-white hover:border-[#D94E4E]/30 transition-all duration-300 overflow-hidden">
      <div className="relative h-[230px] xs:h-[260px] sm:h-[290px] md:h-[260px] lg:h-[320px] overflow-hidden bg-[#1D1E1E]">
        {image && (
        <img
          src={image}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-[1.025] transition-transform duration-700 ease-out filter brightness-[0.9] saturate-[0.95] contrast-[1.01]"
        />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1D1E1E]/30 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="p-3 sm:p-6 flex flex-col flex-1 justify-between">
        <div className="flex flex-col gap-1.5 sm:gap-2">
          <h4 className="text-gray-900 font-semibold text-[15px] sm:text-lg leading-tight transition-colors group-hover:text-[#D94E4E]">
            {name}
          </h4>
          <p className="text-[#D94E4E] font-medium text-[12px] sm:text-sm">{role}</p>
          <p className="text-gray-500 font-normal text-[12px] sm:text-sm mt-1.5 sm:mt-2 leading-relaxed">{bio}</p>
        </div>
      </div>
    </div>
  );
}
