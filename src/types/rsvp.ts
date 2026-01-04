export interface Guest {
  name: string;
  mealChoice: string;
}

export interface RSVPData {
  id?: string;
  // For single guests or user-entered names
  name: string;
  // For couples or pre-defined guest lists
  guests?: Guest[];
  attending: boolean | null;
  // Plus one options (only available if guests array is not provided)
  plusOne: boolean;
  plusOneName: string;
  plusOneMealChoice: string;
  // For backward compatibility and single guests
  mealChoice: string;
  accommodation: boolean;
  submitted: boolean;
  // Indicates if this is a pre-defined guest (couple)
  isPredefined?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RSVPSubmitRequest {
  name: string;
  guests?: Guest[];
  attending: boolean;
  plusOne: boolean;
  plusOneName?: string;
  plusOneMealChoice?: string;
  mealChoice?: string;
  accommodation: boolean;
  isPredefined?: boolean;
}

export interface RSVPResponse {
  success: boolean;
  data?: RSVPData;
  message?: string;
}
