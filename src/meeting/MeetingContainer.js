import React, { useState, useEffect, useRef, createRef, memo } from "react";
import { Constants, useMeeting, useParticipant, usePubSub } from "@videosdk.live/react-sdk";
import { BottomBar } from "./components/BottomBar";
import { SidebarConatiner } from "../components/sidebar/SidebarContainer";
import MemorizedParticipantView from "./components/ParticipantView";
import { PresenterView } from "../components/PresenterView";
import { nameTructed, trimSnackBarText } from "../utils/helper";
import WaitingToJoinScreen from "../components/screens/WaitingToJoinScreen";
import ConfirmBox from "../components/ConfirmBox";
import useIsMobile from "../hooks/useIsMobile";
import useIsTab from "../hooks/useIsTab";
import { useMediaQuery } from "react-responsive";
import { toast } from "react-toastify";
import { useMeetingAppContext } from "../MeetingAppContextDef";

function ParticipantStatsCollector({ participantId, collecting, onStats, stopAfterMs = 300000 }) {
  const {
    getVideoStats,
    getAudioStats,
    getShareStats,
    getShareAudioStats,
    webcamStream,
    micStream,
    screenShareStream,
  } = useParticipant(participantId);

  useEffect(() => {
    let intervalId;
    let timeoutId;
    const collectStats = async () => {
      let audioStats = [];
      let videoStats = [];
      let shareAudioStats = [];
      let shareVideoStats = [];
      if (screenShareStream) {
        shareVideoStats = await getShareStats();
        shareAudioStats = await getShareAudioStats();
      }
      if (webcamStream) videoStats = await getVideoStats();
      if (micStream) audioStats = await getAudioStats();
      // Only collect essential fields for KPIs
      const stats = {
        timestamp: new Date().toISOString(),
        participantId,
        audioBitrate: audioStats[0]?.bitrate,
        videoBitrate: videoStats[0]?.bitrate,
        audioRtt: audioStats[0]?.rtt,
        videoRtt: videoStats[0]?.rtt,
        audioJitter: audioStats[0]?.jitter,
        videoJitter: videoStats[0]?.jitter,
        audioPacketLoss: audioStats[0]?.packetsLost,
        videoPacketLoss: videoStats[0]?.packetsLost,
        // Add more fields as needed
      };
      console.log('[ParticipantStatsCollector]', participantId, 'collected stats:', stats);
      onStats(stats);
    };
    if (collecting) {
      console.log('[ParticipantStatsCollector]', participantId, 'START collecting');
      collectStats();
      intervalId = setInterval(collectStats, 2000); // every 2 seconds
      // Stop after max duration
      timeoutId = setTimeout(() => {
        if (intervalId) clearInterval(intervalId);
      }, stopAfterMs);
    } else {
      console.log('[ParticipantStatsCollector]', participantId, 'STOP collecting');
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [collecting, webcamStream, micStream, screenShareStream, participantId, getVideoStats, getAudioStats, getShareStats, getShareAudioStats, onStats, stopAfterMs]);
  return null;
}

export function MeetingContainer({
  onMeetingLeave,
  setIsMeetingLeft,
}) {
  const {
    setSelectedMic,
    setSelectedWebcam,
    setSelectedSpeaker,
  } = useMeetingAppContext();

  const [participantsData, setParticipantsData] = useState([]);

  const ParticipantMicStream = memo(({ participantId }) => {
    // Individual hook for each participant
    const { micStream } = useParticipant(participantId);
  
    useEffect(() => {
  
      if (micStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);
  
        const audioElement = new Audio();
        audioElement.srcObject = mediaStream;
        audioElement.play();

      }
    }, [micStream, participantId]); 
  
    return null;
  }, [participantsData]);

  const { useRaisedHandParticipants } = useMeetingAppContext();
  const bottomBarHeight = 60;

  const [containerHeight, setContainerHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [localParticipantAllowedJoin, setLocalParticipantAllowedJoin] = useState(null);
  const [meetingErrorVisible, setMeetingErrorVisible] = useState(false);
  const [meetingError, setMeetingError] = useState(false);

  const mMeetingRef = useRef();
  const containerRef = createRef();
  const containerHeightRef = useRef();
  const containerWidthRef = useRef();

  useEffect(() => {
    containerHeightRef.current = containerHeight;
    containerWidthRef.current = containerWidth;
  }, [containerHeight, containerWidth]);

  const isMobile = useIsMobile();
  const isTab = useIsTab();
  const isLGDesktop = useMediaQuery({ minWidth: 1024, maxWidth: 1439 });
  const isXLDesktop = useMediaQuery({ minWidth: 1440 });

  const sideBarContainerWidth = isXLDesktop
    ? 400
    : isLGDesktop
      ? 360
      : isTab
        ? 320
        : isMobile
          ? 280
          : 240;

  useEffect(() => {
    containerRef.current?.offsetHeight &&
      setContainerHeight(containerRef.current.offsetHeight);
    containerRef.current?.offsetWidth &&
      setContainerWidth(containerRef.current.offsetWidth);

    window.addEventListener("resize", ({ target }) => {
      containerRef.current?.offsetHeight &&
        setContainerHeight(containerRef.current.offsetHeight);
      containerRef.current?.offsetWidth &&
        setContainerWidth(containerRef.current.offsetWidth);
    });
  }, [containerRef]);

  const { participantRaisedHand } = useRaisedHandParticipants();

  const _handleMeetingLeft = () => {
    setIsMeetingLeft(true);
  };

  const _handleOnRecordingStateChanged = ({ status }) => {
    if (
      status === Constants.recordingEvents.RECORDING_STARTED ||
      status === Constants.recordingEvents.RECORDING_STOPPED
    ) {
      toast(
        `${status === Constants.recordingEvents.RECORDING_STARTED
          ? "Meeting recording is started"
          : "Meeting recording is stopped."
        }`,
        {
          position: "bottom-left",
          autoClose: 4000,
          hideProgressBar: true,
          closeButton: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        }
      );
    }
  };

  function onParticipantJoined(participant) {
    // Change quality to low, med or high based on resolution
    participant && participant.setQuality("high");
  }


  function onEntryResponded(participantId, name) {
    if (mMeetingRef.current?.localParticipant?.id === participantId) {
      if (name === "allowed") {
        setLocalParticipantAllowedJoin(true);
      } else {
        setLocalParticipantAllowedJoin(false);
        setTimeout(() => {
          _handleMeetingLeft();
        }, 3000);
      }
    }
  }

  function onMeetingJoined() {
    console.log("onMeetingJoined");
  }

  function onMeetingLeft() {
    setSelectedMic({ id: null, label: null })
    setSelectedWebcam({ id: null, label: null })
    setSelectedSpeaker({ id: null, label: null })
    onMeetingLeave();
  }

  const _handleOnError = (data) => {
    const { code, message } = data;
    console.log("meetingErr", code, message)

    const joiningErrCodes = [
      4001, 4002, 4003, 4004, 4005, 4006, 4007, 4008, 4009, 4010,
    ];

    const isJoiningError = joiningErrCodes.findIndex((c) => c === code) !== -1;
    const isCriticalError = `${code}`.startsWith("500");

    new Audio(
      isCriticalError
        ? `https://static.videosdk.live/prebuilt/notification_critical_err.mp3`
        : `https://static.videosdk.live/prebuilt/notification_err.mp3`
    ).play();

    setMeetingErrorVisible(true);
    setMeetingError({
      code,
      message: isJoiningError ? "Unable to join meeting!" : message,
    });
  };

  const mMeeting = useMeeting({
    onParticipantJoined,
    onEntryResponded,
    onMeetingJoined,
    onMeetingLeft,
    onError: _handleOnError,
    onRecordingStateChanged: _handleOnRecordingStateChanged,
  });

  const isPresenting = mMeeting.presenterId ? true : false;

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      const participantIds = Array.from(mMeeting.participants.keys());
      console.log("Debounced participantIds", participantIds);

      setParticipantsData(participantIds);
      console.log("Setting participants");
    }, 500); 


    return () => clearTimeout(debounceTimeout);
  }, [mMeeting.participants]);


  useEffect(() => {
    mMeetingRef.current = mMeeting;
  }, [mMeeting]);


  usePubSub("RAISE_HAND", {
    onMessageReceived: (data) => {
      const localParticipantId = mMeeting?.localParticipant?.id;

      const { senderId, senderName } = data;

      const isLocal = senderId === localParticipantId;

      new Audio(
        `https://static.videosdk.live/prebuilt/notification.mp3`
      ).play();

      toast(`${isLocal ? "You" : nameTructed(senderName, 15)} raised hand 🖐🏼`, {
        position: "bottom-left",
        autoClose: 4000,
        hideProgressBar: true,
        closeButton: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });

      participantRaisedHand(senderId);
    },
  });

  usePubSub("CHAT", {
    onMessageReceived: (data) => {
      const localParticipantId = mMeeting?.localParticipant?.id;

      const { senderId, senderName, message } = data;

      const isLocal = senderId === localParticipantId;

      if (!isLocal) {
        new Audio(
          `https://static.videosdk.live/prebuilt/notification.mp3`
        ).play();

        toast(
          `${trimSnackBarText(
            `${nameTructed(senderName, 15)} says: ${message}`
          )}`,
          {
            position: "bottom-left",
            autoClose: 4000,
            hideProgressBar: true,
            closeButton: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          }
        );
      }
    },
  });

  return (
    <div className="fixed inset-0">
      <div ref={containerRef} className="h-full flex flex-col bg-gray-800">
        {typeof localParticipantAllowedJoin === "boolean" ? (
          localParticipantAllowedJoin ? (
            <>
              <div className={` flex flex-1 flex-row bg-gray-800 `}>
                <div className={`flex flex-1 `}>
                  {isPresenting ? (
                    <PresenterView height={containerHeight - bottomBarHeight} />
                  ) : null}
                  {isPresenting && isMobile ? (
                    participantsData.map((participantId) => (
                      <ParticipantMicStream key={participantId} participantId={participantId} />
                    ))
                  ) : (
                    <MemorizedParticipantView isPresenting={isPresenting} />
                  )}
                </div>

                <SidebarConatiner
                  height={containerHeight - bottomBarHeight}
                  sideBarContainerWidth={sideBarContainerWidth}
                />
              </div>

              <BottomBar
                bottomBarHeight={bottomBarHeight}
                setIsMeetingLeft={setIsMeetingLeft}
              />
            </>
          ) : (
            <></>
          )
        ) : (
          !mMeeting.isMeetingJoined && <WaitingToJoinScreen />
        )}
        <ConfirmBox
          open={meetingErrorVisible}
          successText="OKAY"
          onSuccess={() => {
            setMeetingErrorVisible(false);
          }}
          title={`Error Code: ${meetingError.code}`}
          subTitle={meetingError.message}
        />
      </div>
    </div>
  );
}
