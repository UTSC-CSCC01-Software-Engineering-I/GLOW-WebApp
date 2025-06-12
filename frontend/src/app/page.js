import React from "react";
import { MapView } from "../components/MapView";

export default function Home() {
  return (
    <div>
      <header
        style={{
          padding: "20px",
          backgroundColor: "#f8f9fa",
          textAlign: "center",
        }}
      >
        <h1>🚀 GLOW - Water Quality Monitoring</h1>
        <p>Interactive Map Application</p>
      </header>
      <MapView />
    </div>
  );
}
