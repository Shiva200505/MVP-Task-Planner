# MVP Task Planner

The MVP Task Planner is a sophisticated React application designed to help project managers and teams optimize their MVP development process through intelligent task selection and resource allocation. It implements advanced constraint satisfaction algorithms to maximize project value while adhering to specified constraints like budget, time, and required skills.

## Features

- **Task Management**: Add, edit, and delete tasks with attributes like price, hours, value, and required skills.
- **Constraint Definition**: Specify project constraints such as maximum budget, maximum hours, and minimum required skills for different roles (e.g., Design, Frontend, Backend).
- **Algorithm-Based Task Selection**: Run different optimization algorithms to determine the optimal set of tasks that maximize value while respecting the defined constraints.
- **Results Visualization**: View the selected tasks in a table, along with a summary of the total value, cost, and hours.
- **Interactive Charts**: Visualize the distribution of skills and other metrics for the selected tasks.
- **Dark/Light Mode**: Toggle between dark and light themes for user comfort.
- **Persistent State**: The application state (tasks, constraints) is saved to local storage, so your data persists across sessions.
- **Export Results**: Export your task selection results as PDF for sharing with stakeholders.

## Tech Stack

This project is built with a modern frontend stack:

- **Framework**: [React](https://reactjs.org/) (v19) with [Vite](https://vitejs.dev/) for a fast development experience.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for utility-first styling.
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) for beautiful, accessible components based on Radix UI primitives.
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) for simple and powerful global state management.
- **Form Handling**: [React Hook Form](https://react-hook-form.com/) with [Yup](https://github.com/jquense/yup) for validation.
- **Visualization**: [Recharts](https://recharts.org/) for beautiful, interactive charts.
- **Icons**: [Lucide React](https://lucide.dev/) for a clean and consistent icon set.
- **Animations**: [Framer Motion](https://www.framer.com/motion/) for smooth UI animations and transitions.
- **PDF Export**: [jsPDF](https://github.com/parallax/jsPDF) and [html2canvas](https://github.com/niklasvh/html2canvas) for PDF generation.

## Project Structure

The `src` directory is organized as follows:

```
src/
├── components/         # Reusable UI components
│   ├── ui/             # Base components from shadcn/ui
│   ├── AlgorithmSelector.jsx
│   ├── ChartsCard.jsx
│   ├── ConstraintsForm.jsx
│   ├── Navbar.jsx
│   ├── ResultsCard.jsx
│   ├── TaskForm.jsx
│   └── TaskTable.jsx
├── contexts/           # React contexts (e.g., ThemeProvider)
├── lib/                # Utility functions (e.g., cn for classnames)
├── store.js            # Zustand store for global state
├── styles/             # Global styles
├── App.jsx             # Main application layout component
├── main.jsx            # Application entry point
└── index.css           # Global CSS and Tailwind directives
```

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v18 or higher)
- npm or your favorite package manager

### Installation

1.  Clone the repo:
    ```sh
    git clone https://github.com/Shiva200505/MVP-Task-Planner.git
    ```
2.  Navigate to the project directory:
    ```sh
    cd mvp-task-planner
    ```
3.  Install NPM packages:
    ```sh
    npm install
    ```

### Running the Application

To start the development server, run:

```sh
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## Available Scripts

In the project directory, you can run:

- `npm run dev`: Runs the app in development mode.
- `npm run build`: Builds the app for production to the `dist` folder.
- `npm run lint`: Lints the source code using ESLint.
- `npm run preview`: Serves the production build locally for preview.

## 🟢 Live Demo

Check out the deployed project here 👉 [[**Live Site**](https://your-deployed-link.com)](https://mvp-task-planner.vercel.app/)

