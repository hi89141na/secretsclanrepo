const fs = require('fs');
const p = 'frontend/src/pages/admin/ManageOffersPage.jsx';
let c = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');

// 1. scope in handleAdd
c = c.replace("      applicableCategories: [],\n    });\n    setShowModal(true);\n  };", "      applicableCategories: [],\n      scope: 'products',\n    });\n    setShowModal(true);\n  };");

// 2. scope in handleEdit
c = c.replace("applicableCategories: offer.applicableCategories?.map(c => c._id || c) || [],\n    });\n    setShowModal", "applicableCategories: offer.applicableCategories?.map(c => c._id || c) || [],\n      scope: offer.scope || 'products',\n    });\n    setShowModal");

// 3. scope-aware handleInputChange
c = c.replace("    const { name, value } = e.target;\n    setFormData((prev) => ({ ...prev, [name]: value }));", "    const { name, value } = e.target;\n    setFormData((prev) => ({ ...prev, [name]: value, ...(name === 'scope' && value === 'entire_store' ? { applicableProducts: [], applicableCategories: [] } : {}) }));");

// 4. scope column header
c = c.replace("                  Date Range\n                </th>\n                <th", "                  Date Range\n                </th>\n                <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">Scope</th>\n                <th");

// 5. scope badge in row (after date range td, before status td)
const scopeBadge = 
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={offer.scope==='entire_store'?'px-2 text-xs font-semibold rounded-full bg-purple-100 text-purple-800':offer.scope==='categories'?'px-2 text-xs font-semibold rounded-full bg-blue-100 text-blue-800':'px-2 text-xs font-semibold rounded-full bg-green-100 text-green-800'}>
                        {offer.scope==='entire_store'?'Entire Store':offer.scope==='categories'?'Categories':'Products'}
                      </span>
                    </td>;
c = c.replace("{formatDateRange(offer.startDate, offer.endDate)}\n                    </td>\n                    <td className=\"px-6 py-4 whitespace-nowrap\">\n                      <span\n                        className={", "{formatDateRange(offer.startDate, offer.endDate)}\n                    </td>" + scopeBadge + "\n                    <td className=\"px-6 py-4 whitespace-nowrap\">\n                      <span\n                        className={");

// 6. scope radio buttons before Discount Type
const scopeUI =                   <div className="md:col-span-2">
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Offer Scope</label>
                    <div className="flex flex-wrap gap-4 p-3 border rounded bg-gray-50">
                      {[['entire_store','Entire Store'],['categories','Categories'],['products','Products']].map(([val,lbl]) => (
                        <label key={val} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="radio" name="scope" value={val} checked={formData.scope===val} onChange={handleInputChange} className="text-indigo-600" />
                          {lbl}
                        </label>
                      ))}
                    </div>
                  </div>
;
c = c.replace("                  <div>\n                    <label className=\"block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2\">\n                      Discount Type", scopeUI + "                  <div>\n                    <label className=\"block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2\">\n                      Discount Type");

fs.writeFileSync(p, c, 'utf8');
const counts = {
  hasScope: c.includes("scope: 'products'"),
  hasScopeUI: c.includes('Offer Scope'),
  hasScopeBadge: c.includes('entire_store'),
  lines: c.split('\n').length
};
console.log(JSON.stringify(counts, null, 2));