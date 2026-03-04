const DecorativeDots = ({ className = "" }: { className?: string }) => (
  <div className={`grid grid-cols-4 gap-1.5 ${className}`}>
    {Array.from({ length: 16 }).map((_, i) => (
      <div
        key={i}
        className="w-1.5 h-1.5 rounded-full"
        style={{
          background: `hsl(${330 + i * 5}, 80%, ${50 + i * 2}%)`,
          animationDelay: `${i * 0.1}s`,
        }}
      />
    ))}
  </div>
);

export default DecorativeDots;
