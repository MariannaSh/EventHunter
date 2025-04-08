export default {
  data() {
    return {
      keyword: "",
      city: "",
      category: "",
      events: [],
      loading: false,
      searched: false,
      startDate: "",
      endDate: "",
      map: null,
      showMap: false
    };
  },
  template: `
    <div class='container'>
      <h1>Wyszukaj wydarzenia</h1>
      
      <input v-model="keyword" placeholder="Słowo kluczowe" />
      <input v-model="city" placeholder="Miasto" />
      <label>Od: <input type="date" v-model="startDate" /></label>
      <label>Do: <input type="date" v-model="endDate" /></label>

      <select v-model="category">
        <option value="">Wszystkie</option>
        <option value="music">Muzyka</option>
        <option value="sports">Sport</option>
        <option value="arts">Teatr</option>
        <option value="family">Rodzinne</option>
        <option value="clubs">Kluby</option>
      </select>

      <button @click="searchEvents">Szukaj</button>
      <button @click="searchNearbyEvents">Znajdź wydarzenia w pobliżu (GPS)</button>

      <div v-if="loading">Ładowanie...</div>

      <div class='carousel' v-else>
        <div v-for="event in filteredEvents" :key="event.id" class="card" :onFavorite="addToFavorites">
          <img :src="event.images[0].url" alt="Event image" />
          <div class='card-content'>
            <h3>{{ event.name }}</h3>
            <p>{{ event._embedded?.venues?.[0]?.name || 'Nieznana lokalizacja' }}</p>
            <p>{{ event.dates.start.localDate }} {{ event.dates.start.localTime || '' }}</p>
            <a :href="event.url" target="_blank">Zobacz szczegóły</a>
          </div>
        </div>
      </div>

      <div v-if="showMap" id="map" style="height: 400px; margin-top: 20px;"></div>
      <div v-if="!loading && filteredEvents.length === 0 && searched">Nie znaleziono wydarzeń.</div>
    </div>
  `,
  computed: {
    filteredEvents() {
      if (!this.startDate && !this.endDate) return this.events;
      return this.events.filter(e => {
        const date = e.dates.start.localDate;
        return (!this.startDate || date >= this.startDate) &&
               (!this.endDate || date <= this.endDate);
      });
    }
  },
  methods: {
    async searchEvents() {
      this.loading = true;
      this.searched = true;
      this.events = [];
      this.showMap = false;

      let url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=lRzZwD7QXCGiqbjbsiaLV9HVIVZNCDnx&size=20`;
      if (this.keyword) url += `&keyword=${this.keyword}`;
      if (this.city) url += `&city=${this.city}`;
      if (this.category) url += `&classificationName=${this.category}`;

      const res = await fetch(url);
      const data = await res.json();
      this.events = data._embedded?.events || [];
      this.loading = false;
    },
    async searchNearbyEvents() {
      if (!navigator.geolocation) return alert("Twoja przeglądarka nie obsługuje geolokalizacji.");

      this.loading = true;
      this.searched = true;
      this.events = [];
      this.showMap = true;

      navigator.geolocation.getCurrentPosition(async pos => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=lRzZwD7QXCGiqbjbsiaLV9HVIVZNCDnx&latlong=${lat},${lon}&radius=30&unit=km`;

        const res = await fetch(url);
        const data = await res.json();
        this.events = (data._embedded?.events || []).filter(event => {
          const loc = event._embedded?.venues?.[0]?.location;
          return loc?.latitude && loc?.longitude;
        });

        this.loading = false;
        this.renderMap(lat, lon);
      }, () => {
        alert("Nie udało się pobrać lokalizacji.");
        this.loading = false;
      });
    },

    async loadEvents() {
      },
      addToFavorites(event) {
        let favs = JSON.parse(localStorage.getItem('favorites')) || []
        if (!favs.some(e => e.id === event.id)) {
          favs.push(event)
          localStorage.setItem('favorites', JSON.stringify(favs))
          alert("Dodano do ulubionych!")
        } else {
          alert("To wydarzenie jest już w ulubionych.")
        }
      },
    },
    renderMap(centerLat = 50.061, centerLon = 19.937) {
      this.$nextTick(() => {
        if (!this.showMap) return;

        if (this.map) {
          this.map.remove();
        }

        this.map = L.map('map').setView([centerLat, centerLon], 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(this.map);

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(pos => {
            const userLat = pos.coords.latitude;
            const userLon = pos.coords.longitude;
            L.circleMarker([userLat, userLon], {
              radius: 8,
              fillColor: "blue",
              color: "#000",
              weight: 1,
              opacity: 1,
              fillOpacity: 0.6
            }).addTo(this.map).bindPopup("Tu jesteś").openPopup();
          });
        }

        for (const event of this.filteredEvents) {
          const loc = event._embedded?.venues?.[0]?.location;
          if (loc?.latitude && loc?.longitude) {
            L.marker([loc.latitude, loc.longitude])
              .addTo(this.map)
              .bindPopup(
                `<a href="${event.url}" target="_blank"><b>${event.name}</b><br>${event.dates.start.localDate}</a>`
              );
          }
        }
      });
    }
}
