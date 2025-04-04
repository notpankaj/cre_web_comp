"use client";
import { DEV_URL } from "@/constant";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const Page = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const email = searchParams.get("email");
  const name = searchParams.get("name");

  console.log({ id, email, name });

  const [token, setToken] = useState("");

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch(`${DEV_URL}/open/jitsiToken`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id, email, name }),
        });
        if (!response.ok) throw new Error("Failed to fetch token");
        const data = await response.json();
        setToken(data.token);
      } catch (error) {
        console.error("Error fetching token:", error);
      }
    };

    fetchToken();
  }, [email, name, id]);

  useEffect(() => {
    if (!token) return;

    const loadJitsiScript = () => {
      const script = document.createElement("script");
      script.src = "https://8x8.vc/libs/external_api.min.js";
      script.async = true;
      script.onload = () => initJitsi();
      document.body.appendChild(script);
    };

    const initJitsi = () => {
      const domain = "8x8.vc";
      const options = {
        roomName:
          "vpaas-magic-cookie-59fd95f57892416c9c07902425ff8869/MyNameOfRoomIsAccom",
        parentNode: document.querySelector("#meet"),
        jwt: token,
        configOverwrite: {
          startWithAudioMuted: true,
          startWithVideoMuted: true,
          prejoinPageEnabled: false,
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_BRAND_WATERMARK: false,
        },
      };

      const api = new window.JitsiMeetExternalAPI(domain, options);

      // Listen for call join
      api.addEventListener("videoConferenceJoined", () => {
        console.log("Video call joined");
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage("CALL_JOINED");
        }
      });

      // Listen for call end
      api.addEventListener("videoConferenceLeft", () => {
        console.log("Video call ended");
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage("CALL_ENDED");
        }
      });

      // Cleanup on unmount
      return () => api.dispose();
    };

    if (
      !document.querySelector(
        'script[src="https://8x8.vc/libs/external_api.min.js"]'
      )
    ) {
      loadJitsiScript();
    } else {
      initJitsi();
    }

    // Cleanup function to remove script if needed
    return () => {
      const script = document.querySelector(
        'script[src="https://8x8.vc/libs/external_api.min.js"]'
      );
      if (script) script.remove();
    };
  }, [token]);

  return (
    <div className="main_container">
      <div
        id="meet"
        style={{ height: "100vh", width: "100%", margin: "auto" }}
      ></div>
    </div>
  );
};

export default Page;
