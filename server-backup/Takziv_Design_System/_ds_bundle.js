/* @ds-bundle: {"format":3,"namespace":"TakzivDesignSystem_57976b","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Input","sourcePath":"components/core/Input.jsx"},{"name":"KindToggle","sourcePath":"components/core/KindToggle.jsx"},{"name":"Logo","sourcePath":"components/core/Logo.jsx"},{"name":"MoneyAmount","sourcePath":"components/core/MoneyAmount.jsx"},{"name":"ProgressBar","sourcePath":"components/core/ProgressBar.jsx"},{"name":"SectionHeader","sourcePath":"components/core/SectionHeader.jsx"},{"name":"Select","sourcePath":"components/core/Select.jsx"},{"name":"Tabs","sourcePath":"components/core/Tabs.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"a979a9a647ca","components/core/Button.jsx":"4838a93c5ff2","components/core/Card.jsx":"d9f3ea6a7c81","components/core/Input.jsx":"252fd8d14a09","components/core/KindToggle.jsx":"2433d510c439","components/core/Logo.jsx":"240c39e8b914","components/core/MoneyAmount.jsx":"eea957bf1e1b","components/core/ProgressBar.jsx":"e2e3f012a5b6","components/core/SectionHeader.jsx":"f52de167e2ee","components/core/Select.jsx":"ab6c24b48d86","components/core/Tabs.jsx":"5c089d215042","design_handoff_main_screen/redesign-data.jsx":"c8470681f9d0","design_handoff_main_screen/redesign-shared.jsx":"1ace6379deb9","design_handoff_main_screen/redesign-variations.jsx":"494eccb63eeb","ui_kits/takziv-app/charts.jsx":"1b94134d08a8","ui_kits/takziv-app/data.jsx":"9e0e36ce3198","ui_kits/takziv-app/redesign-data.jsx":"c8470681f9d0","ui_kits/takziv-app/redesign-shared.jsx":"1ace6379deb9","ui_kits/takziv-app/redesign-variations.jsx":"494eccb63eeb","ui_kits/takziv-app/screens.jsx":"82dbefda7055"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.TakzivDesignSystem_57976b = window.TakzivDesignSystem_57976b || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  excellent: {
    color: 'var(--status-excellent-fg)',
    background: 'var(--status-excellent-bg)'
  },
  good: {
    color: 'var(--status-good-fg)',
    background: 'var(--status-good-bg)'
  },
  fair: {
    color: 'var(--status-fair-fg)',
    background: 'var(--status-fair-bg)'
  },
  poor: {
    color: 'var(--status-poor-fg)',
    background: 'var(--status-poor-bg)'
  },
  na: {
    color: 'var(--status-na-fg)',
    background: 'var(--status-na-bg)'
  },
  brass: {
    color: 'var(--white)',
    background: 'var(--brass)'
  },
  income: {
    color: 'var(--white)',
    background: 'var(--income)'
  },
  expense: {
    color: 'var(--white)',
    background: 'var(--expense)'
  }
};

/**
 * Small status pill — the soft fg-on-tint chip from the financial-health card,
 * plus solid income/expense/brass variants.
 */
function Badge({
  children,
  tone = 'na',
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      fontSize: 'var(--fs-caption)',
      fontWeight: 'var(--fw-bold)',
      padding: '2px 8px',
      borderRadius: 'var(--radius-sm)',
      fontFamily: 'var(--font-sans)',
      lineHeight: 1.5,
      ...TONES[tone],
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const PAD = {
  sm: '0.4rem 0.9rem',
  md: '0.6rem 1.2rem',
  lg: '0.85rem 1.75rem'
};
const FS = {
  sm: '0.85rem',
  md: '0.95rem',
  lg: '1rem'
};
const RADIUS = {
  sm: 8,
  md: 12,
  lg: 14
};

/**
 * Takziv primary action button. Brass fill is the one "do this" color;
 * secondary is a hairline outline; ghost is text-only.
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  as = 'button',
  style = {},
  ...rest
}) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: PAD[size],
    fontSize: FS[size],
    fontFamily: 'var(--font-sans)',
    fontWeight: 'var(--fw-bold)',
    borderRadius: RADIUS[size],
    border: '1px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    width: fullWidth ? '100%' : 'auto',
    textDecoration: 'none',
    lineHeight: 1.2,
    boxSizing: 'border-box',
    transition: 'box-shadow var(--dur-fast) var(--ease), background var(--dur-fast) var(--ease)'
  };
  const variants = {
    primary: {
      background: 'var(--brass)',
      color: 'var(--accent-text)',
      boxShadow: 'var(--shadow-cta)'
    },
    secondary: {
      background: 'transparent',
      color: 'var(--ink)',
      borderColor: 'var(--line)',
      fontWeight: 'var(--fw-semibold)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--brass)',
      fontWeight: 'var(--fw-semibold)'
    },
    dark: {
      background: 'var(--ink)',
      color: 'var(--white)'
    }
  };
  const Tag = as;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    style: {
      ...base,
      ...variants[variant],
      ...style
    },
    disabled: Tag === 'button' ? disabled : undefined
  }, rest), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const RADII = {
  lg: 'var(--radius-lg)',
  xl: 'var(--radius-xl)',
  '2xl': 'var(--radius-2xl)'
};

/**
 * The Takziv surface. Light card by default; `tone="dark"` inverts to forest
 * ink with white text (net-worth / health cards). Optional colored top accent.
 */
function Card({
  children,
  tone = 'light',
  radius = 'xl',
  accent,
  shadow = false,
  style = {},
  ...rest
}) {
  const tones = {
    light: {
      background: 'var(--surface-card)',
      color: 'var(--text-body)'
    },
    paper: {
      background: 'var(--paper)',
      color: 'var(--text-body)'
    },
    dark: {
      background: 'var(--surface-dark)',
      color: 'var(--text-on-dark)'
    }
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      borderRadius: RADII[radius] || radius,
      padding: '1.25rem',
      boxSizing: 'border-box',
      boxShadow: shadow ? 'var(--shadow-card)' : 'none',
      ...(accent ? {
        borderTop: `var(--border-accent) solid ${accent}`
      } : null),
      ...tones[tone],
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Takziv text field. Paper fill, hairline border, 12px radius, right-aligned
 * for Hebrew. Shows a brass focus ring.
 */
function Input({
  style = {},
  onFocus,
  onBlur,
  ...rest
}) {
  const [focused, setFocused] = React.useState(false);
  return /*#__PURE__*/React.createElement("input", _extends({
    onFocus: e => {
      setFocused(true);
      onFocus && onFocus(e);
    },
    onBlur: e => {
      setFocused(false);
      onBlur && onBlur(e);
    },
    style: {
      padding: '0.75rem 1rem',
      border: `1px solid ${focused ? 'var(--brass)' : 'var(--line)'}`,
      borderRadius: 'var(--radius-md)',
      background: 'var(--surface-input)',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--fs-body)',
      color: 'var(--ink)',
      outline: 'none',
      textAlign: 'right',
      boxSizing: 'border-box',
      width: '100%',
      transition: 'border-color var(--dur-fast) var(--ease)',
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Input.jsx", error: String((e && e.message) || e) }); }

// components/core/KindToggle.jsx
try { (() => {
/**
 * Transaction-kind switch. Two pills; the active one fills with income (forest)
 * or expense (terracotta).
 */
function KindToggle({
  value = 'expense',
  onChange,
  style = {}
}) {
  const opts = [{
    value: 'expense',
    label: 'הוצאה',
    color: 'var(--expense)'
  }, {
    value: 'income',
    label: 'הכנסה',
    color: 'var(--income)'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      ...style
    }
  }, opts.map(o => {
    const active = o.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: o.value,
      onClick: () => onChange && onChange(o.value),
      style: {
        flex: 1,
        padding: '0.5rem',
        border: `1px solid ${active ? o.color : 'var(--line)'}`,
        borderRadius: 'var(--radius-md)',
        background: active ? o.color : 'transparent',
        color: active ? 'var(--white)' : 'var(--muted)',
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
        fontWeight: 'var(--fw-semibold)',
        fontSize: 'var(--fs-sm)',
        transition: 'all var(--dur-fast) var(--ease)'
      }
    }, o.label);
  }));
}
Object.assign(__ds_scope, { KindToggle });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/KindToggle.jsx", error: String((e && e.message) || e) }); }

// components/core/Logo.jsx
try { (() => {
/**
 * Takziv brand lockup — the logomark (forest tile + brass roof over a ₪ ledger)
 * with an optional תקציב wordmark. `onDark` switches the wordmark to white.
 */
function Logo({
  size = 28,
  wordmark = true,
  onDark = false,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      ...style
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 64 64",
    style: {
      flexShrink: 0
    },
    "aria-label": "\u05EA\u05E7\u05E6\u05D9\u05D1"
  }, /*#__PURE__*/React.createElement("rect", {
    width: "64",
    height: "64",
    rx: "14",
    fill: "#1B2A27"
  }), /*#__PURE__*/React.createElement("polygon", {
    points: "32,14 50,32 14,32",
    fill: "#C9A23F"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "18",
    y: "31",
    width: "28",
    height: "17",
    rx: "1",
    fill: "#C9A23F",
    fillOpacity: "0.18",
    stroke: "#C9A23F",
    strokeWidth: "2"
  }), /*#__PURE__*/React.createElement("text", {
    x: "32",
    y: "43",
    textAnchor: "middle",
    fontFamily: "Arial, sans-serif",
    fontSize: "12",
    fontWeight: "bold",
    fill: "#C9A23F"
  }, "\u20AA")), wordmark && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 'var(--fw-black)',
      fontSize: size * 0.05 + 'rem',
      color: onDark ? 'var(--white)' : 'var(--ink)',
      lineHeight: 1
    }
  }, "\u05EA\u05E7\u05E6\u05D9\u05D1"));
}
Object.assign(__ds_scope, { Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Logo.jsx", error: String((e && e.message) || e) }); }

// components/core/MoneyAmount.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const ILS = new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
  maximumFractionDigits: 0
});

/**
 * A monetary figure, the Takziv way: Heebo, tabular-nums, ₪ via he-IL,
 * income/expense color, and an optional leading + / − sign.
 */
function MoneyAmount({
  value = 0,
  kind = 'neutral',
  // 'income' | 'expense' | 'neutral' | 'auto'
  showSign = false,
  onDark = false,
  size = '1rem',
  weight = 'var(--fw-bold)',
  style = {},
  ...rest
}) {
  const resolved = kind === 'auto' ? value >= 0 ? 'income' : 'expense' : kind;
  const colors = onDark ? {
    income: 'var(--on-dark-pos)',
    expense: 'var(--on-dark-neg)',
    neutral: 'var(--white)'
  } : {
    income: 'var(--income)',
    expense: 'var(--expense)',
    neutral: 'var(--text-strong)'
  };
  const sign = showSign ? resolved === 'income' ? '+' : resolved === 'expense' ? '−' : '' : '';
  const formatted = ILS.format(Math.abs(value));
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: weight,
      fontSize: size,
      fontVariantNumeric: 'tabular-nums',
      color: colors[resolved],
      whiteSpace: 'nowrap',
      ...style
    }
  }, rest), sign, formatted);
}
Object.assign(__ds_scope, { MoneyAmount });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/MoneyAmount.jsx", error: String((e && e.message) || e) }); }

// components/core/ProgressBar.jsx
try { (() => {
/**
 * Savings-goal / budget progress bar. Track in --line, fill in brass (or a
 * passed color), animated width.
 */
function ProgressBar({
  pct = 0,
  color = 'var(--brass)',
  height = 8,
  style = {}
}) {
  const clamped = Math.max(0, Math.min(100, pct));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--line)',
      borderRadius: 'var(--radius-sm)',
      height,
      overflow: 'hidden',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: color,
      borderRadius: 'var(--radius-sm)',
      height: '100%',
      width: `${clamped}%`,
      transition: 'width var(--dur-bar) var(--ease)'
    }
  }));
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/core/SectionHeader.jsx
try { (() => {
/**
 * Section title + optional trailing ghost action ("הכל" / "+ הוסף"), the
 * pattern atop every dashboard section.
 */
function SectionHeader({
  title,
  actionLabel,
  onAction,
  children,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.75rem',
      ...style
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 'var(--fw-bold)',
      fontSize: 'var(--fs-h3)',
      color: 'var(--ink)',
      margin: 0
    }
  }, title), children ? children : actionLabel && /*#__PURE__*/React.createElement("button", {
    onClick: onAction,
    style: {
      padding: '0.3rem 0.75rem',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-sm)',
      background: 'transparent',
      cursor: 'pointer',
      color: 'var(--brass)',
      fontFamily: 'var(--font-sans)',
      fontWeight: 'var(--fw-semibold)',
      fontSize: 'var(--fs-sm)'
    }
  }, actionLabel));
}
Object.assign(__ds_scope, { SectionHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/SectionHeader.jsx", error: String((e && e.message) || e) }); }

// components/core/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Takziv dropdown — same field styling as Input. Children are <option>s.
 */
function Select({
  children,
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("select", _extends({
    style: {
      padding: '0.7rem 1rem',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-md)',
      background: 'var(--surface-input)',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--fs-sm)',
      color: 'var(--ink)',
      textAlign: 'right',
      outline: 'none',
      boxSizing: 'border-box',
      width: '100%',
      cursor: 'pointer',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Select.jsx", error: String((e && e.message) || e) }); }

// components/core/Tabs.jsx
try { (() => {
/**
 * Login-style tabs. Outline pills; the active one flips to ink fill / white text.
 * Pass items as [{ value, label }] and control with `value` + `onChange`.
 */
function Tabs({
  items = [],
  value,
  onChange,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      ...style
    }
  }, items.map(it => {
    const active = it.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: it.value,
      onClick: () => onChange && onChange(it.value),
      style: {
        flex: 1,
        padding: '0.5rem',
        border: `1px solid ${active ? 'var(--ink)' : 'var(--line)'}`,
        borderRadius: 'var(--radius-md)',
        background: active ? 'var(--ink)' : 'transparent',
        color: active ? 'var(--white)' : 'var(--muted)',
        cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--fs-sm)',
        fontWeight: active ? 'var(--fw-semibold)' : 'var(--fw-regular)',
        transition: 'all var(--dur-fast) var(--ease)'
      }
    }, it.label);
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tabs.jsx", error: String((e && e.message) || e) }); }

// design_handoff_main_screen/redesign-data.jsx
try { (() => {
// Takziv — main-screen redesign: shared data
// Hero concept: "פנוי להוצאה" = liquid balance minus fixed obligations still
// pending this month. Framed daily + monthly, with category budgets up front.
window.TZ_REDESIGN = {
  user: {
    name: 'דנה'
  },
  available: 4360,
  // liquid (9,200) − pending fixed (4,840)
  liquid: 9200,
  pendingFixed: 4840,
  daysLeft: 20,
  perDay: 218,
  // available / daysLeft
  todayAllowance: 218,
  todaySpent: 12,
  // spent so far today

  month: {
    income: 14200,
    expense: 9840
  },
  budgets: [{
    name: 'אוכל',
    icon: '🛒',
    planned: 2000,
    spent: 1640
  }, {
    name: 'מסעדות',
    icon: '🍽',
    planned: 600,
    spent: 720
  },
  // over
  {
    name: 'תחבורה',
    icon: '🚗',
    planned: 900,
    spent: 540
  }, {
    name: 'פנאי',
    icon: '🎬',
    planned: 500,
    spent: 180
  }, {
    name: 'דיור',
    icon: '🏠',
    planned: 3800,
    spent: 3800
  },
  // fixed
  {
    name: 'אחר',
    icon: '📦',
    planned: 400,
    spent: 260
  }],
  upcoming: [{
    id: 1,
    name: 'שכירות',
    icon: '🏠',
    date: '18.6',
    days: 2,
    amount: 3800
  }, {
    id: 2,
    name: 'חשמל',
    icon: '⚡',
    date: '22.6',
    days: 6,
    amount: 340
  }, {
    id: 3,
    name: 'Netflix',
    icon: '🎬',
    date: '24.6',
    days: 8,
    amount: 55
  }],
  transactions: [{
    id: 1,
    desc: 'סופר רמי לוי',
    icon: '🛒',
    date: 'היום',
    amount: 642,
    kind: 'expense'
  }, {
    id: 2,
    desc: 'דלק פז',
    icon: '🚗',
    date: 'אתמול',
    amount: 310,
    kind: 'expense'
  }, {
    id: 3,
    desc: 'משכורת',
    icon: '💼',
    date: '12.6',
    amount: 14200,
    kind: 'income'
  }, {
    id: 4,
    desc: 'קפה ארומה',
    icon: '☕',
    date: '12.6',
    amount: 18,
    kind: 'expense'
  }],
  overBudget: ['מסעדות'],
  categoryOptions: ['🛒 אוכל', '🍽 מסעדות', '🚗 תחבורה', '🎬 פנאי', '🏠 דיור', '📦 אחר'],
  accountOptions: ['עו״ש משותף', 'אשראי', 'מזומן']
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "design_handoff_main_screen/redesign-data.jsx", error: String((e && e.message) || e) }); }

// design_handoff_main_screen/redesign-shared.jsx
try { (() => {
// Takziv — main-screen redesign: 3 variations, composed from DS components.
const RD = window.TakzivDesignSystem_57976b;
const {
  Card,
  Button,
  MoneyAmount,
  Badge,
  ProgressBar,
  Select,
  Input,
  KindToggle
} = RD;
const {
  useState
} = React;
const rfmt = n => new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
  maximumFractionDigits: 0
}).format(n ?? 0);
function budgetMeta(b) {
  const pct = b.planned ? b.spent / b.planned : 0;
  const remaining = b.planned - b.spent;
  const over = remaining < 0;
  const color = over ? 'var(--expense)' : pct > 0.85 ? 'var(--brass)' : 'var(--income)';
  return {
    pct: Math.min(pct * 100, 100),
    remaining,
    over,
    color
  };
}

// ---------- shared chrome ----------
function Header({
  name
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 1.15rem 0.5rem'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: 'var(--muted)',
      fontSize: '0.8rem'
    }
  }, "\u05E2\u05E8\u05D1 \u05D8\u05D5\u05D1,"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: '1.25rem',
      color: 'var(--ink)'
    }
  }, name)), /*#__PURE__*/React.createElement("svg", {
    width: "30",
    height: "30",
    viewBox: "0 0 64 64",
    style: {
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("rect", {
    width: "64",
    height: "64",
    rx: "14",
    fill: "#1B2A27"
  }), /*#__PURE__*/React.createElement("polygon", {
    points: "32,14 50,32 14,32",
    fill: "#C9A23F"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "18",
    y: "31",
    width: "28",
    height: "17",
    rx: "1",
    fill: "#C9A23F",
    fillOpacity: "0.18",
    stroke: "#C9A23F",
    strokeWidth: "2"
  }), /*#__PURE__*/React.createElement("text", {
    x: "32",
    y: "43",
    textAnchor: "middle",
    fontFamily: "Arial,sans-serif",
    fontSize: "12",
    fontWeight: "bold",
    fill: "#C9A23F"
  }, "\u20AA")));
}
function MonthStrip({
  m
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      background: 'var(--card)',
      borderRadius: 'var(--radius-md)',
      padding: '0.7rem 0.85rem'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: 'var(--muted)',
      fontSize: '0.72rem'
    }
  }, "\u05D4\u05DB\u05E0\u05E1\u05D5\u05EA \u05D4\u05D7\u05D5\u05D3\u05E9"), /*#__PURE__*/React.createElement(MoneyAmount, {
    value: m.income,
    kind: "income",
    size: "1.05rem"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      background: 'var(--card)',
      borderRadius: 'var(--radius-md)',
      padding: '0.7rem 0.85rem'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: 'var(--muted)',
      fontSize: '0.72rem'
    }
  }, "\u05D4\u05D5\u05E6\u05D0\u05D5\u05EA \u05D4\u05D7\u05D5\u05D3\u05E9"), /*#__PURE__*/React.createElement(MoneyAmount, {
    value: m.expense,
    kind: "expense",
    size: "1.05rem"
  })));
}
function OverAlert({
  data
}) {
  const over = data.budgets.find(b => b.spent > b.planned);
  if (!over) return null;
  const by = over.spent - over.planned;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--alert-bg)',
      border: '1px solid var(--alert-border)',
      borderRadius: 'var(--radius-md)',
      padding: '0.6rem 0.85rem',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      color: 'var(--alert-text)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '1rem'
    }
  }, "\u26A0"), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: '0.82rem'
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      fontWeight: 700
    }
  }, over.icon, " ", over.name), " \u05D7\u05E8\u05D2\u05D5 \u05D1\u05BE", rfmt(by)), /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: 0.6
    }
  }, "\u203A"));
}
function CardShell({
  title,
  action,
  children,
  pad = '0.9rem 1rem'
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--card)',
      borderRadius: 'var(--radius-lg)',
      padding: pad
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.7rem'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: '0.95rem',
      color: 'var(--ink)',
      margin: 0
    }
  }, title), action && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--brass)',
      fontWeight: 600,
      fontSize: '0.82rem'
    }
  }, action)), children);
}
function CategoryBar({
  b
}) {
  const m = budgetMeta(b);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      color: 'var(--ink)',
      fontSize: '0.88rem'
    }
  }, b.icon, " ", b.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.8rem',
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      color: m.over ? 'var(--expense)' : 'var(--ink)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, m.over ? `חריגה ${rfmt(-m.remaining)}` : `נשאר ${rfmt(m.remaining)}`)), /*#__PURE__*/React.createElement(ProgressBar, {
    pct: m.pct,
    color: m.color,
    height: 7
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-start',
      marginTop: 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.68rem',
      color: 'var(--muted)',
      fontFamily: 'var(--font-display)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, rfmt(b.spent), " / ", rfmt(b.planned))));
}
function CategoryTile({
  b
}) {
  const m = budgetMeta(b);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--card)',
      borderRadius: 'var(--radius-md)',
      padding: '0.8rem 0.85rem',
      borderTop: `3px solid ${m.color}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '1rem'
    }
  }, b.icon), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      color: 'var(--ink)',
      fontSize: '0.82rem'
    }
  }, b.name)), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 2px',
      fontSize: '0.66rem',
      color: 'var(--muted)'
    }
  }, m.over ? 'חריגה' : 'נשאר'), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 7
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: '1.15rem',
      color: m.over ? 'var(--expense)' : 'var(--ink)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, rfmt(Math.abs(m.remaining)))), /*#__PURE__*/React.createElement(ProgressBar, {
    pct: m.pct,
    color: m.color,
    height: 6
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '5px 0 0',
      fontSize: '0.64rem',
      color: 'var(--muted)',
      fontFamily: 'var(--font-display)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, rfmt(b.spent), " / ", rfmt(b.planned)));
}
function TxList({
  transactions
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, transactions.map((t, i) => /*#__PURE__*/React.createElement("div", {
    key: t.id,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '0.55rem 0',
      borderBottom: i < transactions.length - 1 ? '1px solid var(--line)' : 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 32,
      height: 32,
      borderRadius: '50%',
      background: 'var(--paper)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.95rem',
      flexShrink: 0
    }
  }, t.icon), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontWeight: 600,
      color: 'var(--ink)',
      fontSize: '0.88rem',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, t.desc), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: 'var(--muted)',
      fontSize: '0.72rem'
    }
  }, t.date)), /*#__PURE__*/React.createElement(MoneyAmount, {
    value: t.amount,
    kind: t.kind,
    showSign: true,
    size: "0.92rem"
  }))));
}
function UpcomingList({
  upcoming
}) {
  const total = upcoming.reduce((s, u) => s + u.amount, 0);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: '0.6rem'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: '0.95rem',
      color: 'var(--ink)',
      margin: 0
    }
  }, "\u05E2\u05D5\u05DE\u05D3 \u05DC\u05D7\u05D9\u05D5\u05D1 \xB7 7 \u05D9\u05DE\u05D9\u05DD"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: '0.85rem',
      color: 'var(--expense)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, rfmt(total))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, upcoming.map((u, i) => /*#__PURE__*/React.createElement("div", {
    key: u.id,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '0.45rem 0',
      borderBottom: i < upcoming.length - 1 ? '1px solid var(--line)' : 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.95rem'
    }
  }, u.icon), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontWeight: 600,
      color: 'var(--ink)',
      fontSize: '0.85rem'
    }
  }, u.name), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: 'var(--muted)',
      fontSize: '0.72rem'
    }
  }, u.date, " \xB7 ", u.days <= 1 ? 'מחר' : `עוד ${u.days} ימים`)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: '0.85rem',
      color: 'var(--ink)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, rfmt(u.amount))))));
}

// ---------- daily ring (variation B) ----------
function DailyRing({
  allowance,
  spent
}) {
  const remaining = Math.max(allowance - spent, 0);
  const frac = Math.min(spent / allowance, 1);
  const R = 52,
    cx = 64,
    cy = 64,
    circ = 2 * Math.PI * R;
  return /*#__PURE__*/React.createElement("div", {
    dir: "ltr",
    style: {
      position: 'relative',
      width: 128,
      height: 128,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "128",
    height: "128",
    viewBox: "0 0 128 128"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: cx,
    cy: cy,
    r: R,
    fill: "none",
    stroke: "rgba(255,255,255,0.14)",
    strokeWidth: 10
  }), /*#__PURE__*/React.createElement("circle", {
    cx: cx,
    cy: cy,
    r: R,
    fill: "none",
    stroke: "#6EE7B7",
    strokeWidth: 10,
    strokeLinecap: "round",
    strokeDasharray: `${(1 - frac) * circ} ${circ}`,
    transform: `rotate(-90 ${cx} ${cy})`,
    style: {
      transition: 'stroke-dasharray 0.6s ease'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.6rem',
      color: 'var(--on-dark-sub)'
    }
  }, "\u05E0\u05E9\u05D0\u05E8 \u05DC\u05D4\u05D9\u05D5\u05DD"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: '1.7rem',
      color: '#fff',
      lineHeight: 1.1,
      fontVariantNumeric: 'tabular-nums'
    }
  }, rfmt(remaining)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.58rem',
      color: 'var(--on-dark-faint)'
    }
  }, "\u05DE\u05EA\u05D5\u05DA ", rfmt(allowance))));
}

// ---------- quick-add bottom sheet ----------
function QuickAddSheet({
  data,
  onClose,
  onAdd
}) {
  const [kind, setKind] = useState('expense');
  const [amount, setAmount] = useState('');
  return /*#__PURE__*/React.createElement("div", {
    onClick: e => e.target === e.currentTarget && onClose(),
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--scrim)',
      display: 'flex',
      alignItems: 'flex-end',
      zIndex: 100,
      animation: 'tz-fade 0.2s ease'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--card)',
      borderRadius: '22px 22px 0 0',
      padding: '1rem 1.5rem 1.75rem',
      width: '100%',
      boxSizing: 'border-box',
      animation: 'tz-rise 0.28s ease'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 4,
      background: 'var(--line)',
      borderRadius: 2,
      margin: '0 auto 1rem'
    }
  }), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      color: 'var(--ink)',
      margin: '0 0 0.9rem',
      fontSize: '1.05rem'
    }
  }, "\u05D4\u05D5\u05E1\u05E3 \u05D4\u05D5\u05E6\u05D0\u05D4"), /*#__PURE__*/React.createElement(KindToggle, {
    value: kind,
    onChange: setKind,
    style: {
      marginBottom: '0.9rem'
    }
  }), /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      onAdd({
        kind,
        amount: parseFloat(amount) || 0
      });
    },
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    placeholder: "0",
    min: "0",
    value: amount,
    onChange: e => setAmount(e.target.value),
    inputMode: "decimal",
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: '2rem',
      textAlign: 'center',
      border: 'none',
      borderBottom: '2px solid var(--line)',
      background: 'transparent',
      color: 'var(--ink)',
      padding: '0.4rem',
      outline: 'none',
      fontVariantNumeric: 'tabular-nums'
    }
  }), /*#__PURE__*/React.createElement(Select, {
    defaultValue: ""
  }, ['בחר קטגוריה', ...data.categoryOptions].map((c, i) => /*#__PURE__*/React.createElement("option", {
    key: c,
    value: i ? c : ''
  }, c))), /*#__PURE__*/React.createElement(Select, {
    defaultValue: ""
  }, ['חשבון', ...data.accountOptions].map((c, i) => /*#__PURE__*/React.createElement("option", {
    key: c,
    value: i ? c : ''
  }, c))), /*#__PURE__*/React.createElement(Input, {
    placeholder: "\u05EA\u05D9\u05D0\u05D5\u05E8 (\u05D0\u05D5\u05E4\u05E6\u05D9\u05D5\u05E0\u05DC\u05D9)"
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    type: "submit",
    style: {
      background: kind === 'income' ? 'var(--income)' : 'var(--expense)',
      boxShadow: 'none',
      borderRadius: 14,
      marginTop: 2
    }
  }, "\u05E9\u05DE\u05D5\u05E8"))));
}
function Fab({
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      position: 'absolute',
      bottom: 18,
      insetInlineEnd: 18,
      width: 56,
      height: 56,
      borderRadius: '50%',
      background: 'var(--brass)',
      color: '#fff',
      border: 'none',
      fontSize: '1.8rem',
      cursor: 'pointer',
      boxShadow: 'var(--shadow-cta)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 300,
      lineHeight: 1,
      zIndex: 20
    }
  }, "+");
}
Object.assign(window, {
  rfmt,
  budgetMeta,
  Header,
  MonthStrip,
  OverAlert,
  CardShell,
  CategoryBar,
  CategoryTile,
  TxList,
  UpcomingList,
  DailyRing,
  QuickAddSheet,
  Fab
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "design_handoff_main_screen/redesign-shared.jsx", error: String((e && e.message) || e) }); }

// design_handoff_main_screen/redesign-variations.jsx
try { (() => {
// Takziv — main-screen redesign: the 3 variation screens
const V = window.TakzivDesignSystem_57976b;
const {
  Card: VCard,
  MoneyAmount: VMoney
} = V;
const {
  Header: RHeader,
  MonthStrip: RMonth,
  OverAlert: ROver,
  CardShell: RShell,
  CategoryBar: RBar,
  CategoryTile: RTile,
  TxList: RTx,
  UpcomingList: RUp,
  DailyRing: RRing,
  QuickAddSheet: RSheet,
  Fab: RFab,
  rfmt: vfmt
} = window;
const {
  useState: vState
} = React;
function useSheet() {
  const [open, setOpen] = vState(false);
  const [extra, setExtra] = vState([]);
  const add = ({
    kind,
    amount
  }) => {
    setExtra(x => [{
      id: 'n' + Date.now(),
      desc: kind === 'income' ? 'הכנסה חדשה' : 'הוצאה חדשה',
      icon: kind === 'income' ? '💼' : '🛒',
      date: 'הרגע',
      amount,
      kind
    }, ...x]);
    setOpen(false);
  };
  return {
    open,
    setOpen,
    extra,
    add
  };
}
const Stack = ({
  children
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
    padding: '0.5rem 1.15rem 0'
  }
}, children);
const Screen = ({
  children
}) => /*#__PURE__*/React.createElement("div", {
  className: "scroll"
}, /*#__PURE__*/React.createElement("div", {
  style: {
    paddingBottom: 90
  }
}, children));

// ============ Variation A — calm monthly + budgets ============
function MainA({
  data
}) {
  const s = useSheet();
  const tx = [...s.extra, ...data.transactions];
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Screen, null, /*#__PURE__*/React.createElement(RHeader, {
    name: data.user.name
  }), /*#__PURE__*/React.createElement(Stack, null, /*#__PURE__*/React.createElement(VCard, {
    tone: "dark",
    radius: "xl",
    style: {
      padding: '1.3rem 1.3rem 1.1rem'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: 'var(--on-dark-sub)',
      fontSize: '0.85rem'
    }
  }, "\u05E4\u05E0\u05D5\u05D9 \u05DC\u05D4\u05D5\u05E6\u05D0\u05D4"), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0.15rem 0 0.1rem'
    }
  }, /*#__PURE__*/React.createElement(VMoney, {
    value: data.available,
    onDark: true,
    size: "2.5rem",
    weight: "var(--fw-black)"
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 0.9rem',
      color: 'var(--on-dark-faint)',
      fontSize: '0.74rem'
    }
  }, "\u05D0\u05D7\u05E8\u05D9 \u05D4\u05D5\u05E8\u05D0\u05D5\u05EA \u05E7\u05D1\u05E2 \u05D5\u05EA\u05E9\u05DC\u05D5\u05DE\u05D9\u05DD \u05E7\u05D1\u05D5\u05E2\u05D9\u05DD"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      background: 'var(--on-dark-fill)',
      borderRadius: 'var(--radius-md)',
      padding: '0.55rem 0.7rem'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: 'var(--on-dark-sub)',
      fontSize: '0.66rem'
    }
  }, "\u05D1\u05E2\u05E8\u05DA \u05DC\u05D9\u05D5\u05DD"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '2px 0 0',
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: '1.05rem',
      color: '#fff',
      fontVariantNumeric: 'tabular-nums'
    }
  }, "\u2248 ", vfmt(data.perDay))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      background: 'var(--on-dark-fill)',
      borderRadius: 'var(--radius-md)',
      padding: '0.55rem 0.7rem'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: 'var(--on-dark-sub)',
      fontSize: '0.66rem'
    }
  }, "\u05DC\u05E1\u05D5\u05E3 \u05D4\u05D7\u05D5\u05D3\u05E9"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '2px 0 0',
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: '1.05rem',
      color: '#fff'
    }
  }, data.daysLeft, " \u05D9\u05DE\u05D9\u05DD")))), /*#__PURE__*/React.createElement(RMonth, {
    m: data.month
  }), /*#__PURE__*/React.createElement(ROver, {
    data: data
  }), /*#__PURE__*/React.createElement(RShell, {
    title: "\u05EA\u05E7\u05E6\u05D9\u05D1 \u05DC\u05E4\u05D9 \u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D4",
    action: "\u05D4\u05DB\u05DC"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 13
    }
  }, data.budgets.map(b => /*#__PURE__*/React.createElement(RBar, {
    key: b.name,
    b: b
  })))), /*#__PURE__*/React.createElement(RShell, null, /*#__PURE__*/React.createElement(RUp, {
    upcoming: data.upcoming
  })), /*#__PURE__*/React.createElement(RShell, {
    title: "\u05EA\u05E0\u05D5\u05E2\u05D5\u05EA \u05D0\u05D7\u05E8\u05D5\u05E0\u05D5\u05EA",
    action: "\u05D4\u05DB\u05DC"
  }, /*#__PURE__*/React.createElement(RTx, {
    transactions: tx
  })))), /*#__PURE__*/React.createElement(RFab, {
    onClick: () => s.setOpen(true)
  }), s.open && /*#__PURE__*/React.createElement(RSheet, {
    data: data,
    onClose: () => s.setOpen(false),
    onAdd: s.add
  }));
}

// ============ Variation B — daily dial first ============
function MainB({
  data
}) {
  const s = useSheet();
  const tx = [...s.extra, ...data.transactions];
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Screen, null, /*#__PURE__*/React.createElement(RHeader, {
    name: data.user.name
  }), /*#__PURE__*/React.createElement(Stack, null, /*#__PURE__*/React.createElement(VCard, {
    tone: "dark",
    radius: "xl",
    style: {
      padding: '1.2rem 1.2rem 1rem'
    }
  }, /*#__PURE__*/React.createElement(RRing, {
    allowance: data.todayAllowance,
    spent: data.todaySpent
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: '1rem',
      paddingTop: '0.85rem',
      borderTop: '1px solid var(--on-dark-track)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--on-dark-sub)',
      fontSize: '0.78rem'
    }
  }, "\u05E4\u05E0\u05D5\u05D9 \u05E2\u05D3 \u05E1\u05D5\u05E3 \u05D4\u05D7\u05D5\u05D3\u05E9"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(VMoney, {
    value: data.available,
    onDark: true,
    size: "1.2rem",
    weight: "var(--fw-black)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--on-dark-faint)',
      fontSize: '0.68rem'
    }
  }, "\xB7 ", data.daysLeft, " \u05D9\u05DE\u05D9\u05DD")))), /*#__PURE__*/React.createElement(RShell, {
    title: "\u05EA\u05E7\u05E6\u05D9\u05D1 \u05DC\u05E4\u05D9 \u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D4",
    action: "\u05D4\u05DB\u05DC"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 13
    }
  }, data.budgets.slice(0, 4).map(b => /*#__PURE__*/React.createElement(RBar, {
    key: b.name,
    b: b
  })))), /*#__PURE__*/React.createElement(ROver, {
    data: data
  }), /*#__PURE__*/React.createElement(RMonth, {
    m: data.month
  }), /*#__PURE__*/React.createElement(RShell, null, /*#__PURE__*/React.createElement(RUp, {
    upcoming: data.upcoming
  })), /*#__PURE__*/React.createElement(RShell, {
    title: "\u05EA\u05E0\u05D5\u05E2\u05D5\u05EA \u05D0\u05D7\u05E8\u05D5\u05E0\u05D5\u05EA",
    action: "\u05D4\u05DB\u05DC"
  }, /*#__PURE__*/React.createElement(RTx, {
    transactions: tx
  })))), /*#__PURE__*/React.createElement(RFab, {
    onClick: () => s.setOpen(true)
  }), s.open && /*#__PURE__*/React.createElement(RSheet, {
    data: data,
    onClose: () => s.setOpen(false),
    onAdd: s.add
  }));
}

// ============ Variation C — budget-led category grid ============
function MainC({
  data
}) {
  const s = useSheet();
  const tx = [...s.extra, ...data.transactions];
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Screen, null, /*#__PURE__*/React.createElement(RHeader, {
    name: data.user.name
  }), /*#__PURE__*/React.createElement(Stack, null, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--card)',
      borderRadius: 'var(--radius-lg)',
      padding: '0.85rem 1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTop: '3px solid var(--brass)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: 'var(--muted)',
      fontSize: '0.74rem'
    }
  }, "\u05E4\u05E0\u05D5\u05D9 \u05DC\u05D4\u05D5\u05E6\u05D0\u05D4"), /*#__PURE__*/React.createElement(VMoney, {
    value: data.available,
    size: "1.7rem",
    weight: "var(--fw-black)"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      background: 'var(--paper)',
      borderRadius: 'var(--radius-pill)',
      padding: '0.35rem 0.75rem',
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: '0.78rem',
      color: 'var(--ink)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, "\u2248 ", vfmt(data.perDay), " / \u05D9\u05D5\u05DD")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      margin: '0 2px 0.6rem'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: '0.95rem',
      color: 'var(--ink)',
      margin: 0
    }
  }, "\u05EA\u05E7\u05E6\u05D9\u05D1 \u05D4\u05D7\u05D5\u05D3\u05E9"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--brass)',
      fontWeight: 600,
      fontSize: '0.82rem'
    }
  }, "\u05D4\u05DB\u05DC")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10
    }
  }, data.budgets.map(b => /*#__PURE__*/React.createElement(RTile, {
    key: b.name,
    b: b
  })))), /*#__PURE__*/React.createElement(RMonth, {
    m: data.month
  }), /*#__PURE__*/React.createElement(RShell, null, /*#__PURE__*/React.createElement(RUp, {
    upcoming: data.upcoming
  })), /*#__PURE__*/React.createElement(RShell, {
    title: "\u05EA\u05E0\u05D5\u05E2\u05D5\u05EA \u05D0\u05D7\u05E8\u05D5\u05E0\u05D5\u05EA",
    action: "\u05D4\u05DB\u05DC"
  }, /*#__PURE__*/React.createElement(RTx, {
    transactions: tx
  })))), /*#__PURE__*/React.createElement(RFab, {
    onClick: () => s.setOpen(true)
  }), s.open && /*#__PURE__*/React.createElement(RSheet, {
    data: data,
    onClose: () => s.setOpen(false),
    onAdd: s.add
  }));
}
Object.assign(window, {
  MainA,
  MainB,
  MainC
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "design_handoff_main_screen/redesign-variations.jsx", error: String((e && e.message) || e) }); }

// ui_kits/takziv-app/charts.jsx
try { (() => {
// Takziv UI kit — hand-built SVG charts (forest/brass palette, dir=ltr internally)
const fmtILS = n => new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
  maximumFractionDigits: 0
}).format(n ?? 0);
const CAT = ['#2F6B4F', '#C9A23F', '#4A7FA5', '#8B5CF6', '#E07B30', '#B0573C', '#1B879E', '#6B746E', '#9B4F8B', '#3D7A5E'];

// ---- 0–100 financial-health score ring ----
function ScoreRing({
  score
}) {
  const R = 38,
    cx = 44,
    cy = 44,
    circ = 2 * Math.PI * R;
  const dash = score / 100 * circ;
  const color = score >= 75 ? '#2F6B4F' : score >= 50 ? '#C9A23F' : '#B0573C';
  return /*#__PURE__*/React.createElement("div", {
    dir: "ltr",
    style: {
      position: 'relative',
      width: 88,
      height: 88,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "88",
    height: "88",
    viewBox: "0 0 88 88"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: cx,
    cy: cy,
    r: R,
    fill: "none",
    stroke: "rgba(255,255,255,0.15)",
    strokeWidth: 8
  }), /*#__PURE__*/React.createElement("circle", {
    cx: cx,
    cy: cy,
    r: R,
    fill: "none",
    stroke: color,
    strokeWidth: 8,
    strokeDasharray: `${dash} ${circ}`,
    strokeLinecap: "round",
    transform: `rotate(-90 ${cx} ${cy})`,
    style: {
      transition: 'stroke-dasharray 0.6s ease'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: '1.5rem',
      color: '#fff',
      lineHeight: 1
    }
  }, score), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.58rem',
      color: 'rgba(255,255,255,0.6)'
    }
  }, "\u05DE\u05EA\u05D5\u05DA 100")));
}

// ---- 12-month net-worth sparkline ----
function NetWorthSparkline({
  data,
  height = 56
}) {
  const W = 280,
    H = height,
    pad = 4;
  const min = Math.min(...data),
    max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => {
    const x = pad + i / (data.length - 1) * (W - pad * 2);
    const y = pad + (1 - (v - min) / span) * (H - pad * 2);
    return [x, y];
  });
  const line = pts.map((p, i) => `${i ? 'L' : 'M'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L ${pts[pts.length - 1][0].toFixed(1)} ${H} L ${pts[0][0].toFixed(1)} ${H} Z`;
  return /*#__PURE__*/React.createElement("div", {
    dir: "ltr"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 ${W} ${H}`,
    style: {
      width: '100%',
      height: 'auto',
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: "nwfill",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#6EE7B7",
    stopOpacity: "0.35"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#6EE7B7",
    stopOpacity: "0"
  }))), /*#__PURE__*/React.createElement("path", {
    d: area,
    fill: "url(#nwfill)"
  }), /*#__PURE__*/React.createElement("path", {
    d: line,
    fill: "none",
    stroke: "#6EE7B7",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })));
}

// ---- grouped income/expense bars ----
function CashflowChart({
  data
}) {
  const W = 340,
    H = 180,
    PAD = {
      top: 16,
      bottom: 36,
      left: 8,
      right: 8
    };
  const chartW = W - PAD.left - PAD.right,
    chartH = H - PAD.top - PAD.bottom;
  const maxVal = Math.max(...data.flatMap(d => [d.income, d.expense]), 1);
  const n = data.length,
    groupW = chartW / n;
  const barW = Math.min(groupW * 0.35, 18),
    gap = barW * 0.4;
  const yLines = 4,
    yStep = maxVal / yLines;
  const monthShort = s => new Date(s + '-01T12:00:00').toLocaleDateString('he-IL', {
    month: 'short'
  });
  return /*#__PURE__*/React.createElement("div", {
    dir: "ltr"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 ${W} ${H}`,
    style: {
      width: '100%',
      height: 'auto',
      overflow: 'visible'
    }
  }, Array.from({
    length: yLines + 1
  }, (_, i) => {
    const y = PAD.top + chartH - i / yLines * chartH;
    return /*#__PURE__*/React.createElement("g", {
      key: i
    }, /*#__PURE__*/React.createElement("line", {
      x1: PAD.left,
      y1: y,
      x2: W - PAD.right,
      y2: y,
      stroke: "#D5D8CF",
      strokeWidth: 0.5,
      strokeDasharray: i === 0 ? '' : '3 3'
    }), i > 0 && /*#__PURE__*/React.createElement("text", {
      x: PAD.left + 2,
      y: y - 3,
      fontSize: 7,
      fill: "#6B746E",
      textAnchor: "start"
    }, fmtILS(i * yStep)));
  }), data.map((d, i) => {
    const cx = PAD.left + i * groupW + groupW / 2;
    const incH = d.income / maxVal * chartH,
      expH = d.expense / maxVal * chartH;
    const baseY = PAD.top + chartH;
    return /*#__PURE__*/React.createElement("g", {
      key: d.month
    }, /*#__PURE__*/React.createElement("rect", {
      x: cx - gap / 2 - barW,
      y: baseY - incH,
      width: barW,
      height: incH,
      fill: "#2F6B4F",
      rx: 2,
      opacity: 0.85
    }), /*#__PURE__*/React.createElement("rect", {
      x: cx + gap / 2,
      y: baseY - expH,
      width: barW,
      height: expH,
      fill: "#B0573C",
      rx: 2,
      opacity: 0.85
    }), /*#__PURE__*/React.createElement("text", {
      x: cx,
      y: baseY + 12,
      fontSize: 8,
      fill: "#6B746E",
      textAnchor: "middle"
    }, monthShort(d.month)));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16,
      justifyContent: 'center',
      marginTop: 4
    }
  }, [['הכנסות', '#2F6B4F'], ['הוצאות', '#B0573C']].map(([label, color]) => /*#__PURE__*/React.createElement("div", {
    key: label,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 10,
      height: 10,
      borderRadius: 2,
      background: color
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.75rem',
      color: '#6B746E',
      fontFamily: 'var(--font-sans)'
    }
  }, label)))));
}

// ---- spending donut with center label + legend ----
function DonutChart({
  data,
  size = 160
}) {
  const cx = size / 2,
    cy = size / 2,
    R = size * 0.38,
    r = size * 0.22,
    gap = 0.02;
  let cum = -Math.PI / 2;
  const slices = data.map((d, i) => {
    const angle = d.pct * 2 * Math.PI * (1 - gap * data.length / (2 * Math.PI));
    const start = cum + (i > 0 ? gap / 2 : 0),
      end = start + angle;
    cum = end + gap / 2;
    const x1 = cx + R * Math.cos(start),
      y1 = cy + R * Math.sin(start);
    const x2 = cx + R * Math.cos(end),
      y2 = cy + R * Math.sin(end);
    const ix1 = cx + r * Math.cos(end),
      iy1 = cy + r * Math.sin(end);
    const ix2 = cx + r * Math.cos(start),
      iy2 = cy + r * Math.sin(start);
    const large = angle > Math.PI ? 1 : 0;
    const path = `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${r} ${r} 0 ${large} 0 ${ix2} ${iy2} Z`;
    return {
      path,
      color: CAT[i % CAT.length],
      ...d
    };
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      direction: 'ltr'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 ${size} ${size}`,
    style: {
      width: size,
      height: size,
      display: 'block',
      margin: '0 auto'
    }
  }, slices.map((s, i) => /*#__PURE__*/React.createElement("path", {
    key: i,
    d: s.path,
    fill: s.color,
    opacity: 0.9
  })), /*#__PURE__*/React.createElement("text", {
    x: cx,
    y: cy - 6,
    textAnchor: "middle",
    fontSize: size * 0.07,
    fill: "#6B746E",
    fontFamily: "var(--font-sans)"
  }, "\u05D4\u05D5\u05E6\u05D0\u05D5\u05EA"), /*#__PURE__*/React.createElement("text", {
    x: cx,
    y: cy + size * 0.07,
    textAnchor: "middle",
    fontSize: size * 0.065,
    fill: "#1B2A27",
    fontFamily: "var(--font-display)",
    fontWeight: "700"
  }, slices.length, " \u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D5\u05EA")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '4px 12px',
      marginTop: 12,
      direction: 'rtl'
    }
  }, slices.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 10,
      height: 10,
      borderRadius: 3,
      background: s.color,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.75rem',
      color: '#1B2A27',
      fontFamily: 'var(--font-sans)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, s.category_icon, " ", s.category_name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.72rem',
      color: '#6B746E',
      marginRight: 'auto',
      whiteSpace: 'nowrap'
    }
  }, Math.round(s.pct * 100), "%")))));
}
Object.assign(window, {
  ScoreRing,
  NetWorthSparkline,
  CashflowChart,
  DonutChart,
  fmtILS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/takziv-app/charts.jsx", error: String((e && e.message) || e) }); }

// ui_kits/takziv-app/data.jsx
try { (() => {
// Takziv UI kit — mock household data (matches the real app's shapes)
const TAKZIV_DATA = {
  user: {
    display_name: 'דנה כהן',
    household_name: 'משפחת כהן'
  },
  summary: {
    net_worth: 127430,
    total_assets: 158000,
    total_liabilities: 30570,
    month_income: 14200,
    month_expense: 9840
  },
  netWorthHistory: [98000, 101200, 99800, 104500, 108300, 110100, 113900, 116200, 119000, 121800, 124600, 127430],
  health: {
    score: 78,
    savings_rate: {
      value: 31,
      status: 'excellent',
      label: 'שיעור חיסכון'
    },
    budget_adherence: {
      value: 88,
      status: 'good',
      label: 'עמידה בתקציב'
    },
    runway_months: {
      value: 5,
      status: 'fair',
      label: 'חודשי כרית'
    },
    debt_burden: {
      value: 22,
      status: 'good',
      label: 'נטל חוב'
    }
  },
  cashflow: [{
    month: '2026-01',
    income: 13800,
    expense: 9200
  }, {
    month: '2026-02',
    income: 14100,
    expense: 10400
  }, {
    month: '2026-03',
    income: 13900,
    expense: 8800
  }, {
    month: '2026-04',
    income: 15200,
    expense: 11200
  }, {
    month: '2026-05',
    income: 14000,
    expense: 9100
  }, {
    month: '2026-06',
    income: 14200,
    expense: 9840
  }],
  spending: [{
    category_name: 'דיור',
    category_icon: '🏠',
    pct: 0.34
  }, {
    category_name: 'מזון',
    category_icon: '🛒',
    pct: 0.22
  }, {
    category_name: 'תחבורה',
    category_icon: '🚗',
    pct: 0.14
  }, {
    category_name: 'מסעדות',
    category_icon: '🍽',
    pct: 0.12
  }, {
    category_name: 'חינוך',
    category_icon: '🎓',
    pct: 0.10
  }, {
    category_name: 'אחר',
    category_icon: '📦',
    pct: 0.08
  }],
  overBudget: [{
    category_name: 'מסעדות'
  }],
  upcoming: [{
    id: 1,
    description: 'שכירות',
    next_date: '18.6',
    days: 2,
    amount: 3800,
    kind: 'expense'
  }, {
    id: 2,
    description: 'מנוי Netflix',
    next_date: '20.6',
    days: 4,
    amount: 55,
    kind: 'expense'
  }, {
    id: 3,
    description: 'משכורת',
    next_date: '28.6',
    days: 12,
    amount: 14200,
    kind: 'income'
  }],
  savings: [{
    id: 1,
    name: 'חופשה ביוון',
    icon: '🏖',
    current: 6400,
    target: 10000,
    color: 'var(--cat-7)',
    months_left: 4
  }, {
    id: 2,
    name: 'קרן חירום',
    icon: '🛟',
    current: 22000,
    target: 30000,
    color: 'var(--income)',
    months_left: 8
  }, {
    id: 3,
    name: 'רכב חדש',
    icon: '🚗',
    current: 9000,
    target: 45000,
    color: 'var(--brass)',
    months_left: 20
  }],
  loans: [{
    id: 1,
    name: 'משכנתא',
    type: '🏠',
    months_remaining: 214,
    monthly_payment: 4200,
    balance: 612000
  }, {
    id: 2,
    name: 'הלוואת רכב',
    type: '🚗',
    months_remaining: 28,
    monthly_payment: 1450,
    balance: 38600
  }],
  accounts: [{
    id: 1,
    name: 'עו״ש משותף',
    type: 'עו״ש',
    institution: 'לאומי',
    balance: 24300
  }, {
    id: 2,
    name: 'חיסכון',
    type: 'חיסכון',
    institution: 'הפועלים',
    balance: 88000
  }, {
    id: 3,
    name: 'אשראי',
    type: 'אשראי',
    institution: 'ויזה',
    balance: -4180
  }, {
    id: 4,
    name: 'מזומן',
    type: 'מזומן',
    institution: '',
    balance: 1200
  }],
  transactions: [{
    id: 1,
    desc: 'משכורת',
    account: 'עו״ש משותף',
    date: '12.6.2026',
    amount: 14200,
    kind: 'income'
  }, {
    id: 2,
    desc: 'סופר רמי לוי',
    account: 'אשראי',
    date: '11.6.2026',
    amount: 642,
    kind: 'expense'
  }, {
    id: 3,
    desc: 'דלק פז',
    account: 'אשראי',
    date: '10.6.2026',
    amount: 310,
    kind: 'expense'
  }, {
    id: 4,
    desc: 'מסעדה איטלקית',
    account: 'אשראי',
    date: '9.6.2026',
    amount: 280,
    kind: 'expense'
  }, {
    id: 5,
    desc: 'החזר חבר',
    account: 'עו״ש משותף',
    date: '8.6.2026',
    amount: 150,
    kind: 'income'
  }],
  accountOptions: ['עו״ש משותף', 'חיסכון', 'אשראי', 'מזומן'],
  categoryOptions: {
    expense: ['🏠 דיור', '🛒 מזון', '🚗 תחבורה', '🍽 מסעדות', '🎓 חינוך'],
    income: ['💼 משכורת', '🎁 מתנה', '📈 השקעות']
  }
};
window.TAKZIV_DATA = TAKZIV_DATA;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/takziv-app/data.jsx", error: String((e && e.message) || e) }); }

// ui_kits/takziv-app/redesign-data.jsx
try { (() => {
// Takziv — main-screen redesign: shared data
// Hero concept: "פנוי להוצאה" = liquid balance minus fixed obligations still
// pending this month. Framed daily + monthly, with category budgets up front.
window.TZ_REDESIGN = {
  user: {
    name: 'דנה'
  },
  available: 4360,
  // liquid (9,200) − pending fixed (4,840)
  liquid: 9200,
  pendingFixed: 4840,
  daysLeft: 20,
  perDay: 218,
  // available / daysLeft
  todayAllowance: 218,
  todaySpent: 12,
  // spent so far today

  month: {
    income: 14200,
    expense: 9840
  },
  budgets: [{
    name: 'אוכל',
    icon: '🛒',
    planned: 2000,
    spent: 1640
  }, {
    name: 'מסעדות',
    icon: '🍽',
    planned: 600,
    spent: 720
  },
  // over
  {
    name: 'תחבורה',
    icon: '🚗',
    planned: 900,
    spent: 540
  }, {
    name: 'פנאי',
    icon: '🎬',
    planned: 500,
    spent: 180
  }, {
    name: 'דיור',
    icon: '🏠',
    planned: 3800,
    spent: 3800
  },
  // fixed
  {
    name: 'אחר',
    icon: '📦',
    planned: 400,
    spent: 260
  }],
  upcoming: [{
    id: 1,
    name: 'שכירות',
    icon: '🏠',
    date: '18.6',
    days: 2,
    amount: 3800
  }, {
    id: 2,
    name: 'חשמל',
    icon: '⚡',
    date: '22.6',
    days: 6,
    amount: 340
  }, {
    id: 3,
    name: 'Netflix',
    icon: '🎬',
    date: '24.6',
    days: 8,
    amount: 55
  }],
  transactions: [{
    id: 1,
    desc: 'סופר רמי לוי',
    icon: '🛒',
    date: 'היום',
    amount: 642,
    kind: 'expense'
  }, {
    id: 2,
    desc: 'דלק פז',
    icon: '🚗',
    date: 'אתמול',
    amount: 310,
    kind: 'expense'
  }, {
    id: 3,
    desc: 'משכורת',
    icon: '💼',
    date: '12.6',
    amount: 14200,
    kind: 'income'
  }, {
    id: 4,
    desc: 'קפה ארומה',
    icon: '☕',
    date: '12.6',
    amount: 18,
    kind: 'expense'
  }],
  overBudget: ['מסעדות'],
  categoryOptions: ['🛒 אוכל', '🍽 מסעדות', '🚗 תחבורה', '🎬 פנאי', '🏠 דיור', '📦 אחר'],
  accountOptions: ['עו״ש משותף', 'אשראי', 'מזומן']
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/takziv-app/redesign-data.jsx", error: String((e && e.message) || e) }); }

// ui_kits/takziv-app/redesign-shared.jsx
try { (() => {
// Takziv — main-screen redesign: 3 variations, composed from DS components.
const RD = window.TakzivDesignSystem_57976b;
const {
  Card,
  Button,
  MoneyAmount,
  Badge,
  ProgressBar,
  Select,
  Input,
  KindToggle
} = RD;
const {
  useState
} = React;
const rfmt = n => new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
  maximumFractionDigits: 0
}).format(n ?? 0);
function budgetMeta(b) {
  const pct = b.planned ? b.spent / b.planned : 0;
  const remaining = b.planned - b.spent;
  const over = remaining < 0;
  const color = over ? 'var(--expense)' : pct > 0.85 ? 'var(--brass)' : 'var(--income)';
  return {
    pct: Math.min(pct * 100, 100),
    remaining,
    over,
    color
  };
}

// ---------- shared chrome ----------
function Header({
  name
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 1.15rem 0.5rem'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: 'var(--muted)',
      fontSize: '0.8rem'
    }
  }, "\u05E2\u05E8\u05D1 \u05D8\u05D5\u05D1,"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: '1.25rem',
      color: 'var(--ink)'
    }
  }, name)), /*#__PURE__*/React.createElement("svg", {
    width: "30",
    height: "30",
    viewBox: "0 0 64 64",
    style: {
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("rect", {
    width: "64",
    height: "64",
    rx: "14",
    fill: "#1B2A27"
  }), /*#__PURE__*/React.createElement("polygon", {
    points: "32,14 50,32 14,32",
    fill: "#C9A23F"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "18",
    y: "31",
    width: "28",
    height: "17",
    rx: "1",
    fill: "#C9A23F",
    fillOpacity: "0.18",
    stroke: "#C9A23F",
    strokeWidth: "2"
  }), /*#__PURE__*/React.createElement("text", {
    x: "32",
    y: "43",
    textAnchor: "middle",
    fontFamily: "Arial,sans-serif",
    fontSize: "12",
    fontWeight: "bold",
    fill: "#C9A23F"
  }, "\u20AA")));
}
function MonthStrip({
  m
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      background: 'var(--card)',
      borderRadius: 'var(--radius-md)',
      padding: '0.7rem 0.85rem'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: 'var(--muted)',
      fontSize: '0.72rem'
    }
  }, "\u05D4\u05DB\u05E0\u05E1\u05D5\u05EA \u05D4\u05D7\u05D5\u05D3\u05E9"), /*#__PURE__*/React.createElement(MoneyAmount, {
    value: m.income,
    kind: "income",
    size: "1.05rem"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      background: 'var(--card)',
      borderRadius: 'var(--radius-md)',
      padding: '0.7rem 0.85rem'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: 'var(--muted)',
      fontSize: '0.72rem'
    }
  }, "\u05D4\u05D5\u05E6\u05D0\u05D5\u05EA \u05D4\u05D7\u05D5\u05D3\u05E9"), /*#__PURE__*/React.createElement(MoneyAmount, {
    value: m.expense,
    kind: "expense",
    size: "1.05rem"
  })));
}
function OverAlert({
  data
}) {
  const over = data.budgets.find(b => b.spent > b.planned);
  if (!over) return null;
  const by = over.spent - over.planned;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--alert-bg)',
      border: '1px solid var(--alert-border)',
      borderRadius: 'var(--radius-md)',
      padding: '0.6rem 0.85rem',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      color: 'var(--alert-text)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '1rem'
    }
  }, "\u26A0"), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: '0.82rem'
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      fontWeight: 700
    }
  }, over.icon, " ", over.name), " \u05D7\u05E8\u05D2\u05D5 \u05D1\u05BE", rfmt(by)), /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: 0.6
    }
  }, "\u203A"));
}
function CardShell({
  title,
  action,
  children,
  pad = '0.9rem 1rem'
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--card)',
      borderRadius: 'var(--radius-lg)',
      padding: pad
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.7rem'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: '0.95rem',
      color: 'var(--ink)',
      margin: 0
    }
  }, title), action && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--brass)',
      fontWeight: 600,
      fontSize: '0.82rem'
    }
  }, action)), children);
}
function CategoryBar({
  b
}) {
  const m = budgetMeta(b);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      color: 'var(--ink)',
      fontSize: '0.88rem'
    }
  }, b.icon, " ", b.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.8rem',
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      color: m.over ? 'var(--expense)' : 'var(--ink)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, m.over ? `חריגה ${rfmt(-m.remaining)}` : `נשאר ${rfmt(m.remaining)}`)), /*#__PURE__*/React.createElement(ProgressBar, {
    pct: m.pct,
    color: m.color,
    height: 7
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-start',
      marginTop: 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.68rem',
      color: 'var(--muted)',
      fontFamily: 'var(--font-display)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, rfmt(b.spent), " / ", rfmt(b.planned))));
}
function CategoryTile({
  b
}) {
  const m = budgetMeta(b);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--card)',
      borderRadius: 'var(--radius-md)',
      padding: '0.8rem 0.85rem',
      borderTop: `3px solid ${m.color}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '1rem'
    }
  }, b.icon), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      color: 'var(--ink)',
      fontSize: '0.82rem'
    }
  }, b.name)), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 2px',
      fontSize: '0.66rem',
      color: 'var(--muted)'
    }
  }, m.over ? 'חריגה' : 'נשאר'), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 7
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: '1.15rem',
      color: m.over ? 'var(--expense)' : 'var(--ink)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, rfmt(Math.abs(m.remaining)))), /*#__PURE__*/React.createElement(ProgressBar, {
    pct: m.pct,
    color: m.color,
    height: 6
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '5px 0 0',
      fontSize: '0.64rem',
      color: 'var(--muted)',
      fontFamily: 'var(--font-display)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, rfmt(b.spent), " / ", rfmt(b.planned)));
}
function TxList({
  transactions
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, transactions.map((t, i) => /*#__PURE__*/React.createElement("div", {
    key: t.id,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '0.55rem 0',
      borderBottom: i < transactions.length - 1 ? '1px solid var(--line)' : 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 32,
      height: 32,
      borderRadius: '50%',
      background: 'var(--paper)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.95rem',
      flexShrink: 0
    }
  }, t.icon), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontWeight: 600,
      color: 'var(--ink)',
      fontSize: '0.88rem',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, t.desc), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: 'var(--muted)',
      fontSize: '0.72rem'
    }
  }, t.date)), /*#__PURE__*/React.createElement(MoneyAmount, {
    value: t.amount,
    kind: t.kind,
    showSign: true,
    size: "0.92rem"
  }))));
}
function UpcomingList({
  upcoming
}) {
  const total = upcoming.reduce((s, u) => s + u.amount, 0);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: '0.6rem'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: '0.95rem',
      color: 'var(--ink)',
      margin: 0
    }
  }, "\u05E2\u05D5\u05DE\u05D3 \u05DC\u05D7\u05D9\u05D5\u05D1 \xB7 7 \u05D9\u05DE\u05D9\u05DD"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: '0.85rem',
      color: 'var(--expense)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, rfmt(total))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, upcoming.map((u, i) => /*#__PURE__*/React.createElement("div", {
    key: u.id,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '0.45rem 0',
      borderBottom: i < upcoming.length - 1 ? '1px solid var(--line)' : 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.95rem'
    }
  }, u.icon), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontWeight: 600,
      color: 'var(--ink)',
      fontSize: '0.85rem'
    }
  }, u.name), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: 'var(--muted)',
      fontSize: '0.72rem'
    }
  }, u.date, " \xB7 ", u.days <= 1 ? 'מחר' : `עוד ${u.days} ימים`)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: '0.85rem',
      color: 'var(--ink)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, rfmt(u.amount))))));
}

// ---------- daily ring (variation B) ----------
function DailyRing({
  allowance,
  spent
}) {
  const remaining = Math.max(allowance - spent, 0);
  const frac = Math.min(spent / allowance, 1);
  const R = 52,
    cx = 64,
    cy = 64,
    circ = 2 * Math.PI * R;
  return /*#__PURE__*/React.createElement("div", {
    dir: "ltr",
    style: {
      position: 'relative',
      width: 128,
      height: 128,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "128",
    height: "128",
    viewBox: "0 0 128 128"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: cx,
    cy: cy,
    r: R,
    fill: "none",
    stroke: "rgba(255,255,255,0.14)",
    strokeWidth: 10
  }), /*#__PURE__*/React.createElement("circle", {
    cx: cx,
    cy: cy,
    r: R,
    fill: "none",
    stroke: "#6EE7B7",
    strokeWidth: 10,
    strokeLinecap: "round",
    strokeDasharray: `${(1 - frac) * circ} ${circ}`,
    transform: `rotate(-90 ${cx} ${cy})`,
    style: {
      transition: 'stroke-dasharray 0.6s ease'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.6rem',
      color: 'var(--on-dark-sub)'
    }
  }, "\u05E0\u05E9\u05D0\u05E8 \u05DC\u05D4\u05D9\u05D5\u05DD"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: '1.7rem',
      color: '#fff',
      lineHeight: 1.1,
      fontVariantNumeric: 'tabular-nums'
    }
  }, rfmt(remaining)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.58rem',
      color: 'var(--on-dark-faint)'
    }
  }, "\u05DE\u05EA\u05D5\u05DA ", rfmt(allowance))));
}

// ---------- quick-add bottom sheet ----------
function QuickAddSheet({
  data,
  onClose,
  onAdd
}) {
  const [kind, setKind] = useState('expense');
  const [amount, setAmount] = useState('');
  return /*#__PURE__*/React.createElement("div", {
    onClick: e => e.target === e.currentTarget && onClose(),
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--scrim)',
      display: 'flex',
      alignItems: 'flex-end',
      zIndex: 100,
      animation: 'tz-fade 0.2s ease'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--card)',
      borderRadius: '22px 22px 0 0',
      padding: '1rem 1.5rem 1.75rem',
      width: '100%',
      boxSizing: 'border-box',
      animation: 'tz-rise 0.28s ease'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 4,
      background: 'var(--line)',
      borderRadius: 2,
      margin: '0 auto 1rem'
    }
  }), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      color: 'var(--ink)',
      margin: '0 0 0.9rem',
      fontSize: '1.05rem'
    }
  }, "\u05D4\u05D5\u05E1\u05E3 \u05D4\u05D5\u05E6\u05D0\u05D4"), /*#__PURE__*/React.createElement(KindToggle, {
    value: kind,
    onChange: setKind,
    style: {
      marginBottom: '0.9rem'
    }
  }), /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      onAdd({
        kind,
        amount: parseFloat(amount) || 0
      });
    },
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    placeholder: "0",
    min: "0",
    value: amount,
    onChange: e => setAmount(e.target.value),
    inputMode: "decimal",
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: '2rem',
      textAlign: 'center',
      border: 'none',
      borderBottom: '2px solid var(--line)',
      background: 'transparent',
      color: 'var(--ink)',
      padding: '0.4rem',
      outline: 'none',
      fontVariantNumeric: 'tabular-nums'
    }
  }), /*#__PURE__*/React.createElement(Select, {
    defaultValue: ""
  }, ['בחר קטגוריה', ...data.categoryOptions].map((c, i) => /*#__PURE__*/React.createElement("option", {
    key: c,
    value: i ? c : ''
  }, c))), /*#__PURE__*/React.createElement(Select, {
    defaultValue: ""
  }, ['חשבון', ...data.accountOptions].map((c, i) => /*#__PURE__*/React.createElement("option", {
    key: c,
    value: i ? c : ''
  }, c))), /*#__PURE__*/React.createElement(Input, {
    placeholder: "\u05EA\u05D9\u05D0\u05D5\u05E8 (\u05D0\u05D5\u05E4\u05E6\u05D9\u05D5\u05E0\u05DC\u05D9)"
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    type: "submit",
    style: {
      background: kind === 'income' ? 'var(--income)' : 'var(--expense)',
      boxShadow: 'none',
      borderRadius: 14,
      marginTop: 2
    }
  }, "\u05E9\u05DE\u05D5\u05E8"))));
}
function Fab({
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      position: 'absolute',
      bottom: 18,
      insetInlineEnd: 18,
      width: 56,
      height: 56,
      borderRadius: '50%',
      background: 'var(--brass)',
      color: '#fff',
      border: 'none',
      fontSize: '1.8rem',
      cursor: 'pointer',
      boxShadow: 'var(--shadow-cta)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 300,
      lineHeight: 1,
      zIndex: 20
    }
  }, "+");
}
Object.assign(window, {
  rfmt,
  budgetMeta,
  Header,
  MonthStrip,
  OverAlert,
  CardShell,
  CategoryBar,
  CategoryTile,
  TxList,
  UpcomingList,
  DailyRing,
  QuickAddSheet,
  Fab
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/takziv-app/redesign-shared.jsx", error: String((e && e.message) || e) }); }

// ui_kits/takziv-app/redesign-variations.jsx
try { (() => {
// Takziv — main-screen redesign: the 3 variation screens
const V = window.TakzivDesignSystem_57976b;
const {
  Card: VCard,
  MoneyAmount: VMoney
} = V;
const {
  Header: RHeader,
  MonthStrip: RMonth,
  OverAlert: ROver,
  CardShell: RShell,
  CategoryBar: RBar,
  CategoryTile: RTile,
  TxList: RTx,
  UpcomingList: RUp,
  DailyRing: RRing,
  QuickAddSheet: RSheet,
  Fab: RFab,
  rfmt: vfmt
} = window;
const {
  useState: vState
} = React;
function useSheet() {
  const [open, setOpen] = vState(false);
  const [extra, setExtra] = vState([]);
  const add = ({
    kind,
    amount
  }) => {
    setExtra(x => [{
      id: 'n' + Date.now(),
      desc: kind === 'income' ? 'הכנסה חדשה' : 'הוצאה חדשה',
      icon: kind === 'income' ? '💼' : '🛒',
      date: 'הרגע',
      amount,
      kind
    }, ...x]);
    setOpen(false);
  };
  return {
    open,
    setOpen,
    extra,
    add
  };
}
const Stack = ({
  children
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
    padding: '0.5rem 1.15rem 0'
  }
}, children);
const Screen = ({
  children
}) => /*#__PURE__*/React.createElement("div", {
  className: "scroll"
}, /*#__PURE__*/React.createElement("div", {
  style: {
    paddingBottom: 90
  }
}, children));

// ============ Variation A — calm monthly + budgets ============
function MainA({
  data
}) {
  const s = useSheet();
  const tx = [...s.extra, ...data.transactions];
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Screen, null, /*#__PURE__*/React.createElement(RHeader, {
    name: data.user.name
  }), /*#__PURE__*/React.createElement(Stack, null, /*#__PURE__*/React.createElement(VCard, {
    tone: "dark",
    radius: "xl",
    style: {
      padding: '1.3rem 1.3rem 1.1rem'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: 'var(--on-dark-sub)',
      fontSize: '0.85rem'
    }
  }, "\u05E4\u05E0\u05D5\u05D9 \u05DC\u05D4\u05D5\u05E6\u05D0\u05D4"), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0.15rem 0 0.1rem'
    }
  }, /*#__PURE__*/React.createElement(VMoney, {
    value: data.available,
    onDark: true,
    size: "2.5rem",
    weight: "var(--fw-black)"
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 0.9rem',
      color: 'var(--on-dark-faint)',
      fontSize: '0.74rem'
    }
  }, "\u05D0\u05D7\u05E8\u05D9 \u05D4\u05D5\u05E8\u05D0\u05D5\u05EA \u05E7\u05D1\u05E2 \u05D5\u05EA\u05E9\u05DC\u05D5\u05DE\u05D9\u05DD \u05E7\u05D1\u05D5\u05E2\u05D9\u05DD"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      background: 'var(--on-dark-fill)',
      borderRadius: 'var(--radius-md)',
      padding: '0.55rem 0.7rem'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: 'var(--on-dark-sub)',
      fontSize: '0.66rem'
    }
  }, "\u05D1\u05E2\u05E8\u05DA \u05DC\u05D9\u05D5\u05DD"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '2px 0 0',
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: '1.05rem',
      color: '#fff',
      fontVariantNumeric: 'tabular-nums'
    }
  }, "\u2248 ", vfmt(data.perDay))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      background: 'var(--on-dark-fill)',
      borderRadius: 'var(--radius-md)',
      padding: '0.55rem 0.7rem'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: 'var(--on-dark-sub)',
      fontSize: '0.66rem'
    }
  }, "\u05DC\u05E1\u05D5\u05E3 \u05D4\u05D7\u05D5\u05D3\u05E9"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '2px 0 0',
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: '1.05rem',
      color: '#fff'
    }
  }, data.daysLeft, " \u05D9\u05DE\u05D9\u05DD")))), /*#__PURE__*/React.createElement(RMonth, {
    m: data.month
  }), /*#__PURE__*/React.createElement(ROver, {
    data: data
  }), /*#__PURE__*/React.createElement(RShell, {
    title: "\u05EA\u05E7\u05E6\u05D9\u05D1 \u05DC\u05E4\u05D9 \u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D4",
    action: "\u05D4\u05DB\u05DC"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 13
    }
  }, data.budgets.map(b => /*#__PURE__*/React.createElement(RBar, {
    key: b.name,
    b: b
  })))), /*#__PURE__*/React.createElement(RShell, null, /*#__PURE__*/React.createElement(RUp, {
    upcoming: data.upcoming
  })), /*#__PURE__*/React.createElement(RShell, {
    title: "\u05EA\u05E0\u05D5\u05E2\u05D5\u05EA \u05D0\u05D7\u05E8\u05D5\u05E0\u05D5\u05EA",
    action: "\u05D4\u05DB\u05DC"
  }, /*#__PURE__*/React.createElement(RTx, {
    transactions: tx
  })))), /*#__PURE__*/React.createElement(RFab, {
    onClick: () => s.setOpen(true)
  }), s.open && /*#__PURE__*/React.createElement(RSheet, {
    data: data,
    onClose: () => s.setOpen(false),
    onAdd: s.add
  }));
}

// ============ Variation B — daily dial first ============
function MainB({
  data
}) {
  const s = useSheet();
  const tx = [...s.extra, ...data.transactions];
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Screen, null, /*#__PURE__*/React.createElement(RHeader, {
    name: data.user.name
  }), /*#__PURE__*/React.createElement(Stack, null, /*#__PURE__*/React.createElement(VCard, {
    tone: "dark",
    radius: "xl",
    style: {
      padding: '1.2rem 1.2rem 1rem'
    }
  }, /*#__PURE__*/React.createElement(RRing, {
    allowance: data.todayAllowance,
    spent: data.todaySpent
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: '1rem',
      paddingTop: '0.85rem',
      borderTop: '1px solid var(--on-dark-track)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--on-dark-sub)',
      fontSize: '0.78rem'
    }
  }, "\u05E4\u05E0\u05D5\u05D9 \u05E2\u05D3 \u05E1\u05D5\u05E3 \u05D4\u05D7\u05D5\u05D3\u05E9"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(VMoney, {
    value: data.available,
    onDark: true,
    size: "1.2rem",
    weight: "var(--fw-black)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--on-dark-faint)',
      fontSize: '0.68rem'
    }
  }, "\xB7 ", data.daysLeft, " \u05D9\u05DE\u05D9\u05DD")))), /*#__PURE__*/React.createElement(RShell, {
    title: "\u05EA\u05E7\u05E6\u05D9\u05D1 \u05DC\u05E4\u05D9 \u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D4",
    action: "\u05D4\u05DB\u05DC"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 13
    }
  }, data.budgets.slice(0, 4).map(b => /*#__PURE__*/React.createElement(RBar, {
    key: b.name,
    b: b
  })))), /*#__PURE__*/React.createElement(ROver, {
    data: data
  }), /*#__PURE__*/React.createElement(RMonth, {
    m: data.month
  }), /*#__PURE__*/React.createElement(RShell, null, /*#__PURE__*/React.createElement(RUp, {
    upcoming: data.upcoming
  })), /*#__PURE__*/React.createElement(RShell, {
    title: "\u05EA\u05E0\u05D5\u05E2\u05D5\u05EA \u05D0\u05D7\u05E8\u05D5\u05E0\u05D5\u05EA",
    action: "\u05D4\u05DB\u05DC"
  }, /*#__PURE__*/React.createElement(RTx, {
    transactions: tx
  })))), /*#__PURE__*/React.createElement(RFab, {
    onClick: () => s.setOpen(true)
  }), s.open && /*#__PURE__*/React.createElement(RSheet, {
    data: data,
    onClose: () => s.setOpen(false),
    onAdd: s.add
  }));
}

// ============ Variation C — budget-led category grid ============
function MainC({
  data
}) {
  const s = useSheet();
  const tx = [...s.extra, ...data.transactions];
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Screen, null, /*#__PURE__*/React.createElement(RHeader, {
    name: data.user.name
  }), /*#__PURE__*/React.createElement(Stack, null, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--card)',
      borderRadius: 'var(--radius-lg)',
      padding: '0.85rem 1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTop: '3px solid var(--brass)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: 'var(--muted)',
      fontSize: '0.74rem'
    }
  }, "\u05E4\u05E0\u05D5\u05D9 \u05DC\u05D4\u05D5\u05E6\u05D0\u05D4"), /*#__PURE__*/React.createElement(VMoney, {
    value: data.available,
    size: "1.7rem",
    weight: "var(--fw-black)"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      background: 'var(--paper)',
      borderRadius: 'var(--radius-pill)',
      padding: '0.35rem 0.75rem',
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: '0.78rem',
      color: 'var(--ink)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, "\u2248 ", vfmt(data.perDay), " / \u05D9\u05D5\u05DD")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      margin: '0 2px 0.6rem'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: '0.95rem',
      color: 'var(--ink)',
      margin: 0
    }
  }, "\u05EA\u05E7\u05E6\u05D9\u05D1 \u05D4\u05D7\u05D5\u05D3\u05E9"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--brass)',
      fontWeight: 600,
      fontSize: '0.82rem'
    }
  }, "\u05D4\u05DB\u05DC")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10
    }
  }, data.budgets.map(b => /*#__PURE__*/React.createElement(RTile, {
    key: b.name,
    b: b
  })))), /*#__PURE__*/React.createElement(RMonth, {
    m: data.month
  }), /*#__PURE__*/React.createElement(RShell, null, /*#__PURE__*/React.createElement(RUp, {
    upcoming: data.upcoming
  })), /*#__PURE__*/React.createElement(RShell, {
    title: "\u05EA\u05E0\u05D5\u05E2\u05D5\u05EA \u05D0\u05D7\u05E8\u05D5\u05E0\u05D5\u05EA",
    action: "\u05D4\u05DB\u05DC"
  }, /*#__PURE__*/React.createElement(RTx, {
    transactions: tx
  })))), /*#__PURE__*/React.createElement(RFab, {
    onClick: () => s.setOpen(true)
  }), s.open && /*#__PURE__*/React.createElement(RSheet, {
    data: data,
    onClose: () => s.setOpen(false),
    onAdd: s.add
  }));
}
Object.assign(window, {
  MainA,
  MainB,
  MainC
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/takziv-app/redesign-variations.jsx", error: String((e && e.message) || e) }); }

// ui_kits/takziv-app/screens.jsx
try { (() => {
// Takziv UI kit — screens, composed from the design-system components + local charts
const DS = window.TakzivDesignSystem_57976b;
const {
  Button,
  Card,
  MoneyAmount,
  Badge,
  Input,
  Select,
  Tabs,
  KindToggle,
  ProgressBar,
  SectionHeader,
  Logo
} = DS;
const {
  ScoreRing,
  NetWorthSparkline,
  CashflowChart,
  DonutChart,
  fmtILS
} = window;
const {
  useState
} = React;
const GoogleIcon = () => /*#__PURE__*/React.createElement("svg", {
  width: "18",
  height: "18",
  viewBox: "0 0 18 18",
  style: {
    flexShrink: 0
  }
}, /*#__PURE__*/React.createElement("path", {
  fill: "#4285F4",
  d: "M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
}), /*#__PURE__*/React.createElement("path", {
  fill: "#34A853",
  d: "M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
}), /*#__PURE__*/React.createElement("path", {
  fill: "#FBBC05",
  d: "M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
}), /*#__PURE__*/React.createElement("path", {
  fill: "#EA4335",
  d: "M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
}));

// ---------- Login ----------
function LoginScreen({
  onAuth
}) {
  const [mode, setMode] = useState('login');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100%',
      background: 'var(--paper)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    shadow: true,
    radius: "2xl",
    style: {
      width: '100%',
      maxWidth: 360,
      padding: '2.25rem 1.75rem'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: '1.25rem'
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    size: 34
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--muted)',
      margin: '8px 0 0',
      fontSize: '0.9rem'
    }
  }, "\u05E0\u05D9\u05D4\u05D5\u05DC \u05E4\u05D9\u05E0\u05E0\u05E1\u05D9 \u05DE\u05E9\u05E4\u05D7\u05EA\u05D9")), /*#__PURE__*/React.createElement(Button, {
    as: "a",
    variant: "secondary",
    fullWidth: true,
    style: {
      background: '#fff',
      marginBottom: '1rem',
      cursor: 'pointer'
    },
    onClick: onAuth
  }, /*#__PURE__*/React.createElement(GoogleIcon, null), " \u05D4\u05DE\u05E9\u05DA \u05E2\u05DD Google"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: '1rem'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      height: 1,
      background: 'var(--line)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--muted)',
      fontSize: '0.8rem'
    }
  }, "\u05D0\u05D5"), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      height: 1,
      background: 'var(--line)'
    }
  })), /*#__PURE__*/React.createElement(Tabs, {
    value: mode,
    onChange: setMode,
    style: {
      marginBottom: '1.25rem'
    },
    items: [{
      value: 'login',
      label: 'כניסה'
    }, {
      value: 'register',
      label: 'הרשמה'
    }]
  }), /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      onAuth();
    },
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, mode === 'register' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Input, {
    placeholder: "\u05E9\u05DD \u05EA\u05E6\u05D5\u05D2\u05D4",
    defaultValue: "\u05D3\u05E0\u05D4 \u05DB\u05D4\u05DF"
  }), /*#__PURE__*/React.createElement(Input, {
    placeholder: "\u05E9\u05DD \u05DE\u05E9\u05E7 \u05D4\u05D1\u05D9\u05EA (\u05DC\u05DE\u05E9\u05DC: \u05DE\u05E9\u05E4\u05D7\u05EA \u05DB\u05D4\u05DF)",
    defaultValue: "\u05DE\u05E9\u05E4\u05D7\u05EA \u05DB\u05D4\u05DF"
  })), /*#__PURE__*/React.createElement(Input, {
    type: "email",
    placeholder: "\u05D0\u05D9\u05DE\u05D9\u05D9\u05DC",
    defaultValue: "dana@example.com"
  }), /*#__PURE__*/React.createElement(Input, {
    type: "password",
    placeholder: "\u05E1\u05D9\u05E1\u05DE\u05D4",
    defaultValue: "password"
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    type: "submit",
    style: {
      marginTop: 4
    }
  }, mode === 'login' ? 'כניסה' : 'הרשמה'), mode === 'login' && /*#__PURE__*/React.createElement("button", {
    type: "button",
    style: {
      background: 'none',
      border: 'none',
      color: 'var(--muted)',
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)',
      fontSize: '0.85rem',
      padding: '4px 0'
    }
  }, "\u05E9\u05DB\u05D7\u05EA\u05D9 \u05E1\u05D9\u05E1\u05DE\u05D4"))));
}

// ---------- Financial health card ----------
const HEALTH_TONE = {
  excellent: 'excellent',
  good: 'good',
  fair: 'fair',
  poor: 'poor'
};
const HEALTH_LABEL = {
  excellent: 'מעולה',
  good: 'טוב',
  fair: 'בינוני',
  poor: 'דרוש שיפור'
};
const METRICS = [{
  key: 'savings_rate',
  icon: '💰',
  fmt: v => `${v}%`,
  tip: '20%+ מומלץ'
}, {
  key: 'budget_adherence',
  icon: '◎',
  fmt: v => `${v}%`,
  tip: '100% = מושלם'
}, {
  key: 'runway_months',
  icon: '🛟',
  fmt: v => `${v} חד׳`,
  tip: '6+ אידיאלי'
}, {
  key: 'debt_burden',
  icon: '🏦',
  fmt: v => `${v}%`,
  tip: 'מתחת ל-36%'
}];
function HealthCard({
  health
}) {
  const label = health.score >= 80 ? 'בריאות פיננסית מצוינת' : health.score >= 60 ? 'מצב טוב, יש מקום לשיפור' : 'נדרשת תשומת לב';
  return /*#__PURE__*/React.createElement(Card, {
    tone: "dark",
    radius: "xl",
    style: {
      padding: '1.1rem 1.2rem'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(ScoreRing, {
    score: health.score
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: '0.72rem',
      color: 'var(--on-dark-sub)',
      fontWeight: 600,
      letterSpacing: 0.5
    }
  }, "\u05D1\u05E8\u05D9\u05D0\u05D5\u05EA \u05E4\u05D9\u05E0\u05E0\u05E1\u05D9\u05EA"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '2px 0 0',
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: '0.95rem',
      color: '#fff'
    }
  }, label))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 8
    }
  }, METRICS.map(m => {
    const d = health[m.key];
    return /*#__PURE__*/React.createElement("div", {
      key: m.key,
      style: {
        background: 'var(--on-dark-fill)',
        borderRadius: 12,
        padding: '0.6rem 0.75rem'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '0.7rem',
        color: 'var(--on-dark-sub)'
      }
    }, m.icon, " ", d.label), /*#__PURE__*/React.createElement(Badge, {
      tone: HEALTH_TONE[d.status],
      style: {
        fontSize: '0.62rem',
        padding: '1px 6px'
      }
    }, HEALTH_LABEL[d.status])), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-display)',
        fontWeight: 900,
        fontSize: '1.15rem',
        color: '#fff'
      }
    }, m.fmt(d.value)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: '0.6rem',
        color: 'var(--on-dark-faint)',
        marginTop: 1
      }
    }, m.tip));
  })));
}

// ---------- Add-transaction bottom sheet ----------
function AddTxSheet({
  onClose,
  onAdd
}) {
  const [kind, setKind] = useState('expense');
  const [amount, setAmount] = useState('');
  const D = window.TAKZIV_DATA;
  const submit = e => {
    e.preventDefault();
    onAdd({
      kind,
      amount: parseFloat(amount) || 0
    });
  };
  return /*#__PURE__*/React.createElement("div", {
    onClick: e => e.target === e.currentTarget && onClose(),
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--scrim)',
      display: 'flex',
      alignItems: 'flex-end',
      zIndex: 100,
      animation: 'tz-fade 0.2s ease'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--card)',
      borderRadius: '22px 22px 0 0',
      padding: '1rem 1.5rem 2rem',
      width: '100%',
      fontFamily: 'var(--font-sans)',
      boxSizing: 'border-box',
      animation: 'tz-rise 0.28s ease'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 4,
      background: 'var(--line)',
      borderRadius: 2,
      margin: '0 auto 1rem'
    }
  }), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      color: 'var(--ink)',
      margin: '0 0 1rem',
      fontSize: '1.1rem'
    }
  }, "\u05D4\u05D5\u05E1\u05E3 \u05EA\u05E0\u05D5\u05E2\u05D4"), /*#__PURE__*/React.createElement(KindToggle, {
    value: kind,
    onChange: k => setKind(k),
    style: {
      marginBottom: '1rem'
    }
  }), /*#__PURE__*/React.createElement("form", {
    onSubmit: submit,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    placeholder: "0",
    min: "0",
    value: amount,
    onChange: e => setAmount(e.target.value),
    inputMode: "decimal",
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      fontSize: '2rem',
      textAlign: 'center',
      border: 'none',
      borderBottom: '2px solid var(--line)',
      background: 'transparent',
      color: 'var(--ink)',
      padding: '0.5rem',
      outline: 'none',
      fontVariantNumeric: 'tabular-nums'
    }
  }), /*#__PURE__*/React.createElement(Select, {
    defaultValue: ""
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "\u05D1\u05D7\u05E8 \u05D7\u05E9\u05D1\u05D5\u05DF"), D.accountOptions.map(a => /*#__PURE__*/React.createElement("option", {
    key: a
  }, a))), /*#__PURE__*/React.createElement(Select, {
    defaultValue: ""
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "\u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D4 (\u05D0\u05D5\u05E4\u05E6\u05D9\u05D5\u05E0\u05DC\u05D9)"), D.categoryOptions[kind].map(c => /*#__PURE__*/React.createElement("option", {
    key: c
  }, c))), /*#__PURE__*/React.createElement(Input, {
    placeholder: "\u05EA\u05D9\u05D0\u05D5\u05E8 (\u05D0\u05D5\u05E4\u05E6\u05D9\u05D5\u05E0\u05DC\u05D9)"
  }), /*#__PURE__*/React.createElement(Button, {
    variant: kind === 'income' ? 'primary' : 'primary',
    fullWidth: true,
    type: "submit",
    style: {
      background: kind === 'income' ? 'var(--income)' : 'var(--expense)',
      boxShadow: 'none',
      marginTop: 4,
      borderRadius: 14
    }
  }, "\u05E9\u05DE\u05D5\u05E8"))));
}

// ---------- Dashboard ----------
function Dashboard({
  data,
  onAddOpen,
  onSignOut,
  txExtra
}) {
  const s = data.summary;
  const nw = data.netWorthHistory;
  const delta = nw[nw.length - 1] - nw[0];
  const pct = Math.round(delta / Math.abs(nw[0]) * 100);
  const transactions = [...txExtra, ...data.transactions];
  const totalMonthly = data.loans.reduce((a, l) => a + l.monthly_payment, 0);
  const totalRemaining = data.loans.reduce((a, l) => a + l.balance, 0);
  const Section = ({
    title,
    action,
    onAction,
    children
  }) => /*#__PURE__*/React.createElement(Card, {
    radius: "lg",
    style: {
      padding: '1rem'
    }
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    title: title,
    actionLabel: action,
    onAction: onAction
  }), children);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100%',
      background: 'var(--paper)',
      paddingBottom: 96
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      background: 'var(--card)',
      borderBottom: '1px solid var(--line)',
      padding: '0.85rem 1.1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    size: 28
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--muted)',
      fontSize: '0.85rem'
    }
  }, data.user.display_name), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm",
    onClick: onSignOut,
    style: {
      color: 'var(--muted)',
      fontSize: '0.78rem',
      padding: '0.3rem 0.7rem'
    }
  }, "\u05D9\u05E6\u05D9\u05D0\u05D4"))), /*#__PURE__*/React.createElement("main", {
    style: {
      padding: '1.1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.9rem'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    tone: "dark",
    radius: "xl",
    style: {
      textAlign: 'center',
      padding: '1.4rem'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: 'var(--on-dark-sub)',
      fontSize: '0.85rem'
    }
  }, "\u05E9\u05D5\u05D5\u05D9 \u05E0\u05E7\u05D9"), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0.2rem 0'
    }
  }, /*#__PURE__*/React.createElement(MoneyAmount, {
    value: s.net_worth,
    onDark: true,
    size: "2.2rem",
    weight: "var(--fw-black)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-around',
      fontSize: '0.82rem',
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--on-dark-pos)'
    }
  }, "\u2191 ", fmtILS(s.total_assets), " \u05E0\u05DB\u05E1\u05D9\u05DD"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--on-dark-neg)'
    }
  }, "\u2193 ", fmtILS(s.total_liabilities), " \u05D7\u05D5\u05D1\u05D5\u05EA")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement(NetWorthSparkline, {
    data: nw
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      textAlign: 'center',
      margin: '4px 0 0',
      fontSize: '0.78rem',
      color: 'var(--on-dark-pos)'
    }
  }, "\u25B2 ", pct, "% \u05D1-12 \u05D7\u05D5\u05D3\u05E9\u05D9\u05DD"))), /*#__PURE__*/React.createElement(HealthCard, {
    health: data.health
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '0.75rem'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    accent: "var(--income)",
    radius: "lg",
    style: {
      flex: 1,
      padding: '1rem'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: 'var(--muted)',
      fontSize: '0.75rem'
    }
  }, "\u05D4\u05DB\u05E0\u05E1\u05D5\u05EA \u05D9\u05D5\u05E0\u05D9"), /*#__PURE__*/React.createElement(MoneyAmount, {
    value: s.month_income,
    kind: "income",
    size: "1.3rem"
  })), /*#__PURE__*/React.createElement(Card, {
    accent: "var(--expense)",
    radius: "lg",
    style: {
      flex: 1,
      padding: '1rem'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: 'var(--muted)',
      fontSize: '0.75rem'
    }
  }, "\u05D4\u05D5\u05E6\u05D0\u05D5\u05EA \u05D9\u05D5\u05E0\u05D9"), /*#__PURE__*/React.createElement(MoneyAmount, {
    value: s.month_expense,
    kind: "expense",
    size: "1.3rem"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--alert-bg)',
      borderRadius: 14,
      padding: '0.75rem 1rem',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      cursor: 'pointer',
      border: '1px solid var(--alert-border)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '1.1rem'
    }
  }, "\u26A0"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      color: 'var(--alert-text)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700
    }
  }, data.overBudget.length, " \u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D4 \u05D7\u05E8\u05D2\u05D4 \u05DE\u05D4\u05EA\u05E7\u05E6\u05D9\u05D1"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.82rem',
      marginRight: 6
    }
  }, data.overBudget.map(b => b.category_name).join(', '))), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--muted)'
    }
  }, "\u203A")), /*#__PURE__*/React.createElement(Section, {
    title: "\u05E2\u05D5\u05DE\u05D3 \u05DC\u05D7\u05D9\u05D5\u05D1 \u2014 7 \u05D9\u05DE\u05D9\u05DD",
    action: "\u05D4\u05DB\u05DC"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, data.upcoming.map(r => /*#__PURE__*/React.createElement("div", {
    key: r.id,
    style: {
      display: 'flex',
      alignItems: 'center',
      padding: '0.5rem 0',
      borderBottom: '1px solid var(--line)',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontWeight: 600,
      color: 'var(--ink)',
      fontSize: '0.9rem'
    }
  }, r.description), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: 'var(--muted)',
      fontSize: '0.75rem'
    }
  }, r.next_date, " \xB7 ", r.days <= 0 ? 'היום' : r.days === 1 ? 'מחר' : `עוד ${r.days} ימים`)), /*#__PURE__*/React.createElement(MoneyAmount, {
    value: r.amount,
    kind: r.kind,
    showSign: true,
    size: "0.95rem"
  }))))), /*#__PURE__*/React.createElement(Section, {
    title: "\u05EA\u05D6\u05E8\u05D9\u05DD 6 \u05D7\u05D5\u05D3\u05E9\u05D9\u05DD"
  }, /*#__PURE__*/React.createElement(CashflowChart, {
    data: data.cashflow
  })), /*#__PURE__*/React.createElement(Section, {
    title: "\u05D4\u05D5\u05E6\u05D0\u05D5\u05EA \u05DC\u05E4\u05D9 \u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D4 \u2014 \u05D9\u05D5\u05E0\u05D9",
    action: "\u05E4\u05D9\u05E8\u05D5\u05D8"
  }, /*#__PURE__*/React.createElement(DonutChart, {
    data: data.spending,
    size: 160
  })), /*#__PURE__*/React.createElement(Section, {
    title: "\u05D9\u05E2\u05D3\u05D9 \u05D7\u05D9\u05E1\u05DB\u05D5\u05DF",
    action: "\u05D4\u05DB\u05DC"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, data.savings.map(g => {
    const p = Math.min(g.current / g.target * 100, 100);
    return /*#__PURE__*/React.createElement("div", {
      key: g.id
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 600,
        color: 'var(--ink)',
        fontSize: '0.9rem'
      }
    }, g.icon, " ", g.name), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '0.8rem',
        color: 'var(--muted)',
        fontFamily: 'var(--font-display)',
        fontVariantNumeric: 'tabular-nums'
      }
    }, fmtILS(g.current), " / ", fmtILS(g.target))), /*#__PURE__*/React.createElement(ProgressBar, {
      pct: p,
      color: g.color
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: 3
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '0.7rem',
        color: 'var(--muted)'
      }
    }, Math.round(p), "%"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: '0.7rem',
        color: 'var(--muted)'
      }
    }, "\u05E2\u05D5\u05D3 ", g.months_left, " \u05D7\u05D5\u05D3\u05E9\u05D9\u05DD")));
  }))), /*#__PURE__*/React.createElement(Section, {
    title: "\u05D4\u05DC\u05D5\u05D5\u05D0\u05D5\u05EA",
    action: "\u05D4\u05DB\u05DC"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0 2px 10px',
      borderBottom: '1px solid var(--line)',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: '0.72rem',
      color: 'var(--muted)'
    }
  }, "\u05EA\u05E9\u05DC\u05D5\u05DD \u05D7\u05D5\u05D3\u05E9\u05D9 \u05DB\u05D5\u05DC\u05DC"), /*#__PURE__*/React.createElement(MoneyAmount, {
    value: totalMonthly,
    kind: "expense",
    size: "1.1rem"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: '0.72rem',
      color: 'var(--muted)'
    }
  }, "\u05D9\u05EA\u05E8\u05D4 \u05DC\u05E4\u05D9\u05E8\u05E2\u05D5\u05DF"), /*#__PURE__*/React.createElement(MoneyAmount, {
    value: totalRemaining,
    size: "1.1rem"
  }))), data.loans.map(l => /*#__PURE__*/React.createElement("div", {
    key: l.id,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '6px 0',
      borderBottom: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '1rem'
    }
  }, l.type), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontWeight: 600,
      fontSize: '0.88rem',
      color: 'var(--ink)'
    }
  }, l.name), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: '0.72rem',
      color: 'var(--muted)'
    }
  }, l.months_remaining, " \u05D7\u05D5\u05D3\u05E9\u05D9\u05DD \u05E0\u05D5\u05EA\u05E8\u05D5")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: '0.88rem',
      color: 'var(--expense)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, fmtILS(l.monthly_payment), "/\u05D7\u05D3\u05F3")))), /*#__PURE__*/React.createElement(Section, {
    title: "\u05D7\u05E9\u05D1\u05D5\u05E0\u05D5\u05EA",
    action: "+ \u05D4\u05D5\u05E1\u05E3"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, data.accounts.map(a => /*#__PURE__*/React.createElement("div", {
    key: a.id,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.55rem 0',
      borderBottom: '1px solid var(--line)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontWeight: 600,
      color: 'var(--ink)',
      fontSize: '0.95rem'
    }
  }, a.name), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: 'var(--muted)',
      fontSize: '0.78rem'
    }
  }, a.type, a.institution ? ` · ${a.institution}` : '')), /*#__PURE__*/React.createElement(MoneyAmount, {
    value: a.balance,
    kind: a.balance >= 0 ? 'neutral' : 'expense',
    size: "1rem"
  }))))), /*#__PURE__*/React.createElement(Section, {
    title: "\u05EA\u05E0\u05D5\u05E2\u05D5\u05EA \u05D0\u05D7\u05E8\u05D5\u05E0\u05D5\u05EA",
    action: "+ \u05D4\u05D5\u05E1\u05E3",
    onAction: onAddOpen
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }
  }, transactions.map(t => /*#__PURE__*/React.createElement("div", {
    key: t.id,
    style: {
      display: 'flex',
      alignItems: 'center',
      padding: '0.55rem 0',
      borderBottom: '1px solid var(--line)',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontWeight: 600,
      color: 'var(--ink)',
      fontSize: '0.9rem',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, t.desc), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: 'var(--muted)',
      fontSize: '0.75rem'
    }
  }, t.account, " \xB7 ", t.date)), /*#__PURE__*/React.createElement(MoneyAmount, {
    value: t.amount,
    kind: t.kind,
    showSign: true,
    size: "0.95rem"
  })))))), /*#__PURE__*/React.createElement("button", {
    onClick: onAddOpen,
    style: {
      position: 'absolute',
      bottom: 20,
      insetInlineEnd: 20,
      width: 56,
      height: 56,
      borderRadius: '50%',
      background: 'var(--brass)',
      color: '#fff',
      border: 'none',
      fontSize: '1.8rem',
      cursor: 'pointer',
      boxShadow: 'var(--shadow-cta)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 300,
      lineHeight: 1,
      zIndex: 20
    }
  }, "+"));
}
Object.assign(window, {
  LoginScreen,
  Dashboard,
  AddTxSheet,
  HealthCard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/takziv-app/screens.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.KindToggle = __ds_scope.KindToggle;

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.MoneyAmount = __ds_scope.MoneyAmount;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.SectionHeader = __ds_scope.SectionHeader;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
