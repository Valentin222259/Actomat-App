# Actomat App

Actomat is a full-stack web application designed to process and analyze documents using Optical Character Recognition (OCR). Ideally suited for extracting text from images or scanned documents in both English and Romanian.

This project demonstrates a modern Monorepo-style architecture, separating the client-side logic from the server-side processing capabilities.

## 🚀 Tech Stack

### Frontend
* **Framework:** React 18
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Build Tool:** Vite
* **Linting:** ESLint

### Backend
* **Runtime:** Node.js
* **API:** Express.js (implied)
* **OCR Engine:** Tesseract.js (Custom data models: `eng`, `ron`)

### Deployment
* **Configuration:** Vercel (`vercel.json`)

## 📂 Project Structure

The repository is organized into two main services:

```bash
├── actomat-frontend-tailwind/  # The React + TypeScript Client
├── actomat-node-backend/       # The Node.js API & OCR Engine
└── vercel.json                 # Deployment configuration
