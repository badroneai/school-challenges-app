
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, Legend 
} from 'recharts';

interface ChallengesBarChartProps {
  completed: number;
  remaining: number;
}

const ChallengesBarChart: React.FC<ChallengesBarChartProps> = ({ completed, remaining }) => {
  const data = [
    { name: 'مكتملة', value: completed, color: '#10b981' },
    { name: 'متبقية', value: remaining, color: '#f59e0b' },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} />
          <Tooltip 
             cursor={{ fill: '#f3f4f6' }}
             contentStyle={{ borderRadius: '8px', textAlign: 'right' }}
          />
          <Bar dataKey="value" name="العدد" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChallengesBarChart;
