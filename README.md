# Actomat App

Actomat is a full-stack web application for processing and analyzing documents using Optical Character Recognition (OCR). Ideal for extracting text from images or scanned documents in **English** and **Romanian**.

The project demonstrates a modern **Monorepo-style** architecture, with clear separation between client-side logic and server-side processing capabilities.

## 🚀 Tech Stack

### Frontend
- **Framework:** React 18
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Build Tool:** Vite
- **Linting:** ESLint

### Backend
- **Runtime:** Node.js
- **API Framework:** Express.js
- **OCR Engine:** Tesseract.js (custom models: `eng`, `ron`)

### Deployment
- **Platform:** Vercel

## 📂 Project Structure

```
actomat-app/
├── actomat-frontend-tailwind/    # React + TypeScript Client
├── actomat-node-backend/         # Node.js API & OCR Engine
└── vercel.json                   # Deployment configuration
```

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/valentin222259/actomat-app.git
cd actomat-app
```

### 2. Frontend Setup
```bash
cd actomat-frontend-tailwind
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` (Vite default port).

### 3. Backend Setup
```bash
cd ../actomat-node-backend
npm install
node server.js
```

The backend will run on the configured port (check `server.js` for details).

## ✨ Key Features

- **Fast & Modern UI:** Built with React and optimized with Vite for maximum performance
- **Advanced OCR:** Integration with Tesseract.js with trained models for English and Romanian
- **Full-Stack Integration:** Seamless communication between frontend and backend
- **Easy Deployment:** Configured for Vercel for straightforward deployments

## 🎯 How It Works

1. **User uploads an image** (JPG, PNG, etc.) through the React interface
2. **Frontend sends the image** to backend via API
3. **Backend processes** the image with Tesseract.js (OCR)
4. **Extracted text** is sent back and displayed in the frontend
5. **User can download** or copy the extracted text

## 📋 Requirements

- Node.js >= 14.x
- npm >= 6.x
- Modern browser (Chrome, Firefox, Safari, Edge)

## 🔧 Environment Variables

The backend may require environment variables. Create a `.env` file in `actomat-node-backend/`:

```
PORT=5000
NODE_ENV=development
```

## 📝 License

MIT

## 👨‍💻 Contributing

Pull requests and improvement suggestions are welcome!

## 📧 Contact

For questions or suggestions, please open an issue on GitHub.

---

**Made with ❤️ by Valentin**
