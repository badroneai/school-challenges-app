
import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Area, AreaChart 
} from 'recharts';

interface PointsChartProps {
  data: { week: number; points: number }[];
}

const PointsChart: React.FC<PointsChartProps> = ({ data }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis 
            dataKey="week" 
            label={{ value: 'الأسبوع', position: 'insideBottom', offset: -5, fontSize: 12 }} 
            tick={{ fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', direction: 'rtl' }}
            labelFormatter={(value) => `الأسبوع ${value}`}
          />
          <Area 
            type="monotone" 
            dataKey="points" 
            stroke="#0d9488" 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#colorPoints)" 
            name="النقاط"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PointsChart;
