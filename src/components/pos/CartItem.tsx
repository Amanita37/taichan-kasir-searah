import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Minus } from "lucide-react";
import { type CartItemProps } from "@/types/pos";

const CartItem = ({
  id,
  name,
  price,
  quantity,
  onQuantityChange,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) => {
  return (
    <div className="flex items-center justify-between border-b pb-2">
      <div className="flex-1">
        <h3 className="text-sm font-medium">{name}</h3>
        <p className="text-sm text-gray-500">
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }).format(price)} x {quantity}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="outline"
          className="h-7 w-7"
          onClick={() => onUpdateQuantity(id, -1)}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <Input
          type="number"
          value={quantity}
          onChange={(e) => onQuantityChange(id, e.target.value)}
          className="w-14 h-7 text-center p-1"
          min="1"
        />
        <Button
          size="icon"
          variant="outline"
          className="h-7 w-7"
          onClick={() => onUpdateQuantity(id, 1)}
        >
          <Plus className="h-3 w-3" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-red-500"
          onClick={() => onRemove(id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CartItem;
