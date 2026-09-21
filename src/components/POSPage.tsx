import React, { useState, useMemo, useRef } from 'react';
import { 
  Product, 
  SaleTransaction, 
  SaleCartItem, 
  Customer, 
  Category, 
  AppUser,
  CurrencySettings
} from '../types';
import { 
  Search, 
  Barcode, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  DollarSign, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Smartphone, 
  Receipt, 
  User, 
  Tag, 
  RotateCcw,
  Sparkles,
  ArrowRight,
  Coins,
  ArrowRightLeft
} from 'lucide-react';

interface POSPageProps {
  products: Product[];
  categories?: Category[];
  customers: Customer[];
  accounts?: any[];
  currentUser: AppUser | null;
  currencySettings?: CurrencySettings;
  onCompleteSale: (sale: SaleTransaction) => void;
  onAddCustomer?: (newCust: Customer) => void;
}

export default function POSPage({
  products,
  categories = [],
  customers,
  accounts,
  currentUser,
  currencySettings,
  onCompleteSale,
  onAddCustomer
}: POSPageProps) {
  // Search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Cart state
  const [cart, setCart] = useState<SaleCartItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [taxEnabled, setTaxEnabled] = useState<boolean>(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'evc' | 'zaad' | 'sahal' | 'edahab' | 'credit'>('cash');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [payCurrency, setPayCurrency] = useState<'USD' | 'ETB'>(currencySettings?.primaryCurrency || 'USD');
  const [etbTendered, setEtbTendered] = useState<string>('');

  // Exchange rate & dual currency helpers
  const etbRate = currencySettings?.etbRate || 130;
  const showDualCurrency = currencySettings?.showDualCurrency ?? true;

  // Confirmation Modal State ("Ma hubtaa inuu bixiyay lacagta?")
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Receipt Modal State
  const [completedSale, setCompletedSale] = useState<SaleTransaction | null>(null);

  // Focus ref for quick barcode input
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        p.name.toLowerCase().includes(q) || 
        p.barcode.includes(q) || 
        p.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Add to cart
  const addToCart = (product: Product) => {
    if (product.stockQty <= 0) {
      alert(`Digniin: ${product.name} bakhaarka kama yaallo (Stock Out)!`);
      return;
    }

    setCart(prevCart => {
      const existing = prevCart.find(item => item.productId === product.id);
      if (existing) {
        if (existing.qty + 1 > product.stockQty) {
          alert(`Digniin: Tirada bakhaarka ku hartay waa kaliya ${product.stockQty} ${product.unit}`);
          return prevCart;
        }
        return prevCart.map(item => 
          item.productId === product.id 
            ? { ...item, qty: item.qty + 1, totalPrice: (item.qty + 1) * item.unitPrice }
            : item
        );
      } else {
        return [
          ...prevCart,
          {
            productId: product.id,
            barcode: product.barcode,
            name: product.name,
            unitPrice: product.sellPrice,
            buyPrice: product.buyPrice,
            qty: 1,
            unit: product.unit,
            totalPrice: product.sellPrice
          }
        ];
      }
    });
  };

  // Update item quantity
  const updateQty = (productId: string, newQty: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    if (newQty > product.stockQty) {
      alert(`Digniin: Bakhaarka waxaa yaalla kaliya ${product.stockQty} ${product.unit}`);
      return;
    }

    setCart(prev => prev.map(item => 
      item.productId === productId
        ? { ...item, qty: newQty, totalPrice: Number((newQty * item.unitPrice).toFixed(2)) }
        : item
    ));
  };

  // Remove from cart
  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  // Clear cart
  const clearCart = () => {
    if (cart.length > 0 && window.confirm('Ma hubtaa inaad tirtirto alaabta ku jirta gaadhiga iibka?')) {
      setCart([]);
      setDiscountAmount(0);
      setSelectedCustomerId('');
      setCashTendered('');
    }
  };

  // Calculations
  const subtotal = useMemo(() => {
    return Number(cart.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2));
  }, [cart]);

  const tax = useMemo(() => {
    return taxEnabled ? Number((subtotal * 0.05).toFixed(2)) : 0;
  }, [subtotal, taxEnabled]);

  const total = useMemo(() => {
    const net = Math.max(0, subtotal - discountAmount + tax);
    return Number(net.toFixed(2));
  }, [subtotal, discountAmount, tax]);

  const totalInEtb = useMemo(() => {
    return Number((total * etbRate).toFixed(2));
  }, [total, etbRate]);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const changeDueUSD = useMemo(() => {
    if (payCurrency === 'ETB') {
      const tendered = parseFloat(etbTendered) || 0;
      const changeEtb = Math.max(0, tendered - totalInEtb);
      return etbRate > 0 ? Number((changeEtb / etbRate).toFixed(2)) : 0;
    } else {
      const tendered = parseFloat(cashTendered) || 0;
      return Math.max(0, Number((tendered - total).toFixed(2)));
    }
  }, [payCurrency, cashTendered, etbTendered, total, totalInEtb, etbRate]);

  const changeDueETB = useMemo(() => {
    if (payCurrency === 'ETB') {
      const tendered = parseFloat(etbTendered) || 0;
      return Math.max(0, Number((tendered - totalInEtb).toFixed(2)));
    } else {
      return Number((changeDueUSD * etbRate).toFixed(2));
    }
  }, [payCurrency, etbTendered, totalInEtb, changeDueUSD, etbRate]);

  // Click Checkout -> Triggers Safety Confirmation Modal
  const handleProceedToPayment = () => {
    if (cart.length === 0) {
      alert('Fadlan marka hore alaab ku dar gaadhiga iibka (Cart)!');
      return;
    }

    if (paymentMethod === 'credit' && !selectedCustomerId) {
      alert('Haddii iibku yahay Deymo (Credit), fadlan dooro macmiilka daynta lagu qorayo!');
      return;
    }

    // Open confirmation modal
    setShowConfirmModal(true);
  };

  // Final confirmation approved
  const handleFinalConfirmPayment = () => {
    setShowConfirmModal(false);

    const now = new Date();
    const receiptNo = `REC-${now.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const accountMap: Record<string, string> = {
      cash: 'Qasnadda Dhexe (Cash Register)',
      evc: 'EVC Plus (Hormuud)',
      zaad: 'Zaad Service (Telesom)',
      sahal: 'Sahal (Golis Telecom)',
      edahab: 'eDahab (Somtel)',
      credit: 'Deymo (Customer Credit)'
    };

    const isETB = paymentMethod === 'cash' && payCurrency === 'ETB';

    const newSale: SaleTransaction = {
      id: `sale_${Date.now()}`,
      receiptNo,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cashierId: currentUser?.id || 'cashier_01',
      cashierName: currentUser?.fullName || 'Qasnaji',
      customerId: selectedCustomerId || undefined,
      customerName: selectedCustomer ? selectedCustomer.name : 'Macmiil Toos ah (Walk-in)',
      customerPhone: selectedCustomer?.phone,
      items: [...cart],
      subtotal,
      discount: discountAmount,
      tax,
      total,
      paymentMethod,
      accountName: accountMap[paymentMethod] || 'Cash Box',
      paidAmount: paymentMethod === 'credit' 
        ? 0 
        : (isETB ? (parseFloat(etbTendered) || totalInEtb) : (parseFloat(cashTendered) || total)),
      changeAmount: paymentMethod === 'cash' ? (isETB ? changeDueETB : changeDueUSD) : 0,
      status: paymentMethod === 'credit' ? 'credit' : 'completed',
      notes: paymentMethod === 'credit' 
        ? `Deym lagu qoray ${selectedCustomer?.name}` 
        : (isETB ? `Lagu bixiyay ${etbTendered || totalInEtb} ETB (Sarifka: 1 USD = ${etbRate} ETB)` : undefined)
    };

    onCompleteSale(newSale);
    setCompletedSale(newSale);

    // Reset cart
    setCart([]);
    setDiscountAmount(0);
    setSelectedCustomerId('');
    setCashTendered('');
    setEtbTendered('');
  };

  // Handle direct barcode scan enter
  const handleBarcodeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const code = searchQuery.trim();
      const match = products.find(p => p.barcode === code || p.id === code);
      if (match) {
        addToCart(match);
        setSearchQuery('');
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#042954] text-[#ffae01] rounded-xl shadow-xs">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 font-display">
              Shaashadda Iibka Tooska ah (Point of Sale - POS)
            </h1>
            <p className="text-xs text-slate-500">
              Dooro alaabta ama ku baar Barcode-ka si degdeg ah.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Qasnaji: {currentUser?.fullName || 'Active Cashier'}
          </span>
        </div>
      </div>

      {/* Main Grid: Left Catalog & Right Cart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* LEFT: Products Selection Area (7 or 8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-3">
          {/* Search & Barcode Input Bar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleBarcodeInput}
                placeholder="Raadi magaca alaabta ama taabo Barcode..."
                className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#042954]"
              />
              <Barcode className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Quick Barcode Scanner Simulation Button */}
            <button
              onClick={() => {
                const randomProduct = products[Math.floor(Math.random() * products.length)];
                if (randomProduct) {
                  addToCart(randomProduct);
                }
              }}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Isku day scan tijaabo ah"
            >
              <Barcode className="w-4 h-4 text-[#042954]" />
              <span className="hidden sm:inline">Scan Tijaabo</span>
            </button>
          </div>

          {/* Categories Pill Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#042954] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Dhammaan ({products.length})
            </button>
            {categories.map(cat => {
              const count = products.filter(p => p.category === cat.name).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat.name
                      ? 'bg-[#042954] text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[620px] overflow-y-auto p-1">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                <ShoppingCart className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-500">Alaab ku habboon lama helin</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Hubi qoraalka ama dooro qayb kale.</p>
              </div>
            ) : (
              filteredProducts.map(product => {
                const inCart = cart.find(item => item.productId === product.id);
                const isLow = product.stockQty <= product.minStockLevel;
                const isOut = product.stockQty <= 0;

                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={isOut}
                    className={`text-left p-3 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between bg-white hover:border-[#042954] hover:shadow-md ${
                      isOut ? 'opacity-50 cursor-not-allowed border-slate-200 bg-slate-50' :
                      inCart ? 'border-[#042954] ring-2 ring-[#042954]/10' : 'border-slate-200'
                    }`}
                  >
                    {/* Top Badges */}
                    <div className="flex items-start justify-between gap-1 w-full mb-2">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg truncate max-w-[110px]">
                        {product.category}
                      </span>
                      {isOut ? (
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[9px] font-black rounded-md shrink-0">
                          Dhamaatay
                        </span>
                      ) : isLow ? (
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-black rounded-md shrink-0">
                          {product.stockQty} {product.unit}
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-black rounded-md shrink-0">
                          {product.stockQty} {product.unit}
                        </span>
                      )}
                    </div>

                    {/* Product Name & Barcode */}
                    <div className="my-1">
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                        {product.name}
                      </h4>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono mt-1">
                        <Barcode className="w-3 h-3 text-slate-400" />
                        <span>{product.barcode}</span>
                      </div>
                    </div>

                    {/* Bottom Price & Add Action */}
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between w-full">
                      <div>
                        <span className="text-sm font-black text-[#042954] block">
                          ${product.sellPrice.toFixed(2)}
                        </span>
                        {showDualCurrency && (
                          <span className="text-[10px] font-bold text-amber-700 block">
                            {(product.sellPrice * etbRate).toFixed(0)} ETB
                          </span>
                        )}
                      </div>
                      {inCart ? (
                        <span className="w-6 h-6 rounded-full bg-[#042954] text-[#ffae01] flex items-center justify-center text-xs font-bold">
                          {inCart.qty}
                        </span>
                      ) : (
                        <span className="w-6 h-6 rounded-full bg-slate-100 hover:bg-[#042954] hover:text-white text-slate-600 flex items-center justify-center text-xs font-bold transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT: Cart & Checkout Panel (5 or 4 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[740px] sticky top-4">
          
          {/* Cart Header */}
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-[#042954]" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Gaadhiga Iibka (Cart)
              </h3>
              <span className="px-2 py-0.5 bg-[#042954] text-white text-[11px] font-black rounded-full">
                {cart.reduce((s, i) => s + i.qty, 0)}
              </span>
            </div>

            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] font-bold text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>Faaruqi</span>
              </button>
            )}
          </div>

          {/* Customer Selection */}
          <div className="p-3 border-b border-slate-100 bg-white">
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Macmiilka (Customer):
            </label>
            <div className="flex items-center gap-2">
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-[#042954]"
              >
                <option value="">Macmiil Toos ah (Walk-in Customer)</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.totalDebt > 0 ? `(Dayn: $${c.totalDebt.toFixed(2)})` : ''}
                  </option>
                ))}
              </select>
            </div>
            {selectedCustomer && selectedCustomer.totalDebt > 0 && (
              <div className="mt-1.5 p-1.5 bg-amber-50 rounded-lg border border-amber-200 text-[10px] text-amber-900 flex items-center justify-between">
                <span>Deynta hore ugu taallay:</span>
                <span className="font-bold text-red-600">${selectedCustomer.totalDebt.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Cart Item List (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-slate-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <ShoppingCart className="w-10 h-10 text-slate-200 mb-2" />
                <p className="text-xs font-bold text-slate-600">Gaadhigu waa madhan yahay</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Taabo alaabta bidix si aad ugu darto iibka.</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.productId} className="pt-2 first:pt-0 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-bold text-slate-900 truncate">
                      {item.name}
                    </h5>
                    <p className="text-[10px] text-slate-400">
                      ${item.unitPrice.toFixed(2)} / {item.unit}
                    </p>
                  </div>

                  {/* Quantity Controllers */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateQty(item.productId, item.qty - 1)}
                      className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-7 text-center font-bold text-xs text-slate-900">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.productId, item.qty + 1)}
                      className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Total item price & delete */}
                  <div className="text-right shrink-0 min-w-[55px]">
                    <p className="text-xs font-black text-slate-900">
                      ${item.totalPrice.toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-[10px] text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      Ka saar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2">
            <div className="grid grid-cols-3 gap-1.5 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`py-1.5 px-1 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  paymentMethod === 'cash' ? 'bg-[#042954] text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Kaash</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('evc')}
                className={`py-1.5 px-1 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  paymentMethod === 'evc' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>EVC Plus</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('zaad')}
                className={`py-1.5 px-1 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  paymentMethod === 'zaad' ? 'bg-amber-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Zaad</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('sahal')}
                className={`py-1.5 px-1 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  paymentMethod === 'sahal' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Sahal</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('edahab')}
                className={`py-1.5 px-1 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  paymentMethod === 'edahab' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>eDahab</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('credit')}
                className={`py-1.5 px-1 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  paymentMethod === 'credit' ? 'bg-rose-700 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Deymo</span>
              </button>
            </div>

            {/* Cash Tendered & Currency Toggle if Cash is selected */}
            {paymentMethod === 'cash' && (
              <div className="space-y-2 pt-1">
                {/* Currency Switch: USD or ETB */}
                <div className="flex items-center justify-between bg-white p-1 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 pl-2">
                    Lacagta lagu bixinayo:
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPayCurrency('USD')}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                        payCurrency === 'USD'
                          ? 'bg-[#042954] text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      $ Doolar (USD)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayCurrency('ETB')}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                        payCurrency === 'ETB'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Coins className="w-3 h-3" />
                      <span>Birr (ETB 🇪🇹)</span>
                    </button>
                  </div>
                </div>

                {payCurrency === 'USD' ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                        Lacagta la dhiibay ($ USD):
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={cashTendered}
                        onChange={(e) => setCashTendered(e.target.value)}
                        placeholder={total.toString()}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 outline-none focus:border-[#042954]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                        Lacagta u celiska ah:
                      </label>
                      <div className="px-2 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-black text-emerald-800 flex items-center justify-between">
                        <span>${changeDueUSD.toFixed(2)}</span>
                        <span className="text-[10px] text-emerald-600 font-bold">
                          ({changeDueETB.toFixed(0)} ETB)
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-amber-900 mb-0.5">
                          Birr-ta la dhiibay (ETB 🇪🇹):
                        </label>
                        <input
                          type="number"
                          step="10"
                          value={etbTendered}
                          onChange={(e) => setEtbTendered(e.target.value)}
                          placeholder={totalInEtb.toString()}
                          className="w-full px-2 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-bold text-amber-950 outline-none focus:border-amber-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                          Celinta Birr / USD:
                        </label>
                        <div className="px-2 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-black text-amber-950 flex items-center justify-between">
                          <span>{changeDueETB.toFixed(0)} ETB</span>
                          <span className="text-[10px] text-amber-700 font-bold">
                            (${changeDueUSD.toFixed(2)})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick ETB Add Buttons */}
                    <div className="flex flex-wrap gap-1">
                      {[500, 1000, 2000, 5000].map(addEtb => (
                        <button
                          key={addEtb}
                          type="button"
                          onClick={() => {
                            const current = parseFloat(etbTendered) || 0;
                            setEtbTendered((current + addEtb).toString());
                          }}
                          className="px-2 py-0.5 bg-amber-100/70 hover:bg-amber-200 text-amber-900 text-[10px] font-bold rounded cursor-pointer"
                        >
                          +{addEtb} ETB
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setEtbTendered(totalInEtb.toString())}
                        className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-bold rounded cursor-pointer ml-auto"
                      >
                        Sax (Exact)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pricing Calculation Summary */}
          <div className="p-3.5 bg-slate-50 border-t border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Wadarta Alaabta:</span>
              <span className="font-bold text-slate-800">${subtotal.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-slate-500">
              <span className="flex items-center gap-1">
                <span>Qiimo dhimis ($):</span>
              </span>
              <input
                type="number"
                min="0"
                step="0.5"
                value={discountAmount || ''}
                onChange={(e) => setDiscountAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                placeholder="0.00"
                className="w-16 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-right font-bold text-slate-800 text-xs outline-none"
              />
            </div>

            {/* Total Grand with ETB Equivalent */}
            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
              <div>
                <span className="text-sm font-black text-slate-900 block">Isku-gaynta (Total):</span>
                {showDualCurrency && (
                  <span className="text-[10px] font-bold text-amber-800 flex items-center gap-1">
                    <span>1 USD = {etbRate} ETB</span>
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-[#042954] block">
                  ${total.toFixed(2)}
                </span>
                {showDualCurrency && (
                  <span className="text-xs font-black text-amber-700 block">
                    {totalInEtb.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB
                  </span>
                )}
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              type="button"
              onClick={handleProceedToPayment}
              disabled={cart.length === 0}
              className="w-full mt-2 py-3 bg-[#042954] hover:bg-[#031d3d] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-[#ffae01]" />
              <span>Dhammeystir Iibka (${total.toFixed(2)} / {totalInEtb.toFixed(0)} ETB)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EXPLICIT CONFIRMATION MODAL ("MA HUBTAA INUU BIXIYAY LACAGTA?")           */}
      {/* ========================================================================= */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Warning Header */}
            <div className="p-5 bg-amber-500 text-white flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-2xl">
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-base font-black font-display">
                  Xaqiijinta Lacag-bixinta
                </h3>
                <p className="text-xs text-amber-100 mt-0.5">
                  Fadlan hubi lacagta intaadan rasiidka goyn.
                </p>
              </div>
            </div>

            {/* Body Info */}
            <div className="p-6 space-y-4">
              <div className="text-center py-2">
                <p className="text-sm font-bold text-slate-700">
                  Ma hubtaa in qofku/macmiilku lacagta bixiyay?
                </p>
                <div className="text-3xl font-black text-[#042954] mt-2">
                  ${total.toFixed(2)}
                </div>
                <div className="text-sm font-black text-amber-700 mb-2">
                  {totalInEtb.toLocaleString()} ETB (Birr)
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-bold uppercase">
                  Habka: {paymentMethod.toUpperCase()} {paymentMethod === 'cash' ? `(${payCurrency})` : ''}
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Macmiilka:</span>
                  <span className="font-bold text-slate-800">
                    {selectedCustomer ? selectedCustomer.name : 'Macmiil Toos ah (Walk-in)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tirada Alaabta:</span>
                  <span className="font-bold text-slate-800">
                    {cart.reduce((s, i) => s + i.qty, 0)} xabbo
                  </span>
                </div>
                {paymentMethod === 'cash' && (
                  <div className="flex justify-between text-emerald-700 font-bold pt-1 border-t border-slate-200">
                    <span>Celinta (Change):</span>
                    <span>
                      ${changeDueUSD.toFixed(2)} / {changeDueETB.toFixed(0)} ETB
                    </span>
                  </div>
                )}
              </div>

              {/* Yes / No Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
                >
                  MAYA (Ka laabo)
                </button>

                <button
                  type="button"
                  onClick={handleFinalConfirmPayment}
                  className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>HAA, WUU BIXIYAY</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* THERMAL RECEIPT MODAL                                                     */}
      {/* ========================================================================= */}
      {completedSale && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-[#042954] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#ffae01]" />
                <span className="text-xs font-bold font-display">Rasiidka Iibka (Receipt)</span>
              </div>
              <button
                onClick={() => setCompletedSale(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Thermal Receipt Style */}
            <div className="p-5 font-mono text-xs text-slate-800 space-y-3 bg-[#fffef9]">
              <div className="text-center pb-2 border-b border-dashed border-slate-300">
                <h2 className="text-sm font-black text-slate-900 uppercase">
                  XAAJI SALAAD SUPERMARKET
                </h2>
                <p className="text-[10px] text-slate-500">Suuqa Weyn, Muqdisho / Boosaaso</p>
                <p className="text-[10px] text-slate-500">Tel: +252 90 6305090</p>
              </div>

              <div className="text-[10px] space-y-0.5 border-b border-dashed border-slate-300 pb-2">
                <div className="flex justify-between">
                  <span>Rasiidh:</span>
                  <span className="font-bold">{completedSale.receiptNo}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taariikh:</span>
                  <span>{completedSale.date} {completedSale.time}</span>
                </div>
                <div className="flex justify-between">
                  <span>Qasnaji:</span>
                  <span>{completedSale.cashierName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Macmiil:</span>
                  <span>{completedSale.customerName}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-1.5 py-1 border-b border-dashed border-slate-300">
                {completedSale.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start text-[11px]">
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="truncate font-bold">{item.name}</div>
                      <div className="text-[9px] text-slate-500">
                        {item.qty} x ${item.unitPrice.toFixed(2)}
                      </div>
                    </div>
                    <span className="font-black">${item.totalPrice.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-1 pt-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Wadarta:</span>
                  <span>${completedSale.subtotal.toFixed(2)}</span>
                </div>
                {completedSale.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Dhimis:</span>
                    <span>-${completedSale.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-300">
                  <span>GUUD (USD):</span>
                  <span>${completedSale.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-black text-amber-800">
                  <span>GUUD (ETB Birr):</span>
                  <span>{(completedSale.total * etbRate).toFixed(2)} ETB</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Sarifka (Rate):</span>
                  <span>1 USD = {etbRate} ETB</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                  <span>Habka:</span>
                  <span className="font-bold uppercase">{completedSale.paymentMethod}</span>
                </div>
                {completedSale.changeAmount > 0 && (
                  <div className="flex justify-between text-[10px] text-emerald-700 font-bold">
                    <span>Celinta (Change):</span>
                    <span>${completedSale.changeAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="text-center pt-3 border-t border-dashed border-slate-300 text-[10px] text-slate-500">
                <p>Waad ku mahadsan tahay booqashadaada!</p>
                <p>Badeecad la iibsaday lama celin karo 24 saac kaddib.</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Daabac Rasiidhka</span>
              </button>

              <button
                type="button"
                onClick={() => setCompletedSale(null)}
                className="py-2.5 px-4 bg-[#042954] hover:bg-[#031d3d] text-white font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Iib Cusub
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
