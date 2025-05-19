import { Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import NotFound from './pages/not-found';
import ChatBot from './pages/chat-bot-page';

function App() {
  return (
    <Suspense fallback={null}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ChatBot />} />
          <Route path="/:id" element={<ChatBot />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </Suspense>
  );
}

export default App;
