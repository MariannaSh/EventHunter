const apiKey = 'lRzZwD7QXCGiqbjbsiaLV9HVIVZNCDnx';

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-storage.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAkt4N57_1TZICX629Qzzvgk5WB72BOLdE",
  authDomain: "eventhunter-1a753.firebaseapp.com",
  projectId: "eventhunter-1a753",
  storageBucket: "eventhunter-1a753.firebasestorage.app",
  messagingSenderId: "933383023108",
  appId: "1:933383023108:web:063a192a0a2baa267fe351",
  measurementId: "G-EB3BCFZVNB"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export default {
  data() {
    return {
      events: [],
      loading: false,
      selectedCategory: '',
      startDate: '',
      endDate: '',
      eventPhotos: [],
      user: null,
    };
  },
  mounted() {
    this.loadPastEvents(); 

    onAuthStateChanged(auth, (user) => {
      this.user = user; 
      console.log('User:', this.user);  
    });
  },
  watch: {
    selectedCategory(newCategory) {
      this.loadPastEvents();
    },
    startDate(newStartDate) {
      this.loadPastEvents();
    },
    endDate(newEndDate) {
      this.loadPastEvents();
    }
  },
  methods: {
    async loadPastEvents() {
      this.loading = true;
      try {
        let url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&startDateTime=1900-01-01T00:00:00Z&size=50&classificationName=${this.selectedCategory}`;

        if (this.startDate && this.endDate) {
          url += `&startDateTime=${this.startDate}T00:00:00Z&endDateTime=${this.endDate}T23:59:59Z`;
        }

        const res = await fetch(url);
        const data = await res.json();

        console.log('Loaded events:', data);  

        if (data._embedded?.events) {
          this.events = data._embedded.events;
        } else {
          this.events = [];
        }
      } catch (e) {
        console.error('Error loading events:', e);
      } finally {
        this.loading = false;
      }
    },

    async loadEventPhotos(eventId) {
      try {
        const q = query(collection(db, 'event_photos'), where('eventId', '==', eventId));
        const photosSnapshot = await getDocs(q);

        if (photosSnapshot.empty) {
          this.eventPhotos = [];  
        } else {
          this.eventPhotos = photosSnapshot.docs.map(doc => doc.data().imageUrl);
        }
      } catch (error) {
        console.error('Error loading photos:', error);
      }
    },

    viewEventPhotos(event) {
      location.hash = `/past-event-photos/${event.id}`;
    },

    async addUserPhoto(eventId) {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*'; 

      fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          await this.uploadImageToFirebase(eventId, file);
        }
      };

      fileInput.click(); 
    },

    async uploadImageToFirebase(eventId, file) {
      const storageRef = ref(storage, `event_photos/${eventId}/${file.name}`);
      try {
        const snapshot = await uploadBytes(storageRef, file);
        const imageUrl = await getDownloadURL(snapshot.ref);
        console.log('Uploaded image URL:', imageUrl);

        await addDoc(collection(db, 'event_photos'), {
          eventId: eventId,
          imageUrl: imageUrl,
          createdAt: serverTimestamp(),
        });

        alert('Photo uploaded successfully!');
        this.loadEventPhotos(eventId);  
      } catch (error) {
        console.error('Error uploading photo:', error);
        alert('Error uploading photo.');
      }
    }
  },
  template: `
  <div>
    <h2>Past Events</h2>

    <!-- Category selection dropdown -->
    <select v-model="selectedCategory" @change="loadPastEvents" class="category-select">
      <option value="">All</option>
      <option value="music">Music</option>
      <option value="sports">Sports</option>
      <option value="arts">Arts</option>
      <option value="family">Family</option>
      <option value="clubs">Clubs</option>
    </select>

    <!-- Start Date selection -->
    <label for="startDate">Start Date</label>
    <input type="date" v-model="startDate" @change="loadPastEvents" />

    <!-- End Date selection -->
    <label for="endDate">End Date</label>
    <input type="date" v-model="endDate" @change="loadPastEvents" />

    <!-- Loading indicator -->
    <div v-if="loading">Loading...</div>

    <!-- Event display -->
    <div v-else>
      <div v-for="event in events" :key="event.id" class="event-card">
        <img :src="event.images[0]?.url" alt="Event image" />
        <h3>{{ event.name }}</h3>
        <button @click="viewEventPhotos(event)">View Photos</button>
        <button @click="addUserPhoto(event.id)">Add Photo</button> <!-- Add Photo button -->
      </div>
    </div>

    <!-- Display event photos -->
    <div v-if="eventPhotos.length > 0">
      <h3>Uploaded Photos:</h3>
      <div v-for="photo in eventPhotos" :key="photo" class="photo-card">
        <img :src="photo" alt="Event Photo" />
      </div>
    </div>
    <div v-else>
      <p>No photos available for this event.</p>
    </div>
  </div>
  `
};
