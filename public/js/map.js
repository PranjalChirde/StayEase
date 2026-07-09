(() => {
    // Read the data attached to the window object
    const listing = window.mapData;
    
    if (!listing || !listing.coordinates) return;

    const lat = listing.coordinates.lat;
    const lng = listing.coordinates.lng;

    // Initialize map
    const map = L.map('map').setView([lat, lng], 13);

    // OpenStreetMap tiles
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Marker
    const marker = L.marker([lat, lng]).addTo(map);

    // Format price
    let priceStr = listing.price ? listing.price.toLocaleString('en-IN') : 'N/A';

    // Popup
    marker.bindPopup(`
        <b>${listing.title}</b><br>
        ${listing.location}, ${listing.country}<br>
        &#8377;${priceStr} /night
    `).openPopup();
})();
