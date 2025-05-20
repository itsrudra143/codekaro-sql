import NavigationHeader from "@/components/NavigationHeader"; // Assuming this exists or will be copied

function SnippetLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <NavigationHeader />
      <main className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 animate-pulse">
        <div className="max-w-[1200px] mx-auto">
          {/* Skeleton Header */}
          <div className="bg-[#121218] border border-[#ffffff0a] rounded-2xl p-6 sm:p-8 mb-6 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center justify-center size-12 rounded-xl bg-[#ffffff08] flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-7 w-3/5 bg-[#ffffff08] rounded-lg" />
                  <div className="flex gap-4">
                    <div className="h-5 w-24 bg-[#ffffff08] rounded" />
                    <div className="h-5 w-24 bg-[#ffffff08] rounded" />
                    <div className="h-5 w-20 bg-[#ffffff08] rounded" />
                  </div>
                </div>
              </div>
              <div className="h-8 w-20 bg-[#ffffff08] rounded-lg flex-shrink-0 mt-2 sm:mt-0" />
            </div>
          </div>

          {/* Skeleton Code Editor */}
          <div className="mb-8 rounded-2xl overflow-hidden border border-[#ffffff0a] bg-[#121218]">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#ffffff0a]">
              <div className="h-5 w-28 bg-[#ffffff08] rounded" />
              <div className="h-8 w-8 bg-[#ffffff08] rounded-lg" />
            </div>
            <div className="h-[400px] sm:h-[500px] md:h-[600px] bg-[#0a0a0f]" />
          </div>

          {/* Skeleton Comments Section */}
          <div className="bg-[#121218] border border-[#ffffff0a] rounded-2xl overflow-hidden">
            <div className="px-6 sm:px-8 py-6 border-b border-[#ffffff0a]">
              <div className="h-6 w-36 bg-[#ffffff08] rounded" />
            </div>
            <div className="p-6 sm:p-8 space-y-6">
              {/* Skeleton Comment Form (Placeholder) */}
              <div className="h-24 bg-[#0a0a0f] rounded-xl border border-[#ffffff0a]" />
              {/* Skeleton Comments */}
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="p-4 sm:p-6 bg-[#0a0a0f] rounded-xl border border-[#ffffff0a]"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-9 w-9 rounded-full bg-[#ffffff08] flex-shrink-0" />
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="h-4 w-24 bg-[#ffffff08] rounded" />
                        <div className="h-4 w-16 bg-[#ffffff08] rounded" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-[#ffffff08] rounded" />
                        <div className="h-4 w-5/6 bg-[#ffffff08] rounded" />
                        <div className="h-4 w-3/4 bg-[#ffffff08] rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
export default SnippetLoadingSkeleton; 