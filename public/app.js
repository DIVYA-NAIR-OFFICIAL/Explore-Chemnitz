const map = L.map('map').setView([50.8323, 12.9253], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let placesData = [];   
let markers = [];     
const markersById = {}; 

function getToken() {
  return localStorage.getItem('token');
}

fetch('/api/places')
  .then(res => res.json())
  .then(places => {
    placesData = places;

    places.forEach(place => {
      if (!place.location?.lat || !place.location?.lng) return;

      const marker = L.marker([place.location.lat, place.location.lng]).addTo(map);
      const popupContent = `
        <strong>${place.name}</strong><br/>
        ${place.description || ''}<br/>
        <strong>Opening Hours:</strong> ${place.openingHours || 'Not available'}<br/>
        <strong>Tickets:</strong> ${place.tickets || 'N/A'}
      `;
      marker.bindPopup(popupContent);
      markers.push(marker);
      const key = place._id;
      markersById[key] = marker;
    });

    document.getElementById('map').style.display = 'block';
    document.getElementById('listView').style.display = 'none';
    loadFavoritesAndPopulateList();
  })
  .catch(console.error);

async function loadFavoritesAndPopulateList() {
  const token = getToken();
  if (!token) {
    populateListView([]);
    return;
  }

  try {
    const res = await fetch('/api/favorites', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch favorites');
    const favorites = await res.json();
    populateListView(favorites.map(f => f._id));
  } catch (err) {
    console.error(err);
    populateListView([]);
  }
}

function populateListView(favorites) {
  const listView = document.getElementById('listView');
  listView.innerHTML = '';
  const token = getToken();

  if (!token) {
    const msg = document.createElement('div');
    msg.style.color = 'red';
    msg.style.fontWeight = 'bold';
    msg.style.padding = '1em';
    msg.textContent = 'Please log in to view your favorite places.';
    listView.appendChild(msg);
    return;
  }

  const favoritePlaces = placesData.filter(p => favorites.includes(p._id));

  if (favoritePlaces.length === 0) {
    const noFavMsg = document.createElement('div');
    noFavMsg.textContent = 'You have not marked any places as favorite yet.';
    noFavMsg.style.padding = '1em';
    listView.appendChild(noFavMsg);
    return;
  }

  favoritePlaces.forEach(place => {
    const li = document.createElement('li');
    li.style.marginBottom = '1em';
    li.style.cursor = 'pointer';
    li.dataset.placeId = place._id;

    const star = document.createElement('span');
    star.textContent = '★';
    star.style.color = 'gold';
    star.style.marginRight = '8px';
    star.style.cursor = 'pointer';
    star.addEventListener('click', async e => {
      e.stopPropagation();
      await toggleFavorite(place._id, star);
      if (star.textContent === '☆') {
        li.remove();
        if (listView.children.length === 0) {
          const noFavMsg = document.createElement('div');
          noFavMsg.textContent = 'You have not marked any places as favorite yet.';
          noFavMsg.style.padding = '1em';
          listView.appendChild(noFavMsg);
        }
      }
    });

    const content = document.createElement('span');
    content.innerHTML = `
      <strong>${place.name}</strong><br/>
      ${place.description || ''}<br/>
      <strong>Opening Hours:</strong> ${place.openingHours || 'Not available'}<br/>
      <strong>Tickets:</strong> ${place.tickets || 'N/A'}
    `;

    li.appendChild(star);
    li.appendChild(content);

    li.addEventListener('click', () => {
      const marker = markersById[li.dataset.placeId];
      if (marker) {
        document.getElementById('viewToggle').value = 'map';
        document.getElementById('map').style.display = 'block';
        document.getElementById('listView').style.display = 'none';
        map.setView(marker.getLatLng(), 15);
        marker.openPopup();
      }
    });

    listView.appendChild(li);
  });
}

async function toggleFavorite(placeId, starElement) {
  const token = getToken();
  if (!token) {
    alert('Please log in to favorite places.');
    return;
  }

  const isFavorite = starElement.textContent === '★';

  try {
    if (isFavorite) {
      
      const res = await fetch(`/api/favorites/${placeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to remove favorite');
      starElement.textContent = '☆';
      starElement.style.color = 'gray';
    } else {
   
      const res = await fetch(`/api/favorites/${placeId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to add favorite');
      starElement.textContent = '★';
      starElement.style.color = 'gold';
    }
  } catch (err) {
    alert(err.message);
  }
}

document.getElementById('viewToggle').addEventListener('change', e => {
  const selected = e.target.value;
  const mapDiv = document.getElementById('map');
  const listView = document.getElementById('listView');

  if (selected === 'map') {
    mapDiv.style.display = 'block';
    listView.style.display = 'none';
    markers.forEach(m => !map.hasLayer(m) && m.addTo(map));
    if (placesData[0]?.location)
      map.setView([placesData[0].location.lat, placesData[0].location.lng], 13);
  } else {
    const token = getToken();
    if (!token) {
      alert('Please log in to view your favorite places.');
      e.target.value = 'map';
      return;
    }

    mapDiv.style.display = 'none';
    listView.style.display = 'block';
    markers.forEach(m => map.hasLayer(m) && map.removeLayer(m));
    loadFavoritesAndPopulateList();
  }
});

const searchInput = document.getElementById('searchInput');
const suggestionsContainer = document.createElement('div');
suggestionsContainer.classList.add('suggestions-container');

const parent = searchInput.parentNode;
if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
parent.appendChild(suggestionsContainer);


Object.assign(suggestionsContainer.style, {
  position: 'absolute',
  top: `${searchInput.offsetHeight}px`,
  left: '0',
  width: `${searchInput.offsetWidth}px`,
  zIndex: '1000',
  backgroundColor: 'white',
  border: '1px solid #ccc',
  boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
  maxHeight: '200px',
  overflowY: 'auto',
  display: 'none'
});

function showSuggestions(matches) {
  suggestionsContainer.innerHTML = '';
  if (matches.length === 0) return suggestionsContainer.style.display = 'none';

  matches.forEach(place => {
    const div = document.createElement('div');
    div.textContent = place.name;
    div.style.padding = '5px 10px';
    div.style.cursor = 'pointer';

    div.addEventListener('mousedown', e => {
      e.preventDefault();
      searchInput.value = place.name;
      suggestionsContainer.style.display = 'none';

      const key = place._id;
      const marker = markersById[key];
      if (marker) {
        document.getElementById('viewToggle').value = 'map';
        document.getElementById('map').style.display = 'block';
        document.getElementById('listView').style.display = 'none';
        map.setView(marker.getLatLng(), 15);
        marker.openPopup();
      }

      const listItems = document.querySelectorAll('#listView li');
      listItems.forEach(li => {
        if (li.textContent.includes(place.name)) {
          li.scrollIntoView({ behavior: 'smooth', block: 'center' });
          li.style.backgroundColor = '#ffff99';
          setTimeout(() => li.style.backgroundColor = '', 2000);
        }
      });
    });

    div.addEventListener('mouseenter', () => div.style.backgroundColor = '#eee');
    div.addEventListener('mouseleave', () => div.style.backgroundColor = '');

    suggestionsContainer.appendChild(div);
  });

  suggestionsContainer.style.display = 'block';
}

searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) return suggestionsContainer.style.display = 'none';

  const matches = placesData.filter(place =>
    place.name.toLowerCase().includes(query)
  );
  showSuggestions(matches);
});

document.addEventListener('click', e => {
  if (!suggestionsContainer.contains(e.target) && e.target !== searchInput) {
    suggestionsContainer.style.display = 'none';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const username = localStorage.getItem('username');
  const initialContainer = document.getElementById('user-initial-container');
  const initialDisplay = document.getElementById('user-initial');
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  if (username) {
    initialContainer.style.display = 'inline-block';
    initialDisplay.textContent = username[0].toUpperCase();
    loginBtn.style.display = 'none';
    registerBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
  } else {
    initialContainer.style.display = 'none';
    loginBtn.style.display = 'inline-block';
    registerBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
  }

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    location.reload();
  });
});
