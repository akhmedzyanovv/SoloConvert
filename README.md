# SoloConvert

SoloConvert is a serverless web application for converting videos to GIFs directly in the browser using `ffmpeg.wasm`.

## Features

- **Serverless**: All video processing is performed client-side using WebAssembly.
- **Privacy-Focused**: Files are never uploaded to a server.
- **Responsive Design**: Works seamlessly on desktop and mobile devices.
- **Optimized Output**: Automatically handles resizing and frame rate adjustments to prevent memory issues on mobile.
- **PWA Support**: Installable as a native-like app on supported devices.

## Tech Stack

- **Core**: React, TypeScript, Vite
- **Processing**: ffmpeg.wasm
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/akhmedzyanovv/SoloConvert.git
   cd SoloConvert
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Rename `.env.local.example` to `.env.local` and configure SSL certificates. This is required for `SharedArrayBuffer` support in local development.

   You can generate locally trusted certificates using mkcert:
   ```bash
   mkcert -install
   mkcert localhost
   ```

   Update `.env.local` with the paths to your generated certificates:
   ```env
   VITE_SSL_CERT_PATH="./localhost.pem"
   VITE_SSL_KEY_PATH="./localhost-key.pem"
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## License

Distributed under the MIT License.