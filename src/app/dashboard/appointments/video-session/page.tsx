"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
// Dynamically import AgoraUIKit to avoid SSR issues
const AgoraUIKit = dynamic(() => import("agora-react-uikit"), { ssr: false });

import { useAuth } from "../../../../context/AuthContext";
import { useVideoStore } from "../../../../store/videoStore";
import Loader from "../../../components/Loader";
import AgoraChat from "../../../components/agoraChat";
import useAgoraRtm from "../../../../hooks/useAgoraRtm";

// Wrapper to log mount/unmount of AgoraUIKit
function AgoraUIKitLogger(props: any) {
  useEffect(() => {
    console.log("AgoraUIKit mounted");
    return () => {
      console.log("AgoraUIKit unmounted");
    };
  }, []);
  return <AgoraUIKit {...props} />;
}

export default function VideoSessionPage() {
  const [videoCall, setVideoCall] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading: authLoading, user, uid } = useAuth();
  const { 
    token: storeToken,
    rtcToken: storeRtcToken,
    channelName: storeChannel, 
    endCall, 
    setAuthStatus,
    appId: storeAppId,
  } = useVideoStore();

  // Sync auth state with video store whenever auth context changes
  useEffect(() => {
    setAuthStatus(
      isAuthenticated, 
      uid || null, 
      user?.name || null
    );
  }, [isAuthenticated, uid, user, setAuthStatus]);

  // Get parameters from URL if not in store
  const channel = searchParams?.get("channel") || storeChannel;
  const rtcToken = searchParams?.get("rtcToken") || storeRtcToken || storeToken; // backward compatibility
  const appId = searchParams?.get("appId") || storeAppId || process.env.NEXT_PUBLIC_AGORA_APP_ID?.trim() || "082a61eb4220431085400ae5e9d9a8f7";
  
  // Debug logging for App ID and tokens
  useEffect(() => {
    if (!appId) {
      console.error("CRITICAL: Agora App ID is not available in client environment");
    } else {
      console.log(`Agora App ID detected with length: ${appId.length}, first/last chars: ${appId.substring(0, 3)}...${appId.substring(appId.length - 3)}`);
    }
  }, [appId]);

  const [rtcProps, setRtcProps] = useState<{
    appId: string;
    channel: string;
    token: string;
  } | null>(null);

  // RTM Chat integration (restore variables)
  const rtmAppId = appId;
  const rtmChannel = channel || "";
  const rtmUserId = uid || user?.uid || "";
  const { messages, sendMessage } = useAgoraRtm(rtmAppId, rtmChannel, rtmUserId);

  // Redirect if user is not authenticated or missing parameters
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.warn("User is not authenticated. Redirecting to login.");
      router.push("/login");
      return;
    }

    if (!channel || !rtcToken) {
      console.warn("Missing channel or RTC token. Redirecting to appointments.");
      router.push("/dashboard/appointments");
      return;
    }

    if (!appId) {
      console.error("Missing Agora App ID. Cannot initialize video session.");
      alert("Video session configuration error. Please contact support.");
      router.push("/dashboard/appointments");
      return;
    }
  }, [isAuthenticated, authLoading, channel, rtcToken, router, appId]);

  // Initialize Agora UI kit with more explicit validation
  useEffect(() => {
    if (channel && rtcToken && appId && !rtcProps) {
      try {
        // Validate App ID format
        if (appId.length < 10) {
          throw new Error(`Invalid Agora App ID format: length is ${appId.length}, expected 32 characters`);
        }
        
        // Set props for AgoraUIKit - ensuring appId is a proper string without whitespace
        const safeAppId = appId.trim();
        console.log(`Initializing AgoraUIKit with AppID length: ${safeAppId.length}`);
        
        setRtcProps({
          appId: safeAppId,
          channel,
          token: rtcToken,
        });
        
        console.log("Agora RTC Props successfully initialized");
      } catch (error) {
        console.error("Error initializing Agora session:", error);
        alert("An error occurred while initializing the video session. Please try again later.");
      }
    }
  }, [channel, rtcToken, rtcProps, appId]);

  // Only call cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
      import('../../../../utils/mediaUtils').then(({ fullMediaCleanup }) => {
        if (typeof window !== 'undefined' && window._agora) {
          fullMediaCleanup({
            client: window._agora?.client,
            localTracks: window._agora?.localTracks,
            localCameraTrack: window._agora?.localCameraTrack,
            localMicrophoneTrack: window._agora?.localMicrophoneTrack,
          });
        } else {
          fullMediaCleanup();
        }
      });
    };
  }, [endCall]);

  if (authLoading || !rtcProps) {
    return <Loader />;
  }

  return videoCall ? (
    <div className="w-full h-full min-h-screen bg-base-100 flex flex-col items-center justify-start overflow-x-hidden">
      <div
        className="w-full h-full flex flex-col"
        style={{
          maxWidth: "100vw",
          minHeight: "100vh",
          height: "100dvh",
        }}
      >
        <div className="p-4 bg-gray-100 flex justify-between items-center">
          <h1 className="text-xl font-bold">Video Consultation</h1>
          <div className="text-sm">
            {user?.name && <span className="mr-2">Connected as {user.name}</span>}
            <span className="bg-green-500 text-white px-2 py-1 rounded">Live</span>
          </div>
        </div>
        <div className="flex flex-1 flex-col md:flex-row w-full h-full overflow-hidden">
          {/* Video Section */}
          <div
            className="relative flex-1 min-h-[300px] min-w-0 flex items-center justify-center bg-black"
            style={{
              height: "100%",
            }}
          >
            <div className="absolute inset-0 block md:hidden z-10">
              <AgoraUIKitLogger
                rtcProps={rtcProps}
                callbacks={{
                  EndCall: () => setVideoCall(false),
                }}
                styleProps={{
                  localBtnContainer: { zIndex: 20 },
                  UIKitContainer: {
                    height: "100dvh",
                    minHeight: "100dvh",
                    width: "100vw",
                    background: "black",
                  }
                }}
              />
              {/* Mobile Chat Overlay */}
              <div className="block md:hidden absolute bottom-0 left-0 w-full z-30">
                <div className="bg-white bg-opacity-90 rounded-t-xl shadow-lg p-2 flex flex-col">
                  <div className="flex-1 overflow-y-auto max-h-40">
                    <AgoraChat
                      messages={messages}
                      sendMessage={sendMessage}
                      currentUserId={rtmUserId}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden md:block w-full h-full">
              <AgoraUIKitLogger
                rtcProps={rtcProps}
                callbacks={{
                  EndCall: () => setVideoCall(false),
                }}
                styleProps={{
                  localBtnContainer: { zIndex: 20 },
                  UIKitContainer: { height: "100%", minHeight: "300px", background: "black" }
                }}
              />
            </div>
            {/* Mobile Chat Overlay - duplicated for visibility in mobile view */}
            <div className="block md:hidden absolute bottom-0 left-0 w-full z-30">
              <div className="bg-white bg-opacity-90 rounded-t-xl shadow-lg p-2 flex flex-col">
                <div className="flex-1 overflow-y-auto max-h-40">
                  <AgoraChat
                    messages={messages}
                    sendMessage={sendMessage}
                    currentUserId={rtmUserId}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Desktop Chat Section */}
          <div className="hidden md:flex flex-[1_1 0%] max-w-full md:max-w-xs min-h-[120px] min-w-0 bg-white border-t md:border-t-0 md:border-l border-gray-200 flex-col">
            <AgoraChat
              messages={messages}
              sendMessage={sendMessage}
              currentUserId={rtmUserId}
            />
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="text-center p-10">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Call Ended</h3>
      <p className="mb-6 text-gray-600">Your video consultation has ended.</p>
      <div className="flex flex-col space-y-4 items-center">
        <button
          className="btn btn-primary px-6"
          onClick={() => setVideoCall(true)}
        >
          Rejoin Call
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => {
            router.push("/dashboard/appointments");
          }}
        >
          Back to Appointments
        </button>
      </div>
    </div>
  );
}