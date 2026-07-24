"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IconChartBar, IconPackage, IconFolder, IconSettings, IconLogout } from "@/components/icons";

const links = [
  { href: "/admin", label: "Dashboard", Icon: IconChartBar },
  { href: "/admin/products", label: "Produtos", Icon: IconPackage },
  { href: "/admin/categories", label: "Categorias", Icon: IconFolder },
  { href: "/admin/settings", label: "Configurações", Icon: IconSettings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-dvh flex bg-[#f6f3ee]">
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-white border-r border-gray-100">
        <div className="px-6 py-6 border-b border-gray-100">
          <span className="font-brand text-3xl text-peach-600 leading-none">Atipic Doces</span>
          <p className="text-xs text-gray-400 mt-1 tracking-wide uppercase">Painel admin</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.97] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500 ${
                  isActive
                    ? "bg-peach-500 text-white shadow-sm"
                    : "text-gray-600 hover:bg-mint-50 hover:text-mint-700"
                }`}
              >
                <link.Icon className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 active:scale-[0.97] transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          >
            <IconLogout className="w-5 h-5 shrink-0" />
            Sair
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <span className="font-brand text-2xl text-peach-600">Atipic Doces</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-gray-500 cursor-pointer"
          >
            <IconLogout className="w-4 h-4" />
            Sair
          </button>
        </header>

        <nav className="md:hidden flex gap-2 overflow-x-auto px-4 py-2 bg-white border-b border-gray-100">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition active:scale-95 cursor-pointer ${
                pathname === link.href
                  ? "bg-peach-500 text-white"
                  : "bg-mint-50 text-mint-700"
              }`}
            >
              <link.Icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        <main
          key={pathname}
          className="flex-1 w-full px-4 sm:px-8 py-8 max-w-5xl animate-[fade-in_250ms_ease-out]"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
