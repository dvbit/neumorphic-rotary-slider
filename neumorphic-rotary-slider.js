"use strict";
/**
 * Neumorphic Rotary Slider Card  v2.0
 * ──────────────────────────────────
 * A circular knob-style card for Home Assistant.
 * Compatible with the Neumorphic theme (etnlbck/hacs-neumorphic-template).
 *
 * Every text label is independently optional and fully typographically
 * configurable via a LabelConfig sub-object.
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │  FULL CONFIG REFERENCE                                      │
 * │                                                             │
 * │  type: custom:neumorphic-rotary-slider                      │
 * │  entity: input_number.living_room_temp                      │
 * │  attribute: ~            # optional HA attribute override   │
 * │  min: 16                 # range minimum (default 0)        │
 * │  max: 28                 # range maximum (default 100)      │
 * │  step: 0.5               # snap step    (default 1)         │
 * │  unit: "°C"              # appended to value display        │
 * │  service: input_number.set_value                            │
 * │  service_data_key: value                                    │
 * │  scale: 1                # multiply before calling service  │
 * │                                                             │
 * │  # Each label block is OPTIONAL.                            │
 * │  # Omit the block entirely to hide the label.               │
 * │  # All sub-keys within a block are also optional.           │
 * │                                                             │
 * │  title_label:            # top heading                      │
 * │    text: Temperature     # override display text            │
 * │    show: true            # false hides it  (default true)   │
 * │    font: sans-serif      # CSS font-family                  │
 * │    size: 13px            # CSS font-size                    │
 * │    color: "#888888"      # CSS color                        │
 * │    weight: 400           # CSS font-weight                  │
 * │    transform: uppercase  # CSS text-transform               │
 * │    spacing: 0.08em       # CSS letter-spacing               │
 * │                                                             │
 * │  value_label:            # current value, centre-bottom     │
 * │    show: true                                               │
 * │    font: ~               # inherits primary font            │
 * │    size: 22px                                               │
 * │    color: ~              # inherits --primary-text-color    │
 * │    weight: 500                                              │
 * │                                                             │
 * │  min_label:              # bottom-left                      │
 * │    show: true                                               │
 * │    text: "Low"           # override; default = numeric min  │
 * │    size: 11px                                               │
 * │    color: ~                                                 │
 * │                                                             │
 * │  max_label:              # bottom-right                     │
 * │    show: true                                               │
 * │    text: "High"          # override; default = numeric max  │
 * │    size: 11px                                               │
 * │    color: ~                                                 │
 * └─────────────────────────────────────────────────────────────┘
 */
var _a;
var _b;
// ── Palettes ──────────────────────────────────────────────────────────────────
const DARK_PALETTE = {
    bg: "#23272e",
    shadowDark: "#181a1f",
    shadowLight: "#2c3140",
    track: "#1a1d23",
    accent1: "#2196f3",
    accent2: "#32d48e",
    handleBg: "#2a2f3a",
    handleDot: "#32d48e",
    innerBorder: "rgba(44,49,64,0.7)",
    textMuted: "#888888",
    textPrimary: "#e0e0e0",
    glow: "#2196f3", // blue glow behind handle in dark mode
};
const LIGHT_PALETTE = {
    bg: "#e0e0e0",
    shadowDark: "#bebebe",
    shadowLight: "#ffffff",
    track: "#c8c8c8",
    accent1: "#a3b1c6",
    accent2: "#7b8fa8",
    handleBg: "#d6d6d6",
    handleDot: "#a3b1c6",
    innerBorder: "rgba(180,180,180,0.5)",
    textMuted: "#888888",
    textPrimary: "#333333",
    glow: "#a3b1c6", // soft blue-grey glow in light mode
};
// ── Dark-mode detection ───────────────────────────────────────────────────────
function resolveIsDark(hass) {
    var _a, _b, _c, _d;
    if (((_a = hass === null || hass === void 0 ? void 0 : hass.themes) === null || _a === void 0 ? void 0 : _a.darkMode) === true)
        return true;
    if (((_b = hass === null || hass === void 0 ? void 0 : hass.themes) === null || _b === void 0 ? void 0 : _b.darkMode) === false)
        return false;
    if (document.documentElement.classList.contains("dark"))
        return true;
    if (document.documentElement.classList.contains("light"))
        return false;
    const cssVar = getComputedStyle(document.documentElement)
        .getPropertyValue("--primary-background-color").trim();
    if (cssVar) {
        const lum = hexLuminance(cssVar);
        if (lum !== null)
            return lum < 0.4;
    }
    return (_d = (_c = window.matchMedia) === null || _c === void 0 ? void 0 : _c.call(window, "(prefers-color-scheme: dark)").matches) !== null && _d !== void 0 ? _d : true;
}
function hexLuminance(hex) {
    const clean = hex.replace("#", "").trim();
    let r, g, b;
    if (clean.length === 3) {
        r = parseInt(clean[0] + clean[0], 16);
        g = parseInt(clean[1] + clean[1], 16);
        b = parseInt(clean[2] + clean[2], 16);
    }
    else if (clean.length === 6) {
        r = parseInt(clean.slice(0, 2), 16);
        g = parseInt(clean.slice(2, 4), 16);
        b = parseInt(clean.slice(4, 6), 16);
    }
    else {
        return null;
    }
    if (isNaN(r) || isNaN(g) || isNaN(b))
        return null;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}
/** Convert a hex colour + alpha [0..1] to a CSS rgba() string. */
function hexAlpha(hex, alpha) {
    const clean = hex.replace("#", "").trim();
    let r, g, b;
    if (clean.length === 3) {
        r = parseInt(clean[0] + clean[0], 16);
        g = parseInt(clean[1] + clean[1], 16);
        b = parseInt(clean[2] + clean[2], 16);
    }
    else {
        r = parseInt(clean.slice(0, 2), 16);
        g = parseInt(clean.slice(2, 4), 16);
        b = parseInt(clean.slice(4, 6), 16);
    }
    return `rgba(${r},${g},${b},${alpha})`;
}
/**
 * Linearly interpolate between two hex colours.
 * t = 0 returns colorA, t = 1 returns colorB.
 * Used to colour each dial tick according to its position along the arc.
 */
function hexLerp(colorA, colorB, t) {
    function parse(hex) {
        const c = hex.replace("#", "").trim();
        if (c.length === 3)
            return [
                parseInt(c[0] + c[0], 16),
                parseInt(c[1] + c[1], 16),
                parseInt(c[2] + c[2], 16),
            ];
        return [
            parseInt(c.slice(0, 2), 16),
            parseInt(c.slice(2, 4), 16),
            parseInt(c.slice(4, 6), 16),
        ];
    }
    const [r1, g1, b1] = parse(colorA);
    const [r2, g2, b2] = parse(colorB);
    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);
    return `rgb(${r},${g},${b})`;
}
// ── Label helpers ─────────────────────────────────────────────────────────────
/** Returns false only when the user explicitly wrote `show: false`. */
function labelVisible(cfg) {
    if (cfg === undefined)
        return true; // block present but no show key → visible
    return cfg.show !== false;
}
/**
 * Apply a LabelConfig's typography overrides to a DOM element.
 * Only properties explicitly set in the config are written; everything
 * else falls back to the CSS class defaults already on the element.
 */
function applyTypography(el, cfg) {
    if (!cfg)
        return;
    // Use != null (not truthiness) so "0px", weight:0, empty-reset all work correctly
    if (cfg.font != null)
        el.style.fontFamily = cfg.font;
    if (cfg.size != null)
        el.style.fontSize = cfg.size;
    if (cfg.color != null)
        el.style.color = cfg.color;
    if (cfg.weight != null)
        el.style.fontWeight = String(cfg.weight);
    if (cfg.transform != null)
        el.style.textTransform = cfg.transform;
    if (cfg.spacing != null)
        el.style.letterSpacing = cfg.spacing;
}
// ── Card ──────────────────────────────────────────────────────────────────────
class NeumorphicRotarySliderCard extends HTMLElement {
    constructor() {
        super(...arguments);
        this._hass = null;
        this._config = null;
        this._canvas = null;
        this._isDark = true;
        this._value = 0;
        this._dragging = false;
        this._rafPending = false;
        // _commitTimer removed — service call fires synchronously on pointer release
        /**
         * The scaled value we most recently sent to HA (i.e. what callService used).
         * null means no pending command.
         *
         * _syncFromEntity compares every incoming HA state against this value:
         *   - If it matches → Alexa confirmed our command → accept it, clear pending.
         *   - If it differs → stale update (old value still echoing back) → ignore it.
         *
         * This is robust regardless of cloud round-trip time: we never rely on a
         * fixed timeout, we simply wait until HA reports exactly what we asked for.
         */
        this._pendingScaled = null;
        this._themeObserver = null;
        // ── Pointer events ────────────────────────────────────────────────────────
        this._onPointerDown = (e) => {
            if (!this._isOnHandle(e))
                return;
            this._dragging = true;
            this._canvas.setPointerCapture(e.pointerId);
            e.preventDefault();
        };
        this._onPointerMove = (e) => {
            if (!this._dragging)
                return;
            this._value = this._valueFromPointer(e);
            this._scheduleDraw();
            e.preventDefault();
        };
        this._onPointerUp = (_e) => {
            if (!this._dragging)
                return;
            this._dragging = false;
            // 1. Snap _value to step and compute the exact scaled value we will send.
            //    Do this synchronously so _pendingScaled is set BEFORE any HA state
            //    update can arrive — no race condition regardless of how fast the user
            //    releases or how quickly Alexa echoes back the old state.
            if (!this._config)
                return;
            const { min = 0, max = 100, step = 1, scale = 1 } = this._config;
            let raw = min + this._value * (max - min);
            raw = Math.round(raw / step) * step;
            this._value = (raw - min) / (max - min);
            this._pendingScaled = parseFloat((raw * scale).toFixed(6));
            // 2. Redraw immediately at the snapped position.
            this._scheduleDraw();
            // 3. Fire the service call — no debounce needed since pointerup/cancel are
            //    on window and can only fire once per gesture.
            this._commitValue();
        };
    }
    // ── Geometry — all derived from card_size ──────────────────────────────────
    //
    // card_size  = CSS diameter display diameter of the canvas element (default 220px).
    // W (bitmap) = card_size + 40px bleed margin so the glow can extend outside
    //              the disc without hitting the bitmap edge.
    // All other dimensions scale linearly with card_size so the card looks
    // identical regardless of size — just bigger or smaller.
    //
    // ── Angle helpers ─────────────────────────────────────────────────────────
    //
    // User space  : 0° = bottom (6 o'clock), clockwise positive.
    // Canvas space: 0° = right  (3 o'clock), clockwise positive (y-axis down).
    //
    // Conversion: canvas_rad = user_deg * (π/180) + π/2
    //   because canvas 0° is 90° ahead of user 0° (bottom).
    //
    // Verified:  user 45°  → canvas π*0.75 = current START_ANG  ✓
    //            user 315° → canvas π*2.25 = current END_ANG    ✓
    _degToRad(userDeg) {
        return userDeg * Math.PI / 180 + Math.PI / 2;
    }
    /** Canvas start angle for the MIN position. */
    get START_ANG() {
        var _a, _b, _c, _d;
        const zero = (_b = (_a = this._config) === null || _a === void 0 ? void 0 : _a.zero_angle) !== null && _b !== void 0 ? _b : 0;
        const min = (_d = (_c = this._config) === null || _c === void 0 ? void 0 : _c.min_angle) !== null && _d !== void 0 ? _d : 45;
        return this._degToRad(zero + min);
    }
    /** Canvas end angle for the MAX position. Always > START_ANG (clockwise). */
    get END_ANG() {
        var _a, _b, _c, _d, _f, _g;
        const zero = (_b = (_a = this._config) === null || _a === void 0 ? void 0 : _a.zero_angle) !== null && _b !== void 0 ? _b : 0;
        const minDeg = (_d = (_c = this._config) === null || _c === void 0 ? void 0 : _c.min_angle) !== null && _d !== void 0 ? _d : 45;
        let maxDeg = (_g = (_f = this._config) === null || _f === void 0 ? void 0 : _f.max_angle) !== null && _g !== void 0 ? _g : 315;
        // Ensure the arc goes clockwise: if max ≤ min, wrap max by adding 360°
        if (maxDeg <= minDeg)
            maxDeg += 360;
        return this._degToRad(zero + maxDeg);
    }
    /** Card size: CSS display diameter in px. Clamped 100–400. */
    get KS() { var _a, _b; return Math.max(100, Math.min(400, (_b = (_a = this._config) === null || _a === void 0 ? void 0 : _a.card_size) !== null && _b !== void 0 ? _b : 220)); }
    /** Canvas bitmap side length = display size + 40px bleed margin. */
    get W() { return this.KS + 40; }
    /** Canvas centre coordinates. */
    get CX() { return this.W / 2; }
    get CY() { return this.W / 2; }
    /** Disc radius scales with card_size; user override clamped within safe range. */
    get DISC_R() {
        var _a, _b;
        const def = Math.round(this.KS * 0.432); // 95/220 ≈ 0.432
        return Math.max(40, Math.min(this.KS * 0.52, (_b = (_a = this._config) === null || _a === void 0 ? void 0 : _a.disc_radius) !== null && _b !== void 0 ? _b : def));
    }
    /** Handle radius scales with card_size; user override clamped. */
    get HANDLE_R() {
        var _a, _b;
        const def = Math.round(this.KS * 0.10); // 22/220 ≈ 0.10
        return Math.max(6, Math.min(this.KS * 0.18, (_b = (_a = this._config) === null || _a === void 0 ? void 0 : _a.handle_radius) !== null && _b !== void 0 ? _b : def));
    }
    /** Glow intensity 0–1, default 0.65. */
    get GLOW_INT() { var _a, _b; return Math.max(0, Math.min(1, (_b = (_a = this._config) === null || _a === void 0 ? void 0 : _a.glow_intensity) !== null && _b !== void 0 ? _b : 0.65)); }
    /** Scale factor relative to the default 220px design. Used to scale fixed px values. */
    get SCALE() { return this.KS / 220; }
    // Keep OUTER_R / INNER_R as aliases so nothing else breaks
    get OUTER_R() { return this.DISC_R; }
    get INNER_R() { return this.DISC_R; }
    // ── Lifecycle ──────────────────────────────────────────────────────────────
    connectedCallback() {
        this._build();
        this._applyLabelConfig(); // config arrived before DOM — apply now
        this._attachEvents();
        this._watchTheme();
        this._isDark = resolveIsDark(this._hass);
        this._scheduleDraw();
    }
    disconnectedCallback() {
        var _a;
        this._detachEvents();
        (_a = this._themeObserver) === null || _a === void 0 ? void 0 : _a.disconnect();
        this._themeObserver = null;
    }
    // ── HA interface ───────────────────────────────────────────────────────────
    setConfig(config) {
        if (!config.entity)
            throw new Error("neumorphic-rotary-slider: 'entity' is required");
        this._config = Object.assign({ min: 0, max: 100, step: 1, unit: "", service_data_key: "value", scale: 1 }, config);
        // Re-apply style (sizes may have changed) and label config
        if (this.shadowRoot) {
            this._updateStyle();
            // Sync canvas element size in case card_size changed
            if (this._canvas) {
                this._canvas.width = this.W;
                this._canvas.height = this.W;
                this._canvas.style.width = this.KS + "px";
                this._canvas.style.height = this.KS + "px";
            }
            // Sync center overlay size
            const cw = this.shadowRoot.getElementById("value-center-wrap");
            if (cw) {
                cw.style.width = this.KS + "px";
                cw.style.height = this.KS + "px";
            }
            this._applyLabelConfig();
        }
    }
    set hass(hass) {
        this._hass = hass;
        this._isDark = resolveIsDark(hass);
        this._syncFromEntity();
        this._scheduleDraw();
    }
    // ── DOM build ─────────────────────────────────────────────────────────────
    //
    // Structure (inside shadow root):
    //
    //  ha-card
    //  ├── div.title          ← top heading
    //  └── div.knob-wrap
    //      ├── canvas
    //      ├── div.range-row
    //      │   ├── span#min-display   ← bottom-left
    //      │   └── span#max-display   ← bottom-right
    //      └── div.value-wrap
    //          └── span#value-display ← current value
    // ── Dynamic stylesheet ───────────────────────────────────────────────────
    // Called from _build (initial) and from setConfig (when card_size changes).
    // All px values derive from KS (card_size) via SCALE factor so the widget
    // looks identical at any size.
    _updateStyle(styleEl) {
        var _a;
        const el = styleEl !== null && styleEl !== void 0 ? styleEl : (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.getElementById("neu-style");
        if (!el)
            return;
        const ks = this.KS;
        const sc = this.SCALE;
        const p28 = Math.round(28 * sc);
        const p20 = Math.round(20 * sc);
        const pb = Math.round(56 * sc);
        const mb24 = Math.round(24 * sc);
        const fs13 = (13 * sc).toFixed(1);
        const fs11 = (11 * sc).toFixed(1);
        const fs22 = (22 * sc).toFixed(1);
        const fs32 = (32 * sc).toFixed(1);
        const mt4 = Math.round(4 * sc);
        const mt8 = Math.round(8 * sc);
        const rh = Math.round(18 * sc);
        el.textContent = `
      :host { display: block; }

      ha-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: ${p28}px ${p20}px ${p20}px;
        box-sizing: border-box;
        background:    var(--ha-card-background, var(--card-background-color, #23272e));
        border-radius: var(--ha-card-border-radius, 18px);
        box-shadow:    var(--ha-card-box-shadow, 8px 8px 18px #181a1f, -8px -8px 18px #2c3140);
      }

      .title {
        font-family:    var(--primary-font-family, sans-serif);
        font-size:      ${fs13}px;
        font-weight:    400;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color:          var(--text-medium-light-color, #888);
        margin-bottom:  ${mb24}px;
      }

      .knob-wrap {
        position:       relative;
        width:          ${ks}px;
        padding-bottom: ${pb}px;
      }

      canvas {
        display:             block;
        cursor:              grab;
        touch-action:        none;
        user-select:         none;
        -webkit-user-select: none;
      }
      canvas:active { cursor: grabbing; }

      .range-row {
        position:    relative;
        height:      ${rh}px;
        margin-top:  ${mt8}px;
        font-family: var(--primary-font-family, sans-serif);
        font-size:   ${fs11}px;
        color:       var(--text-medium-light-color, #666);
      }
      #min-display { position: absolute; left: ${mt8}px; top: 0; }
      #max-display { position: absolute; right: ${mt8}px; top: 0; }

      .value-wrap {
        display:         flex;
        justify-content: center;
        margin-top:      ${mt4}px;
      }
      .value-wrap span {
        font-family: var(--primary-font-family, sans-serif);
        font-size:   ${fs22}px;
        font-weight: 500;
        color:       var(--primary-text-color, #e0e0e0);
        white-space: nowrap;
      }

      .value-center {
        position:        absolute;
        top: 0; left: 0;
        width:           ${ks}px;
        height:          ${ks}px;
        display:         flex;
        align-items:     center;
        justify-content: center;
        pointer-events:  none;
      }
      .value-center span {
        font-family: var(--primary-font-family, sans-serif);
        font-size:   ${fs32}px;
        font-weight: 500;
        color:       var(--primary-text-color, #e0e0e0);
        white-space: nowrap;
        text-align:  center;
      }
    `;
    }
    _build() {
        if (this.shadowRoot)
            return;
        const shadow = this.attachShadow({ mode: "open" });
        // ── base stylesheet ────────────────────────────────────────────────────
        const style = document.createElement("style");
        style.id = "neu-style";
        this._updateStyle(style);
        // ── elements ──────────────────────────────────────────────────────────
        const card = document.createElement("ha-card");
        const titleEl = document.createElement("div");
        const wrap = document.createElement("div");
        const canvas = document.createElement("canvas");
        const rangeRow = document.createElement("div");
        const minSpan = document.createElement("span");
        const maxSpan = document.createElement("span");
        const valueWrap = document.createElement("div");
        const valueSpan = document.createElement("span");
        titleEl.className = "title";
        titleEl.id = "title-label";
        wrap.className = "knob-wrap";
        canvas.width = this.W;
        canvas.height = this.W;
        canvas.style.width = this.KS + "px";
        canvas.style.height = this.KS + "px";
        rangeRow.className = "range-row";
        minSpan.id = "min-display";
        maxSpan.id = "max-display";
        valueWrap.className = "value-wrap";
        valueSpan.id = "value-display";
        this._canvas = canvas;
        // Center-value overlay — always in DOM, visibility toggled by _applyLabelConfig
        const centerWrap = document.createElement("div");
        const centerSpan = document.createElement("span");
        centerWrap.className = "value-center";
        centerWrap.id = "value-center-wrap";
        centerSpan.id = "value-center-display";
        centerWrap.appendChild(centerSpan);
        rangeRow.appendChild(minSpan);
        rangeRow.appendChild(maxSpan);
        valueWrap.appendChild(valueSpan);
        wrap.appendChild(canvas);
        wrap.appendChild(centerWrap); // sits over canvas, pointer-events:none
        wrap.appendChild(rangeRow);
        wrap.appendChild(valueWrap);
        card.appendChild(titleEl);
        card.appendChild(wrap);
        shadow.appendChild(style);
        shadow.appendChild(card);
    }
    // ── Label config application ───────────────────────────────────────────────
    //
    // Called after _build() whenever config changes.
    // Sets visibility and applies any typography overrides.
    _applyLabelConfig() {
        var _a;
        if (!this._config || !this.shadowRoot)
            return;
        const sr = this.shadowRoot;
        const cfg = this._config;
        const pos = (_a = cfg.value_position) !== null && _a !== void 0 ? _a : "below"; // "below" | "center"
        // ── title, min, max — unchanged ──────────────────────────────────────────
        for (const { id, labelCfg } of [
            { id: "title-label", labelCfg: cfg.title_label },
            { id: "min-display", labelCfg: cfg.min_label },
            { id: "max-display", labelCfg: cfg.max_label },
        ]) {
            const el = sr.getElementById(id);
            if (!el)
                continue;
            const visible = labelVisible(labelCfg);
            el.style.display = visible ? "" : "none";
            if (visible)
                applyTypography(el, labelCfg);
        }
        // ── range-row: hide if both min+max hidden ────────────────────────────────
        const rangeRow = sr.querySelector(".range-row");
        if (rangeRow) {
            rangeRow.style.display =
                (!labelVisible(cfg.min_label) && !labelVisible(cfg.max_label)) ? "none" : "";
        }
        // ── value display: route to "below" or "center" ───────────────────────────
        const showValue = labelVisible(cfg.value_label);
        const belowWrap = sr.querySelector(".value-wrap");
        const belowSpan = sr.getElementById("value-display");
        const centerWrap = sr.getElementById("value-center-wrap");
        const centerSpan = sr.getElementById("value-center-display");
        if (pos === "center") {
            // Show center overlay, hide below row
            if (belowWrap)
                belowWrap.style.display = "none";
            if (centerWrap)
                centerWrap.style.display = showValue ? "" : "none";
            if (centerSpan && showValue)
                applyTypography(centerSpan, cfg.value_label);
        }
        else {
            // Show below row, hide center overlay
            if (centerWrap)
                centerWrap.style.display = "none";
            if (belowWrap)
                belowWrap.style.display = showValue ? "" : "none";
            if (belowSpan && showValue)
                applyTypography(belowSpan, cfg.value_label);
        }
    }
    // ── Theme watcher ─────────────────────────────────────────────────────────
    _watchTheme() {
        var _a;
        this._themeObserver = new MutationObserver(() => {
            const wasDark = this._isDark;
            this._isDark = resolveIsDark(this._hass);
            if (this._isDark !== wasDark)
                this._scheduleDraw();
        });
        this._themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class", "style"],
        });
        (_a = window.matchMedia) === null || _a === void 0 ? void 0 : _a.call(window, "(prefers-color-scheme: dark)").addEventListener("change", () => {
            this._isDark = resolveIsDark(this._hass);
            this._scheduleDraw();
        });
    }
    // ── Entity sync ───────────────────────────────────────────────────────────
    _syncFromEntity() {
        var _a, _b, _c, _d;
        // Never update during a drag.
        if (this._dragging)
            return;
        if (!this._hass || !this._config)
            return;
        const stateObj = this._hass.states[this._config.entity];
        if (!stateObj)
            return;
        let raw;
        if (this._config.attribute) {
            raw = parseFloat(String((_a = stateObj.attributes[this._config.attribute]) !== null && _a !== void 0 ? _a : 0));
        }
        else {
            raw = parseFloat(stateObj.state);
        }
        if (isNaN(raw))
            return;
        // If we have a pending command, compare the incoming HA value against it.
        //
        //  • HA value ≠ pending  →  this is a stale echo of the OLD state
        //                            (Alexa hasn't processed our command yet).
        //                            Ignore it — keep showing the optimistic value.
        //
        //  • HA value ≈ pending  →  Alexa confirmed our command.
        //                            Accept it and clear the pending flag so future
        //                            external changes (e.g. voice commands) come through.
        //
        // We use a small epsilon for floating-point comparison (HA may round).
        if (this._pendingScaled !== null) {
            const epsilon = 0.001;
            if (Math.abs(raw - this._pendingScaled) > epsilon) {
                return; // stale — ignore
            }
            this._pendingScaled = null; // confirmed — clear pending
        }
        const scale = (_b = this._config.scale) !== null && _b !== void 0 ? _b : 1;
        const min = (_c = this._config.min) !== null && _c !== void 0 ? _c : 0;
        const max = (_d = this._config.max) !== null && _d !== void 0 ? _d : 100;
        const actual = raw / scale;
        this._value = Math.max(0, Math.min(1, (actual - min) / (max - min)));
    }
    // ── Drawing ───────────────────────────────────────────────────────────────
    _scheduleDraw() {
        if (this._rafPending)
            return;
        this._rafPending = true;
        requestAnimationFrame(() => {
            this._rafPending = false;
            this._draw();
        });
    }
    _draw() {
        var _a;
        if (!this._canvas || !this._config)
            return;
        const ctx = this._canvas.getContext("2d");
        if (!ctx)
            return;
        const p = this._isDark ? DARK_PALETTE : LIGHT_PALETTE;
        const glowColor = (_a = this._config.glow_color) !== null && _a !== void 0 ? _a : p.glow; // user override or palette default
        const { W, CX, CY, DISC_R, HANDLE_R } = this;
        // ── 1. Full clear — canvas is bigger than the disc so glow can bleed ──────
        ctx.clearRect(0, 0, W, W);
        // ── 2. Handle position (computed before drawing so glow goes underneath) ──
        const hp = this._handlePos();
        // ── 3. Glow — clipped to inscribed circle, fades to zero before the edge ────
        //
        //    The canvas is 260×260 but displayed at 220×220.  Without clipping, the
        //    glow gradient leaves faint colour in the four corners of the bitmap which
        //    appear as a visible square against the card background.
        //
        //    Solution: clip all drawing to the circle that is inscribed in the canvas
        //    square (radius = W/2 = 130px, centred at CX/CY).  This circle touches
        //    the midpoint of each side but never the corners, so the bitmap corners
        //    stay fully transparent — no square artifact.  The clip radius (130px) is
        //    larger than the disc (95px) so the glow still bleeds outside the disc
        //    and blooms into the card background naturally.
        //
        //    The gradient radius is set to the clip circle radius so it reaches
        //    exactly alpha=0 at the clip boundary — no hard edge, just a smooth fade.
        const clipR = W / 2; // 130px — inscribed circle, corners stay clear
        const glowR = clipR; // gradient fades to 0 exactly at clip edge
        ctx.save();
        ctx.beginPath();
        ctx.arc(CX, CY, clipR, 0, Math.PI * 2);
        ctx.clip(); // everything outside this circle is discarded
        const gi = this.GLOW_INT; // user-configured intensity, 0–1
        const grad = ctx.createRadialGradient(hp.x, hp.y, HANDLE_R * 0.2, hp.x, hp.y, glowR);
        grad.addColorStop(0, hexAlpha(glowColor, gi * 1.00));
        grad.addColorStop(0.08, hexAlpha(glowColor, gi * 0.69));
        grad.addColorStop(0.20, hexAlpha(glowColor, gi * 0.34));
        grad.addColorStop(0.38, hexAlpha(glowColor, gi * 0.15));
        grad.addColorStop(0.55, hexAlpha(glowColor, gi * 0.06));
        grad.addColorStop(0.72, hexAlpha(glowColor, gi * 0.015));
        grad.addColorStop(1.0, hexAlpha(glowColor, 0));
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, W);
        ctx.restore(); // clip is released here
        // ── 4. Under-disc range indicator (progress arc track / ghost glows / trail) ─
        this._drawRangeUnder(ctx, p);
        // ── 5. Under-disc endpoint markers ────────────────────────────────────────
        this._drawMarkersUnder(ctx, p);
        // ── 6. Single disc ────────────────────────────────────────────────────────
        const dOff = Math.round(9 * this.SCALE);
        const dBlr = Math.round(20 * this.SCALE);
        this._drawDisc(ctx, CX, CY, DISC_R, p.bg, p.shadowDark, p.shadowLight, dOff, dBlr);
        // ── 7. Optional 3D convex shading overlay ─────────────────────────────────
        if (this._config.disc_3d)
            this._drawDisc3D(ctx);
        // ── 8. Over-disc endpoint markers (ticks, dots) ───────────────────────────
        this._drawMarkersOver(ctx, p);
        // ── 9. Over-disc range indicator (dial ticks / progress arc active part) ──
        this._drawRangeOver(ctx, p);
        // ── 10. Handle button ─────────────────────────────────────────────────────
        const hOff = Math.round(5 * this.SCALE);
        const hBlr = Math.round(12 * this.SCALE);
        this._drawDisc(ctx, hp.x, hp.y, HANDLE_R, p.handleBg, p.shadowDark, p.shadowLight, hOff, hBlr);
        // Handle centre dot
        ctx.beginPath();
        ctx.arc(hp.x, hp.y, Math.max(2, Math.round(HANDLE_R * 0.22)), 0, Math.PI * 2);
        ctx.fillStyle = p.handleDot;
        ctx.fill();
        this._updateText();
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // Range-style methods
    // ═══════════════════════════════════════════════════════════════════════════
    /** External range indicators drawn BEFORE the disc (appear behind it) */
    _drawRangeUnder(ctx, p) {
        var _a;
        if (!this._config)
            return;
        const rs = (_a = this._config.range_style) !== null && _a !== void 0 ? _a : "none";
        if (rs === "progress")
            this._drawProgressTrack(ctx, p);
        // dial_ticks drawn over (they sit outside disc, no layering needed)
    }
    /** External range indicators drawn AFTER the disc */
    _drawRangeOver(ctx, p) {
        var _a;
        if (!this._config)
            return;
        const rs = (_a = this._config.range_style) !== null && _a !== void 0 ? _a : "none";
        if (rs === "progress")
            this._drawProgressArc(ctx, p);
        if (rs === "dial_ticks")
            this._drawDialTicks(ctx, p);
    }
    /**
     * Progress style — grey full-range track outside the disc.
     * Drawn under the disc so the disc covers the inner half, only the ring shows.
     */
    _drawProgressTrack(ctx, p) {
        const { CX, CY, DISC_R, SCALE, START_ANG, END_ANG } = this;
        const trackR = DISC_R + Math.round(8 * SCALE);
        const lw = Math.max(2, Math.round(5 * SCALE));
        // Outer neumorphic channel (inset ring)
        ctx.save();
        ctx.beginPath();
        ctx.arc(CX, CY, trackR, START_ANG, END_ANG, false);
        ctx.strokeStyle = this._isDark ? "#181a1f" : "#c8c8c8";
        ctx.lineWidth = lw + Math.round(2 * SCALE);
        ctx.lineCap = "round";
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(CX, CY, trackR, START_ANG, END_ANG, false);
        ctx.strokeStyle = this._isDark ? "#2c3140" : "#f0f0f0";
        ctx.lineWidth = lw;
        ctx.lineCap = "round";
        ctx.stroke();
        ctx.restore();
    }
    /** Progress arc — coloured fill up to current value, drawn over the track */
    _drawProgressArc(ctx, p) {
        var _a, _b;
        if (!this._config || this._value <= 0.005)
            return;
        const { CX, CY, DISC_R, SCALE, START_ANG, END_ANG } = this;
        const trackR = DISC_R + Math.round(8 * SCALE);
        const lw = Math.max(2, Math.round(5 * SCALE));
        const curAng = START_ANG + this._value * (END_ANG - START_ANG);
        const colorStart = (_b = (_a = this._config.progress_color) !== null && _a !== void 0 ? _a : this._config.glow_color) !== null && _b !== void 0 ? _b : p.glow;
        const colorEnd = this._config.progress_color_end;
        // ── Resolve stroke style: gradient or solid ────────────────────────────
        // We use createConicGradient (supported in all modern browsers) when a
        // gradient is requested. It maps colour stops around a centre point by
        // angle, which is exactly what an arc needs — the colour follows the arc
        // rather than spanning a straight chord.
        //
        // Fallback (no gradient / browser missing createConicGradient): solid.
        let strokeStyle = colorStart;
        if (colorEnd) {
            if (typeof ctx.createConicGradient === "function") {
                // createConicGradient(startAngle, cx, cy) — angles in radians.
                // We start the gradient at START_ANG so stop 0 = arc start colour.
                const conic = ctx.createConicGradient(START_ANG, CX, CY);
                // Map the value fraction within the full 0→1 stop space.
                // The arc spans (END_ANG - START_ANG) radians out of 2π total.
                // Stop positions are proportional fractions of the full circle (0–1).
                const totalAngle = Math.PI * 2;
                const arcSpan = END_ANG - START_ANG;
                const gradEnd = (arcSpan / totalAngle) * this._value; // end at current value
                const gradFull = arcSpan / totalAngle; // full arc span
                conic.addColorStop(0, colorStart);
                conic.addColorStop(gradEnd, colorEnd);
                // Beyond the arc end, clamp to colorEnd (prevents colour bleeding)
                conic.addColorStop(Math.min(gradFull + 0.01, 1), colorEnd);
                conic.addColorStop(1, colorEnd);
                strokeStyle = conic;
            }
            else {
                // Fallback: linear gradient from arc start-point to end-point.
                // Not as accurate for large arcs but acceptable.
                const sx = CX + trackR * Math.cos(START_ANG);
                const sy = CY + trackR * Math.sin(START_ANG);
                const ex = CX + trackR * Math.cos(curAng);
                const ey = CY + trackR * Math.sin(curAng);
                const lin = ctx.createLinearGradient(sx, sy, ex, ey);
                lin.addColorStop(0, colorStart);
                lin.addColorStop(1, colorEnd);
                strokeStyle = lin;
            }
        }
        ctx.save();
        ctx.beginPath();
        ctx.arc(CX, CY, trackR, START_ANG, curAng, false);
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = lw;
        ctx.lineCap = "round";
        // Glow uses the start colour (most visible at the handle end)
        ctx.shadowColor = colorEnd !== null && colorEnd !== void 0 ? colorEnd : colorStart;
        ctx.shadowBlur = Math.round(6 * SCALE);
        ctx.stroke();
        ctx.restore();
    }
    /**
     * Dial ticks — evenly spaced radial marks around the outside of the disc,
     * like a physical analogue control. Matches the right knob in the reference image.
     * Ticks within the current value range are brighter.
     */
    _drawDialTicks(ctx, p) {
        var _a, _b, _c;
        if (!this._config)
            return;
        const { CX, CY, DISC_R, SCALE, START_ANG, END_ANG } = this;
        const count = Math.max(5, Math.min(41, (_a = this._config.dial_ticks) !== null && _a !== void 0 ? _a : 21));
        const gapR = Math.round(4 * SCALE);
        const tickLen = Math.round(10 * SCALE);
        const innerR = DISC_R + gapR;
        const outerR = DISC_R + gapR + tickLen;
        const lw = Math.max(1, Math.round(1.5 * SCALE));
        const RANGE = END_ANG - START_ANG;
        const curAng = START_ANG + this._value * RANGE;
        // Resolve gradient colours — same keys as the progress arc so the two
        // styles share a consistent colour language when used together.
        const colorStart = (_c = (_b = this._config.progress_color) !== null && _b !== void 0 ? _b : this._config.glow_color) !== null && _c !== void 0 ? _c : p.glow;
        const colorEnd = this._config.progress_color_end; // undefined = solid
        for (let i = 0; i < count; i++) {
            const t = i / (count - 1); // 0 at min, 1 at max
            const ang = START_ANG + t * RANGE;
            const ix = CX + innerR * Math.cos(ang);
            const iy = CY + innerR * Math.sin(ang);
            const ox = CX + outerR * Math.cos(ang);
            const oy = CY + outerR * Math.sin(ang);
            const active = ang <= curAng + 0.001; // small epsilon for floating-point safety
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(ix, iy);
            ctx.lineTo(ox, oy);
            if (active) {
                if (colorEnd) {
                    // Interpolate colour along the arc by tick position t
                    ctx.strokeStyle = hexLerp(colorStart, colorEnd, t);
                }
                else {
                    // Solid accent colour — use progress_color / glow_color if set,
                    // otherwise fall back to the classic bright-white/dark-black style.
                    const hasExplicitColor = !!(this._config.progress_color
                        || this._config.glow_color);
                    ctx.strokeStyle = hasExplicitColor
                        ? colorStart
                        : (this._isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.40)");
                }
            }
            else {
                // Inactive ticks are always muted, regardless of gradient setting
                ctx.strokeStyle = this._isDark
                    ? "rgba(255,255,255,0.15)"
                    : "rgba(0,0,0,0.14)";
            }
            ctx.lineWidth = lw;
            ctx.lineCap = "round";
            if (this._isDark) {
                ctx.shadowColor = "#111";
                ctx.shadowBlur = Math.round(2 * SCALE);
                ctx.shadowOffsetX = Math.round(1 * SCALE);
                ctx.shadowOffsetY = Math.round(1 * SCALE);
            }
            ctx.stroke();
            ctx.restore();
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // Endpoint marker methods (on the disc face)
    // ═══════════════════════════════════════════════════════════════════════════
    _drawMarkersUnder(ctx, p) {
        var _a;
        if (!this._config)
            return;
        const mode = (_a = this._config.markers) !== null && _a !== void 0 ? _a : "none";
        if (mode === "none")
            return;
        if (mode === "trail" || mode === "combined")
            this._drawTrail(ctx, p);
        if (mode === "ghosts" || mode === "combined")
            this._drawGhosts(ctx, p);
    }
    _drawMarkersOver(ctx, p) {
        var _a;
        if (!this._config)
            return;
        const mode = (_a = this._config.markers) !== null && _a !== void 0 ? _a : "none";
        if (mode === "none")
            return;
        if (mode === "ticks" || mode === "combined")
            this._drawTicks(ctx, p);
        if (mode === "dots" || mode === "combined")
            this._drawDots(ctx, p);
    }
    _drawTrail(ctx, p) {
        const { CX, CY, DISC_R, HANDLE_R, SCALE, START_ANG, END_ANG } = this;
        const orbit = DISC_R - HANDLE_R - 6 * SCALE;
        ctx.save();
        ctx.beginPath();
        ctx.arc(CX, CY, orbit, START_ANG, END_ANG, false);
        ctx.strokeStyle = this._isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
        ctx.lineWidth = Math.max(1.5, 3 * SCALE);
        ctx.lineCap = "round";
        ctx.stroke();
        ctx.restore();
    }
    _drawTicks(ctx, p) {
        const { CX, CY, DISC_R, SCALE, START_ANG, END_ANG } = this;
        const tickLen = Math.round(11 * SCALE);
        for (const ang of [START_ANG, END_ANG]) {
            const ox = CX + DISC_R * Math.cos(ang);
            const oy = CY + DISC_R * Math.sin(ang);
            const ix = CX + (DISC_R - tickLen) * Math.cos(ang);
            const iy = CY + (DISC_R - tickLen) * Math.sin(ang);
            ctx.save();
            ctx.shadowColor = p.shadowDark;
            ctx.shadowBlur = Math.round(3 * SCALE);
            ctx.shadowOffsetX = Math.round(1 * SCALE);
            ctx.shadowOffsetY = Math.round(1 * SCALE);
            ctx.beginPath();
            ctx.moveTo(ox, oy);
            ctx.lineTo(ix, iy);
            ctx.strokeStyle = this._isDark ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.18)";
            ctx.lineWidth = Math.max(1.5, 2.5 * SCALE);
            ctx.lineCap = "round";
            ctx.stroke();
            ctx.restore();
            ctx.beginPath();
            ctx.moveTo(ox, oy);
            ctx.lineTo(ix, iy);
            ctx.strokeStyle = this._isDark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.55)";
            ctx.lineWidth = Math.max(1, 1 * SCALE);
            ctx.lineCap = "round";
            ctx.stroke();
        }
    }
    _drawDots(ctx, p) {
        const { CX, CY, DISC_R, HANDLE_R, SCALE, START_ANG, END_ANG } = this;
        const orbit = DISC_R - HANDLE_R - 6 * SCALE;
        const dotR = Math.max(2.5, 4 * SCALE);
        const colors = [hexAlpha(p.accent1, 0.55), hexAlpha(p.accent2, 0.80)];
        for (const [i, ang] of [[0, START_ANG], [1, END_ANG]]) {
            const px = CX + orbit * Math.cos(ang);
            const py = CY + orbit * Math.sin(ang);
            ctx.save();
            ctx.shadowColor = colors[i];
            ctx.shadowBlur = Math.round(8 * SCALE);
            ctx.beginPath();
            ctx.arc(px, py, dotR, 0, Math.PI * 2);
            ctx.fillStyle = colors[i];
            ctx.fill();
            ctx.restore();
        }
    }
    _drawGhosts(ctx, p) {
        const { CX, CY, DISC_R, HANDLE_R, SCALE, START_ANG, END_ANG } = this;
        const orbit = DISC_R - HANDLE_R - 6 * SCALE;
        const glowRad = DISC_R * 0.45;
        for (const [i, ang] of [[0, START_ANG], [1, END_ANG]]) {
            const px = CX + orbit * Math.cos(ang);
            const py = CY + orbit * Math.sin(ang);
            const col = i === 0 ? p.accent1 : p.accent2;
            ctx.save();
            ctx.beginPath();
            ctx.arc(CX, CY, DISC_R, 0, Math.PI * 2);
            ctx.clip();
            const gr = ctx.createRadialGradient(px, py, 0, px, py, glowRad);
            gr.addColorStop(0, hexAlpha(col, 0.18));
            gr.addColorStop(0.4, hexAlpha(col, 0.07));
            gr.addColorStop(1, hexAlpha(col, 0));
            ctx.fillStyle = gr;
            ctx.fillRect(CX - DISC_R, CY - DISC_R, DISC_R * 2, DISC_R * 2);
            ctx.restore();
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // 3D disc shading
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Convex 3D shading overlay. A radial gradient from near-white at top-left
     * to near-transparent at bottom-right, simulating a convex surface lit from
     * top-left. Applied after the disc fill so it sits on top of the base colour.
     */
    _drawDisc3D(ctx) {
        const { CX, CY, DISC_R } = this;
        // Light source offset: top-left, ~35% of radius
        const lx = CX - DISC_R * 0.35;
        const ly = CY - DISC_R * 0.35;
        const grad = ctx.createRadialGradient(lx, ly, 0, CX, CY, DISC_R * 1.1);
        if (this._isDark) {
            grad.addColorStop(0, "rgba(255,255,255,0.13)");
            grad.addColorStop(0.35, "rgba(255,255,255,0.05)");
            grad.addColorStop(0.65, "rgba(0,0,0,0.04)");
            grad.addColorStop(1, "rgba(0,0,0,0.18)");
        }
        else {
            grad.addColorStop(0, "rgba(255,255,255,0.65)");
            grad.addColorStop(0.35, "rgba(255,255,255,0.20)");
            grad.addColorStop(0.65, "rgba(0,0,0,0.02)");
            grad.addColorStop(1, "rgba(0,0,0,0.10)");
        }
        ctx.save();
        ctx.beginPath();
        ctx.arc(CX, CY, DISC_R, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
    }
    _drawDisc(ctx, x, y, r, fill, shadowDark, shadowLight, offset, blur) {
        const passes = [
            [shadowDark, offset, offset],
            [shadowLight, -offset, -offset],
        ];
        for (const [color, ox, oy] of passes) {
            ctx.save();
            ctx.shadowColor = color;
            ctx.shadowBlur = blur;
            ctx.shadowOffsetX = ox;
            ctx.shadowOffsetY = oy;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = fill;
            ctx.fill();
            ctx.restore();
        }
    }
    // ── Text update ───────────────────────────────────────────────────────────
    _updateText() {
        var _a, _b, _c, _d, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        if (!this._config || !this.shadowRoot)
            return;
        const min = (_a = this._config.min) !== null && _a !== void 0 ? _a : 0;
        const max = (_b = this._config.max) !== null && _b !== void 0 ? _b : 100;
        const step = (_c = this._config.step) !== null && _c !== void 0 ? _c : 1;
        const unit = (_d = this._config.unit) !== null && _d !== void 0 ? _d : "";
        const raw = min + this._value * (max - min);
        const decimals = step < 1 ? ((_g = (_f = String(step).split(".")[1]) === null || _f === void 0 ? void 0 : _f.length) !== null && _g !== void 0 ? _g : 1) : 0;
        const sr = this.shadowRoot;
        // title
        const titleEl = sr.getElementById("title-label");
        if (titleEl && labelVisible(this._config.title_label)) {
            // Priority: title_label.text > flat label > entity id
            titleEl.textContent =
                (_k = (_j = (_h = this._config.title_label) === null || _h === void 0 ? void 0 : _h.text) !== null && _j !== void 0 ? _j : this._config.label) !== null && _k !== void 0 ? _k : this._config.entity;
        }
        // current value — write to whichever position is active
        const pos = (_l = this._config.value_position) !== null && _l !== void 0 ? _l : "below";
        const activeId = pos === "center" ? "value-center-display" : "value-display";
        const valEl = sr.getElementById(activeId);
        if (valEl && labelVisible(this._config.value_label)) {
            valEl.textContent = raw.toFixed(decimals) + unit;
        }
        // min
        const minEl = sr.getElementById("min-display");
        if (minEl && labelVisible(this._config.min_label)) {
            minEl.textContent = (_o = (_m = this._config.min_label) === null || _m === void 0 ? void 0 : _m.text) !== null && _o !== void 0 ? _o : (min.toFixed(decimals) + unit);
        }
        // max
        const maxEl = sr.getElementById("max-display");
        if (maxEl && labelVisible(this._config.max_label)) {
            maxEl.textContent = (_q = (_p = this._config.max_label) === null || _p === void 0 ? void 0 : _p.text) !== null && _q !== void 0 ? _q : (max.toFixed(decimals) + unit);
        }
    }
    _attachEvents() {
        if (!this._canvas)
            return;
        // pointerdown on canvas only — starts the drag
        this._canvas.addEventListener("pointerdown", this._onPointerDown);
        // pointermove + pointerup on WINDOW — ensures we receive these even when
        // the pointer leaves the canvas during a drag (very common on touch/mobile)
        window.addEventListener("pointermove", this._onPointerMove);
        window.addEventListener("pointerup", this._onPointerUp);
        window.addEventListener("pointercancel", this._onPointerUp);
    }
    _detachEvents() {
        if (!this._canvas)
            return;
        this._canvas.removeEventListener("pointerdown", this._onPointerDown);
        window.removeEventListener("pointermove", this._onPointerMove);
        window.removeEventListener("pointerup", this._onPointerUp);
        window.removeEventListener("pointercancel", this._onPointerUp);
    }
    // ── Geometry ──────────────────────────────────────────────────────────────
    _handlePos() {
        const a = this.START_ANG + this._value * (this.END_ANG - this.START_ANG);
        // Orbit radius: inset from disc edge so handle button stays fully inside.
        // DISC_R - HANDLE_R - 6 leaves a 6px gap between button edge and disc rim.
        const orbit = this.DISC_R - this.HANDLE_R - 6;
        return {
            x: this.CX + orbit * Math.cos(a),
            y: this.CY + orbit * Math.sin(a),
        };
    }
    _isOnHandle(e) {
        if (!this._canvas)
            return false;
        const rect = this._canvas.getBoundingClientRect();
        // rect.width is the CSS display width (220px); canvas bitmap is W (260px)
        const scale = this.W / rect.width;
        const dx = (e.clientX - rect.left) * scale - this._handlePos().x;
        const dy = (e.clientY - rect.top) * scale - this._handlePos().y;
        return Math.sqrt(dx * dx + dy * dy) < this.HANDLE_R + 14;
    }
    _valueFromPointer(e) {
        if (!this._canvas)
            return this._value;
        const rect = this._canvas.getBoundingClientRect();
        // scale: bitmap coords (260px) relative to CSS display size (220px)
        const scale = this.W / rect.width;
        const cx = (e.clientX - rect.left) * scale - this.CX;
        const cy = (e.clientY - rect.top) * scale - this.CY;
        const { START_ANG, END_ANG } = this;
        const RANGE = END_ANG - START_ANG;
        let a = Math.atan2(cy, cx);
        if (a < START_ANG - Math.PI * 2)
            a += Math.PI * 2;
        if (a < START_ANG)
            a += Math.PI * 2;
        return Math.max(0, Math.min(1, (a - START_ANG) / RANGE));
    }
    // ── Service call ──────────────────────────────────────────────────────────
    _commitValue() {
        var _a, _b;
        if (!this._hass || !((_a = this._config) === null || _a === void 0 ? void 0 : _a.service) || this._pendingScaled === null)
            return;
        // _pendingScaled was already set in _onPointerUp — just send it.
        // No debounce: pointerup and pointercancel are both on window, so only one
        // will fire per gesture. Calling the service immediately means Alexa gets
        // the command the instant the user releases with zero artificial delay.
        const scaled = this._pendingScaled;
        const [domain, svc] = this._config.service.split(".");
        this._hass.callService(domain, svc, {
            entity_id: this._config.entity,
            [(_b = this._config.service_data_key) !== null && _b !== void 0 ? _b : "value"]: scaled,
        });
    }
    // ── Card meta ─────────────────────────────────────────────────────────────
    static getStubConfig() {
        return {
            entity: "media_player.living_room",
            attribute: "volume_level",
            min: 0,
            max: 100,
            step: 1,
            unit: "%",
            service: "media_player.volume_set",
            service_data_key: "volume_level",
            scale: 0.01,
            label: "Volume",
            value_position: "below", // "below" | "center"
            glow_color: undefined, // e.g. "#ff6b35" — omit to use theme default
            markers: "none", // "none" | "ticks" | "trail" | "dots" | "ghosts" | "combined"
            range_style: "none", // "none" | "progress" | "dial_ticks"
            dial_ticks: 21, // number of ticks for dial_ticks style
            progress_color: undefined, // CSS colour for progress arc (solid or gradient start)
            progress_color_end: undefined, // CSS colour for gradient end — omit for solid
            disc_3d: false, // true = convex 3D shading on disc
            // Angular range — these defaults reproduce the current 270° bottom-centred arc
            zero_angle: 0, // 0=bottom, 90=left, 180=top, 270=right
            min_angle: 45, // degrees CW from zero_angle for MIN position
            max_angle: 315, // degrees CW from zero_angle for MAX position
            glow_intensity: 0.65, // 0.0 – 1.0
            card_size: 220, // CSS px, 100–400. All other sizes scale from this.
            disc_radius: undefined, // px override — omit to auto-scale with card_size
            handle_radius: undefined, // px override — omit to auto-scale with card_size
            value_label: { show: true, size: "22px", weight: 500 },
            min_label: { show: true },
            max_label: { show: true },
        };
    }
    static getConfigElement() {
        return document.createElement("neumorphic-rotary-slider-editor");
    }
}
// ── Editor ────────────────────────────────────────────────────────────────────
//
// Standard HA card editor pattern:
//   - Named "<card-type>-editor", returned by getConfigElement()
//   - HA sets .hass and calls setConfig(config) when the card is edited
//   - Every change fires "config-changed" with { detail: { config } }
//
// We use a single <ha-form> element with a flat schema.
// HA renders every schema entry natively — entity pickers, selects,
// number fields, text fields, boolean toggles — with full styling and i18n.
// Nested LabelConfig sub-objects are flattened into the top-level config
// with a prefix (e.g. "tl_size" = title_label.size) and re-nested on fire().
class NeumorphicRotarySliderCardEditor extends HTMLElement {
    constructor() {
        super(...arguments);
        this._hass = null;
        this._config = null;
        this._rawConfig = {}; // full config including `type`
        this._form = null;
    }
    set hass(hass) {
        this._hass = hass;
        if (this._form)
            this._form.hass = hass;
    }
    setConfig(config) {
        // Keep the raw config (which HA passes with `type` intact) so we can
        // always spread it back when firing config-changed.
        this._rawConfig = config;
        this._config = config;
        if (!this._form)
            this._build();
        this._pushToForm();
    }
    // ── Build ─────────────────────────────────────────────────────────────────
    _build() {
        const form = document.createElement("ha-form");
        this._form = form;
        form.schema = this._schema();
        form.computeLabel = (s) => { var _a; return (_a = s.label) !== null && _a !== void 0 ? _a : s.name; };
        form.addEventListener("value-changed", (e) => this._onFormChange(e));
        const root = this.attachShadow({ mode: "open" });
        root.appendChild(form);
    }
    // ── Schema ────────────────────────────────────────────────────────────────
    // ha-form schema reference:
    //   selector.entity        → entity picker
    //   selector.text          → text input
    //   selector.number        → number slider+input
    //   selector.select        → dropdown
    //   selector.boolean       → toggle
    //   selector.color_rgb     → colour picker (HA 2023.4+)
    _schema() {
        var _a;
        return [
            // ── Entity ──────────────────────────────────────────────────────────
            { name: "entity", label: "Entity", required: true, selector: { entity: {} } },
            { name: "attribute", label: "Attribute (optional)", selector: { attribute: { entity_id: (_a = this._config) === null || _a === void 0 ? void 0 : _a.entity } } },
            { name: "service", label: "Service (optional)", selector: { text: {} } },
            { name: "service_data_key", label: "Service data key", selector: { text: {} } },
            { name: "scale", label: "Scale", selector: { number: { min: 0.0001, max: 100, step: 0.001, mode: "box" } } },
            // ── Range ────────────────────────────────────────────────────────────
            { name: "min", label: "Min value", selector: { number: { min: -9999, max: 9999, step: "any", mode: "box" } } },
            { name: "max", label: "Max value", selector: { number: { min: -9999, max: 9999, step: "any", mode: "box" } } },
            { name: "step", label: "Step", selector: { number: { min: 0.001, max: 1000, step: "any", mode: "box" } } },
            { name: "unit", label: "Unit (e.g. %)", selector: { text: {} } },
            { name: "value_position", label: "Value position", selector: { select: { options: ["below", "center"] } } },
            // ── Knob geometry ────────────────────────────────────────────────────
            { name: "card_size", label: "Knob size (px, 100–400)", selector: { number: { min: 100, max: 400, step: 10, mode: "slider" } } },
            { name: "disc_radius", label: "Disc radius (px, blank=auto-scale)", selector: { number: { min: 40, max: 115, step: 1, mode: "slider" } } },
            { name: "handle_radius", label: "Handle radius (px, blank=auto-scale)", selector: { number: { min: 8, max: 40, step: 1, mode: "slider" } } },
            { name: "disc_3d", label: "3D convex shading on disc", selector: { boolean: {} } },
            // ── Glow ─────────────────────────────────────────────────────────────
            { name: "glow_color", label: "Glow colour (blank=theme default)", selector: { text: {} } },
            { name: "glow_intensity", label: "Glow intensity (0–1)", selector: { number: { min: 0, max: 1, step: 0.05, mode: "slider" } } },
            // ── Angular range ────────────────────────────────────────────────────
            { name: "zero_angle", label: "Zero angle (0=bottom 180=top)", selector: { number: { min: 0, max: 359, step: 1, mode: "slider" } } },
            { name: "min_angle", label: "Min angle °CW from zero", selector: { number: { min: 0, max: 359, step: 1, mode: "slider" } } },
            { name: "max_angle", label: "Max angle °CW from zero", selector: { number: { min: 1, max: 719, step: 1, mode: "slider" } } },
            // ── Range style ──────────────────────────────────────────────────────
            { name: "range_style", label: "Range style", selector: { select: { options: ["none", "progress", "dial_ticks"] } } },
            { name: "dial_ticks", label: "Dial tick count (5–41)", selector: { number: { min: 5, max: 41, step: 1, mode: "slider" } } },
            { name: "progress_color", label: "Progress colour (blank=glow colour)", selector: { text: {} } },
            { name: "progress_color_end", label: "Progress gradient end (blank=solid)", selector: { text: {} } },
            // ── Markers ──────────────────────────────────────────────────────────
            { name: "markers", label: "Endpoint markers", selector: { select: { options: ["none", "ticks", "trail", "dots", "ghosts", "combined"] } } },
            // ── Title label ───────────────────────────────────────────────────────
            { name: "tl_show", label: "Title — show", selector: { boolean: {} } },
            { name: "tl_text", label: "Title — text", selector: { text: {} } },
            { name: "tl_size", label: "Title — font size (e.g. 13px)", selector: { text: {} } },
            { name: "tl_color", label: "Title — colour", selector: { text: {} } },
            { name: "tl_weight", label: "Title — font weight (e.g. 400)", selector: { text: {} } },
            { name: "tl_font", label: "Title — font family", selector: { text: {} } },
            { name: "tl_transform", label: "Title — text transform", selector: { select: { options: ["uppercase", "lowercase", "capitalize", "none"] } } },
            { name: "tl_spacing", label: "Title — letter spacing (e.g. 0.08em)", selector: { text: {} } },
            // ── Value label ───────────────────────────────────────────────────────
            { name: "vl_show", label: "Value — show", selector: { boolean: {} } },
            { name: "vl_size", label: "Value — font size (e.g. 22px)", selector: { text: {} } },
            { name: "vl_color", label: "Value — colour", selector: { text: {} } },
            { name: "vl_weight", label: "Value — font weight (e.g. 500)", selector: { text: {} } },
            { name: "vl_font", label: "Value — font family", selector: { text: {} } },
            { name: "vl_transform", label: "Value — text transform", selector: { select: { options: ["none", "uppercase", "lowercase", "capitalize"] } } },
            { name: "vl_spacing", label: "Value — letter spacing", selector: { text: {} } },
            // ── Min label ─────────────────────────────────────────────────────────
            { name: "mnl_show", label: "Min label — show", selector: { boolean: {} } },
            { name: "mnl_text", label: "Min label — text override", selector: { text: {} } },
            { name: "mnl_size", label: "Min label — font size", selector: { text: {} } },
            { name: "mnl_color", label: "Min label — colour", selector: { text: {} } },
            { name: "mnl_font", label: "Min label — font family", selector: { text: {} } },
            // ── Max label ─────────────────────────────────────────────────────────
            { name: "mxl_show", label: "Max label — show", selector: { boolean: {} } },
            { name: "mxl_text", label: "Max label — text override", selector: { text: {} } },
            { name: "mxl_size", label: "Max label — font size", selector: { text: {} } },
            { name: "mxl_color", label: "Max label — colour", selector: { text: {} } },
            { name: "mxl_font", label: "Max label — font family", selector: { text: {} } },
        ];
    }
    // ── Flatten config → form data ────────────────────────────────────────────
    // ha-form works with a flat key-value object matching the schema names.
    // Nested LabelConfig objects are flattened with prefixes.
    _flatten(c) {
        var _a, _b, _c, _d, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34, _35, _36, _37, _38, _39, _40, _41, _42;
        return {
            entity: c.entity,
            attribute: c.attribute,
            service: c.service,
            service_data_key: (_a = c.service_data_key) !== null && _a !== void 0 ? _a : "value",
            scale: (_b = c.scale) !== null && _b !== void 0 ? _b : 1,
            min: (_c = c.min) !== null && _c !== void 0 ? _c : 0,
            max: (_d = c.max) !== null && _d !== void 0 ? _d : 100,
            step: (_f = c.step) !== null && _f !== void 0 ? _f : 1,
            unit: (_g = c.unit) !== null && _g !== void 0 ? _g : "",
            value_position: (_h = c.value_position) !== null && _h !== void 0 ? _h : "below",
            card_size: (_j = c.card_size) !== null && _j !== void 0 ? _j : 220,
            disc_radius: c.disc_radius,
            handle_radius: c.handle_radius,
            disc_3d: (_k = c.disc_3d) !== null && _k !== void 0 ? _k : false,
            glow_color: (_l = c.glow_color) !== null && _l !== void 0 ? _l : "",
            glow_intensity: (_m = c.glow_intensity) !== null && _m !== void 0 ? _m : 0.65,
            zero_angle: (_o = c.zero_angle) !== null && _o !== void 0 ? _o : 0,
            min_angle: (_p = c.min_angle) !== null && _p !== void 0 ? _p : 45,
            max_angle: (_q = c.max_angle) !== null && _q !== void 0 ? _q : 315,
            range_style: (_r = c.range_style) !== null && _r !== void 0 ? _r : "none",
            dial_ticks: (_s = c.dial_ticks) !== null && _s !== void 0 ? _s : 21,
            progress_color: (_t = c.progress_color) !== null && _t !== void 0 ? _t : "",
            progress_color_end: (_u = c.progress_color_end) !== null && _u !== void 0 ? _u : "",
            markers: (_v = c.markers) !== null && _v !== void 0 ? _v : "none",
            // title_label
            tl_show: ((_w = c.title_label) === null || _w === void 0 ? void 0 : _w.show) !== false,
            tl_text: (_z = (_y = (_x = c.title_label) === null || _x === void 0 ? void 0 : _x.text) !== null && _y !== void 0 ? _y : c.label) !== null && _z !== void 0 ? _z : "",
            tl_size: (_1 = (_0 = c.title_label) === null || _0 === void 0 ? void 0 : _0.size) !== null && _1 !== void 0 ? _1 : "",
            tl_color: (_3 = (_2 = c.title_label) === null || _2 === void 0 ? void 0 : _2.color) !== null && _3 !== void 0 ? _3 : "",
            tl_weight: String((_5 = (_4 = c.title_label) === null || _4 === void 0 ? void 0 : _4.weight) !== null && _5 !== void 0 ? _5 : ""),
            tl_font: (_7 = (_6 = c.title_label) === null || _6 === void 0 ? void 0 : _6.font) !== null && _7 !== void 0 ? _7 : "",
            tl_transform: (_9 = (_8 = c.title_label) === null || _8 === void 0 ? void 0 : _8.transform) !== null && _9 !== void 0 ? _9 : "uppercase",
            tl_spacing: (_11 = (_10 = c.title_label) === null || _10 === void 0 ? void 0 : _10.spacing) !== null && _11 !== void 0 ? _11 : "",
            // value_label
            vl_show: ((_12 = c.value_label) === null || _12 === void 0 ? void 0 : _12.show) !== false,
            vl_size: (_14 = (_13 = c.value_label) === null || _13 === void 0 ? void 0 : _13.size) !== null && _14 !== void 0 ? _14 : "",
            vl_color: (_16 = (_15 = c.value_label) === null || _15 === void 0 ? void 0 : _15.color) !== null && _16 !== void 0 ? _16 : "",
            vl_weight: String((_18 = (_17 = c.value_label) === null || _17 === void 0 ? void 0 : _17.weight) !== null && _18 !== void 0 ? _18 : ""),
            vl_font: (_20 = (_19 = c.value_label) === null || _19 === void 0 ? void 0 : _19.font) !== null && _20 !== void 0 ? _20 : "",
            vl_transform: (_22 = (_21 = c.value_label) === null || _21 === void 0 ? void 0 : _21.transform) !== null && _22 !== void 0 ? _22 : "",
            vl_spacing: (_24 = (_23 = c.value_label) === null || _23 === void 0 ? void 0 : _23.spacing) !== null && _24 !== void 0 ? _24 : "",
            // min_label
            mnl_show: ((_25 = c.min_label) === null || _25 === void 0 ? void 0 : _25.show) !== false,
            mnl_text: (_27 = (_26 = c.min_label) === null || _26 === void 0 ? void 0 : _26.text) !== null && _27 !== void 0 ? _27 : "",
            mnl_size: (_29 = (_28 = c.min_label) === null || _28 === void 0 ? void 0 : _28.size) !== null && _29 !== void 0 ? _29 : "",
            mnl_color: (_31 = (_30 = c.min_label) === null || _30 === void 0 ? void 0 : _30.color) !== null && _31 !== void 0 ? _31 : "",
            mnl_font: (_33 = (_32 = c.min_label) === null || _32 === void 0 ? void 0 : _32.font) !== null && _33 !== void 0 ? _33 : "",
            // max_label
            mxl_show: ((_34 = c.max_label) === null || _34 === void 0 ? void 0 : _34.show) !== false,
            mxl_text: (_36 = (_35 = c.max_label) === null || _35 === void 0 ? void 0 : _35.text) !== null && _36 !== void 0 ? _36 : "",
            mxl_size: (_38 = (_37 = c.max_label) === null || _37 === void 0 ? void 0 : _37.size) !== null && _38 !== void 0 ? _38 : "",
            mxl_color: (_40 = (_39 = c.max_label) === null || _39 === void 0 ? void 0 : _39.color) !== null && _40 !== void 0 ? _40 : "",
            mxl_font: (_42 = (_41 = c.max_label) === null || _41 === void 0 ? void 0 : _41.font) !== null && _42 !== void 0 ? _42 : "",
        };
    }
    // ── Unflatten form data → config ──────────────────────────────────────────
    _unflatten(d) {
        var _a, _b, _c, _d, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        const str = (k) => d[k] ? String(d[k]) : undefined;
        const num = (k) => d[k] != null ? Number(d[k]) : undefined;
        const bool = (k) => Boolean(d[k]);
        return {
            entity: String((_a = d.entity) !== null && _a !== void 0 ? _a : ""),
            attribute: str("attribute"),
            service: str("service"),
            service_data_key: str("service_data_key"),
            scale: num("scale"),
            min: (_b = num("min")) !== null && _b !== void 0 ? _b : 0,
            max: (_c = num("max")) !== null && _c !== void 0 ? _c : 100,
            step: (_d = num("step")) !== null && _d !== void 0 ? _d : 1,
            unit: str("unit"),
            value_position: (_f = d.value_position) !== null && _f !== void 0 ? _f : "below",
            card_size: (_g = num("card_size")) !== null && _g !== void 0 ? _g : 220,
            disc_radius: num("disc_radius"),
            handle_radius: num("handle_radius"),
            disc_3d: bool("disc_3d"),
            glow_color: str("glow_color"),
            glow_intensity: (_h = num("glow_intensity")) !== null && _h !== void 0 ? _h : 0.65,
            zero_angle: (_j = num("zero_angle")) !== null && _j !== void 0 ? _j : 0,
            min_angle: (_k = num("min_angle")) !== null && _k !== void 0 ? _k : 45,
            max_angle: (_l = num("max_angle")) !== null && _l !== void 0 ? _l : 315,
            range_style: (_m = d.range_style) !== null && _m !== void 0 ? _m : "none",
            dial_ticks: (_o = num("dial_ticks")) !== null && _o !== void 0 ? _o : 21,
            progress_color: str("progress_color"),
            progress_color_end: str("progress_color_end"),
            markers: (_p = d.markers) !== null && _p !== void 0 ? _p : "none",
            title_label: {
                show: bool("tl_show"),
                text: str("tl_text"),
                size: str("tl_size"),
                color: str("tl_color"),
                weight: str("tl_weight"),
                font: str("tl_font"),
                transform: str("tl_transform"),
                spacing: str("tl_spacing"),
            },
            value_label: {
                show: bool("vl_show"),
                size: str("vl_size"),
                color: str("vl_color"),
                weight: str("vl_weight"),
                font: str("vl_font"),
                transform: str("vl_transform"),
                spacing: str("vl_spacing"),
            },
            min_label: {
                show: bool("mnl_show"),
                text: str("mnl_text"),
                size: str("mnl_size"),
                color: str("mnl_color"),
                font: str("mnl_font"),
            },
            max_label: {
                show: bool("mxl_show"),
                text: str("mxl_text"),
                size: str("mxl_size"),
                color: str("mxl_color"),
                font: str("mxl_font"),
            },
        };
    }
    // ── Sync config → form ────────────────────────────────────────────────────
    _pushToForm() {
        if (!this._form || !this._config)
            return;
        this._form.data =
            this._flatten(this._config);
        if (this._hass)
            this._form.hass = this._hass;
    }
    // ── Handle form changes ───────────────────────────────────────────────────
    _onFormChange(e) {
        var _a;
        e.stopPropagation();
        const detail = (_a = e.detail) === null || _a === void 0 ? void 0 : _a.value;
        if (!detail)
            return;
        // _rawConfig always contains `type` (and any other HA-injected keys).
        // _unflatten only produces our own config keys — spread rawConfig first
        // so `type` is never lost.
        const newConfig = Object.assign(Object.assign({}, this._rawConfig), this._unflatten(detail));
        this.dispatchEvent(new CustomEvent("config-changed", {
            detail: { config: newConfig },
            bubbles: true,
            composed: true,
        }));
    }
}
customElements.define("neumorphic-rotary-slider-editor", NeumorphicRotarySliderCardEditor);
// ── Register ──────────────────────────────────────────────────────────────────
customElements.define("neumorphic-rotary-slider", NeumorphicRotarySliderCard);
(_a = (_b = window).customCards) !== null && _a !== void 0 ? _a : (_b.customCards = []);
window.customCards.push({
    type: "neumorphic-rotary-slider",
    name: "Neumorphic Rotary Slider",
    description: "Circular knob slider — fully configurable labels, Neumorphic theme",
});
