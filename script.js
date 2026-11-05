(function(){
'use strict';
var $=function(s,c){return (c||document).querySelector(s)},$$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
var store={get:function(k){try{return localStorage.getItem(k)}catch(e){return null}},set:function(k,v){try{localStorage.setItem(k,v)}catch(e){}}};

/* ---------- i18n: RU берётся из HTML, UZ из i18n-uz.js (window.UZ) ---------- */
var RU={},els=$$('[data-i18n]');
els.forEach(function(el){RU[el.dataset.i18n]=el.textContent});
var lang='ru',uzLoading=false;
function apply(l){
  lang=l;document.documentElement.lang=l;document.documentElement.dataset.lang=l;
  var dict=l==='uz'?(window.UZ||{}):RU;
  els.forEach(function(el){var k=el.dataset.i18n;var v=dict[k]!==undefined?dict[k]:RU[k];if(v!==undefined)el.textContent=v});
  $$('[data-set-lang]').forEach(function(b){b.classList.toggle('is-active',b.dataset.setLang===l)});
  document.title=l==='uz'?'OPER GROUP SECURITY — Toshkentda obyektlar va tadbirlarni qo‘riqlash':'OPER GROUP SECURITY — охрана объектов и мероприятий в Ташкенте';
  store.set('lang',l);
}
function setLang(l){
  if(l==='uz'&&!window.UZ){
    if(uzLoading)return;uzLoading=true;
    var s=document.createElement('script');s.src='i18n-uz.js';
    s.onload=function(){uzLoading=false;apply('uz')};
    s.onerror=function(){uzLoading=false;apply('ru')};
    document.head.appendChild(s);return;
  }
  apply(l);
}
$$('[data-set-lang]').forEach(function(b){b.addEventListener('click',function(){setLang(b.dataset.setLang)})});
var saved=store.get('lang');if(saved==='uz')setLang('uz');

/* ---------- Прелоадер ---------- */
var pre=$('#preloader'),bar=$('#plBar'),pct=$('#plPct'),fact=$('#plFact');
var facts={ru:['Безопасность вашего бизнеса — наша задача','Работаем с 2010 года','Охрана 24/7','+998 98 311 90 70'],uz:['Biznesingiz xavfsizligi — bizning vazifamiz','2010-yildan beri ishlaymiz','Qo‘riqlash 24/7','+998 98 311 90 70']};
var t0=performance.now(),dur=reduce?300:2300,fi=0,done=false;
function tick(now){
  var p=Math.min(1,(now-t0)/dur),e=1-Math.pow(1-p,3),v=Math.round(e*100);
  bar.style.width=v+'%';pct.textContent=v+'%';
  var idx=Math.min(3,Math.floor(p*4));if(idx!==fi){fi=idx;fact.textContent=facts[lang][fi]}
  if(p<1)requestAnimationFrame(tick);else finish();
}
function finish(){
  if(done)return;done=true;pre.classList.add('done');document.body.classList.remove('is-loading');
  setTimeout(function(){pre.style.display='none'},1000);initReveal();
}
requestAnimationFrame(tick);
setTimeout(finish,6000); // страховка

/* ---------- Появление при скролле + счётчики ---------- */
function count(el){
  var to=+el.dataset.count,from=+(el.dataset.from||0),t=performance.now(),d=1600;
  if(reduce){el.textContent=to;return}
  (function s(n){var p=Math.min(1,(n-t)/d),e=1-Math.pow(1-p,3);el.textContent=Math.round(from+(to-from)*e);if(p<1)requestAnimationFrame(s)})(t);
}
function initReveal(){
  var items=$$('.reveal');
  if(!('IntersectionObserver' in window)){items.forEach(function(i){i.classList.add('in')});return}
  var io=new IntersectionObserver(function(en){en.forEach(function(x){
    if(!x.isIntersecting)return;x.target.classList.add('in');io.unobserve(x.target);
    $$('[data-count]',x.target).forEach(count);
  })},{threshold:.12,rootMargin:'0px 0px -40px 0px'});
  items.forEach(function(i){io.observe(i)});
}

/* ---------- Шапка, прогресс, FAB, параллакс ---------- */
var header=$('#header'),prog=$('#progress'),up=$('#toTop'),heroBg=$('#heroBg'),par=$$('[data-parallax]'),ticking=false;
function onScroll(){
  var y=window.scrollY,h=document.documentElement.scrollHeight-innerHeight;
  header.classList.toggle('scrolled',y>40);
  prog.style.width=(h>0?y/h*100:0)+'%';
  up.classList.toggle('show',y>700);
  if(!reduce){
    if(heroBg&&y<innerHeight)heroBg.style.marginTop=(y*.2)+'px';
    par.forEach(function(el){var r=el.parentElement.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight)el.style.transform='translateY('+(-r.top*+el.dataset.parallax)+'px)'});
  }
  ticking=false;
}
addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(onScroll)}},{passive:true});onScroll();
up.addEventListener('click',function(){scrollTo({top:0,behavior:reduce?'auto':'smooth'})});

/* ---------- Меню ---------- */
var nav=$('#nav'),burger=$('#burger');
burger.addEventListener('click',function(){var o=nav.classList.toggle('open');burger.setAttribute('aria-expanded',o)});
$$('a',nav).forEach(function(a){a.addEventListener('click',function(){nav.classList.remove('open');burger.setAttribute('aria-expanded','false')})});
var links=$$('a',nav);
if('IntersectionObserver' in window){
  var so=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting)links.forEach(function(a){a.classList.toggle('active',a.getAttribute('href')==='#'+x.target.id)})})},{rootMargin:'-45% 0px -50% 0px'});
  links.forEach(function(a){var s=$(a.getAttribute('href'));if(s)so.observe(s)});
}

/* ---------- Время в Ташкенте ---------- */
var tt=$('#tashTime');
function clock(){try{tt.textContent=new Date().toLocaleTimeString('ru-RU',{timeZone:'Asia/Tashkent',hour:'2-digit',minute:'2-digit'})}catch(e){}}
clock();setInterval(clock,20000);

/* ---------- Бегущая строка: дублируем содержимое для бесшовности ---------- */
var mq=$('#marqueeTrack');if(mq)mq.innerHTML+=mq.innerHTML;

/* ---------- 3D-наклон карточек ---------- */
if(!reduce&&matchMedia('(hover:hover)').matches){
  $$('[data-tilt],[data-tilt-soft]').forEach(function(el){
    var k=el.hasAttribute('data-tilt')?10:5;
    el.addEventListener('mousemove',function(e){var r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.transform='perspective(800px) rotateX('+(-y*k)+'deg) rotateY('+(x*k)+'deg) translateZ(0)'});
    el.addEventListener('mouseleave',function(){el.style.transform=''});
  });
}

/* ---------- Частицы в hero ---------- */
var cv=$('#particles');
if(cv&&!reduce){
  var cx=cv.getContext('2d'),W,H,P=[],N=innerWidth<700?24:55,vis=true;
  function size(){W=cv.width=cv.offsetWidth;H=cv.height=cv.offsetHeight}
  size();addEventListener('resize',size);
  for(var i=0;i<N;i++)P.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.8+.4,v:Math.random()*.35+.1,a:Math.random()*.5+.2});
  new IntersectionObserver(function(e){vis=e[0].isIntersecting}).observe(cv);
  (function draw(){
    if(vis){cx.clearRect(0,0,W,H);P.forEach(function(p){p.y-=p.v;if(p.y<-4){p.y=H+4;p.x=Math.random()*W}cx.beginPath();cx.arc(p.x,p.y,p.r,0,6.283);cx.fillStyle='rgba(212,165,55,'+p.a+')';cx.fill()})}
    requestAnimationFrame(draw);
  })();
}

/* ---------- Видео-шоурил ---------- */
var reel=$('#reel'),rp=$('#reelPlay');
if(reel&&rp){
  var fr=reel.parentElement;
  rp.addEventListener('click',function(){reel.muted=false;reel.play();fr.classList.add('playing');reel.controls=true});
  reel.addEventListener('pause',function(){if(!reel.ended&&reel.controls)return});
}

/* ---------- Лайтбокс ---------- */
var lb=$('#lb'),lbImg=$('#lbImg');
function closeLb(){lb.hidden=true;lbImg.src='';document.body.style.overflow=''}
$$('.gal-i').forEach(function(b){b.addEventListener('click',function(){lbImg.src=b.dataset.src;lb.hidden=false;document.body.style.overflow='hidden'})});
$('#lbX').addEventListener('click',closeLb);
lb.addEventListener('click',function(e){if(e.target===lb)closeLb()});
addEventListener('keydown',function(e){if(e.key==='Escape'){closeLb();nav.classList.remove('open')}});

/* ---------- FAQ: открыт один пункт ---------- */
var det=$$('.acc details');
det.forEach(function(d){d.addEventListener('toggle',function(){if(d.open)det.forEach(function(o){if(o!==d)o.open=false})})});


/* ---------- Калькулятор (ПРИМЕРНЫЕ цены — замените на свои) ---------- */
var PRICING={rates:{'24':9000000,'night':5500000,'day':5000000},low:.9,high:1.15}; // сум за 1 пост в месяц
var cm=$('#calcMode'),cp=$('#calcPosts');
if(cm&&cp){
  var mode='24',fmt=function(n){return Math.round(n/10000)*10000}, nf=function(n){return fmt(n).toLocaleString('ru-RU').replace(/\u00a0/g,' ')};
  var calc=function(){
    var n=+cp.value,base=PRICING.rates[mode]*n;
    $('#calcPostsV').textContent=n;
    $('#calcSum').textContent=nf(base);
    $('#calcRange').textContent=nf(base*PRICING.low)+' – '+nf(base*PRICING.high);
    $('#calcDay').textContent='≈ '+nf(base/30);
    cp.style.setProperty('--p',((n-1)/9*100)+'%');
  };
  cm.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;mode=b.dataset.mode;$$('button',cm).forEach(function(x){x.classList.toggle('is-on',x===b)});calc()});
  cp.addEventListener('input',calc);calc();
}

/* ---------- Видео-вставки: играют только в зоне видимости ---------- */
if('IntersectionObserver' in window){
  var vo=new IntersectionObserver(function(en){en.forEach(function(x){var v=x.target;if(x.isIntersecting&&!reduce){var p=v.play();if(p&&p.catch)p.catch(function(){})}else v.pause()})},{threshold:.35});
  $$('video[data-auto]').forEach(function(v){vo.observe(v)});
}

/* ---------- Услуги: клик по карточке → фото с информацией ---------- */
var svm=$('#svm');
if(svm){
  var svT=$('#svmT'),svP=$('#svmP'),svL=$('#svmL'),svI=$('#svmImg'),svN=$('#svmN'),svX=$('#svmX'),svLast=null,svTm=null;
  function svOpen(card){
    var d=$('.sv-detail',card);if(!d)return;
    clearTimeout(svTm);svLast=card;
    svT.textContent=$('h3',card).textContent;
    svN.textContent=$('.card-n',card).textContent;
    svP.textContent=$('.svd-p',d).textContent;
    svL.innerHTML='';
    $$('li',d).forEach(function(li){var x=document.createElement('li');x.innerHTML='<svg class="ic"><use href="#i-check"/></svg><span></span>';x.lastChild.textContent=li.textContent;svL.appendChild(x)});
    svI.src=$('img',d).dataset.src;svI.alt=svT.textContent;
    svm.hidden=false;void svm.offsetWidth;svm.classList.add('open');
    document.body.style.overflow='hidden';svX.focus({preventScroll:true});
  }
  function svClose(){
    if(svm.hidden)return;
    svm.classList.remove('open');document.body.style.overflow='';
    svTm=setTimeout(function(){svm.hidden=true;svI.removeAttribute('src')},reduce?0:380);
    if(svLast)svLast.focus({preventScroll:true});
  }
  $$('.card[data-sv]').forEach(function(c){
    c.addEventListener('click',function(){svOpen(c)});
    c.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();svOpen(c)}});
  });
  svX.addEventListener('click',svClose);$('#svmBg').addEventListener('click',svClose);
  addEventListener('keydown',function(e){
    if(svm.hidden)return;
    if(e.key==='Escape')svClose();
    if(e.key==='Tab'){ // фокус остаётся внутри окна
      var f=$$('button,a[href]',svm).filter(function(x){return x.offsetParent!==null});
      if(!f.length)return;var a=f[0],z=f[f.length-1];
      if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}
      else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}
    }
  });
}

/* ---------- Благодарственные письма: файлы лежат в assets/docs/letter-N.jpg ---------- */
var docs=$$('.doc');
if(docs.length){
  var dSeen=0,dOk=0;
  docs.forEach(function(b){
    var p=new Image();
    function done(ok){
      dSeen++;
      if(ok){dOk++;$('img',b).src=b.dataset.src}else b.classList.add('is-empty');
      // если хотя бы одно письмо найдено — пустые ячейки скрываем
      if(dSeen===docs.length&&dOk>0)docs.forEach(function(x){if(x.classList.contains('is-empty'))x.hidden=true});
    }
    p.onload=function(){done(true)};p.onerror=function(){done(false)};p.src=b.dataset.src;
    b.addEventListener('click',function(){
      if(b.classList.contains('is-empty'))return;
      lbImg.src=b.dataset.src;lb.hidden=false;document.body.style.overflow='hidden';
    });
  });
}

/* ---------- Фоновая музыка: тихо, стартует после первого тапа/клика ---------- */
var bgm=$('#bgm'),bgmBtn=$('#bgmBtn');
if(bgm&&bgmBtn){
  var VOL=.12,fadeT=null,intent=store.get('bgm')!=='off',ducked=false,starting=false;
  // iOS игнорирует audio.volume — там громкость задаём через Web Audio
  var isIOS=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  var actx=null,gain=null;
  function setupGain(){
    if(actx||!isIOS)return;
    var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
    try{actx=new AC();var src=actx.createMediaElementSource(bgm);gain=actx.createGain();gain.gain.value=0;src.connect(gain);gain.connect(actx.destination)}catch(e){actx=null;gain=null}
  }
  function setVol(v){v=Math.max(0,Math.min(1,v));if(gain)gain.gain.value=v;else bgm.volume=v}
  function getVol(){return gain?gain.gain.value:bgm.volume}
  function fade(to,ms,cb){
    clearInterval(fadeT);var from=getVol(),t=performance.now();
    fadeT=setInterval(function(){var p=Math.min(1,(performance.now()-t)/ms);setVol(from+(to-from)*p);if(p>=1){clearInterval(fadeT);if(cb)cb()}},50);
  }
  function ui(on){bgmBtn.classList.toggle('on',on);bgmBtn.classList.toggle('off',!on);bgmBtn.setAttribute('aria-pressed',on)}
  function play(){
    if(starting)return;starting=true;
    setupGain();if(actx&&actx.state==='suspended')actx.resume();
    setVol(0);var pr=bgm.play();
    if(pr&&pr.then)pr.then(function(){starting=false;ui(true);fade(VOL,2500)}).catch(function(){starting=false;ui(false)});
    else{starting=false;ui(true);fade(VOL,2500)}
  }
  function stop(){ui(false);fade(0,400,function(){bgm.pause()})}
  bgm.addEventListener('error',function(){bgmBtn.hidden=true});
  // автозвук запрещён: стартуем на первый тап/клик/клавишу (на телефоне pointerdown/touchstart не считаются)
  ['click','touchend','keydown'].forEach(function(ev){
    addEventListener(ev,function(e){
      if(!intent||!bgm.paused||bgm.error)return;
      if(e.target&&e.target.closest&&e.target.closest('.bgm'))return;
      play();
    },{passive:true});
  });
  bgmBtn.addEventListener('click',function(){
    if(bgm.paused){intent=true;store.set('bgm','on');play()}else{intent=false;store.set('bgm','off');stop()}
  });
  document.addEventListener('visibilitychange',function(){
    if(document.hidden){if(!bgm.paused){ducked=true;bgm.pause()}}
    else if(ducked&&intent){ducked=false;play()}
  });
  if(reel){
    reel.addEventListener('play',function(){if(!reel.muted&&!bgm.paused){ducked=true;ui(false);bgm.pause()}});
    reel.addEventListener('pause',function(){if(ducked&&intent&&!document.hidden){ducked=false;play()}});
  }
}

/* ---------- Заявка на работу: имя, фамилия, телефон → сервер → Telegram ---------- */
/* >>> ВПИШИТЕ СВОИ ДАННЫЕ <<< */
var TG_TOKEN='8807200512:AAEjQ8f9MCLZMviVMyJEwgvTCKsRtutGUa4';      // от @BotFather, вида 123456:ABC...
var TG_CHAT_ID='-1004432384437';       // группа/канал: -100xxxxxxxxxx или @имя_канала
var jf=$('#joinForm');
if(jf){
  var jN=$('#jName'),jS=$('#jSurname'),jP=$('#jPhone'),jW=$('#jWeb'),jB=$('#jBtn'),jM=$('#jMsg');
  var JM={
    ru:{bad:'Проверьте имя, фамилию и номер телефона.',wait:'Отправляем…',ok:'Заявка отправлена! Мы свяжемся с вами.',err:'Не удалось отправить. Позвоните нам: +998 98 311 90 70'},
    uz:{bad:'Ism, familiya va telefon raqamini tekshiring.',wait:'Yuborilmoqda…',ok:'Ariza yuborildi! Siz bilan bog‘lanamiz.',err:'Yuborib bo‘lmadi. Bizga qo‘ng‘iroq qiling: +998 98 311 90 70'}
  };
  function say(k,cls){jM.textContent=(JM[lang]||JM.ru)[k];jM.className='f-msg '+(cls||'')}
  function phoneDigits(){
    var v=jP.value.trim();
    if(v.indexOf('+998')===0)v=v.slice(4); // префикс, который подставили мы
    else{var all=v.replace(/\D/g,'');if(all.indexOf('998')===0&&all.length>=12)v=all.slice(3)} // вставили номер целиком
    return v.replace(/\D/g,'').slice(0,9);
  }
  jP.addEventListener('input',function(){
    var d=phoneDigits(),o='';
    if(d){o='+998 '+d.slice(0,2);if(d.length>2)o+=' '+d.slice(2,5);if(d.length>5)o+=' '+d.slice(5,7);if(d.length>7)o+=' '+d.slice(7,9)}
    jP.value=o;jP.classList.remove('bad');
  });
  [jN,jS].forEach(function(i){i.addEventListener('input',function(){i.classList.remove('bad')})});
  jf.addEventListener('submit',function(e){
    e.preventDefault();
    if(jW.value)return; // бот заполнил скрытое поле
    var n=jN.value.trim(),s=jS.value.trim(),d=phoneDigits(),ok=true;
    jN.classList.toggle('bad',n.length<2);jS.classList.toggle('bad',s.length<2);jP.classList.toggle('bad',d.length!==9);
    if(n.length<2||s.length<2||d.length!==9){say('bad','err');return}
    jB.disabled=true;say('wait');
    var t=new Date(Date.now()+5*3600*1000).toISOString(); // Ташкент UTC+5
    var when=t.slice(8,10)+'.'+t.slice(5,7)+'.'+t.slice(0,4)+' '+t.slice(11,16);
    var text='Новая заявка на работу\nФИО: '+s+' '+n+'\nТелефон: +998'+d+'\nЯзык сайта: '+lang+'\nВремя (Ташкент): '+when;
    fetch('https://api.telegram.org/bot'+TG_TOKEN+'/sendMessage',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:TG_CHAT_ID,text:text})})
      .then(function(r){return r.json()})
      .then(function(res){
        if(!res.ok){ // причина от Telegram — смотрите в консоли браузера (F12)
          console.error('Telegram:',res.error_code,res.description,res.parameters||'');
          throw 0;
        }
        say('ok','ok');jf.reset();jB.disabled=false;
      })
      .catch(function(e){if(e!==0)console.error('Заявка не отправлена (сеть/CORS):',e);say('err','err');jB.disabled=false});
  });
}

/* ---------- Год ---------- */
var y=$('#year');if(y)y.textContent=new Date().getFullYear();
})();
