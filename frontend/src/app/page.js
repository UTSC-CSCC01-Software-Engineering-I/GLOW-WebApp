import React from "react";
import { MapView } from "../components/MapView";
import { HUDleft } from "../components/HUDleft";
import { HUDright } from "../components/HUDright";
import { HUDlogin } from "../components/HUDlogin";
import { HUDadd } from "../components/HUDadd";
import { HUDloading } from "../components/HUDloading";
import { HUDleftPoints } from "../components/HUDleftPoints";

export default function Home() {
  return (
    <div>
      <HUDright />
      <HUDadd />
      <HUDloading />
      <HUDlogin />
      <HUDleftPoints />
      <HUDleft />
      
      
      <MapView />
    </div>
  );
}
