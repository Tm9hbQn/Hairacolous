import React, { useState } from 'react';
import { WEATHER_DATA } from './data';
import Background from './components/Background';
import Header from './components/Header';
import TimeCapsule from './components/TimeCapsule';
import MainStatusCard from './components/MainStatusCard';
import RoutineToggle from './components/RoutineToggle';
import ProtocolStack from './components/ProtocolStack';
import FooterQuote from './components/FooterQuote';

function App() {
  const [selectedPeriod, setSelectedPeriod] = useState(WEATHER_DATA.periods[0]);
  const [routineType, setRoutineType] = useState('refresh');

  const currentRoutine = routineType === 'wash' ? selectedPeriod.wash_day_routine : selectedPeriod.refresh_day_routine;

  return (
    <div className="relative min-h-screen font-sans text-white overflow-x-hidden pb-10 selection:bg-pink-500 selection:text-white">
      <Background conditionId={selectedPeriod.weather_data.condition_id_detected} />

      <Header />

      <TimeCapsule
        periods={WEATHER_DATA.periods}
        selectedPeriod={selectedPeriod}
        onSelect={setSelectedPeriod}
      />

      <main className="max-w-lg mx-auto w-full relative z-10">
        <MainStatusCard
          data={selectedPeriod.weather_data}
          summaryText={selectedPeriod.summary_text}
          uvAlert={selectedPeriod.uv_alert}
          conditionId={selectedPeriod.weather_data.condition_id_detected}
        />

        <RoutineToggle
          routineType={routineType}
          setRoutineType={setRoutineType}
        />

        <ProtocolStack
          routine={currentRoutine}
        />

        <FooterQuote quote={selectedPeriod.funny_quote} />
      </main>
    </div>
  );
}

export default App;
