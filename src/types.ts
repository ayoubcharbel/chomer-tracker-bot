export interface UserData {
  id: string;
  username?: string;
  firstName: string;
  lastName?: string;
  fullName: string;
}

export interface MessageData {
  userId: string;
  messageId: number;
  chatId: string;
  content?: string;
  messageType: MessageType;
  timestamp: Date;
}

export interface StatsData {
  userId: string;
  messageCount: number;
  stickerCount: number;
  totalPoints: number;
}

export interface LeaderboardEntry {
  userId: string;
  username?: string;
  fullName: string;
  messageCount: number;
  stickerCount: number;
  totalPoints: number;
  rank: number;
}

export enum MessageType {
  TEXT = 'TEXT',
  STICKER = 'STICKER',
  PHOTO = 'PHOTO',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  DOCUMENT = 'DOCUMENT',
  VOICE = 'VOICE',
  VIDEO_NOTE = 'VIDEO_NOTE',
  LOCATION = 'LOCATION',
  CONTACT = 'CONTACT',
  ANIMATION = 'ANIMATION',
  POLL = 'POLL',
  DICE = 'DICE',
  GAME = 'GAME',
  VENUE = 'VENUE',
  OTHER = 'OTHER',
}

export interface PeriodStats {
  daily: StatsData[];
  weekly: StatsData[];
  monthly: StatsData[];
}