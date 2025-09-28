import Navbar from './components/Navbar';
import TaskForm from './components/TaskForm';
import ConstraintsForm from './components/ConstraintsForm';
import TaskTable from './components/TaskTable';
import AlgorithmSelector from './components/AlgorithmSelector';
import ResultsCard from './components/ResultsCard';
import ChartsCard from './components/ChartsCard';
import { ThemeProvider } from './contexts/ThemeProvider';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background text-foreground">
        <div className="p-4 bg-red-500 text-white">Debug: App is rendering</div>
        <Navbar />
        <main className="container mx-auto px-4 pt-20 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 flex flex-col gap-8">
              <TaskForm />
              <ConstraintsForm />
              <AlgorithmSelector />
            </div>
            <div className="lg:col-span-2 flex flex-col gap-8">
              <TaskTable />
              <ResultsCard />
              <ChartsCard />
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
