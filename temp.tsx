// "use client";
// import { fetchAudio } from "@/lib/api";
// import { RawAudioSource } from "@/lib/localTypes";
// import { trimFileName } from "@/lib/utils";
// import { useGlobalStore } from "@/store/global";
// import { useRoomStore } from "@/store/room";
// import { NTPMeasurement } from "@/utils/ntp";
// import {
//   epochNow,
//   NTPResponseMessageType,
//   WSResponseSchema,
// } from "@beatsync/shared";
// import { useEffect } from "react";
// import { toast } from "sonner";


// // Helper function for NTP response handling
// const handleNTPResponse = (response: NTPResponseMessageType) => {
//   const t3 = epochNow();
//   const { t0, t1, t2 } = response;

//   // Calculate round-trip delay and clock offset
//   // See: https://en.wikipedia.org/wiki/Network_Time_Protocol#Clock_synchronization_algorithm
//   const clockOffset = (t1 - t0 + (t2 - t3)) / 2;
//   const roundTripDelay = t3 - t0 - (t2 - t1);

//   const measurement: NTPMeasurement = {
//     t0,
//     t1,
//     t2,
//     t3,
//     roundTripDelay,
//     clockOffset,
//   };

//   return measurement;
// };
// interface WebSocketManagerProps {
//   roomId: string;
//   username: string;
// }

// // No longer need the props interface
// export const WebSocketManager = ({
//   roomId,
//   username,
// }: WebSocketManagerProps) => {
//   // Room state
//   const isLoadingRoom = useRoomStore((state) => state.isLoadingRoom);
//   const setUserId = useRoomStore((state) => state.setUserId);

//   // WebSocket and audio state
//   const setSocket = useGlobalStore((state) => state.setSocket);
//   const socket = useGlobalStore((state) => state.socket);
//   const schedulePlay = useGlobalStore((state) => state.schedulePlay);
//   const schedulePause = useGlobalStore((state) => state.schedulePause);
//   const processSpatialConfig = useGlobalStore((state) => state.processSpatialConfig);

//   const sendNTPRequest = useGlobalStore((state) => state.sendNTPRequest);
//   const addNTPMeasurement = useGlobalStore((state) => state.addNTPMeasurement);
//   const addAudioSource = useGlobalStore((state) => state.addAudioSource);
//   const hasDownloadedAudio = useGlobalStore(
//     (state) => state.hasDownloadedAudio
//   );
//   const setConnectedClients = useGlobalStore((state) => state.setConnectedClients);
//   const isSpatialAudioEnabled = useGlobalStore((state) => state.isSpatialAudioEnabled);
//   const setIsSpatialAudioEnabled = useGlobalStore((state) => state.setIsSpatialAudioEnabled);
//   const processStopSpatialAudio = useGlobalStore((state) => state.processStopSpatialAudio);

//   // Once room has been loaded, connect to the websocket
//   useEffect(() => {
//     if (isLoadingRoom || !roomId || !username) return;
//     console.log("Connecting to websocket");
//     if (socket) {
//       return;
//     }
//     const SOCKET_URL = `ws://localhost:8080/ws?roomId=${roomId}&username=${username}`;
//     console.log("Creating new socket to", SOCKET_URL);
//     const ws = new WebSocket(SOCKET_URL);
//     setSocket(ws);
//     ws.onopen = () => {
//       console.log("Websocket onopen fired.");
//       // Start syncing
//       sendNTPRequest();
//     };

//     ws.onclose = () => {
//       console.log("Websocket onclose fired.");
//     };

//     ws.onmessage = async (msg) => {
//       const response = WSResponseSchema.parse(JSON.parse(msg.data));

//       if (response.type === "NTP_RESPONSE") {
//         const ntpMeasurement = handleNTPResponse(response);
//         addNTPMeasurement(ntpMeasurement);

//         // Check that we have not exceeded the max and then send another NTP request
//         setTimeout(() => {
//           sendNTPRequest();
//         }, 30); // 30ms delay to not overload
//       } 
      
//       else if (response.type === "ROOM_EVENT"){
//         const { event } = response;
//         console.log("Room event:", event);
//         if (event.type === "CLIENT_CHANGE") {
//           setConnectedClients(event.clients);
//         } else if (event.type === "NEW_AUDIO_SOURCE") {
//           console.log("Received new audio source:", response);
//           const { title, id } = event;

//           // Check if we already have this audio file downloaded
//           if (hasDownloadedAudio(id)) {
//             console.log(`Audio file ${id} already downloaded, skipping fetch`);
//             return;
//           }

//           toast.promise(
//             fetchAudio(id)
//               .then(async (blob) => {
//                 console.log("Audio fetched successfully:", id);
//                 try {
//                   const arrayBuffer = await blob.arrayBuffer();
//                   console.log("ArrayBuffer created successfully");

//                   const audioSource: RawAudioSource = {
//                     name: trimFileName(title),
//                     audioBuffer: arrayBuffer,
//                     id: id, // Include ID in the RawAudioSource
//                   };

//                   return addAudioSource(audioSource);
//                 } catch (error) {
//                   console.error("Error processing audio data:", error);
//                   throw new Error("Failed to process audio data");
//                 }
//               })
//               .catch((error) => {
//                 console.error("Error fetching audio:", error);
//                 throw error;
//               }),
//             {
//               loading: "Loading audio...",
//               success: `Added: ${title}`,
//               error: "Failed to load audio",
//             }
//           );
//         }
//       } else if (response.type === "SCHEDULED_ACTION") {
//         // handle scheduling action
//         console.log("Received scheduled action:", response);
//         const { scheduledAction, serverTimeToExecute } = response;

//         if (scheduledAction.type === "PLAY") {
//           schedulePlay({
//             trackTimeSeconds: scheduledAction.trackTimeSeconds,
//             targetServerTime: serverTimeToExecute,
//             audioId: scheduledAction.audioId,
//           });
//         } else if (scheduledAction.type === "PAUSE") {
//           schedulePause({
//             targetServerTime: serverTimeToExecute,
//           });
//         } else if (scheduledAction.type === "SPATIAL_CONFIG") {
//           processSpatialConfig(scheduledAction);
//           if (!isSpatialAudioEnabled) {
//             setIsSpatialAudioEnabled(true);
//           }
//         } else if (scheduledAction.type === "STOP_SPATIAL_AUDIO") {
//           processStopSpatialAudio();
//         }
//       } else if (response.type === "SET_CLIENT_ID") {
//         setUserId(response.clientId);
//       } else {
//         console.log("Unknown response type:", response);
//       }
//     };

//     return () => {
//       // Runs on unmount and dependency change
//       console.log("Running cleanup for WebSocket connection");
//       ws.close();
//     };
//     // Not including socket in the dependency array because it will trigger the close when it's set
//   }, [isLoadingRoom, roomId, username]);

//   return null; // This is a non-visual component
// };
