const KEY='pred_super';
let posts=JSON.parse(localStorage.getItem(KEY)||'[]');
let currentPost=null;

function save(){localStorage.setItem(KEY,JSON.stringify(posts));}

function renderAll(){
  renderList('postsAll', posts);
  renderTrending();
  renderMostViewed();
  renderAdminList();
}

function renderList(id,list){
  const box=document.getElementById(id);
  box.innerHTML='';
  list.forEach(p=>{
    const d=document.createElement('div');
    d.className='card';
    d.innerHTML=`
    ${p.img?`<img src='${p.img}'/>`:''}
    <h3>${p.title}</h3>
    <p>${p.body.slice(0,100)}...</p>
    <small>${p.category}</small><br>
    <button onclick="openPost('${p.id}')">Open</button>
    <button onclick="likePost('${p.id}')">❤️ ${p.likes}</button>
    `;
    box.appendChild(d);
  });
}

function renderTrending(){
  const sorted=[...posts].sort((a,b)=>b.likes-a.likes).slice(0,10);
  renderList('postsTrending',sorted);
}

function renderMostViewed(){
  const sorted=[...posts].sort((a,b)=>b.views-a.views).slice(0,10);
  renderList('postsMost',sorted);
}

function encodeImage(file){
  return new Promise((res)=>{
    const r=new FileReader();
    r.onload=e=>res(e.target.result);
    r.readAsDataURL(file);
  });
}

document.getElementById('newPostBtn').onclick=()=>document.getElementById('modal').classList.remove('hidden');

async function addPost(){
  const t=document.getElementById('pTitle').value.trim();
  const b=document.getElementById('pBody').value.trim();
  const c=document.getElementById('pCat').value.trim();
  const f=document.getElementById('pImg').files[0];
  if(!t||!b){alert('Required');return;}
  let img='';
  if(f) img=await encodeImage(f);
  posts.push({id:Math.random().toString(36).slice(2),title:t,body:b,img,category:c,likes:0,views:0,comments:[],time:Date.now()});
  save(); renderAll(); closeModal();
}
document.getElementById('savePost').onclick=addPost;

function closeModal(){document.getElementById('modal').classList.add('hidden');}

function openPost(id){
  const p=posts.find(x=>x.id===id); currentPost=p; p.views++; save();
  const r=document.getElementById('readContent');
  r.innerHTML=`
    ${p.img?`<img src='${p.img}'/>`:''}
    <h2>${p.title}</h2>
    <small>${p.category}</small>
    <p>${p.body.replace(/\n/g,'<br>')}</p>
    <p>Views: ${p.views} | Likes: ${p.likes}</p>
    <button onclick="share('${id}')">Share</button>
  `;
  loadComments();
  document.getElementById('reader').classList.remove('hidden');
}

function closeReader(){document.getElementById('reader').classList.add('hidden');}

function likePost(id){
  const p=posts.find(x=>x.id===id);
  p.likes++; save(); renderAll();
}

function addComment(){
  const txt=document.getElementById('newComment').value.trim();
  const user=localStorage.getItem('username')||'User';
  if(!txt){alert('Empty');return;}
  currentPost.comments.push({user,text:txt,time:Date.now()});
  document.getElementById('newComment').value='';
  save(); loadComments();
}

function loadComments(){
  const box=document.getElementById('commentList');
  box.innerHTML='';
  currentPost.comments.forEach(c=>{
    const d=document.createElement('div');
    d.innerHTML=`<p><b>${c.user}:</b> ${c.text}</p>`;
    box.appendChild(d);
  });
}

function share(id){
  const url=location.href+'#post='+id;
  navigator.clipboard.writeText(url);
  alert('Link Copied');
}

document.getElementById('search').oninput=e=>{
  const q=e.target.value.toLowerCase();
  const f=posts.filter(p=>(p.title+p.body).toLowerCase().includes(q));
  renderList('postsAll',f);
};

document.getElementById('saveUser').onclick=()=>{
  localStorage.setItem('username',document.getElementById('username').value.trim());
  alert('Saved');
};

function showTab(t){
  document.getElementById('postsAll').classList.add('hidden');
  document.getElementById('postsTrending').classList.add('hidden');
  document.getElementById('postsMost').classList.add('hidden');
  document.getElementById('adminPanel').classList.add('hidden');
  if(t==='all')document.getElementById('postsAll').classList.remove('hidden');
  if(t==='trending')document.getElementById('postsTrending').classList.remove('hidden');
  if(t==='most')document.getElementById('postsMost').classList.remove('hidden');
  if(t==='admin')document.getElementById('adminPanel').classList.remove('hidden');
}

function checkAdmin(){
  const pass=document.getElementById('adminPass').value.trim();
  if(pass==='1234'){
    document.getElementById('adminArea').classList.remove('hidden');
  }else alert('Wrong');
}

function renderAdminList(){
  const box=document.getElementById('adminArea');
  if(!box)return;
  box.innerHTML='';
  posts.forEach(p=>{
    const d=document.createElement('div');
    d.innerHTML=`
      <p><b>${p.title}</b></p>
      <button onclick="del('${p.id}')">Delete</button>
    `;
    box.appendChild(d);
  });
}

function del(id){
  posts=posts.filter(p=>p.id!==id);
  save(); renderAll();
}

document.getElementById('themeBtn').onclick=()=>{
  document.body.classList.toggle('light');
  if(document.body.classList.contains('light'))document.body.style.background='#fff';
  else document.body.style.background='#0b1220';
};

renderAll();
