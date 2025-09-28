import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import useStore from '../store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const schema = yup.object().shape({
  name: yup.string().required('Task name is required'),
  price: yup.number().positive().integer().required(),
  hours: yup.number().positive().integer().required(),
  value: yup.number().positive().integer().required(),
  skills: yup.object().shape({
    D: yup.number().min(0).integer().default(0),
    FE: yup.number().min(0).integer().default(0),
    BE: yup.number().min(0).integer().default(0),
    DevOps: yup.number().min(0).integer().default(0),
    QA: yup.number().min(0).integer().default(0),
  }),
});

export default function TaskForm() {
  const addTask = useStore((state) => state.addTask);
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    addTask(data);
    reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Task</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label htmlFor="name">Task Name</Label>
            <Input id="name" {...register('name')} />
            <p className="text-red-500 text-xs">{errors.name?.message}</p>
          </div>
          <div>
            <Label htmlFor="price">Price (₹)</Label>
            <Input id="price" type="number" {...register('price')} />
             <p className="text-red-500 text-xs">{errors.price?.message}</p>
          </div>
          <div>
            <Label htmlFor="hours">Hours</Label>
            <Input id="hours" type="number" {...register('hours')} />
             <p className="text-red-500 text-xs">{errors.hours?.message}</p>
          </div>
          <div>
            <Label htmlFor="value">Value</Label>
            <Input id="value" type="number" {...register('value')} />
             <p className="text-red-500 text-xs">{errors.value?.message}</p>
          </div>
          <div className="col-span-2 grid grid-cols-5 gap-2">
            {['D', 'FE', 'BE', 'DevOps', 'QA'].map(skill => (
              <div key={skill}>
                <Label htmlFor={`skills.${skill}`}>{skill}</Label>
                <Input id={`skills.${skill}`} type="number" defaultValue="0" {...register(`skills.${skill}`)} />
              </div>
            ))}
          </div>
          <div className="col-span-2">
            <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white">Add Task</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
