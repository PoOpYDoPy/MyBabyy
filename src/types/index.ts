export type OpeningStage =
  | 'candles_lit'
  | 'extinguished'
  | 'make_a_wish'
  | 'birthday_message'
  | 'main_world';

export type MainWorldTab = 'home' | 'journey' | 'memories' | 'time_capsule' | 'bouquet' | 'gift';

export interface BirthdayLetter {
  openingHeading: string;
  fullLetter: string;
  signoff: string;
}

export type MemoryTag = 
  | 'All' 
  | 'Sweet Moments' 
  | 'Late Nights' 
  | 'Inside Jokes' 
  | 'Milestones' 
  | 'Little Things';

export interface ScrapbookMemory {
  id: string;
  date: string;
  title: string;
  story: string;
  personalNote: string;
  tag: 'Sweet Moments' | 'Late Nights' | 'Inside Jokes' | 'Milestones' | 'Little Things';
  sticker?: string;
  photos?: string[];
  songDedication?: string;
  accentColor?: string;
  likesCount?: number;
}

export interface TimelineMilestone {
  id: string;
  date: string;
  displayDate: string;
  title: string;
  description: string;
  personalMessage: string;
  location?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  badge?: string;
  isSpecialMoment?: boolean;
}

export interface JourneyChapter {
  id: string;
  chapterNumber?: number;
  dateTag: string;
  title: string;
  content: string[];
  photoMemoryId?: string;
  subsections?: {
    title: string;
    content: string[];
  }[];
  isConcluding?: boolean;
}

export interface AppContentConfig {
  recipientName: string;
  nickname: string;
  birthdayWish: string;
  birthdayLetter: BirthdayLetter;
  dailyMessages: string[];
  relationshipStartDate: string;
  confessionDate?: string;
  firstAnniversaryDate?: string;
  timelineMilestones?: TimelineMilestone[];
  journeyChapters: JourneyChapter[];
}
