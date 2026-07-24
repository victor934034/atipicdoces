"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { CartDrawer } from "@/components/CartDrawer";
import { IconArrowLeft, IconCake } from "@/components/icons";

export default function QuemSomosPage() {
  const [cartOpen, setCartOpen] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setWhatsappNumber(data.whatsappNumber ?? ""));
  }, []);

  useEffect(() => {
    fetch("/api/analytics/visit", { method: "POST" }).catch(() => {});
  }, []);

  return (
    <>
      <Header showCategories={false} onOpenCart={() => setCartOpen(true)} />

      <main className="flex-1 w-full">
        <Link
          href="/"
          className="max-w-3xl mx-auto px-4 mt-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-peach-600 transition cursor-pointer w-fit"
        >
          <IconArrowLeft className="w-4 h-4" />
          Voltar ao cardápio
        </Link>

        <article className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
          <header className="text-center mb-10 animate-[fade-in_400ms_ease-out]">
            <p className="text-xs sm:text-sm font-medium tracking-widest uppercase text-mint-600 mb-2">
              Quem somos
            </p>
            <h1 className="font-brand text-4xl sm:text-5xl text-peach-600 leading-tight">
              Criada por amor, movida pela transformação
            </h1>
          </header>

          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 mb-10">
            <img
              src="/sobre-mae-filha.jpeg"
              alt="Fundadora da Atipic Doces sorrindo ao lado da filha"
              className="w-56 h-56 sm:w-64 sm:h-64 rounded-full object-cover shadow-md shrink-0 animate-[card-in_400ms_ease-out]"
            />
            <div className="space-y-4 text-gray-600 leading-relaxed text-[15px] sm:text-base">
              <p>
                A Atipic Doces nasceu do encontro entre o amor incondicional da maternidade e a
                força do empreendedorismo. Fundada por uma mãe atípica, a nossa história começou
                não apenas como um projeto de negócios, mas como uma busca genuína por propósito,
                flexibilidade e a oportunidade de construir um futuro mais presente para a família.
              </p>
              <p>
                Cada desafio no caminho da maternidade atípica nos ensinou sobre resiliência,
                atenção aos detalhes e a beleza de enxergar o mundo de forma única. Foi dessa
                vivência de superação que surgiu o desejo de transformar momentos desafiadores em
                doçura e afeto.
              </p>
            </div>
          </div>

          <h2 className="font-brand text-2xl sm:text-3xl text-mint-700 text-center mb-6">
            Mais que brigadeiros, entregamos momentos afetivos
          </h2>

          <div className="space-y-4 text-gray-600 leading-relaxed text-[15px] sm:text-base mb-10">
            <p>
              Na Atipic Doces, acreditamos que o doce tem o poder de abraçar, conectar e celebrar.
              Por isso, preparamos cada brigadeiro artesanal com ingredientes selecionados, um
              cuidado minucioso na apresentação e, acima de tudo, muito amor envolvido.
            </p>
            <p>
              Ser uma marca de empreendedorismo materno significa colocar dedicação total em tudo
              o que fazemos — da escolha de cada sabor até a embalagem final que chega à sua casa
              ou à sua empresa.
            </p>
          </div>

          <figure className="mb-10">
            <div className="w-full aspect-[4/3] rounded-2xl shadow-md overflow-hidden animate-[card-in_400ms_ease-out]">
              <img
                src="/sobre-barraca.jpeg"
                alt="Fundadora da Atipic Doces em sua barraca de brigadeiros em uma feira"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <figcaption className="text-center text-xs sm:text-sm text-gray-400 mt-2">
              A Atipic Doces em mais uma feira, levando afeto de bandeja em bandeja
            </figcaption>
          </figure>

          <blockquote className="text-center px-4 sm:px-10 py-8 border-t border-b border-mint-100">
            <p className="font-brand text-2xl sm:text-3xl text-peach-600 leading-snug">
              &ldquo;Transformamos a nossa jornada em doçura para tornar os seus momentos ainda
              mais especiais.&rdquo;
            </p>
          </blockquote>

          <div className="text-center mt-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-mint-500 text-white font-medium px-6 py-3 hover:bg-mint-600 active:scale-95 transition cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500 focus-visible:ring-offset-2"
            >
              Ver cardápio
            </Link>
          </div>
        </article>
      </main>

      <footer className="flex items-center justify-center gap-1.5 text-xs text-gray-400 py-6">
        <IconCake className="w-3.5 h-3.5" />
        Atipic Doces — feito com carinho
      </footer>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        whatsappNumber={whatsappNumber}
      />
    </>
  );
}
