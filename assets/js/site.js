(function(){
  const $$=(selector,root=document)=>Array.from(root.querySelectorAll(selector));
  const $=(selector,root=document)=>root.querySelector(selector);

  const menu=$('.menu-toggle');
  if(menu){menu.addEventListener('click',()=>{const nav=$('#site-nav');const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});}

  const reveal=()=>{const items=$$('.reveal:not(.visible)');if(!('IntersectionObserver'in window)){items.forEach(x=>x.classList.add('visible'));return}const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');io.unobserve(entry.target)}}),{threshold:.08});items.forEach(x=>io.observe(x));};
  reveal();

  const panel=$('[data-filter-panel]');
  if(panel){
    const cards=$$('[data-post-card]'),search=$('[data-filter-search]'),date=$('[data-filter-date]');
    let category='全部',tag='';
    const normalize=s=>(s||'').toLowerCase().trim();
    const apply=()=>{let count=0;cards.forEach(card=>{const query=normalize(search.value);const hay=normalize([card.dataset.title,card.dataset.category,card.dataset.tags].join(' '));const show=(!query||hay.includes(query))&&(category==='全部'||normalize(card.dataset.category).includes(normalize(category)))&&(!tag||normalize(card.dataset.tags).split(',').includes(normalize(tag)))&&(!date.value||card.dataset.date===date.value);card.hidden=!show;if(show)count++;});$('[data-result-count]').textContent=count;$('[data-empty-state]').hidden=count!==0;const active=[];if(category!=='全部')active.push(category);if(tag)active.push('#'+tag);if(date.value)active.push(date.value);$('[data-active-filter]').textContent=active.length?active.join(' · '):'按发布时间倒序';};
    const reset=()=>{category='全部';tag='';search.value='';date.value='';$$('[data-category]').forEach(x=>x.classList.toggle('active',x.dataset.category==='全部'));$$('[data-tag]').forEach(x=>x.classList.remove('active'));apply();};
    search.addEventListener('input',apply);date.addEventListener('change',apply);$('[data-filter-reset]').addEventListener('click',reset);$('[data-empty-reset]').addEventListener('click',reset);
    $$('[data-category]').forEach(btn=>btn.addEventListener('click',()=>{category=btn.dataset.category;$$('[data-category]').forEach(x=>x.classList.toggle('active',x===btn));apply();}));
    $$('[data-tag]').forEach(btn=>btn.addEventListener('click',()=>{tag=tag===btn.dataset.tag?'':btn.dataset.tag;$$('[data-tag]').forEach(x=>x.classList.toggle('active',x.dataset.tag===tag));apply();}));
    $$('[data-quick-category]').forEach(link=>link.addEventListener('click',()=>{category=link.dataset.quickCategory;$$('[data-category]').forEach(x=>x.classList.toggle('active',x.dataset.category===category));apply();}));
    document.addEventListener('keydown',event=>{if(event.key==='/'&&!/input|textarea/i.test(document.activeElement.tagName)){event.preventDefault();search.focus();}});
  }

  const calendar=$('[data-calendar]');
  if(calendar){
    const posts=$$('[data-calendar-post]',calendar),postDates=new Set(posts.map(x=>x.dataset.date));
    const newest=posts.length?new Date(posts[0].dataset.date+'T12:00:00'):new Date();let cursor=new Date(newest.getFullYear(),newest.getMonth(),1),selected='';
    const formatDate=value=>{const [y,m,d]=value.split('-');return `${y} 年 ${Number(m)} 月 ${Number(d)} 日`};
    const filter=()=>{let count=0;posts.forEach(post=>{const show=!selected||post.dataset.date===selected;post.hidden=!show;if(show)count++;});$('[data-calendar-selection]').textContent=selected?formatDate(selected):'全部笔记';$('[data-calendar-count]').textContent=count+' 篇';$('[data-calendar-empty]').hidden=count!==0;};
    const render=()=>{const y=cursor.getFullYear(),m=cursor.getMonth();$('[data-calendar-title]').textContent=`${y}.${String(m+1).padStart(2,'0')}`;const start=new Date(y,m,1),offset=(start.getDay()+6)%7,days=new Date(y,m+1,0).getDate(),previousDays=new Date(y,m,0).getDate();let html='';for(let i=0;i<42;i++){let day=i-offset+1,month=m,year=y,outside=false;if(day<1){day=previousDays+day;month=m-1;outside=true}else if(day>days){day-=days;month=m+1;outside=true}const dateObj=new Date(year,month,day),iso=`${dateObj.getFullYear()}-${String(dateObj.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;html+=`<button class="calendar-day${outside?' outside':''}${postDates.has(iso)?' has-post':''}${selected===iso?' selected':''}" type="button" data-day="${iso}" aria-label="${formatDate(iso)}${postDates.has(iso)?'，有笔记':''}">${day}</button>`}$('[data-calendar-days]').innerHTML=html;$$('[data-day]',calendar).forEach(btn=>btn.addEventListener('click',()=>{selected=selected===btn.dataset.day?'':btn.dataset.day;cursor=new Date(btn.dataset.day+'T12:00:00');render();filter();}));};
    $('[data-calendar-prev]').addEventListener('click',()=>{cursor=new Date(cursor.getFullYear(),cursor.getMonth()-1,1);render()});$('[data-calendar-next]').addEventListener('click',()=>{cursor=new Date(cursor.getFullYear(),cursor.getMonth()+1,1);render()});$('[data-calendar-today]').addEventListener('click',()=>{cursor=new Date(newest.getFullYear(),newest.getMonth(),1);selected='';render();filter()});render();filter();
  }

  const toc=$('[data-toc]'),body=$('.article-body');
  if(toc&&body){const headings=$$('h2,h3',body);if(headings.length){toc.innerHTML='';headings.forEach((heading,index)=>{if(!heading.id)heading.id='section-'+(index+1);const a=document.createElement('a');a.href='#'+heading.id;a.textContent=heading.textContent;if(heading.tagName==='H3')a.className='sub';toc.appendChild(a);});}else toc.innerHTML='<span>本文暂无章节</span>';}
})();

