// Lightweight, read-only development preview for machines with low memory.
// Astro source remains the canonical implementation. Reload to see edits.
import http from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { projects, categories } from './src/data/projects.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const read = p => readFileSync(path.join(root, p), 'utf8');
const template = p => read(p).split(/^---\s*$/m)[2].trim();
const escape = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const js = source => source.replace(/<(?:HTMLElement|HTMLButtonElement|HTMLAnchorElement)>/g, '').replace(/:(?:boolean|number)(?=\))/g,'');
function cover(p, large=false){return `<div class="cover ${escape(p.theme)}${large?' cover--large':''}"><div class="cover-grid"></div>${p.theme==='detail'?'<div class="cover-photo"></div>':''}<div class="cover-type"><strong>${escape(p.name)}</strong><small>${escape(p.industry)}</small></div><span class="cover-tag">${p.status==='Реальный проект'?'Архив / эскиз обложки':'Концепция / в разработке'}</span></div>`;}
function base(body, title='Артём Кузнецов — цифровая упаковка', description='Независимый специалист по оформлению бизнеса в интернете.'){
  const source=read('src/layouts/Base.astro');
  const styles=[...source.matchAll(/import '\.\.\/styles\/([^']+)'/g)].map(m=>`<link rel="stylesheet" href="/styles/${m[1]}">`).join('');
  return template('src/layouts/Base.astro').replace('content={description}',`content="${escape(description)}"`).replace('<title>{title}</title>',`<title>${escape(title)}</title>${styles}`).replace('<slot />',body).replace(/<script>([\s\S]*?)<\/script>/g,(_,s)=>`<script type="module">${js(s)}</script>`);
}
function home(){
  const source=read('src/pages/index.astro');
  const declarations=source.split(/^---\s*$/m)[1].replace(/^import .*$/gm,'');
  const {packages,features,extras,steps}=Function(`${declarations}\nreturn {packages,features,extras,steps}`)();
  let body=template('src/pages/index.astro').replace(/^<Base>\s*/,'').replace(/<\/Base>$/,'');
  body=body.replace(/\{categories\.map\([\s\S]*?\)\}/,categories.map((c,i)=>`<button data-filter="${escape(c)}" aria-pressed="${i===0}">${escape(c)}</button>`).join(''));
  body=body.replace(/\{projects\.map\([\s\S]*?<\/a>\)\}/,projects.map(p=>`<a class="project" href="/work/${p.slug}/" data-categories="${escape(p.types.join('|'))}" data-reveal>${cover(p)}<div class="project-caption"><div><h3>${escape(p.name)}</h3><span>${escape(p.types.join(' / '))}</span></div><span class="small">${escape(p.status)}</span></div></a>`).join(''));
  const art=body.match(/<div class="package-art"[\s\S]*?<\/div>/)?.[0];
  const icons=art?[...art.matchAll(/<span class="tier-icon">[\s\S]*?<\/span>/g)].map(m=>m[0]):[];
  body=body.replace(/\{packages\.map\([\s\S]*?<\/article>\)\}/,packages.map((p,i)=>`<article class="package${i===2?' package-full':''}" data-reveal><div class="package-art" aria-hidden="true">${icons.slice(0,i+1).join('')}</div><h3>${escape(p.name)}</h3><p class="package-description">${escape(p.description)}</p><strong class="package-price">${escape(p.price)}</strong><dl>${features.map((f,j)=>{const absent=p.features[j]==='—';return `<div class="package-row${absent?' not-included':''}"><span aria-hidden="true">${absent?'−':'✓'}</span><dt>${escape(f)}</dt><dd>${absent?'Не входит':escape(p.features[j])}</dd></div>`}).join('')}</dl><a class="package-action" href="#contact">Обсудить пакет</a></article>`).join(''));
  body=body.replace(/\{extras\.map\([\s\S]*?<\/article>\)\}/,extras.map(([n,d,p])=>`<article class="service" data-reveal><h3>${escape(n)}</h3><p>${escape(d)}</p><strong>${escape(p)}</strong></article>`).join(''));
  body=body.replace(/\{steps\.map\([\s\S]*?<\/article>\)\}/,steps.map((s,i)=>`<article class="process-step${i===0?' active':''}"><button class="step-trigger" aria-expanded="${i===0}" aria-controls="step-panel-${i}" data-step="${i}"><span class="step-index">0${i+1}</span><span>${escape(s.title)}</span><span class="step-plus" aria-hidden="true"></span></button><div class="step-panel" id="step-panel-${i}" aria-hidden="${i!==0}"><div><p>${escape(s.description)}</p><p class="step-result"><strong>На выходе:</strong> ${escape(s.result)}</p></div></div></article>`).join(''));
  return base(body);
}
function work(p){const next=projects[(projects.indexOf(p)+1)%projects.length];let body=template('src/pages/work/[slug].astro').replace(/^<Base[^>]*>\s*/,'').replace(/<\/Base>$/,'');
  body=body.replace('<ProjectCover project={project} large/>',cover(p,true)).replace('<ProjectCover project={next}/>',cover(next));
  body=body.replace(/\{project\.decisions\.map\([\s\S]*?<\/article>\)\}/,p.decisions.map(([h,t])=>`<article data-reveal><h3>${escape(h)}</h3><p>${escape(t)}</p></article>`).join(''));
  body=body.replace(/\{project\.palette\.map\([\s\S]*?<\/div>\)\}/,p.palette.map(c=>`<div style="background:${escape(c)}"><span>${escape(c)}</span></div>`).join(''));
  body=body.replace(/\{project\.labels\.map\([\s\S]*?<\/div>\)\}/,p.labels.map(l=>`<div class="mock" data-reveal><span>${escape(p.name)}</span><b>${escape(l)}</b><small>Эскиз структуры</small></div>`).join(''));
  body=body.replace("class={'mock-grid '+project.theme}",`class="mock-grid ${escape(p.theme)}"`).replace("href={'/work/'+next.slug+'/'}",`href="/work/${next.slug}/"`).replace("{project.types.join(' / ')}",escape(p.types.join(' / '))).replace(/\{project\.(\w+)\}/g,(_,key)=>escape(p[key])).replace('{next.name}',escape(next.name));return base(body,`${p.name} — Артём Кузнецов`,p.description);
}
const mime={'.css':'text/css; charset=utf-8','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg'};
const server=http.createServer((req,res)=>{try{const url=new URL(req.url,'http://127.0.0.1');let html;if(url.pathname==='/')html=home();else if(/^\/work\/[a-z-]+\/?$/.test(url.pathname)){const p=projects.find(x=>x.slug===url.pathname.split('/')[2]);if(p)html=work(p);}if(html){res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'});return res.end(html);}let asset;if(/^\/styles\/[a-z-]+\.css$/.test(url.pathname))asset='src'+url.pathname;else if(/^\/images\/[a-zA-Z0-9_-]+\.(webp|png|jpg|svg)$/.test(url.pathname))asset='public'+url.pathname;if(asset&&existsSync(path.join(root,asset))){res.writeHead(200,{'content-type':mime[path.extname(asset)]||'application/octet-stream','cache-control':'no-store'});return res.end(readFileSync(path.join(root,asset)));}res.writeHead(404);res.end('Not found');}catch(e){console.error(e);res.writeHead(500);res.end('Preview error');}});
server.listen(4321,'127.0.0.1',()=>console.log('Lightweight preview: http://127.0.0.1:4321/'));
