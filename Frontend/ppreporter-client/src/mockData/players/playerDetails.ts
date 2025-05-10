/**
 * Player Details Mock Data
 */
import playersMockData from './players';

/**
 * Get mock player details
 * @param playerId Player ID
 * @returns Mock player details
 */
const getPlayerDetails = (playerId?: string): any => {
  // Generate a player if no ID is provided or the ID doesn't match any existing player
  const player = playerId 
    ? playersMockData.generatePlayer(parseInt(playerId.replace('player-', '')) - 1)
    : playersMockData.generatePlayer(0);
  
  // Add additional details
  return {
    ...player,
    activityHistory: generateActivityHistory(),
    depositHistory: generateDepositHistory(),
    withdrawalHistory: generateWithdrawalHistory(),
    gameHistory: generateGameHistory(),
    bonusHistory: generateBonusHistory(),
    notes: generateNotes()
  };
};

/**
 * Generate mock activity history
 * @returns Mock activity history
 */
const generateActivityHistory = (): any => {
  const activities = [];
  const today = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    // Random session count between 0 and 5
    const sessionCount = Math.floor(Math.random() * 6);
    
    if (sessionCount > 0) {
      // Random session duration between 5 and 120 minutes
      const totalDuration = Math.floor(Math.random() * 115) + 5;
      
      // Random bet count between 10 and 100
      const betCount = Math.floor(Math.random() * 90) + 10;
      
      // Random bet amount between 50 and 500
      const betAmount = Math.floor(Math.random() * 450) + 50;
      
      // Random win amount between 0 and bet amount * 1.5
      const winAmount = Math.floor(Math.random() * betAmount * 1.5);
      
      activities.push({
        date: date.toISOString().split('T')[0],
        sessionCount,
        totalDuration,
        betCount,
        betAmount,
        winAmount,
        netGaming: betAmount - winAmount
      });
    } else {
      activities.push({
        date: date.toISOString().split('T')[0],
        sessionCount: 0,
        totalDuration: 0,
        betCount: 0,
        betAmount: 0,
        winAmount: 0,
        netGaming: 0
      });
    }
  }
  
  return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

/**
 * Generate mock deposit history
 * @returns Mock deposit history
 */
const generateDepositHistory = (): any => {
  const deposits = [];
  const today = new Date();
  
  // Random number of deposits between 5 and 15
  const depositCount = Math.floor(Math.random() * 10) + 5;
  
  for (let i = 0; i < depositCount; i++) {
    const date = new Date();
    date.setDate(today.getDate() - Math.floor(Math.random() * 60));
    
    // Random amount between 20 and 500
    const amount = Math.floor(Math.random() * 480) + 20;
    
    // Random payment method
    const paymentMethods = ['Credit Card', 'PayPal', 'Bank Transfer', 'Skrill', 'Neteller', 'Bitcoin', 'Apple Pay', 'Google Pay'];
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    
    // Random status
    const statuses = ['completed', 'pending', 'failed', 'cancelled'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    deposits.push({
      id: `deposit-${Date.now()}-${i}`,
      date: date.toISOString(),
      amount,
      paymentMethod,
      status,
      transactionId: `tx-${Date.now()}-${i}`
    });
  }
  
  return deposits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

/**
 * Generate mock withdrawal history
 * @returns Mock withdrawal history
 */
const generateWithdrawalHistory = (): any => {
  const withdrawals = [];
  const today = new Date();
  
  // Random number of withdrawals between 2 and 10
  const withdrawalCount = Math.floor(Math.random() * 8) + 2;
  
  for (let i = 0; i < withdrawalCount; i++) {
    const date = new Date();
    date.setDate(today.getDate() - Math.floor(Math.random() * 60));
    
    // Random amount between 50 and 1000
    const amount = Math.floor(Math.random() * 950) + 50;
    
    // Random payment method
    const paymentMethods = ['Credit Card', 'PayPal', 'Bank Transfer', 'Skrill', 'Neteller', 'Bitcoin'];
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    
    // Random status
    const statuses = ['completed', 'pending', 'processing', 'cancelled'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    withdrawals.push({
      id: `withdrawal-${Date.now()}-${i}`,
      date: date.toISOString(),
      amount,
      paymentMethod,
      status,
      transactionId: `tx-${Date.now()}-${i + 100}`
    });
  }
  
  return withdrawals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

/**
 * Generate mock game history
 * @returns Mock game history
 */
const generateGameHistory = (): any => {
  const games = [];
  const today = new Date();
  
  // Random number of game sessions between 10 and 30
  const gameCount = Math.floor(Math.random() * 20) + 10;
  
  // List of game names
  const gameNames = [
    'Starburst',
    'Gonzo\'s Quest',
    'Book of Dead',
    'Mega Moolah',
    'Reactoonz',
    'Immortal Romance',
    'Bonanza',
    'Dead or Alive',
    'Wolf Gold',
    'Sweet Bonanza',
    'Blackjack',
    'Roulette',
    'Baccarat',
    'Poker',
    'Craps'
  ];
  
  for (let i = 0; i < gameCount; i++) {
    const date = new Date();
    date.setDate(today.getDate() - Math.floor(Math.random() * 30));
    
    // Random game
    const gameName = gameNames[Math.floor(Math.random() * gameNames.length)];
    
    // Random session duration between 5 and 60 minutes
    const duration = Math.floor(Math.random() * 55) + 5;
    
    // Random bet amount between 10 and 200
    const betAmount = Math.floor(Math.random() * 190) + 10;
    
    // Random win amount between 0 and bet amount * 2
    const winAmount = Math.floor(Math.random() * betAmount * 2);
    
    games.push({
      id: `game-session-${Date.now()}-${i}`,
      date: date.toISOString(),
      gameName,
      duration,
      betAmount,
      winAmount,
      netGaming: betAmount - winAmount
    });
  }
  
  return games.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

/**
 * Generate mock bonus history
 * @returns Mock bonus history
 */
const generateBonusHistory = (): any => {
  const bonuses = [];
  const today = new Date();
  
  // Random number of bonuses between 3 and 10
  const bonusCount = Math.floor(Math.random() * 7) + 3;
  
  // List of bonus types
  const bonusTypes = [
    'Welcome Bonus',
    'Deposit Bonus',
    'Free Spins',
    'Cashback',
    'Loyalty Bonus',
    'Birthday Bonus',
    'Referral Bonus'
  ];
  
  for (let i = 0; i < bonusCount; i++) {
    const date = new Date();
    date.setDate(today.getDate() - Math.floor(Math.random() * 90));
    
    // Random bonus type
    const bonusType = bonusTypes[Math.floor(Math.random() * bonusTypes.length)];
    
    // Random amount between 10 and 200
    const amount = Math.floor(Math.random() * 190) + 10;
    
    // Random wagering requirement between 10 and 40
    const wageringRequirement = Math.floor(Math.random() * 30) + 10;
    
    // Random status
    const statuses = ['active', 'completed', 'expired', 'cancelled'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Random expiry date
    const expiryDate = new Date(date);
    expiryDate.setDate(expiryDate.getDate() + 30);
    
    bonuses.push({
      id: `bonus-${Date.now()}-${i}`,
      date: date.toISOString(),
      bonusType,
      amount,
      wageringRequirement,
      wageringCompleted: status === 'completed' ? wageringRequirement : Math.floor(Math.random() * wageringRequirement),
      status,
      expiryDate: expiryDate.toISOString()
    });
  }
  
  return bonuses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

/**
 * Generate mock notes
 * @returns Mock notes
 */
const generateNotes = (): any => {
  const notes = [];
  const today = new Date();
  
  // Random number of notes between 0 and 5
  const noteCount = Math.floor(Math.random() * 6);
  
  for (let i = 0; i < noteCount; i++) {
    const date = new Date();
    date.setDate(today.getDate() - Math.floor(Math.random() * 60));
    
    // Random author
    const authors = ['John (Support)', 'Sarah (VIP Manager)', 'Mike (Compliance)', 'Lisa (Payments)', 'David (Admin)'];
    const author = authors[Math.floor(Math.random() * authors.length)];
    
    // Random note content
    const noteContents = [
      'Player contacted support about withdrawal issues.',
      'VIP status upgraded due to consistent play.',
      'Player requested account verification documents.',
      'Player reported issues with game freezing.',
      'Bonus added to account as goodwill gesture.',
      'Player requested self-exclusion for 30 days.',
      'Payment method verified successfully.',
      'Player reported unauthorized access attempt.'
    ];
    const content = noteContents[Math.floor(Math.random() * noteContents.length)];
    
    notes.push({
      id: `note-${Date.now()}-${i}`,
      date: date.toISOString(),
      author,
      content
    });
  }
  
  return notes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export default {
  getPlayerDetails,
  generateActivityHistory,
  generateDepositHistory,
  generateWithdrawalHistory,
  generateGameHistory,
  generateBonusHistory,
  generateNotes
};
