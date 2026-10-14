const agenda=[
{day:"Segunda",tasks:[["17:15–18:30","Probabilidade","Revisar a aula e resolver exercícios",75],["19:30–21:00","Chinês","Assistir à aula",90]]},
{day:"Terça",tasks:[["17:30–19:00","Cálculo 2","Revisar a prática e resolver exercícios",90],["19:15–20:15","PICME","Teoria, demonstrações ou análise de algoritmos",60]]},
{day:"Quarta",tasks:[["17:15–18:30","Mecânica e Termodinâmica","Revisar a prática e resolver problemas",75],["19:30–21:00","Chinês","Assistir à aula",90]]},
{day:"Quinta",tasks:[["17:30–19:00","Probabilidade","Resolver exercícios e revisar dúvidas",90],["19:15–20:15","PICME","Estudar um algoritmo ou demonstrar um resultado",60]]},
{day:"Sexta",tasks:[["15:30–17:00","Cálculo 2","Consolidar as práticas e resolver exercícios",90],["17:15–18:00","Programação 2","Praticar código e concluir tarefas",45]]},
{day:"Sábado",tasks:[["09:00–11:00","Cálculo 2","Lista extensa e questões difíceis",120],["11:15–12:45","Probabilidade","Resolver exercícios e corrigir erros",90],["14:00–16:00","PICME","Estudo aprofundado de algoritmos exatos e exponenciais",120],["16:15–17:15","Mecânica e Termodinâmica","Resolver problemas difíceis",60]]},
{day:"Domingo",tasks:[["09:30–11:00","Mecânica e Termodinâmica","Revisão cumulativa e exercícios",90],["11:15–12:15","PICME","Revisar demonstrações ou concluir um problema",60],["15:00–15:30","Narrativas Textuais","Leituras e tarefas pendentes",30],["15:30–15:45","Planejamento semanal","Definir prioridades da próxima semana",15]]}
];
const KEY="minhaRotinaImpa-v1";
let state={checks:{},notes:{}};
let selected=1;
const $=id=>document.getElementById(id);
function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||"{}");state={checks:x.checks||{},notes:x.notes||{}}}catch(e){}}
function save(){localStorage.setItem(KEY,JSON.stringify(state));$("savedLabel").textContent="Salvo neste aparelho";}
function key(d,i){return d+"-"+i}
function dayTotal(d){return d.tasks.length}
function doneCount(d){return d.tasks.filter((t,i)=>state.checks[key(d.day,i)]).length}
function renderDays(){
 $("days").innerHTML=agenda.map((d,i)=>`<button class="day-btn ${i===selected?"active":""}" data-day="${i}"><b>${d.day.slice(0,3)}</b><small>${doneCount(d)}/${dayTotal(d)}</small></button>`).join("");
 document.querySelectorAll("[data-day]").forEach(b=>b.onclick=()=>{selected=+b.dataset.day;render()});
}
function renderTasks(){
 const d=agenda[selected],done=doneCount(d);
 $("dayTitle").textContent=d.day+"-feira";
 $("dayProgress").textContent=`${done} de ${d.tasks.length} atividades concluídas`;
 $("dayPercent").textContent=Math.round(done/d.tasks.length*100)+"%";
 $("dayBar").style.width=(done/d.tasks.length*100)+"%";
 $("tasks").innerHTML=d.tasks.map((t,i)=>{const checked=!!state.checks[key(d.day,i)];return `<label class="task ${checked?"done":""}"><input type="checkbox" data-task="${i}" ${checked?"checked":""} aria-label="Concluir ${t[1]}"><div class="task-main"><div class="task-time">${t[0]}</div><div class="task-name">${t[1]}</div><div class="task-detail">${t[2]}</div></div></label>`}).join("");
 document.querySelectorAll("[data-task]").forEach(c=>c.onchange=()=>{state.checks[key(d.day,+c.dataset.task)]=c.checked;save();render()});
 $("notes").value=state.notes[d.day]||"";
}
function renderSummary(){
 $("summary").innerHTML=agenda.map(d=>{const n=doneCount(d),p=Math.round(n/d.tasks.length*100);return `<div class="summary-day"><div class="summary-title"><span>${d.day}-feira</span><span>${n}/${d.tasks.length}</span></div><div class="mini-bar"><i style="width:${p}%"></i></div></div>`}).join("");
}
function renderStats(){
 const all=agenda.reduce((n,d)=>n+d.tasks.length,0),done=agenda.reduce((n,d)=>n+doneCount(d),0);
 const mins=agenda.reduce((n,d)=>n+d.tasks.reduce((m,t,i)=>m+(state.checks[key(d.day,i)]?t[3]:0),0),0);
 $("weekCount").textContent=`${done}/${all}`;$("weekBar").style.width=(done/all*100)+"%";
 $("weekTime").textContent=`${Math.floor(mins/60)}h${mins%60?String(mins%60).padStart(2,"0"):""}`;
}
function render(){renderDays();renderTasks();renderSummary();renderStats()}
$("notes").addEventListener("input",()=>{state.notes[agenda[selected].day]=$("notes").value;save()});
$("todayBtn").onclick=()=>{let d=(new Date().getDay()+6)%7;selected=d;render()};
$("toggleSummary").onclick=()=>{const s=$("summary");s.hidden=!s.hidden;$("toggleSummary").textContent=s.hidden?"Ver resumo":"Ocultar resumo"};
$("exportBtn").onclick=()=>{const blob=new Blob([JSON.stringify({version:1,exportedAt:new Date().toISOString(),...state},null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="backup-minha-rotina.json";a.click();URL.revokeObjectURL(a.href)};
$("importFile").onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const x=JSON.parse(await f.text());if(!x.checks||!x.notes)throw Error();state={checks:x.checks,notes:x.notes};save();render();alert("Backup importado com sucesso.")}catch(err){alert("Não foi possível importar. Escolha um backup válido.")}e.target.value=""};
$("resetBtn").onclick=()=>{if(confirm("Desmarcar todas as tarefas e apagar as notas desta agenda? Esta ação não pode ser desfeita, a menos que você tenha um backup.")){state={checks:{},notes:{}};save();render()}};
load();render();
if("serviceWorker" in navigator && location.protocol.startsWith("http"))navigator.serviceWorker.register("./sw.js").catch(()=>{});
