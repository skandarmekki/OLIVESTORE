const map = L.map('map', { zoomControl: false }).setView([39.0, 35.0], 6);

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

let basket = [];
let turkeyStores = [];
let tunisiaStores = [];
let orderType = 'delivery';
let dots = []; 
let moneyType = 'TRY';
const rate = 10.50;

const items = [
    { id: 1, name: "Extra Virgin Olive Oil", size: "1L ", price: 350 },
    { id: 2, name: "Early Harvest Cold Pressed", size: "1L", price: 480 },
    { id: 3, name: "Organic Reserve", size: "750ml", price: 520 },
    { id: 4, name: "Extra Virgin Bulk version", size: "5L", price: 1950 }
];

const trHubs = [
    { name: "Istanbul Store", pos: [41.0082, 28.9784] },
    { name: "Izmir Store", pos: [38.4237, 27.1428] }
];

const tnHubs = [
    { name: "Tunis Store", pos: [36.8065, 10.1815] },
    { name: "Monastir Store", pos: [35.7643, 10.8113] },
    { name: "Sfax Store", pos: [34.7406, 10.7603] }
];

function showDots(list) {
    dots.forEach(d => map.removeLayer(d));
    dots = [];
    list.forEach(h => {
        const d = L.circleMarker(h.pos, { 
            radius: 9, 
            fillColor: "#d4af37", 
            color: "#fff", 
            weight: 2, 
            fillOpacity: 0.9 
        }).addTo(map).bindTooltip(h.name);
        dots.push(d);
    });
}

function changeCountry(code) {
    document.querySelectorAll('.market-option').forEach(el => el.classList.remove('active'));
    document.getElementById(`btn-${code}`).classList.add('active');

    moneyType = (code === 'tn') ? 'TND' : 'TRY';

    if (code === 'tn') {
        map.flyTo([34.0, 9.0], 6, { duration: 1.5 });
        showDots(tnHubs);
    } else {
        map.flyTo([39.0, 35.0], 6, { duration: 1.5 });
        showDots(trHubs);
    }

    showItems();
    update();
}

function format(val) {
    if (moneyType === 'TND') {
        return (val / rate).toFixed(1) + " TND";
    }
    return val.toFixed(2) + " TRY";
}

function showItems() {
    const box = document.getElementById('inventory-list');
    box.innerHTML = items.map(p => `
        <div class="product-card">
            <small class="gold">XYZ PREMIUM</small>
            <h3 style="margin:5px 0">${p.name}</h3>
            <p style="font-size:0.8rem; color:#888;">${p.size}</p>
            <div style="margin-top:10px; font-weight:800;">${format(p.price)}</div>
            <button class="add-btn" onclick="add(${p.id})">ADD TO BASKET</button>
        </div>
    `).join('');
}

function add(id) {
    basket.push(items.find(p => p.id === id));
    update();
}

function update() {
    document.getElementById('cart-count').innerText = basket.length;
    const list = document.getElementById('cart-items');
    list.innerHTML = basket.map(i => `
        <div style="padding:12px; border-bottom:1px solid #222; display:flex; justify-content:space-between; font-size:0.85rem;">
            <span>${i.name}</span>
            <span class="gold">${format(i.price)}</span>
        </div>
    `).join('');

    let fee = (orderType === 'delivery' && basket.length > 0) ? 50 : 0;
    document.getElementById('fee-amount').innerText = format(fee);
    const total = basket.reduce((a, b) => a + b.price, 0);
    document.getElementById('cart-total').innerText = format(total + fee);
}

function toggleCart() {
    document.getElementById('shop-view').classList.toggle('hidden');
    document.getElementById('cart-view').classList.toggle('hidden');
}

function setMethod(m) {
    orderType = m;
    document.getElementById('m-del').className = (m === 'delivery' ? 'active' : '');
    document.getElementById('m-pick').className = (m === 'pickup' ? 'active' : '');
    document.getElementById('delivery-fee-row').style.display = (m === 'delivery' ? 'flex' : 'none');
    update();
}

function handleCheckout() {
    if (basket.length === 0) return;
    
    if (moneyType === 'TRY') {
        turkeyStores = [...turkeyStores, ...basket];
    } else {
        tunisiaStores = [...tunisiaStores, ...basket];
    }
    
    const totalInStores = turkeyStores.length + tunisiaStores.length;
    document.getElementById('vault-count').innerText = totalInStores;

    const trList = turkeyStores.map(i => `
        <div style="padding:8px 0; border-bottom:1px solid #222; font-size:0.75rem;">
            <span>${i.name}</span><br>
            <span class="gold" style="font-size:0.65rem;">Turkey Store</span>
        </div>
    `).join('');

    const tnList = tunisiaStores.map(i => `
        <div style="padding:8px 0; border-bottom:1px solid #222; font-size:0.75rem;">
            <span>${i.name}</span><br>
            <span class="gold" style="font-size:0.65rem;">Tunisia Store</span>
        </div>
    `).join('');

    document.getElementById('vault-list').innerHTML = trList + tnList;
    
    basket = [];
    update();
    toggleCart();
    alert("DONE.");
}

window.onload = () => {
    showItems();
    showDots(trHubs);
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('fade-out');
        map.invalidateSize();
    }, 2500);
};
