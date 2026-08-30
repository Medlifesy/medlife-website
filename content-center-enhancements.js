(()=>{
  const API='/api/content-center-v3';
  const $=s=>document.querySelector(s);
  let me=null;
  async function getMe(){try{const r=await fetch(API+'?action=me',{credentials:'include',cache:'no-store'});const d=await r.json();return d.identity||null}catch{return null}}
  async function skip(id,button){
    if(!confirm('هل أنت متأكد أن هذا المنشور لا يحتاج إلى تصميم؟'))return;
    button.disabled=true;button.textContent='جارٍ الحفظ...';
    try{
      const r=await fetch('/api/content-center-skip-design',{method:'POST',credentials:'include',headers:{'content-type':'application/json'},body:JSON.stringify({page_id:id})});
      const d=await r.json().catch(()=>({}));
      if(!r.ok)throw Error(d.error||'تعذر حفظ القرار.');
      button.textContent='✓ لا يحتاج تصميم';button.classList.add('saved');
      const row=button.closest('tr');if(row){row.style.opacity='.55';setTimeout(()=>row.remove(),350)}
      const success=$('#success');if(success){success.textContent='تم اعتماد المنشور: لا يحتاج تصميم.';success.className='success';success.style.display='block'}
    }catch(e){button.disabled=false;button.textContent='لا يحتاج تصميم';const err=$('#error');if(err){err.textContent=e.message;err.className='error';err.style.display='block'}}
  }
  function decorate(){
    if(!me||me.type!=='design'||!String(me.role||'').includes('مشرف'))return;
    const rows=$('#rows');if(!rows)return;
    rows.querySelectorAll('tr').forEach(row=>{
      if(row.dataset.noDesignReady==='1')return;
      const cells=row.querySelectorAll('td');if(!cells.length)return;
      const action=cells[cells.length-1],open=action.querySelector('button');if(!open)return;
      const match=(open.getAttribute('onclick')||'').match(/openWork\(['\"]([^'\"]+)['\"]\)/);const id=match&&match[1];if(!id)return;
      const b=document.createElement('button');b.type='button';b.className='btn light no-design-btn';b.textContent='لا يحتاج تصميم';b.style.marginInlineStart='6px';b.style.borderColor='#e88916';b.style.color='#9b6500';b.addEventListener('click',()=>skip(id,b));action.appendChild(b);row.dataset.noDesignReady='1';
    });
  }
  async function init(){me=await getMe();if(!me||me.type!=='design'||!String(me.role||'').includes('مشرف'))return;const style=document.createElement('style');style.textContent='.no-design-btn.saved{background:#edf8f3!important;color:#176f52!important;border-color:#bfe9d8!important}.no-design-btn{white-space:nowrap}';document.head.appendChild(style);const rows=$('#rows');if(rows)new MutationObserver(decorate).observe(rows,{childList:true,subtree:true});decorate()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
