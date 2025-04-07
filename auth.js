window.login = async function () {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      alert("Zalogowano!");
      location.hash = '/profile';
    } catch (e) {
      alert("Błąd logowania: " + e.message);
    }
}
  
window.signup = async function () {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
      await firebase.auth().createUserWithEmailAndPassword(email, password);
      alert("Konto utworzone!");
      location.hash = '/profile';
    } catch (e) {
      alert("Błąd rejestracji: " + e.message);
    }
}
  
window.googleLogin = async function () {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      await firebase.auth().signInWithPopup(provider);
      alert("Zalogowano przez Google!");
      location.hash = '/profile';
    } catch (e) {
      alert("Błąd Google: " + e.message);
    }
}
  
window.logout = function () {
    firebase.auth().signOut().then(() => {
      alert("Wylogowano!");
      location.hash = '/';
    });
}

