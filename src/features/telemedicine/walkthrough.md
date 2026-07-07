# Walkthrough: Telemedicine Module

## Virtual Consultation Flow
1. **Creation**: Sessions are created via `SessionService.createSession`.
2. **Waiting Room**: Patients join the queue using `WaitingRoomService.joinWaitingRoom`. `SessionMetricsService` calculates estimated wait times.
3. **Admission**: The Doctor (Host) admits the patient. The Event Bus triggers `ParticipantJoined`, tracked natively by `TelemedicineAudit`.

## Clinical Data Integration
- During the call, Doctors use `ConsultationService.addClinicalObservation`.
- Once finished, `ConsultationService.generateSummary` compiles notes, prescribed lab/radiology orders, and automatically publishes to the Health Vault.

## Future Media Adapter Integration
- The current implementation serves as the metadata backbone. UI implementations currently provide an empty skeleton. 
- Infrastructure teams can seamlessly inject `<VideoPlayer />` or `<AudioNode />` components within `SessionDetailDrawer`, directly reading the boolean states from `Participant.audioState.muted` and `Participant.videoState.enabled`.
