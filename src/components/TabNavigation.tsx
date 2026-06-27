import { Heart, Users } from 'lucide-react';

type TabType = 'necesidades' | 'voluntarios';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex gap-2 mb-6">
      <button
        onClick={() => onTabChange('necesidades')}
        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
          activeTab === 'necesidades'
            ? 'bg-red-600 text-white shadow-lg'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <Heart size={20} />
        Necesidades
      </button>
      <button
        onClick={() => onTabChange('voluntarios')}
        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
          activeTab === 'voluntarios'
            ? 'bg-green-600 text-white shadow-lg'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <Users size={20} />
        Voluntarios
      </button>
    </div>
  );
}
