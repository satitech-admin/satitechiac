import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

const root={innerHTML:""};
const toast={textContent:"",classList:{add(){},remove(){}}};
const store=new Map();
const location={hash:"#/",origin:"https://example.test"};
const document={
  querySelector(sel){return sel==="#app"?root:sel==="#toast"?toast:null},
  addEventListener(){}
};
const window={
  addEventListener(){},
  scrollTo(){},
  IAC_AUTH_CONFIG:{url:"",publishableKey:""}
};
const context=vm.createContext({
  document,window,location,localStorage:{
    getItem(key){return store.get(key)||null},
    setItem(key,value){store.set(key,value)}
  },
  URLSearchParams,FormData,console,Date,setTimeout,clearTimeout
});
vm.runInContext(fs.readFileSync("app.js","utf8"),context,{filename:"app.js"});
vm.runInContext(fs.readFileSync("auth.js","utf8"),context,{filename:"auth.js"});
const routes=[
  ["#/","Build what's next"],
  ["#/courses","Explore our courses"],
  ["#/about","A different way to learn."],
  ["#/faq","Frequently asked questions"],
  ["#/internships","Internship opportunities"],
  ["#/partners","Collaborate with IAC"],
  ["#/course/web","Full Stack Web Development"],
  ["#/dashboard?role=Student","Student Workspace"],
  ["#/login","Welcome back"],
  ["#/signup","Create your learner account"]
];
for(const [route,expected] of routes){
  location.hash=route;
  vm.runInContext("render()",context);
  assert(root.innerHTML.includes(expected),route+" missing expected text: "+expected);
  assert(!root.innerHTML.includes("undefined</"),route+" contains undefined content");
  console.log("✓ Route render",route);
}
assert(root.innerHTML.includes("disabled"),"Unconfigured signup must stay disabled");
console.log("✓ Runtime smoke checks complete");
