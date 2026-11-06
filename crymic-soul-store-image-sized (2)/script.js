/* CRYMIC SOUL storefront
   Update products, prices, WhatsApp number and Paystack public key in this file.
   Never put a Paystack SECRET key in frontend code. */
const STORE = {
  whatsapp: "2347018022431",
  paystackPublicKey: "pk_test_REPLACE_WITH_YOUR_PAYSTACK_PUBLIC_KEY",
  currency: "NGN"
};

const PRODUCTS = [
  {id:"military-zone-tee",name:"Military Zone Shirt",description:"White / Graphic print / Front & back",price:20000,image:"images/military-zone-tee.jpeg",type:"tee",tag:"DROP 001",sizes:["S","M","L","XL","XXL"],available:true},
  {id:"crymic-shorts",name:"CRYMIC SOUL Shorts",description:"Turquoise / Front & back views",price:30000,image:"images/crymic-shorts-front.jpeg",backImage:"images/crymic-shorts-back.jpeg",type:"shorts",tag:"LIMITED PIECE",sizes:["S","M","L","XL"],available:true}
];

const $ = (s) => document.querySelector(s);
const money = (n) => new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n);
const safe = (v) => String(v ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let cart = JSON.parse(localStorage.getItem("crymic_cart") || "[]").filter(x => PRODUCTS.some(p => p.id === x.id));
let toastTimer;

function showToast(message){
  const el=$("#toast"); el.textContent=message; el.classList.add("show");
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove("show"),2600);
}
function saveCart(){localStorage.setItem("crymic_cart",JSON.stringify(cart));renderCart();}
function productById(id){return PRODUCTS.find(p=>p.id===id);}
function itemCount(){return cart.reduce((n,x)=>n+x.qty,0);}
function cartTotal(){return cart.reduce((n,x)=>n+(productById(x.id)?.price||0)*x.qty,0);}
function renderProducts(){
  $("#productGrid").innerHTML=PRODUCTS.map(p=>{
    const price=p.price?money(p.price):"Price on request";
    const visual="";
    const image=p.backImage
      ? `<div class="product-photo-pair"><img src="${safe(p.image)}" alt="${safe(p.name)} front view"><img src="${safe(p.backImage)}" alt="${safe(p.name)} back view"></div>`
      : `<img class="${p.type==="tee"?"tee-product-photo":""}" src="${safe(p.image)}" alt="${safe(p.name)}">`;
    const actions=`<button class="small-action primary" data-add="${p.id}">Add to bag +</button><button class="small-action" data-enquire="${p.id}">Ask us</button>`;
    return `<article class="product-card"><button class="product-image product-image-button" type="button" data-add="${p.id}" aria-label="Choose size and add ${safe(p.name)} to bag">${visual}${image}<span class="product-tag">${safe(p.tag)}</span><span class="image-tap-hint">TAP TO ADD +</span></button><div class="product-info"><div><h3>${safe(p.name)}</h3><p>${safe(p.description)}</p></div><strong class="product-price">${price}</strong></div><div class="product-actions">${actions}</div></article>`;
  }).join("");
}
function renderCart(){
  $("#bagCount").textContent=itemCount(); $("#drawerCount").textContent=`(${itemCount()})`; $("#subtotal").textContent=money(cartTotal());
  if(!cart.length){$("#bagItems").innerHTML='<p class="empty-bag">Your bag is looking a little empty.<br>Find something that feels like you.</p>';}
  else $("#bagItems").innerHTML=cart.map((x,i)=>{
    const p=productById(x.id); if(!p)return "";
    return `<div class="bag-line"><div class="bag-thumb"><img src="${safe(p.image)}" alt=""></div><div><h3>${safe(p.name)}</h3><p>Size: ${safe(x.size)}</p><div class="quantity"><button data-qty="${i}" data-delta="-1" aria-label="Decrease quantity">−</button><span>${x.qty}</span><button data-qty="${i}" data-delta="1" aria-label="Increase quantity">+</button></div><button class="remove-item" data-remove="${i}">Remove</button></div><strong>${money(p.price*x.qty)}</strong></div>`;
  }).join("");
}
function openBag(){ $("#bagDrawer").classList.add("open");$("#drawerBackdrop").classList.add("open");$("#bagDrawer").setAttribute("aria-hidden","false");document.body.classList.add("locked");}
function closeBag(){ $("#bagDrawer").classList.remove("open");$("#drawerBackdrop").classList.remove("open");$("#bagDrawer").setAttribute("aria-hidden","true");document.body.classList.remove("locked");}
function openCheckout(){
  if(!cart.length){showToast("Your bag is empty.");return;}
  if(cart.some(x=>!productById(x.id)?.price)){showToast("Please remove enquiry-only items before online checkout.");return;}
  $("#checkoutSummary").innerHTML=cart.map(x=>{const p=productById(x.id);return `<div>${safe(p.name)} / ${safe(x.size)} × ${x.qty} — ${money(p.price*x.qty)}</div>`}).join("");
  $("#checkoutTotal").textContent=money(cartTotal()); $("#checkoutBackdrop").classList.add("open");closeBag();
}
function closeCheckout(){$("#checkoutBackdrop").classList.remove("open");}
function addProduct(id){
  const p=productById(id); if(!p||!p.price)return;
  const size=prompt(`Choose a size for ${p.name}: ${p.sizes.join(", ")}`);
  if(!size)return;
  const normalized=size.trim().toUpperCase();
  if(!p.sizes.includes(normalized)){showToast("Please choose one of the listed sizes.");return;}
  const existing=cart.find(x=>x.id===id&&x.size===normalized);
  if(existing)existing.qty++;else cart.push({id,size:normalized,qty:1});
  saveCart();showToast(`${p.name} added to your bag.`);
}
function orderText(customer={}){
  const lines=cart.map(x=>{const p=productById(x.id);return `• ${p.name} | Size ${x.size} | Qty ${x.qty} | ${money((p.price||0)*x.qty)}`}).join("\n");
  return `Hello CRYMIC SOUL! I'd like to place an order.\n\n${lines}\n\nSubtotal: ${money(cartTotal())}\n\nName: ${customer.name||""}\nEmail: ${customer.email||""}\nPhone: ${customer.phone||""}\nCity/State: ${customer.city||""}\nAddress: ${customer.address||""}\nNote: ${customer.note||"None"}\n\nPlease confirm delivery fee and availability.`;
}
function openWhatsApp(message){window.open(`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(message)}`,"_blank","noopener");}
function customerDetails(){const f=$("#checkoutForm");return Object.fromEntries(new FormData(f).entries());}
async function payWithPaystack(){
  const form=$("#checkoutForm");
  if(!form.reportValidity())return;
  if(!cart.length)return;
  const key=STORE.paystackPublicKey;
  if(!key||key.includes("REPLACE_WITH")){showToast("Paystack is not configured yet. Use WhatsApp or add your public key.");return;}
  const feedback=$("#checkoutFeedback");feedback.textContent="Preparing secure payment…";
  const customer=customerDetails();
  try{
    const response=await fetch("/.netlify/functions/create-payment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({customer,items:cart})});
    const data=await response.json();
    if(!response.ok||!data.authorization_url)throw new Error(data.error||"Could not start payment.");
    window.location.href=data.authorization_url;
  }catch(err){feedback.textContent=`Payment could not start: ${err.message}. You can still order through WhatsApp.`;}
}
function handlePaymentReturn(){
  const params=new URLSearchParams(location.search),ref=params.get("reference")||params.get("trxref");
  if(!ref)return;
  history.replaceState({},document.title,location.pathname);
  fetch(`/.netlify/functions/verify-payment?reference=${encodeURIComponent(ref)}`).then(r=>r.json()).then(data=>{
    if(data.status==="success"){cart=[];saveCart();alert("Payment confirmed. Thank you for shopping CRYMIC SOUL! Your reference is "+ref);}
    else alert("We could not confirm this payment yet. Please contact CRYMIC SOUL with reference: "+ref);
  }).catch(()=>alert("Payment was submitted. Please contact CRYMIC SOUL with your payment reference: "+ref));
}

$("#productGrid").addEventListener("click",e=>{
  const add=e.target.closest("[data-add]"),enq=e.target.closest("[data-enquire]");
  if(add)addProduct(add.dataset.add);
  if(enq){const p=productById(enq.dataset.enquire);openWhatsApp(`Hello CRYMIC SOUL! I'm interested in ${p.name}. Please share price, sizes and availability.`);}
});
$("#bagItems").addEventListener("click",e=>{
  const q=e.target.closest("[data-qty]"),r=e.target.closest("[data-remove]");
  if(q){const i=Number(q.dataset.qty);cart[i].qty+=Number(q.dataset.delta);if(cart[i].qty<1)cart.splice(i,1);saveCart();}
  if(r){cart.splice(Number(r.dataset.remove),1);saveCart();}
});
$("#openBag").addEventListener("click",openBag);$("#closeBag").addEventListener("click",closeBag);$("#drawerBackdrop").addEventListener("click",closeBag);
$("#checkoutButton").addEventListener("click",openCheckout);$("#closeCheckout").addEventListener("click",closeCheckout);
$("#checkoutBackdrop").addEventListener("click",e=>{if(e.target.id==="checkoutBackdrop")closeCheckout();});
$("#continueShopping").addEventListener("click",closeBag);
$("#payButton").addEventListener("click",payWithPaystack);
$("#whatsappCheckout").addEventListener("click",()=>{const form=$("#checkoutForm");if(!form.reportValidity())return;openWhatsApp(orderText(customerDetails()));});
$("#contactForm").addEventListener("submit",e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());openWhatsApp(`Hello CRYMIC SOUL!\nName: ${d.fullName}\nEmail: ${d.email}\nMessage: ${d.message}`);});
$("#menuToggle").addEventListener("click",()=>{const nav=$("#mainNav"),open=nav.classList.toggle("open");$("#menuToggle").setAttribute("aria-expanded",String(open));});
$("#mainNav").addEventListener("click",e=>{if(e.target.closest("a"))$("#mainNav").classList.remove("open");});
$("#year").textContent=new Date().getFullYear();
renderProducts();renderCart();handlePaymentReturn();
