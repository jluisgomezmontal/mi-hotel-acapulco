export interface Room {
  _id: string;
  number: string;
  type: 'individual' | 'doble' | 'suite' | 'familiar';
  capacity: number;
  pricePerNight: number;
  amenities: string[];
  isAvailable: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  documentType: 'ine' | 'pasaporte' | 'licencia' | 'otro';
  documentNumber: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GuestsListResponse {
  guests: Guest[];
  total: number;
  page: number;
  pages: number;
}

export interface Reservation {
  _id: string;
  room?: Room | string | number;
  roomNumber?: number;
  guest?: Guest | string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  checkIn: string;
  checkOut: string;
  status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled' | 'completed';
  totalPrice: number;
  numberOfGuests?: number;
  totalPaid?: number;
  balanceDue?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  reservation: Reservation | string;
  guest: Guest | string;
  amount: number;
  method: 'efectivo' | 'tdd' | 'tdc';
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyReport {
  year: number;
  month: number;
  occupancyRate: number;
  totalReservations: number;
  totalIncome: number;
  cancelledReservations: number;
  cancellationRate: number;
  roomRevenueBreakdown: {
    roomNumber: string;
    roomType: string;
    revenue: number;
    reservations: number;
  }[];
}

// Form types
export interface RoomFormData {
  number: string;
  type: 'individual' | 'doble' | 'suite' | 'familiar';
  capacity: number;
  pricePerNight: number;
  amenities: string[];
  isAvailable: boolean;
  description?: string;
}

export interface GuestFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  documentType: 'ine' | 'pasaporte' | 'licencia' | 'otro';
  documentNumber: string;
  notes?: string;
}

export interface ReservationGuestPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  documentType?: Guest['documentType'];
  documentNumber?: string;
  notes?: string;
}

export interface ReservationFormData {
  roomNumber: number;
  checkIn: string;
  checkOut: string;
  numberOfGuests?: number;
  notes?: string;
  guestId?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  guest?: ReservationGuestPayload;
}

export interface PaymentFormData {
  reservationId: string;
  amount: number;
  method: 'efectivo' | 'tdd' | 'tdc';
  notes?: string;
}
