import Home from './components/HomeComponent.js'
import Search from './components/SearchComponent.js'

export default async function router(path) {
  let htmlPath = '';

  if (path === '/profile') {
    const user = firebase.auth().currentUser;
    if (!user) {
      alert("Aby zobaczyć profil, musisz się zalogować.");
      location.hash = '/login';
      return { template: "<div>Przekierowywanie...</div>" };
    }
  }

  switch (path) {
    case '':
    case '/':
      return Home
    case '/search':
      return Search
    case '/profile':
      htmlPath = 'profile.html';
      break;
    case '/login':
      htmlPath = 'login.html';
      break;
    default:
      htmlPath = 'home.html';
  }

  const res = await fetch(htmlPath);
  const html = await res.text();

  return {
    template: `<div>${html}</div>`
  }
}
