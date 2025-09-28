import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { runAlgorithmByName } from '@/lib/algorithms';

const sampleTasks = [
  { id: 'T1', name: 'UI Design', price: 3000, hours: 6, value: 8, skills: { D: 1, FE: 0, BE: 0, DevOps: 0, QA: 0 } },
  { id: 'T2', name: 'Landing Page', price: 4000, hours: 8, value: 10, skills: { D: 0, FE: 2, BE: 0, DevOps: 0, QA: 0 } },
  { id: 'T3', name: 'Auth Backend', price: 5500, hours: 10, value: 14, skills: { D: 0, FE: 0, BE: 2, DevOps: 0, QA: 0 } },
  { id: 'T4', name: 'DB Schema', price: 4500, hours: 7, value: 11, skills: { D: 0, FE: 0, BE: 1, DevOps: 0, QA: 0 } },
  { id: 'T5', name: 'CI/CD Setup', price: 3500, hours: 5, value: 9, skills: { D: 0, FE: 0, BE: 0, DevOps: 1, QA: 0 } },
  { id: 'T6', name: 'Cloud Deploy', price: 6000, hours: 9, value: 12, skills: { D: 0, FE: 0, BE: 1, DevOps: 1, QA: 0 } },
  { id: 'T7', name: 'Test Automation', price: 3000, hours: 6, value: 10, skills: { D: 0, FE: 0, BE: 0, DevOps: 0, QA: 2 } },
  { id: 'T8', name: 'Analytics & SEO', price: 2500, hours: 4, value: 6, skills: { D: 0, FE: 1, BE: 0, DevOps: 0, QA: 0 } },
];

const useStore = create(
  persist(
    (set) => ({
      tasks: sampleTasks,
      constraints: {
        maxBudget: 19000,
        maxHours: 40,
        minSkills: { D: 1, FE: 2, BE: 2, DevOps: 1, QA: 1 },
      },
      currentAlgorithm: null,
      results: {
        selectedTasks: [],
        totalValue: 0,
        totalCost: 0,
        totalHours: 0,
        totalSkills: { D: 0, FE: 0, BE: 0, DevOps: 0, QA: 0 },
      },
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, { ...task, id: `T${state.tasks.length + 1}` }] })),
      deleteTask: (id) => set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) })),
      setConstraints: (newConstraints) => set((state) => {
        const updated = { ...state, constraints: newConstraints };
        if (state.currentAlgorithm) {
          const result = runAlgorithmByName(state.tasks, newConstraints, state.currentAlgorithm);
          return { constraints: newConstraints, results: result };
        }
        return { constraints: newConstraints };
      }),
      runAlgorithm: (algorithm) => {
        set((state) => {
          const result = runAlgorithmByName(state.tasks, state.constraints, algorithm);
          return { results: result, currentAlgorithm: algorithm };
        });
      },
    }),
    {
      name: 'mvp-task-planner-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
);

export default useStore;
