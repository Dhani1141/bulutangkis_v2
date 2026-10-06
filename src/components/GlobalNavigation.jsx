import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Trophy } from 'lucide-react';
import BranchedMenu from './BranchedMenu';

export default function GlobalNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed top-6 left-6 z-50 hidden md:block">
      <BranchedMenu
        items={[
          {
            label: 'Navigasi',
            children: [
              { value: '/', label: 'Dashboard Utama', icon: Home },
              { value: '/history', label: 'History Kemenangan', icon: Trophy }
            ]
          }
        ]}
        defaultOpen={[0]}
        defaultActive={location.pathname}
        onSelect={(value) => navigate(value)}
        color="#e4e4e7"
        accentColor="#4f46e5"
        lineColor="rgba(255, 255, 255, 0.2)"
        width={240}
        rowHeight={36}
        indent={40}
        trunk={14}
        radius={10}
        lineWidth={1.5}
        fontSize={14}
        drawDuration={400}
        foldDuration={300}
      />
    </div>
  );
}
