# 📄 ShineCraft Letterhead Generator & Mail-Merge Tool

A modern full-stack web application for creating custom letterhead templates, managing mail-merge datasets, rendering pixel-perfect PDFs, and bulk-exporting merged documents.

> 📘 **Full Documentation**: See [PROJECT_DOCUMENTATION.md](file:///C:/Internship/Shine%20craft/template-merge-tool/PROJECT_DOCUMENTATION.md) for complete end-to-end architecture, API reference, keyboard shortcuts, and project history.

---

## ⚡ Quick Start (How to Run Docker, Backend & Frontend)

### 📋 Prerequisites
- **Node.js**: `v18.x` or higher
- **npm**: `v9.x` or higher
- **Docker Desktop**: Running locally

---

### 1️⃣ Step 1: Start Docker Container (Gotenberg PDF Engine)

```bash
# In project root directory
docker compose up -d
```
> Gotenberg runs on [http://localhost:3001](http://localhost:3001)

---

### 2️⃣ Step 2: Start Backend Server (NestJS API)

```bash
cd backend
npm install
npm run start:dev
```
> Backend API runs on [http://localhost:3005](http://localhost:3005)

---

### 3️⃣ Step 3: Start Frontend Application (React + Vite)

```bash
cd frontend
npm install
npm run dev
```
> Frontend Application runs on [http://localhost:5173](http://localhost:5173)

---

## 📊 Port Summary

| Service | Technology | URL | Port |
| :--- | :--- | :--- | :--- |
| **Frontend App** | React + Vite + TS | [http://localhost:5173](http://localhost:5173) | `5173` |
| **Backend API** | NestJS | [http://localhost:3005](http://localhost:3005) | `3005` |
| **PDF Renderer** | Gotenberg 8 (Docker) | [http://localhost:3001](http://localhost:3001) | `3001` |

---

## ✨ Key Features
- **TipTap Rich Text Editor** with table support, font styling, colors, and manual page breaks.
- **DOCX Template Importer** with automatic placeholder field detection.
- **Page Margins Setup** (MS Word style) in inches/cm.
- **Header & Footer Configuration** with address text or scaled image logo uploads.
- **Mail-Merge Data Table** with **`Enter` / `Tab` key navigation** to move seamlessly between fields.
- **Single & Paginated PDF Preview** powered by Gotenberg 8 & PDF.js.
- **Bulk Export** to ZIP archive or 1-click browser printing.
