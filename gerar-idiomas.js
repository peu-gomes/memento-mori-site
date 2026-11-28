// Gera /pt/, /en/ etc. a partir do index.html, além do sitemap.xml e do robots.txt.
// Rode "node gerar-idiomas.js" sempre que mudar o index.html. Não edite as pastas geradas.
const fs = require("fs");
const SITE = "https://mementomoriweeks.com/";
const PAGINAS = {
  pt: ["pt-BR", "Calendário Memento Mori: sua vida em semanas (PDF grátis)", "Crie seu calendário memento mori e veja sua vida em semanas. PDF grátis para imprimir, sem cadastro."],
  en: ["en", "Memento Mori Calendar: Your Life in Weeks (Free PDF)", "Make your memento mori calendar and see your life in weeks. Free printable PDF, no sign-up."],
  es: ["es", "Calendario Memento Mori: tu vida en semanas (PDF gratis)", "Crea tu calendario memento mori y mira tu vida en semanas. PDF gratis para imprimir, sin registro."],
  fr: ["fr", "Calendrier Memento Mori : votre vie en semaines (PDF gratuit)", "Créez votre calendrier memento mori et voyez votre vie en semaines. PDF gratuit à imprimer, sans inscription."],
  de: ["de", "Memento-Mori-Kalender: dein Leben in Wochen (PDF gratis)", "Erstelle deinen Memento-Mori-Kalender und sieh dein Leben in Wochen. Kostenloses PDF zum Ausdrucken, ohne Anmeldung."],
  it: ["it", "Calendario Memento Mori: la tua vita in settimane (PDF gratis)", "Crea il tuo calendario memento mori e guarda la tua vita in settimane. PDF gratis da stampare, senza registrazione."]
};
const base = fs.readFileSync("index.html", "utf8");
const trocar = (html, de, para) => {
  if (!de.test(html)) throw new Error("Não encontrado no index.html: " + de);
  return html.replace(de, () => para);
};
for (const [id, [lang, titulo, descricao]] of Object.entries(PAGINAS)) {
  let h = base;
  h = trocar(h, /<html lang="[^"]*">/, `<html lang="${lang}" data-idioma="${id}">`);
  h = trocar(h, /<title>[^<]*<\/title>/, `<title>${titulo}</title>`);
  h = trocar(h, /<meta name="description" content="[^"]*">/, `<meta name="description" content="${descricao}">`);
  h = trocar(h, /<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${SITE}${id}/">`);
  h = trocar(h, /<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${titulo}">`);
  h = trocar(h, /<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${descricao}">`);
  h = trocar(h, /<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${SITE}${id}/">`);
  for (const arq of ["manifest.json", "icon.svg", "icon-180.png", "lib/jspdf.umd.min.js", "lib/goatcounter-count.js"]) {
    h = trocar(h, new RegExp(`(href|src)="${arq}"`), `${arq.endsWith(".js") ? "src" : "href"}="../${arq}"`);
  }
  h = trocar(h, /register\("sw\.js"\)/, 'register("../sw.js")');
  fs.mkdirSync(id, { recursive: true });
  fs.writeFileSync(`${id}/index.html`, h);
}
const urls = ["", ...Object.keys(PAGINAS).map((id) => id + "/")];
fs.writeFileSync("sitemap.xml", '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map((u) => `  <url><loc>${SITE}${u}</loc></url>\n`).join("") + "</urlset>\n");
fs.writeFileSync("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${SITE}sitemap.xml\n`);
console.log("ok");
