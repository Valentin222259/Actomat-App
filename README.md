# Actomat App

Actomat este o aplicație web full-stack pentru procesarea și analiza documentelor folosind Optical Character Recognition (OCR). Ideală pentru extragerea textului din imagini sau documente scanate în limba **engleză** și **română**.

Proiectul demonstrează o arhitectură modernă tip **Monorepo**, cu separarea logicii client-side de capacitățile server-side.

## 🚀 Stack Tehnologic

### Frontend
- **Framework:** React 18
- **Limbaj:** TypeScript
- **Styling:** Tailwind CSS
- **Build Tool:** Vite
- **Linting:** ESLint

### Backend
- **Runtime:** Node.js
- **Framework API:** Express.js
- **Motor OCR:** Tesseract.js (modele custom: `eng`, `ron`)

### Deployment
- **Platformă:** Vercel

## 📂 Structura Proiectului

```
actomat-app/
├── actomat-frontend-tailwind/    # Client React + TypeScript
├── actomat-node-backend/         # API Node.js & Motor OCR
└── vercel.json                   # Configurare deployment
```

## ⚙️ Instalare și Setup

### 1. Clonează repository-ul
```bash
git clone https://github.com/valentin222259/actomat-app.git
cd actomat-app
```

### 2. Setup Frontend
```bash
cd actomat-frontend-tailwind
npm install
npm run dev
```

Frontend-ul va fi disponibil la `http://localhost:5173` (Vite default port).

### 3. Setup Backend
```bash
cd ../actomat-node-backend
npm install
node server.js
```

Backend-ul va rula pe portul configurat (verifică `server.js` pentru detalii).

## ✨ Funcționalități Principale

- **UI Rapid și Modern:** Construit cu React și optimizat cu Vite pentru performanță maximă
- **OCR Avansat:** Integrare cu Tesseract.js cu modele antrenate pentru engleză și română
- **Full-Stack Integration:** Comunicare seamless între frontend și backend
- **Deployment Simplu:** Configurat pentru Vercel pentru deploy ușor

## 🎯 Cum Funcționează

1. **Utilizatorul încarcă o imagine** (JPG, PNG, etc.) prin interfața React
2. **Frontend trimite imaginea** la backend via API
3. **Backend procesează** imaginea cu Tesseract.js (OCR)
4. **Textul extras** este trimis înapoi și afișat în frontend
5. **Utilizatorul poate descărca** sau copia textul extras

## 📋 Cerințe Minime

- Node.js >= 14.x
- npm >= 6.x
- Browser modern (Chrome, Firefox, Safari, Edge)

## 🔧 Variabile de Mediu

Backend ar putea necesita variabile de mediu. Crează un fișier `.env` în `actomat-node-backend/`:

```
PORT=5000
NODE_ENV=development
```

## 📝 Licență

MIT

## 👨‍💻 Contribuții

Sunt binevenit pull requests și suggestions de îmbunătățiri!

## 📧 Contact

Pentru întrebări sau sugestii, deschide un issue pe GitHub.

---

**Made with ❤️ by Valentin**
