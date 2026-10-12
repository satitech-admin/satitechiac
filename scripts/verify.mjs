import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

const required=["index.html","styles.css","theme.css","app.js","auth-config.js","auth.js","favicon.svg","robots.txt","sitemap.xml","supabase/schema-auth.sql"];
for(const file of required)assert(fs.existsSync(file),"Missing "+file);

for(const file of ["app.js","auth.js","auth-config.js"]){
  new vm.Script(fs.readFileSync(file,"utf8"),{filename:file});
  console.log("✓ JavaScript syntax:",file);
}

const html=fs.readFileSync("index.html","utf8");
for(const file of ["styles.css","theme.css","app.js","auth-config.js","auth.js","favicon.svg"])
  assert(html.includes(file),"HTML must reference "+file);
assert(html.indexOf("styles.css")<html.indexOf("theme.css"),"Dark theme must load after base styles");
assert(html.indexOf("app.js")<html.indexOf("auth.js"),"Account enhancement must load after app code");

const app=fs.readFileSync("app.js","utf8");
for(const route of ["/about","/faq","/courses","/internships","/partners","/dashboard","/enroll","/certificates"])
  assert(app.includes(route),"Missing core route "+route);
const auth=fs.readFileSync("auth.js","utf8");
for(const route of ["/signup","/login","/account"])assert(auth.includes(route),"Missing account route "+route);
assert(auth.includes("signInWithPassword")&&auth.includes("signUp"),"Auth integration code missing");

const theme=fs.readFileSync("theme.css","utf8");
assert(theme.includes("#121613")&&theme.includes("#e5b578"),"Charcoal/copper palette missing");
const config=fs.readFileSync("auth-config.js","utf8");
assert(config.includes('url: ""')&&config.includes('publishableKey: ""'),"New project must not be auto-bound");
assert(!/sb_secret_|service_role\s*[:=]\s*["'][A-Za-z0-9]/.test(config),"Privileged key exposed");

console.log("✓ Frontend structure, route map and theme order verified");
console.log("✓ No dedicated backend credentials configured (authentication intentionally disabled)");
console.log("Note: These are static checks, NOT browser E2E/payment/auth integration tests.");
