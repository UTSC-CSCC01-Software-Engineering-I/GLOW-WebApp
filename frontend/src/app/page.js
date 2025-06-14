import React from "react";
import { MapView } from "../components/MapView";
import { HUDleft } from "../components/HUDleft";
import { HUDright } from "../components/HUDright";
import { HUDlogin } from "../components/HUDlogin";
import { HUDadd } from "../components/HUDadd";
import { HUDleftPoints } from "../components/HUDleftPoints";

export default function Home() {
  return (
    <div>
      <HUDright />
      <HUDadd />
      <HUDlogin />
      <HUDleftPoints />
      <HUDleft />
      
      
      <MapView />
    </div>
  );
}
