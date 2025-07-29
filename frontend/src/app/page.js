import React from "react";
import { MapView } from "../components/MapView";
import { HUDleft } from "../components/HUDleft";
import { HUDright } from "../components/HUDright";
import { HUDlogin } from "../components/HUDlogin";
import { HUDadd } from "../components/HUDadd";
import { HUDloading } from "../components/HUDloading";
import { HUDleftPoints } from "../components/HUDleftPoints";
import { HUDunitToggle } from '../components/HUDunitToggle';
import Head from "next/head"; // THis is important for importing the google fonts
import '../styles/homepage.css';

export default function Home() {
  return (
    <div>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Exo+2:ital,wght@0,100..900;1,100..900&family=Hubot+Sans:ital,wght@0,200..900;1,200..900&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap" rel="stylesheet" />
      </Head>
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
