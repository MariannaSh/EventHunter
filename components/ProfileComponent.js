export default {
    template: `
      <div>
        <h2>Twój profil</h2>
        <p>Tutaj będą zapisane dane użytkownika.</p>
        <p>Zalogowany jako: {{ userEmail }}</p>
        <button @click="logout">Wyloguj się</button>
      </div>
    `,
    data() {
      return {
        userEmail: ''
      }
    },
    created() {
      const user = firebase.auth().currentUser;
      if (user) {
        this.userEmail = user.email;
      }
    },
    methods: {
      logout() {
        firebase.auth().signOut().then(() => {
          alert("Wylogowano!");
          location.hash = '/';
        });
      }
    }
  }
  