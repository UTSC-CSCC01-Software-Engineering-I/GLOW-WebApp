

import React from "react";
import { MapView } from "../components/MapView";
import { HUDleft } from "../components/HUDleft";
import { HUDright } from "../components/HUDright";
import { HUDlogin } from "../components/HUDlogin";

import { HUDloading } from "../components/HUDloading";
import { HUDleftPoints } from "../components/HUDleftPoints";
import '../styles/homepage.css';

export default function Home() {

  return (
    <div>
      
      <HUDright />
      <HUDleftPoints />
      <HUDleft />
      <div className="desktop">
        <HUDloading />
        <HUDlogin />
      </div>   
      <MapView />
    </div>
  );
}
