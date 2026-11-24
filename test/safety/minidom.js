// A small page for the whole built app (fix-r21 round 9): the page's own two scripts (np-core and the app) run in a vm context on a fake document built from the
// page's own markup, with one localStorage shared by every tab of a test, a sessionStorage per tab, queued timers, a fixed clock and a fetch answered by the page's
// own np-core plan() and check() on canned honest replies. Nothing in the app is replaced: what it draws is read back from the fake document, and what it sends is
// recorded. It runs any build of the page (it names no app function), so a test written against it can be run on an older commit's page too.
const vm = require('vm');

const VOID = { input: 1, br: 1, img: 1, meta: 1, link: 1, hr: 1, use: 1, path: 1, circle: 1, rect: 1, line: 1, polyline: 1, polygon: 1, ellipse: 1, stop: 1 };
const PROPS = ['id', 'className', 'type', 'title', 'placeholder', 'htmlFor', 'autocomplete', 'name', 'href', 'role'];

function makeDoc(win) {
  const doc = { nodeType: 9, listeners: {}, activeElement: null, hidden: false, visibilityState: 'visible' };
  class Text { constructor(t) { this.nodeType = 3; this.data = String(t); this.parentNode = null; } get textContent() { return this.data; } set textContent(v) { this.data = String(v); } get nextSibling() { return sib(this, 1); } get previousSibling() { return sib(this, -1); } remove() { if (this.parentNode) this.parentNode.removeChild(this); } }
  const sib = (n, d) => { const p = n.parentNode; if (!p) return null; const i = p.childNodes.indexOf(n); return p.childNodes[i + d] || null; };
  class El {
    constructor(tag) { this.nodeType = 1; this.localName = String(tag).toLowerCase(); this.tagName = this.localName.toUpperCase(); this.childNodes = []; this.parentNode = null; this.attrs = {}; this.listeners = {};
      this.style = { setProperty() {}, removeProperty() {}, getPropertyValue() { return ''; } }; this.hidden = false; this.disabled = false; this.readOnly = false; this.checked = false; this.value = ''; this.tabIndex = 0; this.rows = 2; this.maxLength = -1; this.scrollTop = 0;
      const self = this; this.classList = { add(...c) { const s = self.className.split(/\s+/).filter(Boolean); c.forEach(x => { if (s.indexOf(x) < 0) s.push(x); }); self.className = s.join(' '); },
        remove(...c) { self.className = self.className.split(/\s+/).filter(x => x && c.indexOf(x) < 0).join(' '); }, contains(c) { return self.className.split(/\s+/).indexOf(c) >= 0; },
        toggle(c, on) { const has = this.contains(c); if (on === undefined ? has : !on) this.remove(c); else this.add(c); return !has; } }; }
    get id() { return this.attrs.id || ''; } set id(v) { this.attrs.id = String(v); }
    get className() { return this.attrs.class || ''; } set className(v) { this.attrs.class = String(v); }
    get children() { return this.childNodes.filter(n => n.nodeType === 1); }
    get firstChild() { return this.childNodes[0] || null; } get lastChild() { return this.childNodes[this.childNodes.length - 1] || null; }
    get firstElementChild() { return this.children[0] || null; }
    get nextSibling() { return sib(this, 1); } get previousSibling() { return sib(this, -1); } get parentElement() { return this.parentNode && this.parentNode.nodeType === 1 ? this.parentNode : null; }
    get textContent() { return this.childNodes.map(n => n.textContent).join(''); }
    set textContent(v) { this.childNodes.forEach(n => { n.parentNode = null; }); this.childNodes = []; if (v !== '' && v != null) this.appendChild(new Text(v)); }
    set innerHTML(v) { this.textContent = ''; } get innerHTML() { return ''; }
    get offsetParent() { for (let n = this; n; n = n.parentNode) { if (n.hidden) return null; if (n === doc.body) return n; } return null; }
    get offsetWidth() { return this.offsetParent ? 100 : 0; } get offsetHeight() { return this.offsetParent ? 20 : 0; } get clientHeight() { return 600; } get scrollHeight() { return 600; }
    get isConnected() { for (let n = this; n; n = n.parentNode) if (n === doc.body) return true; return false; }
    appendChild(c) { if (!c) return c; if (c.parentNode) c.parentNode.removeChild(c); c.parentNode = this; this.childNodes.push(c); return c; }
    append(...cs) { cs.forEach(c => this.appendChild(typeof c === 'string' ? new Text(c) : c)); }
    insertBefore(c, ref) { if (!ref) return this.appendChild(c); if (c.parentNode) c.parentNode.removeChild(c); const i = this.childNodes.indexOf(ref); c.parentNode = this; this.childNodes.splice(i < 0 ? this.childNodes.length : i, 0, c); return c; }
    removeChild(c) { const i = this.childNodes.indexOf(c); if (i >= 0) this.childNodes.splice(i, 1); c.parentNode = null; return c; }
    replaceChild(n, o) { this.insertBefore(n, o); this.removeChild(o); return o; }
    remove() { if (this.parentNode) this.parentNode.removeChild(this); }
    setAttribute(k, v) { this.attrs[k] = String(v); } getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; } removeAttribute(k) { delete this.attrs[k]; } hasAttribute(k) { return k in this.attrs; }
    addEventListener(t, f) { (this.listeners[t] = this.listeners[t] || []).push(f); } removeEventListener(t, f) { this.listeners[t] = (this.listeners[t] || []).filter(x => x !== f); }
    dispatchEvent(e) { if (!e.target) e.target = this; for (let n = this; n; n = n.parentNode) { e.currentTarget = n; (n.listeners && n.listeners[e.type] || []).slice().forEach(f => f.call(n, e)); if (e.cancelBubble || e.bubbles === false) break; if (n === doc.body) { (doc.listeners[e.type] || []).slice().forEach(f => f.call(doc, e)); break; } } return !e.defaultPrevented; }
    click() { if (this.disabled) return; this.dispatchEvent(ev('click')); }
    focus() { doc.activeElement = this; } blur() { if (doc.activeElement === this) doc.activeElement = null; }
    scrollIntoView() {} scrollTo() {} scrollBy() {} select() {} setSelectionRange() {}
    getBoundingClientRect() { return { top: 0, left: 0, right: 100, bottom: 20, width: 100, height: 20 }; }
    requestSubmit() { this.dispatchEvent(ev('submit', { cancelable: true })); }
    matches(q) { return match(this, q); }
    closest(q) { for (let n = this; n && n.nodeType === 1; n = n.parentNode) if (match(n, q)) return n; return null; }
    contains(o) { for (let n = o; n; n = n.parentNode) if (n === this) return true; return false; }
    querySelector(q) { return this.querySelectorAll(q)[0] || null; }
    querySelectorAll(q) { return selectAll(this, q); }
    cloneNode() { return new El(this.localName); }
  }
  PROPS.forEach(p => { if (!Object.getOwnPropertyDescriptor(El.prototype, p)) Object.defineProperty(El.prototype, p, { get() { return this.attrs[p === 'htmlFor' ? 'for' : p] || ''; }, set(v) { this.attrs[p === 'htmlFor' ? 'for' : p] = String(v); } }); });
  const ev = (type, o) => Object.assign({ type, bubbles: true, defaultPrevented: false, cancelBubble: false, preventDefault() { this.defaultPrevented = true; }, stopPropagation() { this.cancelBubble = true; } }, o || {});
  function simple(n, s) { if (!s || s === '*') return true; const m = s.match(/^([a-z0-9-]*)((?:[#.][\w-]+)*)((?:\[[^\]]+\])*)$/i); if (!m) return false;
    if (m[1] && n.localName !== m[1].toLowerCase()) return false;
    const parts = m[2].match(/[#.][\w-]+/g) || []; for (const p of parts) { if (p[0] === '#' && n.id !== p.slice(1)) return false; if (p[0] === '.' && n.className.split(/\s+/).indexOf(p.slice(1)) < 0) return false; }
    const at = m[3].match(/\[[^\]]+\]/g) || []; for (const a of at) { const mm = a.match(/^\[([\w-]+)(?:([\^$*]?=)"?([^"\]]*)"?)?\]$/); if (!mm) return false; const v = n.getAttribute(mm[1]); if (v === null) return false;
      if (mm[2] === '=' && v !== mm[3]) return false; if (mm[2] === '^=' && v.indexOf(mm[3]) !== 0) return false; if (mm[2] === '$=' && !v.endsWith(mm[3])) return false; if (mm[2] === '*=' && v.indexOf(mm[3]) < 0) return false; }
    return true; }
  function match(n, q) { return q.split(',').some(one => { const ps = one.trim().split(/\s+/); if (!simple(n, ps[ps.length - 1])) return false; let up = n.parentNode;
      for (let i = ps.length - 2; i >= 0; i--) { while (up && up.nodeType === 1 && !simple(up, ps[i])) up = up.parentNode; if (!up || up.nodeType !== 1) return false; up = up.parentNode; } return true; }); }
  function selectAll(root, q) { const sc = /^:scope\s*>\s*(.+)$/.exec(q); if (sc) return root.childNodes.filter(k => k.nodeType === 1 && simple(k, sc[1].trim())); const out = []; const walk = (n) => { n.childNodes.forEach(k => { if (k.nodeType === 1) { if (match(k, q)) out.push(k); walk(k); } }); }; walk(root); return out; }
  doc.createElement = (t) => new El(t); doc.createElementNS = (ns, t) => new El(t); doc.createTextNode = (t) => new Text(t); doc.createDocumentFragment = () => new El('#fragment');
  doc.documentElement = new El('html'); doc.body = new El('body'); doc.documentElement.appendChild(doc.body); doc.head = new El('head');
  doc.getElementById = (id) => { const f = (n) => { for (const k of n.childNodes) if (k.nodeType === 1) { if (k.id === id) return k; const r = f(k); if (r) return r; } return null; }; return f(doc.body); };
  doc.querySelector = (q) => doc.body.querySelector(q); doc.querySelectorAll = (q) => doc.body.querySelectorAll(q);
  doc.addEventListener = (t, f) => { (doc.listeners[t] = doc.listeners[t] || []).push(f); }; doc.removeEventListener = () => {};
  doc.dispatch = (t, o) => { const e = ev(t, o); e.target = doc; (doc.listeners[t] || []).slice().forEach(f => f.call(doc, e)); return e; };
  doc.ev = ev; doc.El = El; doc.Text = Text;
  return doc;
}

// the markup between <body> and the first script, as nodes (styles and the icon sprite are left out)
function buildBody(doc, html) {
  let body = html.split('<body>')[1] || ''; body = body.split('<script')[0].replace(/<style[\s\S]*?<\/style>/g, '').replace(/<!--[\s\S]*?-->/g, '');
  const stack = [doc.body], re = /<(\/?)([a-zA-Z][\w-]*)([^>]*?)(\/?)>|([^<]+)/g; let m;
  while ((m = re.exec(body))) {
    if (m[5]) { const t = m[5]; if (t.trim()) stack[stack.length - 1].appendChild(doc.createTextNode(t.replace(/&amp;/g, '&').replace(/&middot;/g, '·'))); continue; }
    const tag = m[2].toLowerCase();
    if (m[1]) { for (let i = stack.length - 1; i > 0; i--) if (stack[i].localName === tag) { stack.length = i; break; } continue; }
    const el = doc.createElement(tag), at = /([\w:-]+)(?:="([^"]*)")?/g; let a;
    while ((a = at.exec(m[3]))) { if (a[1] === 'hidden') el.hidden = true; else el.setAttribute(a[1] === 'class' ? 'class' : a[1], a[2] == null ? '' : a[2]); }
    stack[stack.length - 1].appendChild(el); if (!m[4] && !VOID[tag]) stack.push(el);
  }
}

// one tab: a fresh context running the page's scripts. shared: { ls (the shared store), deliver (true: storage events go to the other tabs), tabs }
function openTab(o) {
  const { html, scripts, shared, answer, clock } = o, win = { listeners: {} }, doc = makeDoc(win), TQ = [], T = { win, doc, TQ, sent: [], reload: false, name: o.name, session: o.session || {} };
  buildBody(doc, html);
  let tid = 0; const setT = (f, ms) => { tid++; if (typeof f === 'function') TQ.push({ id: tid, f, ms: +ms || 0 }); return tid; }, clearT = (id) => { const i = TQ.findIndex(x => x.id === id); if (i >= 0) TQ.splice(i, 1); };
  const NOW = () => clock.t;
  class FDate extends Date { constructor(...a) { if (a.length === 0) super(NOW()); else super(...a); } static now() { return NOW(); } }
  const ls = {
    getItem(k) { return Object.prototype.hasOwnProperty.call(shared.ls, k) ? shared.ls[k] : null; },
    setItem(k, v) { const old = this.getItem(k); shared.ls[k] = String(v); shared.emit(T, k, old, String(v)); },
    removeItem(k) { const old = this.getItem(k); if (old === null) return; delete shared.ls[k]; shared.emit(T, k, old, null); },
    clear() { Object.keys(shared.ls).forEach(k => this.removeItem(k)); }, key(i) { return Object.keys(shared.ls)[i] || null; }, get length() { return Object.keys(shared.ls).length; } };
  const ss = { getItem(k) { return k in T.session ? T.session[k] : null; }, setItem(k, v) { T.session[k] = String(v); }, removeItem(k) { delete T.session[k]; }, clear() { Object.keys(T.session).forEach(k => delete T.session[k]); } };
  const location = { search: '', pathname: '/', href: 'http://np.test/', reload() { T.reload = true; }, replace() { T.reload = true; }, assign() { T.reload = true; } };
  const fetch = (path, opt) => { const body = JSON.parse(opt.body); const rec = { path, kind: String(path).replace(/^\/api\//, ''), body }; T.sent.push(rec); const out = answer(rec);
    return new Promise((res) => { setT(() => res({ status: out.status, json: () => Promise.resolve(out.body) }), 1); }); };
  Object.assign(win, { document: doc, localStorage: ls, sessionStorage: ss, location, history: { replaceState() {}, pushState() {} }, navigator: { userAgent: 'minidom', clipboard: null },
    setTimeout: setT, clearTimeout: clearT, setInterval: () => 0, clearInterval: () => {}, requestAnimationFrame: (f) => setT(() => f(NOW()), 16), cancelAnimationFrame: clearT,
    matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }), getComputedStyle: () => ({ getPropertyValue: () => '' }),
    performance: { now: () => NOW() }, scrollTo() {}, innerWidth: 390, innerHeight: 844, devicePixelRatio: 1, fetch, Date: FDate, URLSearchParams, AbortController: class { constructor() { this.signal = {}; } abort() {} },
    console, Event: function (t, o) { return doc.ev(t, o); }, KeyboardEvent: function (t, o) { return doc.ev(t, o); }, CSS: { supports: () => false }, Promise, JSON, Math });
  win.addEventListener = (t, f) => { (win.listeners[t] = win.listeners[t] || []).push(f); }; win.removeEventListener = () => {};
  win.dispatch = (t, o) => { const e = doc.ev(t, o); (win.listeners[t] || []).slice().forEach(f => f.call(win, e)); return e; };
  win.window = win; win.self = win; win.globalThis = win;
  const ctx = vm.createContext(win); T.ctx = ctx; T.err = null;
  for (const s of scripts) { try { s.runInContext(ctx); } catch (e) { T.err = e; break; } }
  T.run = (code) => vm.runInContext(code, ctx);
  T.$ = (id) => doc.getElementById(id);
  T.flush = (rounds) => { for (let i = 0; i < (rounds || 30) && TQ.some(x => x.ms < 5000); i++) { const q = TQ.filter(x => x.ms < 5000); q.forEach(x => { const j = TQ.indexOf(x); if (j >= 0) TQ.splice(j, 1); }); q.forEach(x => { try { x.f(); } catch (e) { T.err = T.err || e; } }); } };
  T.text = (id) => { const n = T.$(id); if (!n) return ''; const walk = (x) => x.nodeType === 3 ? x.data : x.hidden ? '' : x.childNodes.map(walk).join(' '); return walk(n).replace(/\s+/g, ' '); };
  T.shown = (id) => { const n = T.$(id); if (!n) return false; for (let x = n; x; x = x.parentNode) if (x.hidden) return false; return true; };
  T.has = (rootId, id) => { const r = T.$(rootId); if (!r || !T.shown(rootId)) return false; const f = (x) => x.nodeType === 1 && !x.hidden && (x.id === id || x.childNodes.some(f)); return r.childNodes.some(f); };
  T.click = (id) => { const n = T.$(id); if (!n) return false; n.click(); return true; };
  T.type = (id, v) => { const n = T.$(id); if (!n) return false; n.value = v; n.dispatchEvent(doc.ev('input')); return true; };
  T.submit = (id) => { let n = T.$(id); while (n && n.localName !== 'form') n = n.parentNode; if (!n) return false; n.dispatchEvent(doc.ev('submit', { cancelable: true })); return true; };
  T.key = (k) => doc.dispatch('keydown', { key: k });
  T.storage = (e) => win.dispatch('storage', e);
  T.back = () => { win.dispatch('pageshow', { persisted: true }); doc.dispatch('visibilitychange'); win.dispatch('focus'); };
  return T;
}

// the page's scripts, compiled once per page file. The app's one closure is opened (its first "(function(){" and its last "})();" are taken off), so its state is
// read from the context by name; nothing inside it is changed
function unwrap(src) { const i = src.indexOf('(function(){'), j = src.lastIndexOf('})();'); if (i < 0 || i > 600 || j < 0) return src; return src.slice(0, i) + src.slice(i + 12, j) + src.slice(j + 5); }
function compile(html) { const out = []; const re = /<script(?: id="([^"]*)")?>([\s\S]*?)<\/script>/g; let m; while ((m = re.exec(html))) out.push(new vm.Script(m[1] ? m[2] : unwrap(m[2]), { filename: m[1] || 'app' })); return out; }

module.exports = { openTab, compile };
