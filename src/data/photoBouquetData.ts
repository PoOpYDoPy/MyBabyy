export interface BouquetPhoto {
  id: string;
  image: string; // Image path or URL (e.g. /photos/1.jpg)
  caption: string; // Short compliment
  date?: string; // Compliment sub-label or tag
  personalMessage?: string; // Heartfelt note elaborating the compliment
  altText?: string; // Description
  flowerType?: string; // Flower variety name
  flowerEmoji?: string; // Decorative floral emoji
}

export const INITIAL_BOUQUET_PHOTOS: BouquetPhoto[] = [
  // --- Layer 1: Top Crown Arc (7 Blooms) ---
  {
    id: 'bouquet-photo-1',
    image: '/photos/1.jpg',
    caption: 'Your Radiant Smile',
    date: 'Pure Sunshine',
    flowerType: 'Yellow Sunflower',
    flowerEmoji: '🌻',
    personalMessage:
      'The smile that turns even my darkest days into pure light. The very first thing that made my heart skip a beat and realize you are pure magic.',
    altText: 'Your radiant smile',
  },
  {
    id: 'bouquet-photo-2',
    image: '/photos/2.jpg',
    caption: 'Your Mesmerizing Eyes',
    date: 'Gentle Sparkle',
    flowerType: 'Sweet Jasmine',
    flowerEmoji: '🌼',
    personalMessage:
      'The way your eyes soften when you look at me or sparkle when you laugh. You have the prettiest, most gentle gaze in the world — looking into your eyes feels like coming home.',
    altText: 'Your captivating eyes',
  },
  {
    id: 'bouquet-photo-3',
    image: '/photos/3.jpg',
    caption: 'Your Cute Ponytail & Glasses',
    date: 'Effortlessly Stunning',
    flowerType: 'Peach Blossom',
    flowerEmoji: '🌸',
    personalMessage:
      'Watching you walk by with your glasses on and that cute ponytail bouncing with every step. You never have to try — you look effortlessly like an absolute dream.',
    altText: 'You looking adorable in glasses and ponytail',
  },
  {
    id: 'bouquet-photo-4',
    image: '/photos/4.jpg',
    caption: 'Your Sweetest Laugh',
    date: 'My Favorite Sound',
    flowerType: 'Forget-Me-Not',
    flowerEmoji: '💠',
    personalMessage:
      'Your genuine, unreserved laugh is the happiest sound my ears could ever hear. Whenever you laugh, the entire room feels warm and bright.',
    altText: 'Your sweetest laugh',
  },
  {
    id: 'bouquet-photo-5',
    image: '/photos/5.jpg',
    caption: 'Your Grace & Elegance',
    date: 'Pure Poise',
    flowerType: 'Blue Hydrangea',
    flowerEmoji: '🪻',
    personalMessage:
      'The gentle, graceful way you carry yourself every day. From your soft posture to the calmness you bring with you, you are poetry in motion.',
    altText: 'Your effortless grace and elegance',
  },
  {
    id: 'bouquet-photo-6',
    image: '/photos/6.jpg',
    caption: 'Your Cutest Expressions',
    date: 'Playful & Adorable',
    flowerType: 'White Lily',
    flowerEmoji: '🪷',
    personalMessage:
      'Every little pout, roll of the eyes, and adorable giggle you make. Even your simplest reactions are so cute that I cannot stop smiling at you.',
    altText: 'Your cute expressions',
  },
  {
    id: 'bouquet-photo-7',
    image: '/photos/7.jpg',
    caption: 'Your Soft & Caring Heart',
    date: 'Pure Gold',
    flowerType: 'Morning Glory',
    flowerEmoji: '🌺',
    personalMessage:
      'You have the most tender, thoughtful heart. You care so deeply, notice the little things, and love with such genuine purity that it leaves me in awe.',
    altText: 'Your soft and caring heart',
  },

  // --- Layer 2: Upper Mid Tier (6 Blooms) ---
  {
    id: 'bouquet-photo-8',
    image: '/photos/8.jpg',
    caption: 'My Sunshine on Cloudy Days',
    date: 'Endless Warmth',
    flowerType: 'Butterscotch Tulip',
    flowerEmoji: '🌷',
    personalMessage:
      'Whenever life gets hectic or difficult, just thinking of you brings an instant calm. You are the warmth that chases away every single cloud in my mind.',
    altText: 'You as pure sunshine and warmth',
  },
  {
    id: 'bouquet-photo-9',
    image: '/photos/9.jpg',
    caption: 'Your Enchanting Natural Glow',
    date: 'Naturally Flawless',
    flowerType: 'Golden Marigold',
    flowerEmoji: '🌼',
    personalMessage:
      'You do not need fancy filters or extra effort to look breathtaking. Your natural simplicity and innocent glow outshine everything else around you.',
    altText: 'Your natural glow and simplicity',
  },
  {
    id: 'bouquet-photo-10',
    image: '/photos/10.jpg',
    caption: 'Your Tender & Loving Soul',
    date: 'Sweetest Person in My Life',
    flowerType: 'Red Camellia',
    flowerEmoji: '🌺',
    personalMessage:
      'Being loved by you is the greatest privilege of my life. Your kindness wraps around me like a blanket, reminding me how fortunate I am every single second.',
    altText: 'Your tender and loving soul',
  },
  {
    id: 'bouquet-photo-11',
    image: '/photos/11.jpg',
    caption: 'Your Cutest Smile & Cheeks',
    date: 'Unbearably Precious',
    flowerType: 'Lotus Blossom',
    flowerEmoji: '🪷',
    personalMessage:
      'Your little nose and those cheeks whenever you smile shyly or blush. I could spend hours just looking at you and admiring how impossibly cute you are.',
    altText: 'You looking unbearably precious',
  },
  {
    id: 'bouquet-photo-12',
    image: '/photos/12.jpg',
    caption: 'Your Charming & Playful Spirit',
    date: 'Full of Life',
    flowerType: 'Violet Petal',
    flowerEmoji: '💜',
    personalMessage:
      'The funny jokes, the playful teasing, and the lively energy you bring into my world. You make ordinary days feel like exciting adventures just by being you.',
    altText: 'Your charming and playful spirit',
  },
  {
    id: 'bouquet-photo-13',
    image: '/photos/13.jpg',
    caption: 'A Work of Art',
    date: 'Breathtaking Beauty',
    flowerType: 'Crimson Rose',
    flowerEmoji: '🌹',
    personalMessage:
      'If someone asked me to define beauty, I would just show them a photo of you. You are striking, delicate, and gorgeous in ways words could never fully capture.',
    altText: 'You as a living work of art',
  },

  // --- Layer 3: Central Heart Tier (5 Blooms with Queen Blossom in Center) ---
  {
    id: 'bouquet-photo-14',
    image: '/photos/14.jpg',
    caption: 'My Queen — Absolute Perfection',
    date: 'Center of My Universe',
    flowerType: 'Royal Orchid & Sunflower',
    flowerEmoji: '👑',
    personalMessage:
      'The centerpiece of this bouquet, because you are the center of my entire universe. In my eyes, nobody on this planet is more beautiful, more special, or more cherished than you, my Queen.',
    altText: 'Centerpiece Queen Blossom for you',
  },
  {
    id: 'bouquet-photo-15',
    image: '/photos/15.jpg',
    caption: 'Your Calming & Peaceful Presence',
    date: 'My Safe Harbor',
    flowerType: 'White Daisy',
    flowerEmoji: '🌼',
    personalMessage:
      'Just sitting beside you or hearing your voice puts my mind in a state of absolute peace. You make the noisy world go silent and make me feel completely safe.',
    altText: 'Your calming and peaceful presence',
  },
  {
    id: 'bouquet-photo-16',
    image: '/photos/16.jpg',
    caption: 'My Dream Come True',
    date: 'Everything & More',
    flowerType: 'Pink Peony',
    flowerEmoji: '🌸',
    personalMessage:
      'You are everything I ever wished for, and a thousand times better than anything I could have imagined. Loving you is the easiest, sweetest thing I have ever done.',
    altText: 'You as the girl of my dreams',
  },
  {
    id: 'bouquet-photo-17',
    image: '/photos/17.jpg',
    caption: 'Your Irresistible Sweetness',
    date: 'Sweeter Than Honey',
    flowerType: 'Velvet Rose',
    flowerEmoji: '🌹',
    personalMessage:
      'The cute little ways you express affection, from gentle whispers to sweet messages. You are sweeter than anything in this entire world.',
    altText: 'Your irresistible sweetness',
  },
  {
    id: 'bouquet-photo-18',
    image: '/photos/18.jpg',
    caption: 'The Most Stunning Girl in the World',
    date: 'Unmatched Charm',
    flowerType: 'Blush Dahlia',
    flowerEmoji: '🌺',
    personalMessage:
      'My eyes will never wander because I have already found the most stunning girl in the world. Every angle of you is pure perfection to me.',
    altText: 'You looking stunning from every angle',
  },

  // --- Layer 4: Lower Mid Tier (6 Blooms) ---
  {
    id: 'bouquet-photo-19',
    image: '/photos/19.jpg',
    caption: 'Your Warm & Comforting Embrace',
    date: 'My Favorite Place',
    flowerType: 'Everlasting Clover',
    flowerEmoji: '🍀',
    personalMessage:
      'Your hugs have the magical power to heal every ache in my chest. Being close to you is where I always want to be.',
    altText: 'Your warm and comforting presence',
  },
  {
    id: 'bouquet-photo-20',
    image: '/photos/20.jpg',
    caption: 'Your Inspiring Passion & Heart',
    date: 'Endlessly Admirable',
    flowerType: 'Golden Sunflower',
    flowerEmoji: '🌻',
    personalMessage:
      'I admire how dedicated, focused, and passionate you are. Seeing you strive for your goals inspires me to be a better person every single day.',
    altText: 'Your inspiring passion and determination',
  },
  {
    id: 'bouquet-photo-21',
    image: '/photos/21.jpg',
    caption: 'Your Gentle & Reassuring Voice',
    date: 'Sweetest Melody',
    flowerType: 'Sweet Alyssum',
    flowerEmoji: '🌸',
    personalMessage:
      'Hearing you talk softly, share your thoughts, and say my name is music to my ears. I could listen to you speak for the rest of my life.',
    altText: 'Your gentle and melodious voice',
  },
  {
    id: 'bouquet-photo-22',
    image: '/photos/22.jpg',
    caption: 'The Sparkle in Your Eyes',
    date: 'Pure Starlight',
    flowerType: "Baby's Breath Spray",
    flowerEmoji: '✨',
    personalMessage:
      'When the light hits your eyes and you look up at me with that gentle smile, my breath catches every single time. You are truly angelic.',
    altText: 'The sparkle in your gorgeous eyes',
  },
  {
    id: 'bouquet-photo-23',
    image: '/photos/23.jpg',
    caption: 'Your Kindness & Soft Heart',
    date: 'Gentle Soul',
    flowerType: 'Gardenia',
    flowerEmoji: '💐',
    personalMessage:
      'Your heart is so gentle, so forgiving, and so kind. In a world full of noise, your softness is the rarest, most beautiful treasure.',
    altText: 'Your kindness and softness',
  },
  {
    id: 'bouquet-photo-24',
    image: '/photos/24.jpg',
    caption: 'My Favorite Person in the World',
    date: 'One in Eight Billion',
    flowerType: 'Eternal White Lily',
    flowerEmoji: '🪷',
    personalMessage:
      'Out of eight billion people on this planet, you are my undisputed favorite. My best friend, my soulmate, my love, and my entire world.',
    altText: 'You as my forever favorite person',
  },

  // --- Layer 5: Base Tier near Silk Bow (2 Blooms) ---
  {
    id: 'bouquet-photo-25',
    image: '/photos/25.jpg',
    caption: 'Your Quiet Strength & Resilience',
    date: 'Beautiful & Strong',
    flowerType: 'Velvet Carnation',
    flowerEmoji: '🌺',
    personalMessage:
      'You are not just breathtakingly beautiful on the outside — you possess a quiet, resilient strength inside that I respect and cherish with all my heart.',
    altText: 'Your quiet strength and resilience',
  },
  {
    id: 'bouquet-photo-26',
    image: '/photos/26.jpg',
    caption: 'My Heart’s Greatest Treasure',
    date: 'Forever & Always',
    flowerType: 'Stargazer Lily',
    flowerEmoji: '🌟',
    personalMessage:
      'To the most precious, gorgeous, and lovable girl to ever exist. Every bloom in this bouquet belongs to you, just like every beat of my heart belongs to you forever.',
    altText: 'You as my hearts eternal treasure',
  },
];
