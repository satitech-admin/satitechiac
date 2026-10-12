/* Sati Tech IAC account experience.
   Production authentication activates only when a dedicated project's public
   Supabase URL and publishable key are configured in auth-config.js.
   No privileged keys, credentials, or passwords are stored by this script. */
(function(){
  const cfg=window.IAC_AUTH_CONFIG||{};
  const connected=Boolean(cfg.url&&cfg.publishableKey&&/^https:\/\//.test(cfg.url));
  let clientPromise;
  const client=async()=>{
    if(!connected)throw new Error("Dedicated IAC authentication has not been configured.");
    if(!clientPromise)clientPromise=import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.95.0/+esm")
      .then(mod=>mod.createClient(cfg.url,cfg.publishableKey,{auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:true}}));
    return clientPromise;
  };
  const escapeHTML=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const alertMsg=msg=>{const el=document.querySelector("#toast");if(el){el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),4200)}};
  function field(label,html){return '<div class="field"><label>'+label+'</label>'+html+'</div>'}
  function authScreen(mode){
    const signup=mode==="signup";
    return nav()+`<div class="auth-card">
    <aside class="auth-art"><div><span class="pill">YOUR LEARNING JOURNEY STARTS HERE</span><h2>Make something<br>remarkable.</h2><p>One platform. Meaningful skills. Real projects. A better way to build your technology future.</p></div><div class="section-label">SATI TECH IAC · LEARN / BUILD / GROW</div></aside>
    <section class="auth-body" style="padding-top:35px">
      <div class="auth-tabs"><a class="${signup?"":"active"}" href="#/login">Sign in</a><a class="${signup?"active":""}" href="#/signup">Create account</a></div>
      <h2 class="section-title" style="font-size:27px">${signup?"Create your learner account":"Welcome back"}</h2>
      <p class="sub">${signup?"Start with your own student account; staff and company access is granted by verified administrators.":"Your personal learning dashboard awaits."}</p>
      ${!connected?'<div class="account-notice"><b>Account setup in progress.</b> Secure registration and sign-in are disabled until the dedicated Sati Tech IAC database is connected. This preview will not collect or store passwords.</div>':''}
      <form id="iac-auth" data-mode="${signup?"signup":"login"}">
      ${signup?field("Full name",'<input name="full_name" autocomplete="name" required minlength="2" maxlength="90" placeholder="Your full name">'):""}
      ${field("Email address",'<input name="email" type="email" autocomplete="email" required placeholder="you@example.com">')}
      ${field("Password",'<input id="iac-password" name="password" type="password" autocomplete="${signup?"new-password":"current-password"}" required minlength="8" placeholder="Minimum 8 characters"><button type="button" class="eye-toggle" id="iac-password-toggle" aria-controls="iac-password">Show password</button>')}
      ${signup?field("Learning interest",'<select name="interest"><option value="learning">12-month learning program</option><option value="mentorship">3-month optional project mentorship</option><option value="internship">Free internship opportunities</option></select>'):""}
      ${signup?'<p class="mini muted">Your account begins with standard student permissions. Trainer, partner and admin roles require independent authorization.</p>':""}
      <button class="btn primary" type="submit" ${connected?"":"disabled"}>${signup?"Create learner account →":"Secure sign in →"}</button>
      </form>
      <p class="mini muted" style="margin-top:19px">No host-company internship fees. No guaranteed placement or third-party certificates.</p>
      ${connected?"":'<a href="#/dashboard" class="btn outline" style="margin-top:10px">Explore demo dashboards →</a>'}
    </section></div>`+footer();
  }
  function accountScreen(){return nav()+`<div class="pagehead"><div class="container"><div class="section-label">ACCOUNT</div><h1>My account</h1><p class="sub">Verified sign-in and assigned permissions.</p></div></div><section class="container"><div class="form-box"><div id="iac-account-result" class="notice">Checking session...</div><a class="btn outline" href="#/dashboard">Preview learning workspaces →</a> <button class="btn primary" id="iac-signout" type="button" hidden>Sign out</button></div></section>`+footer()}
  async function displayAccount(){
    const result=document.querySelector("#iac-account-result");
    if(!result)return;
    if(!connected){result.textContent="No dedicated IAC backend is configured yet. Account and authorization services are not active.";return;}
    try{
      const sb=await client();
      const response=await sb.auth.getUser();
      if(response.error||!response.data.user){result.innerHTML='You are not signed in. <a href="#/login">Sign in</a> to your account.';return;}
      const user=response.data.user;
      const roles=await sb.from("role_assignments").select("role").eq("user_id",user.id);
      const allowed=(roles.data||[]).map(x=>x.role);
      result.innerHTML='<b>Signed in:</b> '+escapeHTML(user.email)+'<div class="mini muted" style="margin-top:9px">Verified account role(s): '+escapeHTML(allowed.join(", ")||"Awaiting assignment")+'</div>';
      const b=document.querySelector("#iac-signout");b.hidden=false;
      b.addEventListener("click",async()=>{await sb.auth.signOut();location.hash="#/login";alertMsg("Signed out.")});
    }catch(err){result.textContent="Account service unavailable: "+(err.message||"Please try again later.")}
  }
  const previousRender=render;
  render=function(){
    const pathname=location.hash.slice(1).split("?")[0]||"/";
    if(pathname==="/login"||pathname==="/signup"){root.innerHTML=authScreen(pathname.slice(1));return}
    if(pathname==="/account"){root.innerHTML=accountScreen();displayAccount();return}
    previousRender();
  };
  document.addEventListener("click",event=>{
    const toggle=event.target.closest("#iac-password-toggle");
    if(!toggle)return;
    const input=document.querySelector("#iac-password");if(!input)return;
    input.type=input.type==="password"?"text":"password";
    toggle.textContent=input.type==="password"?"Show password":"Hide password";
  });
  document.addEventListener("submit",async event=>{
    const form=event.target.closest("#iac-auth");if(!form)return;
    event.preventDefault();
    if(!connected){alertMsg("Secure accounts have not been connected.");return;}
    if(!form.reportValidity())return;
    const input=new FormData(form);
    const email=String(input.get("email")||"").trim();
    const password=String(input.get("password")||"");
    const signup=form.dataset.mode==="signup";
    const button=form.querySelector('button[type="submit"]');
    button.disabled=true;button.textContent=signup?"Creating account...":"Signing in...";
    try{
      const sb=await client();
      if(signup){
        const fullname=String(input.get("full_name")||"").trim();
        const interest=String(input.get("interest")||"learning");
        const {data,error}=await sb.auth.signUp({email,password,options:{
          emailRedirectTo:location.origin+"/#/account",
          data:{full_name:fullname,program_interest:interest}
        }});
        if(error)throw error;
        if(data.session){await sb.from("profiles").upsert({id:data.user.id,full_name:fullname,program_interest:interest},{onConflict:"id"});}
        alertMsg("Registration submitted. Please check your email for verification if required.");
        location.hash="#/account";
      }else{
        const {error}=await sb.auth.signInWithPassword({email,password});
        if(error)throw error;
        location.hash="#/account";
        alertMsg("Signed in securely.");
      }
    }catch(error){alertMsg(error.message||"Unable to authenticate.");button.disabled=false;button.textContent=signup?"Create learner account →":"Secure sign in →"}
    finally{const pwd=form.querySelector('input[name="password"]');if(pwd)pwd.value="";}
  });
  render();
})();