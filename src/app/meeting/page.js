"use client";
import { DEV_URL } from "@/constant";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const page = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const email = searchParams.get("email");
  const name = searchParams.get("name");

  console.log({
    id,
    email,
    name,
  });

  const [token, setToken] = useState("");

  useEffect(() => {
    const fetchToken = async () => {
      const response = await fetch(`${DEV_URL}/open/jitsiToken`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, email, name }),
      });
      const data = await response.json();
      setToken(data.token);
    };

    fetchToken();
  }, [email, name]);

  useEffect(() => {
    if (token) {
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
          jwt: token, // Use the fetched token
        };

        const api = new window.JitsiMeetExternalAPI(domain, options);
        // Optional: Execute Jitsi API commands here
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
    }
  }, [token]);

  return (
    <div className="main_container">
      <div
        id="meet"
        style={{ height: "843px", width: "100%", margin: "auto" }}
      ></div>
    </div>
  );
};

export default page;
