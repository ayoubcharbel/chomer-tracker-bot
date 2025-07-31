import TelegramBot from 'node-telegram-bot-api';
import { MessageType, UserData, MessageData } from '../types';

export function extractUserData(user: TelegramBot.User): UserData {
  const fullName = user.last_name 
    ? `${user.first_name} ${user.last_name}`
    : user.first_name;

  return {
    id: user.id.toString(),
    username: user.username,
    firstName: user.first_name,
    lastName: user.last_name,
    fullName,
  };
}

export function determineMessageType(msg: TelegramBot.Message): MessageType {
  if (msg.sticker) return MessageType.STICKER;
  if (msg.photo) return MessageType.PHOTO;
  if (msg.video) return MessageType.VIDEO;
  if (msg.audio) return MessageType.AUDIO;
  if (msg.document) return MessageType.DOCUMENT;
  if (msg.voice) return MessageType.VOICE;
  if (msg.video_note) return MessageType.VIDEO_NOTE;
  if (msg.location) return MessageType.LOCATION;
  if (msg.contact) return MessageType.CONTACT;
  if (msg.animation) return MessageType.ANIMATION;
  if (msg.poll) return MessageType.POLL;
  if (msg.dice) return MessageType.DICE;
  if (msg.game) return MessageType.GAME;
  if (msg.venue) return MessageType.VENUE;
  if (msg.new_chat_members) return MessageType.NEW_CHAT_MEMBERS;
  if (msg.left_chat_member) return MessageType.LEFT_CHAT_MEMBER;
  if (msg.new_chat_title) return MessageType.NEW_CHAT_TITLE;
  if (msg.new_chat_photo) return MessageType.NEW_CHAT_PHOTO;
  if (msg.delete_chat_photo) return MessageType.DELETE_CHAT_PHOTO;
  if (msg.group_chat_created) return MessageType.GROUP_CHAT_CREATED;
  if (msg.supergroup_chat_created) return MessageType.SUPERGROUP_CHAT_CREATED;
  if (msg.channel_chat_created) return MessageType.CHANNEL_CHAT_CREATED;
  if (msg.pinned_message) return MessageType.PINNED_MESSAGE;
  if (msg.text) return MessageType.TEXT;
  
  return MessageType.OTHER;
}

export function extractMessageData(msg: TelegramBot.Message): MessageData {
  if (!msg.from) {
    throw new Error('Message has no from field');
  }

  return {
    userId: msg.from.id.toString(),
    messageId: msg.message_id,
    chatId: msg.chat.id.toString(),
    content: msg.text || msg.caption || null,
    messageType: determineMessageType(msg),
    timestamp: new Date(msg.date * 1000),
  };
}

export function formatLeaderboardMessage(leaderboard: any[], period: string): string {
  if (leaderboard.length === 0) {
    return `🏆 *${period.toUpperCase()} LEADERBOARD* 🏆\n\nNo activity recorded yet! Start chatting to see the leaderboard!`;
  }

  let message = `🏆 *${period.toUpperCase()} LEADERBOARD* 🏆\n\n`;
  
  leaderboard.forEach((entry, index) => {
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
    const username = entry.username ? `@${entry.username}` : entry.fullName;
    
    message += `${medal} *${username}*\n`;
    message += `   📨 ${entry.messageCount} messages`;
    if (entry.stickerCount > 0) {
      message += ` | 🎭 ${entry.stickerCount} stickers`;
    }
    message += ` | ⭐ ${entry.totalPoints} points\n\n`;
  });

  message += `_Use /leaderboard [daily|weekly|monthly|all] to see different periods_`;
  
  return message;
}

export function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}