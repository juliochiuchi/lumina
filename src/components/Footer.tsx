import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-card py-6">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Lumina. Todos os direitos reservados.
        </p>
        <div className="flex gap-4">
          <Link to="https://myspace-julio-chiuchi.vercel.app/" className="text-sm text-muted-foreground hover:text-primary">
            Desenvolvido por Otherside
          </Link>
          <Link to="https://ipimacaubal.com.br" className="text-sm text-muted-foreground hover:text-primary">
            IPIM
          </Link>
        </div>
      </div>
    </footer>
  );
}
