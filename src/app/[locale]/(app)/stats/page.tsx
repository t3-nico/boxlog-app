import { redirect } from 'next/navigation';

/**
 * /stats → /stats/overview にリダイレクト
 */
const StatsPage = () => {
  redirect('stats/review');
};

export default StatsPage;
