export type SessionType = 'Video Consultation' | 'Audio Consultation' | 'Chat Consultation' | 'Group Consultation' | 'Emergency Consultation' | 'Follow-up Consultation';
export type ParticipantRole = 'Patient' | 'Doctor' | 'Specialist' | 'Interpreter' | 'Caregiver' | 'Nurse' | 'Administrator';

export type SessionStatus = 'Scheduled' | 'Waiting' | 'InProgress' | 'Completed' | 'Cancelled' | 'Expired';
export type CallState = 'Idle' | 'Connecting' | 'Connected' | 'Reconnecting' | 'Disconnected' | 'Failed';
export type ParticipantStatus = 'Invited' | 'Waiting' | 'Joined' | 'Left' | 'Dropped' | 'Blocked';
export type RecordingStatus = 'Idle' | 'Starting' | 'Recording' | 'Paused' | 'Stopped' | 'Failed';
export type ConnectionQuality = 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Disconnected' | 'Unknown';

export interface BandwidthStatistics {
  uploadKbps: number;
  downloadKbps: number;
  packetLossPercentage: number;
  jitterMs: number;
  rttMs: number;
}

export interface NetworkDiagnostics {
  timestamp: string;
  quality: ConnectionQuality;
  stats: BandwidthStatistics;
  browser: string;
  os: string;
}

export interface SessionMetrics {
  durationSeconds: number;
  peakParticipants: number;
  totalInterruptions: number;
  averageQuality: ConnectionQuality;
}

export interface VideoStream {
  id: string;
  enabled: boolean;
  resolution: string;
  framerate: number;
}

export interface AudioStream {
  id: string;
  enabled: boolean;
  muted: boolean;
  volume: number;
}

export interface ScreenShare {
  id: string;
  active: boolean;
  sharedByParticipantId?: string;
  startedAt?: string;
}

export interface Participant {
  id: string;
  userId: string;
  role: ParticipantRole;
  status: ParticipantStatus;
  joinedAt?: string;
  leftAt?: string;
  connectionQuality: ConnectionQuality;
  videoState: VideoStream;
  audioState: AudioStream;
}

export interface DoctorParticipant extends Participant {
  role: 'Doctor' | 'Specialist';
  specialty: string;
  licenseNumber: string;
}

export interface PatientParticipant extends Participant {
  role: 'Patient';
  patientId: string;
}

export interface SessionHost {
  participantId: string;
  controlsEnabled: boolean;
}

export interface SessionToken {
  token: string;
  expiresAt: string;
  issuedAt: string;
}

export interface SessionInvitation {
  id: string;
  sessionId: string;
  participantRole: ParticipantRole;
  inviteeId: string;
  token: SessionToken;
  status: 'Pending' | 'Accepted' | 'Declined' | 'Expired';
}

export interface WaitingRoom {
  id: string;
  sessionId: string;
  participants: Participant[];
  isOpen: boolean;
}

export interface VirtualQueue {
  id: string;
  facilityId: string;
  waitingSessions: string[]; // Session IDs
  averageWaitTimeSeconds: number;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  content: string;
  timestamp: string;
  readBy: string[];
}

export interface ConsultationNote {
  id: string;
  sessionId: string;
  authorId: string;
  content: string;
  type: 'Clinical' | 'Private' | 'Observation';
  timestamp: string;
}

export interface ClinicalObservation {
  id: string;
  type: string;
  value: string;
  unit?: string;
  recordedAt: string;
}

export interface SessionAttachment {
  id: string;
  sessionId: string;
  uploadedBy: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
}

export interface PrescriptionRequest {
  medicationId: string;
  dosage: string;
  instructions: string;
}

export interface LabOrderRequest {
  testCode: string;
  testName: string;
  urgency: 'Routine' | 'Urgent';
}

export interface RadiologyOrderRequest {
  procedureCode: string;
  procedureName: string;
  bodyPart: string;
}

export interface FollowUpRecommendation {
  type: 'InPerson' | 'Virtual';
  recommendedDate: string;
  reason: string;
}

export interface ConsultationSummary {
  id: string;
  sessionId: string;
  chiefComplaint: string;
  diagnosis: string;
  plan: string;
  prescriptions: PrescriptionRequest[];
  labOrders: LabOrderRequest[];
  radiologyOrders: RadiologyOrderRequest[];
  followUp?: FollowUpRecommendation;
  generatedAt: string;
}

export interface SessionRecordingMetadata {
  id: string;
  sessionId: string;
  durationSeconds: number;
  sizeBytes: number;
  downloadUrl: string;
  status: RecordingStatus;
  createdAt: string;
}

export interface TelemedicineSession {
  id: string;
  title: string;
  type: SessionType;
  status: SessionStatus;
  callState: CallState;
  scheduledStartTime: string;
  actualStartTime?: string;
  endTime?: string;
  hostId: string;
  participants: Participant[];
  waitingRoomId?: string;
  screenShare: ScreenShare;
  recordingStatus: RecordingStatus;
  metrics?: SessionMetrics;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface VirtualConsultation extends TelemedicineSession {
  type: 'Video Consultation' | 'Audio Consultation';
  patientId: string;
  doctorId: string;
  summary?: ConsultationSummary;
}
