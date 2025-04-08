export default {
  data() {
    return {
      favorites: [],
      intervalId: null,
      now: Date.now()
    }
  },
  created() {
    this.updateTime();
    this.intervalId = setInterval(this.updateTime, 1000);
  
    firebase.auth().onAuthStateChanged(async user => {
      if (user) {
        await this.loadFavorites();
      } else {
        console.warn("Użytkownik nie jest zalogowany.");
      }
    });
  },
  
  beforeUnmount() {
    clearInterval(this.intervalId);
  },
  methods: {
    updateTime() {
      this.now = Date.now();
    },
    getTimeLeft(targetDate) {
      const diff = new Date(targetDate).getTime() - this.now;
      if (diff <= 0) return null;
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      };
    },

    async loadFavorites() {
      const user = firebase.auth().currentUser;
      if (!user) return;
    
      const db = firebase.firestore();
      const docRef = db.collection("favorites").doc(user.uid);
    
      try {
        const doc = await docRef.get();
        const favs = doc.exists ? doc.data().items : [];
        this.favorites = favs.sort((a, b) =>
          new Date(a.dates.start.dateTime) - new Date(b.dates.start.dateTime)
        );
      } catch (err) {
        console.error("Błąd pobierania ulubionych z Firestore:", err);
      }
    },    

    async removeFromFavorites(eventId) {
      const user = firebase.auth().currentUser;
      if (!user) return;
    
      const db = firebase.firestore();
      const docRef = db.collection("favorites").doc(user.uid);
    
      try {
        const doc = await docRef.get();
        if (doc.exists) {
          const updated = doc.data().items.filter(e => e.id !== eventId);
          await docRef.set({ items: updated });
          await this.loadFavorites(); 
        }
      } catch (err) {
        console.error("Błąd usuwania z Firestore:", err);
      }
    }    
  },
  template: `
    <div class="favorites-widget">
      <h1 class="favorites-heading">
        Nie przegap niczego, <br><span>odliczajmy razem do emocji!</span>
      </h1>

      <div v-if="favorites.length === 0" class="no-favorites">
        <p>Nie masz jeszcze żadnych ulubionych wydarzeń </p>
      </div>

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

            <button class="remove-button" @click="removeFromFavorites(event.id)">
              Usuń z ulubionych
            </button>
          </div>
        </div>
      </div>
    </div>
  `
}
