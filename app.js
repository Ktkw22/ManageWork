<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"></script>
<script>
let tasks=[
  {id:1,title:'จัดทำรายงานสรุปประจำเดือน',todo:'รวบรวมข้อมูลยอดขาย วิเคราะห์แนวโน้ม จัดทำสไลด์',doneNote:'รวบรวมข้อมูลยอดขายเสร็จแล้ว กำลังวิเคราะห์',due:'2025-06-20',status:'inprogress',progress:60},
  {id:2,title:'อัปเดตเว็บไซต์หน้าแรก',todo:'แก้ไข banner, ปรับเนื้อหา About Us, อัปเดตรูปทีม',doneNote:'ออกแบบ banner ใหม่เสร็จ รอ content จากทีม',due:'2025-06-25',status:'review',progress:80},
  {id:3,title:'ประชุมทีมพัฒนาผลิตภัณฑ์',todo:'เตรียม agenda ส่งล่วงหน้า, จัดทำ slide สรุปไอเดีย',doneNote:'',due:'2025-06-14',status:'todo',progress:10},
  {id:4,title:'ส่งใบเสนอราคาให้ลูกค้า ABC',todo:'คำนวณราคา, จัดทำเอกสาร, ส่ง email พร้อม PDF',doneNote:'ส่งเรียบร้อย ลูกค้าตอบรับ',due:'2025-04-10',status:'done',progress:100},
  {id:5,title:'ทบทวนนโยบาย HR ประจำปี',todo:'อ่านร่างนโยบาย รวบรวมความเห็น ส่งข้อเสนอแนะ',doneNote:'',due:'2025-03-08',status:'todo',progress:0},
  {id:6,title:'จัดทำ budget Q3',todo:'รวบรวมตัวเลขจากทุกแผนก วิเคราะห์ จัดทำรายงาน',doneNote:'รวบรวมข้อมูลจากทีม Sales เสร็จ',due:'2025-05-30',status:'inprogress',progress:45},
  {id:7,title:'อบรมพนักงานใหม่',todo:'จัดทำเอกสาร onboarding, นัดวันอบรม, จัดสถานที่',doneNote:'จัดทำเอกสารเสร็จ อบรมผ่านแล้ว',due:'2025-05-15',status:'done',progress:100},
];
let editId=null,deleteId=null,monthChart=null;
const statusOrder=['todo','inprogress','review','done'];
const statusLabel={todo:'รอดำเนินการ',inprogress:'กำลังดำเนินการ',review:'รอตรวจสอบ',done:'เสร็จสิ้น'};
const badgeClass={todo:'b-todo',inprogress:'b-inprogress',review:'b-review',done:'b-done'};
const barColors={done:'#1D9E75',inprogress:'#EF9F27',todo:'#AFA9EC',overdue:'#F0997B'};

function getUrg(t){
  if(t.status==='done') return 'on-track';
  const now=new Date();now.setHours(0,0,0,0);
  const diff=Math.ceil((new Date(t.due)-now)/86400000);
  if(diff<0) return 'overdue';
  if(diff<=3) return 'due-soon';
  return 'on-track';
}
function fmtDate(s){
  if(!s) return '-';
  return new Date(s).toLocaleDateString('th-TH',{day:'numeric',month:'short',year:'2-digit'});
}
function daysLeft(t){
  if(t.status==='done') return '<span style="color:#0F6E56;">เสร็จแล้ว</span>';
  const now=new Date();now.setHours(0,0,0,0);
  const diff=Math.ceil((new Date(t.due)-now)/86400000);
  if(diff<0) return `<span style="color:#993C1D;">เกิน ${Math.abs(diff)} วัน</span>`;
  if(diff===0) return `<span style="color:#854F0B;">ครบวันนี้!</span>`;
  if(diff<=3) return `<span style="color:#854F0B;">เหลือ ${diff} วัน</span>`;
  return `<span style="color:var(--color-text-secondary);">เหลือ ${diff} วัน</span>`;
}

function updateStats(){
  document.getElementById('s-total').textContent=tasks.length;
  document.getElementById('s-ip').textContent=tasks.filter(t=>t.status==='inprogress').length;
  document.getElementById('s-done').textContent=tasks.filter(t=>t.status==='done').length;
  document.getElementById('s-over').textContent=tasks.filter(t=>getUrg(t)==='overdue').length;
}

function buildChart(){
  const MONTHS=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  const yr=2025;
  const d={done:Array(12).fill(0),inprogress:Array(12).fill(0),todo:Array(12).fill(0),overdue:Array(12).fill(0)};
  tasks.forEach(t=>{
    if(!t.due) return;
    const dt=new Date(t.due);
    if(dt.getFullYear()!==yr) return;
    const m=dt.getMonth();
    const u=getUrg(t);
    if(t.status==='done') d.done[m]++;
    else if(u==='overdue') d.overdue[m]++;
    else if(t.status==='inprogress') d.inprogress[m]++;
    else d.todo[m]++;
  });
  const lbls=[],sets={done:[],inprogress:[],todo:[],overdue:[]};
  for(let i=0;i<12;i++){
    if(d.done[i]+d.inprogress[i]+d.todo[i]+d.overdue[i]>0||i<=5){
      lbls.push(MONTHS[i]);
      Object.keys(sets).forEach(k=>sets[k].push(d[k][i]));
    }
  }
  const ctx=document.getElementById('monthChart');
  if(monthChart) monthChart.destroy();
  monthChart=new Chart(ctx,{
    type:'bar',
    data:{labels:lbls,datasets:[
      {label:'เสร็จ',data:sets.done,backgroundColor:'#1D9E75',borderWidth:0,borderRadius:3},
      {label:'กำลังทำ',data:sets.inprogress,backgroundColor:'#EF9F27',borderWidth:0,borderRadius:3},
      {label:'รอดำเนินการ',data:sets.todo,backgroundColor:'#AFA9EC',borderWidth:0,borderRadius:3},
      {label:'เกินกำหนด',data:sets.overdue,backgroundColor:'#F0997B',borderWidth:0,borderRadius:3},
    ]},
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${c.dataset.label}: ${c.raw} งาน`},bodyFont:{family:'Pixelify Sans'},titleFont:{family:'Pixelify Sans'}}},
      scales:{
        x:{stacked:true,ticks:{color:'#888780',font:{size:11,family:'Pixelify Sans'},autoSkip:false,maxRotation:0},grid:{display:false},border:{color:'rgba(136,135,128,.2)'}},
        y:{stacked:true,beginAtZero:true,ticks:{color:'#888780',font:{size:11,family:'Pixelify Sans'},stepSize:1},grid:{color:'rgba(136,135,128,.12)'},border:{display:false}}
      }
    }
  });
}

function renderAll(){
  updateStats();buildChart();
  const fSt=document.getElementById('filter-status').value;
  const fSo=document.getElementById('filter-sort').value;
  let list=tasks.filter(t=>fSt==='all'||t.status===fSt);
  if(fSo==='date') list.sort((a,b)=>new Date(a.due)-new Date(b.due));
  else if(fSo==='status') list.sort((a,b)=>statusOrder.indexOf(a.status)-statusOrder.indexOf(b.status));
  else list.sort((a,b)=>a.title.localeCompare(b.title,'th'));
  const el=document.getElementById('task-list');
  if(!list.length){el.innerHTML='<div class="empty"><i class="ti ti-mood-empty" style="font-size:24px;display:block;margin:0 auto 8px;"></i>ไม่มีงานในรายการนี้</div>';return;}
  const progFill={todo:'#7F77DD',inprogress:'#EF9F27',review:'#7F77DD',done:'#1D9E75'};
  el.innerHTML=list.map(t=>{
    const urg=getUrg(t);
    const cc=urg==='overdue'?'overdue':urg==='due-soon'?'due-soon':t.status==='done'?'done-card':'';
    const overBadge=urg==='overdue'?`<span class="badge b-overdue">เกินกำหนด</span>`:'';
    return`<div class="task-card ${cc}">
      <div class="card-top">
        <div class="card-title">${t.title}</div>
        <div class="card-badges"><span class="badge ${badgeClass[t.status]}">${statusLabel[t.status]}</span>${overBadge}</div>
      </div>
      ${t.todo?`<div class="card-desc"><i class="ti ti-checkbox" aria-hidden="true" style="font-size:13px;vertical-align:-1px;margin-right:3px;"></i>${t.todo}</div>`:''}
      ${t.doneNote?`<div class="card-desc"><i class="ti ti-check" aria-hidden="true" style="font-size:13px;vertical-align:-1px;margin-right:3px;color:#0F6E56;"></i>${t.doneNote}</div>`:''}
      <div class="card-meta">
        <div class="meta-txt"><i class="ti ti-calendar" aria-hidden="true"></i>${fmtDate(t.due)}</div>
        <div class="meta-txt">${daysLeft(t)}</div>
        <div class="prog-wrap"><div class="prog-fill" style="width:${t.progress}%;background:${progFill[t.status]};"></div></div>
        <div class="prog-lbl">${t.progress}%</div>
        <div class="card-actions">
          <button class="btn-edit" onclick="editTask(${t.id})" title="แก้ไข"><i class="ti ti-edit" aria-hidden="true" style="font-size:13px;"></i></button>
          <button class="btn-del" onclick="askDelete(${t.id})" aria-label="ลบงาน"><i class="ti ti-trash" aria-hidden="true" style="font-size:13px;"></i></button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function openModal(reset=true){
  if(reset){
    editId=null;
    document.getElementById('modal-title').innerHTML='<i class="ti ti-pencil-plus" aria-hidden="true" style="vertical-align:-2px;margin-right:6px;font-size:15px;"></i>เพิ่มงานใหม่';
    ['f-title','f-todo','f-done-txt'].forEach(id=>document.getElementById(id).value='');
    document.getElementById('f-status').value='todo';
    document.getElementById('f-prog').value=0;
    document.getElementById('pv').textContent='0%';
    document.getElementById('f-due').value='';
  }
  document.getElementById('modal-wrap').style.display='flex';
  document.getElementById('confirm-wrap').style.display='none';
}
function closeModal(){document.getElementById('modal-wrap').style.display='none';}

function editTask(id){
  const t=tasks.find(x=>x.id===id);if(!t)return;
  editId=id;
  document.getElementById('modal-title').innerHTML='<i class="ti ti-edit" aria-hidden="true" style="vertical-align:-2px;margin-right:6px;font-size:15px;"></i>แก้ไขงาน';
  document.getElementById('f-title').value=t.title;
  document.getElementById('f-todo').value=t.todo;
  document.getElementById('f-done-txt').value=t.doneNote;
  document.getElementById('f-due').value=t.due;
  document.getElementById('f-status').value=t.status;
  document.getElementById('f-prog').value=t.progress;
  document.getElementById('pv').textContent=t.progress+'%';
  openModal(false);
}

function saveTask(){
  const title=document.getElementById('f-title').value.trim();
  if(!title)return;
  const obj={title,todo:document.getElementById('f-todo').value.trim(),doneNote:document.getElementById('f-done-txt').value.trim(),due:document.getElementById('f-due').value,status:document.getElementById('f-status').value,progress:parseInt(document.getElementById('f-prog').value)};
  if(editId){const i=tasks.findIndex(x=>x.id===editId);tasks[i]={...tasks[i],...obj};}
  else tasks.push({id:Date.now(),...obj});
  closeModal();renderAll();
}

function askDelete(id){deleteId=id;document.getElementById('confirm-wrap').style.display='flex';document.getElementById('modal-wrap').style.display='none';}
function closeConfirm(){deleteId=null;document.getElementById('confirm-wrap').style.display='none';}
function confirmDelete(){if(deleteId)tasks=tasks.filter(t=>t.id!==deleteId);closeConfirm();renderAll();}

renderAll();
</script>
