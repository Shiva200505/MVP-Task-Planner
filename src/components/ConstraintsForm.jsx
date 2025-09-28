import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import useStore from '../store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const schema = yup.object().shape({
  maxBudget: yup.number().positive().integer().required(),
  maxHours: yup.number().positive().integer().required(),
  minSkills: yup.object().shape({
    D: yup.number().min(0).integer(),
    FE: yup.number().min(0).integer(),
    BE: yup.number().min(0).integer(),
    DevOps: yup.number().min(0).integer(),
    QA: yup.number().min(0).integer(),
  }),
});

export default function ConstraintsForm() {
  const { constraints, setConstraints } = useStore();
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    resolver: yupResolver(schema),
    defaultValues: constraints,
  });

  // Keep form in sync when constraints in store change
  useEffect(() => {
    reset(constraints);
  }, [constraints, reset]);

  const onSubmit = (data) => {
    // Coerce numeric strings to numbers
    const coerceNumber = (v) => (typeof v === 'string' ? Number(v) : v);
    const next = {
      maxBudget: coerceNumber(data.maxBudget),
      maxHours: coerceNumber(data.maxHours),
      minSkills: {
        D: coerceNumber(data.minSkills?.D ?? 0),
        FE: coerceNumber(data.minSkills?.FE ?? 0),
        BE: coerceNumber(data.minSkills?.BE ?? 0),
        DevOps: coerceNumber(data.minSkills?.DevOps ?? 0),
        QA: coerceNumber(data.minSkills?.QA ?? 0),
      },
    };
    setConstraints(next);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Constraints</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="maxBudget">Max Budget (₹)</Label>
            <Input id="maxBudget" type="number" {...register('maxBudget')} />
            <p className="text-red-500 text-xs">{errors.maxBudget?.message}</p>
          </div>
          <div>
            <Label htmlFor="maxHours">Max Hours</Label>
            <Input id="maxHours" type="number" {...register('maxHours')} />
            <p className="text-red-500 text-xs">{errors.maxHours?.message}</p>
          </div>
          <div className="col-span-2 grid grid-cols-5 gap-2">
            {['D', 'FE', 'BE', 'DevOps', 'QA'].map(skill => (
              <div key={skill}>
                <Label htmlFor={`minSkills.${skill}`}>Min {skill}</Label>
                <Input id={`minSkills.${skill}`} type="number" {...register(`minSkills.${skill}`)} />
              </div>
            ))}
          </div>
          <div className="col-span-2">
            <Button type="submit" className="w-full">Apply Constraints</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
