import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-gray-800">Novo produto</h1>
      <ProductForm />
    </div>
  );
}
