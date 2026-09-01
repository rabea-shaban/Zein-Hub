import { LiveSessionProvider, LiveSessionStatus } from '../../constants/content.enum.js';

export interface ICreateLiveSessionDTO {
  title: string;
  description?: string;
  provider?: LiveSessionProvider;
  meetingUrl: string;
  meetingPassword?: string;
  startTime: Date;
  endTime: Date;
  recordingUrl?: string;
}

export interface IUpdateLiveSessionDTO {
  title?: string;
  description?: string;
  provider?: LiveSessionProvider;
  meetingUrl?: string;
  meetingPassword?: string;
  startTime?: Date;
  endTime?: Date;
  status?: LiveSessionStatus;
  recordingUrl?: string;
}

export interface IUpdateLiveSessionStatusDTO {
  status: LiveSessionStatus;
}
