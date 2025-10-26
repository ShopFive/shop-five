'use client';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#5b8def] rounded-lg flex items-center justify-center text-white font-bold text-lg">
            SF
          </div>
          <h1 className="text-xl font-bold text-gray-900">SHOP FIVE</h1>
        </div>
        
        <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 bg-[#5b8def] rounded-full flex items-center justify-center text-white text-sm font-semibold">
            👤
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">
            Staff Member
          </span>
        </div>
      </div>
    </header>
  );
}