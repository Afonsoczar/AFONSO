import React, { useState, useEffect, useCallback } from 'react';
import { Client, Visit, SaleStatus } from './types';
import { INITIAL_CLIENTS } from './constants';
import ClientCard from './components/ClientCard';
import { useGeolocation } from './hooks/useGeolocation';

const LOCAL_STORAGE_KEY = 'vendedor-daniel-rota';

const App: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const { getLocation, locationError } = useGeolocation();

  useEffect(() => {
    try {
      const storedClients = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedClients) {
        setClients(JSON.parse(storedClients));
      } else {
        setClients(INITIAL_CLIENTS.map((name, index) => ({ id: index + 1, name })));
      }
    } catch (error) {
      console.error("Failed to load clients from localStorage", error);
      setClients(INITIAL_CLIENTS.map((name, index) => ({ id: index + 1, name })));
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    if (!isInitializing) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(clients));
      } catch (error) {
        console.error("Failed to save clients to localStorage", error);
      }
    }
  }, [clients, isInitializing]);

  const handleMarkVisited = useCallback(async (clientId: number) => {
    const location = await getLocation();
    setClients(prevClients =>
      prevClients.map(client =>
        client.id === clientId && !client.visit
          ? {
              ...client,
              visit: {
                timestamp: new Date().toLocaleString('pt-BR'),
                saleStatus: SaleStatus.Pending,
                observation: '',
                location: location,
              },
            }
          : client
      )
    );
  }, [getLocation]);

  const handleUpdateVisit = useCallback((clientId: number, updatedVisit: Partial<Visit>) => {
    setClients(prevClients =>
      prevClients.map(client =>
        client.id === clientId && client.visit
          ? { ...client, visit: { ...client.visit, ...updatedVisit } }
          : client
      )
    );
  }, []);

  const handleClearData = () => {
    if (window.confirm("Você tem certeza que deseja apagar todos os dados da rota? Esta ação não pode ser desfeita.")) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setClients(INITIAL_CLIENTS.map((name, index) => ({ id: index + 1, name })));
      setSelectedClientId(null); // Reset selection
    }
  };

  const visitedCount = clients.filter(c => c.visit).length;
  const totalCount = clients.length;
  const selectedClient = clients.find(c => c.id === selectedClientId);

  return (
    <div className="min-h-screen w-full bg-slate-100 font-sans text-slate-800 flex flex-col">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center max-w-5xl">
          <div className="text-center sm:text-left mb-3 sm:mb-0">
            <h1 className="text-xl font-bold text-slate-900">Rota do Vendedor - Daniel</h1>
            <p className="text-sm text-slate-600">Acompanhamento de visitas aos PDVs</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="font-semibold text-lg">{visitedCount} / {totalCount}</p>
              <p className="text-xs text-slate-500">Visitados</p>
            </div>
            <button
              onClick={handleClearData}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-lg flex items-center transition-colors duration-200"
              aria-label="Limpar dados da rota"
            >
              <TrashIcon />
              <span className="hidden sm:inline ml-2 text-sm">Limpar Rota</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full p-4 sm:p-6">
        <div className="max-w-xl mx-auto">
          {locationError && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-md" role="alert">
              <p className="font-bold">Aviso de Localização</p>
              <p>{locationError}</p>
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="pdv-select" className="block text-sm font-bold text-slate-800 mb-2">
              Selecione o PDV <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="pdv-select"
                value={selectedClientId ?? ''}
                onChange={(e) => setSelectedClientId(e.target.value ? Number(e.target.value) : null)}
                className="w-full appearance-none bg-white border border-slate-300 text-slate-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-shadow duration-200"
              >
                <option value="" disabled>Escolha um PDV...</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          {selectedClient ? (
            <ClientCard
              key={selectedClient.id}
              client={selectedClient}
              onMarkVisited={handleMarkVisited}
              onUpdateVisit={handleUpdateVisit}
            />
          ) : (
            <div className="text-center bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-slate-500">
              <h2 className="text-xl font-semibold mb-2 text-slate-700">Bem-vindo!</h2>
              <p>Selecione um PDV na lista acima para ver os detalhes e registrar sua visita.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Icons
const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);

export default App;
