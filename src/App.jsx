import { useState, useCallback, useRef, useEffect } from "react";

// ============================================================
// SUPABASE
// ============================================================
const SB_URL = "https://lkpsfhqqaropogaepuyy.supabase.co";
const SB_KEY = "sb_publishable_R5_AMdm-4XKw4yf3P5sVRg_tUCNWuAu";
const STORE = "a0000000-0000-0000-0000-000000000001";
const H = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" };
const api = {
  async get(t,q=""){const r=await fetch(`${SB_URL}/rest/v1/${t}?${q}`,{headers:H});if(!r.ok)throw new Error(await r.text());return r.json();},
  async post(t,d){const r=await fetch(`${SB_URL}/rest/v1/${t}`,{method:"POST",headers:H,body:JSON.stringify(d)});if(!r.ok)throw new Error(await r.text());return r.json();},
  async patch(t,m,d){const r=await fetch(`${SB_URL}/rest/v1/${t}?${m}`,{method:"PATCH",headers:H,body:JSON.stringify(d)});if(!r.ok)throw new Error(await r.text());return r.json();},
};

// ============================================================
// CONSTANTS & HELPERS
// ============================================================
const TZ = 'America/Tijuana';
const tjNow = () => new Date(new Date().toLocaleString('en-US',{timeZone:TZ}));
const tjDate = () => tjNow().toLocaleDateString('en-CA');
const mono = "'JetBrains Mono',monospace";

const CAT_META = {
  "Especialidades Calientes":{icon:"☕",color:"#d97706"},"Frappé / Rocas":{icon:"🧊",color:"#3b82f6"},
  "Tradiciones":{icon:"🫘",color:"#92400e"},"Smoothies":{icon:"🍓",color:"#16a34a"},
  "Té / Tisana":{icon:"🍵",color:"#7c3aed"},"Jugos":{icon:"🍊",color:"#ea580c"},
  "Bagels":{icon:"🥯",color:"#ca8a04"},"Ensaladas":{icon:"🥗",color:"#059669"},
  "Wraps":{icon:"🌯",color:"#65a30d"},"Repostería":{icon:"🍰",color:"#db2777"},
  "Galletas":{icon:"🍪",color:"#c2410c"},"Complementos":{icon:"➕",color:"#64748b"},
  "Espresso":{icon:"⚡",color:"#1e293b"},"Iced Coffee":{icon:"🥤",color:"#06b6d4"},
  "Malteadas":{icon:"🥛",color:"#c084fc"},"Pasteles":{icon:"🎂",color:"#be185d"},
  "Soda Italiana":{icon:"🍹",color:"#ef4444"},
};

// Local fallback products (used when Supabase unavailable)
const LC=[{id:"hot",name:"Calientes",icon:"☕",color:"#d97706"},{id:"frappe",name:"Frappé",icon:"🧊",color:"#3b82f6"},{id:"tradiciones",name:"Tradiciones",icon:"🫘",color:"#92400e"},{id:"smoothies",name:"Smoothies",icon:"🍓",color:"#16a34a"},{id:"tea",name:"Té",icon:"🍵",color:"#7c3aed"},{id:"jugos",name:"Jugos",icon:"🍊",color:"#ea580c"},{id:"bagels",name:"Bagels",icon:"🥯",color:"#ca8a04"},{id:"ensaladas",name:"Ensaladas",icon:"🥗",color:"#059669"},{id:"wraps",name:"Wraps",icon:"🌯",color:"#65a30d"},{id:"reposteria",name:"Repostería",icon:"🍰",color:"#db2777"},{id:"galletas",name:"Galletas",icon:"🍪",color:"#c2410c"},{id:"complementos",name:"Extras",icon:"➕",color:"#64748b"}];
const LP=[{id:"cap",name:"Cappuccino",cat:"hot",p12:78,p16:83,p20:88,milk:true},{id:"lat",name:"Café Latte",cat:"hot",p12:75,p16:80,p20:85,milk:true},{id:"car",name:"Caramelo",cat:"hot",p12:85,p16:90,p20:95,milk:true},{id:"caj",name:"Cajeta",cat:"hot",p12:85,p16:90,p20:95,milk:true},{id:"moc",name:"Mocha",cat:"hot",p12:85,p16:90,p20:95,milk:true},{id:"mxm",name:"Mexican Mocha",cat:"hot",p12:85,p16:90,p20:95,milk:true},{id:"ore",name:"Oreo",cat:"hot",p12:88,p16:93,p20:98,milk:true},{id:"bro",name:"Brownie",cat:"hot",p12:88,p16:93,p20:98,milk:true},{id:"cha",name:"Chai Té",cat:"hot",p12:85,p16:90,p20:95,milk:true},{id:"ame",name:"Americano",cat:"hot",p12:55,p16:60,p20:65,milk:false},{id:"cho",name:"Chocolate",cat:"hot",p12:75,p16:78,p20:82,milk:true},{id:"esp",name:"Espresso",cat:"hot",p12:45,p16:50,p20:55,milk:false},{id:"f_lat",name:"Latte",cat:"frappe",p12:78,p16:83,p20:88,milk:true},{id:"f_moc",name:"Mocha",cat:"frappe",p12:85,p16:90,p20:95,milk:true},{id:"f_car",name:"Caramelo",cat:"frappe",p12:85,p16:90,p20:95,milk:true},{id:"f_caj",name:"Cajeta",cat:"frappe",p12:88,p16:93,p20:98,milk:true},{id:"f_ore",name:"Oreo",cat:"frappe",p12:88,p16:93,p20:98,milk:true},{id:"f_bro",name:"Brownie",cat:"frappe",p12:88,p16:93,p20:98,milk:true},{id:"f_cha",name:"Chai",cat:"frappe",p12:85,p16:90,p20:95,milk:true},{id:"f_cho",name:"Chocolate",cat:"frappe",p12:74,p16:78,p20:83,milk:true},{id:"f_ice",name:"Iced Coffee",cat:"frappe",p12:60,p16:63,p20:65,milk:false},{id:"f_sod",name:"Soda Italiana",cat:"frappe",unit:60},{id:"alt",name:"Altura",cat:"tradiciones",p12:43,p16:47,p20:50,milk:false},{id:"org",name:"Orgánico",cat:"tradiciones",p12:43,p16:47,p20:50,milk:false},{id:"dec",name:"Descaf",cat:"tradiciones",p12:43,p16:47,p20:50,milk:false},{id:"s1",name:"Locura D'Fresa",cat:"smoothies",unit:90},{id:"s2",name:"Pellizco Cítrico",cat:"smoothies",unit:90},{id:"s3",name:"Placer D'Durazno",cat:"smoothies",unit:90},{id:"s4",name:"Naranja Coqueta",cat:"smoothies",unit:90},{id:"s5",name:"Ola Tropical",cat:"smoothies",unit:90},{id:"s6",name:"Oasis D'Frutas",cat:"smoothies",unit:90},{id:"s7",name:"Pasión Caribeña",cat:"smoothies",unit:90},{id:"s8",name:"Mango D'Volada",cat:"smoothies",unit:90},{id:"s9",name:"Aloha",cat:"smoothies",unit:90},{id:"t1",name:"Fresas-Kiwi",cat:"tea",unit:80},{id:"t2",name:"Blend 1776",cat:"tea",unit:80},{id:"t3",name:"Manzanilla",cat:"tea",unit:80},{id:"t4",name:"Hierbabuena",cat:"tea",unit:80},{id:"t5",name:"Frutas Pasión",cat:"tea",unit:80},{id:"t6",name:"Limón Tropical",cat:"tea",unit:80},{id:"t7",name:"Tutti-Frutti",cat:"tea",unit:80},{id:"t8",name:"Zarzamora",cat:"tea",unit:80},{id:"t9",name:"Mezcla Relajante",cat:"tea",unit:80},{id:"t10",name:"Jazmín",cat:"tea",unit:80},{id:"t11",name:"Blue Eyes",cat:"tea",unit:80},{id:"t12",name:"Earl Grey",cat:"tea",unit:80},{id:"j1",name:"Jugo Verde",cat:"jugos",unit:75},{id:"j2",name:"Jugo de Naranja",cat:"jugos",unit:75},{id:"j3",name:"Jugo Betabel",cat:"jugos",unit:75},{id:"b1",name:"D'Sándwich",cat:"bagels",unit:85,bread:true},{id:"b2",name:"D'Pollo",cat:"bagels",unit:95,bread:true},{id:"b3",name:"D'Sayuno",cat:"bagels",unit:85,bread:true},{id:"b4",name:"D'Clásico",cat:"bagels",unit:65,bread:true},{id:"b5",name:"D'Nutella",cat:"bagels",unit:65,bread:true},{id:"b6",name:"D'Clásico +",cat:"bagels",unit:70,bread:true},{id:"b7",name:"D'Fresa",cat:"bagels",unit:65,bread:true},{id:"b8",name:"D'Atún",cat:"bagels",unit:95,bread:true},{id:"e1",name:"Ensalada Pollo",cat:"ensaladas",unit:145},{id:"e2",name:"Ensalada Atún",cat:"ensaladas",unit:145},{id:"e3",name:"Ensalada César",cat:"ensaladas",unit:145},{id:"w1",name:"Wrap Pollo",cat:"wraps",unit:145},{id:"w2",name:"Wrap Atún",cat:"wraps",unit:145},{id:"w3",name:"Wrap Americano",cat:"wraps",unit:145},{id:"w4",name:"Wrap César",cat:"wraps",unit:145},{id:"r1",name:"Brownie",cat:"reposteria",unit:40},{id:"r2",name:"Brownie Queso",cat:"reposteria",unit:40},{id:"r3",name:"Coyota",cat:"reposteria",unit:40},{id:"r4",name:"Empanada Cajeta",cat:"reposteria",unit:40},{id:"r5",name:"Muffin Chocolate",cat:"reposteria",unit:40},{id:"r6",name:"Muffin Moras",cat:"reposteria",unit:40},{id:"r7",name:"Pastel Zanahoria",cat:"reposteria",unit:65},{id:"r8",name:"Pastel Chocolate",cat:"reposteria",unit:65},{id:"r9",name:"Madelines",cat:"reposteria",unit:20},{id:"r10",name:"Orejitas",cat:"reposteria",unit:20},{id:"r11",name:"Mixtas",cat:"reposteria",unit:19},{id:"r12",name:"Mini Brownie",cat:"reposteria",unit:20},{id:"r13",name:"Galleta Rellena",cat:"reposteria",unit:40},{id:"g1",name:"Ajonjolí",cat:"galletas",unit:40},{id:"g2",name:"Avena",cat:"galletas",unit:40},{id:"g3",name:"Granola Miel",cat:"galletas",unit:40},{id:"g4",name:"Nuez",cat:"galletas",unit:40},{id:"g5",name:"Dátil",cat:"galletas",unit:40},{id:"g6",name:"Avena Naranja",cat:"galletas",unit:40},{id:"g7",name:"4 Galletas",cat:"galletas",unit:49},{id:"g8",name:"Linaza-Cajeta",cat:"galletas",unit:35},{id:"g9",name:"Barra Granola",cat:"galletas",unit:20},{id:"x1",name:"Avena",cat:"complementos",unit:75},{id:"x2",name:"Licuado Plátano",cat:"complementos",unit:68},{id:"x3",name:"Botella Agua",cat:"complementos",unit:35},{id:"x4",name:"Malteada Vainilla",cat:"complementos",unit:98},{id:"x5",name:"Malteada Oreo",cat:"complementos",unit:98},{id:"x6",name:"Malteada Cappu",cat:"complementos",unit:98}];

// Modifiers
const SIZES=[{id:"12oz",label:"12oz",sub:"Chico"},{id:"16oz",label:"16oz",sub:"Mediano"},{id:"20oz",label:"20oz",sub:"Grande"}];
const MILKS=[{id:"regular",name:"Regular",extra:0},{id:"light",name:"Light",extra:0},{id:"deslac",name:"Deslactosada",extra:0},{id:"almendra",name:"Almendras",extra:20},{id:"soya",name:"Soya",extra:20},{id:"coco",name:"Coco",extra:20}];
const DEXT=[{id:"shot",name:"Shot Extra",extra:15},{id:"jarabe",name:"Jarabe Extra",extra:15},{id:"mocha",name:"Mocha",extra:15},{id:"miel",name:"Miel",extra:15}];
const BREADS=[{id:"natural",name:"Natural",extra:0},{id:"parmesano",name:"Parmesano",extra:0},{id:"ajonjoli",name:"Ajonjolí",extra:0},{id:"12granos",name:"12 Granos",extra:0}];
const BEXT=[{id:"jamon",name:"Jamón",extra:15},{id:"aguacate",name:"Aguacate",extra:15}];
const ALLEXT=[...DEXT,...BEXT];

// ============================================================
// UI COMPONENTS
// ============================================================
const Overlay=({children,onClose})=>(<div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(3px)"}}><div onClick={e=>e.stopPropagation()}>{children}</div></div>);
const Sec=({title,children})=>(<div style={{marginBottom:16}}><div style={{fontSize:10,fontWeight:700,color:"#777",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.08em"}}>{title}</div>{children}</div>);
const Chip=({active,label,sub,onClick,flex})=>(<button onClick={onClick} style={{padding:"6px 11px",borderRadius:7,cursor:"pointer",border:active?"2px solid #f59e0b":"1px solid #333",background:active?"#f59e0b11":"#262626",fontSize:11,color:active?"#f59e0b":"#ccc",fontWeight:active?600:400,textAlign:"center",flex:flex?1:undefined,minWidth:0}}>{label}{sub&&<div style={{fontSize:9,color:"#555",marginTop:1}}>{sub}</div>}</button>);
const QBtn=({children,onClick})=>(<button onClick={onClick} style={{width:22,height:22,borderRadius:5,border:"1px solid #333",background:"#262626",color:"#fff",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>{children}</button>);

// ============================================================
// PIN LOGIN SCREEN
// ============================================================
function PinScreen({ onLogin, db }) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDigit = (d) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setErr("");
    if (next.length === 4) tryLogin(next);
  };

  const tryLogin = async (code) => {
    setLoading(true);
    try {
      if (!db) { setErr("Sin conexión a base de datos"); setPin(""); setLoading(false); return; }
      const users = await api.get("cashiers", `select=*&store_id=eq.${STORE}&pin=eq.${code}&active=eq.true`);
      if (users.length === 0) { setErr("PIN incorrecto"); setPin(""); }
      else onLogin(users[0]);
    } catch (e) { setErr("Error de conexión"); setPin(""); }
    setLoading(false);
  };

  const dots = [0,1,2,3].map(i => (
    <div key={i} style={{width:16,height:16,borderRadius:8,background:i<pin.length?"#f59e0b":"#333",transition:"all 0.15s",border:"1px solid #444"}}/>
  ));

  const numpad = [["1","2","3"],["4","5","6"],["7","8","9"],["","0","⌫"]];

  return (
    <div style={{height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#0f0f0f",color:"#fafafa",fontFamily:"'DM Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
      <div style={{width:28,height:28,borderRadius:6,background:"linear-gradient(135deg,#f59e0b,#d97706)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:12,color:"#000",marginBottom:8}}>C</div>
      <div style={{fontSize:16,fontWeight:700,marginBottom:4}}>CaféOS</div>
      <div style={{fontSize:10,color:"#555",marginBottom:28}}>D'Volada Montesinos</div>
      <div style={{fontSize:12,color:"#888",marginBottom:16}}>Ingresa tu PIN</div>
      <div style={{display:"flex",gap:12,marginBottom:20}}>{dots}</div>
      {err && <div style={{fontSize:11,color:"#ef4444",marginBottom:12,fontWeight:600}}>{err}</div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,72px)",gap:8}}>
        {numpad.flat().map((k,i) => k==="" ? <div key={i}/> : (
          <button key={i} onClick={() => k==="⌫" ? setPin(p=>p.slice(0,-1)) : handleDigit(k)}
            disabled={loading}
            style={{height:56,borderRadius:12,border:"1px solid #333",background:"#1a1a1a",color:"#fafafa",fontSize:k==="⌫"?18:22,fontWeight:600,cursor:"pointer",fontFamily:mono,transition:"all 0.1s"}}
            onMouseDown={e=>{e.currentTarget.style.background="#f59e0b22";}}
            onMouseUp={e=>{e.currentTarget.style.background="#1a1a1a";}}
          >{k}</button>
        ))}
      </div>
      <div style={{fontSize:9,color:"#333",marginTop:24}}>{tjNow().toLocaleDateString("es-MX",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
    </div>
  );
}

// ============================================================
// SHIFT OPEN SCREEN
// ============================================================
function ShiftOpenScreen({ cashier, onOpen, onLogout }) {
  const [fundMxn, setFundMxn] = useState("");
  const [fundUsd, setFundUsd] = useState("");
  const [rate, setRate] = useState(() => parseFloat(localStorage.getItem("cafeos_xrate")) || 17.50);
  const [loading, setLoading] = useState(false);
  const [existingShift, setExistingShift] = useState(null);
  const [checking, setChecking] = useState(true);

  // Check for existing open shift
  useEffect(() => {
    (async () => {
      try {
        const open = await api.get("shifts", `select=*&store_id=eq.${STORE}&cashier_id=eq.${cashier.id}&status=eq.open&limit=1`);
        if (open.length > 0) setExistingShift(open[0]);
      } catch(e) {}
      setChecking(false);
    })();
  }, [cashier.id]);

  const handleOpen = async () => {
    setLoading(true);
    try {
      localStorage.setItem("cafeos_xrate", rate.toString());
      const [shift] = await api.post("shifts", {
        store_id: STORE, cashier_id: cashier.id,
        opening_fund_mxn: parseFloat(fundMxn) || 0,
        opening_fund_usd: parseFloat(fundUsd) || 0,
        exchange_rate: rate,
      });
      onOpen(shift, rate);
    } catch(e) { alert("Error al abrir turno: " + e.message); }
    setLoading(false);
  };

  if (checking) return <div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#0f0f0f",color:"#555"}}>Verificando turno...</div>;

  // Resume existing open shift
  if (existingShift) {
    return (
      <div style={{height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#0f0f0f",color:"#fafafa",fontFamily:"'DM Sans',sans-serif",gap:16}}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
        <div style={{fontSize:14,fontWeight:700}}>Turno abierto encontrado</div>
        <div style={{fontSize:11,color:"#888"}}>
          Abierto: {new Date(existingShift.opened_at).toLocaleString("es-MX",{timeZone:TZ})}
        </div>
        <div style={{fontSize:11,color:"#888"}}>
          Fondo: ${Number(existingShift.opening_fund_mxn).toFixed(2)} MXN / US${Number(existingShift.opening_fund_usd).toFixed(2)}
        </div>
        <button onClick={() => onOpen(existingShift, existingShift.exchange_rate)}
          style={{padding:"14px 40px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#f59e0b,#d97706)",color:"#000",fontSize:14,fontWeight:700,cursor:"pointer",marginTop:8}}>
          Continuar turno
        </button>
        <button onClick={onLogout} style={{background:"none",border:"none",color:"#555",cursor:"pointer",fontSize:11,marginTop:8}}>Cambiar usuario</button>
      </div>
    );
  }

  const S={input:{width:"100%",padding:"12px",borderRadius:9,border:"2px solid #333",background:"#1a1a1a",color:"#fafafa",fontSize:18,fontFamily:mono,outline:"none",textAlign:"center",boxSizing:"border-box"}};

  return (
    <div style={{height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#0f0f0f",color:"#fafafa",fontFamily:"'DM Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
      <div style={{width:320}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:14,fontWeight:700}}>Abrir Turno</div>
          <div style={{fontSize:11,color:"#888",marginTop:4}}>
            {cashier.name} ({cashier.role}) · {tjNow().toLocaleDateString("es-MX",{weekday:"short",day:"numeric",month:"short"})}
          </div>
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:10,color:"#888",marginBottom:6}}>Fondo inicial MXN</div>
          <input type="number" value={fundMxn} onChange={e=>setFundMxn(e.target.value)} placeholder="$0.00" style={S.input}/>
          <div style={{display:"flex",gap:4,marginTop:6}}>{[500,1000,1500,2000].map(v=><button key={v} onClick={()=>setFundMxn(String(v))} style={{flex:1,padding:"6px 0",borderRadius:6,border:"1px solid #333",background:"#262626",color:"#bbb",cursor:"pointer",fontSize:11,fontFamily:mono}}>${v}</button>)}</div>
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:10,color:"#888",marginBottom:6}}>Fondo inicial USD</div>
          <input type="number" value={fundUsd} onChange={e=>setFundUsd(e.target.value)} placeholder="US$0.00" style={{...S.input,borderColor:"#22c55e55"}}/>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:10,color:"#888",marginBottom:6}}>Tipo de cambio (1 USD =)</div>
          <input type="number" step="0.01" value={rate} onChange={e=>setRate(parseFloat(e.target.value)||0)} style={{...S.input,borderColor:"#22c55e"}}/>
          <div style={{display:"flex",gap:4,marginTop:6}}>{[16.50,17.00,17.50,18.00].map(r=><button key={r} onClick={()=>setRate(r)} style={{flex:1,padding:"6px 0",borderRadius:6,border:rate===r?"1px solid #22c55e":"1px solid #333",background:rate===r?"#22c55e11":"#262626",color:rate===r?"#22c55e":"#bbb",cursor:"pointer",fontSize:11,fontFamily:mono}}>{r.toFixed(2)}</button>)}</div>
        </div>
        <button onClick={handleOpen} disabled={loading}
          style={{width:"100%",padding:"14px 0",borderRadius:10,border:"none",background:"linear-gradient(135deg,#f59e0b,#d97706)",color:"#000",fontSize:14,fontWeight:700,cursor:"pointer"}}>
          {loading?"Abriendo...":"Abrir Turno"}
        </button>
        <button onClick={onLogout} style={{width:"100%",padding:"10px 0",marginTop:8,border:"none",background:"none",color:"#555",cursor:"pointer",fontSize:11}}>← Cambiar usuario</button>
      </div>
    </div>
  );
}

// ============================================================
// SHIFT CLOSE MODAL
// ============================================================
function ShiftCloseModal({ shift, xrate, onClose, onConfirm }) {
  const [cMxn, setCMxn] = useState("");
  const [cUsd, setCUsd] = useState("");
  const [cCard, setCCard] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [shiftData, setShiftData] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [closeResult, setCloseResult] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const sales = await api.get("sales",`select=total,payment_type,usd_received,change_given_mxn,change_given_usd&shift_id=eq.${shift.id}`);
        const expenses = await api.get("shift_expenses",`select=amount&shift_id=eq.${shift.id}`);
        const cashMxnSales = sales.filter(s=>s.payment_type==="cash").reduce((s,x)=>s+ +x.total,0);
        const cashMxnChange = sales.filter(s=>s.payment_type==="cash").reduce((s,x)=>s+ +(x.change_given_mxn||0),0);
        const usdSales = sales.filter(s=>s.payment_type==="usd");
        const usdSalesTotal = usdSales.reduce((s,x)=>s+ +x.total,0);
        const usdReceived = usdSales.reduce((s,x)=>s+ +(x.usd_received||0),0);
        const usdChangeGivenMxn = usdSales.reduce((s,x)=>s+ +(x.change_given_mxn||0),0);
        const usdChangeGivenUsd = usdSales.reduce((s,x)=>s+ +(x.change_given_usd||0),0);
        const cardTotal = sales.filter(s=>s.payment_type==="card").reduce((s,x)=>s+ +x.total,0);
        const expTotal = expenses.reduce((s,x)=>s+ +x.amount,0);
        setShiftData({
          salesCount: sales.length,
          cashMxnReceived: cashMxnSales, cashMxnChange,
          usdSalesTotal, usdReceived, usdChangeGivenMxn, usdChangeGivenUsd,
          cardTotal, expTotal,
          salesTotal: sales.reduce((s,x)=>s+ +x.total,0),
        });
      } catch(e) { console.error(e); }
    })();
  }, [shift.id]);

  if (!shiftData) return <Overlay onClose={onClose}><div style={{background:"#1a1a1a",borderRadius:12,padding:24,width:380,border:"1px solid #333",color:"#fafafa",textAlign:"center"}}>Calculando turno...</div></Overlay>;

  const expectedMxn = Number(shift.opening_fund_mxn) + shiftData.cashMxnReceived - shiftData.cashMxnChange - shiftData.usdChangeGivenMxn - shiftData.expTotal;
  const expectedUsd = Number(shift.opening_fund_usd) + shiftData.usdReceived - shiftData.usdChangeGivenUsd;
  const expectedCard = shiftData.cardTotal;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const countedMxn = parseFloat(cMxn) || 0;
      const countedUsd = parseFloat(cUsd) || 0;
      const countedCard = parseFloat(cCard) || 0;
      const diffMxn = countedMxn - expectedMxn;
      const diffUsd = countedUsd - expectedUsd;
      const diffCard = countedCard - expectedCard;
      const diffTotalMxn = diffMxn + (diffUsd * xrate) + diffCard;
      await api.patch("shifts", `id=eq.${shift.id}`, {
        closed_at: new Date().toISOString(), status: "closed",
        system_sales_cash_mxn: shiftData.cashMxnReceived, system_sales_cash_usd: shiftData.usdReceived,
        system_sales_card: shiftData.cardTotal, system_sales_total: shiftData.salesTotal,
        system_sales_count: shiftData.salesCount, system_expenses: shiftData.expTotal,
        counted_cash_mxn: countedMxn, counted_cash_usd: countedUsd, counted_card: countedCard,
        diff_cash_mxn: diffMxn, diff_cash_usd: diffUsd, diff_card: diffCard,
        diff_total_mxn: diffTotalMxn, close_notes: notes || null,
      });
      setCloseResult({ countedMxn, countedUsd, countedCard, diffMxn, diffUsd, diffCard, diffTotalMxn });
    } catch(e) { alert("Error al cerrar turno: " + e.message); }
    setLoading(false);
  };

  const S={input:{width:"100%",padding:"10px",borderRadius:8,border:"1px solid #333",background:"#1e1e1e",color:"#fafafa",fontSize:16,fontFamily:mono,outline:"none",textAlign:"center",boxSizing:"border-box"}};
  const Row=({l,v,c,b})=>(<div style={{display:"flex",justifyContent:"space-between",marginBottom:3,fontWeight:b?700:400}}><span style={{color:c?"inherit":"#888"}}>{l}</span><span style={{fontFamily:mono,color:c||"#fafafa"}}>{v}</span></div>);

  // POST-CLOSE SUMMARY
  if (closeResult) {
    const diffTotal = closeResult.diffTotalMxn;
    const diffColor = Math.abs(diffTotal) < 0.01 ? "#22c55e" : diffTotal > 0 ? "#f59e0b" : "#ef4444";
    const diffLabel = Math.abs(diffTotal) < 0.01 ? "CUADRA" : diffTotal > 0 ? "SOBRANTE" : "FALTANTE";
    return (
      <Overlay onClose={()=>{}}>
        <div style={{background:"#1a1a1a",borderRadius:12,padding:24,width:420,border:"1px solid #333",color:"#fafafa",maxHeight:"90vh",overflow:"auto"}}>
          <div style={{textAlign:"center",marginBottom:16}}>
            <div style={{fontSize:22,fontWeight:800,marginBottom:2}}>Turno Cerrado</div>
            <div style={{fontSize:10,color:"#888"}}>{new Date(shift.opened_at).toLocaleDateString("es-MX",{timeZone:TZ,weekday:"short",day:"numeric",month:"short"})} · {new Date(shift.opened_at).toLocaleTimeString("es-MX",{timeZone:TZ,hour:"2-digit",minute:"2-digit"})} — {new Date().toLocaleTimeString("es-MX",{timeZone:TZ,hour:"2-digit",minute:"2-digit"})}</div>
          </div>
          <div style={{padding:16,borderRadius:10,background:"#111",border:"1px solid #333",marginBottom:16}}>
            <Row l="Total ventas:" v={`$${shiftData.salesTotal.toFixed(2)}`} b/>
            <div style={{borderTop:"1px solid #262626",margin:"8px 0"}}/>
            <Row l="Tarjeta:" v={`$${shiftData.cardTotal.toFixed(2)}`}/>
            <Row l={`Dólares: US$${shiftData.usdReceived.toFixed(2)}`} v={`≈$${(shiftData.usdReceived*xrate).toFixed(2)} MXN`}/>
            <Row l="Efectivo MXN:" v={`$${shiftData.cashMxnReceived.toFixed(2)}`}/>
            {shiftData.expTotal>0&&<Row l="Gastos:" v={`-$${shiftData.expTotal.toFixed(2)}`} c="#ef4444"/>}
            <div style={{borderTop:"1px solid #262626",margin:"8px 0"}}/>
            <Row l="Esperado MXN en caja:" v={`$${expectedMxn.toFixed(2)}`} c="#f59e0b" b/>
            <Row l="Esperado USD en caja:" v={`US$${expectedUsd.toFixed(2)}`} c="#22c55e" b/>
          </div>
          <div style={{padding:16,borderRadius:10,background:"#111",border:"1px solid #333",marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:700,color:"#888",marginBottom:8}}>CONTEO REAL</div>
            <Row l="MXN contado:" v={`$${closeResult.countedMxn.toFixed(2)}`}/>
            <Row l="USD contado:" v={`US$${closeResult.countedUsd.toFixed(2)}`}/>
            <Row l="Tarjeta voucher:" v={`$${closeResult.countedCard.toFixed(2)}`}/>
            {Math.abs(closeResult.diffMxn)>0.01&&<Row l="Diferencia MXN:" v={`${closeResult.diffMxn>0?"+":""}$${closeResult.diffMxn.toFixed(2)}`} c={closeResult.diffMxn>0?"#22c55e":"#ef4444"}/>}
            {Math.abs(closeResult.diffUsd)>0.01&&<Row l="Diferencia USD:" v={`${closeResult.diffUsd>0?"+":""}US$${closeResult.diffUsd.toFixed(2)}`} c={closeResult.diffUsd>0?"#22c55e":"#ef4444"}/>}
            {Math.abs(closeResult.diffCard)>0.01&&<Row l="Diferencia tarjeta:" v={`${closeResult.diffCard>0?"+":""}$${closeResult.diffCard.toFixed(2)}`} c={closeResult.diffCard>0?"#22c55e":"#ef4444"}/>}
          </div>
          <div style={{textAlign:"center",padding:16,borderRadius:10,background:diffColor+"11",border:`2px solid ${diffColor}33`,marginBottom:16}}>
            <div style={{fontSize:11,color:diffColor,fontWeight:600,marginBottom:4}}>{diffLabel}</div>
            <div style={{fontSize:28,fontWeight:800,fontFamily:mono,color:diffColor}}>{Math.abs(diffTotal)<0.01?"$0.00":`${diffTotal>0?"+":""}$${diffTotal.toFixed(2)}`}</div>
            <div style={{fontSize:9,color:"#666",marginTop:4}}>Diferencia total equivalente en MXN</div>
          </div>
          {notes&&<div style={{fontSize:10,color:"#888",marginBottom:12}}>Notas: {notes}</div>}
          <button onClick={()=>onConfirm(closeResult)} style={{width:"100%",padding:"14px 0",borderRadius:10,border:"none",background:"linear-gradient(135deg,#f59e0b,#d97706)",color:"#000",fontSize:14,fontWeight:700,cursor:"pointer"}}>Listo — Nuevo Turno</button>
        </div>
      </Overlay>
    );
  }

  // CLOSE FORM
  return (
    <Overlay onClose={onClose}>
      <div style={{background:"#1a1a1a",borderRadius:12,padding:24,width:420,border:"1px solid #333",color:"#fafafa",maxHeight:"90vh",overflow:"auto"}}>
        <div style={{fontSize:18,fontWeight:700,marginBottom:2}}>Cerrar Turno</div>
        <div style={{fontSize:10,color:"#888",marginBottom:16}}>{new Date(shift.opened_at).toLocaleTimeString("es-MX",{timeZone:TZ,hour:"2-digit",minute:"2-digit"})} — ahora · {shiftData.salesCount} ventas · ${shiftData.salesTotal.toFixed(2)} total</div>

        <div style={{padding:14,borderRadius:10,background:"#0a0a0a",border:"2px solid #f59e0b33",marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:700,color:"#f59e0b",marginBottom:8}}>RESUMEN DEL TURNO</div>
          <Row l="Total ventas:" v={`$${shiftData.salesTotal.toFixed(2)}`} c="#fafafa" b/>
          <div style={{borderTop:"1px solid #262626",margin:"8px 0"}}/>
          <Row l="Tarjeta:" v={`$${shiftData.cardTotal.toFixed(2)}`}/>
          <Row l={`Dólares recibidos: US$${shiftData.usdReceived.toFixed(2)}`} v={`≈$${(shiftData.usdReceived*xrate).toFixed(2)}`}/>
          <Row l="Efectivo MXN (ventas):" v={`$${shiftData.cashMxnReceived.toFixed(2)}`}/>
          {shiftData.expTotal>0&&<Row l="Gastos de caja:" v={`-$${shiftData.expTotal.toFixed(2)}`} c="#ef4444"/>}
          <div style={{borderTop:"1px solid #262626",margin:"8px 0"}}/>
          <Row l="Esperado MXN en caja:" v={`$${expectedMxn.toFixed(2)}`} c="#f59e0b" b/>
          <Row l="Esperado USD en caja:" v={`US$${expectedUsd.toFixed(2)}`} c="#22c55e" b/>
          <Row l="Tarjeta a conciliar:" v={`$${expectedCard.toFixed(2)}`} c="#3b82f6" b/>
        </div>

        <div style={{fontSize:11,fontWeight:700,color:"#888",marginBottom:8}}>CONTEO REAL DE CAJA</div>
        <div style={{marginBottom:10}}>
          <div style={{fontSize:10,color:"#f59e0b",marginBottom:3}}>💵 Efectivo MXN *</div>
          <input type="number" value={cMxn} onChange={e=>setCMxn(e.target.value)} placeholder={expectedMxn.toFixed(2)} style={S.input}/>
          {cMxn&&Math.abs((parseFloat(cMxn)||0)-expectedMxn)>0.01&&(()=>{const d=(parseFloat(cMxn)||0)-expectedMxn;return<div style={{fontSize:10,fontFamily:mono,color:d>0?"#22c55e":"#ef4444",textAlign:"right",marginTop:2}}>{d>0?"+":""}${d.toFixed(2)}</div>;})()}
        </div>
        <div style={{marginBottom:10}}>
          <div style={{fontSize:10,color:"#22c55e",marginBottom:3}}>🇺🇸 Dólares USD</div>
          <input type="number" value={cUsd} onChange={e=>setCUsd(e.target.value)} placeholder={expectedUsd.toFixed(2)} style={{...S.input,borderColor:"#22c55e44"}}/>
          {cUsd&&Math.abs((parseFloat(cUsd)||0)-expectedUsd)>0.01&&(()=>{const d=(parseFloat(cUsd)||0)-expectedUsd;return<div style={{fontSize:10,fontFamily:mono,color:d>0?"#22c55e":"#ef4444",textAlign:"right",marginTop:2}}>{d>0?"+":""}US${d.toFixed(2)}</div>;})()}
        </div>
        <div style={{marginBottom:10}}>
          <div style={{fontSize:10,color:"#3b82f6",marginBottom:3}}>💳 Tarjeta (voucher BBVA)</div>
          <input type="number" value={cCard} onChange={e=>setCCard(e.target.value)} placeholder={expectedCard.toFixed(2)} style={{...S.input,borderColor:"#3b82f644"}}/>
          {cCard&&Math.abs((parseFloat(cCard)||0)-expectedCard)>0.01&&(()=>{const d=(parseFloat(cCard)||0)-expectedCard;return<div style={{fontSize:10,fontFamily:mono,color:d>0?"#22c55e":"#ef4444",textAlign:"right",marginTop:2}}>{d>0?"+":""}${d.toFixed(2)}</div>;})()}
        </div>

        <button onClick={()=>setShowDetail(!showDetail)} style={{background:"none",border:"none",color:"#555",fontSize:10,cursor:"pointer",marginBottom:8,padding:0}}>{showDetail?"▼":"▶"} Detalle técnico de movimientos</button>
        {showDetail&&(<div style={{padding:10,borderRadius:8,background:"#111",border:"1px solid #222",marginBottom:12,fontSize:10}}>
          <Row l="Fondo MXN apertura:" v={`$${Number(shift.opening_fund_mxn).toFixed(2)}`}/>
          <Row l="+ Ventas cash MXN:" v={`+$${shiftData.cashMxnReceived.toFixed(2)}`} c="#22c55e"/>
          {shiftData.cashMxnChange>0&&<Row l="− Cambio dado (MXN):" v={`-$${shiftData.cashMxnChange.toFixed(2)}`} c="#ef4444"/>}
          {shiftData.usdChangeGivenMxn>0&&<Row l="− Cambio dado (ventas USD, en MXN):" v={`-$${shiftData.usdChangeGivenMxn.toFixed(2)}`} c="#ef4444"/>}
          {shiftData.expTotal>0&&<Row l="− Gastos caja:" v={`-$${shiftData.expTotal.toFixed(2)}`} c="#ef4444"/>}
          <div style={{borderTop:"1px solid #333",margin:"6px 0"}}/>
          <Row l="Fondo USD apertura:" v={`US$${Number(shift.opening_fund_usd).toFixed(2)}`}/>
          {shiftData.usdReceived>0&&<Row l="+ USD recibidos clientes:" v={`+US$${shiftData.usdReceived.toFixed(2)}`} c="#22c55e"/>}
          {shiftData.usdChangeGivenUsd>0&&<Row l="− Cambio dado en USD:" v={`-US$${shiftData.usdChangeGivenUsd.toFixed(2)}`} c="#ef4444"/>}
          <div style={{borderTop:"1px solid #333",margin:"6px 0"}}/>
          <Row l="Ventas USD (equiv. MXN):" v={`$${shiftData.usdSalesTotal.toFixed(2)}`}/>
          <Row l="TC turno:" v={`$${xrate.toFixed(2)}`}/>
        </div>)}

        <div style={{marginBottom:14}}>
          <div style={{fontSize:10,color:"#888",marginBottom:4}}>Notas (opcional)</div>
          <input type="text" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Observaciones del turno..." style={{...S.input,fontSize:12,textAlign:"left"}}/>
        </div>

        <button onClick={handleConfirm} disabled={!cMxn||loading} style={{width:"100%",padding:"14px 0",borderRadius:10,border:"none",background:cMxn?"linear-gradient(135deg,#ef4444,#dc2626)":"#333",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>{loading?"Cerrando...":"Cerrar Turno y Guardar"}</button>
        <button onClick={onClose} style={{width:"100%",padding:"8px 0",marginTop:6,border:"none",background:"none",color:"#555",cursor:"pointer",fontSize:11}}>Cancelar</button>
      </div>
    </Overlay>
  );
}

// ============================================================
// INVENTORY PAGE (unchanged from v4)
// ============================================================
function InventoryPage({ ingredients, setIngredients, dbConnected }) {
  const [tab, setTab] = useState("stock");
  const [entryIngr, setEntryIngr] = useState("");
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
        await api.post("inventory_entries", { store_id: STORE, ingredient_id: entryIngr, qty_received: qtyBase, supplier_units: supplierUnits, cost_per_unit: qtyBase > 0 ? costTotal / qtyBase : 0, cost_total: costTotal, supplier: entrySupplier || ing.supplier, expires_at: entryExpires || null });
        await api.post("inventory_movements", { store_id: STORE, ingredient_id: entryIngr, type: "purchase", qty: qtyBase, reason: `Compra: ${supplierUnits} ${ing.supplier_unit || 'unidades'} de ${ing.name}` });
        await api.patch("ingredients", `id=eq.${entryIngr}`, { stock_qty: Number(ing.stock_qty || 0) + qtyBase, cost_per_unit: qtyBase > 0 ? costTotal / qtyBase : ing.cost_per_unit });
        const fresh = await api.get("ingredients", `select=*&store_id=eq.${STORE}&active=eq.true&order=name`);
        setIngredients(fresh);
      }
      setMsg({ type: "ok", text: `+${qtyBase.toFixed(0)} ${ing.unit} de ${ing.name} registrados` });
      setEntryIngr(""); setEntryUnits("1"); setEntryCost(""); setEntrySupplier(""); setEntryExpires("");
    } catch (err) { setMsg({ type: "err", text: "Error: " + err.message }); }
    setSaving(false);
  };

  const handleWaste = async () => {
    if (!wasteIngr || !wasteQty) return;
    setSaving(true); setMsg(null);
    try {
      const ing = ingredients.find(i => i.id === wasteIngr);
      const qty = parseFloat(wasteQty);
      if (dbConnected) {
        await api.post("inventory_movements", { store_id: STORE, ingredient_id: wasteIngr, type: "waste", qty: -qty, reason: wasteReason || "Merma reportada" });
        await api.patch("ingredients", `id=eq.${wasteIngr}`, { stock_qty: Math.max(0, Number(ing.stock_qty || 0) - qty) });
        const fresh = await api.get("ingredients", `select=*&store_id=eq.${STORE}&active=eq.true&order=name`);
        setIngredients(fresh);
      }
      setMsg({ type: "ok", text: `-${qty} ${ing.unit} de ${ing.name} (merma)` });
      setWasteIngr(""); setWasteQty(""); setWasteReason("");
    } catch (err) { setMsg({ type: "err", text: "Error: " + err.message }); }
    setSaving(false);
  };

  const S={input:{width:"100%",padding:"9px 12px",borderRadius:7,border:"1px solid #333",background:"#1e1e1e",color:"#fafafa",fontSize:12,outline:"none",boxSizing:"border-box"}};

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{display:"flex",gap:0,borderBottom:"1px solid #262626",background:"#131313",flexShrink:0}}>
        {[{id:"stock",label:"📦 Stock Actual",c:lowStock.length>0?`(${lowStock.length} alertas)`:""},{id:"entry",label:"📥 Registrar Entrada"},{id:"waste",label:"🗑️ Merma"}].map(t=>(
          <button key={t.id} onClick={()=>{setTab(t.id);setMsg(null);}} style={{padding:"10px 18px",fontSize:12,fontWeight:tab===t.id?700:400,cursor:"pointer",border:"none",borderBottom:tab===t.id?"2px solid #f59e0b":"2px solid transparent",background:"transparent",color:tab===t.id?"#f59e0b":"#777"}}>{t.label} {t.c&&<span style={{fontSize:10,color:"#ef4444"}}>{t.c}</span>}</button>
        ))}
      </div>
      {msg&&<div style={{padding:"8px 16px",fontSize:12,fontWeight:600,background:msg.type==="ok"?"#22c55e18":"#ef444418",color:msg.type==="ok"?"#22c55e":"#ef4444",borderBottom:"1px solid #262626"}}>{msg.text}<button onClick={()=>setMsg(null)} style={{float:"right",background:"none",border:"none",color:"inherit",cursor:"pointer",fontSize:14}}>×</button></div>}

      {tab==="stock"&&(<div style={{flex:1,overflow:"auto",padding:12}}>
        <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
          <input type="text" placeholder="🔍 Buscar ingrediente..." value={search} onChange={e=>setSearch(e.target.value)} style={{...S.input,flex:1,maxWidth:280}}/>
          <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} style={{...S.input,width:"auto",minWidth:130}}><option value="all">Todas las categorías</option>{cats.map(c=><option key={c} value={c}>{c}</option>)}</select>
        </div>
        {lowStock.length>0&&catFilter==="all"&&!search&&(<div style={{padding:10,marginBottom:12,borderRadius:8,background:"#ef44440d",border:"1px solid #ef444430"}}><div style={{fontSize:11,fontWeight:700,color:"#ef4444",marginBottom:6}}>⚠️ Stock bajo ({lowStock.length})</div><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{lowStock.map(i=><span key={i.id} style={{padding:"3px 8px",borderRadius:5,background:"#ef44441a",color:"#ef4444",fontSize:10,fontWeight:600}}>{i.name}: {Number(i.stock_qty).toFixed(0)} {i.unit}</span>)}</div></div>)}
        <div style={{borderRadius:8,border:"1px solid #262626",overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}><thead><tr style={{background:"#1e1e1e"}}><th style={{padding:"8px 10px",textAlign:"left",fontWeight:600,color:"#888",fontSize:10}}>Ingrediente</th><th style={{padding:"8px 10px",textAlign:"right",color:"#888",fontSize:10}}>Stock</th><th style={{padding:"8px 10px",textAlign:"left",color:"#888",fontSize:10}}>Unidad</th><th style={{padding:"8px 10px",textAlign:"right",color:"#888",fontSize:10}}>Costo/u</th><th style={{padding:"8px 10px",textAlign:"left",color:"#888",fontSize:10}}>Proveedor</th><th style={{padding:"8px 10px",textAlign:"left",color:"#888",fontSize:10}}>Cat.</th></tr></thead>
          <tbody>{filtered.map(i=>{const isLow=i.min_stock&&Number(i.stock_qty||0)<=Number(i.min_stock);return(<tr key={i.id} style={{background:"#1a1a1a",borderTop:"1px solid #222"}}><td style={{padding:"7px 10px",fontWeight:600,color:"#ddd"}}>{i.name}</td><td style={{padding:"7px 10px",textAlign:"right",fontFamily:mono,fontWeight:700,color:isLow?"#ef4444":Number(i.stock_qty||0)>0?"#22c55e":"#555"}}>{Number(i.stock_qty||0).toFixed(i.unit==="pz"?0:1)}</td><td style={{padding:"7px 10px",color:"#888"}}>{i.unit}</td><td style={{padding:"7px 10px",textAlign:"right",fontFamily:mono,color:"#888"}}>${Number(i.cost_per_unit||0).toFixed(4)}</td><td style={{padding:"7px 10px",color:"#888"}}>{i.supplier||"—"}</td><td style={{padding:"7px 10px"}}><span style={{padding:"2px 6px",borderRadius:4,background:"#262626",color:"#999",fontSize:9}}>{i.category}</span></td></tr>);})}</tbody></table>
        </div>
        <div style={{fontSize:10,color:"#555",marginTop:8}}>{filtered.length} ingredientes</div>
      </div>)}

      {tab==="entry"&&(<div style={{flex:1,overflow:"auto",padding:16}}><div style={{maxWidth:500}}>
        <div style={{fontSize:14,fontWeight:700,marginBottom:16}}>📥 Registrar Entrada de Mercancía</div>
        <div style={{marginBottom:12}}><label style={{fontSize:10,color:"#888",display:"block",marginBottom:4}}>Ingrediente *</label><select value={entryIngr} onChange={e=>setEntryIngr(e.target.value)} style={S.input}><option value="">Seleccionar...</option>{cats.map(c=><optgroup key={c} label={c.toUpperCase()}>{ingredients.filter(i=>i.category===c).map(i=><option key={i.id} value={i.id}>{i.name} ({i.unit}) — {i.supplier}</option>)}</optgroup>)}</select></div>
        {selectedIngr&&<div style={{padding:10,borderRadius:8,background:"#1e1e1e",border:"1px solid #333",marginBottom:12,fontSize:11}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{color:"#888"}}>Proveedor:</span><span>{selectedIngr.supplier}</span></div><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{color:"#888"}}>Presentación:</span><span>{selectedIngr.supplier_unit||"—"}</span></div><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{color:"#888"}}>Costo/presentación:</span><span style={{color:"#f59e0b",fontFamily:mono}}>${Number(selectedIngr.supplier_unit_cost||0).toFixed(2)}</span></div><div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#888"}}>Stock actual:</span><span style={{color:Number(selectedIngr.stock_qty||0)>0?"#22c55e":"#ef4444",fontFamily:mono}}>{Number(selectedIngr.stock_qty||0).toFixed(1)} {selectedIngr.unit}</span></div></div>}
        <div style={{display:"flex",gap:10,marginBottom:12}}><div style={{flex:1}}><label style={{fontSize:10,color:"#888",display:"block",marginBottom:4}}>Cantidad (presentaciones) *</label><input type="number" value={entryUnits} onChange={e=>setEntryUnits(e.target.value)} placeholder="Ej: 2" style={S.input}/></div><div style={{flex:1}}><label style={{fontSize:10,color:"#888",display:"block",marginBottom:4}}>Costo total $</label><input type="number" value={entryCost} onChange={e=>setEntryCost(e.target.value)} placeholder={selectedIngr?`$${((parseFloat(entryUnits)||1)*Number(selectedIngr.supplier_unit_cost||0)).toFixed(2)}`:"$0"} style={S.input}/></div></div>
        <div style={{display:"flex",gap:10,marginBottom:12}}><div style={{flex:1}}><label style={{fontSize:10,color:"#888",display:"block",marginBottom:4}}>Proveedor</label><input type="text" value={entrySupplier} onChange={e=>setEntrySupplier(e.target.value)} placeholder={selectedIngr?.supplier||"CAFETISIMO"} style={S.input}/></div><div style={{flex:1}}><label style={{fontSize:10,color:"#888",display:"block",marginBottom:4}}>Caduca</label><input type="date" value={entryExpires} onChange={e=>setEntryExpires(e.target.value)} style={S.input}/></div></div>
        {selectedIngr&&entryUnits&&<div style={{padding:10,borderRadius:8,background:"#f59e0b0d",border:"1px solid #f59e0b30",marginBottom:14,fontSize:11}}><span style={{color:"#f59e0b",fontWeight:600}}>Resumen: </span><span style={{color:"#ccc"}}>{entryUnits} × {selectedIngr.supplier_unit||"unidad"} = <strong style={{color:"#f59e0b"}}>+{((parseFloat(entryUnits)||1)*(selectedIngr.supplier_unit_qty||1)).toFixed(0)} {selectedIngr.unit}</strong></span></div>}
        <button onClick={handleEntry} disabled={!entryIngr||!entryUnits||saving} style={{width:"100%",padding:"12px 0",borderRadius:9,border:"none",fontSize:13,fontWeight:700,cursor:"pointer",background:entryIngr&&entryUnits?"linear-gradient(135deg,#22c55e,#16a34a)":"#333",color:entryIngr&&entryUnits?"#fff":"#666"}}>{saving?"Guardando...":"Registrar Entrada"}</button>
      </div></div>)}

      {tab==="waste"&&(<div style={{flex:1,overflow:"auto",padding:16}}><div style={{maxWidth:500}}>
        <div style={{fontSize:14,fontWeight:700,marginBottom:16}}>🗑️ Registrar Merma</div>
        <div style={{marginBottom:12}}><label style={{fontSize:10,color:"#888",display:"block",marginBottom:4}}>Ingrediente *</label><select value={wasteIngr} onChange={e=>setWasteIngr(e.target.value)} style={S.input}><option value="">Seleccionar...</option>{ingredients.filter(i=>Number(i.stock_qty||0)>0).map(i=><option key={i.id} value={i.id}>{i.name} — Stock: {Number(i.stock_qty).toFixed(1)} {i.unit}</option>)}</select></div>
        <div style={{display:"flex",gap:10,marginBottom:12}}><div style={{flex:1}}><label style={{fontSize:10,color:"#888",display:"block",marginBottom:4}}>Cantidad perdida *</label><input type="number" value={wasteQty} onChange={e=>setWasteQty(e.target.value)} placeholder={`En ${ingredients.find(i=>i.id===wasteIngr)?.unit||"unidades"}`} style={S.input}/></div><div style={{flex:2}}><label style={{fontSize:10,color:"#888",display:"block",marginBottom:4}}>Razón</label><input type="text" value={wasteReason} onChange={e=>setWasteReason(e.target.value)} placeholder="Ej: Leche caducada" style={S.input}/></div></div>
        <button onClick={handleWaste} disabled={!wasteIngr||!wasteQty||saving} style={{width:"100%",padding:"12px 0",borderRadius:9,border:"none",fontSize:13,fontWeight:700,cursor:"pointer",background:wasteIngr&&wasteQty?"linear-gradient(135deg,#ef4444,#dc2626)":"#333",color:wasteIngr&&wasteQty?"#fff":"#666"}}>{saving?"Guardando...":"Registrar Merma"}</button>
      </div></div>)}
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function CafeOSPOS() {
  // Auth & Shift state
  const [authState, setAuthState] = useState("pin"); // pin | shift_open | pos
  const [currentUser, setCurrentUser] = useState(null);
  const [currentShift, setCurrentShift] = useState(null);
  const [showCloseShift, setShowCloseShift] = useState(false);

  // App state
  const [page, setPage] = useState("pos");
  const [db, setDb] = useState(false);
  const [categories, setCategories] = useState(LC);
  const [products, setProducts] = useState(LP);
  const [ingredients, setIngredients] = useState([]);
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
  const [changeUsdAmt, setChangeUsdAmt] = useState(""); // cuánto del cambio se da en USD
  const [showRcpt, setShowRcpt] = useState(false);
  const [rcpt, setRcpt] = useState(null);
  const [search, setSearch] = useState("");
  const [sales, setSales] = useState({count:0,total:0});
  const [xrate, setXrate] = useState(() => parseFloat(localStorage.getItem("cafeos_xrate")) || 17.50);
  const [showCfg, setShowCfg] = useState(false);
  const cRef = useRef(null);

  // Load data from Supabase
  useEffect(()=>{
    (async()=>{
      try {
        const [dbC,dbP,dbI] = await Promise.all([
          api.get("categories",`select=*&store_id=eq.${STORE}&active=eq.true&order=display_order`),
          api.get("products",`select=*&store_id=eq.${STORE}&active=eq.true&order=display_order`),
          api.get("ingredients",`select=*&store_id=eq.${STORE}&active=eq.true&order=name`),
        ]);
        if(dbC.length>0&&dbP.length>0){
          const bc=dbC.find(c=>c.name==="Bagels")?.id;
          setCategories(dbC.map(c=>({id:c.id,name:c.name,icon:CAT_META[c.name]?.icon||c.icon||"📦",color:CAT_META[c.name]?.color||c.color||"#f59e0b"})));
          setProducts(dbP.map(p=>({id:p.id,dbId:p.id,name:p.name,cat:p.category_id,p12:p.price_12oz?+p.price_12oz:null,p16:p.price_16oz?+p.price_16oz:null,p20:p.price_20oz?+p.price_20oz:null,unit:p.price_unit?+p.price_unit:null,milk:p.has_milk_option,bread:p.category_id===bc,sku:p.sku})));
          setActiveCat(dbC[0]?.id||"hot");
          setIngredients(dbI);
          setDb(true);
        }
      } catch(e){ console.log("Offline:",e.message); }
    })();
  },[]);

  // Load today's sales when shift is active
  useEffect(()=>{
    if(!currentShift||!db) return;
    (async()=>{
      try{
        const ts=await api.get("sales",`select=id,total&shift_id=eq.${currentShift.id}`);
        setSales({count:ts.length,total:ts.reduce((s,x)=>s+ +x.total,0)});
      }catch(e){}
    })();
  },[currentShift,db]);

  // Auth handlers
  const handleLogin = (user) => { setCurrentUser(user); setAuthState("shift_open"); };
  const handleLogout = () => { setCurrentUser(null); setCurrentShift(null); setAuthState("pin"); setSales({count:0,total:0}); };
  const handleShiftOpen = (shift, rate) => { setCurrentShift(shift); setXrate(rate); setAuthState("pos"); };
  const handleShiftClosed = () => { setShowCloseShift(false); handleLogout(); };

  // POS Logic
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
    const base=getP(product,size);const mE=milk?(MILKS.find(m=>m.id===milk)?.extra||0):0;
    const d=(dE||[]).reduce((s,e)=>s+(DEXT.find(x=>x.id===e)?.extra||0),0);
    const b=(bE||[]).reduce((s,e)=>s+(BEXT.find(x=>x.id===e)?.extra||0),0);
    const up=base+mE+d+b;const ext=[...(dE||[]),...(bE||[])];
    const k=`${product.id}|${size}|${milk}|${bread}|${JSON.stringify(ext)}`;
    const idx=cart.findIndex(i=>`${i.product.id}|${i.size}|${i.milk}|${i.bread}|${JSON.stringify(i.extras)}`===k);
    if(idx>=0) setCart(p=>p.map((it,i)=>i===idx?{...it,qty:it.qty+1,total:(it.qty+1)*up}:it));
    else setCart(p=>[...p,{id:Date.now().toString(36)+Math.random().toString(36).slice(2,5),product,size,milk,bread,extras:ext,unitPrice:up,qty:1,total:up}]);
    setCust(null);
    setTimeout(()=>{cRef.current?.scrollTo(0,cRef.current.scrollHeight);},40);
  };

  const rmCart=id=>setCart(p=>p.filter(i=>i.id!==id));
  const updQty=(id,d)=>setCart(p=>p.map(i=>{if(i.id!==id)return i;const n=i.qty+d;return n<=0?null:{...i,qty:n,total:n*i.unitPrice};}).filter(Boolean));

  // Save sale — linked to cashier and shift (required in v5)
  const saveSale = async (r) => {
    if (!db) return;
    if (!currentUser?.id || !currentShift?.id) {
      console.error("BLOCKED: Sale attempted without active cashier/shift");
      alert("Error: No hay turno activo. Inicia sesión con tu PIN primero.");
      return;
    }
    setSaving(c=>c+1);
    try {
      const [s] = await api.post("sales", {
        store_id:STORE,receipt_number:r.number,subtotal:r.total,total:r.total,discount:0,tax:0,
        payment_type:r.paymentType,
        cash_received:r.paymentType==="cash"?(r.cashReceived||r.total):null,
        usd_received:r.paymentType==="usd"?r.usdReceived:null,
        exchange_rate_used:r.paymentType==="usd"?r.exchangeRate:null,
        change_given_mxn:r.paymentType==="cash"?(r.change>0?r.change:0):r.paymentType==="usd"?(r.changeMxn>0?r.changeMxn:0):null,
        change_given_usd:r.paymentType==="usd"?(r.changeUsd>0?r.changeUsd:0):null,
        status:"completed",completed_at:new Date().toISOString(),local_id:r.number,
        cashier_id: currentUser.id,
        shift_id: currentShift.id,
      });
      const items = r.items.map(it=>({
        sale_id:s.id,product_id:it.product.dbId||it.product.id,size:it.size||"unit",
        quantity:it.qty,unit_price:it.unitPrice,cost_estimate:0,
        modifiers:JSON.stringify([...(it.extras||[]).map(e=>{const f=ALLEXT.find(x=>x.id===e);return f?{id:e,name:f.name,price_extra:f.extra}:null;}).filter(Boolean),it.milk&&it.milk!=="regular"?{id:it.milk,name:MILKS.find(m=>m.id===it.milk)?.name,type:"milk"}:null,it.bread?{id:it.bread,name:BREADS.find(b=>b.id===it.bread)?.name,type:"bread"}:null].filter(Boolean)),
        notes:[it.milk&&it.milk!=="regular"?`Leche: ${MILKS.find(m=>m.id===it.milk)?.name}`:null,r.paymentType==="usd"?`USD $${r.usdReceived} @ ${r.exchangeRate}`:null].filter(Boolean).join(" | ")||null,
      }));
      if(items.length>0) await api.post("sale_items",items);
      try{const fresh=await api.get("ingredients",`select=*&store_id=eq.${STORE}&active=eq.true&order=name`);setIngredients(fresh);}catch(e){}
    } catch(e){ console.error("Save error:",e); }
    setSaving(c=>c-1);
  };

  const completeSale = (type) => {
    const ts=new Date();
    let cashRcvd=null,change=null,usdRcvd=null,changeMxn=null,changeUsd=null;
    if(type==="cash"){cashRcvd=parseFloat(cashIn)||cTotal;change=cashRcvd-cTotal;}
    else if(type==="usd"){
      usdRcvd=parseFloat(usdIn)||0;
      const totalChangeMxn=(usdRcvd*xrate)-cTotal;
      changeUsd=parseFloat(changeUsdAmt)||0;
      changeMxn=totalChangeMxn-(changeUsd*xrate); // lo que queda en MXN después de dar USD
      if(changeMxn<0)changeMxn=0;
    }
    const r={
      number:`${tjDate().replace(/-/g,"")}-${String(sales.count+1).padStart(4,"0")}`,
      items:cart.map(i=>({...i,milkLabel:i.milk&&i.milk!=="regular"?MILKS.find(m=>m.id===i.milk):null,breadLabel:i.bread?BREADS.find(b=>b.id===i.bread):null,extraNames:(i.extras||[]).map(e=>ALLEXT.find(x=>x.id===e)?.name).filter(Boolean)})),
      total:cTotal,paymentType:type,cashReceived:cashRcvd,change,usdReceived:usdRcvd,changeMxn,changeUsd,exchangeRate:type==="usd"?xrate:null,
      cashier:currentUser?.name||"—",timestamp:ts,
    };
    setRcpt(r);setShowRcpt(true);setShowPay(false);
    setSales(p=>({count:p.count+1,total:p.total+cTotal}));
    setCart([]);setCashIn("");setUsdIn("");setChangeUsdAmt("");setPayType(null);
    saveSale(r);
  };

  const custPrice=()=>{if(!cust)return 0;const base=getP(cust,selSize);const mE=cust.milk?(MILKS.find(m=>m.id===selMilk)?.extra||0):0;const dE=selExt.reduce((s,e)=>s+(DEXT.find(x=>x.id===e)?.extra||0),0);const bE=selBExt.reduce((s,e)=>s+(BEXT.find(x=>x.id===e)?.extra||0),0);return base+mE+dE+bE;};

  const time=tjNow().toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"});
  const date=tjNow().toLocaleDateString("es-MX",{weekday:"short",day:"numeric",month:"short"});

  // ── RENDER AUTH SCREENS ──
  if (authState === "pin") return <PinScreen onLogin={handleLogin} db={db}/>;
  if (authState === "shift_open") return <ShiftOpenScreen cashier={currentUser} onOpen={handleShiftOpen} onLogout={handleLogout}/>;

  // ── RENDER MAIN POS ──
  return (
    <div style={{height:"100vh",width:"100vw",display:"flex",flexDirection:"column",background:"#0f0f0f",color:"#fafafa",fontFamily:"'DM Sans',-apple-system,sans-serif",overflow:"hidden"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>

      {/* HEADER */}
      <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 14px",background:"#151515",borderBottom:"1px solid #262626",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:28,height:28,borderRadius:6,background:"linear-gradient(135deg,#f59e0b,#d97706)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:12,color:"#000"}}>C</div>
          <div>
            <div style={{fontSize:12,fontWeight:700,lineHeight:1.2}}>CaféOS<span style={{display:"inline-block",width:6,height:6,borderRadius:3,marginLeft:5,background:db?"#22c55e":"#ef4444",boxShadow:db?"0 0 6px #22c55e88":"0 0 6px #ef444488"}}/>{saving>0&&<span style={{fontSize:9,color:"#f59e0b",marginLeft:4}}>guardando...</span>}</div>
            <div style={{fontSize:9,color:"#555"}}>D'Volada Montesinos</div>
          </div>
          <div style={{display:"flex",gap:2,marginLeft:12}}>
            {[{id:"pos",label:"POS",icon:"☕"},{id:"inventory",label:"Inventario",icon:"📦"}].map(t=>(
              <button key={t.id} onClick={()=>setPage(t.id)} style={{padding:"4px 12px",borderRadius:6,border:"none",cursor:"pointer",fontSize:11,fontWeight:page===t.id?700:400,background:page===t.id?"#f59e0b22":"transparent",color:page===t.id?"#f59e0b":"#666"}}>{t.icon} {t.label}</button>
            ))}
          </div>
        </div>
        <div style={{flex:1,maxWidth:220,margin:"0 10px"}}>
          {page==="pos"&&<input type="text" placeholder="🔍 Buscar..." value={search} onChange={e=>setSearch(e.target.value)} style={{width:"100%",padding:"5px 10px",borderRadius:7,border:"1px solid #333",background:"#1c1c1c",color:"#fafafa",fontSize:11,outline:"none"}}/>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12,fontSize:10}}>
          <div style={{padding:"3px 7px",borderRadius:5,border:"1px solid #333",background:"#1c1c1c",fontSize:10,color:"#22c55e",fontFamily:mono}}>USD ${xrate.toFixed(2)}</div>
          <div style={{textAlign:"right"}}>
            <div style={{color:"#f59e0b",fontWeight:600,fontSize:11}}>{currentUser?.name}</div>
            <div style={{color:"#555"}}>{sales.count} ventas · <span style={{fontWeight:700,color:"#f59e0b",fontFamily:mono}}>${sales.total.toLocaleString()}</span></div>
          </div>
          <div style={{textAlign:"right"}}><div style={{fontWeight:500,fontSize:11}}>{time}</div><div style={{color:"#555",fontSize:9}}>{date}</div></div>
          <button onClick={()=>setShowCloseShift(true)} style={{padding:"4px 10px",borderRadius:6,border:"1px solid #ef444444",background:"#ef44440a",color:"#ef4444",fontSize:10,fontWeight:600,cursor:"pointer"}}>Cerrar Turno</button>
        </div>
      </header>

      {/* PAGE CONTENT */}
      {page==="inventory" ? <InventoryPage ingredients={ingredients} setIngredients={setIngredients} dbConnected={db}/> : (
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        {/* Products */}
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div style={{display:"flex",gap:2,padding:"5px 8px",overflowX:"auto",background:"#121212",borderBottom:"1px solid #1c1c1c",flexShrink:0}}>
            {categories.map(c=>{const a=activeCat===c.id&&!search;return(<button key={c.id} onClick={()=>{setActiveCat(c.id);setSearch("");}} style={{padding:"4px 10px",borderRadius:6,border:"none",cursor:"pointer",fontSize:10,fontWeight:600,whiteSpace:"nowrap",background:a?c.color+"22":"transparent",color:a?c.color:"#666"}}>{c.icon} {c.name}</button>);})}
          </div>
          <div style={{flex:1,overflow:"auto",padding:8,display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(115px,1fr))",gap:5,alignContent:"start"}}>
            {filtered.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center",padding:40,color:"#444",fontSize:12}}>Sin resultados</div>}
            {filtered.map(p=>{const cc=categories.find(c=>c.id===p.cat)?.color||"#f59e0b";return(
              <button key={p.id} onClick={()=>handleProd(p)} style={{padding:"10px 6px",borderRadius:8,border:"1px solid #262626",background:"#1a1a1a",cursor:"pointer",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,minHeight:64}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=cc+"55";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="#262626";}}>
                <div style={{fontSize:11,fontWeight:600,color:"#ddd",lineHeight:1.2}}>{p.name}</div>
                <div style={{fontSize:10,fontFamily:mono,color:cc,fontWeight:500}}>{p.unit?`$${p.unit}`:`$${p.p12}–${p.p20}`}</div>
              </button>);})}
          </div>
        </div>

        {/* Cart */}
        <div style={{width:300,display:"flex",flexDirection:"column",background:"#151515",borderLeft:"1px solid #262626",flexShrink:0}}>
          <div style={{padding:"8px 12px",borderBottom:"1px solid #262626",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{fontSize:13,fontWeight:700}}>Ticket {cCount>0&&<span style={{background:"#f59e0b",color:"#000",borderRadius:99,padding:"1px 6px",fontSize:9,fontWeight:700,marginLeft:4}}>{cCount}</span>}</div>
            {cart.length>0&&<button onClick={()=>setCart([])} style={{background:"none",border:"none",color:"#ef4444",fontSize:10,cursor:"pointer"}}>Limpiar</button>}
          </div>
          <div ref={cRef} style={{flex:1,overflow:"auto",padding:"5px 8px"}}>
            {cart.length===0?<div style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:"#383838"}}><div style={{fontSize:26,opacity:0.4}}>☕</div><div style={{fontSize:11,color:"#444",marginTop:5}}>Ticket vacío</div></div>
            :cart.map(it=>{
              const mL=it.milk&&it.milk!=="regular"?MILKS.find(m=>m.id===it.milk):null;const bL=it.bread?BREADS.find(b=>b.id===it.bread):null;const eN=(it.extras||[]).map(e=>ALLEXT.find(x=>x.id===e)?.name).filter(Boolean);
              return(<div key={it.id} style={{padding:"8px 10px",marginBottom:4,borderRadius:7,background:"#1c1c1c",border:"1px solid #262626"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"start"}}><div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:600}}><span>{it.product.name}</span>{it.size&&<span style={{color:"#666",fontWeight:400,fontSize:10,marginLeft:4}}>{it.size}</span>}</div>{(mL||bL||eN.length>0)&&<div style={{fontSize:9,color:"#888",marginTop:2}}>{bL&&<span>🍞 {bL.name}</span>}{mL&&<span>{bL?" · ":""}🥛 {mL.name}{mL.extra>0?` +$${mL.extra}`:""}</span>}{eN.length>0&&<span>{(mL||bL)?" · ":""}+ {eN.join(", ")}</span>}</div>}</div><button onClick={()=>rmCart(it.id)} style={{background:"none",border:"none",color:"#444",fontSize:15,cursor:"pointer",lineHeight:1}}>×</button></div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:5}}><div style={{display:"flex",alignItems:"center",gap:5}}><QBtn onClick={()=>updQty(it.id,-1)}>−</QBtn><span style={{fontSize:12,fontWeight:600,fontFamily:mono,minWidth:12,textAlign:"center"}}>{it.qty}</span><QBtn onClick={()=>updQty(it.id,1)}>+</QBtn></div><div style={{fontSize:13,fontWeight:700,fontFamily:mono,color:"#f59e0b"}}>${it.total}</div></div>
              </div>);})}
          </div>
          {cart.length>0&&(<div style={{padding:"10px 12px",borderTop:"1px solid #262626"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:9,fontSize:16,fontWeight:700}}><span>Total</span><span style={{fontFamily:mono,color:"#f59e0b"}}>${cTotal.toLocaleString()}</span></div>
            <button onClick={()=>setShowPay(true)} style={{width:"100%",padding:"12px 0",borderRadius:9,border:"none",background:"linear-gradient(135deg,#f59e0b,#d97706)",color:"#000",fontSize:13,fontWeight:700,cursor:"pointer"}}>COBRAR ${cTotal.toLocaleString()}</button>
          </div>)}
        </div>
      </div>)}

      {/* CUSTOMIZATION MODAL */}
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

      {/* PAYMENT MODAL */}
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
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}><span style={{fontSize:16,color:"#22c55e"}}>US$</span><input type="number" value={usdIn} onChange={e=>{setUsdIn(e.target.value);setChangeUsdAmt("");}} placeholder={`${(cTotal/xrate).toFixed(2)}`} autoFocus style={{flex:1,padding:"11px",borderRadius:9,border:"2px solid #22c55e",background:"#262626",color:"#fafafa",fontSize:18,fontFamily:mono,outline:"none",textAlign:"center",boxSizing:"border-box"}}/></div>
          <div style={{display:"flex",gap:4,marginBottom:12}}>{[5,10,20,50].map(a=><button key={a} onClick={()=>{setUsdIn(String(a));setChangeUsdAmt("");}} style={{flex:1,padding:"6px 0",borderRadius:6,border:"1px solid #333",background:"#262626",color:"#bbb",cursor:"pointer",fontSize:11,fontFamily:mono}}>US${a}</button>)}<button onClick={()=>{setUsdIn((cTotal/xrate).toFixed(2));setChangeUsdAmt("");}} style={{flex:1,padding:"6px 0",borderRadius:6,border:"1px solid #22c55e44",background:"#22c55e11",color:"#22c55e",cursor:"pointer",fontSize:10,fontWeight:600}}>Exacto</button></div>
          {usdIn&&(parseFloat(usdIn)*xrate)>=cTotal&&(()=>{
            const usdVal=parseFloat(usdIn);
            const totalChange=(usdVal*xrate)-cTotal;
            const chgUsd=parseFloat(changeUsdAmt)||0;
            const chgMxn=totalChange-(chgUsd*xrate);
            return(<div style={{marginBottom:12}}>
              <div style={{padding:10,background:"#22c55e0c",borderRadius:7,border:"1px solid #22c55e28",marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:4}}><span style={{color:"#888"}}>US${usdIn} × {xrate.toFixed(2)}</span><span style={{fontFamily:mono,color:"#888"}}>${(usdVal*xrate).toFixed(2)} MXN</span></div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,fontWeight:700}}><span style={{color:"#22c55e"}}>Cambio total</span><span style={{fontFamily:mono,color:"#22c55e"}}>${totalChange.toFixed(2)} MXN</span></div>
              </div>
              {totalChange>0.01&&(<div style={{padding:10,background:"#1e1e1e",borderRadius:7,border:"1px solid #333"}}>
                <div style={{fontSize:10,color:"#888",marginBottom:6}}>¿Cuánto cambio en USD? (default: todo en MXN)</div>
                <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:9,color:"#22c55e",marginBottom:2}}>En USD:</div>
                    <input type="number" value={changeUsdAmt} onChange={e=>{const v=parseFloat(e.target.value)||0;if(v*xrate<=totalChange+0.01)setChangeUsdAmt(e.target.value);}} placeholder="0" style={{width:"100%",padding:"6px",borderRadius:6,border:"1px solid #22c55e44",background:"#262626",color:"#fafafa",fontSize:14,fontFamily:mono,outline:"none",textAlign:"center",boxSizing:"border-box"}}/>
                  </div>
                  <div style={{color:"#444",fontSize:16}}>+</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:9,color:"#f59e0b",marginBottom:2}}>En MXN:</div>
                    <div style={{padding:"7px",borderRadius:6,border:"1px solid #333",background:"#1a1a1a",fontSize:14,fontFamily:mono,textAlign:"center",color:chgMxn>0?"#f59e0b":"#555"}}>${chgMxn>0?chgMxn.toFixed(2):"0.00"}</div>
                  </div>
                </div>
              </div>)}
            </div>);
          })()}
          <button onClick={()=>completeSale("usd")} disabled={!usdIn||(parseFloat(usdIn)*xrate)<cTotal} style={{width:"100%",padding:"12px 0",borderRadius:9,border:"none",background:(usdIn&&(parseFloat(usdIn)*xrate)>=cTotal)?"linear-gradient(135deg,#22c55e,#16a34a)":"#333",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>Completar Venta 🇺🇸</button>
          <button onClick={()=>setPayType(null)} style={{width:"100%",padding:"8px 0",marginTop:5,border:"none",background:"none",color:"#555",cursor:"pointer",fontSize:10}}>← Cambiar</button>
        </div>)}
      </div></Overlay>)}

      {/* CONFIG MODAL */}
      {showCfg&&(<Overlay onClose={()=>setShowCfg(false)}><div style={{background:"#1a1a1a",borderRadius:12,padding:22,width:300,border:"1px solid #333"}}>
        <div style={{fontSize:14,fontWeight:700,marginBottom:12}}>Configuración</div>
        <div style={{fontSize:9,color:"#444",marginBottom:10}}>DB: {db?"🟢":"🔴"} · {products.length} productos · {ingredients.length} ingredientes</div>
        <div style={{fontSize:9,color:"#444",marginBottom:10}}>Cajero: {currentUser?.name} ({currentUser?.role}) · Turno: {currentShift?.id?.slice(0,8)}</div>
        <button onClick={()=>setShowCfg(false)} style={{width:"100%",padding:"10px 0",borderRadius:8,border:"none",background:"#262626",color:"#fafafa",fontSize:12,fontWeight:600,cursor:"pointer"}}>Listo</button>
      </div></Overlay>)}

      {/* RECEIPT MODAL */}
      {showRcpt&&rcpt&&(<Overlay onClose={()=>setShowRcpt(false)}><div style={{background:"#fff",borderRadius:12,width:340,maxHeight:"90vh",overflow:"auto",color:"#111",fontFamily:mono}}>
        <div style={{padding:"24px 20px 16px"}}>
          <div style={{textAlign:"center",marginBottom:14}}><div style={{fontSize:18,fontWeight:800,letterSpacing:"0.05em",fontFamily:"'DM Sans',sans-serif"}}>D'Volada</div><div style={{fontSize:9,color:"#666",marginTop:2,fontFamily:"'DM Sans'"}}>Café & Smoothies</div><div style={{fontSize:8,color:"#999",marginTop:6,lineHeight:1.5}}>D'Volada Montesinos<br/>Plaza Montesino L-10, Carr. Libre TJ-Ens #10951<br/>Tejamen, 22635 Tijuana, B.C.</div></div>
          <div style={{borderTop:"1px dashed #ccc",margin:"10px 0"}}/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#666",marginBottom:2}}><span>#{rcpt.number}</span><span>{rcpt.timestamp.toLocaleDateString("es-MX",{day:"2-digit",month:"2-digit",year:"numeric",timeZone:TZ})}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#666",marginBottom:8}}><span>{rcpt.cashier}</span><span>{rcpt.timestamp.toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit",second:"2-digit",timeZone:TZ})}</span></div>
          <div style={{borderTop:"1px dashed #ccc",margin:"10px 0"}}/>
          {rcpt.items.map((it,i)=>(<div key={i} style={{marginBottom:6}}><div style={{display:"flex",justifyContent:"space-between",fontSize:10,fontWeight:600}}><span>{it.qty>1?`${it.qty}× `:""}{it.product.name}{it.size?` ${it.size}`:""}</span><span>${it.total.toFixed(2)}</span></div>
            {(it.breadLabel||it.milkLabel||it.extraNames?.length>0)&&<div style={{fontSize:8,color:"#888",paddingLeft:8,marginTop:1,lineHeight:1.4}}>{it.breadLabel&&<div>Pan: {it.breadLabel.name}</div>}{it.milkLabel&&<div>Leche: {it.milkLabel.name}{it.milkLabel.extra>0?` (+$${it.milkLabel.extra})`:""}</div>}{it.extraNames?.length>0&&<div>Extras: {it.extraNames.join(", ")}</div>}</div>}
            {it.qty>1&&<div style={{fontSize:8,color:"#999",paddingLeft:8}}>c/u ${it.unitPrice.toFixed(2)}</div>}
          </div>))}
          <div style={{borderTop:"1px dashed #ccc",margin:"10px 0"}}/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:13,fontWeight:800,marginTop:4}}><span>TOTAL</span><span>${rcpt.total.toFixed(2)} MXN</span></div>
          <div style={{borderTop:"1px dashed #ccc",margin:"10px 0"}}/>
          <div style={{fontSize:9,color:"#555"}}>
            {rcpt.paymentType==="cash"&&(<><div style={{display:"flex",justifyContent:"space-between"}}><span>💵 Efectivo</span><span>${rcpt.cashReceived?.toFixed(2)}</span></div>{rcpt.change>0&&<div style={{display:"flex",justifyContent:"space-between",fontWeight:700,color:"#111",marginTop:2}}><span>Cambio</span><span>${rcpt.change.toFixed(2)}</span></div>}</>)}
            {rcpt.paymentType==="usd"&&(<><div style={{display:"flex",justifyContent:"space-between"}}><span>🇺🇸 USD</span><span>US${rcpt.usdReceived?.toFixed(2)}</span></div><div style={{fontSize:8,color:"#999",marginTop:1}}>TC: ${rcpt.exchangeRate?.toFixed(2)}</div>{rcpt.changeMxn>0.01&&<div style={{display:"flex",justifyContent:"space-between",fontWeight:700,color:"#111",marginTop:2}}><span>Cambio MXN</span><span>${rcpt.changeMxn.toFixed(2)}</span></div>}{rcpt.changeUsd>0&&<div style={{display:"flex",justifyContent:"space-between",fontWeight:700,color:"#111",marginTop:2}}><span>Cambio USD</span><span>US${rcpt.changeUsd.toFixed(2)}</span></div>}</>)}
            {rcpt.paymentType==="card"&&<div style={{display:"flex",justifyContent:"space-between"}}><span>💳 Tarjeta</span><span>${rcpt.total.toFixed(2)}</span></div>}
          </div>
          <div style={{borderTop:"1px dashed #ccc",margin:"10px 0"}}/>
          <div style={{textAlign:"center",fontSize:8,color:"#999",lineHeight:1.6}}>¡Gracias por tu preferencia!<br/>D'Volada Café & Smoothies<br/><span style={{fontSize:7}}>Powered by CaféOS</span></div>
        </div>
        <div style={{padding:"0 20px 20px"}}><button onClick={()=>setShowRcpt(false)} style={{width:"100%",padding:"11px 0",borderRadius:8,border:"none",background:"#111",color:"#fafafa",fontSize:12,fontWeight:600,cursor:"pointer"}}>Nueva Venta</button></div>
      </div></Overlay>)}

      {/* CLOSE SHIFT MODAL */}
      {showCloseShift&&currentShift&&<ShiftCloseModal shift={currentShift} xrate={xrate} onClose={()=>setShowCloseShift(false)} onConfirm={handleShiftClosed}/>}
    </div>
  );
}
