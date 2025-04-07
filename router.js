export default async function router(path) {
    let htmlPath = ''
    switch (path) {
      case '':
      case '#/':
        htmlPath = 'home.html'
        break
      case '#/profile':
        htmlPath = 'profile.html'
        break
      default:
        htmlPath = 'home.html' // безопасная дефолтная страница
    }
  
    const res = await fetch(htmlPath)
    const html = await res.text()
  
    return {
      template: `<div>${html}</div>`
    }
  }
  