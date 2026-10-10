import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const Logo = ({ className }: { className?: string }) => (
  <Link to="/" className={cn("group inline-flex items-center gap-2", className)} aria-label="POSTIM, inicio">
    <span className="relative grid h-7 w-7 place-items-center rounded-lg gradient-bg">
      <span className="h-3 w-3 rounded-[4px] border-[1.5px] border-white" />
    </span>
    <span className="text-[15px] font-semibold tracking-tight">POSTIM</span>
  </Link>
);

export default Logo;
