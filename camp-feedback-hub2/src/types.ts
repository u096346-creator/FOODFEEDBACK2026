/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type FeedbackCategory = 'food' | 'cleaning' | 'laundry';

export type FeedbackSubCategory = 
  | 'breakfast' 
  | 'lunch' 
  | 'dinner' 
  | 'deep_cleaning' 
  | 'regular_cleaning' 
  | 'general';

export interface FeedbackSubmission {
  id: string;
  residentName?: string;
  roomNumber: string;
  timestamp: string;
  category: FeedbackCategory;
  subCategory: FeedbackSubCategory;
  rating: number; // 1 to 5
  tags: string[];
  comment: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

export type Language = 'ar' | 'en';

export interface DiningItem {
  id: string;
  titleAr: string;
  titleEn: string;
  timeAr: string;
  timeEn: string;
  descAr: string;
  descEn: string;
}

export interface ContactItem {
  id: string;
  nameAr: string;
  nameEn: string;
  number: string;
  subNumber: string;
  descAr: string;
  descEn: string;
  urgent: boolean;
}

