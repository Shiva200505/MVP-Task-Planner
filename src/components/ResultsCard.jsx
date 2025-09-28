import useStore from '../store';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ChartsCard from './ChartsCard';

const InfoTile = ({ title, value }) => (
  <div className="bg-secondary p-4 rounded-lg text-center">
    <p className="text-sm text-muted-foreground">{title}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

export default function ResultsCard() {
  const { results } = useStore();
  const resultsRef = useRef(null);

  if (results.selectedTasks.length === 0) {
    return null;
  }

  const copyResults = () => {
    navigator.clipboard.writeText(JSON.stringify(results, null, 2));
  };

  const exportPdf = () => {
    const content = resultsRef.current;
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // First capture and add the results content
    html2canvas(content, {
      scale: 2,
      logging: false,
      useCORS: true,
      backgroundColor: '#ffffff'
    }).then(resultsCanvas => {
      const resultsImgData = resultsCanvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const resultsImgHeight = (resultsCanvas.height * imgWidth) / resultsCanvas.width;
      
      pdf.addImage(resultsImgData, 'PNG', 0, 0, imgWidth, resultsImgHeight);
      
      // Then capture and add the charts content
      const chartsElement = document.querySelector('.charts-container');
      if (chartsElement) {
        html2canvas(chartsElement, {
          scale: 2,
          logging: false,
          useCORS: true,
          backgroundColor: '#ffffff'
        }).then(chartsCanvas => {
          const chartsImgData = chartsCanvas.toDataURL('image/png');
          const chartsImgHeight = (chartsCanvas.height * imgWidth) / chartsCanvas.width;
          
          // Add a new page for charts
          pdf.addPage();
          pdf.addImage(chartsImgData, 'PNG', 0, 0, imgWidth, chartsImgHeight);
          pdf.save('optimal_task_set_with_visualizations.pdf');
        });
      } else {
        pdf.save('optimal_task_set.pdf');
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="col-span-2"
    >
      <Card>
        <CardHeader>
          <CardTitle>Optimal Task Set</CardTitle>
        </CardHeader>
        <CardContent ref={resultsRef}>
          <div className="flex flex-wrap gap-2 mb-4">
            {results.selectedTasks.map(task => (
              <Badge key={task.id} variant="secondary">{task.name}</Badge>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <InfoTile title="Total Value" value={results.totalValue} />
            <InfoTile title="Total Cost" value={`₹${results.totalCost}`} />
            <InfoTile title="Total Hours" value={`${results.totalHours}h`} />
            <InfoTile title="Total Skills" value={Object.values(results.totalSkills).reduce((a, b) => a + b, 0)} />
          </div>
          <div className="flex gap-4 mb-4">
            <Button onClick={exportPdf}>Export PDF</Button>
            <Button onClick={copyResults} variant="outline">Copy Results</Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
