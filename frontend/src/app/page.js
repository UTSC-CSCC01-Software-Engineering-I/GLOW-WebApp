import React from "react";
import { MapView } from "../components/MapView";
import { HUDleft } from "../components/HUDleft";
import { HUDright } from "../components/HUDright";
import { HUDlogin } from "../components/HUDlogin";
import { HUDadd } from "../components/HUDadd";
import { HUDloading } from "../components/HUDloading";
import { HUDleftPoints } from "../components/HUDleftPoints";
import { HUDunitToggle } from '../components/HUDunitToggle';
import '../styles/homepage.css';

export default function Home() {
  return (
    <div>
      
      <HUDright />
      <HUDadd />
      <HUDleftPoints />
      <HUDleft />
      <div className="desktop">
        <HUDloading />
        <HUDlogin />
        <HUDunitToggle />
      </div>   
      <MapView />
    </div>
  );
}
