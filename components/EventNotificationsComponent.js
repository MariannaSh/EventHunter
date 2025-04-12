export default {
  template: `
    <div class="notifications-box">
      <h3>Powiadomienia o wydarzeniach</h3>
      <p>Włącz powiadomienia, aby być na bieżąco z wydarzeniami w Twojej okolicy!</p>
      <button @click="enableNotifications" class="login-button notify-button">
        Włącz powiadomienia
      </button>
      <button @click="sendTestNotification" class="login-button">
        Wyślij testowe powiadomienie
      </button>
      <p v-if="message">{{ message }}</p>
    </div>
  `,
  data() {
    return {
      message: ''
    };
  },
  methods: {
    enableNotifications() {
      if (!('Notification' in window)) {
        this.message = 'Twoja przeglądarka nie obsługuje powiadomień.';
        return;
      }

      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          this.message = 'Powiadomienia włączone';
          this.subscribeToNotifications();
        } else {
          this.message = 'Nie zezwolono na powiadomienia';
        }
      });
    },

    subscribeToNotifications() {
      navigator.serviceWorker.ready.then((registration) => {
        const messaging = firebase.messaging();

        messaging.getToken({
          vapidKey: 'BN5-bL4pS7rEe92i6h45ohq4tUJua3K8qElhiNt6c7WBba0wJ711Uj29PIN14eqRDgSa56Dn81kgdVabaUExSXQ',
          serviceWorkerRegistration: registration
        })
          .then((currentToken) => {
            if (currentToken) {
              console.log('FCM Token:', currentToken);
              this.saveToken(currentToken);
            } else {
              console.log('Brak tokena FCM');
            }
          })
          .catch((err) => {
            console.error('Błąd przy pobieraniu tokena:', err);
          });

        messaging.onMessage((payload) => {
          console.log('Nowe powiadomienie:', payload);
          new Notification(payload.notification.title, {
            body: payload.notification.body,
            icon: '/icons/icon.png'
          });
        });
      });
    },

    async sendTestNotification() {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        navigator.serviceWorker.getRegistration().then(function(reg) {
          if (reg) {
            reg.showNotification('🎉 Testowe powiadomienie!', {
              body: 'To jest testowe powiadomienie push 🚀',
              icon: '/icons/icon.png',
              vibrate: [300, 100, 400]
            });
          } else {
            alert('Brak zarejestrowanego Service Workera');
          }
        });
      } else {
        alert('Powiadomienia zostały zablokowane');
      }
    },

    saveToken(token) {
      const user = firebase.auth().currentUser;
      if (user) {
        const db = firebase.firestore();
        db.collection("userTokens").doc(token).set({
          uid: user.uid,
          email: user.email,
          token: token,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
          console.log("Token zapisany w Firestore");
        }).catch(err => {
          console.error("Błąd zapisu tokena:", err);
        });
      }
    }
  }
};
