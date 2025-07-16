// API Configuration
const API_BASE_URL = "http://127.0.0.1:8000/something api";

// API Service Class
class EcoTrackAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.currentUserId = localStorage.getItem("currentUserId") || 1; // Default to user 1 for demo
  }

  async getDashboardData() {
    // Return data from localStorage.habitsDB
    let habits = [];
    try {
      habits = JSON.parse(localStorage.getItem("habitsDB")) || [];
    } catch (e) {
      habits = [];
    }
    return {
      sustainability_score: 80, // TODO: Replace with real calculation if needed
      carbon_footprint: 12.5, // TODO: Replace with real calculation if needed
      habits_completed_today: 3, // TODO: Replace with real calculation if needed
      streak_count: 7, // TODO: Replace with real calculation if needed
      habits: habits,
      achievements: [
        {
          achievement_type: "first_checkin",
          achievement_title: "First Check-in",
          unlocked: true,
        },
        {
          achievement_type: "streak_3",
          achievement_title: "3-Day Streak",
          unlocked: true,
        },
        {
          achievement_type: "streak_7",
          achievement_title: "7-Day Streak",
          unlocked: true,
        },
        {
          achievement_type: "habits_5",
          achievement_title: "5 Habits Master",
          unlocked: false,
        },
        {
          achievement_type: "score_80",
          achievement_title: "Eco Champion",
          unlocked: false,
        },
        {
          achievement_type: "carbon_reducer",
          achievement_title: "Carbon Crusher",
          unlocked: true,
        },
        {
          achievement_type: "water_saver",
          achievement_title: "Water Guardian",
          unlocked: false,
        },
        {
          achievement_type: "energy_efficient",
          achievement_title: "Energy Saver",
          unlocked: true,
        },
        {
          achievement_type: "waste_warrior",
          achievement_title: "Waste Warrior",
          unlocked: false,
        },
        {
          achievement_type: "plant_based",
          achievement_title: "Plant Pioneer",
          unlocked: true,
        },
        {
          achievement_type: "recycler",
          achievement_title: "Recycling Hero",
          unlocked: false,
        },
        {
          achievement_type: "composter",
          achievement_title: "Compost King",
          unlocked: false,
        },
        {
          achievement_type: "bike_rider",
          achievement_title: "Bike Enthusiast",
          unlocked: true,
        },
        {
          achievement_type: "public_transport",
          achievement_title: "Bus Buddy",
          unlocked: false,
        },
        {
          achievement_type: "carpooler",
          achievement_title: "Carpool Captain",
          unlocked: false,
        },
        {
          achievement_type: "solar_user",
          achievement_title: "Solar Supporter",
          unlocked: false,
        },
        {
          achievement_type: "local_eater",
          achievement_title: "Local Foodie",
          unlocked: true,
        },
        {
          achievement_type: "seasonal_shopper",
          achievement_title: "Seasonal Shopper",
          unlocked: false,
        },
        {
          achievement_type: "plastic_free",
          achievement_title: "Plastic Free",
          unlocked: false,
        },
        {
          achievement_type: "zero_waste",
          achievement_title: "Zero Waste",
          unlocked: false,
        },
        {
          achievement_type: "tree_planter",
          achievement_title: "Tree Planter",
          unlocked: false,
        },
        {
          achievement_type: "beach_cleaner",
          achievement_title: "Beach Cleaner",
          unlocked: false,
        },
        {
          achievement_type: "community_volunteer",
          achievement_title: "Community Helper",
          unlocked: false,
        },
        {
          achievement_type: "sustainable_shopper",
          achievement_title: "Green Shopper",
          unlocked: true,
        },
        {
          achievement_type: "repair_master",
          achievement_title: "Repair Master",
          unlocked: false,
        },
        {
          achievement_type: "upcycler",
          achievement_title: "Upcycling Pro",
          unlocked: false,
        },
        {
          achievement_type: "thrift_shopper",
          achievement_title: "Thrift Treasure",
          unlocked: true,
        },
        {
          achievement_type: "digital_nomad",
          achievement_title: "Digital Nomad",
          unlocked: false,
        },
        {
          achievement_type: "paperless",
          achievement_title: "Paperless Pioneer",
          unlocked: false,
        },
        {
          achievement_type: "smart_thermostat",
          achievement_title: "Smart Home",
          unlocked: false,
        },
        {
          achievement_type: "rainwater_collector",
          achievement_title: "Rain Collector",
          unlocked: false,
        },
        {
          achievement_type: "herb_gardener",
          achievement_title: "Herb Gardener",
          unlocked: false,
        },
        {
          achievement_type: "sustainable_fashion",
          achievement_title: "Eco Fashionista",
          unlocked: false,
        },
        {
          achievement_type: "minimalist",
          achievement_title: "Minimalist",
          unlocked: false,
        },
        {
          achievement_type: "conscious_consumer",
          achievement_title: "Conscious Consumer",
          unlocked: true,
        },
        {
          achievement_type: "carbon_neutral",
          achievement_title: "Carbon Neutral",
          unlocked: false,
        },
        {
          achievement_type: "sustainability_educator",
          achievement_title: "Eco Educator",
          unlocked: false,
        },
        {
          achievement_type: "green_tech",
          achievement_title: "Green Tech",
          unlocked: false,
        },
        {
          achievement_type: "biodiversity_protector",
          achievement_title: "Biodiversity Protector",
          unlocked: false,
        },
        {
          achievement_type: "ocean_guardian",
          achievement_title: "Ocean Guardian",
          unlocked: false,
        },
        {
          achievement_type: "climate_activist",
          achievement_title: "Climate Activist",
          unlocked: false,
        },
        {
          achievement_type: "sustainable_traveler",
          achievement_title: "Eco Traveler",
          unlocked: false,
        },
        {
          achievement_type: "green_builder",
          achievement_title: "Green Builder",
          unlocked: false,
        },
        {
          achievement_type: "renewable_energy",
          achievement_title: "Renewable Energy",
          unlocked: false,
        },
        {
          achievement_type: "sustainable_farmer",
          achievement_title: "Sustainable Farmer",
          unlocked: false,
        },
        {
          achievement_type: "wildlife_protector",
          achievement_title: "Wildlife Protector",
          unlocked: false,
        },
        {
          achievement_type: "clean_air",
          achievement_title: "Clean Air Advocate",
          unlocked: false,
        },
        {
          achievement_type: "water_conservation",
          achievement_title: "Water Conservationist",
          unlocked: false,
        },
        {
          achievement_type: "soil_health",
          achievement_title: "Soil Health Guardian",
          unlocked: false,
        },
        {
          achievement_type: "pollution_fighter",
          achievement_title: "Pollution Fighter",
          unlocked: false,
        },
        {
          achievement_type: "sustainable_design",
          achievement_title: "Sustainable Designer",
          unlocked: false,
        },
        {
          achievement_type: "green_innovation",
          achievement_title: "Green Innovator",
          unlocked: false,
        },
        {
          achievement_type: "circular_economy",
          achievement_title: "Circular Economy",
          unlocked: false,
        },
        {
          achievement_type: "sustainable_future",
          achievement_title: "Future Guardian",
          unlocked: false,
        },
      ],
    };
  }

  async submitQuestionnaire(data) {
    // Mock API call for questionnaire submission
    console.log("Submitting questionnaire:", data);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      success: true,
      message: "Questionnaire submitted successfully",
    };
  }

  async createHabit(habitData) {
    // Mock API call for creating habits
    console.log("Creating habit:", habitData);

    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      success: true,
      id: Date.now(),
      ...habitData,
    };
  }

  async updateHabit(habitId, completed) {
    // Mock API call for updating habits
    console.log("Updating habit:", habitId, completed);

    await new Promise((resolve) => setTimeout(resolve, 200));

    return {
      success: true,
    };
  }

  async deleteHabit(habitId) {
    // Mock API call for deleting habits
    console.log("Deleting habit:", habitId);

    await new Promise((resolve) => setTimeout(resolve, 200));

    return {
      success: true,
    };
  }
}
