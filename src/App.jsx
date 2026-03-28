import { useState, useCallback, useRef, useEffect } from "react";

// ============================================================
// SUPABASE
// ============================================================
const SB_URL = "https://lkpsfhqqaropogaepuyy.supabase.co";
const SB_KEY = "sb_publishable_R5_AMdm-4XKw4yf3P5sVRg_tUCNWuAu";
const STORE = "a0000000-0000-0000-0000-000000000001";
const H = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" };

const api = {
  async get(table, q = "") { const r = await fetch(`${SB_URL}/rest/v1/${table}?${q}`, { headers: H }); if (!r.ok) throw new Error(await r.text()); return r.json(); },
  async post(table, data) { const r = await fetch(`${SB_URL}/rest/v1/${table}`, { method: "POST", headers: H, body: JSON.stringify(data) }); if (!r.ok) throw new Error(await r.text()); return r.json(); },
  async patch(table, match, data) { const r = await fetch(`${SB_URL}/rest/v1/${table}?${match}`, { method: "PATCH", headers: H, body: JSON.stringify(data) }); if (!r.ok) throw new Error(await r.text()); return r.json(); },
};

// ============================================================
// LOCAL FALLBACK DATA
// ============================================================
const CAT_META = {
  "Especialidades Calientes": { icon: "☕", color: "#d97706" }, "Frappé / Rocas": { icon: "🧊", color: "#3b82f6" },
  "Tradiciones": { icon: "🫘", color: "#92400e" }, "Smoothies": { icon: "🍓", color: "#16a34a" },
  "Té / Tisana": { icon: "🍵", color: "#7c3aed" }, "Jugos": { icon: "🍊", color: "#ea580c" },
  "Bagels": { icon: "🥯", color: "#ca8a04" }, "Ensaladas": { icon: "🥗", color: "#059669" },
  "Wraps": { icon: "🌯", color: "#65a30d" }, "Repostería": { icon: "🍰", color: "#db2777" },
  "Galletas": { icon: "🍪", color: "#c2410c" }, "Complementos": { icon: "➕", color: "#64748b" },
  "Espresso": { icon: "⚡", color: "#1e293b" }, "Iced Coffee": { icon: "🥤", color: "#06b6d4" },
  "Malteadas": { icon: "🥛", color: "#c084fc" }, "Pasteles": { icon: "🎂", color: "#be185d" },
  "Soda Italiana": { icon: "🍹", color: "#ef4444" },
};
const LC = [
  { id:"hot",name:"Calientes",icon:"☕",color:"#d97706"},{id:"frappe",name:"Frappé",icon:"🧊",color:"#3b82f6"},
  {id:"tradiciones",name:"Tradiciones",icon:"🫘",color:"#92400e"},{id:"smoothies",name:"Smoothies",icon:"🍓",color:"#16a34a"},
  {id:"tea",name:"Té",icon:"🍵",color:"#7c3aed"},{id:"jugos",name:"Jugos",icon:"🍊",color:"#ea580c"},
  {id:"bagels",name:"Bagels",icon:"🥯",color:"#ca8a04"},{id:"ensaladas",name:"Ensaladas",icon:"🥗",color:"#059669"},
  {id:"wraps",name:"Wraps",icon:"🌯",color:"#65a30d"},{id:"reposteria",name:"Repostería",icon:"🍰",color:"#db2777"},
  {id:"galletas",name:"Galletas",icon:"🍪",color:"#c2410c"},{id:"complementos",name:"Extras",icon:"➕",color:"#64748b"},
];
const LP = [
  {id:"cap",name:"Cappuccino",cat:"hot",p12:78,p16:83,p20:88,milk:true},
  {id:"lat",name:"Café Latte",cat:"hot",p12:75,p16:80,p20:85,milk:true},
  {id:"car",name:"Caramelo",cat:"hot",p12:85,p16:90,p20:95,milk:true},
  {id:"caj",name:"Cajeta",cat:"hot",p12:85,p16:90,p20:95,milk:true},
  {id:"moc",name:"Mocha",cat:"hot",p12:85,p16:90,p20:95,milk:true},
  {id:"mxm",name:"Mexican Mocha",cat:"hot",p12:85,p16:90,p20:95,milk:true},
  {id:"ore",name:"Oreo",cat:"hot",p12:88,p16:93,p20:98,milk:true},
  {id:"bro",name:"Brownie",cat:"hot",p12:88,p16:93,p20:98,milk:true},
  {id:"cha",name:"Chai Té",cat:"hot",p12:85,p16:90,p20:95,milk:true},
  {id:"ame",name:"Americano",cat:"hot",p12:55,p16:60,p20:65,milk:false},
  {id:"cho",name:"Chocolate",cat:"hot",p12:75,p16:78,p20:82,milk:true},
  {id:"esp",name:"Espresso",cat:"hot",p12:45,p16:50,p20:55,milk:false},
  {id:"f_lat",name:"Latte",cat:"frappe",p12:78,p16:83,p20:88,milk:true},
  {id:"f_moc",name:"Mocha",cat:"frappe",p12:85,p16:90,p20:95,milk:true},
  {id:"f_car",name:"Caramelo",cat:"frappe",p12:85,p16:90,p20:95,milk:true},
  {id:"f_caj",name:"Cajeta",cat:"frappe",p12:88,p16:93,p20:98,milk:true},
  {id:"f_ore",name:"Oreo",cat:"frappe",p12:88,p16:93,p20:98,milk:true},
  {id:"f_bro",name:"Brownie",cat:"frappe",p12:88,p16:93,p20:98,milk:true},
  {id:"f_cha",name:"Chai",cat:"frappe",p12:85,p16:90,p20:95,milk:true},
  {id:"f_cho",name:"Chocolate",cat:"frappe",p12:74,p16:78,p20:83,milk:true},
  {id:"f_ice",name:"Iced Coffee",cat:"frappe",p12:60,p16:63,p20:65,milk:false},
  {id:"f_sod",name:"Soda Italiana",cat:"frappe",unit:60},
  {id:"alt",name:"Altura",cat:"tradiciones",p12:43,p16:47,p20:50,milk:false},
  {id:"org",name:"Orgánico",cat:"tradiciones",p12:43,p16:47,p20:50,milk:false},
  {id:"dec",name:"Descaf",cat:"tradiciones",p12:43,p16:47,p20:50,milk:false},
  {id:"s1",name:"Locura D'Fresa",cat:"smoothies",unit:90},{id:"s2",name:"Pellizco Cítrico",cat:"smoothies",unit:90},
  {id:"s3",name:"Placer D'Durazno",cat:"smoothies",unit:90},{id:"s4",name:"Naranja Coqueta",cat:"smoothies",unit:90},
  {id:"s5",name:"Ola Tropical",cat:"smoothies",unit:90},{id:"s6",name:"Oasis D'Frutas",cat:"smoothies",unit:90},
  {id:"s7",name:"Pasión Caribeña",cat:"smoothies",unit:90},{id:"s8",name:"Mango D'Volada",cat:"smoothies",unit:90},
  {id:"s9",name:"Aloha",cat:"smoothies",unit:90},
  {id:"t1",name:"Fresas-Kiwi",cat:"tea",unit:80},{id:"t2",name:"Blend 1776",cat:"tea",unit:80},
  {id:"t3",name:"Manzanilla",cat:"tea",unit:80},{id:"t4",name:"Hierbabuena",cat:"tea",unit:80},
  {id:"t5",name:"Frutas Pasión",cat:"tea",unit:80},{id:"t6",name:"Limón Tropical",cat:"tea",unit:80},
  {id:"t7",name:"Tutti-Frutti",cat:"tea",unit:80},{id:"t8",name:"Zarzamora",cat:"tea",unit:80},
  {id:"t9",name:"Mezcla Relajante",cat:"tea",unit:80},{id:"t10",name:"Jazmín",cat:"tea",unit:80},
  {id:"t11",name:"Blue Eyes",cat:"tea",unit:80},{id:"t12",name:"Earl Grey",cat:"tea",unit:80},
  {id:"j1",name:"Jugo Verde",cat:"jugos",unit:75},{id:"j2",name:"Jugo de Naranja",cat:"jugos",unit:75},
  {id:"j3",name:"Jugo Betabel",cat:"jugos",unit:75},
  {id:"b1",name:"D'Sándwich",cat:"bagels",unit:85,bread:true},{id:"b2",name:"D'Pollo",cat:"bagels",unit:95,bread:true},
  {id:"b3",name:"D'Sayuno",cat:"bagels",unit:85,bread:true},{id:"b4",name:"D'Clásico",cat:"bagels",unit:65,bread:true},
  {id:"b5",name:"D'Nutella",cat:"bagels",unit:65,bread:true},{id:"b6",name:"D'Clásico +",cat:"bagels",unit:70,bread:true},
  {id:"b7",name:"D'Fresa",cat:"bagels",unit:65,bread:true},{id:"b8",name:"D'Atún",cat:"bagels",unit:95,bread:true},
  {id:"e1",name:"Ensalada Pollo",cat:"ensaladas",unit:145},{id:"e2",name:"Ensalada Atún",cat:"ensaladas",unit:145},
  {id:"e3",name:"Ensalada César",cat:"ensaladas",unit:145},
  {id:"w1",name:"Wrap Pollo",cat:"wraps",unit:145},{id:"w2",name:"Wrap Atún",cat:"wraps",unit:145},
  {id:"w3",name:"Wrap Americano",cat:"wraps",unit:145},{id:"w4",name:"Wrap César",cat:"wraps",unit:145},
  {id:"r1",name:"Brownie",cat:"reposteria",unit:40},{id:"r2",name:"Brownie Queso",cat:"reposteria",unit:40},
  {id:"r3",name:"Coyota",cat:"reposteria",unit:40},{id:"r4",name:"Empanada Cajeta",cat:"reposteria",unit:40},
  {id:"r5",name:"Muffin Chocolate",cat:"reposteria",unit:40},{id:"r6",name:"Muffin Moras",cat:"reposteria",unit:40},
  {id:"r7",name:"Pastel Zanahoria",cat:"reposteria",unit:65},{id:"r8",name:"Pastel Chocolate",cat:"reposteria",unit:65},
  {id:"r9",name:"Madelines",cat:"reposteria",unit:20},{id:"r10",name:"Orejitas",cat:"reposteria",unit:20},
  {id:"r11",name:"Mixtas",cat:"reposteria",unit:19},{id:"r12",name:"Mini Brownie",cat:"reposteria",unit:20},
  {id:"r13",name:"Galleta Rellena",cat:"reposteria",unit:40},
  {id:"g1",name:"Ajonjolí",cat:"galletas",unit:40},{id:"g2",name:"Avena",cat:"galletas",unit:40},
  {id:"g3",name:"Granola Miel",cat:"galletas",unit:40},{id:"g4",name:"Nuez",cat:"galletas",unit:40},
  {id:"g5",name:"Dátil",cat:"galletas",unit:40},{id:"g6",name:"Avena Naranja",cat:"galletas",unit:40},
  {id:"g7",name:"4 Galletas",cat:"galletas",unit:49},{id:"g8",name:"Linaza-Cajeta",cat:"galletas",unit:35},
  {id:"g9",name:"Barra Granola",cat:"galletas",unit:20},
  {id:"x1",name:"Avena",cat:"complementos",unit:75},{id:"x2",name:"Licuado Plátano",cat:"complementos",unit:68},
  {id:"x3",name:"Botella Agua",cat:"complementos",unit:35},{id:"x4",name:"Malteada Vainilla",cat:"complementos",unit:98},
  {id:"x5",name:"Malteada Oreo",cat:"complementos",unit:98},{id:"x6",name:"Malteada Cappu",cat:"complementos",unit:98},
];

// ============================================================
// MODIFIERS
// ============================================================
const SIZES = [{id:"12oz",label:"12oz",sub:"Chico"},{id:"16oz",label:"16oz",sub:"Mediano"},{id:"20oz",label:"20oz",sub:"Grande"}];
const MILKS = [{id:"regular",name:"Regular",extra:0},{id:"light",name:"Light",extra:0},{id:"deslac",name:"Deslactosada",extra:0},{id:"almendra",name:"Almendras",extra:20},{id:"soya",name:"Soya",extra:20},{id:"coco",name:"Coco",extra:20}];
const DEXT = [{id:"shot",name:"Shot Extra",extra:15},{id:"jarabe",name:"Jarabe Extra",extra:15},{id:"mocha",name:"Mocha",extra:15},{id:"miel",name:"Miel",extra:15}];
const BREADS = [{id:"natural",name:"Natural",extra:0},{id:"parmesano",name:"Parmesano",extra:0},{id:"ajonjoli",name:"Ajonjolí",extra:0},{id:"12granos",name:"12 Granos",extra:0}];
const BEXT = [{id:"jamon",name:"Jamón",extra:15},{id:"aguacate",name:"Aguacate",extra:15}];
const ALLEXT = [...DEXT, ...BEXT];

// ============================================================
// UI COMPONENTS
// ============================================================
const Overlay = ({children, onClose}) => (
  <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(3px)"}}>
    <div onClick={e=>e.stopPropagation()}>{children}</div>
  </div>
);
const Sec = ({title,children}) => (<div style={{marginBottom:16}}><div style={{fontSize:10,fontWeight:700,color:"#777",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.08em"}}>{title}</div>{children}</div>);
const Chip = ({active,label,sub,onClick,flex}) => (<button onClick={onClick} style={{padding:"6px 11px",borderRadius:7,cursor:"pointer",border:active?"2px solid #f59e0b":"1px solid #333",background:active?"#f59e0b11":"#262626",fontSize:11,color:active?"#f59e0b":"#ccc",fontWeight:active?600:400,textAlign:"center",flex:flex?1:undefined,minWidth:0}}>{label}{sub&&<div style={{fontSize:9,color:"#555",marginTop:1}}>{sub}</div>}</button>);
const QBtn = ({children,onClick}) => (<button onClick={onClick} style={{width:22,height:22,borderRadius:5,border:"1px solid #333",background:"#262626",color:"#fff",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>{children}</button>);
const mono = "'JetBrains Mono', monospace";

// ============================================================
// INVENTORY PAGE
// ============================================================
function InventoryPage({ ingredients, setIngredients, dbConnected, recipes }) {
  const [tab, setTab] = useState("stock"); // stock | entry | waste
  const [entryIngr, setEntryIngr] = useState("");
  const [entryQty, setEntryQty] = useState("");
  const [entryUnits, setEntryUnits] = useState("1");
  const [entryCost, setEntryCost] = useState("");
  const [entrySupplier, setEntrySupplier] = useState("");
  const [entryExpires, setEntryExpires] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [wasteIngr, setWasteIngr] = useState("");
  const [wasteQty, setWasteQty] = useState("");
  const [wasteReason, setWasteReason] = useState("");

  const filtered = ingredients.filter(i => {
    if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (catFilter !== "all" && i.category !== catFilter) return false;
    return true;
  });

  const cats = [...new Set(ingredients.map(i => i.category).filter(Boolean))].sort();
  const lowStock = ingredients.filter(i => i.stock_qty !== null && i.min_stock && Number(i.stock_qty) <= Number(i.min_stock));

  const selectedIngr = ingredients.find(i => i.id === entryIngr);

  const handleEntry = async () => {
    if (!entryIngr || !entryUnits) return;
    setSaving(true); setMsg(null);
    try {
      const ing = ingredients.find(i => i.id === entryIngr);
      const supplierUnits = parseFloat(entryUnits) || 1;
      const qtyBase = supplierUnits * (ing.supplier_unit_qty || 1);
      const costTotal = parseFloat(entryCost) || (supplierUnits * (ing.supplier_unit_cost || 0));

      if (dbConnected) {
        await api.post("inventory_entries", {
          store_id: STORE, ingredient_id: entryIngr,
          qty_received: qtyBase, supplier_units: supplierUnits,
          cost_per_unit: qtyBase > 0 ? costTotal / qtyBase : 0,
          cost_total: costTotal, supplier: entrySupplier || ing.supplier,
          expires_at: entryExpires || null,
        });
        await api.post("inventory_movements", {
          store_id: STORE, ingredient_id: entryIngr,
          type: "purchase", qty: qtyBase,
          reason: `Compra: ${supplierUnits} ${ing.supplier_unit || 'unidades'} de ${ing.name}`,
        });
        await api.patch("ingredients", `id=eq.${entryIngr}`, {
          stock_qty: Number(ing.stock_qty || 0) + qtyBase,
          cost_per_unit: qtyBase > 0 ? costTotal / qtyBase : ing.cost_per_unit,
        });
        // Reload ingredients
        const fresh = await api.get("ingredients", `select=*&store_id=eq.${STORE}&active=eq.true&order=name`);
        setIngredients(fresh);
      }
      setMsg({ type: "ok", text: `+${qtyBase.toFixed(0)} ${ing.unit} de ${ing.name} registrados` });
      setEntryIngr(""); setEntryQty(""); setEntryUnits("1"); setEntryCost(""); setEntrySupplier(""); setEntryExpires("");
    } catch (err) {
      setMsg({ type: "err", text: "Error: " + err.message });
    }
    setSaving(false);
  };

  const handleWaste = async () => {
    if (!wasteIngr || !wasteQty) return;
    setSaving(true); setMsg(null);
    try {
      const ing = ingredients.find(i => i.id === wasteIngr);
      const qty = parseFloat(wasteQty);
      if (dbConnected) {
        await api.post("inventory_movements", {
          store_id: STORE, ingredient_id: wasteIngr,
          type: "waste", qty: -qty,
          reason: wasteReason || "Merma reportada",
        });
        await api.patch("ingredients", `id=eq.${wasteIngr}`, {
          stock_qty: Math.max(0, Number(ing.stock_qty || 0) - qty),
        });
        const fresh = await api.get("ingredients", `select=*&store_id=eq.${STORE}&active=eq.true&order=name`);
        setIngredients(fresh);
      }
      setMsg({ type: "ok", text: `-${qty} ${ing.unit} de ${ing.name} (merma)` });
      setWasteIngr(""); setWasteQty(""); setWasteReason("");
    } catch (err) {
      setMsg({ type: "err", text: "Error: " + err.message });
    }
    setSaving(false);
  };

  const S = { input: { width:"100%",padding:"9px 12px",borderRadius:7,border:"1px solid #333",background:"#1e1e1e",color:"#fafafa",fontSize:12,outline:"none",boxSizing:"border-box" } };

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      {/* Tabs */}
      <div style={{ display:"flex", gap:0, borderBottom:"1px solid #262626", background:"#131313", flexShrink:0 }}>
        {[{id:"stock",label:"📦 Stock Actual",c:lowStock.length>0?`(${lowStock.length} alertas)`:""},{id:"entry",label:"📥 Registrar Entrada"},{id:"waste",label:"🗑️ Merma"}].map(t=>(
          <button key={t.id} onClick={()=>{setTab(t.id);setMsg(null);}} style={{
            padding:"10px 18px",fontSize:12,fontWeight:tab===t.id?700:400,cursor:"pointer",
            border:"none",borderBottom:tab===t.id?"2px solid #f59e0b":"2px solid transparent",
            background:"transparent",color:tab===t.id?"#f59e0b":"#777",
          }}>{t.label} {t.c&&<span style={{fontSize:10,color:"#ef4444"}}>{t.c}</span>}</button>
        ))}
      </div>

      {/* Message */}
      {msg && (
        <div style={{padding:"8px 16px",fontSize:12,fontWeight:600,background:msg.type==="ok"?"#22c55e18":"#ef444418",color:msg.type==="ok"?"#22c55e":"#ef4444",borderBottom:"1px solid #262626"}}>
          {msg.text}
          <button onClick={()=>setMsg(null)} style={{float:"right",background:"none",border:"none",color:"inherit",cursor:"pointer",fontSize:14}}>×</button>
        </div>
      )}

      {/* ── STOCK TAB ── */}
      {tab === "stock" && (
        <div style={{ flex:1, overflow:"auto", padding:12 }}>
          <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
            <input type="text" placeholder="🔍 Buscar ingrediente..." value={search} onChange={e=>setSearch(e.target.value)}
              style={{...S.input, flex:1, maxWidth:280}} />
            <select value={catFilter} onChange={e=>setCatFilter(e.target.value)}
              style={{...S.input, width:"auto", minWidth:130}}>
              <option value="all">Todas las categorías</option>
              {cats.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Low stock alerts */}
          {lowStock.length > 0 && catFilter === "all" && !search && (
            <div style={{padding:10,marginBottom:12,borderRadius:8,background:"#ef44440d",border:"1px solid #ef444430"}}>
              <div style={{fontSize:11,fontWeight:700,color:"#ef4444",marginBottom:6}}>⚠️ Stock bajo ({lowStock.length})</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {lowStock.map(i=>(
                  <span key={i.id} style={{padding:"3px 8px",borderRadius:5,background:"#ef44441a",color:"#ef4444",fontSize:10,fontWeight:600}}>
                    {i.name}: {Number(i.stock_qty).toFixed(0)} {i.unit}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stock table */}
          <div style={{borderRadius:8,border:"1px solid #262626",overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
              <thead>
                <tr style={{background:"#1e1e1e"}}>
                  <th style={{padding:"8px 10px",textAlign:"left",fontWeight:600,color:"#888",fontSize:10}}>Ingrediente</th>
                  <th style={{padding:"8px 10px",textAlign:"right",color:"#888",fontSize:10}}>Stock</th>
                  <th style={{padding:"8px 10px",textAlign:"left",color:"#888",fontSize:10}}>Unidad</th>
                  <th style={{padding:"8px 10px",textAlign:"right",color:"#888",fontSize:10}}>Costo/u</th>
                  <th style={{padding:"8px 10px",textAlign:"left",color:"#888",fontSize:10}}>Proveedor</th>
                  <th style={{padding:"8px 10px",textAlign:"left",color:"#888",fontSize:10}}>Cat.</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(i => {
                  const isLow = i.min_stock && Number(i.stock_qty||0) <= Number(i.min_stock);
                  return (
                    <tr key={i.id} style={{background:"#1a1a1a",borderTop:"1px solid #222"}}>
                      <td style={{padding:"7px 10px",fontWeight:600,color:"#ddd"}}>{i.name}</td>
                      <td style={{padding:"7px 10px",textAlign:"right",fontFamily:mono,fontWeight:700,
                        color:isLow?"#ef4444":Number(i.stock_qty||0)>0?"#22c55e":"#555"}}>
                        {Number(i.stock_qty||0).toFixed(i.unit==="pz"?0:1)}
                      </td>
                      <td style={{padding:"7px 10px",color:"#888"}}>{i.unit}</td>
                      <td style={{padding:"7px 10px",textAlign:"right",fontFamily:mono,color:"#888"}}>
                        ${Number(i.cost_per_unit||0).toFixed(4)}
                      </td>
                      <td style={{padding:"7px 10px",color:"#888"}}>{i.supplier||"—"}</td>
                      <td style={{padding:"7px 10px"}}><span style={{padding:"2px 6px",borderRadius:4,background:"#262626",color:"#999",fontSize:9}}>{i.category}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{fontSize:10,color:"#555",marginTop:8}}>{filtered.length} ingredientes{search||catFilter!=="all"?" (filtrados)":""}</div>
        </div>
      )}

      {/* ── ENTRY TAB ── */}
      {tab === "entry" && (
        <div style={{ flex:1, overflow:"auto", padding:16 }}>
          <div style={{maxWidth:500}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:16}}>📥 Registrar Entrada de Mercancía</div>

            <div style={{marginBottom:12}}>
              <label style={{fontSize:10,color:"#888",display:"block",marginBottom:4}}>Ingrediente *</label>
              <select value={entryIngr} onChange={e=>setEntryIngr(e.target.value)} style={{...S.input}}>
                <option value="">Seleccionar...</option>
                {cats.map(c=>(
                  <optgroup key={c} label={c.toUpperCase()}>
                    {ingredients.filter(i=>i.category===c).map(i=>(
                      <option key={i.id} value={i.id}>{i.name} ({i.unit}) — {i.supplier}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {selectedIngr && (
              <div style={{padding:10,borderRadius:8,background:"#1e1e1e",border:"1px solid #333",marginBottom:12,fontSize:11}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{color:"#888"}}>Proveedor:</span><span style={{color:"#ddd"}}>{selectedIngr.supplier}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{color:"#888"}}>Presentación:</span><span style={{color:"#ddd"}}>{selectedIngr.supplier_unit || "—"}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{color:"#888"}}>Costo por presentación:</span><span style={{color:"#f59e0b",fontFamily:mono}}>${Number(selectedIngr.supplier_unit_cost||0).toFixed(2)}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{color:"#888"}}>Stock actual:</span>
                  <span style={{color:Number(selectedIngr.stock_qty||0)>0?"#22c55e":"#ef4444",fontFamily:mono}}>
                    {Number(selectedIngr.stock_qty||0).toFixed(1)} {selectedIngr.unit}
                  </span>
                </div>
              </div>
            )}

            <div style={{display:"flex",gap:10,marginBottom:12}}>
              <div style={{flex:1}}>
                <label style={{fontSize:10,color:"#888",display:"block",marginBottom:4}}>Cantidad (presentaciones) *</label>
                <input type="number" value={entryUnits} onChange={e=>setEntryUnits(e.target.value)}
                  placeholder="Ej: 2 bolsas" style={S.input} />
              </div>
              <div style={{flex:1}}>
                <label style={{fontSize:10,color:"#888",display:"block",marginBottom:4}}>Costo total $</label>
                <input type="number" value={entryCost} onChange={e=>setEntryCost(e.target.value)}
                  placeholder={selectedIngr ? `$${((parseFloat(entryUnits)||1)*Number(selectedIngr.supplier_unit_cost||0)).toFixed(2)}` : "$0"}
                  style={S.input} />
              </div>
            </div>

            <div style={{display:"flex",gap:10,marginBottom:12}}>
              <div style={{flex:1}}>
                <label style={{fontSize:10,color:"#888",display:"block",marginBottom:4}}>Proveedor</label>
                <input type="text" value={entrySupplier} onChange={e=>setEntrySupplier(e.target.value)}
                  placeholder={selectedIngr?.supplier||"CAFETISIMO"} style={S.input} />
              </div>
              <div style={{flex:1}}>
                <label style={{fontSize:10,color:"#888",display:"block",marginBottom:4}}>Caduca</label>
                <input type="date" value={entryExpires} onChange={e=>setEntryExpires(e.target.value)} style={S.input} />
              </div>
            </div>

            {selectedIngr && entryUnits && (
              <div style={{padding:10,borderRadius:8,background:"#f59e0b0d",border:"1px solid #f59e0b30",marginBottom:14,fontSize:11}}>
                <span style={{color:"#f59e0b",fontWeight:600}}>Resumen: </span>
                <span style={{color:"#ccc"}}>
                  {entryUnits} × {selectedIngr.supplier_unit||"unidad"} = <strong style={{color:"#f59e0b"}}>
                  +{((parseFloat(entryUnits)||1) * (selectedIngr.supplier_unit_qty||1)).toFixed(0)} {selectedIngr.unit}</strong> al stock
                </span>
              </div>
            )}

            <button onClick={handleEntry} disabled={!entryIngr || !entryUnits || saving}
              style={{
                width:"100%",padding:"12px 0",borderRadius:9,border:"none",fontSize:13,fontWeight:700,cursor:"pointer",
                background:entryIngr&&entryUnits?"linear-gradient(135deg,#22c55e,#16a34a)":"#333",
                color:entryIngr&&entryUnits?"#fff":"#666",
              }}>{saving?"Guardando...":"Registrar Entrada"}</button>
          </div>
        </div>
      )}

      {/* ── WASTE TAB ── */}
      {tab === "waste" && (
        <div style={{ flex:1, overflow:"auto", padding:16 }}>
          <div style={{maxWidth:500}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:16}}>🗑️ Registrar Merma</div>
            <div style={{marginBottom:12}}>
              <label style={{fontSize:10,color:"#888",display:"block",marginBottom:4}}>Ingrediente *</label>
              <select value={wasteIngr} onChange={e=>setWasteIngr(e.target.value)} style={S.input}>
                <option value="">Seleccionar...</option>
                {ingredients.filter(i=>Number(i.stock_qty||0)>0).map(i=>(
                  <option key={i.id} value={i.id}>{i.name} — Stock: {Number(i.stock_qty).toFixed(1)} {i.unit}</option>
                ))}
              </select>
            </div>
            <div style={{display:"flex",gap:10,marginBottom:12}}>
              <div style={{flex:1}}>
                <label style={{fontSize:10,color:"#888",display:"block",marginBottom:4}}>Cantidad perdida *</label>
                <input type="number" value={wasteQty} onChange={e=>setWasteQty(e.target.value)}
                  placeholder={`En ${ingredients.find(i=>i.id===wasteIngr)?.unit||"unidades"}`} style={S.input} />
              </div>
              <div style={{flex:2}}>
                <label style={{fontSize:10,color:"#888",display:"block",marginBottom:4}}>Razón</label>
                <input type="text" value={wasteReason} onChange={e=>setWasteReason(e.target.value)}
                  placeholder="Ej: Leche caducada, derrame, etc." style={S.input} />
              </div>
            </div>
            <button onClick={handleWaste} disabled={!wasteIngr || !wasteQty || saving}
              style={{
                width:"100%",padding:"12px 0",borderRadius:9,border:"none",fontSize:13,fontWeight:700,cursor:"pointer",
                background:wasteIngr&&wasteQty?"linear-gradient(135deg,#ef4444,#dc2626)":"#333",
                color:wasteIngr&&wasteQty?"#fff":"#666",
              }}>{saving?"Guardando...":"Registrar Merma"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function CafeOSPOS() {
  const [page, setPage] = useState("pos"); // pos | inventory
  const [db, setDb] = useState(false);
  const [categories, setCategories] = useState(LC);
  const [products, setProducts] = useState(LP);
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]); // recipe_items for auto-deduction
  const [saving, setSaving] = useState(0);
  const [activeCat, setActiveCat] = useState("hot");
  const [cart, setCart] = useState([]);
  const [cust, setCust] = useState(null);
  const [selSize, setSelSize] = useState("16oz");
  const [selMilk, setSelMilk] = useState("regular");
  const [selExt, setSelExt] = useState([]);
  const [selBread, setSelBread] = useState("natural");
  const [selBExt, setSelBExt] = useState([]);
  const [showPay, setShowPay] = useState(false);
  const [payType, setPayType] = useState(null);
  const [cashIn, setCashIn] = useState("");
  const [usdIn, setUsdIn] = useState("");
  const [showRcpt, setShowRcpt] = useState(false);
  const [rcpt, setRcpt] = useState(null);
  const [search, setSearch] = useState("");
  const [sales, setSales] = useState({count:0,total:0});
  const [xrate, setXrate] = useState(17.50);
  const [showCfg, setShowCfg] = useState(false);
  const [cashier, setCashier] = useState("Cajero 1");
  const cRef = useRef(null);

  // ── Load from Supabase ──
  useEffect(()=>{
    (async()=>{
      try {
        const [dbC, dbP, dbI, dbR] = await Promise.all([
          api.get("categories",`select=*&store_id=eq.${STORE}&active=eq.true&order=display_order`),
          api.get("products",`select=*&store_id=eq.${STORE}&active=eq.true&order=display_order`),
          api.get("ingredients",`select=*&store_id=eq.${STORE}&active=eq.true&order=name`),
          api.get("recipe_items",`select=*,ingredients(name,unit,cost_per_unit)&product_id=not.is.null`),
        ]);
        if(dbC.length>0&&dbP.length>0){
          const bc=dbC.find(c=>c.name==="Bagels")?.id;
          setCategories(dbC.map(c=>({id:c.id,name:c.name,icon:CAT_META[c.name]?.icon||c.icon||"📦",color:CAT_META[c.name]?.color||c.color||"#f59e0b"})));
          setProducts(dbP.map(p=>({id:p.id,dbId:p.id,name:p.name,cat:p.category_id,p12:p.price_12oz?+p.price_12oz:null,p16:p.price_16oz?+p.price_16oz:null,p20:p.price_20oz?+p.price_20oz:null,unit:p.price_unit?+p.price_unit:null,milk:p.has_milk_option,bread:p.category_id===bc,sku:p.sku})));
          setActiveCat(dbC[0]?.id||"hot");
          setIngredients(dbI);
          setRecipes(dbR);
          setDb(true);
          const tjNow=new Date(new Date().toLocaleString('en-US',{timeZone:'America/Tijuana'}));
          const todayStart=new Date(tjNow.getFullYear(),tjNow.getMonth(),tjNow.getDate()).toISOString();
          try{const ts=await api.get("sales",`select=id,total&store_id=eq.${STORE}&status=eq.completed&created_at=gte.${todayStart}`);setSales({count:ts.length,total:ts.reduce((s,x)=>s+ +x.total,0)});}catch(e){}
        }
      } catch(e){ console.log("Offline mode:",e.message); }
    })();
  },[]);

  const filtered = products.filter(p=> search ? p.name.toLowerCase().includes(search.toLowerCase()) : p.cat===activeCat);
  const getP = useCallback((p,s)=> p.unit ? p.unit : s==="12oz"?p.p12:s==="16oz"?p.p16:p.p20,[]);
  const cTotal = cart.reduce((s,i)=>s+i.total,0);
  const cCount = cart.reduce((s,i)=>s+i.qty,0);
  const isBev = p=>!!(p.p12||p.milk);
  const isBag = p=>!!p.bread;

  const handleProd = p => {
    if(!isBev(p)&&!isBag(p)) push(p,null,null,[],null,[]);
    else { setCust(p);setSelSize("16oz");setSelMilk("regular");setSelExt([]);setSelBread("natural");setSelBExt([]); }
  };

  const push = (product,size,milk,dE,bread,bE) => {
    const base=getP(product,size);
    const mE=milk?(MILKS.find(m=>m.id===milk)?.extra||0):0;
    const d=(dE||[]).reduce((s,e)=>s+(DEXT.find(x=>x.id===e)?.extra||0),0);
    const b=(bE||[]).reduce((s,e)=>s+(BEXT.find(x=>x.id===e)?.extra||0),0);
    const up=base+mE+d+b;
    const ext=[...(dE||[]),...(bE||[])];
    const k=`${product.id}|${size}|${milk}|${bread}|${JSON.stringify(ext)}`;
    const idx=cart.findIndex(i=>`${i.product.id}|${i.size}|${i.milk}|${i.bread}|${JSON.stringify(i.extras)}`===k);
    if(idx>=0) setCart(p=>p.map((it,i)=>i===idx?{...it,qty:it.qty+1,total:(it.qty+1)*up}:it));
    else setCart(p=>[...p,{id:Date.now().toString(36)+Math.random().toString(36).slice(2,5),product,size,milk,bread,extras:ext,unitPrice:up,qty:1,total:up}]);
    setCust(null);
    setTimeout(()=>{cRef.current?.scrollTo(0,cRef.current.scrollHeight);},40);
  };

  const rmCart = id => setCart(p=>p.filter(i=>i.id!==id));
  const updQty = (id,d) => setCart(p=>p.map(i=>{if(i.id!==id)return i;const n=i.qty+d;return n<=0?null:{...i,qty:n,total:n*i.unitPrice};}).filter(Boolean));

  // ── Save sale ──
  // NOTA: El descuento de inventario lo maneja automáticamente el trigger
  // trg_sale_item_deduct_inventory en PostgreSQL. Al insertar sale_items,
  // el trigger descuenta ingredientes según recipe_items y registra
  // los movimientos en inventory_movements. No hay lógica de inventario aquí.
  const saveSale = async (r) => {
    if (!db) return;
    setSaving(c=>c+1);
    try {
      const [s] = await api.post("sales", {
        store_id:STORE,receipt_number:r.number,subtotal:r.total,total:r.total,discount:0,tax:0,
        payment_type:r.paymentType==="usd"?"cash":r.paymentType,
        cash_received:r.cashReceived||(r.usdReceived?r.usdReceived*r.exchangeRate:null),
        status:"completed",completed_at:new Date().toISOString(),local_id:r.number,
      });
      const items = r.items.map(it=>({
        sale_id:s.id,product_id:it.product.dbId||it.product.id,size:it.size||"unit",
        quantity:it.qty,unit_price:it.unitPrice,cost_estimate:0,
        modifiers:JSON.stringify([
          ...(it.extras||[]).map(e=>{const f=ALLEXT.find(x=>x.id===e);return f?{id:e,name:f.name,price_extra:f.extra}:null;}).filter(Boolean),
          it.milk&&it.milk!=="regular"?{id:it.milk,name:MILKS.find(m=>m.id===it.milk)?.name,type:"milk"}:null,
          it.bread?{id:it.bread,name:BREADS.find(b=>b.id===it.bread)?.name,type:"bread"}:null,
        ].filter(Boolean)),
      }));
      if(items.length>0) await api.post("sale_items",items);
      // Trigger PostgreSQL descuenta inventario automáticamente.
      // Refrescar ingredientes locales para reflejar los cambios del trigger.
      try {
        const fresh = await api.get("ingredients",`select=*&store_id=eq.${STORE}&active=eq.true&order=name`);
        setIngredients(fresh);
      } catch(e) { /* ok — se actualizará al cambiar a tab inventario */ }
    } catch(e){ console.error("Save error:",e); }
    setSaving(c=>c-1);
  };

  const completeSale = (type) => {
    const ts=new Date();
    let cashRcvd=null,change=null,usdRcvd=null,changeMxn=null;
    if(type==="cash"){cashRcvd=parseFloat(cashIn)||cTotal;change=cashRcvd-cTotal;}
    else if(type==="usd"){usdRcvd=parseFloat(usdIn)||0;changeMxn=(usdRcvd*xrate)-cTotal;}
    const r = {
      number:`${new Date(ts.toLocaleString('en-US',{timeZone:'America/Tijuana'})).toLocaleDateString('en-CA').replace(/-/g,"")}-${String(sales.count+1).padStart(4,"0")}`,
      items:cart.map(i=>({...i,
        milkLabel:i.milk&&i.milk!=="regular"?MILKS.find(m=>m.id===i.milk):null,
        breadLabel:i.bread?BREADS.find(b=>b.id===i.bread):null,
        extraNames:(i.extras||[]).map(e=>ALLEXT.find(x=>x.id===e)?.name).filter(Boolean),
      })),
      total:cTotal,paymentType:type,cashReceived:cashRcvd,change,
      usdReceived:usdRcvd,changeMxn,exchangeRate:type==="usd"?xrate:null,
      cashier,timestamp:ts,
    };
    setRcpt(r);setShowRcpt(true);setShowPay(false);
    setSales(p=>({count:p.count+1,total:p.total+cTotal}));
    setCart([]);setCashIn("");setUsdIn("");setPayType(null);
    saveSale(r);
  };

  const custPrice = () => {
    if(!cust)return 0;
    const base=getP(cust,selSize);
    const mE=cust.milk?(MILKS.find(m=>m.id===selMilk)?.extra||0):0;
    const dE=selExt.reduce((s,e)=>s+(DEXT.find(x=>x.id===e)?.extra||0),0);
    const bE=selBExt.reduce((s,e)=>s+(BEXT.find(x=>x.id===e)?.extra||0),0);
    return base+mE+dE+bE;
  };

  const now=new Date();
  const time=now.toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"});
  const date=now.toLocaleDateString("es-MX",{weekday:"short",day:"numeric",month:"short"});

  return (
    <div style={{height:"100vh",width:"100vw",display:"flex",flexDirection:"column",background:"#0f0f0f",color:"#fafafa",fontFamily:"'DM Sans',-apple-system,sans-serif",overflow:"hidden"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>

      {/* ══ HEADER ══ */}
      <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 14px",background:"#151515",borderBottom:"1px solid #262626",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:28,height:28,borderRadius:6,background:"linear-gradient(135deg,#f59e0b,#d97706)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:12,color:"#000"}}>C</div>
          <div>
            <div style={{fontSize:12,fontWeight:700,lineHeight:1.2}}>
              CaféOS
              <span style={{display:"inline-block",width:6,height:6,borderRadius:3,marginLeft:5,background:db?"#22c55e":"#ef4444",boxShadow:db?"0 0 6px #22c55e88":"0 0 6px #ef444488"}}/>
              {saving>0&&<span style={{fontSize:9,color:"#f59e0b",marginLeft:4}}>guardando...</span>}
            </div>
            <div style={{fontSize:9,color:"#555"}}>D'Volada Montesinos</div>
          </div>
          {/* NAV TABS */}
          <div style={{display:"flex",gap:2,marginLeft:12}}>
            {[{id:"pos",label:"POS",icon:"☕"},{id:"inventory",label:"Inventario",icon:"📦"}].map(t=>(
              <button key={t.id} onClick={()=>setPage(t.id)} style={{
                padding:"4px 12px",borderRadius:6,border:"none",cursor:"pointer",fontSize:11,fontWeight:page===t.id?700:400,
                background:page===t.id?"#f59e0b22":"transparent",color:page===t.id?"#f59e0b":"#666",
              }}>{t.icon} {t.label}</button>
            ))}
          </div>
        </div>

        <div style={{flex:1,maxWidth:220,margin:"0 10px"}}>
          {page==="pos"&&<input type="text" placeholder="🔍 Buscar..." value={search} onChange={e=>setSearch(e.target.value)}
            style={{width:"100%",padding:"5px 10px",borderRadius:7,border:"1px solid #333",background:"#1c1c1c",color:"#fafafa",fontSize:11,outline:"none"}}/>}
        </div>

        <div style={{display:"flex",alignItems:"center",gap:12,fontSize:10}}>
          <button onClick={()=>setShowCfg(true)} style={{padding:"3px 7px",borderRadius:5,border:"1px solid #333",background:"#1c1c1c",cursor:"pointer",fontSize:10,color:"#22c55e",fontFamily:mono}}>USD ${xrate.toFixed(2)}</button>
          <div style={{textAlign:"right"}}>
            <div style={{color:"#555"}}>{cashier} · {sales.count} ventas</div>
            <div style={{fontWeight:700,color:"#f59e0b",fontFamily:mono,fontSize:12}}>${sales.total.toLocaleString()}</div>
          </div>
          <div style={{textAlign:"right"}}><div style={{fontWeight:500,fontSize:11}}>{time}</div><div style={{color:"#555",fontSize:9}}>{date}</div></div>
        </div>
      </header>

      {/* ══ PAGE CONTENT ══ */}
      {page === "inventory" ? (
        <InventoryPage ingredients={ingredients} setIngredients={setIngredients} dbConnected={db} recipes={recipes} />
      ) : (
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        {/* LEFT: Products */}
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div style={{display:"flex",gap:2,padding:"5px 8px",overflowX:"auto",background:"#121212",borderBottom:"1px solid #1c1c1c",flexShrink:0}}>
            {categories.map(c=>{const a=activeCat===c.id&&!search;return(
              <button key={c.id} onClick={()=>{setActiveCat(c.id);setSearch("");}} style={{padding:"4px 10px",borderRadius:6,border:"none",cursor:"pointer",fontSize:10,fontWeight:600,whiteSpace:"nowrap",background:a?c.color+"22":"transparent",color:a?c.color:"#666"}}>{c.icon} {c.name}</button>
            );})}
          </div>
          <div style={{flex:1,overflow:"auto",padding:8,display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(115px,1fr))",gap:5,alignContent:"start"}}>
            {filtered.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center",padding:40,color:"#444",fontSize:12}}>Sin resultados</div>}
            {filtered.map(p=>{const cc=categories.find(c=>c.id===p.cat)?.color||"#f59e0b";return(
              <button key={p.id} onClick={()=>handleProd(p)} style={{padding:"10px 6px",borderRadius:8,border:"1px solid #262626",background:"#1a1a1a",cursor:"pointer",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,minHeight:64}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=cc+"55";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="#262626";}}>
                <div style={{fontSize:11,fontWeight:600,color:"#ddd",lineHeight:1.2}}>{p.name}</div>
                <div style={{fontSize:10,fontFamily:mono,color:cc,fontWeight:500}}>{p.unit?`$${p.unit}`:`$${p.p12}–${p.p20}`}</div>
              </button>
            );})}
          </div>
        </div>

        {/* RIGHT: Cart */}
        <div style={{width:300,display:"flex",flexDirection:"column",background:"#151515",borderLeft:"1px solid #262626",flexShrink:0}}>
          <div style={{padding:"8px 12px",borderBottom:"1px solid #262626",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{fontSize:13,fontWeight:700}}>Ticket {cCount>0&&<span style={{background:"#f59e0b",color:"#000",borderRadius:99,padding:"1px 6px",fontSize:9,fontWeight:700,marginLeft:4}}>{cCount}</span>}</div>
            {cart.length>0&&<button onClick={()=>setCart([])} style={{background:"none",border:"none",color:"#ef4444",fontSize:10,cursor:"pointer"}}>Limpiar</button>}
          </div>
          <div ref={cRef} style={{flex:1,overflow:"auto",padding:"5px 8px"}}>
            {cart.length===0?<div style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:"#383838"}}><div style={{fontSize:26,opacity:0.4}}>☕</div><div style={{fontSize:11,color:"#444",marginTop:5}}>Ticket vacío</div></div>
            :cart.map(it=>{
              const mL=it.milk&&it.milk!=="regular"?MILKS.find(m=>m.id===it.milk):null;
              const bL=it.bread?BREADS.find(b=>b.id===it.bread):null;
              const eN=(it.extras||[]).map(e=>ALLEXT.find(x=>x.id===e)?.name).filter(Boolean);
              return(<div key={it.id} style={{padding:"8px 10px",marginBottom:4,borderRadius:7,background:"#1c1c1c",border:"1px solid #262626"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"start"}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:600}}><span>{it.product.name}</span>{it.size&&<span style={{color:"#666",fontWeight:400,fontSize:10,marginLeft:4}}>{it.size}</span>}</div>
                    {(mL||bL||eN.length>0)&&<div style={{fontSize:9,color:"#888",marginTop:2}}>{bL&&<span>🍞 {bL.name}</span>}{mL&&<span>{bL?" · ":""}🥛 {mL.name}{mL.extra>0?` +$${mL.extra}`:""}</span>}{eN.length>0&&<span>{(mL||bL)?" · ":""}+ {eN.join(", ")}</span>}</div>}
                  </div>
                  <button onClick={()=>rmCart(it.id)} style={{background:"none",border:"none",color:"#444",fontSize:15,cursor:"pointer",lineHeight:1}}>×</button>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:5}}>
                  <div style={{display:"flex",alignItems:"center",gap:5}}><QBtn onClick={()=>updQty(it.id,-1)}>−</QBtn><span style={{fontSize:12,fontWeight:600,fontFamily:mono,minWidth:12,textAlign:"center"}}>{it.qty}</span><QBtn onClick={()=>updQty(it.id,1)}>+</QBtn></div>
                  <div style={{fontSize:13,fontWeight:700,fontFamily:mono,color:"#f59e0b"}}>${it.total}</div>
                </div>
              </div>);
            })}
          </div>
          {cart.length>0&&(
            <div style={{padding:"10px 12px",borderTop:"1px solid #262626"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:9,fontSize:16,fontWeight:700}}>
                <span>Total</span><span style={{fontFamily:mono,color:"#f59e0b"}}>${cTotal.toLocaleString()}</span>
              </div>
              <button onClick={()=>setShowPay(true)} style={{width:"100%",padding:"12px 0",borderRadius:9,border:"none",background:"linear-gradient(135deg,#f59e0b,#d97706)",color:"#000",fontSize:13,fontWeight:700,cursor:"pointer"}}>COBRAR ${cTotal.toLocaleString()}</button>
            </div>
          )}
        </div>
      </div>
      )}

      {/* ══ CUSTOMIZATION ══ */}
      {cust&&(<Overlay onClose={()=>setCust(null)}><div style={{background:"#1a1a1a",borderRadius:12,padding:20,width:360,border:"1px solid #333",maxHeight:"88vh",overflow:"auto"}}>
        <div style={{fontSize:16,fontWeight:700,marginBottom:2}}>{cust.name}</div>
        <div style={{fontSize:10,color:"#666",marginBottom:16}}>{categories.find(c=>c.id===cust.cat)?.icon} {categories.find(c=>c.id===cust.cat)?.name}</div>
        {isBev(cust)&&!cust.unit&&(<Sec title="Tamaño"><div style={{display:"flex",gap:7}}>{SIZES.map(sz=>{const pr=getP(cust,sz.id);const a=selSize===sz.id;return(<button key={sz.id} onClick={()=>setSelSize(sz.id)} style={{flex:1,padding:"9px 4px",borderRadius:9,cursor:"pointer",border:a?"2px solid #f59e0b":"1px solid #333",background:a?"#f59e0b0e":"#262626",textAlign:"center"}}><div style={{fontSize:14,fontWeight:700}}>{sz.id==="12oz"?"S":sz.id==="16oz"?"M":"L"}</div><div style={{fontSize:9,color:"#777"}}>{sz.sub}</div><div style={{fontSize:12,fontWeight:700,marginTop:2,fontFamily:mono,color:a?"#f59e0b":"#bbb"}}>${pr}</div></button>);})}</div></Sec>)}
        {cust.milk&&(<Sec title="Leche"><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:4}}>{MILKS.map(m=><Chip key={m.id} active={selMilk===m.id} label={m.name} sub={m.extra>0?`+$${m.extra}`:null} onClick={()=>setSelMilk(m.id)}/>)}</div></Sec>)}
        {isBev(cust)&&(<Sec title="Extras"><div style={{display:"flex",flexWrap:"wrap",gap:4}}>{DEXT.map(e=><Chip key={e.id} active={selExt.includes(e.id)} label={`${e.name} +$${e.extra}`} onClick={()=>setSelExt(p=>p.includes(e.id)?p.filter(x=>x!==e.id):[...p,e.id])}/>)}</div></Sec>)}
        {isBag(cust)&&(<Sec title="Tipo de pan"><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>{BREADS.map(b=><Chip key={b.id} active={selBread===b.id} label={b.name} flex onClick={()=>setSelBread(b.id)}/>)}</div></Sec>)}
        {isBag(cust)&&(<Sec title="Adicionales (+$15)"><div style={{display:"flex",gap:4}}>{BEXT.map(e=><Chip key={e.id} active={selBExt.includes(e.id)} label={e.name} sub={`+$${e.extra}`} flex onClick={()=>setSelBExt(p=>p.includes(e.id)?p.filter(x=>x!==e.id):[...p,e.id])}/>)}</div></Sec>)}
        <button onClick={()=>push(cust,isBev(cust)&&!cust.unit?selSize:null,cust.milk?selMilk:null,isBev(cust)?selExt:[],isBag(cust)?selBread:null,isBag(cust)?selBExt:[])} style={{width:"100%",padding:"12px 0",borderRadius:9,border:"none",background:"linear-gradient(135deg,#f59e0b,#d97706)",color:"#000",fontSize:13,fontWeight:700,cursor:"pointer",marginTop:2}}>Agregar — ${custPrice()}</button>
      </div></Overlay>)}

      {/* ══ PAYMENT ══ */}
      {showPay&&(<Overlay onClose={()=>{setShowPay(false);setPayType(null);}}><div style={{background:"#1a1a1a",borderRadius:12,padding:22,width:370,border:"1px solid #333"}}>
        <div style={{fontSize:12,fontWeight:600,color:"#777",marginBottom:5}}>Cobrar</div>
        <div style={{fontSize:28,fontWeight:700,fontFamily:mono,color:"#f59e0b",marginBottom:4}}>${cTotal.toLocaleString()} MXN</div>
        <div style={{fontSize:12,color:"#22c55e",fontFamily:mono,marginBottom:18}}>≈ USD ${(cTotal/xrate).toFixed(2)} <span style={{fontSize:9,color:"#555"}}>@ {xrate.toFixed(2)}</span></div>
        {!payType?(<div style={{display:"flex",gap:8}}>
          {[{t:"cash",i:"💵",l:"Efectivo MXN",c:"#22c55e"},{t:"usd",i:"🇺🇸",l:"Dólares USD",c:"#22c55e"},{t:"card",i:"💳",l:"Tarjeta",c:"#3b82f6"}].map(o=>(
            <button key={o.t} onClick={()=>o.t==="card"?completeSale("card"):setPayType(o.t)} style={{flex:1,padding:"14px 0",borderRadius:10,border:"1px solid #333",background:"#262626",cursor:"pointer",textAlign:"center"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=o.c;}} onMouseLeave={e=>{e.currentTarget.style.borderColor="#333";}}>
              <div style={{fontSize:18,marginBottom:2}}>{o.i}</div><div style={{fontSize:10,fontWeight:600,color:o.c}}>{o.l}</div>
            </button>))}
        </div>):payType==="cash"?(<div>
          <div style={{fontSize:10,color:"#777",marginBottom:5}}>Recibido MXN:</div>
          <input type="number" value={cashIn} onChange={e=>setCashIn(e.target.value)} placeholder={`$${cTotal}`} autoFocus style={{width:"100%",padding:"11px",borderRadius:9,border:"2px solid #f59e0b",background:"#262626",color:"#fafafa",fontSize:18,fontFamily:mono,outline:"none",marginBottom:8,textAlign:"center",boxSizing:"border-box"}}/>
          <div style={{display:"flex",gap:4,marginBottom:12}}>{[50,100,200,500].map(a=><button key={a} onClick={()=>setCashIn(String(a))} style={{flex:1,padding:"6px 0",borderRadius:6,border:"1px solid #333",background:"#262626",color:"#bbb",cursor:"pointer",fontSize:11,fontFamily:mono}}>${a}</button>)}<button onClick={()=>setCashIn(String(cTotal))} style={{flex:1,padding:"6px 0",borderRadius:6,border:"1px solid #f59e0b44",background:"#f59e0b11",color:"#f59e0b",cursor:"pointer",fontSize:10,fontWeight:600}}>Exacto</button></div>
          {cashIn&&parseFloat(cashIn)>=cTotal&&(<div style={{textAlign:"center",marginBottom:12,padding:8,background:"#22c55e0c",borderRadius:7,border:"1px solid #22c55e28"}}><div style={{fontSize:9,color:"#22c55e"}}>Cambio</div><div style={{fontSize:18,fontWeight:700,fontFamily:mono,color:"#22c55e"}}>${(parseFloat(cashIn)-cTotal).toFixed(2)} MXN</div></div>)}
          <button onClick={()=>completeSale("cash")} disabled={cashIn&&parseFloat(cashIn)<cTotal} style={{width:"100%",padding:"12px 0",borderRadius:9,border:"none",background:(!cashIn||parseFloat(cashIn)>=cTotal)?"linear-gradient(135deg,#22c55e,#16a34a)":"#333",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>Completar Venta 💵</button>
          <button onClick={()=>setPayType(null)} style={{width:"100%",padding:"8px 0",marginTop:5,border:"none",background:"none",color:"#555",cursor:"pointer",fontSize:10}}>← Cambiar</button>
        </div>):(<div>
          <div style={{fontSize:10,color:"#777",marginBottom:5}}>Recibido USD (TC: ${xrate.toFixed(2)}):</div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}><span style={{fontSize:16,color:"#22c55e"}}>US$</span><input type="number" value={usdIn} onChange={e=>setUsdIn(e.target.value)} placeholder={`${(cTotal/xrate).toFixed(2)}`} autoFocus style={{flex:1,padding:"11px",borderRadius:9,border:"2px solid #22c55e",background:"#262626",color:"#fafafa",fontSize:18,fontFamily:mono,outline:"none",textAlign:"center",boxSizing:"border-box"}}/></div>
          <div style={{display:"flex",gap:4,marginBottom:12}}>{[5,10,20,50].map(a=><button key={a} onClick={()=>setUsdIn(String(a))} style={{flex:1,padding:"6px 0",borderRadius:6,border:"1px solid #333",background:"#262626",color:"#bbb",cursor:"pointer",fontSize:11,fontFamily:mono}}>US${a}</button>)}<button onClick={()=>setUsdIn((cTotal/xrate).toFixed(2))} style={{flex:1,padding:"6px 0",borderRadius:6,border:"1px solid #22c55e44",background:"#22c55e11",color:"#22c55e",cursor:"pointer",fontSize:10,fontWeight:600}}>Exacto</button></div>
          {usdIn&&(parseFloat(usdIn)*xrate)>=cTotal&&(()=>{const mx=parseFloat(usdIn)*xrate,ch=mx-cTotal;return(<div style={{textAlign:"center",marginBottom:12,padding:8,background:"#22c55e0c",borderRadius:7,border:"1px solid #22c55e28"}}><div style={{fontSize:9,color:"#22c55e"}}>Equivale a</div><div style={{fontSize:13,fontFamily:mono,color:"#888",marginBottom:4}}>US${usdIn} × {xrate.toFixed(2)} = ${mx.toFixed(2)} MXN</div><div style={{fontSize:9,color:"#22c55e"}}>Cambio</div><div style={{fontSize:16,fontWeight:700,fontFamily:mono,color:"#22c55e"}}>${ch.toFixed(2)} MXN</div></div>);})()}
          <button onClick={()=>completeSale("usd")} disabled={!usdIn||(parseFloat(usdIn)*xrate)<cTotal} style={{width:"100%",padding:"12px 0",borderRadius:9,border:"none",background:(usdIn&&(parseFloat(usdIn)*xrate)>=cTotal)?"linear-gradient(135deg,#22c55e,#16a34a)":"#333",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>Completar Venta 🇺🇸</button>
          <button onClick={()=>setPayType(null)} style={{width:"100%",padding:"8px 0",marginTop:5,border:"none",background:"none",color:"#555",cursor:"pointer",fontSize:10}}>← Cambiar</button>
        </div>)}
      </div></Overlay>)}

      {/* ══ CONFIG ══ */}
      {showCfg&&(<Overlay onClose={()=>setShowCfg(false)}><div style={{background:"#1a1a1a",borderRadius:12,padding:22,width:300,border:"1px solid #333"}}>
        <div style={{fontSize:14,fontWeight:700,marginBottom:12}}>Configuración</div>
        <div style={{fontSize:10,color:"#777",marginBottom:6}}>Tipo de cambio (1 USD =)</div>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}><input type="number" step="0.01" value={xrate} onChange={e=>setXrate(parseFloat(e.target.value)||0)} style={{flex:1,padding:"10px",borderRadius:8,border:"2px solid #22c55e",background:"#262626",color:"#fafafa",fontSize:18,fontFamily:mono,outline:"none",textAlign:"center",boxSizing:"border-box"}}/><span style={{fontSize:13,color:"#888"}}>MXN</span></div>
        <div style={{display:"flex",gap:4,marginBottom:14}}>{[16.50,17.00,17.50,18.00].map(r=><button key={r} onClick={()=>setXrate(r)} style={{flex:1,padding:"6px 0",borderRadius:6,border:xrate===r?"1px solid #22c55e":"1px solid #333",background:xrate===r?"#22c55e11":"#262626",color:xrate===r?"#22c55e":"#bbb",cursor:"pointer",fontSize:11,fontFamily:mono}}>{r.toFixed(2)}</button>)}</div>
        <div style={{fontSize:10,color:"#777",marginBottom:8}}>Cajero activo:</div>
        <div style={{display:"flex",gap:4,marginBottom:14}}>{["Cajero 1","Cajero 2","Gerente"].map(c=><button key={c} onClick={()=>setCashier(c)} style={{flex:1,padding:"7px 0",borderRadius:6,border:cashier===c?"1px solid #f59e0b":"1px solid #333",background:cashier===c?"#f59e0b11":"#262626",color:cashier===c?"#f59e0b":"#bbb",cursor:"pointer",fontSize:10,fontWeight:600}}>{c}</button>)}</div>
        <div style={{fontSize:9,color:"#444",marginBottom:10}}>DB: {db?"🟢":"🔴"} · {products.length} productos · {ingredients.length} ingredientes · {recipes.length} recetas</div>
        <button onClick={()=>setShowCfg(false)} style={{width:"100%",padding:"10px 0",borderRadius:8,border:"none",background:"#262626",color:"#fafafa",fontSize:12,fontWeight:600,cursor:"pointer"}}>Listo</button>
      </div></Overlay>)}

      {/* ══ RECEIPT ══ */}
      {showRcpt&&rcpt&&(<Overlay onClose={()=>setShowRcpt(false)}><div style={{background:"#fff",borderRadius:12,width:340,maxHeight:"90vh",overflow:"auto",color:"#111",fontFamily:mono}}>
        <div style={{padding:"24px 20px 16px"}}>
          <div style={{textAlign:"center",marginBottom:14}}><div style={{fontSize:18,fontWeight:800,letterSpacing:"0.05em",fontFamily:"'DM Sans',sans-serif"}}>D'Volada</div><div style={{fontSize:9,color:"#666",marginTop:2,fontFamily:"'DM Sans'"}}>Café & Smoothies</div><div style={{fontSize:8,color:"#999",marginTop:6,lineHeight:1.5}}>D'Volada Montesinos<br/>Plaza Montesino L-10, Carr. Libre TJ-Ens #10951<br/>Tejamen, 22635 Tijuana, B.C.</div></div>
          <div style={{borderTop:"1px dashed #ccc",margin:"10px 0"}}/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#666",marginBottom:2}}><span>#{rcpt.number}</span><span>{rcpt.timestamp.toLocaleDateString("es-MX",{day:"2-digit",month:"2-digit",year:"numeric"})}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#666",marginBottom:8}}><span>{rcpt.cashier}</span><span>{rcpt.timestamp.toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}</span></div>
          <div style={{borderTop:"1px dashed #ccc",margin:"10px 0"}}/>
          {rcpt.items.map((it,i)=>(<div key={i} style={{marginBottom:6}}><div style={{display:"flex",justifyContent:"space-between",fontSize:10,fontWeight:600}}><span>{it.qty>1?`${it.qty}× `:""}{it.product.name}{it.size?` ${it.size}`:""}</span><span>${it.total.toFixed(2)}</span></div>
            {(it.breadLabel||it.milkLabel||it.extraNames?.length>0)&&<div style={{fontSize:8,color:"#888",paddingLeft:8,marginTop:1,lineHeight:1.4}}>{it.breadLabel&&<div>Pan: {it.breadLabel.name}</div>}{it.milkLabel&&<div>Leche: {it.milkLabel.name}{it.milkLabel.extra>0?` (+$${it.milkLabel.extra})`:""}</div>}{it.extraNames?.length>0&&<div>Extras: {it.extraNames.join(", ")}</div>}</div>}
            {it.qty>1&&<div style={{fontSize:8,color:"#999",paddingLeft:8}}>c/u ${it.unitPrice.toFixed(2)}</div>}
          </div>))}
          <div style={{borderTop:"1px dashed #ccc",margin:"10px 0"}}/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:13,fontWeight:800,marginTop:4}}><span>TOTAL</span><span>${rcpt.total.toFixed(2)} MXN</span></div>
          <div style={{borderTop:"1px dashed #ccc",margin:"10px 0"}}/>
          <div style={{fontSize:9,color:"#555"}}>
            {rcpt.paymentType==="cash"&&(<><div style={{display:"flex",justifyContent:"space-between"}}><span>💵 Efectivo MXN</span><span>${rcpt.cashReceived?.toFixed(2)}</span></div>{rcpt.change>0&&<div style={{display:"flex",justifyContent:"space-between",fontWeight:700,color:"#111",marginTop:2}}><span>Cambio</span><span>${rcpt.change.toFixed(2)}</span></div>}</>)}
            {rcpt.paymentType==="usd"&&(<><div style={{display:"flex",justifyContent:"space-between"}}><span>🇺🇸 USD</span><span>US${rcpt.usdReceived?.toFixed(2)}</span></div><div style={{fontSize:8,color:"#999",marginTop:1}}>TC: ${rcpt.exchangeRate?.toFixed(2)}</div>{rcpt.changeMxn>0.01&&<div style={{display:"flex",justifyContent:"space-between",fontWeight:700,color:"#111",marginTop:2}}><span>Cambio</span><span>${rcpt.changeMxn.toFixed(2)} MXN</span></div>}</>)}
            {rcpt.paymentType==="card"&&<div style={{display:"flex",justifyContent:"space-between"}}><span>💳 Tarjeta</span><span>${rcpt.total.toFixed(2)}</span></div>}
          </div>
          <div style={{borderTop:"1px dashed #ccc",margin:"10px 0"}}/>
          <div style={{textAlign:"center"}}><div style={{width:80,height:80,margin:"0 auto 6px",border:"2px dashed #ddd",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",color:"#ccc",fontSize:9}}><div><div style={{fontSize:20,marginBottom:2}}>📱</div>QR Loyalty</div></div><div style={{fontSize:7,color:"#bbb"}}>Próximamente</div></div>
          <div style={{borderTop:"1px dashed #ccc",margin:"10px 0"}}/>
          <div style={{textAlign:"center",fontSize:8,color:"#999",lineHeight:1.6}}>¡Gracias por tu preferencia!<br/>D'Volada Café & Smoothies<br/><span style={{fontSize:7}}>Powered by CaféOS</span></div>
        </div>
        <div style={{padding:"0 20px 20px"}}><button onClick={()=>setShowRcpt(false)} style={{width:"100%",padding:"11px 0",borderRadius:8,border:"none",background:"#111",color:"#fafafa",fontSize:12,fontWeight:600,cursor:"pointer"}}>Nueva Venta</button></div>
      </div></Overlay>)}
    </div>
  );
}
