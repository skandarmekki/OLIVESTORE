const map = L.map('map', { zoomControl: false }).setView([39.0, 35.0], 6);

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

let basket = [];
let purchasedItems = []; // Renamed from myAssets
let orderType = 'delivery';
let moneyType = 'TRY';
const rate = 10.50;

const items = [
    { id: 1, name: "Extra Virgin Olive Oil", size: "1L Glass", price: 350 },
    { id: 2, name: "Early Harvest Cold Pressed", size: "1L Glass", price: 480 },
    { id: 3, name: "Organic Reserve", size: "750ml", price: 520 },
    { id: 4, name: "Extra Virgin Bulk version", size: "5L Tin", price: 1950 }
];

function changeCountry(code) {
    document.querySelectorAll('.market-option').forEach(el => el.classList.remove('active'));
    document.getElementById(`btn-${code}`).classList.add('active');

    moneyType = (code === 'tn') ? 'TND' : 'TRY';

    // Just move the map, no dots/markers anymore
    if (code === 'tn') {
        map.flyTo([34.0, 9.0], 6, { duration: 1.5 });
    } else {
        map.flyTo([39.0, 35.0], 6, { duration: 1.5 });
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
    
    // Move items to the "Purchased" list
    purchasedItems = [...purchasedItems, ...basket];
    
    // Simple update to the "Order History" view
    document.getElementById('vault-count').innerText = purchasedItems.length;
    document.getElementById('vault-list').innerHTML = purchasedItems.map(i => `
        <div style="padding:8px 0; border-bottom:1px solid #222; font-size:0.75rem;">
            <span>${i.name}</span><br>
            <span style="color:#4CAF50; font-size:0.65rem;">Order Completed</span>
        </div>
    `).join('');
    
    basket = [];
    update();
    toggleCart();
    alert("Purchase Successful!");
}

window.onload = () => {
    showItems();
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('fade-out');
        map.invalidateSize();
    }, 2500);
};
