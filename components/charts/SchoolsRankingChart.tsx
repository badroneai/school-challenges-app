
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell 
} from 'recharts';

interface SchoolsRankingChartProps {
  schools: { name: string; points: number }[];
}

const SchoolsRankingChart: React.FC<SchoolsRankingChartProps> = ({ schools }) => {
  // ترتيب المدارس تنازلياً حسب النقاط
  const sortedData = [...schools].sort((a, b) => b.points - a.points).slice(0, 5);

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={sortedData}
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" axisLine={false} tickLine={false} hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            axisLine={false} 
            tickLine={false} 
            width={100}
            tick={{ fontSize: 12, fontWeight: 'bold' }}
            orientation="right"
          />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            contentStyle={{ borderRadius: '8px', textAlign: 'right' }}
          />
          <Bar dataKey="points" name="النقاط" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20}>
            {sortedData.map((_, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={index === 0 ? '#0d9488' : '#6366f1'} // تمييز المركز الأول
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SchoolsRankingChart;
