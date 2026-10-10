import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";
import { useSeo } from "@/hooks/use-seo";

const NotFound = () => {
  const location = useLocation();
  useSeo({ title: "Página no encontrada | POSTIM", description: "Esta página no existe. Vuelve al inicio o abre el editor de mockups.", path: location.pathname, noindex: true });

  useEffect(() => {
    console.error("404: ruta inexistente:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div className="pointer-events-none absolute inset-0 bg-dots opacity-60 mask-fade-b" />
      <header className="relative mx-auto flex h-16 w-full max-w-6xl items-center px-5">
        <Logo />
      </header>
      <main className="relative flex flex-1 items-center justify-center px-5 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Error 404</p>
          <h1 className="mt-3 text-[5rem] font-semibold leading-none tracking-[-0.05em] sm:text-[8rem]">
            <span className="gradient-text">404</span>
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-muted-foreground">
            Esta página no existe o fue movida. Volvamos a crear mockups.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-background px-6 text-sm font-medium transition-colors hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" /> Volver al inicio
            </Link>
            <Link
              to="/mockups"
              className="inline-flex h-11 items-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Abrir editor
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default NotFound;
