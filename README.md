# 🎟️ EventHunter – Event Discovery Web App

**EventHunter** is a lightweight web application built with Vue 3 that allows users to search for events in their area, view event details, add events to favorites, and share event photos. The project was developed in a two-layer architecture using external APIs and cloud services.

---

## 🔗 Demo

👉 You can test the app here:  
**[https://mariannash.github.io/EventHunter/](https://mariannash.github.io/EventHunter/)**

---

## ✨ Main Features

- Searching for events by category and date range (Ticketmaster API)  
- Adding events to favorites and viewing them in the “Favorites” section  
- Uploading photos from camera or files and storing them in the cloud  
- Viewing a photo gallery of user-submitted event images  
- Local (test) notifications and registration of FCM tokens  
- User authentication via Firebase Authentication  

---

## 🛠 Technologies Used

- **Vue 3** – component-based SPA with custom hash-based routing  
- **Firebase Authentication** – user login and session handling  
- **Firebase Firestore** – database for storing favorites, tokens, and photos  
- **Firebase Messaging** – push notification token registration  
- **Cloudinary** – cloud-based image storage  
- **Ticketmaster Discovery API** – live event data retrieval  

---

## ⚠️ Limitations

- The app uses the free version of Firebase Cloud Messaging, which **does not provide access to a server key**, so it is not possible to send actual push notifications from the backend.  
- As a workaround, **local test notifications** were implemented and work only in the browser –  
  **test notifications are only supported on Android devices** (due to FCM and Safari limitations on iOS).

---

## 👥 Authors

This project was developed as part of a university course by a team of 3 students.
