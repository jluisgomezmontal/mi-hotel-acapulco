export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

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
  id: string;
  reservation: Reservation | string;
  guest: Guest | string;
  amount: number;
  method: 'efectivo' | 'tdd' | 'tdc';
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentListResponse {
  results: Payment[];
  count: number;
  total: number;
  totalPages: number;
  page: number;
  totalAmount: number;
}

export interface MonthlyReportPeriod {
  year: number;
  month: number;
  label: string;
  start: string;
  end: string;
  daysInMonth: number;
}

export interface MonthlyReportOccupancy {
  roomsCount: number;
  totalRoomNightsAvailable: number;
  totalNightsBooked: number;
  occupancyRate: number;
}

export interface MonthlyReportIncomeByRoom {
  roomNumber: number | string;
  totalIncome: number;
  paymentsCount: number;
}

export interface MonthlyReportIncome {
  totalIncome: number;
  byRoom: MonthlyReportIncomeByRoom[];
}

export interface MonthlyReportCancellations {
  totalReservations: number;
  cancelledReservations: number;
  cancellationRate: number;
}

export interface MonthlyReport {
  period: MonthlyReportPeriod;
  occupancy: MonthlyReportOccupancy;
  income: MonthlyReportIncome;
  cancellations: MonthlyReportCancellations;
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
