const apiKey = 'lRzZwD7QXCGiqbjbsiaLV9HVIVZNCDnx';

const categories = [
  { name: 'Muzyka', param: 'music' },
  { name: 'Sport', param: 'sports' },
  { name: 'Teatr', param: 'arts' },
  { name: 'Rodzinne', param: 'family' },
  { name: 'Kluby', param: 'clubs' }
];

const EventCard = {
  props: ['event'],
  template: `
    <div class='card'>
      <img :src="event.images[0].url" alt="Event image" />
      <div class='card-content'>
        <h3>{{ event.name }}</h3>
        <p>{{ event._embedded?.venues?.[0]?.name || 'Nieznana lokalizacja' }}</p>
        <p>{{ event.dates.start.localDate }} {{ event.dates.start.localTime || '' }}</p>
        <a :href="event.url" target="_blank">Zobacz szczegóły</a>
      </div>
    </div>`
};

export default {
  components: { EventCard },
  data() {
    return {
      categoryData: categories.map(cat => ({
        name: cat.name,
        param: cat.param,
        events: [],
        loading: true
      })),
      featuredEvent: null,
      featuredIndex: 0,
      allEvents: [],
      interval: null
    };
  },
  mounted() {
    this.loadEvents();
    this.interval = setInterval(this.rotateFeatured, 5000);
  },
  beforeUnmount() {
    clearInterval(this.interval);
  },
  methods: {
    async loadEvents() {
      for (const cat of this.categoryData) {
        try {
          const res = await fetch(
            `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&classificationName=${cat.param}&countryCode=PL&size=10`
          );
          const data = await res.json();
          if (data._embedded?.events) {
            cat.events = data._embedded.events;
            this.allEvents.push(...data._embedded.events);
          }
        } catch (e) {
          console.error('Błąd:', e);
        } finally {
          cat.loading = false;
        }
      }
      if (this.allEvents.length > 0) {
        this.featuredEvent = this.allEvents[0];
      }
    },
    rotateFeatured() {
      if (this.allEvents.length === 0) return;
      this.featuredIndex = (this.featuredIndex + 1) % this.allEvents.length;
      this.featuredEvent = this.allEvents[this.featuredIndex];
    }
  },
  template: `
    <div>
      <div class="hero" v-if="featuredEvent" :style="{ backgroundImage: 'url(' + featuredEvent.images[0].url + ')' }">
        <div class="hero-content">
          <h1>{{ featuredEvent.name }}</h1>
          <p>{{ featuredEvent.dates.start.localDate }} • {{ featuredEvent._embedded?.venues?.[0]?.name || 'Nieznana lokalizacja' }}</p>
          <a :href="featuredEvent.url" target="_blank">Zobacz szczegóły</a>
        </div>
      </div>
      <div class='container'>
        <div v-for="cat in categoryData" :key="cat.name">
          <h2>{{ cat.name }}</h2>
          <div v-if="cat.loading">Ładowanie...</div>
          <div class='carousel' v-else>
            <EventCard v-for="event in cat.events" :key="event.id" :event="event" />
          </div>
        </div>
      </div>
    </div>
  `
};  