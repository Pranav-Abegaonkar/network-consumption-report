import { Popover, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useParticipant, useMeeting } from "@videosdk.live/react-sdk";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { useMediaQuery } from "react-responsive";
import useIsMobile from "../hooks/useIsMobile";
import useIsTab from "../hooks/useIsTab";
import useWindowSize from "../hooks/useWindowSize";
import MicOffSmallIcon from "../icons/MicOffSmallIcon";
import NetworkIcon from "../icons/NetworkIcon";
import SpeakerIcon from "../icons/SpeakerIcon";
import { getQualityScore, nameTructed } from "../utils/common";
import * as ReactDOM from "react-dom";
import { useMeetingAppContext } from "../MeetingAppContextDef";



// working component without UI changes in onstreampause
// export const CornerDisplayName = ({
//   participantId,
//   isPresenting,
//   displayName,
//   isLocal,
//   micOn,
//   mouseOver,
//   isActiveSpeaker,
// }) => {
//   const isMobile = useIsMobile();
//   const isTab = useIsTab();
//   const isLGDesktop = useMediaQuery({ minWidth: 1024, maxWidth: 1439 });
//   const isXLDesktop = useMediaQuery({ minWidth: 1440 });

//   const { height: windowHeight } = useWindowSize();

//   const [statsBoxHeightRef, setStatsBoxHeightRef] = useState(null);
//   const [statsBoxWidthRef, setStatsBoxWidthRef] = useState(null);
//   const [isPaused, setIsPaused] = useState(false);


//   const [coords, setCoords] = useState({}); // takes current button coordinates

//   const statsBoxHeight = useMemo(
//     () => statsBoxHeightRef?.offsetHeight,
//     [statsBoxHeightRef]
//   );

//   const statsBoxWidth = useMemo(
//     () => statsBoxWidthRef?.offsetWidth,
//     [statsBoxWidthRef]
//   );

//   const analyzerSize = isXLDesktop
//     ? 32
//     : isLGDesktop
//     ? 28
//     : isTab
//     ? 24
//     : isMobile
//     ? 20
//     : 18;

//   const show = useMemo(() => mouseOver, [mouseOver]);

//   const {
//     webcamStream,
//     micStream,
//     screenShareStream,
//     getVideoStats,
//     getAudioStats,
//     getShareStats,
//     getShareAudioStats
//   } = useParticipant(participantId,{
//     onStreamPaused: ({ kind, reason }) => {
//     console.log("Stream paused:", kind, reason);
//     setIsPaused(true); //  trigger black screen
//   },
//   onStreamResumed: ({ kind, reason }) => {
//     console.log("Stream resumed:", kind, reason);
//     setIsPaused(false); //  remove black screen
//   },
//   });

//   const statsIntervalIdRef = useRef();
//   const [score, setScore] = useState({});
//   const [audioStats, setAudioStats] = useState({});
//   const [videoStats, setVideoStats] = useState({});

//   const updateStats = async () => {
//     let stats = [];
//     let audioStats = [];
//     let videoStats = [];
//     if (isPresenting) {
//       stats = await getShareStats();

//     } else if (webcamStream) {
//       stats = await getVideoStats();
//     } else if (micStream) {
//       stats = await getAudioStats();
//     }
// if (webcamStream || micStream || isPresenting) {
//   videoStats = isPresenting ? await getShareStats() : await getVideoStats();
//   audioStats = isPresenting ? await getShareAudioStats() : await getAudioStats();

//   // ✅ Log limitation reason for local participant
//   if (isLocal && videoStats && videoStats[0]?.limitation?.reason) {
//     console.log("Video Limitation Reason:", videoStats[0].limitation.reason);
//   }
// }



//     let score = stats
//       ? stats.length > 0
//         ? getQualityScore(stats[0])
//         : 100
//       : 100;

//     setScore(score);
//     setAudioStats(audioStats);
//     setVideoStats(videoStats);
//   };

//   const qualityStateArray = [
//     { label: "", audio: "Audio", video: "Video" },
//     {
//       label: "Latency",
//       audio:
//         audioStats && audioStats[0]?.rtt ? `${audioStats[0]?.rtt} ms` : "-",
//       video:
//         videoStats && videoStats[0]?.rtt ? `${videoStats[0]?.rtt} ms` : "-",
//     },
//     {
//       label: "Jitter",
//       audio:
//         audioStats && audioStats[0]?.jitter
//           ? `${parseFloat(audioStats[0]?.jitter).toFixed(2)} ms`
//           : "-",
//       video:
//         videoStats && videoStats[0]?.jitter
//           ? `${parseFloat(videoStats[0]?.jitter).toFixed(2)} ms`
//           : "-",
//     },
//     {
//       label: "Packet Loss",
//       audio: audioStats
//         ? audioStats[0]?.packetsLost
//           ? `${parseFloat(
//               (audioStats[0]?.packetsLost * 100) / audioStats[0]?.totalPackets
//             ).toFixed(2)}%`
//           : "-"
//         : "-",
//       video: videoStats
//         ? videoStats[0]?.packetsLost
//           ? `${parseFloat(
//               (videoStats[0]?.packetsLost * 100) / videoStats[0]?.totalPackets
//             ).toFixed(2)}%`
//           : "-"
//         : "-",
//     },
//     {
//       label: "Bitrate",
//       audio:
//         audioStats && audioStats[0]?.bitrate
//           ? `${parseFloat(audioStats[0]?.bitrate).toFixed(2)} kb/s`
//           : "-",
//       video:
//         videoStats && videoStats[0]?.bitrate
//           ? `${parseFloat(videoStats[0]?.bitrate).toFixed(2)} kb/s`
//           : "-",
//     },
//     {
//       label: "Frame rate",
//       audio: "-",
//       video:
//         videoStats &&
//         (videoStats[0]?.size?.framerate === null ||
//           videoStats[0]?.size?.framerate === undefined)
//           ? "-"
//           : `${videoStats ? videoStats[0]?.size?.framerate : "-"}`,
//     },
//     {
//       label: "Resolution",
//       audio: "-",
//       video: videoStats
//         ? videoStats && videoStats[0]?.size?.width === null
//           ? "-"
//           : `${videoStats[0]?.size?.width}x${videoStats[0]?.size?.height}`
//         : "-",
//     },
//     {
//       label: "Codec",
//       audio: audioStats && audioStats[0]?.codec ? audioStats[0]?.codec : "-",
//       video: videoStats && videoStats[0]?.codec ? videoStats[0]?.codec : "-",
//     },
//     {
//       label: "Cur. Layers",
//       audio: "-",
//       video:
//         videoStats && !isLocal
//           ? videoStats && videoStats[0]?.currentSpatialLayer === null
//             ? "-"
//             : `S:${videoStats[0]?.currentSpatialLayer || 0} T:${
//                 videoStats[0]?.currentTemporalLayer || 0
//               }`
//           : "-",
//     },
//     {
//       label: "Pref. Layers",
//       audio: "-",
//       video:
//         videoStats && !isLocal
//           ? videoStats && videoStats[0]?.preferredSpatialLayer === null
//             ? "-"
//             : `S:${videoStats[0]?.preferredSpatialLayer || 0} T:${
//                 videoStats[0]?.preferredTemporalLayer || 0
//               }`
//           : "-",
//     },
//   ];

//   useEffect(() => {
//     if (webcamStream || micStream || screenShareStream) {
//       updateStats();

//       if (statsIntervalIdRef.current) {
//         clearInterval(statsIntervalIdRef.current);
//       }

//       statsIntervalIdRef.current = setInterval(updateStats, 500);
//     } else {
//       if (statsIntervalIdRef.current) {
//         clearInterval(statsIntervalIdRef.current);
//         statsIntervalIdRef.current = null;
//       }
//     }

//     return () => {
//       if (statsIntervalIdRef.current) clearInterval(statsIntervalIdRef.current);
//     };
//   }, [webcamStream, micStream, screenShareStream]);

//   return (
//     <>
//       <div
//         className="absolute bottom-2 left-2 rounded-md flex items-center justify-center p-2"
//         style={{
//           backgroundColor: "#00000066",
//           transition: "all 200ms",
//           transitionTimingFunction: "linear",
//           transform: `scale(${show ? 1 : 0})`,
//         }}
//       >
//         {!micOn && !isPresenting ? (
//           <MicOffSmallIcon fillcolor="white" />
//         ) : micOn && isActiveSpeaker ? (
//           <SpeakerIcon />
//         ) : null}
//         <p className="text-sm text-white ml-0.5">
//           {isPresenting
//             ? isLocal
//               ? `You are presenting`
//               : `${nameTructed(displayName, 15)} is presenting`
//             : isLocal
//             ? "You"
//             : nameTructed(displayName, 26)}
//         </p>
//       </div>

//       {(webcamStream || micStream || screenShareStream) && (
//         <div>
//           <div
//             onClick={(e) => {
//               e.stopPropagation();
//             }}
//             className="absolute top-2 right-2 rounded-md  p-2 cursor-pointer "
//           >
//             <Popover className="relative ">
//               {({ close }) => (
//                 <>
//                   <Popover.Button
//                     className={`absolute right-0 top-0 rounded-md flex items-center justify-center p-1.5 cursor-pointer`}
//                     style={{
//                       backgroundColor:
//                         score > 7
//                           ? "#3BA55D"
//                           : score > 4
//                           ? "#faa713"
//                           : "#FF5D5D",
//                     }}
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       const rect = e.target.getBoundingClientRect();
//                       setCoords({
//                         left: Math.round(rect.x + rect.width / 2),
//                         top: Math.round(rect.y + window.scrollY),
//                       });
//                     }}
//                   >
//                     <div>
//                       <NetworkIcon
//                         color1={"#ffffff"}
//                         color2={"#ffffff"}
//                         color3={"#ffffff"}
//                         color4={"#ffffff"}
//                         style={{
//                           height: analyzerSize * 0.6,
//                           width: analyzerSize * 0.6,
//                         }}
//                       />
//                     </div>
//                   </Popover.Button>
//                   <Transition
//                     as={Fragment}
//                     enter="transition ease-out duration-200"
//                     enterFrom="opacity-0 translate-y-1"
//                     enterTo="opacity-100 translate-y-0"
//                     leave="transition ease-in duration-150"
//                     leaveFrom="opacity-100 translate-y-0"
//                     leaveTo="opacity-0 translate-y-1"
//                   >
//                     <Popover.Panel style={{ zIndex: 999 }} className="absolute">
//                       {ReactDOM.createPortal(
//                         <div
//                           ref={setStatsBoxWidthRef}
//                           style={{
//                             top:
//                               coords?.top + statsBoxHeight > windowHeight
//                                 ? windowHeight - statsBoxHeight - 20
//                                 : coords?.top,
//                             left:
//                               coords?.left - statsBoxWidth < 0
//                                 ? 12
//                                 : coords?.left - statsBoxWidth,
//                           }}
//                           className={`absolute`}
//                         >
//                           <div
//                             ref={setStatsBoxHeightRef}
//                             className="bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 "
//                           >
//                             <div
//                               className={`p-[9px] flex items-center justify-between rounded-t-lg`}
//                               style={{
//                                 backgroundColor:
//                                   score > 7
//                                     ? "#3BA55D"
//                                     : score > 4
//                                     ? "#faa713"
//                                     : "#FF5D5D",
//                               }}
//                             >
//                               <p className="text-sm text-white font-semibold">{`Quality Score : ${
//                                 score > 7
//                                   ? "Good"
//                                   : score > 4
//                                   ? "Average"
//                                   : "Poor"
//                               }`}</p>

//                               <button
//                                 className="cursor-pointer text-white hover:bg-[#ffffff33] rounded-full px-1 text-center"
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   close();
//                                 }}
//                               >
//                                 <XMarkIcon
//                                   className="text-white"
//                                   style={{ height: 16, width: 16 }}
//                                 />
//                               </button>
//                             </div>
//                             <div className="flex">
//                               <div className="flex flex-col">
//                                 {qualityStateArray.map((item, index) => {
//                                   return (
//                                     <div
//                                       className="flex"
//                                       style={{
//                                         borderBottom:
//                                           index === qualityStateArray.length - 1
//                                             ? ""
//                                             : `1px solid #ffffff33`,
//                                       }}
//                                     >
//                                       <div className="flex flex-1 items-center w-[120px]">
//                                         {index !== 0 && (
//                                           <p className="text-xs text-white my-[6px] ml-2">
//                                             {item.label}
//                                           </p>
//                                         )}
//                                       </div>
//                                       <div
//                                         className="flex flex-1 items-center justify-center"
//                                         style={{
//                                           borderLeft: `1px solid #ffffff33`,
//                                         }}
//                                       >
//                                         <p className="text-xs text-white my-[6px] w-[80px] text-center">
//                                           {item.audio}
//                                         </p>
//                                       </div>
//                                       <div
//                                         className="flex flex-1 items-center justify-center"
//                                         style={{
//                                           borderLeft: `1px solid #ffffff33`,
//                                         }}
//                                       >
//                                         <p className="text-xs text-white my-[6px] w-[80px] text-center">
//                                           {item.video}
//                                         </p>
//                                       </div>
//                                     </div>
//                                   );
//                                 })}
//                               </div>
//                             </div>
//                           </div>
//                         </div>,
//                         document.body
//                       )}
//                     </Popover.Panel>
//                   </Transition>
//                 </>
//               )}
//             </Popover>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };


export const CornerDisplayName = ({
  participantId,
  isPresenting,
  displayName,
  isLocal,
  micOn,
  mouseOver,
  isActiveSpeaker,
  setIsPaused, // 🔥 Pass this from ParticipantView
}) => {
  const isMobile = useIsMobile();
  const isTab = useIsTab();
  const isLGDesktop = useMediaQuery({ minWidth: 1024, maxWidth: 1439 });
  const isXLDesktop = useMediaQuery({ minWidth: 1440 });

  const { height: windowHeight } = useWindowSize();
  const [statsBoxHeightRef, setStatsBoxHeightRef] = useState(null);
  const [statsBoxWidthRef, setStatsBoxWidthRef] = useState(null);
  const [coords, setCoords] = useState({});

  const statsBoxHeight = useMemo(() => statsBoxHeightRef?.offsetHeight, [statsBoxHeightRef]);
  const statsBoxWidth = useMemo(() => statsBoxWidthRef?.offsetWidth, [statsBoxWidthRef]);

  const analyzerSize = isXLDesktop
    ? 32
    : isLGDesktop
    ? 28
    : isTab
    ? 24
    : isMobile
    ? 20
    : 18;

  const show = useMemo(() => mouseOver, [mouseOver]);

  const {
    webcamStream,
    micStream,
    screenShareStream,
    getVideoStats,
    getAudioStats,
    getShareStats,
    getShareAudioStats,
  } = useParticipant(participantId, {
    onStreamPaused: ({ kind, reason }) => {
      console.log("Stream paused:", kind, reason);
      setIsPaused(true); // 🔥 set external paused state
    },
    onStreamResumed: ({ kind, reason }) => {
      console.log("Stream resumed:", kind, reason);
      setIsPaused(false); // 🔥 unset external paused state
    },
  });

  const statsIntervalIdRef = useRef();
  const [score, setScore] = useState({});
  const [audioStats, setAudioStats] = useState({});
  const [videoStats, setVideoStats] = useState({});

  const updateStats = async () => {
    let stats = [];
    let audioStats = [];
    let videoStats = [];

    if (isPresenting) {
      stats = await getShareStats();
    } else if (webcamStream) {
      stats = await getVideoStats();
    } else if (micStream) {
      stats = await getAudioStats();
    }

    if (webcamStream || micStream || isPresenting) {
      videoStats = isPresenting ? await getShareStats() : await getVideoStats();
      audioStats = isPresenting ? await getShareAudioStats() : await getAudioStats();

      if (isLocal && videoStats?.[0]?.limitation?.reason) {
        console.log("Video Limitation Reason:", videoStats[0].limitation.reason);
      }
    }

    const score = stats?.length > 0 ? getQualityScore(stats[0]) : 100;
    setScore(score);
    setAudioStats(audioStats);
    setVideoStats(videoStats);
  };

  const qualityStateArray = [
    { label: "", audio: "Audio", video: "Video" },
    {
      label: "Latency",
      audio: audioStats?.[0]?.rtt ? `${audioStats[0].rtt} ms` : "-",
      video: videoStats?.[0]?.rtt ? `${videoStats[0].rtt} ms` : "-",
    },
    {
      label: "Jitter",
      audio: audioStats?.[0]?.jitter
        ? `${parseFloat(audioStats[0].jitter).toFixed(2)} ms`
        : "-",
      video: videoStats?.[0]?.jitter
        ? `${parseFloat(videoStats[0].jitter).toFixed(2)} ms`
        : "-",
    },
    {
      label: "Packet Loss",
      audio: audioStats?.[0]?.packetsLost
        ? `${parseFloat(
            (audioStats[0].packetsLost * 100) / audioStats[0]?.totalPackets
          ).toFixed(2)}%`
        : "-",
      video: videoStats?.[0]?.packetsLost
        ? `${parseFloat(
            (videoStats[0].packetsLost * 100) / videoStats[0]?.totalPackets
          ).toFixed(2)}%`
        : "-",
    },
    {
      label: "Bitrate",
      audio: audioStats?.[0]?.bitrate
        ? `${parseFloat(audioStats[0].bitrate).toFixed(2)} kb/s`
        : "-",
      video: videoStats?.[0]?.bitrate
        ? `${parseFloat(videoStats[0].bitrate).toFixed(2)} kb/s`
        : "-",
    },
    {
      label: "Frame rate",
      audio: "-",
      video:
        videoStats?.[0]?.size?.framerate != null
          ? `${videoStats[0].size.framerate}`
          : "-",
    },
    {
      label: "Resolution",
      audio: "-",
      video:
        videoStats?.[0]?.size?.width != null
          ? `${videoStats[0].size.width}x${videoStats[0].size.height}`
          : "-",
    },
    {
      label: "Codec",
      audio: audioStats?.[0]?.codec || "-",
      video: videoStats?.[0]?.codec || "-",
    },
    {
      label: "Cur. Layers",
      audio: "-",
      video:
        videoStats?.[0]?.currentSpatialLayer != null && !isLocal
          ? `S:${videoStats[0].currentSpatialLayer} T:${videoStats[0].currentTemporalLayer}`
          : "-",
    },
    {
      label: "Pref. Layers",
      audio: "-",
      video:
        videoStats?.[0]?.preferredSpatialLayer != null && !isLocal
          ? `S:${videoStats[0].preferredSpatialLayer} T:${videoStats[0].preferredTemporalLayer}`
          : "-",
    },
  ];

  useEffect(() => {
    if (webcamStream || micStream || screenShareStream) {
      updateStats();
      if (statsIntervalIdRef.current) clearInterval(statsIntervalIdRef.current);
      statsIntervalIdRef.current = setInterval(updateStats, 500);
    } else {
      if (statsIntervalIdRef.current) clearInterval(statsIntervalIdRef.current);
    }

    return () => {
      if (statsIntervalIdRef.current) clearInterval(statsIntervalIdRef.current);
    };
  }, [webcamStream, micStream, screenShareStream]);

  return (
    <>
      <div
        className="absolute bottom-2 left-2 rounded-md flex items-center justify-center p-2"
        style={{
          backgroundColor: "#00000066",
          transition: "all 200ms",
          transitionTimingFunction: "linear",
          transform: `scale(${show ? 1 : 0})`,
        }}
      >
        {!micOn && !isPresenting ? (
          <MicOffSmallIcon fillcolor="white" />
        ) : micOn && isActiveSpeaker ? (
          <SpeakerIcon />
        ) : null}
        <p className="text-sm text-white ml-0.5">
          {isPresenting
            ? isLocal
              ? `You are presenting`
              : `${nameTructed(displayName, 15)} is presenting`
            : isLocal
            ? "You"
            : nameTructed(displayName, 26)}
        </p>
      </div>

      {(webcamStream || micStream || screenShareStream) && (
        <div>
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-2 right-2 rounded-md  p-2 cursor-pointer"
          >
            <Popover className="relative">
              {({ close }) => (
                <>
                  <Popover.Button
                    className="absolute right-0 top-0 rounded-md flex items-center justify-center p-1.5 cursor-pointer"
                    style={{
                      backgroundColor:
                        score > 7 ? "#3BA55D" : score > 4 ? "#faa713" : "#FF5D5D",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.target.getBoundingClientRect();
                      setCoords({
                        left: Math.round(rect.x + rect.width / 2),
                        top: Math.round(rect.y + window.scrollY),
                      });
                    }}
                  >
                    <NetworkIcon
                      color1={"#ffffff"}
                      color2={"#ffffff"}
                      color3={"#ffffff"}
                      color4={"#ffffff"}
                      style={{
                        height: analyzerSize * 0.6,
                        width: analyzerSize * 0.6,
                      }}
                    />
                  </Popover.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                  >
                    <Popover.Panel style={{ zIndex: 999 }} className="absolute">
                      {ReactDOM.createPortal(
                        <div
                          ref={setStatsBoxWidthRef}
                          style={{
                            top:
                              coords?.top + statsBoxHeight > windowHeight
                                ? windowHeight - statsBoxHeight - 20
                                : coords?.top,
                            left:
                              coords?.left - statsBoxWidth < 0
                                ? 12
                                : coords?.left - statsBoxWidth,
                          }}
                          className="absolute"
                        >
                          <div
                            ref={setStatsBoxHeightRef}
                            className="bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5"
                          >
                            <div
                              className="p-[9px] flex items-center justify-between rounded-t-lg"
                              style={{
                                backgroundColor:
                                  score > 7 ? "#3BA55D" : score > 4 ? "#faa713" : "#FF5D5D",
                              }}
                            >
                              <p className="text-sm text-white font-semibold">{`Quality Score : ${
                                score > 7 ? "Good" : score > 4 ? "Average" : "Poor"
                              }`}</p>
                              <button
                                className="cursor-pointer text-white hover:bg-[#ffffff33] rounded-full px-1 text-center"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  close();
                                }}
                              >
                                <XMarkIcon
                                  className="text-white"
                                  style={{ height: 16, width: 16 }}
                                />
                              </button>
                            </div>
                            <div className="flex">
                              <div className="flex flex-col">
                                {qualityStateArray.map((item, index) => (
                                  <div
                                    key={index}
                                    className="flex"
                                    style={{
                                      borderBottom:
                                        index === qualityStateArray.length - 1
                                          ? ""
                                          : `1px solid #ffffff33`,
                                    }}
                                  >
                                    <div className="flex flex-1 items-center w-[120px]">
                                      {index !== 0 && (
                                        <p className="text-xs text-white my-[6px] ml-2">
                                          {item.label}
                                        </p>
                                      )}
                                    </div>
                                    <div
                                      className="flex flex-1 items-center justify-center"
                                      style={{ borderLeft: `1px solid #ffffff33` }}
                                    >
                                      <p className="text-xs text-white my-[6px] w-[80px] text-center">
                                        {item.audio}
                                      </p>
                                    </div>
                                    <div
                                      className="flex flex-1 items-center justify-center"
                                      style={{ borderLeft: `1px solid #ffffff33` }}
                                    >
                                      <p className="text-xs text-white my-[6px] w-[80px] text-center">
                                        {item.video}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>,
                        document.body
                      )}
                    </Popover.Panel>
                  </Transition>
                </>
              )}
            </Popover>
          </div>
        </div>
      )}
    </>
  );
};


//working participant view
// export function ParticipantView({ participantId }) {
//   const {
//     displayName,
//     webcamStream,
//     micStream,
//     webcamOn,
//     micOn,
//     isLocal,
//     mode,
//     isActiveSpeaker,
//   } = useParticipant(participantId);

//   const { selectedSpeaker } = useMeetingAppContext();
//   const micRef = useRef(null);
//   const [mouseOver, setMouseOver] = useState(false);

//   useEffect(() => {
//     const isFirefox =
//           navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
//     if (micRef.current) {
//         try{
//           if (!isFirefox){
//             micRef.current.setSinkId(selectedSpeaker.id);
//           }
//         }catch(err){
//           console.log("Setting speaker device failed", err);
//         }
//       } 
//   }, [ selectedSpeaker]);

//   useEffect(() => {
//     if (micRef.current) {
//       if (micOn && micStream) {
//         const mediaStream = new MediaStream();
//         mediaStream.addTrack(micStream.track);
//         micRef.current.srcObject = mediaStream;
//         micRef.current
//           .play()
//           .catch((error) =>
//             console.error("micRef.current.play() failed", error)
//           );
//         }else {
//           micRef.current.srcObject = null;
//         }
//       }
//   }, [micStream, micOn, micRef])

//   const webcamMediaStream = useMemo(() => {
//     if (webcamOn && webcamStream) {
//       const mediaStream = new MediaStream();
//       mediaStream.addTrack(webcamStream.track);
//       return mediaStream;
//     }
//   }, [webcamStream, webcamOn]);
//   return mode === "SEND_AND_RECV" ? (
//     <div
//       onMouseEnter={() => {
//         setMouseOver(true);
//       }}
//       onMouseLeave={() => {
//         setMouseOver(false);
//       }}
//       className={`h-full w-full  bg-gray-750 relative overflow-hidden rounded-lg video-cover`}
//     >
//       {/* Download Bitrate Button */}
//       <DownloadBitrateButton participantId={participantId} />
//       <audio ref={micRef} autoPlay muted={isLocal} />
//       {webcamOn ? (
//         <ReactPlayer
//           //
//           playsinline // very very imp prop
//           playIcon={<></>}
//           //
//           pip={false}
//           light={false}
//           controls={false}
//           muted={true}
//           playing={true}
//           //
//           url={webcamMediaStream}
//           //
//           height={"100%"}
//           width={"100%"}
//           onError={(err) => {
//             console.log(err, "participant video error");
//           }}
//         />
//       ) : (
//         <div className="h-full w-full flex items-center justify-center">
//           <div
//             className={`z-10 flex items-center justify-center rounded-full bg-gray-800 2xl:h-[92px] h-[52px] 2xl:w-[92px] w-[52px]`}
//           >
//             <p className="text-2xl text-white">
//               {String(displayName).charAt(0).toUpperCase()}
//             </p>
//           </div>
//         </div>
//       )}
//       <CornerDisplayName
//         {...{
//           isLocal,
//           displayName,
//           micOn,
//           webcamOn,
//           isPresenting: false,
//           participantId,
//           mouseOver,
//           isActiveSpeaker,
//         }}
//       />
//     </div>
//   ) : null;
// }

// DownloadBitrateButton component


export function ParticipantView({ participantId }) {
  const {
    displayName,
    webcamStream,
    micStream,
    webcamOn,
    micOn,
    isLocal,
    mode,
    isActiveSpeaker,
  } = useParticipant(participantId);


  const { selectedSpeaker } = useMeetingAppContext();
  const micRef = useRef(null);
  const [mouseOver, setMouseOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // 🔥 new state

  useEffect(() => {
    const isFirefox = navigator.userAgent.toLowerCase().includes("firefox");
    if (micRef.current && !isFirefox) {
      try {
        micRef.current.setSinkId(selectedSpeaker.id);
      } catch (err) {
        console.log("Setting speaker device failed", err);
      }
    }
  }, [selectedSpeaker]);

  useEffect(() => {
    if (micRef.current) {
      if (micOn && micStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);
        micRef.current.srcObject = mediaStream;
        micRef.current.play().catch((error) =>
          console.error("micRef.current.play() failed", error)
        );
      } else {
        micRef.current.srcObject = null;
      }
    }
  }, [micStream, micOn]);

  const webcamMediaStream = useMemo(() => {
    if (webcamOn && webcamStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      return mediaStream;
    }
  }, [webcamStream, webcamOn]);

  return mode === "SEND_AND_RECV" ? (
    <div
      onMouseEnter={() => setMouseOver(true)}
      onMouseLeave={() => setMouseOver(false)}
      className={`h-full w-full bg-gray-750 relative overflow-hidden rounded-lg video-cover`}
    >
      {isPaused ? (
        <div className="flex h-full w-full items-center justify-center bg-black text-white text-lg font-semibold">
          Stream paused was received
        </div>
      ) : (
        <>
          <DownloadBitrateButton participantId={participantId} />
          <audio ref={micRef} autoPlay muted={isLocal} />
          {webcamOn ? (
            <ReactPlayer
              playsinline
              pip={false}
              light={false}
              controls={false}
              muted={true}
              playing={true}
              url={webcamMediaStream}
              height={"100%"}
              width={"100%"}
              onError={(err) => {
                console.log(err, "participant video error");
              }}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <div className="z-10 flex items-center justify-center rounded-full bg-gray-800 2xl:h-[92px] h-[52px] 2xl:w-[92px] w-[52px]">
                <p className="text-2xl text-white">
                  {String(displayName).charAt(0).toUpperCase()}
                </p>
              </div>
            </div>
          )}
          <CornerDisplayName
            {...{
              isLocal,
              displayName,
              micOn,
              webcamOn,
              isPresenting: false,
              participantId,
              mouseOver,
              isActiveSpeaker,
              setIsPaused, // 🔥 passed to child
            }}
          />
        </>
      )}
    </div>
  ) : null;
}



function DownloadBitrateButton({ participantId }) {
  const {
    getVideoStats,
    getAudioStats,
    webcamStream,
    micStream,
    screenShareStream,
    getShareStats,
    getShareAudioStats,
  } = useParticipant(participantId);
  const [collecting, setCollecting] = useState(false);
  const [statsData, setStatsData] = useState([]); // Array of collected stats
  const intervalRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  // Helper to collect all stats
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
    setStatsData((prev) => [
      ...prev,
      {
        timestamp: new Date().toISOString(),
        participantId,
        audioStats,
        videoStats,
        shareAudioStats,
        shareVideoStats,
      },
    ]);
  };

  // Start collecting stats
  const handleStart = () => {
    if (!collecting) {
      setStatsData([]); // Reset previous data
      setCollecting(true);
      collectStats(); // Collect immediately
      intervalRef.current = setInterval(collectStats, 500);
    }
  };

  // Stop collecting stats
  const handleStop = () => {
    setCollecting(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Download JSON
  const handleDownload = (e) => {
    e.stopPropagation();
    setDownloading(true);
    const json = JSON.stringify(statsData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bitrate_${participantId}_${Date.now()}.json`);
    link.setAttribute('type', 'application/json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloading(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    
    <div style={{ position: 'absolute', top: 2, right: 2, zIndex: 20, display: 'flex', gap: 4 }}>
      <button
        className="bg-green-700 bg-opacity-80 hover:bg-opacity-90 text-xs text-white px-2 py-1 rounded shadow mr-1"
        style={{ pointerEvents: collecting ? 'none' : 'auto', opacity: collecting ? 0.6 : 1 }}
        onClick={handleStart}
        title="Start Collecting Stats"
        disabled={collecting}
      >
        {collecting ? 'Collecting...' : 'Start'}
      </button>
      <button
        className="bg-yellow-700 bg-opacity-80 hover:bg-opacity-90 text-xs text-white px-2 py-1 rounded shadow mr-1"
        style={{ pointerEvents: !collecting ? 'none' : 'auto', opacity: !collecting ? 0.6 : 1 }}
        onClick={handleStop}
        title="Stop Collecting Stats"
        disabled={!collecting}
      >
        Stop
      </button>
      <button
        className="bg-gray-900 bg-opacity-70 hover:bg-opacity-90 text-xs text-white px-2 py-1 rounded shadow"
        style={{ pointerEvents: downloading || !statsData.length ? 'none' : 'auto', opacity: downloading || !statsData.length ? 0.6 : 1 }}
        onClick={handleDownload}
        title="Download Stats as JSON"
        disabled={downloading || !statsData.length}
      >
        {downloading ? 'Downloading...' : 'Download JSON'}
      </button>
    </div>
  );
}
