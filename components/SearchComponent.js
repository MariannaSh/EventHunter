export default {
    data() {
      return {
        keyword: '',
        city: '',
        category: '',
        events: [],
        loading: false,
        searched: false
      };
    },
    methods: {
      async searchEvents() {
        this.loading = true;
        this.events = [];
        this.searched = true;
  
        let url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=lRzZwD7QXCGiqbjbsiaLV9HVIVZNCDnx`;
  
        if (this.keyword) url += `&keyword=${encodeURIComponent(this.keyword)}`;
        if (this.city) url += `&city=${encodeURIComponent(this.city)}`;
        if (this.category) url += `&classificationName=${encodeURIComponent(this.category)}`;
  
        try {
          const res = await fetch(url);
          const data = await res.json();
          if (data._embedded?.events) {
            this.events = data._embedded.events;
          }
        } catch (e) {
          console.error('Błąd:', e);
        } finally {
          this.loading = false;
        }
      }
    },
    template: `
      <div class='container'>
        <h1>Wyszukaj wydarzenia</h1>
        <input v-model="keyword" placeholder="Słowo kluczowe" />
        <input v-model="city" placeholder="Miasto" />
        <select v-model="category">
          <option value="">Wszystkie</option>
          <option value="music">Muzyka</option>
          <option value="sports">Sport</option>
          <option value="arts">Teatr</option>
          <option value="family">Rodzinne</option>
          <option value="clubs">Kluby</option>
        </select>
        <button @click="searchEvents">Szukaj</button>
  
        <div v-if="loading">Ładowanie...</div>
        <div class='carousel' v-else>
          <div v-for="event in events" :key="event.id" class="card">
            <img :src="event.images[0].url" alt="Event image" />
            <div class='card-content'>
              <h3>{{ event.name }}</h3>
              <p>{{ event._embedded?.venues?.[0]?.name || 'Nieznana lokalizacja' }}</p>
              <p>{{ event.dates.start.localDate }} {{ event.dates.start.localTime || '' }}</p>
              <a :href="event.url" target="_blank">Zobacz szczegóły</a>
            </div>
          </div>
        </div>
  
        <div v-if="!loading && events.length === 0 && searched">Nie znaleziono wydarzeń.</div>
      </div>
    `
  };
  