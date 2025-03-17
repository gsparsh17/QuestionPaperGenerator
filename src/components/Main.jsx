import React, { useState } from "react";
import Sidebar from "./Sidebar";
import MainContent from "./MainContent";

const Main = () => {
  const [activeFeature, setActiveFeature] = useState(null);

  const handleFeatureChange = (feature) => {
    setActiveFeature(feature);
  };

  return (
    <div className="flex animate-fadeIn duration-1000">
      <Sidebar onFeatureChange={handleFeatureChange} />
      <MainContent activeFeature={activeFeature} onFeatureChange={handleFeatureChange} />
    </div>
  );
};

export default Main;