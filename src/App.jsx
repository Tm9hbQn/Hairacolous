import React, { useState } from 'react';
import { useHairData } from './hooks/useHairData';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay';
import Background from './components/Background';
import TimeCapsule from './components/TimeCapsule';
import MainStatusCard from './components/MainStatusCard';
import RoutineToggle from './components/RoutineToggle';
import ProtocolStack from './components/ProtocolStack';
import FooterQuote from './components/FooterQuote';

function App() {
  const { data, loading, error } = useHairData();
  const [userSelectedPeriod, setUserSelectedPeriod] = useState(null);
  const [routineType, setRoutineType] = useState('refresh');

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  // Derive selectedPeriod. Use user selection, or default to the first period if data exists.
  const selectedPeriod = userSelectedPeriod || (data && data.periods && data.periods.length > 0 ? data.periods[0] : null);

  if (!data || !selectedPeriod) {
    // This case handles when data is loaded but empty, or selectedPeriod hasn't been set yet (should be rare/fast)
    return <LoadingSpinner />;
  }

  const currentRoutine = routineType === 'wash' ? selectedPeriod.wash_day_routine : selectedPeriod.refresh_day_routine;

  return (
    <div className="relative min-h-screen font-sans text-white overflow-x-hidden pb-10 selection:bg-pink-500 selection:text-white">
      <Background />

      <main className="max-w-lg mx-auto w-full relative z-10 pt-4">
        <MainStatusCard
          data={selectedPeriod.weather_data}
          summaryText={selectedPeriod.summary_text}
          uvAlert={selectedPeriod.uv_alert}
          allPeriods={data.periods}
        />

        <TimeCapsule
          periods={data.periods}
          selectedPeriod={selectedPeriod}
          onSelect={setUserSelectedPeriod}
        />

        <RoutineToggle
          routineType={routineType}
          setRoutineType={setRoutineType}
        />

        <div id="protocol-stack">
          <ProtocolStack
            routine={currentRoutine}
          />
        </div>

        <FooterQuote quote={selectedPeriod.funny_quote} />
      </main>
    </div>
  );
}

export default App;
