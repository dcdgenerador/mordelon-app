import { useState, useRef, useCallback, useEffect } from "react";
import { toPng } from "html-to-image";

// ─── PRESETS ─────────────────────────────────────────────────────────────────
const PRESETS = {
  lunes: {
    linea1: "LUNES EN", linea2: "MORDELÓN",
    separador: "EL DÍA IDEAL PARA", titulo: "UN SANGUCHE DE",
    precio: "CARNE MECHADA", ingredientes: "", valido: "",
    cta1: "PORQUE EL LUNES", cta2: "SE BANCA CON", cta3: "MORDELÓN.",
  },
  martes: {
    linea1: "MARTES EN", linea2: "MORDELÓN",
    separador: "EL ANTÍDOTO CONTRA", titulo: "LA SEMANA",
    precio: "LARGA", ingredientes: "", valido: "",
    cta1: "UN MORDISCO Y", cta2: "EL MARTES YA", cta3: "NO DUELE.",
  },
  miercoles: {
    linea1: "MIÉRCOLES EN", linea2: "MORDELÓN",
    separador: "MITAD DE SEMANA", titulo: "MITAD DE",
    precio: "HAMBRE", ingredientes: "", valido: "",
    cta1: "LA OTRA MITAD", cta2: "LA PONÉS", cta3: "VOS.",
  },
  jueves: {
    linea1: "JUEVES EN", linea2: "MORDELÓN",
    separador: "CASI VIERNES", titulo: "MEJOR CON UN",
    precio: "SANGUCHE", ingredientes: "", valido: "",
    cta1: "YA FALTA POCO", cta2: "AGUANTÁ CON", cta3: "MORDELÓN.",
  },
  viernes: {
    linea1: "VIERNES EN", linea2: "MORDELÓN",
    separador: "A PARTIR DE LAS 20HS", titulo: "ARRANCA EL FIN",
    precio: "DE SEMANA", ingredientes: "", valido: "",
    cta1: "PEDÍ AHORA Y", cta2: "NO TE QUEDES", cta3: "CON LAS GANAS.",
  },
  sabado: {
    linea1: "SÁBADO EN", linea2: "MORDELÓN",
    separador: "A PARTIR DEL MEDIODÍA", titulo: "ARRANCA LA PROMO",
    precio: "2 POR $20.000",
    ingredientes: "- Carne desmechada\n- Mozzarella\n- Cebolla caramelizada",
    valido: "VÁLIDO HASTA AGOTAR STOCK",
    cta1: "PEDÍ AHORA Y", cta2: "NO TE QUEDES", cta3: "CON LAS GANAS.",
  },
  domingo: {
    linea1: "DOMINGO EN", linea2: "MORDELÓN",
    separador: "EL MEJOR CIERRE", titulo: "DE LA SEMANA",
    precio: "ES UN MORDISCO", ingredientes: "", valido: "",
    cta1: "MAÑANA ARRANCA", cta2: "TODO DE NUEVO.", cta3: "HOY MORDELÓN.",
  },
  promo: {
    linea1: "HOY EN", linea2: "MORDELÓN",
    separador: "PROMO DEL DÍA", titulo: "2 DE LA CASA",
    precio: "POR $20.000",
    ingredientes: "- Carne desmechada\n- Mozzarella\n- Cebolla caramelizada",
    valido: "VÁLIDO HASTA AGOTAR STOCK",
    cta1: "PEDÍ AHORA Y", cta2: "NO TE QUEDES", cta3: "CON LAS GANAS.",
  },
  smash: {
    linea1: "HOY EN", linea2: "MORDELÓN",
    separador: "EL CLÁSICO DE SIEMPRE", titulo: "SMASH BURGER",
    precio: "DESDE $8.500",
    ingredientes: "- Doble carne smash\n- Cheddar fundido\n- Pickles y mostaza",
    valido: "",
    cta1: "EL SABOR QUE", cta2: "NO TE PODÉS", cta3: "PERDER.",
  },
  combo: {
    linea1: "HOY EN", linea2: "MORDELÓN",
    separador: "COMBO COMPLETO", titulo: "BURGER + PAPAS",
    precio: "+ BEBIDA", ingredientes: "", valido: "VÁLIDO HASTA AGOTAR STOCK",
    cta1: "TODO LO QUE", cta2: "NECESITÁS EN", cta3: "UN SOLO COMBO.",
  },
};

const PALETTES = {
  clasica: { dorado: "#C8991A", fuego: "#DC5014", gris: "#888", whiteDim: "#C8C8C8", turquesa: "#2AB7B7" },
  noche:   { dorado: "#FFFFFF", fuego: "#2AB7B7", gris: "#777", whiteDim: "#B4B4B4", turquesa: "#2AB7B7" },
  fuego:   { dorado: "#FF7800", fuego: "#C81E1E", gris: "#999", whiteDim: "#E6E6E6", turquesa: "#2AB7B7" },
};

const PRESET_KEYS = Object.keys(PRESETS);
const PRESET_LABELS = {
  lunes:"Lunes", martes:"Martes", miercoles:"Miércoles", jueves:"Jueves",
  viernes:"Viernes", sabado:"Sábado", domingo:"Domingo",
  promo:"Promo", smash:"Smash", combo:"Combo",
};

// Tamaños de fuente por defecto para cada campo (en px, sobre preview de 360px)
const DEFAULT_SIZES = {
  linea1: 13, linea2: 36, separador: 10,
  titulo: 16, precio: 24,
  ingredientes: 9, valido: 8,
  cta1: 17, cta2: 17, cta3: 17,
  footer1: 15, footer2: 8,
};

// Posiciones iniciales de cada bloque en el preview (en %, relativo al contenedor)
const DEFAULT_POSITIONS = {
  linea1:      { x: 50, y: 5 },
  linea2:      { x: 50, y: 10 },
  separador:   { x: 50, y: 22 },
  titulo:      { x: 50, y: 40 },
  precio:      { x: 50, y: 48 },
  ingredientes:{ x: 50, y: 57 },
  valido:      { x: 50, y: 67 },
  cta1:        { x: 50, y: 72 },
  cta2:        { x: 50, y: 79 },
  cta3:        { x: 50, y: 86 },
  footer1:     { x: 50, y: 92 },
  footer2:     { x: 50, y: 96 },
};

// ─── DRAGGABLE TEXT en el preview ────────────────────────────────────────────
function DraggableText({ id, text, fontSize, color, bold, positions, setPositions, containerRef }) {
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const elRef = useRef();

  const getXY = () => positions[id] || DEFAULT_POSITIONS[id] || { x: 50, y: 50 };

  const startDrag = (clientX, clientY) => {
    if (!containerRef.current || !elRef.current) return;
    dragging.current = true;
    const rect = containerRef.current.getBoundingClientRect();
    const elRect = elRef.current.getBoundingClientRect();
    // offset from element center
    offset.current = {
      x: clientX - (elRect.left + elRect.width / 2 - rect.left),
      y: clientY - (elRect.top + elRect.height / 2 - rect.top),
    };
  };

  const moveDrag = useCallback((clientX, clientY) => {
    if (!dragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left - offset.current.x) / rect.width) * 100;
    const y = ((clientY - rect.top - offset.current.y) / rect.height) * 100;
    setPositions(p => ({
      ...p,
      [id]: {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      }
    }));
  }, [id, setPositions, containerRef]);

  const stopDrag = () => { dragging.current = false; };

  useEffect(() => {
    const onMouseMove = (e) => moveDrag(e.clientX, e.clientY);
    const onTouchMove = (e) => {
      if (!dragging.current) return;
      e.preventDefault();
      moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onUp = () => stopDrag();

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [moveDrag]);

  if (!text) return null;
  const { x, y } = getXY();

  return (
    <div
      ref={elRef}
      onMouseDown={(e) => { e.preventDefault(); startDrag(e.clientX, e.clientY); }}
      onTouchStart={(e) => { startDrag(e.touches[0].clientX, e.touches[0].clientY); }}
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
        cursor: "grab",
        userSelect: "none",
        whiteSpace: "nowrap",
        color,
        fontSize,
        fontWeight: bold ? 900 : 400,
        fontFamily: "'Arial Black', 'Impact', sans-serif",
        letterSpacing: 1,
        textShadow: "0 1px 4px rgba(0,0,0,0.7)",
        touchAction: "none",
        zIndex: 10,
      }}
    >
      {text}
    </div>
  );
}

// ─── CANVAS PREVIEW ───────────────────────────────────────────────────────────
function CanvasPreview({ form, image, logo, format, darkness, showIng, showValido, paleta, previewRef, sizes, positions, setPositions }) {
  const isStory = format === "story";
  const W = 360;
  const H = isStory ? 640 : 360;
  const pal = PALETTES[paleta] || PALETTES.clasica;
  const containerRef = previewRef;

  const ingredientes = form.ingredientes
    ? form.ingredientes.split("\n").map(s => s.trim()).filter(Boolean)
    : [];

  const dt = (id, text, color, bold) => (
    <DraggableText
      key={id} id={id} text={text}
      fontSize={sizes[id] || DEFAULT_SIZES[id]}
      color={color} bold={bold}
      positions={positions} setPositions={setPositions}
      containerRef={containerRef}
    />
  );

  return (
    <div
      ref={previewRef}
      style={{
        width: W, height: H,
        position: "relative", overflow: "hidden",
        borderRadius: 8, flexShrink: 0,
        background: "#111",
      }}
    >
      {image && (
        <img src={image} alt="" style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover", objectPosition: "center",
          pointerEvents: "none",
        }} />
      )}

      {/* Overlays */}
      <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${darkness})`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "55%", background: "linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, transparent 100%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "55%", background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)", pointerEvents: "none" }} />

      {/* Barra turquesa */}
      <div style={{ position: "absolute", left: 22, top: 44, width: 3, height: isStory ? 90 : 65, background: pal.turquesa, borderRadius: 2, pointerEvents: "none" }} />

      {/* Líneas decorativas */}
      <div style={{ position: "absolute", left: "10%", right: "10%", top: "27%", height: 1.5, background: pal.dorado, pointerEvents: "none" }} />
      <div style={{ position: "absolute", left: "10%", right: "10%", top: "63%", height: 1.5, background: pal.turquesa, pointerEvents: "none" }} />

      {/* Textos arrastrables */}
      {dt("linea1",    form.linea1,    pal.gris,     false)}
      {dt("linea2",    form.linea2,    pal.turquesa, true)}
      {dt("separador", form.separador, "#bbb",       false)}
      {dt("titulo",    form.titulo,    pal.fuego,    true)}
      {dt("precio",    form.precio,    pal.dorado,   true)}
      {showIng && ingredientes.map((ing, i) => (
        <DraggableText
          key={`ing-${i}`} id={`ing-${i}`} text={ing}
          fontSize={sizes.ingredientes || DEFAULT_SIZES.ingredientes}
          color="#bbb" bold={false}
          positions={positions} setPositions={setPositions}
          containerRef={containerRef}
        />
      ))}
      {showValido && dt("valido", form.valido, "#aaa", false)}
      {dt("cta1", form.cta1, "#fff",      true)}
      {dt("cta2", form.cta2, "#fff",      true)}
      {dt("cta3", form.cta3, pal.turquesa, true)}
      {dt("footer1", "MORDELÓN",        pal.turquesa, true)}
      {dt("footer2", "DEL FUEGO AL PAN", pal.gris,    false)}

      {logo && (
        <img src={logo} alt="logo" style={{
          position: "absolute", bottom: 12, left: 16,
          height: isStory ? 32 : 24, objectFit: "contain",
          pointerEvents: "none",
        }} />
      )}

      {/* Hint de arrastre */}
      <div style={{
        position: "absolute", top: 6, right: 8,
        fontSize: 9, color: "rgba(255,255,255,0.35)",
        pointerEvents: "none",
      }}>
        ✥ arrastrá los textos
      </div>
    </div>
  );
}

// ─── FIELD CON SLIDER DE TAMAÑO ───────────────────────────────────────────────
function Field({ label, fieldKey, value, onChange, multiline, sizes, setSizes }) {
  const base = {
    width: "100%", boxSizing: "border-box",
    background: "#1a1a1a", border: "1px solid #2e2e2e",
    borderRadius: 6, color: "#eee",
    padding: "7px 10px", fontSize: 13,
    fontFamily: "monospace",
    resize: "none", outline: "none",
  };

  const handleKey = (e) => {
    // Evitar que el textarea dispare scroll en mobile
    e.stopPropagation();
  };

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
        <label style={{ fontSize: 11, color: "#666", letterSpacing: 0.5, textTransform: "uppercase" }}>
          {label}
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10, color: "#555" }}>tamaño</span>
          <input
            type="range" min="6" max="60" step="1"
            value={sizes[fieldKey] || DEFAULT_SIZES[fieldKey] || 14}
            onChange={e => setSizes(s => ({ ...s, [fieldKey]: parseInt(e.target.value) }))}
            style={{ width: 70, accentColor: "#2AB7B7", cursor: "pointer" }}
          />
          <span style={{ fontSize: 10, color: "#888", minWidth: 22 }}>
            {sizes[fieldKey] || DEFAULT_SIZES[fieldKey]}
          </span>
        </div>
      </div>
      {multiline
        ? (
          <textarea
            rows={3} value={value}
            onChange={e => onChange(e.target.value.toUpperCase())}
            onKeyDown={handleKey}
            style={base}
          />
        )
        : (
          <input
            value={value}
            onChange={e => onChange(e.target.value.toUpperCase())}
            style={base}
          />
        )
      }
    </div>
  );
}

// ─── TOGGLE ───────────────────────────────────────────────────────────────────
function Toggle({ label, value, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
      <span style={{ fontSize: 13, color: "#aaa" }}>{label}</span>
      <div onClick={() => onChange(!value)} style={{
        width: 40, height: 22, borderRadius: 11,
        background: value ? "#2AB7B7" : "#333",
        position: "relative", cursor: "pointer",
        transition: "background .2s", flexShrink: 0,
      }}>
        <div style={{
          position: "absolute", top: 3,
          left: value ? 21 : 3, width: 16, height: 16,
          borderRadius: "50%", background: "#fff",
          transition: "left .2s",
        }} />
      </div>
    </div>
  );
}

function UploadBtn({ label, onChange, active }) {
  return (
    <label style={{
      display: "block", width: "100%", padding: "9px 0",
      background: active ? "#1e2e2e" : "#1a1a1a",
      border: `1px dashed ${active ? "#2AB7B7" : "#333"}`,
      borderRadius: 6, color: active ? "#2AB7B7" : "#666",
      fontSize: 12, textAlign: "center", cursor: "pointer", marginBottom: 8,
    }}>
      {label}
      <input type="file" accept="image/*" onChange={onChange} style={{ display: "none" }} />
    </label>
  );
}

function Chip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "5px 12px", borderRadius: 20, fontSize: 12,
      border: `1px solid ${active ? "#2AB7B7" : "#2e2e2e"}`,
      background: active ? "#2AB7B7" : "#1a1a1a",
      color: active ? "#000" : "#888",
      fontWeight: active ? 700 : 400,
      cursor: "pointer", transition: "all .15s",
    }}>
      {label}
    </button>
  );
}

function Btn({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: "8px 0", borderRadius: 6, fontSize: 13,
      background: active ? "#2AB7B7" : "#1a1a1a",
      color: active ? "#000" : "#666",
      border: `1px solid ${active ? "#2AB7B7" : "#2e2e2e"}`,
      fontWeight: active ? 700 : 400,
      cursor: "pointer", transition: "all .15s",
    }}>
      {label}
    </button>
  );
}

function Section({ title, children }) {
  return (
    <div style={{
      marginBottom: 12, background: "#161616",
      borderRadius: 8, border: "1px solid #222", padding: "12px 14px",
    }}>
      {title && <p style={{ fontSize: 10, color: "#555", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>{title}</p>}
      {children}
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [form, setForm] = useState(PRESETS.viernes);
  const [image, setImage] = useState(null);
  const [logo, setLogo] = useState(null);
  const [format, setFormat] = useState("story");
  const [darkness, setDarkness] = useState(0.45);
  const [showIng, setShowIng] = useState(true);
  const [showValido, setShowValido] = useState(true);
  const [paleta, setPaleta] = useState("clasica");
  const [activeTab, setActiveTab] = useState("controles");
  const [downloading, setDownloading] = useState(false);
  const [sizes, setSizes] = useState({ ...DEFAULT_SIZES });
  const [positions, setPositions] = useState({ ...DEFAULT_POSITIONS });

  const previewRef = useRef();

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const currentPreset = PRESET_KEYS.find(k =>
    JSON.stringify(PRESETS[k]) === JSON.stringify(form)
  );

  const handleImage = (e) => {
    const f = e.target.files[0];
    if (f) setImage(URL.createObjectURL(f));
  };
  const handleLogo = (e) => {
    const f = e.target.files[0];
    if (f) setLogo(URL.createObjectURL(f));
  };

  const resetPositions = () => setPositions({ ...DEFAULT_POSITIONS });

  const downloadHD = useCallback(async () => {
    if (!previewRef.current) return;
    setDownloading(true);
    try {
      const isStory = format === "story";
      const scale = 3;
      const dataUrl = await toPng(previewRef.current, {
        canvasWidth: 360 * scale,
        canvasHeight: (isStory ? 640 : 360) * scale,
        pixelRatio: scale,
      });
      const link = document.createElement("a");
      link.download = `mordelon-${format}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setDownloading(false);
    }
  }, [format]);

  const fieldProps = (label, key, multiline) => ({
    label, fieldKey: key, multiline,
    value: form[key],
    onChange: v => set(key, v),
    sizes, setSizes,
  });

  const ControlsPanel = () => (
    <div style={{ padding: "16px 16px 32px", overflowY: "auto" }}>

      <Section title="Preset">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {PRESET_KEYS.map(k => (
            <Chip key={k} label={PRESET_LABELS[k]} active={currentPreset === k}
              onClick={() => { setForm(PRESETS[k]); setPositions({ ...DEFAULT_POSITIONS }); }} />
          ))}
        </div>
      </Section>

      <Section title="Formato">
        <div style={{ display: "flex", gap: 8 }}>
          <Btn label="📱 Story" active={format === "story"} onClick={() => setFormat("story")} />
          <Btn label="🖼 Post"  active={format === "post"}  onClick={() => setFormat("post")} />
        </div>
      </Section>

      <Section title="Paleta de colores">
        <div style={{ display: "flex", gap: 8 }}>
          {["clasica", "noche", "fuego"].map(p => (
            <Btn key={p} label={p.charAt(0).toUpperCase() + p.slice(1)}
              active={paleta === p} onClick={() => setPaleta(p)} />
          ))}
        </div>
      </Section>

      <Section title="Imágenes">
        <UploadBtn label={image ? "✅ Cambiar foto de fondo" : "📷 Subir foto de fondo"} onChange={handleImage} active={!!image} />
        <UploadBtn label={logo  ? "✅ Cambiar logo"         : "🏷 Subir logo (opcional)"} onChange={handleLogo}  active={!!logo} />
        {logo && (
          <button onClick={() => setLogo(null)} style={{ fontSize: 11, color: "#e05050", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            ✕ Quitar logo
          </button>
        )}
      </Section>

      <Section title="Oscuridad de la foto">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input type="range" min="0" max="0.9" step="0.05" value={darkness}
            onChange={e => setDarkness(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: "#2AB7B7" }} />
          <span style={{ fontSize: 12, color: "#888", minWidth: 36, textAlign: "right" }}>
            {Math.round(darkness * 100)}%
          </span>
        </div>
      </Section>

      <Section title="Textos y tamaños">
        <Field {...fieldProps("Línea 1", "linea1")} />
        <Field {...fieldProps("Línea 2 (grande)", "linea2")} />
        <Field {...fieldProps("Separador", "separador")} />
        <Field {...fieldProps("Título", "titulo")} />
        <Field {...fieldProps("Precio / Subtítulo", "precio")} />
        <Field {...fieldProps("CTA 1", "cta1")} />
        <Field {...fieldProps("CTA 2", "cta2")} />
        <Field {...fieldProps("CTA 3 (turquesa)", "cta3")} />
      </Section>

      <Section title="Extras">
        <Toggle label="Mostrar ingredientes" value={showIng} onChange={setShowIng} />
        <Field {...fieldProps("Ingredientes (uno por línea)", "ingredientes", true)} />
        <div style={{ marginTop: 8 }}>
          <Toggle label="Mostrar válido hasta" value={showValido} onChange={setShowValido} />
          <Field {...fieldProps("Texto válido hasta", "valido")} />
        </div>
      </Section>

      <Section title="Posición de textos">
        <button onClick={resetPositions} style={{
          width: "100%", padding: "8px 0",
          background: "#1a1a1a", border: "1px solid #333",
          borderRadius: 6, color: "#888", fontSize: 12, cursor: "pointer",
        }}>
          ↺ Resetear posiciones al default
        </button>
        <p style={{ fontSize: 10, color: "#444", marginTop: 6, textAlign: "center" }}>
          Hacé click y arrastrá cualquier texto en el preview
        </p>
      </Section>

      <button onClick={downloadHD} disabled={downloading} style={{
        width: "100%", padding: "13px 0",
        background: downloading ? "#1a3333" : "#2AB7B7",
        color: downloading ? "#555" : "#000",
        border: "none", borderRadius: 8,
        fontSize: 15, fontWeight: 900,
        cursor: downloading ? "not-allowed" : "pointer",
        letterSpacing: 1, transition: "all .2s",
      }}>
        {downloading ? "Generando imagen..." : "⬇ Descargar HD"}
      </button>
    </div>
  );

  const PreviewPanel = () => (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: 24, background: "#0a0a0a", minHeight: 400, height: "100%",
    }}>
      <CanvasPreview
        form={form} image={image} logo={logo}
        format={format} darkness={darkness}
        showIng={showIng} showValido={showValido}
        paleta={paleta} previewRef={previewRef}
        sizes={sizes} positions={positions} setPositions={setPositions}
      />
      <p style={{ fontSize: 10, color: "#444", letterSpacing: 2, marginTop: 12 }}>
        PREVIEW · {format === "story" ? "1080×1920" : "1080×1080"}
      </p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0e0e0e", color: "#eee" }}>

      {/* Header */}
      <div style={{
        background: "#141414", borderBottom: "1px solid #222",
        padding: "12px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#2AB7B7", letterSpacing: 1, fontFamily: "'Arial Black', sans-serif" }}>
            MORDELÓN
          </div>
          <div style={{ fontSize: 10, color: "#555", letterSpacing: 2 }}>GENERADOR DE HISTORIAS</div>
        </div>
        <button onClick={downloadHD} disabled={downloading} style={{
          background: "#2AB7B7", color: "#000", border: "none",
          borderRadius: 6, padding: "8px 18px", fontWeight: 900, fontSize: 13, cursor: "pointer",
        }}>
          ⬇ HD
        </button>
      </div>

      <style>{`
        .mob-tabs { display: flex; }
        .mob-ctrl { display: block; overflow-y: auto; max-height: calc(100vh - 108px); }
        .mob-prev { display: none; }
        .desk { display: none; }
        @media (min-width: 768px) {
          .mob-tabs, .mob-ctrl, .mob-prev { display: none !important; }
          .desk { display: flex; height: calc(100vh - 57px); }
          .desk-ctrl { width: 420px; min-width: 340px; overflow-y: auto; border-right: 1px solid #1e1e1e; height: 100%; }
          .desk-prev { flex: 1; display: flex; align-items: center; justify-content: center; background: #0a0a0a; }
        }
      `}</style>

      {/* MOBILE TABS */}
      <div className="mob-tabs" style={{ display: "flex", borderBottom: "1px solid #1e1e1e", background: "#141414" }}>
        {["controles", "preview"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: "11px 0", fontSize: 13,
            fontWeight: activeTab === tab ? 700 : 400,
            color: activeTab === tab ? "#2AB7B7" : "#555",
            background: "none", border: "none",
            borderBottomWidth: 2, borderBottomStyle: "solid",
            borderBottomColor: activeTab === tab ? "#2AB7B7" : "transparent",
            cursor: "pointer",
          }}>
            {tab === "controles" ? "Controles" : "Preview"}
          </button>
        ))}
      </div>

      <div className="mob-ctrl" style={{ display: activeTab === "controles" ? "block" : "none" }}>
        <ControlsPanel />
      </div>
      <div className="mob-prev" style={{
        display: activeTab === "preview" ? "flex" : "none",
        justifyContent: "center", alignItems: "center",
        minHeight: "calc(100vh - 108px)", background: "#0a0a0a",
      }}>
        <PreviewPanel />
      </div>

      {/* DESKTOP */}
      <div className="desk">
        <div className="desk-ctrl"><ControlsPanel /></div>
        <div className="desk-prev"><PreviewPanel /></div>
      </div>
    </div>
  );
}
