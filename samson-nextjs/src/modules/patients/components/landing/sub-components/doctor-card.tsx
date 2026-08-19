'use client';

interface DoctorCardProps {
  name: string;
  role: string;
  image: string;
  bio: string;
}

export function DoctorCard({ name, role, image, bio }: DoctorCardProps) {
  return (
    <div className="group flex flex-col border border-gray-100 bg-white hover:border-[#D94E4E]/30 transition-all duration-300 overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
        <picture>
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover object-center filter brightness-[0.95] saturate-[0.85] contrast-[1.01] group-hover:scale-[1.02] group-hover:brightness-100 group-hover:saturate-100 transition-all duration-500"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1D1E1E]/30 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="p-3 sm:p-6 flex flex-col flex-1 justify-between">
        <div className="flex flex-col gap-1.5 sm:gap-2">
          <h4 className="text-gray-900 font-semibold text-[15px] sm:text-lg leading-tight transition-colors group-hover:text-[#D94E4E]">
            {name}
          </h4>
          <p className="text-[#D94E4E] font-medium text-[12px] sm:text-sm">{role}</p>
          <p className="text-gray-500 font-light text-[12px] sm:text-sm mt-1.5 sm:mt-2 leading-relaxed">{bio}</p>
        </div>
      </div>
    </div>
  );
}
