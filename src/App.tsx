import { useState, useRef } from 'react';
import { TabNavigation } from './components/TabNavigation';
import { NecesidadesView } from './components/NecesidadesView';
import { VoluntariosView } from './components/VoluntariosView';
import { ConfirmView } from './components/ConfirmView';
import { CreateResourceView } from './components/CreateResourceView';
import { HeroSection } from './components/HeroSection';
import { Footer } from './components/Footer';
import { useCache } from './hooks/useCache';
import { supabaseService } from './services/supabaseService';
import type { Necesidad, OfertaVoluntario } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<'necesidades' | 'voluntarios'>('necesidades');
  const [selectedNecesidad, setSelectedNecesidad] = useState<Necesidad | null>(null);
  const [currentView, setCurrentView] = useState<'main' | 'create' | 'confirm'>('main');
  const contentRef = useRef<HTMLDivElement>(null);

  const { data: necesidades, loading: loadingNecesidades, error: errorNecesidades } = useCache<Necesidad[]>(
    'necesidades',
    supabaseService.getNecesidades
  );

  const { data: ofertas, loading: loadingOfertas, error: errorOfertas } = useCache<OfertaVoluntario[]>(
    'ofertas',
    supabaseService.getOfertasVoluntarios
  );

  const { data: stats } = useCache(
    'stats',
    supabaseService.getStats,
    300000 // 5 minutos de caché para stats
  );

  const handleMarkResolved = (necesidad: Necesidad) => {
    setSelectedNecesidad(necesidad);
    setCurrentView('confirm');
  };

  const handleConfirmResolved = async () => {
    if (!selectedNecesidad) return;

    try {
      await supabaseService.markNecesidadResuelta(selectedNecesidad.id);
      localStorage.removeItem('necesidades');
      localStorage.removeItem('stats');
      setCurrentView('main');
      setSelectedNecesidad(null);
      window.location.reload();
    } catch (error) {
      alert('Error al marcar como resuelto');
      console.error(error);
    }
  };

  const handleCreateSuccess = () => {
    localStorage.removeItem('necesidades');
    localStorage.removeItem('ofertas');
    localStorage.removeItem('stats');
    setCurrentView('main');
    window.location.reload();
  };

  const handleScrollToContent = () => {
    const element = contentRef.current;
    if (element) {
      const headerOffset = 72;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  if (currentView === 'create') {
    return (
      <CreateResourceView
        onSuccess={handleCreateSuccess}
        onCancel={() => setCurrentView('main')}
      />
    );
  }

  if (currentView === 'confirm') {
    return (
      <ConfirmView
        expectedContact={selectedNecesidad?.punto?.contacto || ''}
        puntoName={selectedNecesidad?.punto?.nombre_punto || ''}
        onConfirm={handleConfirmResolved}
        onCancel={() => {
          setCurrentView('main');
          setSelectedNecesidad(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-[72px]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-indigo-900 text-white shadow-lg">
        <div className="max-w-[1200px] mx-auto px-4 h-[72px] flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span>🇻🇪</span>
              <span>RadarApoyoVE</span>
            </h1>
            <p className="text-xs text-indigo-200">
              Conectando necesidades con voluntarios en tiempo real
            </p>
          </div>
          <button
            onClick={() => setCurrentView('create')}
            className="flex items-center gap-2 px-4 py-2 text-sm sm:text-base font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shrink-0"
          >
            <span>+</span>
            <span className="hidden sm:inline">Publicar necesidad o voluntariado</span>
            <span className="sm:hidden">Publicar</span>
          </button>
        </div>
      </header>

      <HeroSection
        stats={stats || { centros_de_acopio: 0, personas_que_necesitan_ayuda: 0, necesidades_activas: 0, necesidades_resueltas: 0, voluntarios_activos: 0 }}
        onPublish={() => setCurrentView('create')}
        onViewList={handleScrollToContent}
      />

      <main ref={contentRef} className="max-w-[1200px] mx-auto px-4 py-6">
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'necesidades' ? (
          <>
            {loadingNecesidades && (
              <div className="text-center py-8 text-gray-500">Cargando necesidades...</div>
            )}
            {errorNecesidades && (
              <div className="text-center py-8 text-red-500">
                Error al cargar necesidades: {errorNecesidades.message}
              </div>
            )}
            {!loadingNecesidades && !errorNecesidades && necesidades && (
              <NecesidadesView necesidades={necesidades} onMarkResolved={handleMarkResolved} />
            )}
          </>
        ) : (
          <>
            {loadingOfertas && (
              <div className="text-center py-8 text-gray-500">Cargando voluntarios...</div>
            )}
            {errorOfertas && (
              <div className="text-center py-8 text-red-500">
                Error al cargar voluntarios: {errorOfertas.message}
              </div>
            )}
            {!loadingOfertas && !errorOfertas && ofertas && (
              <VoluntariosView ofertas={ofertas} />
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
