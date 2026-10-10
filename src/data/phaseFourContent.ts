export interface LoveLetter {
  id: string;
  envelopeTitle: string;
  category: 'open_when' | 'boyfriends_day' | 'heartfelt';
  icon: string;
  unsealCondition: string;
  sealColor: string;
  subtitle: string;
  letterContent: string[];
  signoff: string;
}

export const OPEN_WHEN_LETTERS: LoveLetter[] = [
  {
    id: 'letter-boyfriends-day',
    envelopeTitle: "Boyfriend's Day — The Gift You Gave Me",
    category: 'boyfriends_day',
    icon: '🎁',
    unsealCondition: 'When you want to remember how precious you made me feel',
    sealColor: '#2dd4bf',
    subtitle: 'The best surprise a guy could ever ask for',
    letterContent: [
      'My dearest Kittu,',
      'I still remember Boyfriend\'s Day like it was yesterday.',
      'You did something that completely melted my heart. The thoughtful gifts, the effort, the love packed into every little gesture — nobody had ever made me feel so genuinely loved, special, and appreciated.',
      'I was just a regular guy who used to be shy around girls, and suddenly here was the sweetest, most breathtaking girl pouring her heart into making my day unforgettable.',
      'I keep every memory of that day locked away in the most protected corner of my heart. Whenever life gets overwhelming or we face tough days, I think back to the way you smiled and the love you gave me.',
      'Thank you for being my person, baby. You made me the happiest boyfriend in the universe.',
    ],
    signoff: 'Forever yours,\nTanmay ❤️',
  },
];
