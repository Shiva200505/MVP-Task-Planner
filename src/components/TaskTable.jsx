import React, { useState } from 'react';
import useStore from '../store';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TaskTable() {
  const { tasks, deleteTask } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('name');
  const [taskToDelete, setTaskToDelete] = useState(null);

  const filteredTasks = tasks
    .filter(task => task.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (a[sortKey] < b[sortKey]) return -1;
      if (a[sortKey] > b[sortKey]) return 1;
      return 0;
    });

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Task List</CardTitle>
        <div className="flex gap-4 mt-2">
          <Input
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select onChange={(e) => setSortKey(e.target.value)} className="border rounded-md p-2">
            <option value="name">Sort by Name</option>
            <option value="value">Sort by Value</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Skills</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>{task.id}</TableCell>
                <TableCell>{task.name}</TableCell>
                <TableCell>₹{task.price}</TableCell>
                <TableCell>{task.hours}h</TableCell>
                <TableCell>{task.value}</TableCell>
                <TableCell>{Object.entries(task.skills).filter(([, v]) => v > 0).map(([k, v]) => `${k}:${v}`).join(', ')}</TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => setTaskToDelete(task)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Are you sure?</DialogTitle>
                        <DialogDescription>
                          This will permanently delete the task "{taskToDelete?.name}".
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setTaskToDelete(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={() => { deleteTask(task.id); setTaskToDelete(null); }}>Delete</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
