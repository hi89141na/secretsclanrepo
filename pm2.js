
const fs=require("fs"); const p="frontend/src/pages/admin/ManageOffersPage.jsx"; let c=fs.readFileSync(p,"utf8").replace(/\r\n/g,"\n");
const sq=String.fromCharCode(39);
c=c.replace("    applicableCategories: [],\n  });","    applicableCategories: [],\n    scope: "+sq+"products"+sq+",\n  });");
fs.writeFileSync(p,c,"utf8"); console.log("useState patched:", c.includes("scope: "+sq+"products"+sq+",\n  }));"));
