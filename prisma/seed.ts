import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

const categories = ["Brigadeiros + Sabor", "Brigadeiros Uni", "Brownies & Cia", "Kits para Festa"];

const products = [
  // Brigadeiros + Sabor — caixas de 4 unidades
  {
    title: "Brigadeiro Gourmet Café - 4 Unidades",
    description:
      "Unimos a intensidade do café com a textura aveludada do nosso brigadeiro gourmet. Uma caixa com 4 unidades para quem ama um toque encorpado.",
    price: 2990,
    cost: 1200,
    category: "Brigadeiros + Sabor",
    order: 0,
  },
  {
    title: "Brigadeiro Gourmet Morango - 4 Unidades",
    description:
      "Feito para paladares exigentes. Este brigadeiro de 20 gramas traz o sabor marcante do morango em uma casquinha cremosa. Caixa com 4 unidades.",
    price: 2990,
    cost: 1200,
    category: "Brigadeiros + Sabor",
    order: 1,
  },
  {
    title: "Brigadeiro Gourmet Amendoin - 4 Unidades",
    description:
      "Uma verdadeira imersão para quem ama amendoim! Este brigadeiro é coberto com pedaços crocantes de amendoim torrado. Caixa com 4 unidades.",
    price: 2990,
    cost: 1200,
    category: "Brigadeiros + Sabor",
    order: 2,
  },
  {
    title: "Brigadeiro Gourmet Maracujá - 4 Unidades",
    description:
      "Para quem ama doces com um toque tropical e refrescante! Nosso brigadeiro de maracujá combina doçura e leve acidez. Caixa com 4 unidades.",
    price: 2990,
    cost: 1200,
    category: "Brigadeiros + Sabor",
    order: 3,
  },
  {
    title: "Brigadeiro Gourmet Ninho com Morango - 4 Unidades",
    description:
      "Impossível resistir a essa dupla! Uma massa ultra cremosa de leite Ninho com um coração de morango. Caixa com 4 unidades.",
    price: 2990,
    cost: 1200,
    category: "Brigadeiros + Sabor",
    order: 4,
  },

  // Brigadeiros Uni — unidade avulsa
  {
    title: "Brigadeiro Gourmet 50% Cacau",
    description:
      "O clássico que você ama, levado ao próximo nível. Nosso brigadeiro gourmet de 50% cacau, envolto em granulado belga.",
    price: 790,
    cost: 300,
    category: "Brigadeiros Uni",
    order: 0,
  },
  {
    title: "Brigadeiro Gourmet Beijinhos",
    description:
      "Para os amantes de coco! Brigadeiro branco gourmet super cremoso, finalizado com coco fresco.",
    price: 790,
    cost: 300,
    category: "Brigadeiros Uni",
    order: 1,
  },
  {
    title: "Brigadeiro de Romeu e Julieta",
    description:
      "A combinação perfeita do clássico mineiro em formato de brigadeiro: goiabada cremosa sobre uma base de queijo.",
    price: 790,
    cost: 300,
    category: "Brigadeiros Uni",
    order: 2,
  },
  {
    title: "Brigadeiro Gourmet Café",
    description:
      "Unimos a intensidade do café com a textura aveludada do nosso brigadeiro gourmet, unidade avulsa.",
    price: 790,
    cost: 300,
    category: "Brigadeiros Uni",
    order: 3,
  },
  {
    title: "Brigadeiro Gourmet Morango",
    description:
      "Feito para paladares exigentes. Este brigadeiro de 20 gramas traz o sabor marcante do morango, unidade avulsa. O mais pedido!",
    price: 790,
    cost: 300,
    category: "Brigadeiros Uni",
    order: 4,
  },
  {
    title: "Brigadeiro Gourmet Amendoin",
    description:
      "Uma verdadeira imersão para quem ama amendoim! Este brigadeiro é coberto com pedaços crocantes de amendoim torrado.",
    price: 790,
    cost: 300,
    category: "Brigadeiros Uni",
    order: 5,
  },
  {
    title: "Brigadeiro Gourmet Maracujá",
    description:
      "Para quem ama doces com um toque tropical e refrescante! Nosso brigadeiro de maracujá combina doçura e leve acidez.",
    price: 790,
    cost: 300,
    category: "Brigadeiros Uni",
    order: 6,
  },
  {
    title: "Brigadeiro Gourmet Ninho com Morango",
    description:
      "Impossível resistir a essa dupla! Uma massa ultra cremosa e aveludada de leite Ninho com um coração de morango.",
    price: 790,
    cost: 300,
    category: "Brigadeiros Uni",
    order: 7,
  },

  // Brownies & Cia
  {
    title: "Brownie Ninho com Nutella",
    description:
      "Nossa base é um brownie super cremoso, com aquela casquinha crocante por fora, coberto com creme de leite Ninho e Nutella.",
    price: 2590,
    cost: 1000,
    category: "Brownies & Cia",
    order: 0,
  },

  // Kits para Festa — brigadeiros de 16g, pedido mínimo 25 por sabor
  {
    title: "Kit Festa 25 Brigadeiros",
    description:
      "25 unidades de brigadeiro gourmet de 16 gramas, escolha o sabor. Pedido mínimo por sabor: 25 unidades.",
    price: 10000,
    cost: 4000,
    category: "Kits para Festa",
    order: 0,
  },
  {
    title: "Kit Festa 50 Brigadeiros",
    description:
      "50 unidades de brigadeiro gourmet de 16 gramas, escolha o sabor. Ideal para festas e eventos.",
    price: 15000,
    cost: 6000,
    category: "Kits para Festa",
    order: 1,
  },
  {
    title: "Kit Festa 100 Brigadeiros",
    description:
      "100 unidades de brigadeiro gourmet de 16 gramas, escolha o sabor. Perfeito para eventos grandes.",
    price: 24500,
    cost: 9500,
    category: "Kits para Festa",
    order: 2,
  },
];

async function main() {
  for (const [index, name] of categories.entries()) {
    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) {
      await prisma.category.update({ where: { name }, data: { order: index } });
    } else {
      await prisma.category.create({ data: { name, order: index } });
    }
  }

  for (const product of products) {
    const existing = await prisma.product.findFirst({
      where: { title: product.title, category: product.category },
    });
    if (existing) {
      await prisma.product.update({ where: { id: existing.id }, data: product });
    } else {
      await prisma.product.create({ data: product });
    }
  }

  await prisma.storeSettings.upsert({
    where: { id: "main" },
    update: { whatsappNumber: "5511959882361" },
    create: { id: "main", whatsappNumber: "5511959882361" },
  });

  const username = process.env.ADMIN_USERNAME ?? "atipic";
  const password = process.env.ADMIN_PASSWORD ?? "atipic123";
  const existingAdmin = await prisma.adminUser.findUnique({ where: { username } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.adminUser.create({ data: { username, passwordHash } });
    console.log(`Admin criado: usuário "${username}" senha "${password}" (troque depois)`);
  }

  console.log("Seed concluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
