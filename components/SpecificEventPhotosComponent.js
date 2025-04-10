export default {
  data() {
    return {
      eventPhotos: [],
      loading: false,
    };
  },
  async mounted() {
    this.loading = true;
    try {
      const db = firebase.firestore();
      const snapshot = await db.collection('gallery').orderBy('uploadedAt', 'desc').get();
      this.eventPhotos = snapshot.docs.map(doc => doc.data().url);
      console.log('Loaded photo URLs from Firestore:', this.eventPhotos);
    } catch (error) {
      console.error('Error loading from Firestore:', error);
    } finally {
      this.loading = false;
    }
  },
  template: `
    <div class="photo-gallery">
    <link rel="stylesheet" href="/eventphotos.css" />
      <h2>Zobacz zdjęcia z wszystkich wydarzeń</h2>

      <div v-if="loading" class="loading-text">Ładowanie zdjęć...</div>

      <div v-else-if="eventPhotos.length > 0" class="photo-gallery-container">
        <div v-for="photo in eventPhotos" :key="photo" class="photo-card">
          <img :src="photo" alt="Zdjęcie z wydarzenia" />
        </div>
      </div>

      <div v-else>
        <p>Brak zdjęć do wyświetlenia.</p>
      </div>
    </div>
  `
};
