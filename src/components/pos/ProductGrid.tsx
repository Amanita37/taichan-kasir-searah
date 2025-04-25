
import { Card, CardContent } from "@/components/ui/card";
import { type ProductGridProps } from "@/types/pos";
import { Skeleton } from "@/components/ui/skeleton";

const ProductGrid = ({ products, onProductClick, isLoading }: ProductGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-3">
              <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-100 mb-2">
                <Skeleton className="h-full w-full" />
              </div>
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

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
                src={product.image || "/placeholder.svg"}
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
