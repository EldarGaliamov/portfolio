const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(require('node:path').join(__dirname, '../scripts/motion.js'), 'utf8');

class Element {
  constructor(top = 1200, parent = null) {
    this.top = top;
    this.parentElement = parent;
    this.classes = new Set();
    this.classList = { add: (...names) => names.forEach(name => this.classes.add(name)) };
    this.values = {};
    this.style = { setProperty: (name, value) => this.values[name] = value };
    this.events = new Map();
  }
  getBoundingClientRect() { return { top: this.top }; }
  contains(target) {
    for (let item = target; item; item = item.parentElement) if (item === this) return true;
    return false;
  }
  addEventListener(name, callback) { this.events.set(name, callback); }
  removeEventListener(name) { this.events.delete(name); }
}

function environment({ reduced = false, memory = 8, observerSupported = true } = {}) {
  const preference = new Element();
  preference.matches = reduced;
  const observers = [];
  class Observer {
    constructor(callback, options) {
      this.callback = callback;
      this.options = options;
      this.observed = new Set();
      observers.push(this);
    }
    observe(item) { this.observed.add(item); }
    unobserve(item) { this.observed.delete(item); }
    disconnect() { this.observed.clear(); this.disconnected = true; }
    enter(items) {
      this.callback(items.map(item => ({
        target: item,
        isIntersecting: true,
        boundingClientRect: { top: item.top, left: 0 },
      })));
    }
  }
  const window = { innerHeight: 960, matchMedia: () => preference };
  if (observerSupported) window.IntersectionObserver = Observer;
  vm.runInNewContext(source, { window, navigator: { deviceMemory: memory }, IntersectionObserver: Observer });
  const scope = new Element(0);
  scope.items = [];
  scope.querySelectorAll = () => scope.items;
  return { window, preference, observers, scope };
}

let passed = 0;
function test(name, callback) { callback(); passed++; console.log('PASS ' + name); }

test('reduced motion leaves content visible and creates no observer', () => {
  const e = environment({ reduced: true });
  const item = new Element(1200, e.scope); e.scope.items = [item];
  e.window.PortfolioMotion.reveal(e.scope, '.item');
  assert.equal(item.classes.size, 0); assert.equal(e.observers.length, 0);
});
test('unsupported observer and constrained devices leave content visible', () => {
  for (const settings of [{observerSupported: false}, {memory: 2}]) {
    const e = environment(settings); const item = new Element(1200, e.scope); e.scope.items = [item];
    e.window.PortfolioMotion.reveal(e.scope, '.item');
    assert.equal(item.classes.size, 0); assert.equal(e.observers.length, 0);
  }
});
test('initial viewport stays visible and nested reveal candidates do not double-animate', () => {
  const e = environment(); const visible = new Element(100, e.scope);
  const parent = new Element(1200, e.scope); const child = new Element(1250, parent);
  e.scope.items = [visible, parent, child]; e.window.PortfolioMotion.reveal(e.scope, '.item');
  assert.equal(visible.classes.size, 0); assert.equal(child.classes.size, 0);
  assert(parent.classes.has('motion-reveal')); assert.equal(e.observers[0].observed.size, 1);
});
test('tall elements reveal at the edge rather than needing a percentage of their height', () => {
  const e = environment(); const item = new Element(1200, e.scope); e.scope.items = [item];
  e.window.PortfolioMotion.reveal(e.scope, '.item'); const observer = e.observers[0];
  assert.equal(observer.options.threshold, 0); observer.enter([item]);
  assert(item.classes.has('is-visible')); assert(observer.disconnected);
});
test('stagger is local to entering siblings, bounded, and independent of document index', () => {
  const e = environment(); const group = new Element(1100, e.scope);
  const items = Array.from({ length: 4 }, (_, i) => new Element(1200 + i * 5, group));
  const separate = new Element(1300, e.scope); e.scope.items = [...items, separate];
  e.window.PortfolioMotion.reveal(e.scope, '.item'); e.observers[0].enter([...items].reverse().concat(separate));
  assert.deepEqual(items.map(item => item.values['--reveal-delay']), ['0ms', '45ms', '90ms', '90ms']);
  assert.equal(separate.values['--reveal-delay'], '0ms');
});
test('keyboard focus reveals a pending interactive card without stagger', () => {
  const e = environment(); const item = new Element(1200, e.scope); e.scope.items = [item];
  e.window.PortfolioMotion.reveal(e.scope, '.item');
  e.scope.events.get('focusin')({ target: new Element(1220, item) });
  assert(item.classes.has('is-visible')); assert.equal(item.values['--reveal-delay'], '0ms');
  assert(e.observers[0].disconnected);
});
test('changing reduced-motion preference reveals every pending item and removes listeners', () => {
  const e = environment(); e.scope.items = [new Element(1200, e.scope), new Element(1800, e.scope)];
  e.window.PortfolioMotion.reveal(e.scope, '.item'); e.preference.matches = true;
  e.preference.events.get('change')();
  assert(e.scope.items.every(item => item.classes.has('is-visible')));
  assert.equal(e.scope.events.size, 0); assert.equal(e.preference.events.size, 0);
  assert(e.observers[0].disconnected);
});
console.log(`${passed} meaningful motion behavior checks passed.`);
