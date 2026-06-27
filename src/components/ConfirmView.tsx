import { useState } from 'react';
import { ArrowLeft, Shield } from 'lucide-react';

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 0) return '';

  const hasPlus = value.trim().startsWith('+');
  if (hasPlus || digits.length > 10) {
    const country = digits.slice(0, 2);
    const rest = digits.slice(2);
    if (rest.length <= 3) return `+${country} ${rest}`;
    if (rest.length <= 7) return `+${country} ${rest.slice(0, 3)}-${rest.slice(3)}`;
    return `+${country} ${rest.slice(0, 3)}-${rest.slice(3, 7)}-${rest.slice(7, 11)}`;
  }

  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4, 11)}`;
}

function normalizePhone(value: string): string {
  return value.replace(/\D/g, '');
}

interface ConfirmViewProps {
  expectedContact: string;
  puntoName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmView({ expectedContact, puntoName, onConfirm, onCancel }: ConfirmViewProps) {
  const [inputContact, setInputContact] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedInput = normalizePhone(inputContact);
    const normalizedExpected = normalizePhone(expectedContact);

    if (normalizedExpected.length > 3 && normalizedInput !== normalizedExpected) {
      setError('El número de contacto no coincide con el registrado para este punto.');
      return;
    }

    if (inputContact.trim().length === 0) {
      setError('Debes ingresar el número de contacto del punto.');
      return;
    }

    setError('');
    onConfirm();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900 font-medium"
          >
            <ArrowLeft size={20} />
            <span>Volver</span>
          </button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={24} className="text-red-600" />
            <h1 className="text-xl font-bold text-gray-800">Confirmar acción</h1>
          </div>

          <p className="text-gray-700 mb-6">
            Estás marcando como <strong>resuelta</strong> una necesidad del punto{' '}
            <strong className="break-all">{puntoName}</strong>. Para evitar borrados malintencionados, confirma el número de contacto del punto.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="contacto" className="block text-sm font-medium text-gray-700 mb-1">
                Número de contacto del punto
              </label>
              <input
                id="contacto"
                type="tel"
                inputMode="tel"
                value={inputContact}
                onChange={(e) => setInputContact(formatPhone(e.target.value))}
                placeholder="Ej: 0412-1234567"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 px-4 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
