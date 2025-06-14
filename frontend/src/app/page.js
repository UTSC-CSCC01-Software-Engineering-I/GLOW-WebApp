import React from "react";
import { MapView } from "../components/MapView";
import { HUDleft } from "../components/HUDleft";
import { HUDright } from "../components/HUDright";
import { HUDleftPoints } from "../components/HUDleftPoints";

export default function Home() {
  return (
    <div>
      <HUDright />
      <HUDleftPoints />
      <HUDleft />
      
      
      <MapView />
    </div>
  );
}
