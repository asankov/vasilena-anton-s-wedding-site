import { RSVPData, RSVPSubmitRequest, RSVPResponse } from "../types/rsvp";

/**
 * Mock RSVP API Client
 *
 * This is a temporary mock implementation that simulates backend API calls.
 * It uses localStorage to persist data and adds simulated network delays.
 *
 * Replace this with actual API calls when the backend is ready.
 */

const STORAGE_KEY = "wedding-rsvp-data";
const API_DELAY = 800; // Simulate network delay in ms

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock database with some sample RSVPs
const mockRSVPs: RSVPData[] = [
  // Couple - pre-defined guests
  {
    id: "1",
    name: "xxx",
    guests: [
      { name: "test", mealChoice: "beef" },
      { name: "test", mealChoice: "chicken" },
    ],
    attending: true,
    plusOne: false,
    plusOneName: "",
    plusOneMealChoice: "",
    mealChoice: "",
    accommodation: true,
    submitted: true,
    isPredefined: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  // Another couple
  {
    id: "2",
    name: "yyy",
    guests: [
      { name: "test", mealChoice: "fish" },
      { name: "test2", mealChoice: "vegetarian" },
    ],
    attending: null,
    plusOne: false,
    plusOneName: "",
    plusOneMealChoice: "",
    mealChoice: "",
    accommodation: true,
    submitted: true,
    isPredefined: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
  // Single guest with plus one
  {
    id: "3",
    name: "sss",
    attending: true,
    plusOne: true,
    plusOneName: "Mark Wilson",
    plusOneMealChoice: "beef",
    mealChoice: "vegetarian",
    accommodation: false,
    submitted: true,
    isPredefined: false,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 259200000).toISOString(),
  },
  // Single guest declined
  {
    id: "4",
    name: "Michael Brown",
    attending: false,
    plusOne: false,
    plusOneName: "",
    plusOneMealChoice: "",
    mealChoice: "",
    accommodation: false,
    submitted: true,
    isPredefined: false,
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    updatedAt: new Date(Date.now() - 345600000).toISOString(),
  },
];

/**
 * Get RSVP data for a specific user by name
 * In a real implementation, this would fetch from the backend by user ID or email
 */
export const getRSVPByName = async (name: string): Promise<RSVPResponse> => {
  await delay(API_DELAY);

  try {
    // Check localStorage first
    // const stored = localStorage.getItem(STORAGE_KEY);
    // if (stored) {
    //   const data = JSON.parse(stored) as RSVPData;
    //   if (data.name.toLowerCase() === name.toLowerCase()) {
    //     return {
    //       success: true,
    //       data,
    //     };
    //   }
    // }

    // Check mock data
    const mockRsvp = mockRSVPs.find(
      (r) => r.name.toLowerCase() === name.toLowerCase()
    );

    if (mockRsvp) {
      return {
        success: true,
        data: mockRsvp,
      };
    }

    // No RSVP found
    return {
      success: true,
      data: undefined,
      message: "No RSVP found for this name",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch RSVP data",
    };
  }
};

/**
 * Submit or update an RSVP
 */
export const submitRSVP = async (
  request: RSVPSubmitRequest
): Promise<RSVPResponse> => {
  await delay(API_DELAY);

  try {
    // Validate request
    if (!request.name) {
      return {
        success: false,
        message: "Name is required",
      };
    }

    if (request.attending === null || request.attending === undefined) {
      return {
        success: false,
        message: "Please indicate if you will be attending",
      };
    }

    if (request.attending) {
      // For pre-defined guests (couples), validate all guests have meal choices
      if (request.guests && request.guests.length > 0) {
        const missingMeals = request.guests.filter(g => !g.mealChoice);
        if (missingMeals.length > 0) {
          return {
            success: false,
            message: "Meal preferences are required for all guests",
          };
        }
      } else {
        // For single guests, validate meal choice
        if (!request.mealChoice) {
          return {
            success: false,
            message: "Meal preference is required",
          };
        }

        // For plus one guests
        if (request.plusOne) {
          if (!request.plusOneName) {
            return {
              success: false,
              message: "Plus one name is required",
            };
          }
          if (!request.plusOneMealChoice) {
            return {
              success: false,
              message: "Plus one meal preference is required",
            };
          }
        }
      }
    }

    // Create or update RSVP data
    const rsvpData: RSVPData = {
      id: Date.now().toString(),
      name: request.name,
      guests: request.guests,
      attending: request.attending,
      plusOne: request.plusOne,
      plusOneName: request.plusOneName || "",
      plusOneMealChoice: request.plusOneMealChoice || "",
      mealChoice: request.mealChoice || "",
      accommodation: request.accommodation,
      submitted: true,
      isPredefined: request.isPredefined || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to localStorage (simulating backend persistence)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rsvpData));

    return {
      success: true,
      data: rsvpData,
      message: "RSVP submitted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to submit RSVP. Please try again.",
    };
  }
};

/**
 * Get all RSVPs (admin function)
 * In production, this would require authentication
 */
export const getAllRSVPs = async (): Promise<RSVPData[]> => {
  await delay(API_DELAY);

  const stored = localStorage.getItem(STORAGE_KEY);
  const userRsvp = stored ? [JSON.parse(stored) as RSVPData] : [];

  // Combine mock data with user's RSVP
  return [...mockRSVPs, ...userRsvp];
};

/**
 * Delete an RSVP (reset)
 */
export const deleteRSVP = async (name: string): Promise<RSVPResponse> => {
  await delay(API_DELAY);

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored) as RSVPData;
      if (data.name.toLowerCase() === name.toLowerCase()) {
        localStorage.removeItem(STORAGE_KEY);
        return {
          success: true,
          message: "RSVP deleted successfully",
        };
      }
    }

    return {
      success: false,
      message: "No RSVP found to delete",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to delete RSVP",
    };
  }
};
