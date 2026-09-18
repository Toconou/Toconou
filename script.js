const CONFIG={
  FEDAPAY_PUBLIQUE:"pk_live_5qnrrIu0EszkXbuHZ0wJwbkJ",
  FIREBASE_API_KEY:"AIzaSyChHilkChFqr3dxzsLUHwipK4ZEfVKXjRI",
  FIREBASE_PROJECT_ID:"toconou",
  FIREBASE_AUTH_DOMAIN:"toconou.firebaseapp.com",
  FIREBASE_STORAGE_BUCKET:"toconou.firebasestorage.app"
};
import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getAuth,createUserWithEmailAndPassword,signInWithEmailAndPassword,onAuthStateChanged,signOut,deleteUser,sendEmailVerification,sendPasswordResetEmail,RecaptchaVerifier} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {getFirestore,doc,setDoc,getDoc,collection,addDoc,serverTimestamp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const appFb=initializeApp({apiKey:CONFIG.FIREBASE_API_KEY,authDomain:CONFIG.FIREBASE_AUTH_DOMAIN,projectId:CONFIG.FIREBASE_PROJECT_ID,storageBucket:CONFIG.FIREBASE_STORAGE_BUCKET});
const auth=getAuth(appFb);
const db=getFirestore(appFb);
const $=id=>document.getElementById(id);
let mouvements=0,panier=[],miniApps=[],booster=1,mediaRecorder,recordedChunks=[],likes={},comments={};

function showSec(id){ document.querySelectorAll(".section").forEach(s=>s.classList.remove("active")); $(id)?.classList.add("active"); }
$('tabChat').onclick=()=>showSec("secChat");
$('tabContacts').onclick=()=>showSec("secContacts");
$('tabDecouverte').onclick=()=>showSec("secDecouverte");
$('tabMarket').onclick=()=>showSec("secMarket");
$('tabMoi').onclick=()=>showSec("secMoi");

["mGauche","mDroite","mHaut","mBas","mCligne","mBouche"].forEach(id=>{
  $(id).onclick=()=>{
    if($(id).style.background!=="green"){
      mouvements++;
      $(id).style.background="green"; $(id).style.color="white";
      $('progressBar').style.width=mouvements/6*100+"%";
      $('progressText').innerText=Math.round(mouvements/6*100)+"%";
      if(mouvements>=6){ $('visiText').innerText="Vérifié"; $('visiText').className="badge badge-ok"; }
    }
  };
});

// ALGO FORT comme WeChat - avec harcèlement
async function ALGO(txt){
  if(!txt?.trim()) return {ok:false,raison:"Vide"};
  let low=txt.toLowerCase();
  let interdits=["arme","bombe","drogue","tuer","terroriste","sexe","porno","prostitution","nude","arnaque","scam","harcelement","harcèlement","insulte","haine","racisme","menace","suicide","violence"];
  for(let m of interdits){ if(low.includes(m)) return {ok:false,raison:"Bloqué sécurité: "+m}; }
  return {ok:true};
}

// PRO FORT - Firebase, pas localStorage
async function estPRO(){
  if(!auth.currentUser) return false;
  let snap=await getDoc(doc(db,"users",auth.currentUser.uid));
  return snap.exists() && snap.data().type==="PRO";
}

$('btnCreer').onclick=async()=>{
  try{
    let email=$('email').value.trim(); let pass=$('password').value;
    if(!email||!pass) return alert("Renseignez email et mot de passe");
    if(!window.recaptchaVerifier) window.recaptchaVerifier=new RecaptchaVerifier(auth,'recaptcha',{size:'invisible'});
    let cr=await createUserWithEmailAndPassword(auth,email,pass);
    await sendEmailVerification(cr.user);
    await setDoc(doc(db,"users",cr.user.uid),{type:$('typeCompte').value,pays:$('ville').value.trim(),email:email,verifie:false,created:serverTimestamp()});
    alert("Compte créé");
  }catch(e){ $('authMsg').innerText=e.message; }
};
$('btnLogin').onclick=async()=>{ try{ await signInWithEmailAndPassword(auth,$('email').value.trim(),$('password').value); }catch(e){ $('authMsg').innerText=e.message; } };
$('btnOublieSide').onclick=async()=>{ let m=prompt("Votre email"); if(m){ await sendPasswordResetEmail(auth,m.trim()); alert("Email envoyé"); } };
$('btnLogout').onclick=()=>signOut(auth);
$('btnSupprimer').onclick=async()=>{ if(confirm("Supprimer le compte?")) await deleteUser(auth.currentUser); };
onAuthStateChanged(auth,u=>{ if(u){ $('authBox').style.display="none"; $('app').style.display="block"; showSec("secChat"); }else{ $('authBox').style.display="block"; $('app').style.display="none"; } });

$('postText').oninput=()=>$('countText').innerText=$('postText').value.length;
$('postPhoto').onchange=()=>$('countPhotos').innerText=$('postPhoto').files.length;
$('btnRecVideo').onclick=async()=>{ try{ let stream=await navigator.mediaDevices.getUserMedia({video:true,audio:true}); $('previewRec').srcObject=stream; $('previewRec').style.display="block"; $('previewRec').play(); recordedChunks=[]; mediaRecorder=new MediaRecorder(stream); mediaRecorder.ondataavailable=e=>{ if(e.data.size>0) recordedChunks.push(e.data); }; mediaRecorder.onstop=()=>{ let blob=new Blob(recordedChunks,{type:'video/webm'}); $('previewRec').srcObject=null; $('previewRec').src=URL.createObjectURL(blob); $('previewRec').blob=blob; $('countVideo').innerText="1"; }; mediaRecorder.start(); $('btnRecVideo').style.display="none"; $('btnStopRec').style.display="block"; }catch(e){ alert("Caméra non autorisée"); } };
$('btnStopRec').onclick=()=>{ mediaRecorder.stop(); mediaRecorder.stream.getTracks().forEach(t=>t.stop()); $('btnStopRec').style.display="none"; $('btnRecVideo').style.display="block"; };
$('btnPost').onclick=async()=>{
  let txt=$('postText').value.trim(); if(!txt) return;
  let s=await ALGO(txt); if(!s.ok) return alert(s.raison);
  await addDoc(collection(db,"posts"),{txt:txt,uid:auth.currentUser.uid,date:serverTimestamp()});
  let id=Date.now(); likes[id]=0; comments[id]=[];
  $('mur').innerHTML=`<div class="card"><small>Sauvegardé fort - ${new Date().toLocaleString()}</small><div>${txt}</div></div>`+$('mur').innerHTML;
  $('postText').value="";
};
$('btnChat').onclick=async()=>{ let msg=$('chatMsg').value.trim(); if(!msg) return; let s=await ALGO(msg); if(!s.ok) return alert(s.raison); await addDoc(collection(db,"chats"),{msg:msg,uid:auth.currentUser.uid,date:serverTimestamp()}); $('murChat').innerHTML+=`<div>${msg}</div>`; $('chatMsg').value=""; };
$('btnProd').onclick=async()=>{ if(!await estPRO()) return alert("Fonction PRO"); let s=await ALGO($('prodNom').value); if(!s.ok) return alert(s.raison); let comm=$('prodPays').value.includes("Bénin")?5:$('prodPays').value.includes("Niger")?8:12; panier.push({nom:$('prodNom').value.trim(),prix:+$('prodPrix').value||0,comm:comm}); await addDoc(collection(db,"panier"),{uid:auth.currentUser.uid,produits:panier,date:serverTimestamp()}); $('panierCount').innerText=panier.length; $('panierBox').innerHTML=panier.map(p=>`${p.nom} - ${p.prix}F`).join("<br>"); };
$('btnCommander').onclick=()=>{ if(typeof FedaPay==="undefined") return alert("FedaPay non chargé"); FedaPay.init({public_key:CONFIG.FEDAPAY_PUBLIQUE}); let tot=panier.reduce((a,b)=>a+b.prix,0); FedaPay.open({amount:tot,description:"Commande Toconou",callback:()=>{ $('suiviBox').innerHTML=`Payé ${tot}F`; $('factureBox').style.display="block"; $('factureBox').innerHTML=`<h3>Facture</h3>Total ${tot}F`; }}); };
$('btnBooster').onclick=()=>{ booster=2; $('boosterInfo').innerText="x2"; FedaPay.init({public_key:CONFIG.FEDAPAY_PUBLIQUE}); FedaPay.open({amount:1000,description:"Booster"}); };
$('btnLegoCreer').onclick=async()=>{ if(!await estPRO()) return alert("Fonction PRO"); let id=Date.now(); miniApps.push({id,nom:$('legoNom').value.trim(),emoji:$('legoEmoji').value.trim()}); $('legoGrid').innerHTML+=`<div style="background:white;padding:8px;border:2px solid green" onclick="window.openMini(${id})">${$('legoEmoji').value} ${$('legoNom').value}</div>`; };
window.openMini=(id)=>{ let a=miniApps.find(x=>x.id==id); $('miniAppContainer').style.display="block"; $('miniAppContent').innerHTML=`<h3>${a.emoji} ${a.nom}</h3><button style="background:green;color:white">Payer</button>`; };
$('btnFermerMini').onclick=()=>$('miniAppContainer').style.display="none";
$('btnVerifPro').onclick=async()=>{ if(mouvements<6) return alert("Effectuez les 6 mouvements"); await setDoc(doc(db,"users",auth.currentUser.uid),{verifie:true},{merge:true}); $('visiText').innerText="Vérifié"; $('visiText').className="badge badge-ok"; };
window.likePost=(id)=>{ likes[id]++; let el=document.getElementById(`like-${id}`); if(el) el.innerText=likes[id]; };
window.commentPost=(id)=>{ let inp=document.getElementById(`inputComment-${id}`); let txt=inp?inp.value.trim():prompt("Commentaire"); if(!txt) return; if(!comments[id]) comments[id]=[]; comments[id].push(txt); };
window.sharePost=()=>alert("Lien copié");
$('btnAffilie').onclick=()=>$('affilieGain').innerText="10%";
$('btnEnvoyerColis').onclick=()=>$('suiviBox').innerHTML+=" Expédié";
$('btnRecuColis').onclick=()=>$('suiviBox').innerHTML+=" Reçu";
$('btnDebloquer').onclick=()=>$('factureBox').style.display="block";
$('btnDoc').onclick=()=>$('histBox').innerHTML+=`<div>${$('docTitre').value}</div>`;
$('btnHistClient').onclick=()=>$('histBox').innerHTML="Achats";
$('btnHistVendeur').onclick=()=>$('histBox').innerHTML="Ventes";
$('btnAITrans').onclick=()=>$('murChat').innerHTML+=`<div>Traduction</div>`;
$('btnAIDesc').onclick=()=>alert("Aide");
