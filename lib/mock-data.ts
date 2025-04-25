// Mock dietician profile
export const mockDietician = {
  id: "d1",
  name: "Dr. Fit Foodie",
  email: "fit@diet.com",
  bio: "Nutrition expert with 5 years experience specializing in weight management and sports nutrition.",
  specialty: "Weight Management",
  rate_per_minute: "2.50",
  avatar: "https://images.pexels.com/photos/7465580/pexels-photo-7465580.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
};

// Mock clients
const mockClients = [
  {
    id: "c1",
    name: "John Smith",
    avatar: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=600",
    goal: "Weight loss"
  },
  {
    id: "c2",
    name: "Emma Davis",
    avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600",
    goal: "Sports nutrition"
  },
  {
    id: "c3",
    name: "Michael Johnson",
    avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=600",
    goal: "Diabetes management"
  },
  {
    id: "c4",
    name: "Sarah Williams",
    avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600",
    goal: "Vegetarian diet planning"
  },
  {
    id: "c5",
    name: "David Brown",
    avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600",
    goal: "Muscle building"
  }
];

// Mock consultations
export const mockConsultations = [
  {
    id: "cons1",
    client: mockClients[0],
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    duration: 30,
    topic: "Weight loss strategies",
    status: "scheduled",
    notes: ""
  },
  {
    id: "cons2",
    client: mockClients[1],
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    duration: 45,
    topic: "Marathon nutrition planning",
    status: "scheduled",
    notes: ""
  },
  {
    id: "cons3",
    client: mockClients[2],
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    duration: 30,
    topic: "Diabetes meal planning",
    status: "completed",
    notes: "Client needs follow-up on glucose monitoring."
  },
  {
    id: "cons4",
    client: mockClients[3],
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    duration: 60,
    topic: "Vegetarian protein sources",
    status: "completed",
    notes: "Provided list of high-protein vegetarian foods."
  },
  {
    id: "cons5",
    client: mockClients[4],
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    duration: 30,
    topic: "Supplement review",
    status: "cancelled",
    notes: "Client cancelled due to illness."
  },
  {
    id: "cons6",
    client: mockClients[0],
    date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days from now
    duration: 45,
    topic: "Progress check and adjustments",
    status: "scheduled",
    notes: ""
  }
];

// Mock conversations with messages
export const mockConversations = [
  {
    id: "msg1",
    client: mockClients[0],
    unread: true,
    messages: [
      {
        id: "m1",
        sender: "client",
        content: "Hello, I have a question about my meal plan.",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() // 3 hours ago
      },
      {
        id: "m2",
        sender: "dietician",
        content: "Hi John, what specifically would you like to know?",
        timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString() // 2.5 hours ago
      },
      {
        id: "m3",
        sender: "client",
        content: "I'm finding it difficult to meet my protein goals with the current plan. Any suggestions for vegetarian protein sources?",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago
      }
    ]
  },
  {
    id: "msg2",
    client: mockClients[1],
    unread: false,
    messages: [
      {
        id: "m4",
        sender: "client",
        content: "I'm feeling more energetic after following your nutrition advice for my marathon training!",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
      },
      {
        id: "m5",
        sender: "dietician",
        content: "That's great to hear, Emma! How's your recovery after long runs?",
        timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString() // 23 hours ago
      }
    ]
  },
  {
    id: "msg3",
    client: mockClients[2],
    unread: true,
    messages: [
      {
        id: "m6",
        sender: "client",
        content: "My blood sugar readings have been more stable. I think the meal timing adjustments are working.",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() // 5 hours ago
      },
      {
        id: "m7",
        sender: "dietician",
        content: "Excellent progress, Michael! Could you share your readings from the past week so we can track the improvement?",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
      },
      {
        id: "m8",
        sender: "client",
        content: "Sure, I'll send them over this evening. Also, I wanted to ask about incorporating more whole grains.",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
      }
    ]
  },
  {
    id: "msg4",
    client: mockClients[3],
    unread: false,
    messages: [
      {
        id: "m9",
        sender: "client",
        content: "Do you have any recipe suggestions for high-protein vegetarian meals that are quick to prepare?",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
      },
      {
        id: "m10",
        sender: "dietician",
        content: "Absolutely Sarah! I'll compile a list of 5 quick recipes and send them to you tomorrow.",
        timestamp: new Date(Date.now() - 1.8 * 24 * 60 * 60 * 1000).toISOString() // 1.8 days ago
      }
    ]
  }
];

// Mock transactions for wallet
export const mockTransactions = [
  {
    id: "t1",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    description: "Consultation with John Smith",
    amount: 75.00,
    type: "credit",
    status: "completed"
  },
  {
    id: "t2",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    description: "Consultation with Emma Davis",
    amount: 112.50,
    type: "credit",
    status: "completed"
  },
  {
    id: "t3",
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    description: "Consultation with Michael Johnson",
    amount: 75.00,
    type: "credit",
    status: "completed"
  },
  {
    id: "t4",
    date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
    description: "Consultation with Sarah Williams",
    amount: 150.00,
    type: "credit",
    status: "completed"
  },
  {
    id: "t5",
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    description: "Monthly platform fee",
    amount: 49.99,
    type: "debit",
    status: "completed"
  },
  {
    id: "t6",
    date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days ago
    description: "Withdrawal to bank account",
    amount: 300.00,
    type: "debit",
    status: "completed"
  },
  {
    id: "t7",
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    description: "Consultation with David Brown",
    amount: 75.00,
    type: "credit",
    status: "completed"
  }
];