import PunchCard from '../punchCard/PunchCard';
import DashboardStats from './DashboardStats'
import { useAuthStore } from '@/store/auth.store'

function Dashboard() {
  const { user } = useAuthStore();
  const isEmployee = !["super_admin", "company_admin"].includes(user?.role?.name ?? "");

  return (
    <div className='flex flex-col gap-4'>
      {/* sirf Employee ko punch-in punch-out show krega */}
      {isEmployee && <PunchCard />}
      <DashboardStats />
    </div>
  )
}

export default Dashboard
