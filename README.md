# Vektor

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/HhmedHesham/vector)

Vektor is an artistic, intuitive web application that transforms your freehand drawings into clean, scalable SVG vector graphics. The application presents a minimalist, full-screen canvas, encouraging creative flow. A playful, floating toolbar provides essential tools: a customizable pen with adjustable stroke width and color, an eraser, undo/redo capabilities, and a one-click canvas clear.

The core magic lies in its ability to meticulously trace the user's drawing paths and convert them into a downloadable SVG file, perfect for designers, illustrators, and hobbyists. The entire experience is wrapped in a whimsical, illustrative design style, making the creative process both powerful and delightful.

## Key Features

-   **Freehand to SVG:** Instantly convert your drawings into clean, scalable SVG vector graphics.
-   **Intuitive Drawing Tools:** A simple toolbar with a pen, eraser, color picker, and stroke width slider.
-   **Full History Control:** Easily undo and redo your actions to perfect your creation.
-   **Canvas Management:** Clear the entire canvas with a single click to start fresh.
-   **Instant Export:** Download your artwork as an SVG file directly to your device.
-   **Fully Client-Side:** No server interaction needed. Everything runs in your browser for speed and privacy.
-   **Responsive Design:** A seamless experience on both desktop and mobile devices.

## Technology Stack

-   **Framework:** React (Vite)
-   **Styling:** Tailwind CSS with shadcn/ui components
-   **State Management:** Zustand
-   **Icons:** Lucide React
-   **Animation:** Framer Motion
-   **Deployment:** Cloudflare Workers & Pages

## Getting Started

Follow these instructions to get a local copy up and running for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later)
-   [Bun](https://bun.sh/)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/vektor_svg_drawer.git
    cd vektor_svg_drawer
    ```

2.  **Install dependencies:**
    ```sh
    bun install
    ```

3.  **Run the development server:**
    ```sh
    bun run dev
    ```

The application will be available at `http://localhost:3000`.

## Usage

1.  Open the application in your web browser.
2.  You will be greeted with a blank canvas and a toolbar.
3.  Select the **Pen** tool from the toolbar.
4.  Choose your desired **color** and adjust the **stroke width** using the slider.
5.  Click and drag on the canvas to draw.
6.  Use the **Undo** and **Redo** buttons to navigate through your drawing history.
7.  Use the **Eraser** tool to remove parts of your drawing.
8.  Click the **Clear** button to wipe the canvas clean.
9.  Once you are satisfied with your creation, click the **Export to SVG** button to download the file.

## Project Structure

-   `src/pages/HomePage.tsx`: The main application component that handles the canvas, drawing logic, and event listeners.
-   `src/components/Toolbar.tsx`: The UI component for the floating toolbar containing all drawing tools and actions.
-   `src/hooks/use-drawing-store.ts`: The central Zustand store that manages all application state, including paths, tool settings, and history.
-   `src/lib/svg-converter.ts`: A utility module responsible for converting the path data from the store into a valid SVG string.

## Deployment

This project is optimized for deployment on the Cloudflare network.

### Deploy with a single click

You can deploy your own version of Vektor to Cloudflare with the button below.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/HhmedHesham/vector)

### Manual Deployment

1.  **Build the application:**
    ```sh
    bun run build
    ```

2.  **Deploy to Cloudflare:**
    This command will build and deploy the application using the Wrangler CLI.
    ```sh
    bun run deploy
    ```

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.