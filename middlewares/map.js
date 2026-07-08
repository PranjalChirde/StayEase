if (listing.coordinates && listing.coordinates.lat && listing.coordinates.lng) { 

        const lat = listing.coordinates.lat
        const lng = listing.coordinates.lng 

        // Initialize map
        const map = L.map('map').setView([lat, lng], 13);

        // OpenStreetMap tiles
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
        }).addTo(map);

        // Marker
        const marker = L.marker([lat, lng]).addTo(map);

        // Popup
        marker.bindPopup(`
            <b><%= listing.title %></b><br>
            ₹<%= listing.price %>
        `).openPopup();

}