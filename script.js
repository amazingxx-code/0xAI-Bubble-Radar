const REPO = "amazingxx-code/0xAI-Bubble-Radar";
const SUBSTACK_URL = "https://substack.com"; // Replace with your publication URL.
const API_URL = `https://api.github.com/repos/${REPO}/contents/daily`;
const STATUS_LABELS = {MINIMAL:"Minimal Bubble",LOW:"Low Bubble",NEUTRAL:"Neutral",ELEVATED:"Elevated Bubble",EXTREME:"Extreme Bubble"};
const STATUS_COLORS = {MINIMAL:"#07963b",LOW:"#0871df",NEUTRAL:"#858b94",ELEVATED:"#ff7a00",EXTREME:"#e60012"};
let readings=[];

function parseReading(file){
  const match=file.name.match(/^(\d{4}-\d{2}-\d{2})_([A-Za-z0-9.-]+)_([0-9.]+)_(MINIMAL|LOW|NEUTRAL|ELEVATED|EXTREME)\.(png|jpg|jpeg|webp)$/i);
  if(!match)return null;
  return{date:match[1],ticker:match[2].toUpperCase(),price:match[3],status:match[4].toUpperCase(),url:file.download_url,name:file.name};
}
function prettyDate(value){return new Intl.DateTimeFormat("en-US",{year:"numeric",month:"long",day:"numeric",timeZone:"UTC"}).format(new Date(`${value}T00:00:00Z`));}
function setLatest(r){
  document.querySelector("#latestImage").src=r.url;
  document.querySelector("#latestTitle").textContent=`${r.ticker} · ${STATUS_LABELS[r.status]}`;
  document.querySelector("#latestDate").textContent=prettyDate(r.date);
  document.querySelector("#latestTicker").textContent=r.ticker;
  document.querySelector("#latestPrice").textContent=`$${r.price}`;
  document.querySelector("#latestCondition").textContent=STATUS_LABELS[r.status];
  const pill=document.querySelector("#latestStatus");pill.textContent=STATUS_LABELS[r.status];pill.style.color=STATUS_COLORS[r.status];pill.style.background=`${STATUS_COLORS[r.status]}16`;
}
function populateFilters(){
  const tickers=[...new Set(readings.map(r=>r.ticker))].sort();
  const statuses=[...new Set(readings.map(r=>r.status))];
  document.querySelector("#tickerFilter").insertAdjacentHTML("beforeend",tickers.map(x=>`<option value="${x}">${x}</option>`).join(""));
  document.querySelector("#statusFilter").insertAdjacentHTML("beforeend",statuses.map(x=>`<option value="${x}">${STATUS_LABELS[x]}</option>`).join(""));
}
function renderGallery(){
  const ticker=document.querySelector("#tickerFilter").value,status=document.querySelector("#statusFilter").value;
  const shown=readings.filter(r=>(ticker==="ALL"||r.ticker===ticker)&&(status==="ALL"||r.status===status));
  document.querySelector("#gallery").innerHTML=shown.map(r=>`<article class="card"><a href="${r.url}" target="_blank" rel="noopener"><img src="${r.url}" loading="lazy" alt="${r.ticker} ${STATUS_LABELS[r.status]} on ${r.date}"></a><div class="card-meta"><strong>${r.ticker}</strong><span>${prettyDate(r.date)} · ${STATUS_LABELS[r.status]}</span></div></article>`).join("");
  document.querySelector("#emptyState").hidden=shown.length>0;
}
async function init(){
  document.querySelectorAll("#subscribeTop,#subscribeBottom").forEach(a=>a.href=SUBSTACK_URL);
  try{
    const response=await fetch(API_URL,{headers:{Accept:"application/vnd.github+json"}});if(!response.ok)throw new Error("Archive unavailable");
    const files=await response.json();readings=files.map(parseReading).filter(Boolean).sort((a,b)=>b.date.localeCompare(a.date));
    if(!readings.length)throw new Error("No valid readings found");
    setLatest(readings[0]);populateFilters();renderGallery();
  }catch(error){
    document.querySelector("#latestTitle").textContent="The first reading is coming soon.";
    document.querySelector("#latestStatus").textContent="Archive pending";
    document.querySelector("#latestImage").closest(".image-frame").innerHTML='<div class="empty">Unable to load the public archive right now.</div>';
  }
}
document.querySelector("#tickerFilter").addEventListener("change",renderGallery);
document.querySelector("#statusFilter").addEventListener("change",renderGallery);
init();
