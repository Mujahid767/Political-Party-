'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
interface Props { data: { category: string; amount: number; type: string }[] }
export default function FundChart({ data }: Props) {
  const grouped: Record<string,{category:string;income:number;expense:number}> = {};
  data.forEach(d => {
    if (!grouped[d.category]) grouped[d.category] = { category: d.category, income:0, expense:0 };
    if (d.type==='DONATION') grouped[d.category].income += d.amount;
    else grouped[d.category].expense += d.amount;
  });
  const chartData = Object.values(grouped);
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{top:0,right:0,left:0,bottom:0}}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f"/>
        <XAxis dataKey="category" tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false}/>
        <YAxis tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?(v/1000)+'k':v}/>
        <Tooltip contentStyle={{background:'#0d1f38',border:'1px solid #1e3a5f',borderRadius:8,color:'#e2e8f0'}}/>
        <Bar dataKey="income" fill="#10b981" radius={[4,4,0,0]} name="Donations"/>
        <Bar dataKey="expense" fill="#ef4444" radius={[4,4,0,0]} name="Expenses"/>
      </BarChart>
    </ResponsiveContainer>
  );
}
