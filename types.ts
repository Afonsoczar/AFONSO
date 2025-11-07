
export enum SaleStatus {
  Made = 'Venda Feita',
  NotMade = 'Venda Não Feita',
  Pending = 'Pendente'
}

export interface Geolocation {
  latitude: number;
  longitude: number;
}

export interface Visit {
  timestamp: string;
  saleStatus: SaleStatus;
  observation: string;
  location: Geolocation | null;
}

export interface Client {
  id: number;
  name: string;
  visit?: Visit;
}
