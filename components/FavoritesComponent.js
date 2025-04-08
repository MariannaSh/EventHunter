export default {
    data() {
      return {
        favorites: [],
        intervalId: null,
        now: Date.now()
      }
    },
    created() {
      const favs = JSON.parse(localStorage.getItem('favorites')) || []
      this.favorites = favs.sort((a, b) =>
        new Date(a.dates.start.dateTime) - new Date(b.dates.start.dateTime)
      )
      this.updateTime()
      this.intervalId = setInterval(this.updateTime, 1000)
    },
    beforeUnmount() {
      clearInterval(this.intervalId)
    },
    methods: {
      updateTime() {
        this.now = Date.now()
      },
      getTimeLeft(targetDate) {
        const diff = new Date(targetDate).getTime() - this.now
        if (diff <= 0) return null
        return {
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60)
        }
      },
      removeFromFavorites(eventId) {
        this.favorites = this.favorites.filter(e => e.id !== eventId)
        localStorage.setItem('favorites', JSON.stringify(this.favorites))
      }
    },
    template: `
      <div class="favorites-widget">
        <h1 class="favorites-heading">Nie przegap niczego, <br><span>odliczajmy razem do emocji!</span></h1>
  
        <div class="poster-list">
          <div
            v-for="event in favorites"
            :key="event.id"
            class="countdown-poster"
            :style="{ backgroundImage: 'url(' + event.images[0].url + ')' }"
          >
            <div class="overlay">
              <h2 class="event-title">{{ event.name }}</h2>
  
              <div v-if="getTimeLeft(event.dates.start.dateTime)" class="big-days">
                {{ getTimeLeft(event.dates.start.dateTime).days }}
                <div class="label-days">DNI</div>
              </div>
              <p v-else class="expired">Wydarzenie się rozpoczęło</p>
  
              <div class="time-details" v-if="getTimeLeft(event.dates.start.dateTime)">
                <div>{{ getTimeLeft(event.dates.start.dateTime).hours }}<span>h</span></div>
                <div>{{ getTimeLeft(event.dates.start.dateTime).minutes }}<span>m</span></div>
                <div>{{ getTimeLeft(event.dates.start.dateTime).seconds }}<span>s</span></div>
              </div>
  
              <a :href="event.url" target="_blank" class="details-link">Zobacz szczegóły</a>
  
              <button class="remove-button" @click="removeFromFavorites(event.id)">Usuń z ulubionych</button>
            </div>
          </div>
        </div>
      </div>
    `
  }
  