const socket = io();

// Initialize the map centered at [0, 0] with zoom level 2
const map = L.map("map").setView([0, 0], 2);

// Add OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
    attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
}).addTo(map);

// Object to keep track of markers by user ID
const markers = {};

// Listen for location updates from other users
socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;

    // If the marker already exists, update its position
    if(markers[id]){
        markers[id].setLatLng([latitude, longitude]);
    }
    else{
        // Create a new marker for the user
        markers[id] = L.marker([latitude, longitude]).addTo(map)
            .bindPopup(`User: ${id}`)
            .openPopup();
    }
});

// Listen for user disconnections to remove their markers
socket.on("user-disconnected", (id) => {
    if(markers[id]){
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});

// Function to update user's own location
function updateOwnLocation(position){
    const { latitude, longitude } = position.coords;
    socket.emit("send-location", { latitude, longitude });

    // Optionally, center the map on the user's location
    map.setView([latitude, longitude], 16);

    // Add or update the user's own marker
    if(markers["you"]){
        markers["you"].setLatLng([latitude, longitude]);
    }
    else{
        markers["you"] = L.marker([latitude, longitude], { title: "You" }).addTo(map)
            .bindPopup("You are here")
            .openPopup();
    }
}

// Watch the user's geolocation
if(navigator.geolocation){
    navigator.geolocation.watchPosition(updateOwnLocation, (error)=>{
        console.error("Geolocation error:", error);
    },{
        enableHighAccuracy: true,
        timeout: 5,
        maximumAge: 0
    });
}
else{
    console.error("Geolocation is not supported by your browser.");
}
