import { Share2, AlertTriangle, Mail, Globe, Heart, ExternalLink } from 'lucide-react';

export function Footer() {
  const shareText = encodeURIComponent(
    'RadarApoyoVE - Plataforma para conectar necesidades y voluntarios en Venezuela. Ayuda o pide ayuda: '
  );
  const shareUrl = encodeURIComponent(window.location.href);

  const handleShare = () => {
    const url = `https://wa.me/?text=${shareText}${shareUrl}`;
    window.open(url, '_blank');
  };

  return (
    <footer className="bg-white border-t border-gray-200 mt-8">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        {/* Llamado a compartir */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="font-medium text-indigo-900">Ayúdanos a correr la voz</p>
            <p className="text-sm text-indigo-700">
              Cuantas más personas conozcan el registro, más gente podrá ayudar o recibir ayuda.
            </p>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
          >
            <Share2 size={16} />
            Compartir por WhatsApp
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-100 pt-8">
          {/* Aviso legal y descripción */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-900">
              <Heart size={18} className="text-red-500" fill="currentColor" />
              <span className="font-bold">RadarApoyoVE</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Plataforma ciudadana y sin fines de lucro para conectar necesidades urgentes con
              voluntarios y recursos en Venezuela. La información es aportada por la comunidad y
              no está verificada por un equipo central: verifica siempre antes de actuar o
              compartir.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Ante una emergencia médica o de seguridad, llama primero a los organismos de
              rescate. Esta plataforma no sustituye a Protección Civil, Bomberos ni autoridades.
            </p>
            <div className="flex items-start gap-2 text-xs text-yellow-700 bg-yellow-50 p-3 rounded-lg">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <p>
                La información es aportada por la comunidad y no ha sido verificada; verifica siempre antes de difundirla. Usa esta información con criterio. Si encuentras datos incorrectos o sospechosos, evita contactar y reporta cuando sea posible.
              </p>
            </div>
          </div>

          {/* Contacto y enlaces */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contacto</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="flex items-center gap-2">
                <Mail size={14} />
                <a href="mailto:radarapoyove@gmail.com" className="hover:text-indigo-700">
                  radarapoyove@gmail.com
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Globe size={14} />
                <span>Iniciativa sin fines de lucro</span>
              </p>
            </div>

            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-2">
              Otras iniciativas
            </h4>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'Venezuela Reporta', url: 'https://venezuelareporta.org' },
                { name: 'Encuéntralos', url: 'https://encuentralos.org' },
                { name: 'Desaparecidos Terremoto', url: 'https://desaparecidosterremotovenezuela.com' },
                { name: 'Ayuda para Venezuela', url: 'https://ayudaparavenezuela.com' },
                { name: 'Terremoto Venezuela', url: 'https://terremotovenezuela.app' },
                { name: 'Rescate VE', url: 'https://rescate-ve.vercel.app' },
              ].map((init) => (
                <a
                  key={init.url}
                  href={init.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 hover:border-indigo-200 transition-colors"
                >
                  {init.name}
                  <ExternalLink size={12} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-8 pt-6 text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} RadarApoyoVE · Iniciativa ciudadana · Desarrollado por Diex Díaz</p>
        </div>
      </div>
    </footer>
  );
}
