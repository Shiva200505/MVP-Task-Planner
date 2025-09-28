import useStore from '../store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSupportedAlgorithms, computeTheoreticalCost, complexityLabel } from '@/lib/algorithms';

export default function ChartsCard() {
  const { results, tasks, constraints } = useStore();

  const barChartData = (results.selectedTasks || []).map(task => ({
    name: task.name,
    Value: task.value,
    Cost: task.price,
  }));

  const skillTotals = results.totalSkills || {};
  const maxSkill = Math.max(5, ...Object.values(skillTotals).map(v => Number(v) || 0));
  const radarChartData = Object.keys(skillTotals).map(skill => ({
    subject: skill,
    A: skillTotals[skill],
    fullMark: maxSkill,
  }));

  const algorithms = getSupportedAlgorithms();
  const n = tasks.length;
  const complexityData = algorithms.map(name => ({
    name,
    label: complexityLabel(name),
    TheoreticalCost: computeTheoreticalCost(name, n, constraints),
  }));

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Visualizations</CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-center font-semibold mb-4">Value vs Cost</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} interval={0} />
              <YAxis label={{ value: 'Amount', angle: -90, position: 'insideLeft', offset: -5, style: { textAnchor: 'middle' } }} />
              <Tooltip />
              <Legend wrapperStyle={{ paddingTop: 10 }} />
              <Bar dataKey="Value" fill="#8884d8" />
              <Bar dataKey="Cost" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h3 className="text-center font-semibold mb-4">Skill Coverage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarChartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis />
              <Radar name="Skills" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="md:col-span-2">
          <h3 className="text-center font-semibold mb-4">Theoretical Time Cost by Algorithm (n={n})</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={complexityData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} />
              <YAxis 
                tickFormatter={(v) => (v >= 1e6 ? `${Math.round(v/1e6)}M` : v >= 1e3 ? `${Math.round(v/1e3)}k` : v)} 
                label={{ value: 'Theoretical Cost', angle: -90, position: 'insideLeft', offset: -5, style: { textAnchor: 'middle' } }}
              />
              <Tooltip formatter={(v) => Array.isArray(v) ? v : [v, 'TheoreticalCost']} labelFormatter={(l) => `${l} (${complexityData.find(x => x.name === l)?.label})`} />
              <Legend wrapperStyle={{ paddingTop: 20 }} />
              <Bar dataKey="TheoreticalCost" fill="#f59e0b" name="Theoretical Cost (relative)" />
            </BarChart>
          </ResponsiveContainer>
          {results?.algorithmInfo?.name && (
            <p className="text-center text-sm text-muted-foreground mt-2">Selected: {results.algorithmInfo.name} — {results.algorithmInfo.complexity}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
