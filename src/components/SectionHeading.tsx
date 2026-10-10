import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  className?: string;
}

const SectionHeading = ({ eyebrow, title, description, className }: SectionHeadingProps) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    className={cn("mx-auto mb-14 max-w-2xl text-center", className)}
  >
    <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>
    <h2 className="text-3xl font-semibold leading-[1.1] sm:text-[2.75rem]">{title}</h2>
    {description && <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground">{description}</p>}
  </motion.div>
);

export default SectionHeading;
