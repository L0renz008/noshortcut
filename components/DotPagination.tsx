type DotPaginationProps = {
  total: number;
  currentIndex: number;
};

export default function DotPagination({
  total,
  currentIndex,
}: DotPaginationProps) {
  return Array.from({ length: total }, (_, i) => i).map((index) => {
    if (index === currentIndex) {
      return (
        <div
          key={index}
          className="w-4 h-1.75 bg-[#111] rounded-full transition-all duration-200"
        ></div>
      );
    } else if (index < currentIndex) {
      return (
        <div
          key={index}
          className="w-1.75 h-1.75 bg-[#999] rounded-full transition-all duration-200"
        ></div>
      );
    }
    return (
      <div
        key={index}
        className="w-1.75 h-1.75 bg-[#D4D3CF] rounded-full transition-all duration-200"
      ></div>
    );
  });
}
