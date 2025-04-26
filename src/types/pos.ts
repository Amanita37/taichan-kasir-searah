
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  barcode: string | null;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cart: CartItem[];
  customerName: string;
  cashAmount: number | "";
  total: number;
  onConfirm: () => void;
  paymentMethod?: string;
  onPaymentMethodChange?: (value: string) => void;
}

export interface CartProps {
  cart: CartItem[];
  customerName: string;
  cashAmount: number | "";
  onCustomerNameChange: (value: string) => void;
  onCashAmountChange: (value: string) => void;
  onQuantityChange: (productId: string, value: string) => void;
  onUpdateQuantity: (productId: string, change: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onPrintReceipt: () => void;
  onCheckout: () => void;
  calculateTotal: () => number;
}

export interface CartItemProps {
  id: string;
  name: string;
  price: number;
  quantity: number;
  onQuantityChange: (productId: string, value: string) => void;
  onUpdateQuantity: (productId: string, change: number) => void;
  onRemove: (productId: string) => void;
}

export interface ProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  isLoading?: boolean;
}
