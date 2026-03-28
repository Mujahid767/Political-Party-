'use client';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
interface Props { yes: number; no: number; abstain: number; }
export default function VoteChart({ yes, no, abstain }: Props) {
  const data = [
    { name:'Yes', value:yes, color:'#10b981' },
    { name:'No', value:no, color:'#ef4444' },
    { name:'Abstain', value:abstain, color:'#94a3b8' },
  ].filter(d=>d.value>0);
  if (data.length===0) return <p className="text-muted" style={{textAlign:'center',padding:'2rem'}}>No votes yet</p>;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
          {data.map((entry,i)=><Cell key={i} fill={entry.color}/>)}
        </Pie>
        <Tooltip contentStyle={{background:'#0d1f38',border:'1px solid #1e3a5f',borderRadius:8,color:'#e2e8f0'}}/>
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
