import axios, { AxiosError, AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './useAuth';
import { router } from 'expo-router';

interface BookingData {
  car_id: number;
  start_date: string;
  end_date: string;
  phone_number: string;
  note?: string;
  payment_details: {
    card_number: string;
    expiry_date: string;
    cvv: string;
    card_holder_name: string;
  };
}

const API_URL = 'https://car-rental-api-aeh4.onrender.com';

export const getAuthenticatedApi = async (): Promise<AxiosInstance> => {
  const token = await AsyncStorage.getItem('userToken');
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
  
  // Add auth token if available
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  
  return api;
};

export const createBooking = async (bookingData: BookingData) => {
  try {
    const api = await getAuthenticatedApi();
    
    console.log('Original payment details:', bookingData.payment_details);
    
    // Create booking first
    const bookingResponse = await api.post('/api/v1/cars/api/v1/bookings/create/', {
      car: bookingData.car_id,
      start_date: bookingData.start_date,
      end_date: bookingData.end_date,
      phone_number: bookingData.phone_number,
      note: bookingData.note || ''
    });
    
    console.log('Booking response:', bookingResponse.data);

    if (!bookingResponse.data.success) {
      throw new Error(bookingResponse.data.message);
    }

    // Then create payment with booking ID
    const paymentData = {
      booking: bookingResponse.data.data.booking_id,  // Use booking ID from response
      card_type: 'uzcard',
      card_number: String(bookingData.payment_details.card_number).replace(/\D/g, ''),
      card_expire: bookingData.payment_details.expiry_date
    };

    console.log('Payment data:', paymentData);

    console.log('Payment data:', paymentData);

    const paymentResponse = await api.post('/api/v1/cars/api/v1/payments/create/', paymentData);

    if (!paymentResponse.data.success) {
      // If payment fails, we should cancel the booking
      await api.delete(`/api/v1/cars/api/v1/bookings/${bookingResponse.data.id}/`);
      throw new Error(paymentResponse.data.message);
    }
    
    return {
      success: true,
      data: bookingResponse.data,
      message: 'Buyurtma muvaffaqiyatli yaratildi'
    };
  } catch (error: any) {
    console.error('Booking error:', error);
    if (error instanceof AxiosError) {
      throw {
        success: false,
        error: error,
        message: error.response?.data?.message || 'Buyurtma yaratishda xatolik yuz berdi'
      };
    }
    throw {
      success: false,
      error: new Error('An unexpected error occurred'),
      message: 'Server bilan bog\'lanishda xatolik yuz berdi'
    };
  }
};

const axiosInstance = axios.create({
  baseURL: 'https://car-rental-api-aeh4.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

const getToken = async () => {
  try {
    return await AsyncStorage.getItem('token');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const useApi = () => {
  const getAuthenticatedApi = async (): Promise<AxiosInstance> => {
    const token = await AsyncStorage.getItem('userToken');
    const api = axios.create({
      baseURL: API_URL,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    // Add auth token if available
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // Add response interceptor to handle errors
    api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          AsyncStorage.removeItem('userToken');
          router.replace('/login');
        }
        return Promise.reject(error);
      }
    );

    return api;
  };

  const login = async (username: string, password: string) => {
    try {
      const api = await getAuthenticatedApi();
      const response = await axios.post(`${API_URL}/api/auth/login/`, { username, password });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  };

  interface RegisterData {
    username: string;
    password: string;
    email: string;
    first_name?: string;
    last_name?: string;
  }

  // Using the BookingData interface defined at the top of the file

  const register = async (userData: RegisterData) => {
    try {
      const api = await getAuthenticatedApi();
      const response = await api.post('/api/auth/register/', userData);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  };

  const getCars = async () => {
    try {
      const api = await getAuthenticatedApi();
      const response = await api.get('/api/cars/');
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  };

  const getCarDetails = async (carId: string) => {
    try {
      const api = await getAuthenticatedApi();
      const response = await api.get(`/api/cars/${carId}/`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  };

  const createRental = async (rentalData: any) => {
    try {
      const api = await getAuthenticatedApi();
      const response = await api.post('/rentals/', rentalData);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  };

  const createBookingFromHook = async (bookingData: BookingData) => {
    return createBooking(bookingData);
  };

  const getUserRentals = async () => {
    try {
      const api = await getAuthenticatedApi();
      const response = await api.get('/api/rentals/user/');
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  };

  const getBookings = async () => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Token not found');
      }

      const response = await axiosInstance.get('/api/v1/cars/api/v1/bookings/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error getting bookings:', error);
      return {
        success: false,
        error
      };
    }
  };

  const getContracts = async () => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Token not found');
      }

      const response = await axiosInstance.get('/api/v1/cars/api/v1/contracts/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error getting contracts:', error);
      return {
        success: false,
        error
      };
    }
  };

  return {
    login,
    register,
    getCars,
    getCarDetails,
    createRental,
    createBooking,
    getUserRentals,
    getBookings,
    getContracts,
  };
};
