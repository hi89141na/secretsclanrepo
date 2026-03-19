const fs = require('fs');
const p = 'frontend/src/pages/admin/ManageOffersPage.jsx';
let c = fs.readFileSync(p, 'utf8');
if (c.includes('scope: \'products\',')) { console.log('already patched'); process.exit(0); }

// 1. add scope to initial formData
c = c.replace('applicableCategories: [],\n    });' + '\n    setShowModal', 'applicableCategories: [],\n      scope: \'products\',\n    });\n    setShowModal');

// 2. add scope to handleEdit
c = c.replace('applicableCategories: offer.applicableCategories?.map(c => c._id || c) || [],\n    });', 'applicableCategories: offer.applicableCategories?.map(c => c._id || c) || [],\n      scope: offer.scope || \'products\',\n    });');

// 3. scope-aware handleInputChange
c = c.replace('const { name, value } = e.target;\n    setFormData((prev) => ({ ...prev, [name]: value }));', 'const { name, value } = e.target;\n    setFormData((prev) => ({\n      ...prev,\n      [name]: value,\n      ...(name === \'scope\' && value === \'entire_store\' ? { applicableProducts: [], applicableCategories: [] } : {})\n    }));');

// 4. scope column in thead

fs.writeFileSync(p, c, 'utf8');
console.log('Phase-1 patches applied');
