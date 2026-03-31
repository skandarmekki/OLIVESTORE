const map = L.map('map', { zoomControl: false }).setView([39.0, 35.0], 6);

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

let basket = [];
let vaultStorage = []; 
let orderType = 'delivery'; 
let dots = []; 
let moneyType = 'TRY';
const rate = 10.50;

const items = [
    { id: 1, name: "Extra Virgin Olive Oil", size: "1L", price: 350 },
    { id: 2, name: "Early Harvest Cold Pressed", size: "1L", price: 480 },
    { id: 3, name: "Organic Reserve", size: "750ml", price: 520 },
    { id: 4, name: "Extra Virgin Bulk version", size: "5L", price: 1950 }
];

const trStores = [
    { name: "Istanbul Store", pos: [41.0082, 28.9784] },
    { name: "Izmir Store", pos: [38.4237, 27.1428] }
];

const tnStores = [
    { name: "Tunis Store", pos: [36.8065, 10.1815] },
    { name: "Monastir Store", pos: [35.7643, 10.8113] },
    { name: "Sfax Store", pos: [34.7406, 10.7603] }
];

function showDots(list) {
    dots.forEach(d => map.removeLayer(d));
    dots = [];
    list.forEach(store => {
        const marker = L.circleMarker(store.pos, { 
            radius: 9, 
            fillColor: "#d4af37", 
            color: "#fff", 
            weight: 2, 
            fillOpacity: 0.9 
        }).addTo(map).bindTooltip(store.name);
        dots.push(marker);
    });
}

function changeCountry(code) {
    document.querySelectorAll('.market-option').forEach(el => el.classList.remove('active'));
    const targetBtn = document.getElementById(`btn-${code}`);
    if (targetBtn) targetBtn.classList.add('active');

    moneyType = (code === 'tn') ? 'TND' : 'TRY';

    if (code === 'tn') {
        map.flyTo([34.0, 9.0], 6, { duration: 1.5 });
        showDots(tnStores);
    } else {
        map.flyTo([39.0, 35.0], 6, { duration: 1.5 });
        showDots(trStores);
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
    const shelf = document.getElementById('inventory-list');
    if (!shelf) return;
    shelf.innerHTML = items.map(p => `
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
    const selectedItem = items.find(p => p.id === id);
    if (selectedItem) {
        basket.push(selectedItem);
        update();
    }
}

function update() {
    const countEl = document.getElementById('cart-count');
    const listEl = document.getElementById('cart-items');
    const feeEl = document.getElementById('fee-amount');
    const totalEl = document.getElementById('cart-total');

    if (countEl) countEl.innerText = basket.length;
    
    if (listEl) {
        listEl.innerHTML = basket.map(i => `
            <div style="padding:12px; border-bottom:1px solid #222; display:flex; justify-content:space-between; font-size:0.85rem;">
                <span>${i.name}</span>
                <span class="gold">${format(i.price)}</span>
            </div>
        `).join('');
    }

    let fee = (orderType === 'delivery' && basket.length > 0) ? 50 : 0;
    if (feeEl) feeEl.innerText = format(fee);
    
    const subtotal = basket.reduce((sum, item) => sum + item.price, 0);
    if (totalEl) totalEl.innerText = format(subtotal + fee);
}

function toggleCart() {
    const shopView = document.getElementById('shop-view');
    const cartView = document.getElementById('cart-view');
    if (shopView && cartView) {
        shopView.classList.toggle('hidden');
        cartView.classList.toggle('hidden');
    }
    map.invalidateSize();
}

function setMethod(m) {
    orderType = m;
    const delBtn = document.getElementById('m-del');
    const pickBtn = document.getElementById('m-pick');
    const feeRow = document.getElementById('delivery-fee-row');

    if (delBtn) delBtn.className = (m === 'delivery' ? 'active' : '');
    if (pickBtn) pickBtn.className = (m === 'pickup' ? 'active' : '');
    if (feeRow) feeRow.style.display = (m === 'delivery' ? 'flex' : 'none');
    
    update();
}

function handleCheckout() {
    if (basket.length === 0) return;
    
    basket.forEach(item => {
        vaultStorage.push({
            ...item,
            origin: (moneyType === 'TRY' ? 'Turkey Store' : 'Tunisia Store')
        });
    });
    
    const vCount = document.getElementById('vault-count');
    const vList = document.getElementById('vault-list');

    if (vCount) vCount.innerText = vaultStorage.length;
    if (vList) {
        vList.innerHTML = vaultStorage.map(i => `
            <div style="padding:8px 0; border-bottom:1px solid #222; font-size:0.75rem;">
                <span>${i.name}</span><br>
                <span class="gold" style="font-size:0.65rem;">${i.origin}</span>
            </div>
        `).join('');
    }
    
    basket = [];
    update();
    toggleCart();
    alert("Order Confirmed.");
}

window.onload = () => {
    showItems();
    showDots(trStores);
    
    setTimeout(() => {
        const loader = document.getElementById('loading-screen');
        if (loader) loader.classList.add('fade-out');
        map.invalidateSize();
    }, 2000);
};
