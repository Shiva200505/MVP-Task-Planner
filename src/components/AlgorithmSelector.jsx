import useStore from '../store';
import { useEffect } from 'react';
import { getSupportedAlgorithms } from '@/lib/algorithms';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

const algorithms = getSupportedAlgorithms();

export default function AlgorithmSelector() {
  const runAlgorithm = useStore((state) => state.runAlgorithm);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(algorithms[0]);

  useEffect(() => {
    // Run default algorithm on mount so results/charts render immediately
    runAlgorithm(selectedAlgorithm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Algorithm</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Select onValueChange={setSelectedAlgorithm} defaultValue={selectedAlgorithm}>
          <SelectTrigger>
            <SelectValue placeholder="Select an algorithm" />
          </SelectTrigger>
          <SelectContent>
            {algorithms.map(alg => (
              <SelectItem key={alg} value={alg}>{alg}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => runAlgorithm(selectedAlgorithm)} className="w-full">Run Algorithm</Button>
      </CardContent>
    </Card>
  );
}
