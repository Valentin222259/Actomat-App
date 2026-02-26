# Actomat App 📄🤖

[![CI Pipeline](https://github.com/valentin222259/Actomat-App/actions/workflows/ci.yml/badge.svg)](https://github.com/valentin222259/Actomat-App/actions)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Valentin222259_Actomat-App&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Valentin222259_Actomat-App)

Actomat is an advanced full-stack web application designed for processing and analyzing documents using Optical Character Recognition (OCR) and Artificial Intelligence. It effortlessly extracts text from images or scanned documents (supporting both **English** and **Romanian**) and processes the data using the Gemini AI API.

The project demonstrates a modern **Monorepo-style** architecture with a robust DevOps CI/CD pipeline, ensuring clear separation between client-side logic, server-side processing, and automated quality assurance.

---

## 🚀 Tech Stack

### Frontend (Client)
- **Framework:** React 18
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Build Tool:** Vite

### Backend (API & Processing)
- **Runtime:** Node.js
- **API Framework:** Express.js
- **OCR Engine:** Tesseract.js (with custom `eng` and `ron` trained data)
- **AI Integration:** Google Gemini API

### DevOps & Quality Assurance
- **CI/CD:** GitHub Actions (Parallel multi-job pipeline for Monorepo)
- **Code Quality & Security:** SonarCloud (Static Code Analysis, Security Hotspots detection)

---

## 📂 Project Structure

```text
actomat-app/
├── .github/workflows/            # Parallel CI/CD Pipeline configurations
├── actomat-frontend-tailwind/    # React + TypeScript Client application
├── actomat-node-backend/         # Node.js API, OCR Engine & Gemini Integration
├── sonar-project.properties      # SonarCloud Monorepo configuration
└── README.md
```

---

## ✨ Key Features

- **Advanced OCR:** Integrated Tesseract.js with highly accurate trained models for English and Romanian document scanning.
- **AI-Powered Analysis:** Utilizes the Google Gemini API to process and understand the extracted text.
- **Fast & Modern UI:** Built with React, typed with TypeScript, and styled rapidly with Tailwind CSS.
- **Automated Monorepo Pipeline (CI):** Custom GitHub Actions workflow that simultaneously installs, builds, and tests both the Frontend and Backend environments on every push.
- **Enterprise-Grade Security:** Continuous code quality and vulnerability scanning enforced by SonarCloud Quality Gates.

---

## 🎯 How It Works

1. **Upload:** User uploads an image (JPG, PNG) through the responsive React interface.
2. **Transfer:** The frontend securely sends the image payload to the Node.js API.
3. **Extraction:** The backend processes the image using Tesseract.js to extract raw text.
4. **AI Processing:** The extracted text can be formatted/analyzed using the Gemini API.
5. **Result:** The final data is sent back to the client where the user can copy or download it.

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/valentin222259/Actomat-App.git
cd Actomat-App
```

### 2. Frontend Setup

Open a terminal instance and run:

```bash
cd actomat-frontend-tailwind
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### 3. Backend Setup

Open a second terminal instance and run:

```bash
cd actomat-node-backend
npm install
node server.js
```

The backend will run on `http://localhost:5000` (or your configured port).

---

## 🔧 Environment Variables

To run the backend properly, create a `.env` file inside the `actomat-node-backend/` directory with the following keys:

```env
PORT=8000
NODE_ENV=development
GEMINI_API_KEY=AIzaSyBiYNLDvoExGGwtj_9kI_pCeY_N6fP1YyM
```

---

## 📋 Requirements

- Node.js >= 18.x (v20 recommended)
- npm >= 9.x
- Modern browser (Chrome, Firefox, Safari, Edge)

---

## 📝 License

MIT
