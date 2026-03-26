import { useState, useCallback, useRef, useEffect } from "react";

// ============================================================
// SUPABASE CONFIG — D'Volada Montesinos
// ============================================================
const SUPABASE_URL = "https://lkpsfhqqaropogaepuyy.supabase.co";
const SUPABASE_KEY = "sb_publishable_R5_AMdm-4XKw4yf3P5sVRg_tUCNWuAu";
const STORE_ID = "a0000000-0000-0000-0000-000000000001";

const sb = (table) => ({
  headers: {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  },
  url: `${SUPABASE_URL}/rest/v1/${table}`,
  async select(query = "") {
    const r = await fetch(`${this.url}?${query}`, { headers: this.headers });
    if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
    return r.json();
  },
  async insert(data) {
    const r = await fetch(this.url, {
      method: "POST", headers: this.headers, body: JSON.stringify(data),
    });
    if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
    return r.json();
  },
  async update(match, data) {
    const r = await fetch(`${this.url}?${match}`, {
      method: "PATCH", headers: { ...this.headers, Prefer: "return=representation" },
      body: JSON.stringify(data),
    });
    if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
    return r.json();
  },
});

// ============================================================
// FALLBACK DATA (used if Supabase is unreachable)
// ============================================================
const FALLBACK_CATEGORIES = [
  { id: "hot", name: "Calientes", icon: "☕", color: "#d97706" },
  { id: "frappe", name: "Frappé", icon: "🧊", color: "#3b82f6" },
  { id: "tradiciones", name: "Tradiciones", icon: "🫘", color: "#92400e" },
  { id: "smoothies", name: "Smoothies", icon: "🍓", color: "#16a34a" },
  { id: "tea", name: "Té", icon: "🍵", color: "#7c3aed" },
  { id: "jugos", name: "Jugos", icon: "🍊", color: "#ea580c" },
  { id: "bagels", name: "Bagels", icon: "🥯", color: "#ca8a04" },
  { id: "ensaladas", name: "Ensaladas", icon: "🥗", color: "#059669" },
  { id: "wraps", name: "Wraps", icon: "🌯", color: "#65a30d" },
  { id: "reposteria", name: "Repostería", icon: "🍰", color: "#db2777" },
  { id: "galletas", name: "Galletas", icon: "🍪", color: "#c2410c" },
  { id: "complementos", name: "Extras", icon: "➕", color: "#64748b" },
];

const CATEGORY_ICONS = {
  "Especialidades Calientes": "☕", "Frappé / Rocas": "🧊", "Tradiciones": "🫘",
  "Smoothies": "🍓", "Té / Tisana": "🍵", "Jugos": "🍊", "Bagels": "🥯",
  "Ensaladas": "🥗", "Wraps": "🌯", "Repostería": "🍰", "Galletas": "🍪",
  "Complementos": "➕", "Espresso": "⚡", "Iced Coffee": "🥤",
  "Soda Italiana": "🍹", "Pasteles": "🎂", "Malteadas": "🥛",
};
const CATEGORY_COLORS = {
  "Especialidades Calientes": "#d97706", "Frappé / Rocas": "#3b82f6", "Tradiciones": "#92400e",
  "Smoothies": "#16a34a", "Té / Tisana": "#7c3aed", "Jugos": "#ea580c", "Bagels": "#ca8a04",
  "Ensaladas": "#059669", "Wraps": "#65a30d", "Repostería": "#db2777", "Galletas": "#c2410c",
  "Complementos": "#64748b", "Espresso": "#1e293b", "Iced Coffee": "#06b6d4",
  "Soda Italiana": "#ef4444", "Pasteles": "#be185d", "Malteadas": "#c084fc",
};

const SIZES = [
  { id: "12oz", label: "12oz", sub: "Chico" },
  { id: "16oz", label: "16oz", sub: "Mediano" },
  { id: "20oz", label: "20oz", sub: "Grande" },
];

const MILK_OPTIONS = [
  { id: "regular", name: "Regular", extra: 0 },
  { id: "light", name: "Light", extra: 0 },
  { id: "deslac", name: "Deslactosada", extra: 0 },
  { id: "almendra", name: "Almendras", extra: 20 },
  { id: "soya", name: "Soya", extra: 20 },
  { id: "coco", name: "Coco", extra: 20 },
];

const DRINK_EXTRAS = [
  { id: "shot", name: "Shot Extra", extra: 15 },
  { id: "jarabe", name: "Jarabe Extra", extra: 15 },
  { id: "mocha", name: "Mocha", extra: 15 },
  { id: "miel", name: "Miel", extra: 15 },
];

const BREAD_OPTIONS = [
  { id: "natural", name: "Natural", extra: 0 },
  { id: "parmesano", name: "Parmesano", extra: 0 },
  { id: "ajonjoli", name: "Ajonjolí", extra: 0 },
  { id: "12granos", name: "12 Granos", extra: 0 },
];

const BAGEL_EXTRAS = [
  { id: "jamon", name: "Jamón", extra: 15 },
  { id: "aguacate", name: "Aguacate", extra: 15 },
];

const ALL_EXTRAS = [...DRINK_EXTRAS, ...BAGEL_EXTRAS];

// ============================================================
// SMALL COMPONENTS
// ============================================================
function Overlay({ children, onClose }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(3px)",
    }}><div onClick={(e) => e.stopPropagation()}>{children}</div></div>
  );
}
function ModSection({ title, children }) {
  return (<div style={{ marginBottom: 16 }}>
    <div style={{ fontSize: 10, fontWeight: 700, color: "#777", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>{title}</div>
    {children}
  </div>);
}
function Chip({ active, label, sub, onClick, flex }) {
  return (<button onClick={onClick} style={{
    padding: "6px 11px", borderRadius: 7, cursor: "pointer",
    border: active ? "2px solid #f59e0b" : "1px solid #333",
    background: active ? "#f59e0b11" : "#262626",
    fontSize: 11, color: active ? "#f59e0b" : "#ccc",
    fontWeight: active ? 600 : 400, transition: "all 0.1s",
    textAlign: "center", flex: flex ? 1 : undefined, minWidth: 0,
  }}>
    {label}
    {sub && <div style={{ fontSize: 9, color: active ? "#d9960688" : "#555", marginTop: 1 }}>{sub}</div>}
  </button>);
}
function QBtn({ children, onClick }) {
  return (<button onClick={onClick} style={{
    width: 22, height: 22, borderRadius: 5, border: "1px solid #333",
    background: "#262626", color: "#fff", cursor: "pointer", fontSize: 13,
    display: "flex", alignItems: "center", justifyContent: "center",
  }}>{children}</button>);
}

// ============================================================
// LOCAL PRODUCT DATA (used in preview & offline mode)
// ============================================================
const LOCAL_CATEGORIES = [
  { id: "hot", name: "Calientes", icon: "☕", color: "#d97706" },
  { id: "frappe", name: "Frappé", icon: "🧊", color: "#3b82f6" },
  { id: "tradiciones", name: "Tradiciones", icon: "🫘", color: "#92400e" },
  { id: "smoothies", name: "Smoothies", icon: "🍓", color: "#16a34a" },
  { id: "tea", name: "Té", icon: "🍵", color: "#7c3aed" },
  { id: "jugos", name: "Jugos", icon: "🍊", color: "#ea580c" },
  { id: "bagels", name: "Bagels", icon: "🥯", color: "#ca8a04" },
  { id: "ensaladas", name: "Ensaladas", icon: "🥗", color: "#059669" },
  { id: "wraps", name: "Wraps", icon: "🌯", color: "#65a30d" },
  { id: "reposteria", name: "Repostería", icon: "🍰", color: "#db2777" },
  { id: "galletas", name: "Galletas", icon: "🍪", color: "#c2410c" },
  { id: "complementos", name: "Extras", icon: "➕", color: "#64748b" },
];
const LOCAL_PRODUCTS = [
  { id:"cap",name:"Cappuccino",cat:"hot",p12:78,p16:83,p20:88,milk:true},
  { id:"lat",name:"Café Latte",cat:"hot",p12:75,p16:80,p20:85,milk:true},
  { id:"car",name:"Caramelo",cat:"hot",p12:85,p16:90,p20:95,milk:true},
  { id:"caj",name:"Cajeta",cat:"hot",p12:85,p16:90,p20:95,milk:true},
  { id:"moc",name:"Mocha",cat:"hot",p12:85,p16:90,p20:95,milk:true},
  { id:"mxm",name:"Mexican Mocha",cat:"hot",p12:85,p16:90,p20:95,milk:true},
  { id:"ore",name:"Oreo",cat:"hot",p12:88,p16:93,p20:98,milk:true},
  { id:"bro",name:"Brownie",cat:"hot",p12:88,p16:93,p20:98,milk:true},
  { id:"cha",name:"Chai Té",cat:"hot",p12:85,p16:90,p20:95,milk:true},
  { id:"ame",name:"Americano",cat:"hot",p12:55,p16:60,p20:65,milk:false},
  { id:"cho",name:"Chocolate",cat:"hot",p12:75,p16:78,p20:82,milk:true},
  { id:"esp",name:"Espresso",cat:"hot",p12:45,p16:50,p20:55,milk:false},
  { id:"f_lat",name:"Latte",cat:"frappe",p12:78,p16:83,p20:88,milk:true},
  { id:"f_moc",name:"Mocha",cat:"frappe",p12:85,p16:90,p20:95,milk:true},
  { id:"f_car",name:"Caramelo",cat:"frappe",p12:85,p16:90,p20:95,milk:true},
  { id:"f_caj",name:"Cajeta",cat:"frappe",p12:88,p16:93,p20:98,milk:true},
  { id:"f_ore",name:"Oreo",cat:"frappe",p12:88,p16:93,p20:98,milk:true},
  { id:"f_bro",name:"Brownie",cat:"frappe",p12:88,p16:93,p20:98,milk:true},
  { id:"f_cha",name:"Chai",cat:"frappe",p12:85,p16:90,p20:95,milk:true},
  { id:"f_cho",name:"Chocolate",cat:"frappe",p12:74,p16:78,p20:83,milk:true},
  { id:"f_ice",name:"Iced Coffee",cat:"frappe",p12:60,p16:63,p20:65,milk:false},
  { id:"f_sod",name:"Soda Italiana",cat:"frappe",unit:60},
  { id:"alt",name:"Altura",cat:"tradiciones",p12:43,p16:47,p20:50,milk:false},
  { id:"org",name:"Orgánico",cat:"tradiciones",p12:43,p16:47,p20:50,milk:false},
  { id:"dec",name:"Descaf",cat:"tradiciones",p12:43,p16:47,p20:50,milk:false},
  { id:"s_fre",name:"Locura D'Fresa",cat:"smoothies",unit:90},
  { id:"s_cit",name:"Pellizco Cítrico",cat:"smoothies",unit:90},
  { id:"s_dur",name:"Placer D'Durazno",cat:"smoothies",unit:90},
  { id:"s_nar",name:"Naranja Coqueta",cat:"smoothies",unit:90},
  { id:"s_tro",name:"Ola Tropical",cat:"smoothies",unit:90},
  { id:"s_oas",name:"Oasis D'Frutas",cat:"smoothies",unit:90},
  { id:"s_pas",name:"Pasión Caribeña",cat:"smoothies",unit:90},
  { id:"s_man",name:"Mango D'Volada",cat:"smoothies",unit:90},
  { id:"s_alo",name:"Aloha",cat:"smoothies",unit:90},
  { id:"t_fk",name:"Fresas-Kiwi",cat:"tea",unit:80},
  { id:"t_bl",name:"Blend 1776",cat:"tea",unit:80},
  { id:"t_ma",name:"Manzanilla",cat:"tea",unit:80},
  { id:"t_hi",name:"Hierbabuena",cat:"tea",unit:80},
  { id:"t_fp",name:"Frutas Pasión",cat:"tea",unit:80},
  { id:"t_lt",name:"Limón Tropical",cat:"tea",unit:80},
  { id:"t_tf",name:"Tutti-Frutti",cat:"tea",unit:80},
  { id:"t_za",name:"Zarzamora",cat:"tea",unit:80},
  { id:"t_mr",name:"Mezcla Relajante",cat:"tea",unit:80},
  { id:"t_ja",name:"Jazmín",cat:"tea",unit:80},
  { id:"t_be",name:"Blue Eyes",cat:"tea",unit:80},
  { id:"t_eg",name:"Earl Grey",cat:"tea",unit:80},
  { id:"j_ver",name:"Jugo Verde",cat:"jugos",unit:75},
  { id:"j_nar",name:"Jugo de Naranja",cat:"jugos",unit:75},
  { id:"j_bet",name:"Jugo Betabel",cat:"jugos",unit:75},
  { id:"b_san",name:"D'Sándwich",cat:"bagels",unit:85,bread:true},
  { id:"b_pol",name:"D'Pollo",cat:"bagels",unit:95,bread:true},
  { id:"b_des",name:"D'Sayuno",cat:"bagels",unit:85,bread:true},
  { id:"b_cla",name:"D'Clásico",cat:"bagels",unit:65,bread:true},
  { id:"b_nut",name:"D'Nutella",cat:"bagels",unit:65,bread:true},
  { id:"b_cl2",name:"D'Clásico +",cat:"bagels",unit:70,bread:true},
  { id:"b_fre",name:"D'Fresa",cat:"bagels",unit:65,bread:true},
  { id:"b_atu",name:"D'Atún",cat:"bagels",unit:95,bread:true},
  { id:"e_pol",name:"Ensalada Pollo",cat:"ensaladas",unit:145},
  { id:"e_atu",name:"Ensalada Atún",cat:"ensaladas",unit:145},
  { id:"e_ces",name:"Ensalada César",cat:"ensaladas",unit:145},
  { id:"w_pol",name:"Wrap Pollo",cat:"wraps",unit:145},
  { id:"w_atu",name:"Wrap Atún",cat:"wraps",unit:145},
  { id:"w_ame",name:"Wrap Americano",cat:"wraps",unit:145},
  { id:"w_ces",name:"Wrap César",cat:"wraps",unit:145},
  { id:"r_brw",name:"Brownie",cat:"reposteria",unit:40},
  { id:"r_bwq",name:"Brownie Queso",cat:"reposteria",unit:40},
  { id:"r_coy",name:"Coyota",cat:"reposteria",unit:40},
  { id:"r_emp",name:"Empanada Cajeta",cat:"reposteria",unit:40},
  { id:"r_mch",name:"Muffin Chocolate",cat:"reposteria",unit:40},
  { id:"r_mmo",name:"Muffin Moras",cat:"reposteria",unit:40},
  { id:"r_pz",name:"Pastel Zanahoria",cat:"reposteria",unit:65},
  { id:"r_pch",name:"Pastel Chocolate",cat:"reposteria",unit:65},
  { id:"r_mad",name:"Madelines",cat:"reposteria",unit:20},
  { id:"r_ore",name:"Orejitas",cat:"reposteria",unit:20},
  { id:"r_mix",name:"Mixtas",cat:"reposteria",unit:19},
  { id:"r_mbr",name:"Mini Brownie",cat:"reposteria",unit:20},
  { id:"r_grl",name:"Galleta Rellena",cat:"reposteria",unit:40},
  { id:"g_ajo",name:"Ajonjolí",cat:"galletas",unit:40},
  { id:"g_ave",name:"Avena",cat:"galletas",unit:40},
  { id:"g_gra",name:"Granola Miel",cat:"galletas",unit:40},
  { id:"g_nue",name:"Nuez",cat:"galletas",unit:40},
  { id:"g_dat",name:"Dátil",cat:"galletas",unit:40},
  { id:"g_avn",name:"Avena Naranja",cat:"galletas",unit:40},
  { id:"g_4ga",name:"4 Galletas",cat:"galletas",unit:49},
  { id:"g_lin",name:"Linaza-Cajeta",cat:"galletas",unit:35},
  { id:"g_bar",name:"Barra Granola",cat:"galletas",unit:20},
  { id:"x_ave",name:"Avena",cat:"complementos",unit:75},
  { id:"x_lic",name:"Licuado Plátano",cat:"complementos",unit:68},
  { id:"x_agu",name:"Botella Agua",cat:"complementos",unit:35},
  { id:"x_mal_v",name:"Malteada Vainilla",cat:"complementos",unit:98},
  { id:"x_mal_o",name:"Malteada Oreo",cat:"complementos",unit:98},
  { id:"x_mal_c",name:"Malteada Cappu",cat:"complementos",unit:98},
];

// ============================================================
// MAIN APP
// ============================================================
export default function CafeOSPOS() {
  // DB state
  const [dbConnected, setDbConnected] = useState(false);
  const [categories, setCategories] = useState(LOCAL_CATEGORIES);
  const [products, setProducts] = useState(LOCAL_PRODUCTS);
  const [savingCount, setSavingCount] = useState(0);

  // UI state
  const [activeCat, setActiveCat] = useState("hot");
  const [cart, setCart] = useState([]);
  const [customizing, setCustomizing] = useState(null);
  const [selectedSize, setSelectedSize] = useState("16oz");
  const [selectedMilk, setSelectedMilk] = useState("regular");
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [selectedBread, setSelectedBread] = useState("natural");
  const [selectedBagelExtras, setSelectedBagelExtras] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentType, setPaymentType] = useState(null);
  const [cashReceived, setCashReceived] = useState("");
  const [usdReceived, setUsdReceived] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [todaySales, setTodaySales] = useState({ count: 0, total: 0 });
  const [exchangeRate, setExchangeRate] = useState(17.50);
  const [showConfig, setShowConfig] = useState(false);
  const [currentCashier, setCurrentCashier] = useState("Cajero 1");
  const cartRef = useRef(null);

  // ── Try to connect to Supabase; fall back to local data ──
  useEffect(() => {
    async function tryConnect() {
      try {
        const [dbCats, dbProds] = await Promise.all([
          sb("categories").select("select=*&store_id=eq." + STORE_ID + "&active=eq.true&order=display_order"),
          sb("products").select("select=*&store_id=eq." + STORE_ID + "&active=eq.true&order=display_order"),
        ]);
        if (dbCats.length > 0 && dbProds.length > 0) {
          const mappedCats = dbCats.map((c) => ({
            id: c.id, name: c.name,
            icon: CATEGORY_ICONS[c.name] || c.icon || "📦",
            color: CATEGORY_COLORS[c.name] || c.color || "#f59e0b",
          }));
          const bagelCatId = dbCats.find((c) => c.name === "Bagels")?.id;
          const mappedProds = dbProds.map((p) => ({
            id: p.id, dbId: p.id, name: p.name, cat: p.category_id,
            p12: p.price_12oz ? Number(p.price_12oz) : null,
            p16: p.price_16oz ? Number(p.price_16oz) : null,
            p20: p.price_20oz ? Number(p.price_20oz) : null,
            unit: p.price_unit ? Number(p.price_unit) : null,
            milk: p.has_milk_option, bread: p.category_id === bagelCatId,
            is_beverage: p.is_beverage, sku: p.sku,
          }));
          setCategories(mappedCats);
          setProducts(mappedProds);
          setActiveCat(mappedCats[0]?.id || "hot");
          setDbConnected(true);
          // Load today's sales
          const today = new Date().toISOString().slice(0, 10);
          try {
            const todayS = await sb("sales").select(`select=id,total&store_id=eq.${STORE_ID}&status=eq.completed&created_at=gte.${today}T00:00:00`);
            setTodaySales({ count: todayS.length, total: todayS.reduce((s, x) => s + Number(x.total), 0) });
          } catch(e) {}
        }
      } catch (err) {
        console.log("Supabase not available, using local data:", err.message);
        // Local data already set as defaults — POS works offline
      }
    }
    tryConnect();
  }, []);

  const filtered = products.filter((p) =>
    searchQuery ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) : p.cat === activeCat
  );

  const getPrice = useCallback((p, sz) => {
    if (p.unit) return p.unit;
    return sz === "12oz" ? p.p12 : sz === "16oz" ? p.p16 : p.p20;
  }, []);

  const cartTotal = cart.reduce((s, i) => s + i.total, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const isBev = (p) => !!(p.p12 || p.milk);
  const isBag = (p) => !!p.bread;
  const needsModal = (p) => isBev(p) || isBag(p);

  const handleProductClick = (p) => {
    if (!needsModal(p)) { pushToCart(p, null, null, [], null, []); }
    else {
      setCustomizing(p);
      setSelectedSize("16oz"); setSelectedMilk("regular"); setSelectedExtras([]);
      setSelectedBread("natural"); setSelectedBagelExtras([]);
    }
  };

  const pushToCart = (product, size, milk, dExt, bread, bExt) => {
    const base = getPrice(product, size);
    const mE = milk ? (MILK_OPTIONS.find((m) => m.id === milk)?.extra || 0) : 0;
    const dE = (dExt || []).reduce((s, e) => s + (DRINK_EXTRAS.find((x) => x.id === e)?.extra || 0), 0);
    const bE = (bExt || []).reduce((s, e) => s + (BAGEL_EXTRAS.find((x) => x.id === e)?.extra || 0), 0);
    const unitPrice = base + mE + dE + bE;
    const allExtras = [...(dExt || []), ...(bExt || [])];
    const key = `${product.id}|${size}|${milk}|${bread}|${JSON.stringify(allExtras)}`;
    const idx = cart.findIndex((i) => `${i.product.id}|${i.size}|${i.milk}|${i.bread}|${JSON.stringify(i.extras)}` === key);
    if (idx >= 0) {
      setCart((prev) => prev.map((item, i) => i === idx ? { ...item, qty: item.qty + 1, total: (item.qty + 1) * unitPrice } : item));
    } else {
      setCart((prev) => [...prev, {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
        product, size, milk, bread, extras: allExtras, unitPrice, qty: 1, total: unitPrice,
      }]);
    }
    setCustomizing(null);
    setTimeout(() => { cartRef.current?.scrollTo(0, cartRef.current.scrollHeight); }, 40);
  };

  const removeFromCart = (id) => setCart((p) => p.filter((i) => i.id !== id));
  const updateQty = (id, d) => setCart((p) => p.map((i) => {
    if (i.id !== id) return i;
    const n = i.qty + d;
    return n <= 0 ? null : { ...i, qty: n, total: n * i.unitPrice };
  }).filter(Boolean));

  // ── Save sale to Supabase ──
  const saveSaleToDb = async (receiptObj) => {
    if (!dbConnected) return;
    setSavingCount((c) => c + 1);
    try {
      const salePayload = {
        store_id: STORE_ID,
        receipt_number: receiptObj.number,
        subtotal: receiptObj.total,
        total: receiptObj.total,
        discount: 0,
        tax: 0,
        payment_type: receiptObj.paymentType === "usd" ? "cash" : receiptObj.paymentType,
        cash_received: receiptObj.cashReceived || (receiptObj.usdReceived ? receiptObj.usdReceived * receiptObj.exchangeRate : null),
        status: "completed",
        completed_at: new Date().toISOString(),
        local_id: receiptObj.number,
      };
      const [savedSale] = await sb("sales").insert(salePayload);

      // Insert sale items
      const items = receiptObj.items.map((item) => ({
        sale_id: savedSale.id,
        product_id: item.product.dbId || item.product.id,
        size: item.size || "unit",
        quantity: item.qty,
        unit_price: item.unitPrice,
        cost_estimate: 0,
        modifiers: JSON.stringify(
          (item.extras || []).map((e) => {
            const found = ALL_EXTRAS.find((x) => x.id === e);
            return found ? { id: e, name: found.name, price_extra: found.extra } : null;
          }).filter(Boolean)
          .concat(item.milk && item.milk !== "regular" ? [{ id: item.milk, name: MILK_OPTIONS.find((m) => m.id === item.milk)?.name, type: "milk" }] : [])
          .concat(item.bread ? [{ id: item.bread, name: BREAD_OPTIONS.find((b) => b.id === item.bread)?.name, type: "bread" }] : [])
        ),
        notes: [
          item.milk && item.milk !== "regular" ? `Leche: ${MILK_OPTIONS.find((m) => m.id === item.milk)?.name}` : null,
          item.bread ? `Pan: ${BREAD_OPTIONS.find((b) => b.id === item.bread)?.name}` : null,
          receiptObj.paymentType === "usd" ? `Pago USD $${receiptObj.usdReceived} @ ${receiptObj.exchangeRate}` : null,
        ].filter(Boolean).join(" | ") || null,
      }));
      if (items.length > 0) await sb("sale_items").insert(items);
    } catch (err) {
      console.error("Error saving sale:", err);
    } finally {
      setSavingCount((c) => c - 1);
    }
  };

  const completeSale = (type) => {
    const ts = new Date();
    let cashRcvd = null, changeAmt = null, usdRcvd = null, changeMxn = null;

    if (type === "cash") {
      cashRcvd = parseFloat(cashReceived) || cartTotal;
      changeAmt = cashRcvd - cartTotal;
    } else if (type === "usd") {
      usdRcvd = parseFloat(usdReceived) || 0;
      changeMxn = (usdRcvd * exchangeRate) - cartTotal;
    }

    const r = {
      number: `${ts.toISOString().slice(0, 10).replace(/-/g, "")}-${String(todaySales.count + 1).padStart(4, "0")}`,
      items: cart.map((item) => ({
        ...item,
        milkLabel: item.milk && item.milk !== "regular" ? MILK_OPTIONS.find((m) => m.id === item.milk) : null,
        breadLabel: item.bread ? BREAD_OPTIONS.find((b) => b.id === item.bread) : null,
        extraNames: (item.extras || []).map((e) => ALL_EXTRAS.find((x) => x.id === e)?.name).filter(Boolean),
      })),
      total: cartTotal, paymentType: type, cashReceived: cashRcvd, change: changeAmt,
      usdReceived: usdRcvd, changeMxn, exchangeRate: type === "usd" ? exchangeRate : null,
      cashier: currentCashier, timestamp: ts,
    };

    setReceiptData(r); setShowReceipt(true); setShowPayment(false);
    setTodaySales((p) => ({ count: p.count + 1, total: p.total + cartTotal }));
    setCart([]); setCashReceived(""); setUsdReceived(""); setPaymentType(null);

    // Save to Supabase in background
    saveSaleToDb(r);
  };

  const calcCustomPrice = () => {
    if (!customizing) return 0;
    const base = getPrice(customizing, selectedSize);
    const mE = customizing.milk ? (MILK_OPTIONS.find((m) => m.id === selectedMilk)?.extra || 0) : 0;
    const dE = selectedExtras.reduce((s, e) => s + (DRINK_EXTRAS.find((x) => x.id === e)?.extra || 0), 0);
    const bE = selectedBagelExtras.reduce((s, e) => s + (BAGEL_EXTRAS.find((x) => x.id === e)?.extra || 0), 0);
    return base + mE + dE + bE;
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" });

  return (
    <div style={{
      height: "100vh", width: "100vw", display: "flex", flexDirection: "column",
      background: "#0f0f0f", color: "#fafafa",
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      overflow: "hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* ══ HEADER ══ */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "7px 14px", background: "#151515", borderBottom: "1px solid #262626", flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6, background: "linear-gradient(135deg, #f59e0b, #d97706)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 12, color: "#000",
          }}>C</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.2 }}>
              CaféOS
              {/* Connection indicator */}
              <span style={{
                display: "inline-block", width: 6, height: 6, borderRadius: 3, marginLeft: 5,
                background: dbConnected ? "#22c55e" : "#ef4444",
                boxShadow: dbConnected ? "0 0 6px #22c55e88" : "0 0 6px #ef444488",
              }} title={dbConnected ? "Conectado a Supabase" : "Sin conexión — modo offline"} />
              {savingCount > 0 && <span style={{ fontSize: 9, color: "#f59e0b", marginLeft: 4 }}>guardando...</span>}
            </div>
            <div style={{ fontSize: 9, color: "#555" }}>D'Volada Montesinos</div>
          </div>
        </div>
        <div style={{ flex: 1, maxWidth: 260, margin: "0 14px" }}>
          <input type="text" placeholder="🔍 Buscar producto..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%", padding: "6px 10px", borderRadius: 7, border: "1px solid #333",
              background: "#1c1c1c", color: "#fafafa", fontSize: 12, outline: "none",
            }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 10 }}>
          <button onClick={() => setShowConfig(true)} style={{
            padding: "4px 8px", borderRadius: 5, border: "1px solid #333",
            background: "#1c1c1c", cursor: "pointer", fontSize: 10, color: "#22c55e",
            fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
          }}>USD ${exchangeRate.toFixed(2)}</button>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#555" }}>{currentCashier} · {todaySales.count} ventas</div>
            <div style={{ fontWeight: 700, color: "#f59e0b", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
              ${todaySales.total.toLocaleString()}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 500, fontSize: 12 }}>{timeStr}</div>
            <div style={{ color: "#555" }}>{dateStr}</div>
          </div>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* ══ LEFT: Categories + Products ══ */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{
            display: "flex", gap: 2, padding: "5px 8px", overflowX: "auto",
            background: "#121212", borderBottom: "1px solid #1c1c1c", flexShrink: 0,
          }}>
            {categories.map((cat) => {
              const active = activeCat === cat.id && !searchQuery;
              return (
                <button key={cat.id}
                  onClick={() => { setActiveCat(cat.id); setSearchQuery(""); }}
                  style={{
                    padding: "4px 10px", borderRadius: 6, border: "none", cursor: "pointer",
                    fontSize: 10, fontWeight: 600, whiteSpace: "nowrap", transition: "all 0.1s",
                    background: active ? cat.color + "22" : "transparent",
                    color: active ? cat.color : "#666",
                  }}
                >{cat.icon} {cat.name}</button>
              );
            })}
          </div>

          <div style={{
            flex: 1, overflow: "auto", padding: 8,
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(115px, 1fr))",
            gap: 5, alignContent: "start",
          }}>
            {filtered.length === 0 && (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: "#444", fontSize: 12 }}>
                {searchQuery ? `Sin resultados para "${searchQuery}"` : "Sin productos"}
              </div>
            )}
            {filtered.map((p) => {
              const catColor = categories.find((c) => c.id === p.cat)?.color || "#f59e0b";
              return (
                <button key={p.id} onClick={() => handleProductClick(p)} style={{
                  padding: "10px 6px", borderRadius: 8, border: "1px solid #262626",
                  background: "#1a1a1a", cursor: "pointer", textAlign: "center",
                  transition: "all 0.12s", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 2, minHeight: 64,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = catColor + "55"; e.currentTarget.style.background = "#1f1f1f"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#262626"; e.currentTarget.style.background = "#1a1a1a"; }}
                >
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#ddd", lineHeight: 1.2 }}>{p.name}</div>
                  <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: catColor, fontWeight: 500 }}>
                    {p.unit ? `$${p.unit}` : `$${p.p12}–${p.p20}`}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ══ RIGHT: Cart ══ */}
        <div style={{
          width: 300, display: "flex", flexDirection: "column",
          background: "#151515", borderLeft: "1px solid #262626", flexShrink: 0,
        }}>
          <div style={{
            padding: "8px 12px", borderBottom: "1px solid #262626",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>
              Ticket {cartCount > 0 && <span style={{
                background: "#f59e0b", color: "#000", borderRadius: 99, padding: "1px 6px",
                fontSize: 9, fontWeight: 700, marginLeft: 4,
              }}>{cartCount}</span>}
            </div>
            {cart.length > 0 && (
              <button onClick={() => setCart([])} style={{
                background: "none", border: "none", color: "#ef4444", fontSize: 10, cursor: "pointer",
              }}>Limpiar</button>
            )}
          </div>

          <div ref={cartRef} style={{ flex: 1, overflow: "auto", padding: "5px 8px" }}>
            {cart.length === 0 ? (
              <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#383838" }}>
                <div style={{ fontSize: 26, marginBottom: 5, opacity: 0.4 }}>☕</div>
                <div style={{ fontSize: 11, color: "#444" }}>Ticket vacío</div>
              </div>
            ) : cart.map((item) => {
              const milkLabel = item.milk && item.milk !== "regular" ? MILK_OPTIONS.find((m) => m.id === item.milk) : null;
              const breadLabel = item.bread ? BREAD_OPTIONS.find((b) => b.id === item.bread) : null;
              const extraNames = (item.extras || []).map((e) => ALL_EXTRAS.find((x) => x.id === e)?.name).filter(Boolean);
              return (
                <div key={item.id} style={{ padding: "8px 10px", marginBottom: 4, borderRadius: 7, background: "#1c1c1c", border: "1px solid #262626" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, display: "flex", gap: 4, alignItems: "baseline" }}>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.product.name}</span>
                        {item.size && <span style={{ color: "#666", fontWeight: 400, fontSize: 10, flexShrink: 0 }}>{item.size}</span>}
                      </div>
                      {(milkLabel || breadLabel || extraNames.length > 0) && (
                        <div style={{ fontSize: 9, color: "#888", marginTop: 2, lineHeight: 1.35 }}>
                          {breadLabel && <span>🍞 {breadLabel.name}</span>}
                          {milkLabel && <span>{breadLabel ? " · " : ""}🥛 {milkLabel.name}{milkLabel.extra > 0 ? ` +$${milkLabel.extra}` : ""}</span>}
                          {extraNames.length > 0 && <span>{(milkLabel || breadLabel) ? " · " : ""}+ {extraNames.join(", ")}</span>}
                        </div>
                      )}
                    </div>
                    <button onClick={() => removeFromCart(item.id)} style={{ background: "none", border: "none", color: "#444", fontSize: 15, cursor: "pointer", padding: "0 2px", lineHeight: 1 }}>×</button>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 5 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <QBtn onClick={() => updateQty(item.id, -1)}>−</QBtn>
                      <span style={{ fontSize: 12, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", minWidth: 12, textAlign: "center" }}>{item.qty}</span>
                      <QBtn onClick={() => updateQty(item.id, 1)}>+</QBtn>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "#f59e0b" }}>${item.total}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {cart.length > 0 && (
            <div style={{ padding: "10px 12px", borderTop: "1px solid #262626" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 9, fontSize: 16, fontWeight: 700 }}>
                <span>Total</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#f59e0b" }}>${cartTotal.toLocaleString()}</span>
              </div>
              <button onClick={() => setShowPayment(true)} style={{
                width: "100%", padding: "12px 0", borderRadius: 9, border: "none",
                background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#000",
                fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}>COBRAR ${cartTotal.toLocaleString()}</button>
            </div>
          )}
        </div>
      </div>

      {/* ══ CUSTOMIZATION MODAL ══ */}
      {customizing && (
        <Overlay onClose={() => setCustomizing(null)}>
          <div style={{ background: "#1a1a1a", borderRadius: 12, padding: 20, width: 360, border: "1px solid #333", maxHeight: "88vh", overflow: "auto" }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{customizing.name}</div>
            <div style={{ fontSize: 10, color: "#666", marginBottom: 16 }}>
              {categories.find((c) => c.id === customizing.cat)?.icon} {categories.find((c) => c.id === customizing.cat)?.name}
            </div>
            {isBev(customizing) && !customizing.unit && (
              <ModSection title="Tamaño">
                <div style={{ display: "flex", gap: 7 }}>
                  {SIZES.map((sz) => {
                    const price = getPrice(customizing, sz.id);
                    const active = selectedSize === sz.id;
                    return (
                      <button key={sz.id} onClick={() => setSelectedSize(sz.id)} style={{
                        flex: 1, padding: "9px 4px", borderRadius: 9, cursor: "pointer",
                        border: active ? "2px solid #f59e0b" : "1px solid #333",
                        background: active ? "#f59e0b0e" : "#262626", textAlign: "center",
                      }}>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{sz.id === "12oz" ? "S" : sz.id === "16oz" ? "M" : "L"}</div>
                        <div style={{ fontSize: 9, color: "#777" }}>{sz.sub}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, marginTop: 2, fontFamily: "'JetBrains Mono', monospace", color: active ? "#f59e0b" : "#bbb" }}>${price}</div>
                      </button>
                    );
                  })}
                </div>
              </ModSection>
            )}
            {customizing.milk && (
              <ModSection title="Leche">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
                  {MILK_OPTIONS.map((m) => (<Chip key={m.id} active={selectedMilk === m.id} label={m.name} sub={m.extra > 0 ? `+$${m.extra}` : null} onClick={() => setSelectedMilk(m.id)} />))}
                </div>
              </ModSection>
            )}
            {isBev(customizing) && (
              <ModSection title="Extras bebida">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {DRINK_EXTRAS.map((e) => (<Chip key={e.id} active={selectedExtras.includes(e.id)} label={`${e.name} +$${e.extra}`}
                    onClick={() => setSelectedExtras((p) => p.includes(e.id) ? p.filter((x) => x !== e.id) : [...p, e.id])} />))}
                </div>
              </ModSection>
            )}
            {isBag(customizing) && (
              <ModSection title="Tipo de pan">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                  {BREAD_OPTIONS.map((b) => (<Chip key={b.id} active={selectedBread === b.id} label={b.name} flex onClick={() => setSelectedBread(b.id)} />))}
                </div>
              </ModSection>
            )}
            {isBag(customizing) && (
              <ModSection title="Adicionales (+$15 c/u)">
                <div style={{ display: "flex", gap: 4 }}>
                  {BAGEL_EXTRAS.map((e) => (<Chip key={e.id} active={selectedBagelExtras.includes(e.id)} label={e.name} sub={`+$${e.extra}`} flex
                    onClick={() => setSelectedBagelExtras((p) => p.includes(e.id) ? p.filter((x) => x !== e.id) : [...p, e.id])} />))}
                </div>
              </ModSection>
            )}
            <button onClick={() => pushToCart(customizing, isBev(customizing) && !customizing.unit ? selectedSize : null, customizing.milk ? selectedMilk : null, isBev(customizing) ? selectedExtras : [], isBag(customizing) ? selectedBread : null, isBag(customizing) ? selectedBagelExtras : [])}
              style={{ width: "100%", padding: "12px 0", borderRadius: 9, border: "none", background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#000", fontSize: 13, fontWeight: 700, cursor: "pointer", marginTop: 2 }}
            >Agregar — ${calcCustomPrice()}</button>
          </div>
        </Overlay>
      )}

      {/* ══ PAYMENT MODAL ══ */}
      {showPayment && (
        <Overlay onClose={() => { setShowPayment(false); setPaymentType(null); }}>
          <div style={{ background: "#1a1a1a", borderRadius: 12, padding: 22, width: 370, border: "1px solid #333" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#777", marginBottom: 5 }}>Cobrar</div>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "#f59e0b", marginBottom: 4 }}>${cartTotal.toLocaleString()} MXN</div>
            <div style={{ fontSize: 12, color: "#22c55e", fontFamily: "'JetBrains Mono', monospace", marginBottom: 18 }}>
              ≈ USD ${(cartTotal / exchangeRate).toFixed(2)} <span style={{ fontSize: 9, color: "#555" }}>@ {exchangeRate.toFixed(2)}</span>
            </div>
            {!paymentType ? (
              <div style={{ display: "flex", gap: 8 }}>
                {[{ t: "cash", icon: "💵", l: "Efectivo MXN", c: "#22c55e" }, { t: "usd", icon: "🇺🇸", l: "Dólares USD", c: "#22c55e" }, { t: "card", icon: "💳", l: "Tarjeta", c: "#3b82f6" }].map((o) => (
                  <button key={o.t} onClick={() => o.t === "card" ? completeSale("card") : setPaymentType(o.t)}
                    style={{ flex: 1, padding: "14px 0", borderRadius: 10, border: "1px solid #333", background: "#262626", cursor: "pointer", textAlign: "center" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = o.c; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#333"; }}>
                    <div style={{ fontSize: 18, marginBottom: 2 }}>{o.icon}</div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: o.c }}>{o.l}</div>
                  </button>
                ))}
              </div>
            ) : paymentType === "cash" ? (
              <div>
                <div style={{ fontSize: 10, color: "#777", marginBottom: 5 }}>Recibido en efectivo (MXN):</div>
                <input type="number" value={cashReceived} onChange={(e) => setCashReceived(e.target.value)} placeholder={`$${cartTotal}`} autoFocus
                  style={{ width: "100%", padding: "11px", borderRadius: 9, border: "2px solid #f59e0b", background: "#262626", color: "#fafafa", fontSize: 18, fontFamily: "'JetBrains Mono', monospace", outline: "none", marginBottom: 8, textAlign: "center", boxSizing: "border-box" }} />
                <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
                  {[50, 100, 200, 500].map((a) => (<button key={a} onClick={() => setCashReceived(String(a))} style={{ flex: 1, padding: "6px 0", borderRadius: 6, border: "1px solid #333", background: "#262626", color: "#bbb", cursor: "pointer", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>${a}</button>))}
                  <button onClick={() => setCashReceived(String(cartTotal))} style={{ flex: 1, padding: "6px 0", borderRadius: 6, border: "1px solid #f59e0b44", background: "#f59e0b11", color: "#f59e0b", cursor: "pointer", fontSize: 10, fontWeight: 600 }}>Exacto</button>
                </div>
                {cashReceived && parseFloat(cashReceived) >= cartTotal && (
                  <div style={{ textAlign: "center", marginBottom: 12, padding: 8, background: "#22c55e0c", borderRadius: 7, border: "1px solid #22c55e28" }}>
                    <div style={{ fontSize: 9, color: "#22c55e" }}>Cambio</div>
                    <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "#22c55e" }}>${(parseFloat(cashReceived) - cartTotal).toFixed(2)} MXN</div>
                  </div>
                )}
                <button onClick={() => completeSale("cash")} disabled={cashReceived && parseFloat(cashReceived) < cartTotal}
                  style={{ width: "100%", padding: "12px 0", borderRadius: 9, border: "none", background: (!cashReceived || parseFloat(cashReceived) >= cartTotal) ? "linear-gradient(135deg, #22c55e, #16a34a)" : "#333", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Completar Venta 💵</button>
                <button onClick={() => setPaymentType(null)} style={{ width: "100%", padding: "8px 0", marginTop: 5, border: "none", background: "none", color: "#555", cursor: "pointer", fontSize: 10 }}>← Cambiar método</button>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 10, color: "#777", marginBottom: 5 }}>Recibido en USD (TC: $1 = ${exchangeRate.toFixed(2)} MXN):</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 16, color: "#22c55e" }}>US$</span>
                  <input type="number" value={usdReceived} onChange={(e) => setUsdReceived(e.target.value)} placeholder={`${(cartTotal / exchangeRate).toFixed(2)}`} autoFocus
                    style={{ flex: 1, padding: "11px", borderRadius: 9, border: "2px solid #22c55e", background: "#262626", color: "#fafafa", fontSize: 18, fontFamily: "'JetBrains Mono', monospace", outline: "none", textAlign: "center", boxSizing: "border-box" }} />
                </div>
                <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
                  {[5, 10, 20, 50].map((a) => (<button key={a} onClick={() => setUsdReceived(String(a))} style={{ flex: 1, padding: "6px 0", borderRadius: 6, border: "1px solid #333", background: "#262626", color: "#bbb", cursor: "pointer", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>US${a}</button>))}
                  <button onClick={() => setUsdReceived((cartTotal / exchangeRate).toFixed(2))} style={{ flex: 1, padding: "6px 0", borderRadius: 6, border: "1px solid #22c55e44", background: "#22c55e11", color: "#22c55e", cursor: "pointer", fontSize: 10, fontWeight: 600 }}>Exacto</button>
                </div>
                {usdReceived && (parseFloat(usdReceived) * exchangeRate) >= cartTotal && (() => {
                  const mxnE = parseFloat(usdReceived) * exchangeRate, chg = mxnE - cartTotal;
                  return (<div style={{ textAlign: "center", marginBottom: 12, padding: 8, background: "#22c55e0c", borderRadius: 7, border: "1px solid #22c55e28" }}>
                    <div style={{ fontSize: 9, color: "#22c55e" }}>Equivale a</div>
                    <div style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: "#888", marginBottom: 4 }}>US${usdReceived} × {exchangeRate.toFixed(2)} = ${mxnE.toFixed(2)} MXN</div>
                    <div style={{ fontSize: 9, color: "#22c55e" }}>Cambio</div>
                    <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "#22c55e" }}>${chg.toFixed(2)} MXN</div>
                  </div>);
                })()}
                <button onClick={() => completeSale("usd")} disabled={!usdReceived || (parseFloat(usdReceived) * exchangeRate) < cartTotal}
                  style={{ width: "100%", padding: "12px 0", borderRadius: 9, border: "none", background: (usdReceived && (parseFloat(usdReceived) * exchangeRate) >= cartTotal) ? "linear-gradient(135deg, #22c55e, #16a34a)" : "#333", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Completar Venta 🇺🇸</button>
                <button onClick={() => setPaymentType(null)} style={{ width: "100%", padding: "8px 0", marginTop: 5, border: "none", background: "none", color: "#555", cursor: "pointer", fontSize: 10 }}>← Cambiar método</button>
              </div>
            )}
          </div>
        </Overlay>
      )}

      {/* ══ CONFIG MODAL ══ */}
      {showConfig && (
        <Overlay onClose={() => setShowConfig(false)}>
          <div style={{ background: "#1a1a1a", borderRadius: 12, padding: 22, width: 300, border: "1px solid #333" }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Configuración</div>
            <div style={{ fontSize: 10, color: "#777", marginBottom: 6 }}>Tipo de cambio (1 USD =)</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <input type="number" step="0.01" value={exchangeRate} onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 0)}
                style={{ flex: 1, padding: "10px", borderRadius: 8, border: "2px solid #22c55e", background: "#262626", color: "#fafafa", fontSize: 18, fontFamily: "'JetBrains Mono', monospace", outline: "none", textAlign: "center", boxSizing: "border-box" }} />
              <span style={{ fontSize: 13, color: "#888" }}>MXN</span>
            </div>
            <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
              {[16.50, 17.00, 17.50, 18.00].map((r) => (<button key={r} onClick={() => setExchangeRate(r)} style={{ flex: 1, padding: "6px 0", borderRadius: 6, border: exchangeRate === r ? "1px solid #22c55e" : "1px solid #333", background: exchangeRate === r ? "#22c55e11" : "#262626", color: exchangeRate === r ? "#22c55e" : "#bbb", cursor: "pointer", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>{r.toFixed(2)}</button>))}
            </div>
            <div style={{ fontSize: 10, color: "#777", marginBottom: 8 }}>Cajero activo:</div>
            <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
              {["Cajero 1", "Cajero 2", "Gerente"].map((c) => (<button key={c} onClick={() => setCurrentCashier(c)} style={{ flex: 1, padding: "7px 0", borderRadius: 6, border: currentCashier === c ? "1px solid #f59e0b" : "1px solid #333", background: currentCashier === c ? "#f59e0b11" : "#262626", color: currentCashier === c ? "#f59e0b" : "#bbb", cursor: "pointer", fontSize: 10, fontWeight: 600 }}>{c}</button>))}
            </div>
            <div style={{ fontSize: 9, color: "#444", marginBottom: 10 }}>
              DB: {dbConnected ? "🟢 Conectado" : "🔴 Desconectado"} · {products.length} productos · {categories.length} categorías
            </div>
            <button onClick={() => setShowConfig(false)} style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: "#262626", color: "#fafafa", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Listo</button>
          </div>
        </Overlay>
      )}

      {/* ══ RECEIPT MODAL ══ */}
      {showReceipt && receiptData && (
        <Overlay onClose={() => setShowReceipt(false)}>
          <div style={{ background: "#fff", borderRadius: 12, width: 340, maxHeight: "90vh", overflow: "auto", color: "#111", fontFamily: "'JetBrains Mono', 'Courier New', monospace" }}>
            <div style={{ padding: "24px 20px 16px" }}>
              <div style={{ textAlign: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "0.05em", fontFamily: "'DM Sans', sans-serif" }}>D'Volada</div>
                <div style={{ fontSize: 9, color: "#666", marginTop: 2, fontFamily: "'DM Sans', sans-serif" }}>Café & Smoothies</div>
                <div style={{ fontSize: 8, color: "#999", marginTop: 6, lineHeight: 1.5 }}>D'Volada Montesinos<br />Plaza Montesino L-10, Carr. Libre TJ-Ens #10951<br />Tejamen, 22635 Tijuana, B.C.</div>
              </div>
              <div style={{ borderTop: "1px dashed #ccc", margin: "10px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#666", marginBottom: 2 }}>
                <span>Recibo #{receiptData.number}</span>
                <span>{receiptData.timestamp.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#666", marginBottom: 8 }}>
                <span>Cajero: {receiptData.cashier}</span>
                <span>{receiptData.timestamp.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
              </div>
              <div style={{ borderTop: "1px dashed #ccc", margin: "10px 0" }} />
              {receiptData.items.map((item, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 600 }}>
                    <span>{item.qty > 1 ? `${item.qty}× ` : ""}{item.product.name}{item.size ? ` ${item.size}` : ""}</span>
                    <span>${item.total.toFixed(2)}</span>
                  </div>
                  {(item.breadLabel || item.milkLabel || item.extraNames?.length > 0) && (
                    <div style={{ fontSize: 8, color: "#888", paddingLeft: 8, marginTop: 1, lineHeight: 1.4 }}>
                      {item.breadLabel && <div>Pan: {item.breadLabel.name}</div>}
                      {item.milkLabel && <div>Leche: {item.milkLabel.name}{item.milkLabel.extra > 0 ? ` (+$${item.milkLabel.extra})` : ""}</div>}
                      {item.extraNames?.length > 0 && <div>Extras: {item.extraNames.join(", ")}</div>}
                    </div>
                  )}
                  {item.qty > 1 && <div style={{ fontSize: 8, color: "#999", paddingLeft: 8 }}>c/u ${item.unitPrice.toFixed(2)}</div>}
                </div>
              ))}
              <div style={{ borderTop: "1px dashed #ccc", margin: "10px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 800, marginTop: 4 }}>
                <span>TOTAL</span><span>${receiptData.total.toFixed(2)} MXN</span>
              </div>
              <div style={{ borderTop: "1px dashed #ccc", margin: "10px 0" }} />
              <div style={{ fontSize: 9, color: "#555" }}>
                {receiptData.paymentType === "cash" && (<><div style={{ display: "flex", justifyContent: "space-between" }}><span>💵 Efectivo MXN</span><span>${receiptData.cashReceived?.toFixed(2)}</span></div>
                  {receiptData.change > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "#111", marginTop: 2 }}><span>Cambio</span><span>${receiptData.change.toFixed(2)}</span></div>}</>)}
                {receiptData.paymentType === "usd" && (<><div style={{ display: "flex", justifyContent: "space-between" }}><span>🇺🇸 Pago USD</span><span>US${receiptData.usdReceived?.toFixed(2)}</span></div>
                  <div style={{ fontSize: 8, color: "#999", marginTop: 1 }}>TC: $1 USD = ${receiptData.exchangeRate?.toFixed(2)} MXN</div>
                  {receiptData.changeMxn > 0.01 && <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "#111", marginTop: 2 }}><span>Cambio</span><span>${receiptData.changeMxn.toFixed(2)} MXN</span></div>}</>)}
                {receiptData.paymentType === "card" && <div style={{ display: "flex", justifyContent: "space-between" }}><span>💳 Tarjeta</span><span>${receiptData.total.toFixed(2)}</span></div>}
              </div>
              <div style={{ borderTop: "1px dashed #ccc", margin: "10px 0" }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 80, height: 80, margin: "0 auto 6px", border: "2px dashed #ddd", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#ccc", fontSize: 9 }}>
                  <div><div style={{ fontSize: 20, marginBottom: 2 }}>📱</div>QR Loyalty</div>
                </div>
                <div style={{ fontSize: 7, color: "#bbb" }}>Próximamente: escanea para acumular puntos</div>
              </div>
              <div style={{ borderTop: "1px dashed #ccc", margin: "10px 0" }} />
              <div style={{ textAlign: "center", fontSize: 8, color: "#999", lineHeight: 1.6 }}>
                ¡Gracias por tu preferencia!<br />D'Volada Café & Smoothies<br /><span style={{ fontSize: 7 }}>Powered by CaféOS</span>
              </div>
            </div>
            <div style={{ padding: "0 20px 20px", display: "flex", gap: 8 }}>
              <button onClick={() => setShowReceipt(false)} style={{ flex: 1, padding: "11px 0", borderRadius: 8, border: "none", background: "#111", color: "#fafafa", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Nueva Venta</button>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  );
}
