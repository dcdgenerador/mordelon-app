import { useState, useRef, useCallback } from "react";
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

// ─── PALETTES ─────────────────────────────────────────────────────────────────
const PALETTES = {
  clasica: { dorado: "#C8991A", fuego: "#DC5014", gris: "#888", whiteDim: "#C8C8C8", turquesa: "#2AB7B7" },
  noche:   { dorado: "#FFFFFF", fuego: "#2AB7B7", gris: "#777", whiteDim: "#B4B4B4", turquesa: "#2AB7B7" },
  fuego:   { dorado: "#FF7800", fuego: "#C81E1E", gris: "#999", whiteDim: "#E6E6E6", turquesa: "#2AB7B7" },
};

const PRESET_KEYS = Object.keys(PRESETS);
const PRESET_LABELS = {
  lunes: "Lunes", martes: "Martes", miercoles: "Miércoles", jueves: "Jueves",
  viernes: "Viernes", sabado: "Sábado", domingo: "Domingo",
  promo: "Promo", smash: "Smash", combo: "Combo",
};

// ─── CANVAS PREVIEW ───────────────────────────────────────────────────────────
function CanvasPreview({ form, image, logo, format, darkness, showIng, showValido, paleta, previewRef }) {
  const isStory = format === "story";
  const W = 360;
  const H = isStory ? 640 : 360;
  const pal = PALETTES[paleta] || PALETTES.clasica;

  const ingredientes = form.ingredientes
    ? form.ingredientes.split("\n").map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <div
      ref={previewRef}
      style={{
        width: W, height: H,
        position: "relative", overflow: "hidden",
        borderRadius: 8, flexShrink: 0,
        fontFamily: "'Arial Black', 'Impact', sans-serif",
        background: "#111",
      }}
    >
      {image && (
        <img src={image} alt="" style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover", objectPosition: "center",
        }} />
      )}

      <div style={{
        position: "absolute", inset: 0,
        background: `rgba(0,0,0,${darkness})`,
      }} />
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "55%",
        background: "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)",
      }} />
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "55%",
        background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)",
      }} />

      {/* Barra turquesa lateral */}
      <div style={{
        position: "absolute", left: 22, top: 44, width: 3,
        height: isStory ? 95 : 72,
        background: pal.turquesa, borderRadius: 2,
      }} />

      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        justifyContent: "space-between",
        padding: isStory ? "20px 28px 18px" : "14px 22px 14px",
        color: "#fff", textAlign: "center",
      }}>
        {/* TOP */}
        <div>
          <p style={{ margin: 0, fontSize: isStory ? 13 : 10, color: pal.gris, letterSpacing: 2, fontWeight: 400 }}>
            {form.linea1}
          </p>
          <p style={{ margin: "2px 0 4px", fontSize: isStory ? 36 : 27, color: pal.turquesa, fontWeight: 900, letterSpacing: 1 }}>
            {form.linea2}
          </p>
          <div style={{ height: 1.5, background: pal.dorado, margin: "4px 0" }} />
          <p style={{ margin: 0, fontSize: isStory ? 10 : 8, color: "#bbb", letterSpacing: 1.5 }}>
            {form.separador}
          </p>
        </div>

        {/* MIDDLE */}
        <div>
          <p style={{ margin: "0 0 2px", fontSize: isStory ? 16 : 12, color: pal.fuego, fontWeight: 900, letterSpacing: 1 }}>
            {form.titulo}
          </p>
          <p style={{ margin: 0, fontSize: isStory ? 24 : 18, color: pal.dorado, fontWeight: 900 }}>
            {form.precio}
          </p>
          {showIng && ingredientes.length > 0 && (
            <>
              <div style={{ height: 1, background: "#333", margin: "5px 0" }} />
              {ingredientes.map((ing, i) => (
                <p key={i} style={{ margin: "1px 0", fontSize: isStory ? 9 : 7, color: "#bbb", textAlign: "left", paddingLeft: 10 }}>
                  {ing}
                </p>
              ))}
            </>
          )}
        </div>

        {/* BOTTOM */}
        <div style={{ position: "relative" }}>
          <div style={{ height: 1.5, background: pal.turquesa, margin: "4px 0 6px" }} />
          {showValido && form.valido && (
            <p style={{ margin: "0 0 3px", fontSize: isStory ? 8 : 6, color: "#aaa", letterSpacing: 1 }}>
              {form.valido}
            </p>
          )}
          <p style={{ margin: 0, fontSize: isStory ? 17 : 13, color: "#fff", fontWeight: 900 }}>{form.cta1}</p>
          <p style={{ margin: 0, fontSize: isStory ? 17 : 13, color: "#fff", fontWeight: 900 }}>{form.cta2}</p>
          <p style={{ margin: "1px 0 6px", fontSize: isStory ? 17 : 13, color: pal.turquesa, fontWeight: 900 }}>{form.cta3}</p>
          <div style={{ height: 1, background: "#333", margin: "4px 0 5px" }} />
          <p style={{ margin: 0, fontSize: isStory ? 15 : 11, color: pal.turquesa, fontWeight: 900 }}>MORDELÓN</p>
          <p style={{ margin: 0, fontSize: isStory ? 8 : 6, color: pal.gris, letterSpacing: 1 }}>DEL FUEGO AL PAN</p>

          {logo && (
            <img src={logo} alt="logo" style={{
              position: "absolute",
              bottom: isStory ? 0 : 0,
              left: 0,
              height: isStory ? 32 : 24,
              objectFit: "contain",
            }} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── FIELD ────────────────────────────────────────────────────────────────────
function Field({ label, value, onChange, multiline }) {
  const base = {
    width: "100%", boxSizing: "border-box",
    background: "#1a1a1a", border: "1px solid #2e2e2e",
    borderRadius: 6, color: "#eee",
    padding: "7px 10px", fontSize: 13,
    fontFamily: "monospace",
    resize: multiline ? "vertical" : "none",
    outline: "none",
  };
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ fontSize: 11, color: "#666", display: "block", marginBottom: 3, letterSpacing: 0.5, textTransform: "uppercase" }}>
        {label}
      </label>
      {multiline
        ? <textarea rows={3} value={value} onChange={e => onChange(e.target.value.toUpperCase())} style={base} />
        : <input value={value} onChange={e => onChange(e.target.value.toUpperCase())} style={base} />
      }
    </div>
  );
}

// ─── TOGGLE ───────────────────────────────────────────────────────────────────
function Toggle({ label, value, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
      <span style={{ fontSize: 13, color: "#aaa" }}>{label}</span>
      <div
        onClick={() => onChange(!value)}
        style={{
          width: 40, height: 22, borderRadius: 11,
          background: value ? "#2AB7B7" : "#333",
          position: "relative", cursor: "pointer",
          transition: "background .2s", flexShrink: 0,
        }}
      >
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

// ─── UPLOAD BUTTON ────────────────────────────────────────────────────────────
function UploadBtn({ label, onChange, active }) {
  return (
    <label style={{
      display: "block", width: "100%", padding: "9px 0",
      background: active ? "#1e2e2e" : "#1a1a1a",
      border: `1px dashed ${active ? "#2AB7B7" : "#333"}`,
      borderRadius: 6, color: active ? "#2AB7B7" : "#666",
      fontSize: 12, textAlign: "center", cursor: "pointer",
      marginBottom: 8,
    }}>
      {label}
      <input type="file" accept="image/*" onChange={onChange} style={{ display: "none" }} />
    </label>
  );
}

// ─── CHIP ─────────────────────────────────────────────────────────────────────
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

// ─── BTN ──────────────────────────────────────────────────────────────────────
function Btn({ label, active, onClick, full }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, width: full ? "100%" : undefined,
      padding: "8px 0", borderRadius: 6, fontSize: 13,
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

// ─── SECTION ──────────────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div style={{
      marginBottom: 12, background: "#161616",
      borderRadius: 8, border: "1px solid #222",
      padding: "12px 14px",
    }}>
      {title && (
        <p style={{ fontSize: 10, color: "#555", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>
          {title}
        </p>
      )}
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

  const ControlsPanel = () => (
    <div style={{ padding: "16px 16px 32px", overflowY: "auto" }}>

      <Section title="Preset">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {PRESET_KEYS.map(k => (
            <Chip key={k} label={PRESET_LABELS[k]} active={currentPreset === k}
              onClick={() => setForm(PRESETS[k])} />
          ))}
        </div>
      </Section>

      <Section title="Formato">
        <div style={{ display: "flex", gap: 8 }}>
          <Btn label="📱 Story" active={format === "story"} onClick={() => setFormat("story")} />
          <Btn label="🖼 Post" active={format === "post"} onClick={() => setFormat("post")} />
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
        <UploadBtn
          label={image ? "✅ Cambiar foto de fondo" : "📷 Subir foto de fondo"}
          onChange={handleImage} active={!!image}
        />
        <UploadBtn
          label={logo ? "✅ Cambiar logo" : "🏷 Subir logo (opcional)"}
          onChange={handleLogo} active={!!logo}
        />
        {logo && (
          <button onClick={() => setLogo(null)} style={{
            fontSize: 11, color: "#e05050", background: "none",
            border: "none", cursor: "pointer", padding: 0,
          }}>
            ✕ Quitar logo
          </button>
        )}
      </Section>

      <Section title="Oscuridad de la foto">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input
            type="range" min="0" max="0.9" step="0.05"
            value={darkness}
            onChange={e => setDarkness(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: "#2AB7B7" }}
          />
          <span style={{ fontSize: 12, color: "#888", minWidth: 36, textAlign: "right" }}>
            {Math.round(darkness * 100)}%
          </span>
        </div>
      </Section>

      <Section title="Textos principales">
        <Field label="Línea 1" value={form.linea1} onChange={v => set("linea1", v)} />
        <Field label="Línea 2 (grande)" value={form.linea2} onChange={v => set("linea2", v)} />
        <Field label="Separador" value={form.separador} onChange={v => set("separador", v)} />
        <Field label="Título" value={form.titulo} onChange={v => set("titulo", v)} />
        <Field label="Precio / Subtítulo" value={form.precio} onChange={v => set("precio", v)} />
        <Field label="CTA 1" value={form.cta1} onChange={v => set("cta1", v)} />
        <Field label="CTA 2" value={form.cta2} onChange={v => set("cta2", v)} />
        <Field label="CTA 3 (turquesa)" value={form.cta3} onChange={v => set("cta3", v)} />
      </Section>

      <Section title="Extras">
        <Toggle label="Mostrar ingredientes" value={showIng} onChange={setShowIng} />
        <Field label="Ingredientes (uno por línea)" value={form.ingredientes}
          onChange={v => set("ingredientes", v)} multiline />
        <div style={{ marginTop: 8 }}>
          <Toggle label="Mostrar válido hasta" value={showValido} onChange={setShowValido} />
          <Field label="Texto válido hasta" value={form.valido} onChange={v => set("valido", v)} />
        </div>
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
          <div style={{
            fontSize: 20, fontWeight: 900, color: "#2AB7B7",
            letterSpacing: 1, fontFamily: "'Arial Black', sans-serif",
          }}>
            MORDELÓN
          </div>
          <div style={{ fontSize: 10, color: "#555", letterSpacing: 2 }}>
            GENERADOR DE HISTORIAS
          </div>
        </div>
        <button onClick={downloadHD} disabled={downloading} style={{
          background: "#2AB7B7", color: "#000", border: "none",
          borderRadius: 6, padding: "8px 18px",
          fontWeight: 900, fontSize: 13, cursor: "pointer",
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
          .desk {
            display: flex;
            height: calc(100vh - 57px);
          }
          .desk-ctrl {
            width: 400px; min-width: 320px;
            overflow-y: auto;
            border-right: 1px solid #1e1e1e;
            height: 100%;
          }
          .desk-prev {
            flex: 1;
            display: flex; align-items: center; justify-content: center;
            background: #0a0a0a;
          }
        }
      `}</style>

      {/* MOBILE TABS */}
      <div className="mob-tabs" style={{
        display: "flex", borderBottom: "1px solid #1e1e1e",
        background: "#141414",
      }}>
        {["controles", "preview"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: "11px 0",
            fontSize: 13, fontWeight: activeTab === tab ? 700 : 400,
            color: activeTab === tab ? "#2AB7B7" : "#555",
            borderBottom: `2px solid ${activeTab === tab ? "#2AB7B7" : "transparent"}`,
            background: "none", border: "none",
            borderBottomWidth: 2, borderBottomStyle: "solid",
            borderBottomColor: activeTab === tab ? "#2AB7B7" : "transparent",
            cursor: "pointer", textTransform: "capitalize",
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
