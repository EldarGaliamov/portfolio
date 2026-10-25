const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../scripts/smoothscroll.js'), 'utf8');

function environment({ reduced = false, fine = true, library = true, locked = false } = {}) {
  const media = value => ({ matches: value, addEventListener(name, cb) { this.change = cb; } });
  const preference = media(reduced), pointer = media(fine), instances = [], events = {}, keys = {};
  const body = { classList: { contains: () => locked } };
  const document = { body, addEventListener: (name, cb) => keys[name] = cb };
  class Lenis {
    constructor(options) { this.options = options; this.calls = []; instances.push(this); }
    destroy() { this.calls.push('destroy'); }
    start() { this.calls.push('start'); }
    stop() { this.calls.push('stop'); }
    scrollTo(target, options) { this.calls.push({ target, ...options }); }
  }
  let observer;
  class MutationObserver {
    constructor(callback) { this.callback = callback; observer = this; }
    observe() {}
  }
  const window = {
    scrollY: 420,
    matchMedia: query => query.includes('reduced') ? preference : pointer,
    addEventListener: (name, cb) => events[name] = cb,
  };
  if (library) window.Lenis = Lenis;
  vm.runInNewContext(source, { window, document, MutationObserver });
  return { preference, pointer, instances, events, keys, observer,
    lock(value) { locked = value; observer.callback(); } };
}

let count = 0;
function test(name, callback) { callback(); count++; console.log('PASS ' + name); }
test('native scrolling remains available for touch, reduced motion, or a missing library', () => {
  for (const options of [{fine:false}, {reduced:true}, {library:false}])
    assert.equal(environment(options).instances.length, 0);
});
test('desktop gets wheel inertia without simulated touch or navigation lock', () => {
  const e = environment(); assert.equal(e.instances.length,1);
  const options = e.instances[0].options;
  assert.equal(options.smoothWheel,true); assert.equal(options.syncTouch,false);
  assert.equal(options.anchors,true); assert.equal(options.stopInertiaOnNavigate,true);
  assert.equal(options.autoRaf,true); assert.equal(options.lerp,0.075);
});
test('opening a lightbox stops inertia and closing it resumes scrolling', () => {
  const e = environment(); const instance = e.instances[0];
  e.lock(true); assert.equal(instance.calls.at(-1),'stop');
  e.lock(false); assert.equal(instance.calls.at(-1),'start');
});
test('keyboard navigation stops momentum without preventing the native event', () => {
  const e = environment(); let prevented=false;
  e.keys.keydown({key:'PageDown', preventDefault:()=>prevented=true});
  const call = e.instances[0].calls.at(-1);
  assert.equal(call.target,420); assert.equal(call.immediate,true); assert.equal(prevented,false);
});
test('changing motion preference or pointer capabilities cleans up the active instance', () => {
  for (const media of ['preference','pointer']) {
    const e=environment(); const instance=e.instances[0];
    e[media].matches=media==='preference'; e[media].change();
    assert.equal(instance.calls.at(-1),'destroy');
  }
});
test('page navigation destroys the animation loop and history restore recreates it once', () => {
  const e=environment(); e.events.pagehide(); assert.equal(e.instances[0].calls.at(-1),'destroy');
  e.events.pageshow(); e.events.pageshow(); assert.equal(e.instances.length,2);
});
test('nested scroll surfaces can opt out of wheel smoothing', () => {
  const e=environment(); const prevent=e.instances[0].options.prevent;
  assert.equal(prevent({matches:selector=>selector.includes('.image-lightbox__viewport')}),true);
  assert.equal(prevent({matches:()=>false}),false);
});
console.log(`${count} scroll behavior checks passed.`);
