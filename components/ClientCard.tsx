
import React, { useState } from 'react';
import { Client, Visit, SaleStatus } from '../types';

interface ClientCardProps {
  client: Client;
  onMarkVisited: (clientId: number) => void;
  onUpdateVisit: (clientId: number, updatedVisit: Partial<Visit>) => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, onMarkVisited, onUpdateVisit }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMarkVisitClick = async () => {
    setIsProcessing(true);
    await onMarkVisited(client.id);
    setIsProcessing(false);
  };

  const handleShareToWhatsApp = () => {
    if (!client.visit) return;

    const { name, visit } = client;
    const { timestamp, saleStatus, observation, location } = visit;

    const locationText = location
      ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
      : 'Localização não disponível';

    const message = `*Visita Realizada - Rota Daniel*

*PDV:* ${name}
*Status:* Visitado
*Data/Hora:* ${timestamp}
*Venda:* ${saleStatus}
*Observação:* ${observation || 'Nenhuma'}
*Localização:* ${locationText}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const isVisited = !!client.visit;
  const cardBg = 'bg-white';
  const cardBorder = isVisited ? 'border-green-400' : 'border-slate-200';

  return (
    <div className={`rounded-xl border ${cardBorder} ${cardBg} shadow-md transition-colors duration-300 flex flex-col h-full`}>
      <div className={`p-5 flex justify-between items-start ${isVisited ? 'border-b border-slate-200' : ''}`}>
        <h2 className="text-xl font-semibold text-slate-800 pr-4">{client.name}</h2>
        {isVisited && (
          <div className="flex-shrink-0 bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full flex items-center">
            <CheckCircleIcon />
            <span className="ml-1">Visitado</span>
          </div>
        )}
      </div>

      {isVisited && client.visit ? (
        <div className="p-5 space-y-4 flex-grow flex flex-col">
          <div className="text-sm text-slate-500 space-y-2">
            <div className="flex items-center">
                <ClockIcon />
                <span className="ml-2">{client.visit.timestamp}</span>
            </div>
             <div className="flex items-center">
                <LocationPinIcon />
                <span className="ml-2">{client.visit.location ? `Localização capturada` : 'Localização indisponível'}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 block">Status da Venda:</label>
            <div className="flex space-x-2">
              <button
                onClick={() => onUpdateVisit(client.id, { saleStatus: SaleStatus.Made })}
                className={`flex-1 py-2 px-3 text-sm rounded-md transition-colors ${client.visit.saleStatus === SaleStatus.Made ? 'bg-green-500 text-white font-bold' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
              >
                Venda Feita
              </button>
              <button
                onClick={() => onUpdateVisit(client.id, { saleStatus: SaleStatus.NotMade })}
                className={`flex-1 py-2 px-3 text-sm rounded-md transition-colors ${client.visit.saleStatus === SaleStatus.NotMade ? 'bg-red-500 text-white font-bold' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
              >
                Não Feita
              </button>
            </div>
          </div>

          <div className="space-y-2 flex-grow flex flex-col">
            <label htmlFor={`obs-${client.id}`} className="text-sm font-medium text-slate-700">Observação:</label>
            <textarea
              id={`obs-${client.id}`}
              value={client.visit.observation}
              onChange={(e) => onUpdateVisit(client.id, { observation: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200 flex-grow min-h-[80px]"
              placeholder="Adicione uma nota sobre a visita..."
            />
          </div>

          <button
            onClick={handleShareToWhatsApp}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors duration-200 mt-2"
          >
            <WhatsAppIcon />
            <span className="ml-2">Enviar para WhatsApp</span>
          </button>
        </div>
      ) : (
        <div className="p-5 mt-auto">
          <button
            onClick={handleMarkVisitClick}
            disabled={isProcessing}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
                <SpinnerIcon />
            ) : (
                <MapPinIcon />
            )}
            <span className="ml-2">{isProcessing ? 'Obtendo Localização...' : 'Marcar Visita'}</span>
          </button>
        </div>
      )}
    </div>
  );
};


// Icons
const CheckCircleIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
    </svg>
);
const ClockIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);
const LocationPinIcon: React.FC = () => (
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
);
const MapPinIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
);
const WhatsAppIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 256 256">
        <path d="M128,24A104,104,0,0,0,36.18,176.88L24.83,218.42a16,16,0,0,0,19.75,19.75l41.54-11.35A104,104,0,1,0,128,24Zm41.48,124.15c-2.45,4.8-8.4,7.85-14.3,8.43-4.63.45-10.43-1.48-22.1-6.15-15.42-6.19-29.28-20-41.1-37.12-10.35-14.93-14.15-27.18-14.15-27.88s-1.33-5.23,2.48-8.28c2.93-2.3,6.23-3,8.43-3s4.15.15,6,1.43,4.1,4.45,4.63,5.15,1,1.48.15,3.38c-.88,1.9-1.48,3.23-2.45,4.45a11.19,11.19,0,0,0-1.18,2.3,10,10,0,0,0,1.33,7.1,38.65,38.65,0,0,0,12.42,14.58,41,41,0,0,0,16.57,10.2c2.15,0,4.3-.45,6.15-1.48,2.15-1.18,4-2.78,5.5-5.1,1.18-1.78,2.63-2.93,4.6-2.18s6.15,5.1,7.25,6.15,1.78,1.63,2,2.48S172,144.13,169.48,148.15Z"></path>
    </svg>
);
const SpinnerIcon: React.FC = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


export default ClientCard;
