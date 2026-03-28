import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface Props {
  children: React.ReactNode;
  title: string;
  user: { name: string; role: string; email: string };
}

export default function DashboardLayout({ children, title, user }: Props) {
  return (
    <div className="dashboard-layout">
      <Sidebar user={user} />
      <div className="main-content">
        <TopBar title={title} user={user} />
        <div className="page-content animate-fade-in">{children}</div>
      </div>
    </div>
  );
}
