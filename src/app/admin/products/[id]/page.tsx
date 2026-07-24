"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { Product } from "@/lib/types";
import { Spinner } from "@/components/Spinner";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading)
    return (
      <div className="flex justify-center py-16">
        <Spinner className="w-8 h-8 text-mint-500" />
      </div>
    );
  if (!product) return <p className="text-red-600">Produto não encontrado.</p>;

  return (
    <div className="space-y-4 animate-[fade-in_250ms_ease-out]">
      <h1 className="text-2xl font-semibold text-gray-800">Editar produto</h1>
      <ProductForm initial={product} productId={product.id} />
    </div>
  );
}
