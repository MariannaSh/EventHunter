export default {
    data() {
      return {
        email: '',
        password: ''
      }
    },
    template: `
    <div class="login-background">
        <div class="login-container">
        <h2>Zaloguj się</h2>
        <input type="email" v-model="email" placeholder="Email" class="login-input"><br>
        <input type="password" v-model="password" placeholder="Hasło" class="login-input"><br>
        
        <button @click="login" class="login-button">Zaloguj się</button>
        <div class="login-separator">lub</div>
        <button @click="googleLogin" class="login-google">
        <img src="https://images.icon-icons.com/729/PNG/512/google_icon-icons.com_62736.png" alt="Google icon" class="google-icon">
        Zaloguj przez Google
        </button>
        <p class="login-extra">
            Nie masz konta? <a href="#" @click.prevent="signup">Zarejestruj się</a>
        </p>
        </div>
    </div>
    `
,
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
  