const e = [];
for (let n = 0; n < 256; ++n) e.push((n + 256).toString(16).slice(1));
function m(n, t = 0) {
  return (
    e[n[t + 0]] +
    e[n[t + 1]] +
    e[n[t + 2]] +
    e[n[t + 3]] +
    "-" +
    e[n[t + 4]] +
    e[n[t + 5]] +
    "-" +
    e[n[t + 6]] +
    e[n[t + 7]] +
    "-" +
    e[n[t + 8]] +
    e[n[t + 9]] +
    "-" +
    e[n[t + 10]] +
    e[n[t + 11]] +
    e[n[t + 12]] +
    e[n[t + 13]] +
    e[n[t + 14]] +
    e[n[t + 15]]
  ).toLowerCase();
}
let d;
const i = new Uint8Array(16);
function g() {
  if (!d) {
    if (typeof crypto == "undefined" || !crypto.getRandomValues)
      throw new Error(
        "crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported"
      );
    d = crypto.getRandomValues.bind(crypto);
  }
  return d(i);
}
const U =
    typeof crypto != "undefined" &&
    crypto.randomUUID &&
    crypto.randomUUID.bind(crypto),
  y = { randomUUID: U };
function p(n, t, l) {
  var c, o, r;
  if (y.randomUUID && !n) return y.randomUUID();
  n = n || {};
  const u =
    (r =
      (o = n.random) != null ? o : (c = n.rng) == null ? void 0 : c.call(n)) !=
    null
      ? r
      : g();
  if (u.length < 16) throw new Error("Random bytes length must be >= 16");
  return (u[6] = (u[6] & 15) | 64), (u[8] = (u[8] & 63) | 128), m(u);
}
export { p as v };
