// In-browser fake of the ASP.NET Core API, used only by the public demo build (VITE_DEMO=true).
// Data is fictional, lives in localStorage and can be reset from the demo banner.
import { API_URL } from "../config/api";

type Product = {
  id: number; name: string; type: string; category: string; brand: string;
  factoryValue: number; salesValue: number; quantity: number; active: boolean; createAt: string; updateAt: string;
};
type Person = {
  id: number; type: number; name: string; phoneNumber: string; email: string; document: string;
  active: boolean; createAt: string; updateAt: string;
};
type Item = {
  id: number; transactionId: number; productId: number; product?: Product; amount: number;
  value: number; sellValue: number; discount: number; active: boolean; createAt: string; updateAt: string;
};
type Transaction = {
  id: number; transactionAt: string; personId: number; person?: Person; type: number; totalValue: number;
  totalDiscount: number; finalValue: number; paymentMethod: number; transactionsItems: Item[];
  active: boolean; createAt: string; updateAt: string;
};
type Db = { products: Product[]; people: Person[]; transactions: Transaction[]; seq: number };

const KEY = "simplify-demo-db-v1";
const round = (n: number) => Math.round(n * 100) / 100;
const iso = (d: Date) => d.toISOString();

function seed(): Db {
  const now = new Date();
  const stamp = iso(now);
  const db: Db = { products: [], people: [], transactions: [], seq: 1 };
  const catalog: [string, string, string, string, number, number, number][] = [
    ["Café torrado 500g", "Alimento", "Mercearia", "Serra Alta", 14.5, 24.9, 180],
    ["Açúcar cristal 1kg", "Alimento", "Mercearia", "Doce Vale", 3.9, 6.49, 220],
    ["Detergente 500ml", "Limpeza", "Higiene e limpeza", "Brilha+", 1.7, 3.29, 260],
    ["Arroz tipo 1 5kg", "Alimento", "Mercearia", "Grão Bom", 19.9, 29.9, 120],
    ["Sabonete 90g", "Higiene", "Higiene e limpeza", "Flor do Campo", 1.1, 2.49, 190],
    ["Refrigerante 2L", "Bebida", "Bebidas", "Gelato", 5.2, 8.99, 150],
    ["Biscoito recheado", "Alimento", "Mercearia", "Crocante", 2.1, 3.99, 200],
    ["Água mineral 1,5L", "Bebida", "Bebidas", "Fonte Clara", 1.3, 2.99, 60],
  ];
  catalog.forEach(([name, type, category, brand, factoryValue, salesValue, quantity], i) =>
    db.products.push({ id: i + 1, name, type, category, brand, factoryValue, salesValue, quantity, active: true, createAt: stamp, updateAt: stamp }));
  const people: [number, string, string, string, string][] = [
    [0, "Ana Ribeiro", "(16) 90000-0001", "ana@exemplo.test", "000.000.001-00"],
    [0, "Bruno Carvalho", "(16) 90000-0002", "bruno@exemplo.test", "000.000.002-00"],
    [0, "Carla Mendes", "(16) 90000-0003", "carla@exemplo.test", "000.000.003-00"],
    [0, "Diego Santos", "(16) 90000-0004", "diego@exemplo.test", "000.000.004-00"],
    [1, "Distribuidora Exemplo Ltda", "(16) 3000-0001", "vendas@distribuidora.test", "00.000.000/0001-00"],
    [1, "Atacado Modelo S.A.", "(16) 3000-0002", "contato@atacado.test", "00.000.000/0002-00"],
  ];
  people.forEach(([type, name, phoneNumber, email, document], i) =>
    db.people.push({ id: i + 1, type, name, phoneNumber, email, document, active: true, createAt: stamp, updateAt: stamp }));

  const tx = (daysAgo: number, hour: number, personId: number, type: number, paymentMethod: number, items: [number, number][], discount = 0) => {
    const d = new Date(now); d.setDate(d.getDate() - daysAgo); d.setHours(hour, 20, 0, 0);
    const byId = (id: number) => db.products.find((p) => p.id === id)!;
    const unit = type === 1 ? "salesValue" : "factoryValue";
    const totalValue = round(items.reduce((a, [id, n]) => a + byId(id)[unit] * n, 0));
    create(db, {
      transactionAt: iso(d), personId, type, paymentMethod, totalValue, totalDiscount: discount,
      finalValue: round(totalValue - discount), active: true,
      transactionsItems: items.map(([productId, amount]) => ({ productId, amount, value: 0, sellValue: 0, discount: 0 })),
    });
  };
  db.seq = 1;
  tx(14, 9, 5, 0, 3, [[1, 20], [4, 10], [6, 24]]);
  const plan: [number, [number, number][], number][] = [
    [13, [[1, 2], [4, 1], [7, 3]], 3], [12, [[2, 4], [6, 2]], 0], [11, [[3, 6], [5, 4], [8, 3], [1, 1]], 3], [10, [[1, 3], [4, 2]], 2],
    [9, [[4, 2], [7, 5], [6, 3]], 3], [8, [[6, 4], [8, 6], [1, 2]], 1], [7, [[1, 4], [2, 3], [4, 1]], 0], [6, [[3, 5], [4, 3], [7, 2], [1, 2]], 3],
    [5, [[5, 8], [8, 4], [6, 2]], 3], [4, [[1, 2], [6, 3], [4, 2]], 2], [3, [[4, 3], [2, 2], [1, 3]], 0], [2, [[1, 5], [7, 4], [6, 4]], 3],
    [1, [[3, 4], [6, 5], [8, 2], [4, 2]], 1], [0, [[4, 2], [1, 3], [2, 2]], 3],
  ];
  for (const [daysAgo, items, pm] of plan) tx(daysAgo, 10 + (daysAgo % 8), 1 + (daysAgo % 4), 1, pm, items, daysAgo % 5 === 0 ? 3 : 0);
  return db;
}

// Mirrors TransactionService.Create: purchases add stock, sales remove it.
type TransactionForm = Omit<Partial<Transaction>, "transactionsItems"> & { transactionsItems: Partial<Item>[] };
function create(db: Db, form: TransactionForm): Transaction {
  const stamp = iso(new Date());
  const id = db.seq++;
  const items: Item[] = [];
  for (const it of form.transactionsItems) {
    const product = db.products.find((p) => p.id === it.productId);
    if (!product) throw new Error(`Produto com ID ${it.productId} não encontrado.`);
    const amount = Number(it.amount) || 0;
    if (form.type === 0) product.quantity += amount;
    else {
      if (product.quantity < amount) throw new Error(`Estoque insuficiente para o produto ${product.name}.`);
      product.quantity -= amount;
    }
    items.push({ id: id * 100 + items.length, transactionId: id, productId: product.id, product: { ...product }, amount,
      value: product.factoryValue, sellValue: product.salesValue, discount: Number(it.discount) || 0, active: true, createAt: stamp, updateAt: stamp });
  }
  const t: Transaction = {
    id, transactionAt: form.transactionAt || stamp, personId: Number(form.personId), type: Number(form.type),
    totalValue: Number(form.totalValue) || 0, totalDiscount: Number(form.totalDiscount) || 0,
    finalValue: Number(form.finalValue ?? (Number(form.totalValue) || 0) - (Number(form.totalDiscount) || 0)),
    paymentMethod: Number(form.paymentMethod) || 0, transactionsItems: items, active: form.active ?? true, createAt: stamp, updateAt: stamp,
  };
  t.person = db.people.find((p) => p.id === t.personId);
  db.transactions.push(t);
  return t;
}

function load(): Db {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Db;
  } catch { /* fall through to a fresh seed */ }
  const db = seed();
  save(db);
  return db;
}
function save(db: Db) {
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* storage may be unavailable */ }
}
export function resetDemo() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

const json = (body: unknown, status = 200) =>
  new Response(body === undefined ? null : JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const text = (body: string, status: number) => new Response(body, { status });

function route(method: string, path: string, body: any): Response {
  const db = load();
  const seg = path.split("/").filter(Boolean); // ["api", "Product", "3"]
  const resource = (seg[1] || "").toLowerCase();
  const nowIso = iso(new Date());
  const done = (r: Response) => { save(db); return r; };

  if (resource === "user") {
    if (seg[2]?.toLowerCase() === "login") return json({ token: "demo-token" });
    return json({ message: "Usuário registrado com sucesso!" });
  }

  if (resource === "product") {
    if (seg[2] === "update-stock") {
      const p = db.products.find((x) => x.id === Number(seg[3]));
      if (!p) return text(`Produto com ID ${seg[3]} não encontrado.`, 404);
      const next = p.quantity + Number(body);
      if (next < 0) return json({ error: "O estoque não pode ficar negativo." }, 400);
      p.quantity = next; p.updateAt = nowIso;
      return done(json(p));
    }
    const id = seg[2] ? Number(seg[2]) : undefined;
    if (method === "GET") {
      if (id === undefined) return json(db.products);
      const p = db.products.find((x) => x.id === id);
      return p ? json(p) : text(`Produto com ID ${id} não encontrado.`, 404);
    }
    if (method === "POST") {
      if (!body?.name) return text("O Nome do produto é obrigatório.", 400);
      const p: Product = { active: true, quantity: 0, type: "", category: "", brand: "", factoryValue: 0, salesValue: 0, ...body,
        id: Math.max(0, ...db.products.map((x) => x.id)) + 1, createAt: nowIso, updateAt: nowIso };
      db.products.push(p);
      return done(json(p, 201));
    }
    const i = db.products.findIndex((x) => x.id === id);
    if (i < 0) return text(`Produto com ID ${id} não encontrado.`, 404);
    if (method === "PUT") { db.products[i] = { ...db.products[i], ...body, id: id!, updateAt: nowIso }; return done(new Response(null, { status: 204 })); }
    if (method === "DELETE") { db.products.splice(i, 1); return done(new Response(null, { status: 204 })); }
  }

  if (resource === "people") {
    const id = seg[2] ? Number(seg[2]) : undefined;
    if (method === "GET") {
      if (id === undefined) return db.people.length ? json(db.people) : text("Nenhuma pessoa encontrada.", 404);
      const p = db.people.find((x) => x.id === id);
      return p ? json(p) : text(`Pessoa com ID ${id} não encontrada.`, 404);
    }
    if (method === "POST") {
      const p: Person = { active: true, phoneNumber: "", email: "", document: "", type: 0, name: "", ...body,
        id: Math.max(0, ...db.people.map((x) => x.id)) + 1, createAt: nowIso, updateAt: nowIso };
      db.people.push(p);
      return done(json(p, 201));
    }
    const i = db.people.findIndex((x) => x.id === id);
    if (i < 0) return text(`Pessoa com ID ${id} não encontrada.`, 404);
    if (method === "PUT") { db.people[i] = { ...db.people[i], ...body, id: id!, updateAt: nowIso }; return done(new Response(null, { status: 204 })); }
    if (method === "DELETE") { db.people.splice(i, 1); return done(new Response(null, { status: 204 })); }
  }

  if (resource === "transaction") {
    if (seg[2] === "toggle-status") {
      const t = db.transactions.find((x) => x.id === Number(seg[3]));
      if (!t) return json({ error: `Transação com ID ${seg[3]} não encontrada.` }, 404);
      t.active = !t.active; t.updateAt = nowIso;
      return done(json({ id: t.id, active: t.active }));
    }
    const id = seg[2] ? Number(seg[2]) : undefined;
    if (method === "GET") {
      if (id === undefined) return json(db.transactions);
      const t = db.transactions.find((x) => x.id === id);
      return t ? json(t) : text(`Transação com ID ${id} não encontrada.`, 404);
    }
    if (method === "POST") {
      if (!body?.transactionsItems?.length) return text("A transação deve conter pelo menos um item.", 400);
      if (!db.people.some((p) => p.id === Number(body.personId))) return text(`Pessoa com ID ${body.personId} não encontrada.`, 400);
      try { return done(json(create(db, body), 201)); } catch (e) { return json({ error: (e as Error).message }, 400); }
    }
    const t = db.transactions.find((x) => x.id === id);
    if (!t) return text(`Transação com ID ${id} não encontrada.`, 404);
    if (method === "PUT") {
      Object.assign(t, { active: body.active ?? t.active, type: body.type ?? t.type, paymentMethod: body.paymentMethod ?? t.paymentMethod,
        personId: body.personId ?? t.personId, updateAt: nowIso });
      t.person = db.people.find((p) => p.id === t.personId);
      return done(new Response(null, { status: 204 }));
    }
    if (method === "DELETE") { t.active = !t.active; t.updateAt = nowIso; return done(new Response(null, { status: 204 })); }
  }

  return text("Not found", 404);
}

export function installMockApi() {
  const realFetch = window.fetch.bind(window);
  const base = API_URL.replace(/\/$/, "");
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (!url.startsWith(base + "/api/")) return realFetch(input, init);
    const method = (init?.method || (input instanceof Request ? input.method : "GET")).toUpperCase();
    let body: unknown;
    if (init?.body && typeof init.body === "string") { try { body = JSON.parse(init.body); } catch { body = init.body; } }
    const path = new URL(url).pathname;
    await new Promise((r) => setTimeout(r, 150)); // feels like a real request
    return route(method, path, body);
  };
}
