(()=>{
const hide=()=>{
  const legacy=document.querySelector('.ai-studio');
  if(legacy){legacy.setAttribute('data-legacy-ai','true');legacy.style.display='none';}
  const result=document.getElementById('aiResult');
  if(result) result.style.display='none';
  const oldButtons=document.querySelectorAll('.ai-studio .ai-btn,[data-ai]');
  oldButtons.forEach(b=>{b.disabled=true;b.setAttribute('aria-hidden','true');});
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{hide();new MutationObserver(hide).observe(document.body,{childList:true,subtree:true});});else{hide();new MutationObserver(hide).observe(document.body,{childList:true,subtree:true});}
})();
