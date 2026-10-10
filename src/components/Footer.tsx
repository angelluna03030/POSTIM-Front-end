import { Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "./Logo";

const Footer = () => {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 py-10 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-2">
          <Logo />
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} POSTIM. Todos los derechos reservados.</p>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="/#caracteristicas" className="transition-colors hover:text-foreground">Características</a>
          <a href="/#formatos" className="transition-colors hover:text-foreground">Formatos</a>
          <Link to="/mockups" className="transition-colors hover:text-foreground">Editor</Link>
          <a href="/" aria-label="Instagram" className="transition-colors hover:text-foreground">
            <Instagram size={18} strokeWidth={1.75} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
