import React, { useState, useEffect } from 'react';
import { Quiz, AppState } from './types';
import { FileUploader } from './components/FileUploader';
import { QuizPlayer } from './components/QuizPlayer';
import { Button } from './components/Button';
import { BookOpen, Trash2, Trophy, RotateCcw } from 'lucide-react';

// Helper to save/load from local storage
const STORAGE_KEY = 'ezquiz_data';

export default function App() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.HOME);
  const [lastScore, setLastScore] = useState<{score: number, total: number} | null>(null);

  // Load initial data
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setQuizzes(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load quizzes", e);
      }
    }
  }, []);

  // Save when updated
  useEffect(() => {
    if (quizzes.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(quizzes));
    }
  }, [quizzes]);

  const handleQuizLoaded = (newQuiz: Quiz) => {
    setQuizzes(prev => [...prev, newQuiz]);
  };

  const deleteQuiz = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = quizzes.filter(q => q.id !== id);
    setQuizzes(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const startQuiz = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    setAppState(AppState.PLAYING);
  };

  const handleQuizFinish = (score: number, total: number) => {
    setLastScore({ score, total });
    setAppState(AppState.RESULT);
  };

  const goHome = () => {
    setAppState(AppState.HOME);
    setCurrentQuiz(null);
    setLastScore(null);
  };

  // --- Render Views ---

  const renderHome = () => (
    <div className="p-6 pb-24">
      <header className="mb-8 mt-4">
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">EzQuiz</h1>
        <p className="text-gray-500">Ôn thi trắc nghiệm mọi lúc mọi nơi</p>
      </header>

      {quizzes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-gray-300 rounded-2xl bg-white">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
            <BookOpen size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-700">Chưa có bộ câu hỏi nào</h3>
          <p className="text-gray-400 text-sm px-8 mt-2">Nhấn dấu + bên dưới để tải file .txt đề thi của bạn.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {quizzes.map(quiz => (
            <div 
              key={quiz.id}
              onClick={() => startQuiz(quiz)}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 active:scale-98 transition-transform cursor-pointer relative group"
            >
              <div className="pr-8">
                <h3 className="font-bold text-lg text-gray-800 line-clamp-2">{quiz.title}</h3>
                <p className="text-gray-400 text-sm mt-1">{quiz.questions.length} câu hỏi</p>
              </div>
              <button 
                onClick={(e) => deleteQuiz(e, quiz.id)}
                className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <FileUploader onQuizLoaded={handleQuizLoaded} />
    </div>
  );

  const renderResult = () => {
    if (!lastScore || !currentQuiz) return null;
    const percentage = Math.round((lastScore.score / lastScore.total) * 100);
    
    let message = "Cần cố gắng hơn!";
    let color = "text-red-500";
    if (percentage >= 80) { message = "Xuất sắc!"; color = "text-green-500"; }
    else if (percentage >= 50) { message = "Khá tốt!"; color = "text-blue-500"; }

    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-white text-center">
        <div className="mb-6 relative">
          <Trophy size={80} className={color} />
          <div className="absolute -top-2 -right-2 animate-bounce">✨</div>
        </div>
        
        <h2 className={`text-3xl font-bold mb-2 ${color}`}>{message}</h2>
        <p className="text-gray-500 mb-8">Bạn đã hoàn thành bài thi</p>
        
        <div className="w-full bg-gray-50 rounded-2xl p-6 mb-8">
          <div className="text-4xl font-black text-gray-800 mb-1">
            {lastScore.score}<span className="text-xl text-gray-400 font-medium">/{lastScore.total}</span>
          </div>
          <div className="text-sm text-gray-400 uppercase font-bold tracking-wider">Điểm số</div>
        </div>

        <div className="w-full space-y-3">
          <Button onClick={() => startQuiz(currentQuiz)} fullWidth variant="outline" icon={<RotateCcw size={18}/>}>
            Làm lại
          </Button>
          <Button onClick={goHome} fullWidth variant="secondary">
            Về trang chủ
          </Button>
        </div>
      </div>
    );
  };

  // --- Main Render ---
  
  return (
    // Mobile Container Restriction
    <div className="min-h-screen bg-gray-100 flex justify-center font-sans">
      <div className="w-full max-w-md bg-white h-[100dvh] shadow-2xl overflow-hidden relative flex flex-col">
        {appState === AppState.HOME && renderHome()}
        {appState === AppState.PLAYING && currentQuiz && (
          <QuizPlayer 
            quiz={currentQuiz} 
            onBack={goHome} 
            onFinish={handleQuizFinish} 
          />
        )}
        {appState === AppState.RESULT && renderResult()}
      </div>
    </div>
  );
}