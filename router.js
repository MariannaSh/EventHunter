import Home from './components/HomeComponent.js'
import Search from './components/SearchComponent.js'
import Login from './components/LoginComponent.js'
import Profile from './components/ProfileComponent.js'
import Favorites from './components/FavoritesComponent.js'
import EventPhotos from './components/EventPhotosComponent.js'
import EventGallery from './components/SpecificEventPhotosComponent.js' 

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
      return Home;
    case '/search':
      return Search;
    case '/favorites':
      return Favorites;
    case '/profile':
      return Profile;
    case '/event-photos': 
      return EventPhotos; 
    case '/gallery':
      return EventGallery; 
    case '/login':
      return Login;
  }

  const res = await fetch(htmlPath);
  const html = await res.text();

  return {
    template: `<div>${html}</div>`
  }
}
