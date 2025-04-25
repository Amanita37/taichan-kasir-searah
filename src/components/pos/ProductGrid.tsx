
import { Card, CardContent } from "@/components/ui/card";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

interface ProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

const ProductGrid = ({ products, onProductClick }: ProductGridProps) => {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product) => (
        <Card
          key={product.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onProductClick(product)}
        >
          <CardContent className="p-3">
            <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-100 mb-2">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover object-center"
              />
            </div>
            <h3 className="text-sm font-medium">{product.name}</h3>
            <p className="text-sm font-semibold text-primary-dark">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(product.price)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProductGrid;
