export default {
  data() {
    return {
      events: [],
      loading: false,
      selectedCategory: '',
      startDate: '',
      endDate: '',
    };
  },
  mounted() {
    this.loadPastEvents();
  },
  methods: {
    async loadPastEvents() {
      this.loading = true;
      try {
        let url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=lRzZwD7QXCGiqbjbsiaLV9HVIVZNCDnx&startDateTime=1900-01-01T00:00:00Z&size=50&classificationName=${this.selectedCategory}`;

        if (this.startDate && this.endDate) {
          url += `&startDateTime=${this.startDate}T00:00:00Z&endDateTime=${this.endDate}T23:59:59Z`;
        }

        const res = await fetch(url);
        const data = await res.json();
        this.events = data._embedded?.events || [];
        console.log('Załadowane wydarzenia:', this.events);
      } catch (e) {
        console.error('Błąd ładowania wydarzeń:', e);
      } finally {
        this.loading = false;
      }
    },

    viewEventPhotos() {
      console.log('Przekierowanie do galerii...');
      location.hash = '/gallery';
    },

    async addUserPhoto() {
      const options = window.confirm('Chcesz zrobić zdjęcie teraz? Kliknij "OK" aby użyć kamery, lub "Anuluj" aby wybrać plik.');

      if (options) {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();

            const videoContainer = document.createElement('div');
            videoContainer.style.position = 'absolute';
            videoContainer.style.top = '50%';
            videoContainer.style.left = '50%';
            videoContainer.style.transform = 'translate(-50%, -50%)';
            document.body.appendChild(videoContainer);
            videoContainer.appendChild(video);

            const captureButton = document.createElement('button');
            captureButton.textContent = 'Zrób zdjęcie';
            captureButton.style.position = 'absolute';
            captureButton.style.bottom = '20px';
            captureButton.style.left = '50%';
            captureButton.style.transform = 'translateX(-50%)';
            videoContainer.appendChild(captureButton);

            captureButton.onclick = async () => {
              const canvas = document.createElement('canvas');
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              const context = canvas.getContext('2d');
              context.drawImage(video, 0, 0, canvas.width, canvas.height);
              const imageUrl = canvas.toDataURL('image/png');

              await this.uploadImageToCloudinary(imageUrl);
              await this.savePhotoToFirestore(imageUrl);

              video.srcObject.getTracks().forEach(track => track.stop());
              videoContainer.remove();
              alert('Zdjęcie zostało pomyślnie zrobione i załadowane!');
            };
          } catch (e) {
            alert('Błąd w dostępie do kamery: ' + e);
          }
        }
      } else {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';

        fileInput.onchange = async (e) => {
          const file = e.target.files[0];
          if (file) {
            const imageUrl = await this.uploadImageToCloudinary(file);
            await this.savePhotoToFirestore(imageUrl);
            alert('Zdjęcie zostało pomyślnie załadowane!');
            console.log('Załadowany URL zdjęcia:', imageUrl);
          }
        };

        fileInput.click();
      }
    },

    async savePhotoToFirestore(imageUrl) {
      try {
        const db = firebase.firestore();
        await db.collection('gallery').add({
          url: imageUrl,
          uploadedAt: new Date().toISOString()
        });
        console.log('Zdjęcie zapisane w Firestore');
      } catch (err) {
        console.error('Błąd zapisywania do Firestore:', err);
      }
    },

    async uploadImageToCloudinary(file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'EventHunter'); 
      formData.append('folder', 'event-photos');  

      const response = await fetch(`https://api.cloudinary.com/v1_1/dxogt6amu/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      return result.secure_url;
    }
  },

  template: `
  <div>
    <link rel="stylesheet" href="/pastevents.css" />
    <div class="header-container">
      <h2>Minione Wydarzenia</h2>
      <div class="filters-container">
        <select v-model="selectedCategory" @change="loadPastEvents" class="category-select">
          <option value="">Wszystkie</option>
          <option value="music">Muzyka</option>
          <option value="sports">Sport</option>
          <option value="arts">Sztuka</option>
          <option value="family">Rodzina</option>
          <option value="clubs">Kluby</option>
        </select>

        <div class="date-filters">
          <label for="startDate">Data początkowa</label>
          <input type="date" v-model="startDate" @change="loadPastEvents" />
          
          <label for="endDate">Data końcowa</label>
          <input type="date" v-model="endDate" @change="loadPastEvents" />
        </div>
      </div>
    </div>

    <div v-if="loading">Ładowanie...</div>

    <div v-else>
      <div class="event-card-container">
        <div v-for="event in events" :key="event.id" class="event-card">
          <img :src="event.images[0]?.url" alt="Obrazek wydarzenia" />
          <h3>{{ event.name }}</h3>
          <button @click="viewEventPhotos">Zobacz zdjęcia</button>
          <button @click="addUserPhoto">Dodaj zdjęcie</button>
        </div>
      </div>
    </div>
  </div>
  `
};
