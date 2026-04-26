import { useState, useRef, useCallback } from "react";
import { toPng } from "html-to-image";

// ─── PRESETS ──────────────────────────────────────────────────────────────────
const PRESETS = {
  lunes:    { linea1:"LUNES EN",    linea2:"MORDELÓN", separador:"EL DÍA IDEAL PARA",    titulo:"UN SANGUCHE DE",  precio:"CARNE MECHADA", ingredientes:"", valido:"", cta1:"PORQUE EL LUNES", cta2:"SE BANCA CON",    cta3:"MORDELÓN." },
  martes:   { linea1:"MARTES EN",   linea2:"MORDELÓN", separador:"EL ANTÍDOTO CONTRA",   titulo:"LA SEMANA",       precio:"LARGA",         ingredientes:"", valido:"", cta1:"UN MORDISCO Y",   cta2:"EL MARTES YA",    cta3:"NO DUELE." },
  miercoles:{ linea1:"MIÉRCOLES EN",linea2:"MORDELÓN", separador:"MITAD DE SEMANA",      titulo:"MITAD DE",        precio:"HAMBRE",        ingredientes:"", valido:"", cta1:"LA OTRA MITAD",   cta2:"LA PONÉS",        cta3:"VOS." },
  jueves:   { linea1:"JUEVES EN",   linea2:"MORDELÓN", separador:"CASI VIERNES",         titulo:"MEJOR CON UN",    precio:"SANGUCHE",      ingredientes:"", valido:"", cta1:"YA FALTA POCO",   cta2:"AGUANTÁ CON",     cta3:"MORDELÓN." },
  viernes:  { linea1:"VIERNES EN",  linea2:"MORDELÓN", separador:"A PARTIR DE LAS 20HS", titulo:"ARRANCA EL FIN",  precio:"DE SEMANA",     ingredientes:"", valido:"", cta1:"PEDÍ AHORA Y",    cta2:"NO TE QUEDES",    cta3:"CON LAS GANAS." },
  sabado:   { linea1:"SÁBADO EN",   linea2:"MORDELÓN", separador:"A PARTIR DEL MEDIODÍA",titulo:"ARRANCA LA PROMO",precio:"2 POR $20.000", ingredientes:"- Carne desmechada\n- Mozzarella\n- Cebolla caramelizada", valido:"VÁLIDO HASTA AGOTAR STOCK", cta1:"PEDÍ AHORA Y", cta2:"NO TE QUEDES", cta3:"CON LAS GANAS." },
  domingo:  { linea1:"DOMINGO EN",  linea2:"MORDELÓN", separador:"EL MEJOR CIERRE",      titulo:"DE LA SEMANA",    precio:"ES UN MORDISCO",ingredientes:"", valido:"", cta1:"MAÑANA ARRANCA",  cta2:"TODO DE NUEVO.",  cta3:"HOY MORDELÓN." },
  promo:    { linea1:"HOY EN",      linea2:"MORDELÓN", separador:"PROMO DEL DÍA",        titulo:"2 DE LA CASA",    precio:"POR $20.000",   ingredientes:"- Carne desmechada\n- Mozzarella\n- Cebolla caramelizada", valido:"VÁLIDO HASTA AGOTAR STOCK", cta1:"PEDÍ AHORA Y", cta2:"NO TE QUEDES", cta3:"CON LAS GANAS." },
  smash:    { linea1:"HOY EN",      linea2:"MORDELÓN", separador:"EL CLÁSICO DE SIEMPRE",titulo:"SMASH BURGER",    precio:"DESDE $8.500",  ingredientes:"- Doble carne smash\n- Cheddar fundido\n- Pickles y mostaza", valido:"", cta1:"EL SABOR QUE", cta2:"NO TE PODÉS", cta3:"PERDER." },
  combo:    { linea1:"HOY EN",      linea2:"MORDELÓN", separador:"COMBO COMPLETO",       titulo:"BURGER + PAPAS",  precio:"+ BEBIDA",      ingredientes:"", valido:"VÁLIDO HASTA AGOTAR STOCK", cta1:"TODO LO QUE", cta2:"NECESITÁS EN", cta3:"UN SOLO COMBO." },
};

const PALETTES = {
  clasica:{ dorado:"#C8991A", fuego:"#DC5014", gris:"#888", turquesa:"#2AB7B7" },
  noche:  { dorado:"#FFFFFF", fuego:"#2AB7B7", gris:"#777", turquesa:"#2AB7B7" },
  fuego:  { dorado:"#FF7800", fuego:"#C81E1E", gris:"#999", turquesa:"#2AB7B7" },
};

const PRESET_KEYS   = Object.keys(PRESETS);
const PRESET_LABELS = { lunes:"Lunes", martes:"Martes", miercoles:"Miércoles", jueves:"Jueves", viernes:"Viernes", sabado:"Sábado", domingo:"Domingo", promo:"Promo", smash:"Smash", combo:"Combo" };

const PW = 360;
const storyH = () => 640;
const postH  = () => 360;

const DEFAULT_SIZES = { linea1:13, linea2:36, separador:10, titulo:16, precio:24, ingredientes:9, valido:8, cta1:17, cta2:17, cta3:17 };

const makeDefaultPos = (isStory) => {
  const H = isStory ? 640 : 360;
  return {
    linea1:      { x: PW/2, y: H*0.07  },
    linea2:      { x: PW/2, y: H*0.15  },
    separador:   { x: PW/2, y: H*0.27  },
    titulo:      { x: PW/2, y: H*0.42  },
    precio:      { x: PW/2, y: H*0.51  },
    ingredientes:{ x: PW/2, y: H*0.60  },
    valido:      { x: PW/2, y: H*0.68  },
    cta1:        { x: PW/2, y: H*0.74  },
    cta2:        { x: PW/2, y: H*0.81  },
    cta3:        { x: PW/2, y: H*0.87  },
    footer1:     { x: PW/2, y: H*0.93  },
    footer2:     { x: PW/2, y: H*0.97  },
  };
};

const paletaToColors = (p) => {
  const pal = PALETTES[p] || PALETTES.clasica;
  return {
    linea1:      pal.gris,
    linea2:      pal.turquesa,
    separador:   "#bbbbbb",
    titulo:      pal.fuego,
    precio:      pal.dorado,
    ingredientes:"#bbbbbb",
    valido:      "#aaaaaa",
    cta1:        "#ffffff",
    cta2:        "#ffffff",
    cta3:        pal.turquesa,
    footer1:     pal.turquesa,
    footer2:     pal.gris,
  };
};

// ─── DRAGGABLE TEXT ───────────────────────────────────────────────────────────
function DraggableText({ text, fontSize, color, bold, pos, onMove, containerRef }) {
  const dragging = useRef(false);
  const offset   = useRef({ x: 0, y: 0 });

  if (!text) return null;

  const getRect = () => containerRef.current ? containerRef.current.getBoundingClientRect() : null;

  const clamp = (nx, ny, r) => onMove({
    x: Math.max(0, Math.min(r.width,  nx)),
    y: Math.max(0, Math.min(r.height, ny)),
  });

  const onMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const r = getRect();
    if (!r) return;
    dragging.current = true;
    offset.current = { x: e.clientX - r.left - pos.x, y: e.clientY - r.top - pos.y };

    const move = (ev) => {
      if (!dragging.current) return;
      const r2 = getRect();
      if (!r2) return;
      clamp(ev.clientX - r2.left - offset.current.x, ev.clientY - r2.top - offset.current.y, r2);
    };
    const up = () => {
      dragging.current = false;
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const onTouchStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const r = getRect();
    if (!r) return;
    dragging.current = true;
    const t = e.touches[0];
    offset.current = { x: t.clientX - r.left - pos.x, y: t.clientY - r.top - pos.y };

    const move = (ev) => {
      if (!dragging.current) return;
      ev.preventDefault();
      const tt = ev.touches[0];
      clamp(tt.clientX - r.left - offset.current.x, tt.clientY - r.top - offset.current.y, r);
    };
    const end = () => {
      dragging.current = false;
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", end);
    };
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", end);
  };

  return (
    <div
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      style={{
        position: "absolute",
        left: pos.x, top: pos.y,
        transform: "translate(-50%, -50%)",
        cursor: "grab",
        userSelect: "none",
        whiteSpace: "nowrap",
        color, fontSize,
        fontWeight: bold ? 900 : 400,
        fontFamily: "'Arial Black', Impact, sans-serif",
        letterSpacing: 1,
        textShadow: "0 1px 6px rgba(0,0,0,0.85)",
        touchAction: "none",
        zIndex: 20,
        lineHeight: 1.2,
      }}
    >
      {text}
    </div>
  );
}

// ─── CANVAS PREVIEW ───────────────────────────────────────────────────────────
function CanvasPreview({ form, image, logo, format, darkness, showIng, showValido, paleta, previewRef, sizes, positions, setPositions, textColors }) {
  const isStory = format === "story";
  const H       = isStory ? storyH() : postH();
  const pal     = PALETTES[paleta] || PALETTES.clasica;
  const tc      = textColors || paletaToColors("clasica");

  const ingredientes = form.ingredientes
    ? form.ingredientes.split("\n").map(s => s.trim()).filter(Boolean)
    : [];

  const move = (id) => (newPos) => setPositions(p => ({ ...p, [id]: newPos }));
  const def  = makeDefaultPos(isStory);

  const dt = (id, text, color, bold) =>
    text ? (
      <DraggableText key={id} text={text}
        fontSize={`${sizes[id] || DEFAULT_SIZES[id] || 14}px`}
        color={color} bold={bold}
        pos={positions[id] || def[id]}
        onMove={move(id)}
        containerRef={previewRef}
      />
    ) : null;

  return (
    <div
      ref={previewRef}
      style={{
        width: PW, height: H,
        position: "relative", overflow: "hidden",
        borderRadius: 8, flexShrink: 0,
        background: "#111",
        touchAction: "none",
      }}
    >
      {image && (
        <img src={image} alt="" style={{
          position:"absolute", inset:0,
          width:"100%", height:"100%",
          objectFit:"cover", objectPosition:"center",
          pointerEvents:"none",
        }} />
      )}

      <div style={{ position:"absolute", inset:0, background:`rgba(0,0,0,${darkness})`, pointerEvents:"none" }} />
      <div style={{ position:"absolute", top:0,    left:0, right:0, height:"45%", background:"linear-gradient(to bottom,rgba(0,0,0,0.55),transparent)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"45%", background:"linear-gradient(to top,rgba(0,0,0,0.65),transparent)",    pointerEvents:"none" }} />

      <div style={{ position:"absolute", left:18, top:28, width:3, height:isStory?82:55, background:pal.turquesa, borderRadius:2, pointerEvents:"none" }} />
      <div style={{ position:"absolute", left:"8%", right:"8%", top:"29%", height:1.5, background:pal.dorado,   pointerEvents:"none" }} />
      <div style={{ position:"absolute", left:"8%", right:"8%", top:"65%", height:1.5, background:pal.turquesa, pointerEvents:"none" }} />

      {dt("linea1",    form.linea1,    tc.linea1,    false)}
      {dt("linea2",    form.linea2,    tc.linea2,    true)}
      {dt("separador", form.separador, tc.separador, false)}
      {dt("titulo",    form.titulo,    tc.titulo,    true)}
      {dt("precio",    form.precio,    tc.precio,    true)}

      {showIng && ingredientes.map((ing, i) => (
        <DraggableText key={"ing"+i} text={ing}
          fontSize={`${sizes.ingredientes || DEFAULT_SIZES.ingredientes}px`}
          color={tc.ingredientes} bold={false}
          pos={positions["ing"+i] || { x: PW*0.3, y: (positions.ingredientes ? positions.ingredientes.y : def.ingredientes.y) + i*14 }}
          onMove={move("ing"+i)}
          containerRef={previewRef}
        />
      ))}

      {showValido && dt("valido",  form.valido, tc.valido,  false)}
      {dt("cta1",    form.cta1,   tc.cta1,     true)}
      {dt("cta2",    form.cta2,   tc.cta2,     true)}
      {dt("cta3",    form.cta3,   tc.cta3,     true)}
      {dt("footer1", "MORDELÓN",         tc.footer1, true)}
      {dt("footer2", "DEL FUEGO AL PAN", tc.footer2, false)}

      {logo && (
        <img src={logo} alt="logo" style={{
          position:"absolute", bottom:10, left:14,
          height: isStory ? 30 : 22,
          objectFit:"contain", pointerEvents:"none",
        }} />
      )}

      <div style={{ position:"absolute", top:5, right:7, fontSize:9, color:"rgba(255,255,255,0.28)", pointerEvents:"none", fontFamily:"sans-serif" }}>
        arrastrar textos
      </div>
    </div>
  );
}

// ─── FIELD ────────────────────────────────────────────────────────────────────
function Field({ label, fieldKey, value, onChange, multiline, sizes, setSizes, textColors, setTextColors }) {
  const base = {
    width:"100%", boxSizing:"border-box",
    background:"#1a1a1a", border:"1px solid #2e2e2e",
    borderRadius:6, color:"#eee",
    padding:"7px 10px", fontSize:13,
    fontFamily:"monospace", outline:"none", display:"block",
  };

  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
        <label style={{ fontSize:11, color:"#666", letterSpacing:0.5, textTransform:"uppercase" }}>
          {label}
        </label>
        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
          {textColors && setTextColors && (
            <input
              type="color"
              value={textColors[fieldKey] || "#ffffff"}
              onChange={e => setTextColors(c => ({ ...c, [fieldKey]: e.target.value }))}
              title="Color del texto"
              style={{ width:24, height:24, padding:2, border:"1px solid #333", borderRadius:4, background:"#1a1a1a", cursor:"pointer", flexShrink:0 }}
            />
          )}
          <input
            type="range" min="6" max="60" step="1"
            value={sizes[fieldKey] || DEFAULT_SIZES[fieldKey] || 14}
            onChange={e => setSizes(s => ({ ...s, [fieldKey]: parseInt(e.target.value) }))}
            style={{ width:72, accentColor:"#2AB7B7", cursor:"pointer" }}
          />
          <span style={{ fontSize:10, color:"#777", minWidth:26, textAlign:"right" }}>
            {sizes[fieldKey] || DEFAULT_SIZES[fieldKey]}px
          </span>
        </div>
      </div>

      {multiline ? (
        <textarea
          rows={3}
          value={value}
          onChange={e => onChange(e.target.value.toUpperCase())}
          style={{ ...base, resize:"vertical" }}
        />
      ) : (
        <input
          value={value}
          onChange={e => onChange(e.target.value.toUpperCase())}
          style={base}
        />
      )}
    </div>
  );
}

// ─── PEQUEÑOS COMPONENTES ─────────────────────────────────────────────────────
function Toggle({ label, value, onChange }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
      <span style={{ fontSize:13, color:"#aaa" }}>{label}</span>
      <div onClick={() => onChange(!value)} style={{
        width:40, height:22, borderRadius:11,
        background: value ? "#2AB7B7" : "#333",
        position:"relative", cursor:"pointer", transition:"background .2s", flexShrink:0,
      }}>
        <div style={{ position:"absolute", top:3, left: value ? 21 : 3, width:16, height:16, borderRadius:"50%", background:"#fff", transition:"left .2s" }} />
      </div>
    </div>
  );
}

function UploadBtn({ label, onChange, active }) {
  return (
    <label style={{
      display:"block", width:"100%", padding:"9px 0",
      background: active ? "#1e2e2e" : "#1a1a1a",
      border:`1px dashed ${active ? "#2AB7B7" : "#333"}`,
      borderRadius:6, color: active ? "#2AB7B7" : "#666",
      fontSize:12, textAlign:"center", cursor:"pointer", marginBottom:8,
    }}>
      {label}
      <input type="file" accept="image/*" onChange={onChange} style={{ display:"none" }} />
    </label>
  );
}

function Chip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding:"5px 12px", borderRadius:20, fontSize:12,
      border:`1px solid ${active ? "#2AB7B7" : "#2e2e2e"}`,
      background: active ? "#2AB7B7" : "#1a1a1a",
      color: active ? "#000" : "#888",
      fontWeight: active ? 700 : 400,
      cursor:"pointer", transition:"all .15s",
    }}>{label}</button>
  );
}

function Btn({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex:1, padding:"8px 0", borderRadius:6, fontSize:13,
      background: active ? "#2AB7B7" : "#1a1a1a",
      color: active ? "#000" : "#666",
      border:`1px solid ${active ? "#2AB7B7" : "#2e2e2e"}`,
      fontWeight: active ? 700 : 400,
      cursor:"pointer", transition:"all .15s",
    }}>{label}</button>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom:12, background:"#161616", borderRadius:8, border:"1px solid #222", padding:"12px 14px" }}>
      {title && <p style={{ fontSize:10, color:"#555", letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>{title}</p>}
      {children}
    </div>
  );
}

// ─── CONTROLS PANEL ───────────────────────────────────────────────────────────
function ControlsPanel({ form, setForm, format, handleFormatChange, paleta, setPaleta, setTextColors, image, handleImage, logo, handleLogo, setLogo, darkness, setDarkness, showIng, setShowIng, showValido, setShowValido, sizes, setSizes, textColors, positions, setPositions, downloading, downloadHD }) {
  const currentPreset = PRESET_KEYS.find(k => JSON.stringify(PRESETS[k]) === JSON.stringify(form));
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const fp = (label, key, multiline) => ({
    label, fieldKey: key, multiline,
    value: form[key],
    onChange: v => set(key, v),
    sizes, setSizes,
    textColors, setTextColors,
  });

  return (
    <div style={{ padding:"16px 16px 40px" }}>
      <Section title="Preset">
        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
          {PRESET_KEYS.map(k => (
            <Chip key={k} label={PRESET_LABELS[k]} active={currentPreset === k}
              onClick={() => { setForm(PRESETS[k]); setPositions(makeDefaultPos(format === "story")); }} />
          ))}
        </div>
      </Section>

      <Section title="Formato">
        <div style={{ display:"flex", gap:8 }}>
          <Btn label="📱 Story" active={format === "story"} onClick={() => handleFormatChange("story")} />
          <Btn label="🖼 Post"  active={format === "post"}  onClick={() => handleFormatChange("post")} />
        </div>
      </Section>

      <Section title="Paleta de colores">
        <div style={{ display:"flex", gap:8, marginBottom:8 }}>
          {["clasica","noche","fuego"].map(p => (
            <Btn key={p} label={p.charAt(0).toUpperCase()+p.slice(1)} active={paleta === p}
              onClick={() => { setPaleta(p); setTextColors(paletaToColors(p)); }} />
          ))}
        </div>
        <button onClick={() => setTextColors(paletaToColors(paleta))} style={{
          width:"100%", padding:"7px 0",
          background:"#1a1a1a", border:"1px solid #2e2e2e",
          borderRadius:6, color:"#666", fontSize:11, cursor:"pointer", letterSpacing:1,
        }}>
          ↺ Resetear colores de texto
        </button>
      </Section>

      <Section title="Imágenes">
        <UploadBtn label={image ? "✅ Cambiar foto de fondo" : "📷 Subir foto de fondo"} onChange={handleImage} active={!!image} />
        <UploadBtn label={logo  ? "✅ Cambiar logo"          : "🏷 Subir logo (opcional)"} onChange={handleLogo}  active={!!logo} />
        {logo && <button onClick={() => setLogo(null)} style={{ fontSize:11, color:"#e05050", background:"none", border:"none", cursor:"pointer", padding:0 }}>✕ Quitar logo</button>}
      </Section>

      <Section title="Oscuridad de la foto">
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <input type="range" min="0" max="0.9" step="0.05" value={darkness}
            onChange={e => setDarkness(parseFloat(e.target.value))}
            style={{ flex:1, accentColor:"#2AB7B7" }} />
          <span style={{ fontSize:12, color:"#888", minWidth:36, textAlign:"right" }}>{Math.round(darkness*100)}%</span>
        </div>
      </Section>

      <Section title="Textos y tamaños">
        <Field {...fp("Línea 1","linea1")} />
        <Field {...fp("Línea 2 (grande)","linea2")} />
        <Field {...fp("Separador","separador")} />
        <Field {...fp("Título","titulo")} />
        <Field {...fp("Precio / Subtítulo","precio")} />
        <Field {...fp("CTA 1","cta1")} />
        <Field {...fp("CTA 2","cta2")} />
        <Field {...fp("CTA 3 (turquesa)","cta3")} />
      </Section>

      <Section title="Extras">
        <Toggle label="Mostrar ingredientes" value={showIng} onChange={setShowIng} />
        <Field {...fp("Ingredientes (uno por línea)","ingredientes",true)} />
        <div style={{ marginTop:8 }}>
          <Toggle label="Mostrar válido hasta" value={showValido} onChange={setShowValido} />
          <Field {...fp("Texto válido hasta","valido")} />
        </div>
      </Section>

      <Section title="Posiciones">
        <button onClick={() => setPositions(makeDefaultPos(format === "story"))} style={{
          width:"100%", padding:"8px 0",
          background:"#1a1a1a", border:"1px solid #333",
          borderRadius:6, color:"#777", fontSize:12, cursor:"pointer",
        }}>
          ↺ Resetear posiciones
        </button>
        <p style={{ fontSize:10, color:"#444", marginTop:6, textAlign:"center", fontFamily:"sans-serif" }}>
          Arrastrá cualquier texto en el preview
        </p>
      </Section>

      <button onClick={downloadHD} disabled={downloading} style={{
        width:"100%", padding:"13px 0",
        background: downloading ? "#1a3333" : "#2AB7B7",
        color: downloading ? "#555" : "#000",
        border:"none", borderRadius:8,
        fontSize:15, fontWeight:900,
        cursor: downloading ? "not-allowed" : "pointer",
        letterSpacing:1,
      }}>
        {downloading ? "Generando imagen..." : "⬇ Descargar HD"}
      </button>
    </div>
  );
}

// ─── PREVIEW PANEL ────────────────────────────────────────────────────────────
function PreviewPanel({ form, image, logo, format, darkness, showIng, showValido, paleta, previewRef, sizes, positions, setPositions, textColors }) {
  return (
    <div style={{
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      padding:24, background:"#0a0a0a", minHeight:400, height:"100%",
    }}>
      <CanvasPreview
        form={form} image={image} logo={logo}
        format={format} darkness={darkness}
        showIng={showIng} showValido={showValido}
        paleta={paleta} previewRef={previewRef}
        sizes={sizes} positions={positions} setPositions={setPositions}
        textColors={textColors}
      />
      <p style={{ fontSize:10, color:"#444", letterSpacing:2, marginTop:12, fontFamily:"sans-serif" }}>
        PREVIEW · {format === "story" ? "1080×1920" : "1080×1080"}
      </p>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [form, setForm]               = useState(PRESETS.viernes);
  const [image, setImage]             = useState(null);
  const [logo, setLogo]               = useState(null);
  const [format, setFormat]           = useState("story");
  const [darkness, setDarkness]       = useState(0.45);
  const [showIng, setShowIng]         = useState(true);
  const [showValido, setShowValido]   = useState(true);
  const [paleta, setPaleta]           = useState("clasica");
  const [activeTab, setActiveTab]     = useState("controles");
  const [downloading, setDownloading] = useState(false);
  const [sizes, setSizes]             = useState({ ...DEFAULT_SIZES });
  const [positions, setPositions]     = useState(makeDefaultPos(true));
  const [textColors, setTextColors]   = useState(paletaToColors("clasica"));

  const previewRef = useRef();

  const handleFormatChange = (f) => {
    setFormat(f);
    setPositions(makeDefaultPos(f === "story"));
  };

  const handleImage = (e) => { const f = e.target.files[0]; if (f) setImage(URL.createObjectURL(f)); };
  const handleLogo  = (e) => { const f = e.target.files[0]; if (f) setLogo(URL.createObjectURL(f)); };

  const downloadHD = useCallback(async () => {
    if (!previewRef.current) return;
    setDownloading(true);
    try {
      const isStory = format === "story";
      const dataUrl = await toPng(previewRef.current, {
        canvasWidth:  PW * 3,
        canvasHeight: (isStory ? storyH() : postH()) * 3,
        pixelRatio: 3,
      });
      const a = document.createElement("a");
      a.download = `mordelon-${format}-${Date.now()}.png`;
      a.href = dataUrl;
      a.click();
    } finally {
      setDownloading(false);
    }
  }, [format]);

  const sharedProps = {
    form, setForm, format, handleFormatChange,
    paleta, setPaleta, setTextColors,
    image, handleImage, logo, handleLogo, setLogo,
    darkness, setDarkness,
    showIng, setShowIng, showValido, setShowValido,
    sizes, setSizes, textColors,
    positions, setPositions,
    downloading, downloadHD,
  };

  const previewProps = {
    form, image, logo, format, darkness,
    showIng, showValido, paleta, previewRef,
    sizes, positions, setPositions, textColors,
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0e0e0e", color:"#eee" }}>

      <div style={{ background:"#141414", borderBottom:"1px solid #222", padding:"12px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontSize:20, fontWeight:900, color:"#2AB7B7", letterSpacing:1, fontFamily:"'Arial Black',sans-serif" }}>MORDELÓN</div>
          <div style={{ fontSize:10, color:"#555", letterSpacing:2 }}>GENERADOR DE HISTORIAS</div>
        </div>
        <button onClick={downloadHD} disabled={downloading} style={{ background:"#2AB7B7", color:"#000", border:"none", borderRadius:6, padding:"8px 18px", fontWeight:900, fontSize:13, cursor:"pointer" }}>
          ⬇ HD
        </button>
      </div>

      <style>{`
        .mob-tabs { display:flex; }
        .mob-ctrl { display:block; overflow-y:auto; max-height:calc(100vh - 108px); overflow-anchor:none; }
        .mob-prev { display:none; }
        .desk     { display:none; }
        @media(min-width:768px){
          .mob-tabs,.mob-ctrl,.mob-prev { display:none!important; }
          .desk      { display:flex; height:calc(100vh - 57px); }
          .desk-ctrl { width:420px; min-width:340px; overflow-y:auto; border-right:1px solid #1e1e1e; height:100%; overflow-anchor:none; }
          .desk-prev { flex:1; display:flex; align-items:center; justify-content:center; background:#0a0a0a; }
        }
      `}</style>

      <div className="mob-tabs" style={{ borderBottom:"1px solid #1e1e1e", background:"#141414" }}>
        {["controles","preview"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex:1, padding:"11px 0", fontSize:13,
            fontWeight: activeTab === tab ? 700 : 400,
            color: activeTab === tab ? "#2AB7B7" : "#555",
            background:"none", border:"none",
            borderBottomWidth:2, borderBottomStyle:"solid",
            borderBottomColor: activeTab === tab ? "#2AB7B7" : "transparent",
            cursor:"pointer",
          }}>
            {tab === "controles" ? "Controles" : "Preview"}
          </button>
        ))}
      </div>

      <div className="mob-ctrl" style={{ display: activeTab === "controles" ? "block" : "none" }}>
        <ControlsPanel {...sharedProps} />
      </div>
      <div className="mob-prev" style={{ display: activeTab === "preview" ? "flex" : "none", justifyContent:"center", alignItems:"center", minHeight:"calc(100vh - 108px)", background:"#0a0a0a" }}>
        <PreviewPanel {...previewProps} />
      </div>

      <div className="desk">
        <div className="desk-ctrl"><ControlsPanel {...sharedProps} /></div>
        <div className="desk-prev"><PreviewPanel {...previewProps} /></div>
      </div>

    </div>
  );
}
