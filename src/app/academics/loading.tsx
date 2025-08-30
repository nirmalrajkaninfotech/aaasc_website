export default function Loading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="animate-pulse space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="h-8 sm:h-10 bg-gray-200 rounded-lg w-1/3 sm:w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded-lg w-1/2 sm:w-1/3"></div>
        </div>
        
        {/* Cards */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 sm:p-6 shadow-sm">
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded-lg w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
                
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded-lg w-full"></div>
                  <div className="h-3 bg-gray-200 rounded-lg w-5/6"></div>
                  <div className="h-3 bg-gray-200 rounded-lg w-4/6"></div>
                </div>
                
                <div className="h-10 bg-gray-200 rounded-lg w-1/3 mt-4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
