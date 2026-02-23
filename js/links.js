import { initTheme, apiGet, qs, qsa, setTheme, toast } from "./utils.js";
initTheme();

function renderLinks(payload){
  const { config, profile, links } = payload;

  // brand assets
  qs("#cover").style.backgroundImage = profile.cover_url ? `url('${profile.cover_url}')` : "none";
  qs("#avatar").src = profile.avatar_url || "./assets/logo.svg";
  qs("#name").textContent = profile.display_name || "روابطنا";
  qs("#bio").textContent = profile.description || "";

  const list = qs("#links");
  list.innerHTML = "";

  if(!links || !links.length){
    const empty = document.createElement("div");
    empty.className = "small";
    empty.textContent = "لا توجد روابط حالياً.";
    list.appendChild(empty);
    return;
  }

  for(const item of links){
    if(item.enabled !== "TRUE") continue;

    const a = document.createElement("a");
    a.className = "linkbtn";
    a.href = item.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.dataset.id = item.id;

    const left = document.createElement("div");
    left.className = "left";

    const icon = document.createElement("img");
    icon.className = "icon";
    icon.alt = "";
    icon.loading = "lazy";
    icon.decoding = "async";
    icon.src = item.icon_url || "./assets/logo.svg";

    const txt = document.createElement("div");
    txt.className = "txt";
    const t = document.createElement("div");
    t.className = "t";
    t.textContent = item.title;
    const s = document.createElement("div");
    s.className = "s";
    s.textContent = item.subtitle || "";

    txt.appendChild(t); txt.appendChild(s);
    left.appendChild(icon); left.appendChild(txt);

    const che = document.createElement("div");
    che.className = "chev";
    che.innerHTML = "›";

    a.appendChild(left);
    a.appendChild(che);

    a.addEventListener("click", ()=>{
      // log click (non-blocking)
      apiGet("track", { type:"link", id:item.id }).catch(()=>{});
    });

    list.appendChild(a);
  }
}

function wireThemeToggle(){
  const btn = qs("#themeBtn");
  btn.addEventListener("click", ()=>{
    const cur = document.documentElement.getAttribute("data-theme") || "dark";
    const next = cur === "dark" ? "light" : "dark";
    setTheme(next);
  });
}

(async function main(){
  try{
    const res = await apiGet("publicLinks");
    if(res.config.system_status !== "on"){
      window.location.replace("./maintenance.html");
      return;
    }
    renderLinks(res);
    wireThemeToggle();

    // track page view
    apiGet("track", { type:"page", id:"links" }).catch(()=>{});
  }catch(e){
    toast("تعذر تحميل الروابط. سيتم فتح صفحة الصيانة.");
    window.location.replace("./maintenance.html?reason=api");
  }
})();
