(() => {
  const init = () => {
    document.documentElement.classList.add('medlife-enhanced');
    if (!document.getElementById('medlife-polish-style')) {
      const s = document.createElement('style'); s.id='medlife-polish-style';
      s.textContent = `
        html{scroll-padding-top:88px}
        body{overflow-x:hidden}
        img,video,iframe{max-width:100%;height:auto}
        button,a{touch-action:manipulation}
        :focus-visible{outline:3px solid rgba(255,42,84,.35);outline-offset:3px}
        .medlife-enhanced main section,.medlife-enhanced body>section{animation:medlifeFade .55s ease both}
        .medlife-enhanced .card,.medlife-enhanced article,.medlife-enhanced .feature,.medlife-enhanced .number,.medlife-enhanced .stat{transition:transform .28s ease,box-shadow .28s ease,border-color .28s ease}
        .medlife-enhanced .card:hover,.medlife-enhanced .feature:hover{transform:translateY(-5px)}
        @keyframes medlifeFade{from{opacity:.94;transform:translateY(7px)}to{opacity:1;transform:none}}
        @media(max-width:900px){.wrap{max-width:100%}.grid{gap:14px}}
        @media(max-width:640px){body{font-size:14px}.wrap{width:min(100% - 24px,560px)}.section{padding:58px 0}.hero{padding:58px 0 70px}.hero h1{font-size:clamp(32px,11vw,48px)}.hero p{font-size:14px}.hero-actions,.actions{width:100%}.hero-actions a,.actions .btn{min-height:46px}.card{border-radius:18px}.numbers,.statsbox{grid-template-columns:1fr!important}.grid{grid-template-columns:1fr!important}.table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch}}
        @media(prefers-reduced-motion:reduce){.medlife-enhanced main section,.medlife-enhanced body>section{animation:none}.medlife-enhanced .card,.medlife-enhanced .feature{transition:none}}
      `;
      document.head.appendChild(s);
    }
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
