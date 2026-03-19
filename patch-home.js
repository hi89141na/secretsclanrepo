const fs = require('fs');
const p = 'frontend/src/pages/public/HomePage.jsx';
let c = fs.readFileSync(p, 'utf8');
if (c.includes('OfferBanner')) { console.log('already patched'); process.exit(0); }
const bannerImport = 'import OfferBanner from "../../components/common/OfferBanner";\n';
c = c.replace('import { motion }', bannerImport + 'import { motion }');
c = c.replace('<div className="overflow-hidden">', '<div className="overflow-hidden">\n      <OfferBanner />');
fs.writeFileSync(p, c, 'utf8');
console.log('OK patched HomePage.jsx');
