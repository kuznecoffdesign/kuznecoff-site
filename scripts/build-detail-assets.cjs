const fs=require('node:fs');
const path=require('node:path');
const sharp=require('sharp');
const root=path.resolve(__dirname,'..');
const dir=path.join(root,'public','images','cases','detail');
const white='#f5f4f1',accent='#f0a45b';
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const font='Arial, sans-serif';
const logo=(x,y,scale=1)=>`<g transform="translate(${x} ${y}) scale(${scale})"><path d="M0 0H17L27 10V28L17 38H0V30H15L19 25V13L15 8H0Z" fill="${accent}"/><path d="M34 0H42L48 25L54 7H62L68 25L74 0H82L73 38H64L58 19L52 38H43Z" fill="${white}"/><text x="96" y="15" font-family="${font}" font-size="13" font-weight="700" letter-spacing="2" fill="${white}">DETAIL</text><text x="96" y="33" font-family="${font}" font-size="13" font-weight="700" letter-spacing="2" fill="${white}">WORKS</text></g>`;
function lines(arr,x,y,size,step,fill=white){return arr.map((s,i)=>`<text x="${x}" y="${y+i*step}" fill="${fill}" font-family="${font}" font-size="${size}" font-weight="700" letter-spacing="-1.5">${esc(s)}</text>`).join('')}
async function photo(k){const input=path.join(root,`detail-${k}.b64`),out=path.join(dir,`photo-${k}.webp`);if(fs.existsSync(input)){await sharp(Buffer.from(fs.readFileSync(input,'utf8'),'base64')).resize({width:1440,height:1080,fit:'cover'}).webp({quality:86}).toFile(out)}return out;}
async function render({file,img,kind,title,sub,kicker='DETAILING STUDIO'}){
  let w=1080,h=1080,size=76,x=58,y=782,step=86;
  if(kind==='story'){w=720;h=1280;x=48;y=775;size=60;step=69;}
  if(kind==='vkcover'){w=1590;h=530;x=72;y=245;size=90;step=91;}
  const isHeader=kind==='vkcover';
  const gradient=isHeader?`<linearGradient id="shade" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#060708" stop-opacity=".98"/><stop offset=".42" stop-color="#060708" stop-opacity=".86"/><stop offset="1" stop-color="#060708" stop-opacity="0"/></linearGradient>`:`<linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#090a0b" stop-opacity=".84"/><stop offset=".28" stop-color="#090a0b" stop-opacity=".01"/><stop offset=".5" stop-color="#090a0b" stop-opacity=".14"/><stop offset=".8" stop-color="#090a0b" stop-opacity=".92"/><stop offset="1" stop-color="#090a0b"/></linearGradient>`;
  const bottom=y+title.length*step+22;
  const svg=`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><defs>${gradient}</defs><rect width="100%" height="100%" fill="url(#shade)"/>${logo(x,40,isHeader?1.25:.95)}<rect x="${x}" y="${y-105}" width="45" height="5" rx="2.5" fill="${accent}"/><text x="${x+60}" y="${y-97}" font-family="${font}" font-size="${isHeader?18:15}" font-weight="700" letter-spacing="2.5" fill="${accent}">${esc(kicker)}</text>${lines(title,x,y,size,step)}<text x="${x}" y="${Math.min(bottom,h-62)}" font-family="${font}" font-size="${isHeader?25:20}" fill="#e0dedb">${esc(sub)}</text></svg>`;
  const bg=await sharp(img).resize(w,h,{fit:'cover',position:'attention'}).toBuffer();
  await sharp(bg).composite([{input:Buffer.from(svg)}]).webp({quality:89,effort:5}).toFile(path.join(dir,file));
}
async function main(){fs.mkdirSync(dir,{recursive:true});const [polish,protect,interior,film]=await Promise.all(['polish','protect','interior','film'].map(photo));const cover=path.join(dir,'cover.webp');
  const assets=[
    {file:'vk-cover.webp',img:cover,kind:'vkcover',title:['DETAIL WORKS'],sub:'Детейлинг • Защита • Уход',kicker:'СТУДИЯ УХОДА ЗА АВТО'},
    {file:'maps-cover.webp',img:cover,kind:'square',title:['Чистота','в деталях'],sub:'Профессиональный уход за автомобилем',kicker:'ДЕТЕЙЛИНГ'},
    {file:'maps-polish.webp',img:polish,kind:'story',title:['Полировка','кузова'],sub:'Восстановление блеска',kicker:'УСЛУГИ'},
    {file:'maps-protect.webp',img:protect,kind:'story',title:['Керамическая','защита'],sub:'Уход за ЛКП и гидрофобный эффект',kicker:'УСЛУГИ'},
    {file:'maps-film.webp',img:film,kind:'story',title:['Защитная','плёнка'],sub:'Защита уязвимых зон кузова',kicker:'УСЛУГИ'},
    {file:'maps-interior.webp',img:interior,kind:'story',title:['Химчистка','салона'],sub:'Детальный уход за интерьером',kicker:'УСЛУГИ'},
    {file:'maps-check.webp',img:cover,kind:'story',title:['Осмотр','перед работой'],sub:'Подберём подходящий комплекс',kicker:'КОНСУЛЬТАЦИЯ'},
    {file:'vk-polish.webp',img:polish,kind:'square',title:['Глубина','блеска'],sub:'Что даёт профессиональная полировка?',kicker:'ПОЛЕЗНО ЗНАТЬ'},
    {file:'vk-protect.webp',img:protect,kind:'square',title:['Вода','не задерживается'],sub:'Как работает керамическая защита',kicker:'УХОД ЗА КУЗОВОМ'},
    {file:'vk-film.webp',img:film,kind:'square',title:['Защита','самых уязвимых зон'],sub:'Плёнка на переднюю часть кузова',kicker:'ЗАЩИТА'},
    {file:'vk-interior.webp',img:interior,kind:'square',title:['Салон','без следов'],sub:'Чистота, которую ощущаешь каждый день',kicker:'ХИМЧИСТКА'},
    {file:'vk-care.webp',img:cover,kind:'square',title:['Уход','по делу'],sub:'Подберём комплекс под состояние авто',kicker:'DETAIL WORKS'}];
  const avatar=`<svg width="600" height="600" xmlns="http://www.w3.org/2000/svg"><rect width="600" height="600" rx="100" fill="#101113"/><rect x="45" y="45" width="510" height="510" rx="65" fill="none" stroke="#34363a" stroke-width="2"/><g transform="translate(140 245) scale(3.9)"><path d="M0 0H17L27 10V28L17 38H0V30H15L19 25V13L15 8H0Z" fill="${accent}"/><path d="M34 0H42L48 25L54 7H62L68 25L74 0H82L73 38H64L58 19L52 38H43Z" fill="${white}"/></g></svg>`;
  await Promise.all([...assets.map(render),sharp(Buffer.from(avatar)).webp({quality:95}).toFile(path.join(dir,'vk-avatar.webp'))]);
  console.log(`Created ${assets.length+1} branded assets in ${dir}`);
}
main().catch(error=>{console.error(error);process.exitCode=1});
