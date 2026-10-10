import { AppContentConfig } from '../types';
import { JOURNEY_CHAPTERS } from './journeyChapters';

export const APP_CONTENT: AppContentConfig = {
  recipientName: 'Kanishka',
  nickname: 'Kittu',
  birthdayWish: 'Happy Birthday, Kanishka 🎉',
  birthdayLetter: {
    openingHeading: 'Happy Birthday, Kanishka ✨',
    fullLetter:
      'Happy birthday, baby. Happy birthday to the love of my life, to my person, and to my soulmate. May you always be filled with joy throughout your life, and may nothing ever dim your smile or become a reason for sadness. On this special day, I am so sorry I can t be right there beside you in person, but until I can hold you close, I hope this little world makes you feel like I am right there with you, always and forever. My heart belongs to you through thick and thin, and I hope with all my soul that I can always be another reason for your happiness. Kanishka, Kittu, My love, My soulmate, My sweetheart, My love, My life, My partner, Darling I love you so much like bhot bhot bhot saara till the end of the earth, I love you to the moon and back. I just love you so much babyyy. I love you till there is no tomorrow. I love you bhot saara beyond infinity bhot saara my love.',
    signoff: 'Forever and always yours,\nWith all my love and heart ❤️',
  },
  dailyMessages: [
    'Just a reminder: you are loved more than you know.',
    'Another day of being grateful that you re part of my life.',
    'Some people become memories. You became my favorite part of life.',
    'Today s reminder: You are loved, deeply and unconditionally.',
    'No matter where the day takes you, remember you carry my entire heart with you.',
    'You are my home, my calm, and my favorite reason to smile.',
    'Thinking about the way you smile still makes my whole world brighter.',
    'There is nowhere in this universe I would rather be than with you.',
  ],
  // Anchor date: 21st June (the day she confessed)
  relationshipStartDate: '2026-06-21',
  confessionDate: '2026-06-21',
  firstAnniversaryDate: '2027-06-21',
  journeyChapters: JOURNEY_CHAPTERS,
};
