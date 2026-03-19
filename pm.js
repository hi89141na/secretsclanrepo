
const fs=require("fs");
const p="frontend/src/pages/admin/ManageOffersPage.jsx";
let c=fs.readFileSync(p,"utf8").replace(/\r\n/g,"\n");
const sq=String.fromCharCode(39);
// 1. scope in handleAdd
c=c.replace("      applicableCategories: [],\n    });\n    setShowModal(true);\n  };","      applicableCategories: [],\n      scope: "+sq+"products"+sq+",\n    });\n    setShowModal(true);\n  };");
// 2. scope in handleEdit
c=c.replace("applicableCategories: offer.applicableCategories?.map(c => c._id || c) || [],\n    });\n    setShowModal","applicableCategories: offer.applicableCategories?.map(c => c._id || c) || [],\n      scope: offer.scope || "+sq+"products"+sq+",\n    });\n    setShowModal");
// 3. handleInputChange with scope logic
c=c.replace("    const { name, value } = e.target;\n    setFormData((prev) => ({ ...prev, [name]: value }));","    const { name, value } = e.target;\n    setFormData((prev) => ({ ...prev, [name]: value, ...(name==="+sq+"scope"+sq+" && value==="+sq+"entire_store"+sq+" ? { applicableProducts: [], applicableCategories: [] } : {}) }));");
// 4. scope column header
c=c.replace("                  Date Range\n                </th>\n                <th","                  Date Range\n                </th>\n                <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase\">Scope</th>\n                <th");
// 5. scope badge in row
const badge="\n                    <td className=\"px-6 py-4\">\n                      <span className={offer.scope==="+sq+"entire_store"+sq+"?"+sq+"px-2 text-xs rounded-full bg-purple-100 text-purple-800"+sq+":offer.scope==="+sq+"categories"+sq+"?"+sq+"px-2 text-xs rounded-full bg-blue-100 text-blue-800"+sq+":"+sq+"px-2 text-xs rounded-full bg-green-100 text-green-800"+sq+"}>\n                        {offer.scope==="+sq+"entire_store"+sq+"?"+sq+"Entire Store"+sq+":offer.scope==="+sq+"categories"+sq+"?"+sq+"Categories"+sq+":"+sq+"Products"+sq+"}\n                      </span>\n                    </td>";
c=c.replace("{formatDateRange(offer.startDate, offer.endDate)}\n                    </td>\n                    <td className=\"px-6 py-4 whitespace-nowrap\">\n                      <span\n                        className={","{formatDateRange(offer.startDate, offer.endDate)}\n                    </td>"+badge+"\n                    <td className=\"px-6 py-4 whitespace-nowrap\">\n                      <span\n                        className={");
// 6. scope radio buttons before Discount Type
const scopeUI="                  <div className=\"md:col-span-2\">\n                    <label className=\"block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2\">Offer Scope</label>\n                    <div className=\"flex flex-wrap gap-4 p-3 border rounded bg-gray-50\">\n                      {[["+sq+"entire_store"+sq+","+sq+"Entire Store"+sq+"],["+sq+"categories"+sq+","+sq+"Categories"+sq+"],["+sq+"products"+sq+","+sq+"Products"+sq+"]].map(([val,lbl]) => (\n                        <label key={val} className=\"flex items-center gap-2 text-sm cursor-pointer\">\n                          <input type=\"radio\" name=\"scope\" value={val} checked={formData.scope===val} onChange={handleInputChange} className=\"text-indigo-600\" />\n                          {lbl}\n                        </label>\n                      ))}\n                    </div>\n                  </div>\n";
c=c.replace("                  <div>\n                    <label className=\"block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2\">\n                      Discount Type",scopeUI+"                  <div>\n                    <label className=\"block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2\">\n                      Discount Type");
// 7. conditional products section
c=c.replace("                  <div className=\"md:col-span-2\">\n                    <label className=\"block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2\">\n                      Applicable Products","                  {formData.scope==="+sq+"products"+sq+" && <div className=\"md:col-span-2\">\n                    <label className=\"block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2\">\n                      Applicable Products");
// 8. close products conditional, open categories conditional
c=c.replace("                    </div>\n                  </div>\n\n                  <div className=\"md:col-span-2\">\n                    <label className=\"block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2\">\n                      Applicable Categories","                    </div>\n                  </div>}\n\n                  {formData.scope==="+sq+"categories"+sq+" && <div className=\"md:col-span-2\">\n                    <label className=\"block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2\">\n                      Applicable Categories");
// close categories conditional
c=c.replace("                    </div>\n                  </div>\n                </div>\n\n                <div className=\"flex items-center justify-end","                    </div>\n                  </div>}\n                </div>\n\n                <div className=\"flex items-center justify-end");
// Save
fs.writeFileSync(p,c,"utf8");
console.log("scope:formData="+c.includes("scope: "+sq+"products"+sq)); console.log("scopeUI="+c.includes("Offer Scope")); console.log("scopeBadge="+c.includes("entire_store")); console.log("lines="+c.split("\n").length);
