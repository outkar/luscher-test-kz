/* =================================================================
   Тарих (localStorage) — жергілікті файлда жұмыс істейді,
   чат алдын ала қарауында болмауы мүмкін (graceful fallback).
   ================================================================= */
const STORE_KEY='luscher_history_v1';
function storageOK(){
  try{ const t='__lt'; localStorage.setItem(t,'1'); localStorage.removeItem(t); return true; }
  catch(e){ return false; }
}
function loadHistory(){
  try{ return JSON.parse(localStorage.getItem(STORE_KEY)||'[]'); }catch(e){ return []; }
}
function saveEntry(entry){
  try{
    const h=loadHistory(); h.push(entry);
    while(h.length>50) h.shift();
    localStorage.setItem(STORE_KEY, JSON.stringify(h));
    return true;
  }catch(e){ return false; }
}
function clearHistory(){ try{ localStorage.removeItem(STORE_KEY); return true; }catch(e){ return false; } }
function fmtDate(ts){
  const d=new Date(ts), p=n=>String(n).padStart(2,'0');
  return p(d.getDate())+'.'+p(d.getMonth()+1)+'.'+d.getFullYear()+' '+p(d.getHours())+':'+p(d.getMinutes());
}
