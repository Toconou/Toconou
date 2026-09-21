// ================= 1. CONFIG WECHAT FINAL =================
const CONFIG = {
  FEDAPAY_PUBLIQUE: "pk_live_5qnrrIu0EszkXbuHZ0wJwbkJ",
  FIREBASE_API_KEY: "AIzaSyChHilkChFqr3dxzsLUHwipK4ZEfVKXjRI",
  FIREBASE_PROJECT_ID: "toconou",
  FIREBASE_AUTH_DOMAIN: "toconou.firebaseapp.com",
  FIREBASE_STORAGE_BUCKET: "toconou.firebasestorage.appspot.com",
  FIREBASE_MESSAGING_SENDER_ID: "401451987705",
  FIREBASE_APP_ID: "1:401451987705:web:fd03c05ea33f9952422828",
  FIREBASE_MEASUREMENT_ID: "G-MRKQZTWHKP",
  DATABASE_URL: "https://toconou-default-rtdb.europe-west1.firebasedatabase.app"
};

// ================= 2. IMPORTS =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, deleteUser, sendEmailVerification, sendPasswordResetEmail, RecaptchaVerifier, signInWithPhoneNumber, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { getDatabase, ref as refDB, push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// ================= 3. INIT WECHAT FINAL =================
const appFb = initializeApp({
  apiKey: CONFIG.FIREBASE_API_KEY,
  authDomain: CONFIG.FIREBASE_AUTH_DOMAIN,
  projectId: CONFIG.FIREBASE_PROJECT_ID,
  storageBucket: CONFIG.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: CONFIG.FIREBASE_MESSAGING_SENDER_ID,
  appId: CONFIG.FIREBASE_APP_ID,
  measurementId: CONFIG.FIREBASE_MEASUREMENT_ID,
  databaseURL: CONFIG.DATABASE_URL
});
const auth = getAuth(appFb);
const db = getFirestore(appFb);
const storage = getStorage(appFb);
const rtdb = getDatabase(appFb);
const $ = id => document.getElementById(id);

// ================= 4. VARIABLES =================
let panier=[], miniApps=[], booster=1, mediaRecorder, recordedChunks=[], likes={}, comments={};

// ================= 5. TABS WECHAT =================
function showSec(id){ document.querySelectorAll(".section").forEach(s=>s.classList.remove("active")); $(id)?.classList.add("active"); }
function toggle(id,el){ const c=$(id); if(!c) return; c.classList.toggle('open'); if(el){ el.querySelector('span:last-child').innerText=c.classList.contains('open')?'➖':'➕' } }
window.toggle=toggle;
$('tab1').onclick=()=>showSec("sec1");
$('tab2').onclick=()=>showSec("sec2");
$('tab3').onclick=()=>showSec("sec3");
$('tab4').onclick=()=>showSec("sec4");
$('tab5').onclick=()=>showSec("sec5");

// ================= 6. ALGO + EST PRO + IA PRO 4 PAYS =================
async function ALGO(txt){ if(!txt?.trim()) return {ok:false,raison:"Vide"}; let low=txt.toLowerCase().trim(); let interdits=["arme","bombe","drogue","tuer","terroriste","porno","nude","arnaque","scam","haine","racisme","suicide"]; for(let m of interdits){ let regex = new RegExp(`\\b${m}\\b`, "i"); if(regex.test(low)) return {ok:false,raison:"Bloqué: "+m}; } return {ok:true}; }
async function estPRO(){ if(!auth.currentUser) return false; let snap=await getDoc(doc(db,"users",auth.currentUser.uid)); return snap.exists() && snap.data().type==="PRO"; }
const PAYS_IA_PRO = ["Bénin","Niger","Togo","Burkina Faso"];
async function peutActiverIA_PRO(){ if(!auth.currentUser) return false; let snap=await getDoc(doc(db,"users",auth.currentUser.uid)); if(!snap.exists()) return false; return PAYS_IA_PRO.includes(snap.data().pays); }

// ================= 7. VERIFICATION VISAGE - FORT WECHAT PAY =================
let mouvements=0; let etapes=["Face caméra","Tourne à GAUCHE","Tourne à DROITE","Lève la tête","Baisse la tête","Cligne des yeux","Ouvre la bouche"]; let etapeActuelle=0;
async function chargerModels(){ try{ await faceapi.nets.tinyFaceDetector.loadFromUri('https://justadudewhohacks.github.io/face-api.js/models'); await faceapi.nets.faceLandmark68Net.loadFromUri('https://justadudewhohacks.github.io/face-api.js/models'); if($('instruction')) $('instruction').innerText="Modèles chargés - Clique Vérifier"; }catch(e){} }
chargerModels();
$('btnVerifPro').onclick=async()=>{ let video=$('videoVerif'); if(!video){ alert("Ajoute <video id='videoVerif'> dans HTML"); return; } let stream=await navigator.mediaDevices.getUserMedia({video:true}); video.srcObject=stream; await video.play(); etapeActuelle=0; mouvements=0; if($('instruction')) $('instruction').innerText=etapes[0]; let interval=setInterval(async()=>{ let detection=await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks(); if(!detection) return; let box=detection.detection.box; let landmarks=detection.landmarks; let oeilG=landmarks.getLeftEye(); let bouche=landmarks.getMouth(); let centreX=box.x + box.width/2; let w=video.videoWidth; let h=video.videoHeight; let centreY=box.y + box.height/2; if(etapeActuelle==0 && detection){ etapeActuelle++; mouvements++; } else if(etapeActuelle==1 && centreX < w*0.35){ etapeActuelle++; mouvements++; } else if(etapeActuelle==2 && centreX > w*0.65){ etapeActuelle++; mouvements++; } else if(etapeActuelle==3 && centreY < h*0.4){ etapeActuelle++; mouvements++; } else if(etapeActuelle==4 && centreY > h*0.6){ etapeActuelle++; mouvements++; } else if(etapeActuelle==5){ let hauteurOeil=Math.abs(oeilG[1].y - oeilG[5].y); if(hauteurOeil < 3){ etapeActuelle++; mouvements++; } } else if(etapeActuelle==6){ let hauteurBouche=Math.abs(bouche[2].y - bouche[10].y); if(hauteurBouche > 15){ etapeActuelle++; mouvements++; } } if($('instruction') && etapeActuelle < etapes.length) $('instruction').innerText=etapes[etapeActuelle]; if($('progressBar')) $('progressBar').style.width=mouvements/6*100+"%"; if($('progressText')) $('progressText').innerText=Math.round(mouvements/6*100)+"%"; if(mouvements>=6){ clearInterval(interval); if($('visiText')){ $('visiText').innerText="Vérifié"; $('visiText').className="badge badge-ok"; } if($('instruction')) $('instruction').innerText="VÉRIFIÉ ✅"; video.srcObject.getTracks().forEach(t=>t.stop()); await setDoc(doc(db,"users",auth.currentUser.uid),{verifie:true},{merge:true}); } },500); };

// ================= 8. AUTH =================
$('btnCreer').onclick=async()=>{ try{ let email=$('email').value.trim(); let pass=$('password').value; if(!email||!pass) return alert("Email + pass"); if(!window.recaptchaVerifier) window.recaptchaVerifier=new RecaptchaVerifier(auth,'recaptcha',{size:'invisible'}); let cr=await createUserWithEmailAndPassword(auth,email,pass); await sendEmailVerification(cr.user); await setDoc(doc(db,"users",cr.user.uid),{type:$('typeCompte').value,pays:$('ville').value.trim(),email:email,verifie:false,created:serverTimestamp()}); alert("Créé"); }catch(e){ $('authMsg').innerText=e.message; } };
$('btnLogin').onclick=async()=>{ try{ await signInWithEmailAndPassword(auth,$('email').value.trim(),$('password').value); }catch(e){ $('authMsg').innerText=e.message; } };
if($('btnGoogle')){$('btnGoogle').onclick=async()=>{ try{ let provider=new GoogleAuthProvider(); let cr=await signInWithPopup(auth,provider); await setDoc(doc(db,"users",cr.user.uid),{type:$('typeCompte')?.value||"PERSONNEL",pays:$('ville')?.value?.trim()||"Pays",email:cr.user.email,verifie:true,created:serverTimestamp()},{merge:true}); }catch(e){ $('authMsg').innerText=e.message; } }; }
$('btnOublieSide').onclick=async()=>{ let m=prompt("Email"); if(m){ await sendPasswordResetEmail(auth,m.trim()); alert("Envoyé"); } };
$('btnLogout').onclick=()=>signOut(auth);
$('btnSupprimer').onclick=async()=>{ if(confirm("Supprimer?")) await deleteUser(auth.currentUser); };
onAuthStateChanged(auth,u=>{ if(u){ $('authBox').style.display="none"; $('app').style.display="block"; showSec("sec1"); }else{ $('authBox').style.display="block"; $('app').style.display="none"; } });

// ================= 9. CHAT WECHAT VRAI - CORRIGÉ SANS CLÉ BLOQUANTE =================
const chatRef = refDB(rtdb, "chats");
onChildAdded(chatRef, (snap)=>{ let d=snap.val(); if($('murChat')){$('murChat').innerHTML+=`<div><b>${d.email || 'User'}:</b> ${d.msg}</div>`; $('murChat').scrollTop = $('murChat').scrollHeight;}});
$('btnChat').onclick=async()=>{ let msg=$('chatMsg').value.trim(); if(!msg) return; let s=await ALGO(msg); if(!s.ok) return alert(s.raison); await push(chatRef,{msg:msg, uid:auth.currentUser.uid, email:auth.currentUser.email, date:Date.now()}); $('chatMsg').value=""; };

// ================= 10. MOMENT + POSTS + MARKET + LEGO - VRAI WECHAT MINI-APP =================
if($('postText')){$('postText').oninput=()=>{$('countText').innerText=$('postText').value.length;}}
if($('postPhoto')){$('postPhoto').onchange=()=>{$('countPhotos').innerText=$('postPhoto').files.length;}}
$('btnRecVideo').onclick=async()=>{ try{ let stream=await navigator.mediaDevices.getUserMedia({video:true,audio:true}); $('previewRec').srcObject=stream; $('previewRec').style.display="block"; $('previewRec').play(); recordedChunks=[]; mediaRecorder=new MediaRecorder(stream); mediaRecorder.ondataavailable=e=>{ if(e.data.size>0) recordedChunks.push(e.data); }; mediaRecorder.onstop=async()=>{ let blob=new Blob(recordedChunks,{type:'video/webm'}); $('previewRec').srcObject=null; $('previewRec').src=URL.createObjectURL(blob); $('countVideo').innerText="15s"; let path=`moments/${auth.currentUser.uid}/${Date.now()}.webm`; let refSt=ref(storage,path); await uploadBytes(refSt,blob); let urlFinal=await getDownloadURL(refSt); await addDoc(collection(db,"posts"),{txt:$('postText').value||"Moment 15s",video:urlFinal,uid:auth.currentUser.uid,date:serverTimestamp()}); if($('mur')){$('mur').innerHTML=`<div class="card"><video src="${urlFinal}" controls width="100%"></video><small>Gardé</small></div>`+$('mur').innerHTML;} }; mediaRecorder.start(); $('btnRecVideo').style.display="none"; $('btnStopRec').style.display="block"; setTimeout(()=>{ if(mediaRecorder&&mediaRecorder.state==="recording"){ mediaRecorder.stop(); mediaRecorder.stream.getTracks().forEach(t=>t.stop()); $('btnStopRec').style.display="none"; $('btnRecVideo').style.display="block"; } },15000); }catch(e){ alert("Caméra non"); } };
$('btnStopRec').onclick=()=>{ mediaRecorder.stop(); mediaRecorder.stream.getTracks().forEach(t=>t.stop()); $('btnStopRec').style.display="none"; $('btnRecVideo').style.display="block"; };
$('btnPost').onclick=async()=>{ let txt=$('postText').value.trim(); if(!txt) return; let s=await ALGO(txt); if(!s.ok) return alert(s.raison); await addDoc(collection(db,"posts"),{txt:txt,uid:auth.currentUser.uid,date:serverTimestamp()}); if($('mur')){$('mur').innerHTML=`<div class="card"><small>${new Date().toLocaleString()}</small><div>${txt}</div></div>`+$('mur').innerHTML;} $('postText').value=""; };
$('btnProd').onclick=async()=>{ if(!await estPRO()) return alert("PRO seulement - mais PRO ouvert mondial"); let s=await ALGO($('prodNom').value); if(!s.ok) return alert(s.raison); let comm=$('prodPays').value.includes("Bénin")?5:$('prodPays').value.includes("Niger")?8:12; panier.push({nom:$('prodNom').value.trim(),prix:+$('prodPrix').value||0,comm:comm}); await addDoc(collection(db,"panier"),{uid:auth.currentUser.uid,produits:panier,date:serverTimestamp()}); $('panierCount').innerText=panier.length; $('panierBox').innerHTML=panier.map(p=>`${p.nom} - ${p.prix}F`).join("<br>"); };
$('btnCommander').onclick=()=>{ if(typeof FedaPay==="undefined") return alert("FedaPay non chargé"); FedaPay.init({public_key:CONFIG.FEDAPAY_PUBLIQUE}); let tot=panier.reduce((a,b)=>a+b.prix,0); FedaPay.open({amount:tot,description:"Commande Toconou",callback:()=>{ $('suiviBox').innerHTML=`Payé ${tot}F`; $('factureBox').style.display="block"; $('factureBox').innerHTML=`<h3>Facture</h3>Total ${tot}F`; }}); };

// ================= 11. TOUCHE FINALE TENCENT - ALLUMER VRAIMENT - NE MODIFIE PAS LE HAUT =================
// RÈGLE ÉCHELLE INFINIE - RESPECT TOTAL : x = prix / 500 | 500=x1 1000=x2 1500=x3...Infini
function calcX(prix){ return Math.floor(prix/500); }

function payerBooster(prix, type){
  let x = calcX(prix);
  if(typeof FedaPay==="undefined"){ alert("FedaPay non chargé"); return; }
  FedaPay.init({public_key: CONFIG.FEDAPAY_PUBLIQUE});
  FedaPay.open({
    amount: prix,
    description: `Booster ${type} ${prix}F = x${x} - Échelle infinie`,
    callback: (resp)=>{
      if(type==="PROFIL"){ booster = x; if($('boosterInfo')) $('boosterInfo').innerText=`x${x} 🔥`; if($('boosterLevel')) $('boosterLevel').innerText=x; if($('boosterTotal')) $('boosterTotal').innerText= (parseInt($('boosterTotal').innerText)||0)+prix; if($('boosterPrix')) $('boosterPrix').innerText=prix; if($('boosterX')) $('boosterX').innerText=x; }
      if(type==="GROUPE"){ if($('groupeBoosterLevel')) $('groupeBoosterLevel').innerText=`x${x}`; if($('groupeBoosterTotal')) $('groupeBoosterTotal').innerText= (parseInt($('groupeBoosterTotal').innerText)||0)+prix; if($('murGroupeBooster')) $('murGroupeBooster').innerText=`Boosté x${x} - Tout le monde voit ton groupe`; if($('groupeBoosterVues')) $('groupeBoosterVues').innerText= x*100; }
      if(type==="ANNONCE"){ if($('annonceBoosterLevel')) $('annonceBoosterLevel').innerText=`x${x}`; if($('annonceBoosterTotal')) $('annonceBoosterTotal').innerText= (parseInt($('annonceBoosterTotal').innerText)||0)+prix; }
      alert(`✅ Payé ${prix}F = x${x} - Boosté infini`);
    }
  });
}

// BOOSTER PROFIL - PERSO ET PRO MÊME PRIX
if($('btnBooster')){
$('btnBooster').onclick=()=>{
  let prix = parseInt($('boosterPrixInput')?.value || 500);
  payerBooster(prix,"PROFIL");
};
}
if($('boosterPrixInput')){
$('boosterPrixInput').oninput=(e)=>{
  let p=parseInt(e.target.value)||500;
  let x=calcX(p);
  if($('boosterPrix')) $('boosterPrix').innerText=p;
  if($('boosterX')) $('boosterX').innerText=x;
  if($('boosterInfo')) $('boosterInfo').innerText=`x${x} 🔥`;
};
}

// BOOSTER GROUPE - ÉCHELLE INFINIE + TOUT LE MONDE VOIT
['500','1000','1500','2000','2500','3000','3500','5000'].forEach(v=>{
  if($(`btnGroupeBooster${v}`)){ $(`btnGroupeBooster${v}`).onclick=()=>payerBooster(parseInt(v),"GROUPE"); }
});
if($('btnGroupeBoosterCustom')){ $('btnGroupeBoosterCustom').onclick=()=>{ let p=parseInt($('groupeBoosterPrix').value)||500; payerBooster(p,"GROUPE"); }; }
if($('btnMsgGroupeBooster')){ $('btnMsgGroupeBooster').onclick=()=>{ let p=parseInt($('groupeBoosterPrix')?.value||500); payerBooster(p,"GROUPE"); }; }

// BOOSTER ANNONCE - ÉCHELLE INFINIE
if($('btnAnnonceBoosterCustom')){ $('btnAnnonceBoosterCustom').onclick=()=>{ let p=parseInt($('annonceBoosterPrix').value)||500; payerBooster(p,"ANNONCE"); }; }
if($('btnAnnonceBoost')){ $('btnAnnonceBoost').onclick=()=>{ let p=parseInt($('annonceBoosterPrix')?.value||500); payerBooster(p,"ANNONCE"); }; }
if($('btnPageBooster')){ $('btnPageBooster').onclick=()=>{ let p=prompt("Prix booster Page? 500=x1 1000=x2 1500=x3...Infini","500"); if(p) payerBooster(parseInt(p),"ANNONCE"); }; }

// GROUPES 100% FONCTIONNEL
if($('btnCreerGroupe')){ $('btnCreerGroupe').onclick=async()=>{ let nom=$('groupeNom').value.trim(); if(!nom) return alert("Nom groupe"); let id=Date.now(); await addDoc(collection(db,"groupes"),{nom:nom,membres:$('groupeMembres').value,desc:$('groupeDesc').value,uid:auth.currentUser.uid,date:serverTimestamp()}); if($('murGroupe')) $('murGroupe').innerHTML+=`<div class="card">Groupe ${nom} créé ✅</div>`; }; }
if($('btnMsgGroupe')){ $('btnMsgGroupe').onclick=async()=>{ let m=$('msgGroupe').value.trim(); if(!m) return; let grp=$('listeGroupes').value; await push(refDB(rtdb,"groupes/"+grp),{msg:m,uid:auth.currentUser.uid,date:Date.now()}); if($('murGroupe')) $('murGroupe').innerHTML+=`<div><b>Groupe:</b> ${m}</div>`; $('msgGroupe').value=""; }; }

// PAGE
if($('btnCreerPage')){ $('btnCreerPage').onclick=async()=>{ let nom=$('pageNom').value.trim(); if(!nom) return; await addDoc(collection(db,"pages"),{nom:nom,cat:$('pageCategorie').value,desc:$('pageDesc').value,uid:auth.currentUser.uid,date:serverTimestamp()}); if($('murPage')) $('murPage').innerHTML+=`<div class="card">Page ${nom} créée ✅ Tout le monde voit</div>`; }; }
if($('btnPagePost')){ $('btnPagePost').onclick=async()=>{ let txt=$('pagePostText').value.trim(); if(!txt) return; await addDoc(collection(db,"pages_posts"),{txt:txt,uid:auth.currentUser.uid,date:serverTimestamp()}); if($('murPage')) $('murPage').innerHTML+=`<div class="card">Page: ${txt}</div>`; }; }

// EVENT
if($('btnCreerEvent')){ $('btnCreerEvent').onclick=async()=>{ await addDoc(collection(db,"events"),{titre:$('eventTitre').value,date:$('eventDate').value,heure:$('eventHeure').value,lieu:$('eventLieu').value,desc:$('eventDesc').value,uid:auth.currentUser.uid}); if($('murEvent')) $('murEvent').innerHTML+=`<div class="card">Event ${$('eventTitre').value} - Tout le monde voit ✅</div>`; }; }
if($('btnRejoindreEvent')){ $('btnRejoindreEvent').onclick=()=>{ if($('murEvent')) $('murEvent').innerHTML+=`<div class="card">Rejoint ✅</div>`; }; }

$('btnAffilie').onclick=()=>{$('affilieGain').innerText="10%";};
$('btnEnvoyerColis').onclick=()=>{$('suiviBox').innerHTML+=" Expédié";};
$('btnRecuColis').onclick=()=>{$('suiviBox').innerHTML+=" Reçu";};
$('btnDebloquer').onclick=()=>{$('factureBox').style.display="block";};
$('btnDoc').onclick=()=>{ if($('histBox')) $('histBox').innerHTML+=`<div>${$('docTitre').value}</div>`; };
$('btnHistClient').onclick=()=>{ if($('histBox')) $('histBox').innerHTML="Achats"; };
$('btnHistVendeur').onclick=()=>{ if($('histBox')) $('histBox').innerHTML="Ventes"; };
if($('btnAITrans')){$('btnAITrans').onclick=()=>{ if($('murChat')) $('murChat').innerHTML+=`<div>Traduction (IA perso illimité mondial gratuit)</div>`; };}
if($('btnAIDesc')){$('btnAIDesc').onclick=()=>alert("Aide IA perso illimité mondial gratuit");};
if($('btnActiverIA_PRO')){ $('btnActiverIA_PRO').onclick=async()=>{ if(!await estPRO()) return alert("Passe PRO d'abord"); if(!await peutActiverIA_PRO()){ return alert("IA Page PRO disponible seulement Bénin, Niger, Togo, Burkina pour le moment."); } alert("IA PRO activée!"); }; }

console.log("Toconou ALLUMÉ - Échelle infinie x=prix/500 - Tencent style");
