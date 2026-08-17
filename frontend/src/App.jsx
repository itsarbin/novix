import { useSandbox } from './hooks/useSandbox';
import LandingPage from './components/LandingPage';
import Workspace from './components/Workspace';

export default function App() {
  const { status, sandboxId, previewUrl, error, startSandbox, reset } = useSandbox();

  if (status === 'idle' || status === 'starting' || status === 'error') {
    return (
      <LandingPage
        onStart={startSandbox}
        isStarting={status === 'starting'}
        error={error}
      />
    );
  }

  // status === 'ready'
  return (
    <Workspace
      sandboxId={sandboxId}
      previewUrl={previewUrl}
      onReset={reset}
    />
  );
}
