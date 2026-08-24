import PunchCard from '../punchCard/PunchCard';
import DashboardStats from './DashboardStats'
import { useAuthStore } from '@/store/auth.store'

function Dashboard() {
  const { user } = useAuthStore();
  const roleName = user?.role?.name
    ?.trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "_");

  const isEmployee =
    !!roleName &&
    roleName !== "super_admin" &&
    roleName !== "company_admin";

  console.log("ROLE NAME:", roleName);
  console.log("IS EMPLOYEE:", isEmployee);

  return (
    <div className='flex flex-col gap-4'>
      {/* sirf Employee ko punch-in punch-out show krega */}
      {isEmployee && <PunchCard />}
      <DashboardStats />
    </div>
  )
}

export default Dashboard
