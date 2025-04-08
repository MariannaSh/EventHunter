export default {
    data() {
      return {
        email: '',
        password: ''
      }
    },
    template: `
      <div>
        <h2>Zaloguj się</h2>
        <input type="email" v-model="email" placeholder="Email"><br><br>
        <input type="password" v-model="password" placeholder="Hasło"><br><br>
  
        <button @click="login">Zaloguj się</button>
        <button @click="signup">Utwórz konto</button><br><br>
        <button @click="googleLogin">Zaloguj przez Google</button>
      </div>
    `,
    methods: {
      async login() {
        try {
          await firebase.auth().signInWithEmailAndPassword(this.email, this.password);
          alert("Zalogowano!");
          location.hash = '/profile';
        } catch (e) {
          alert("Błąd logowania: " + e.message);
        }
      },
      async signup() {
        try {
          await firebase.auth().createUserWithEmailAndPassword(this.email, this.password);
          alert("Konto utworzone!");
          location.hash = '/profile';
        } catch (e) {
          alert("Błąd rejestracji: " + e.message);
        }
      },
      async googleLogin() {
        const provider = new firebase.auth.GoogleAuthProvider();
        try {
          await firebase.auth().signInWithPopup(provider);
          alert("Zalogowano przez Google!");
          location.hash = '/profile';
        } catch (e) {
          alert("Błąd Google: " + e.message);
        }
      }
    }
  }
  