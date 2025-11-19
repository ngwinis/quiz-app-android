import React, { useState, useEffect } from 'react';
import { Quiz, Question } from '../types';
import { Button } from './Button';
import { ArrowLeft, CheckCircle, XCircle, Sparkles, ChevronRight } from 'lucide-react';
import { explainAnswer } from '../services/geminiService';

interface QuizPlayerProps {
  quiz: Quiz;
  onBack: () => void;
  onFinish: (score: number, total: number) => void;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({ quiz, onBack, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  const currentQuestion: Question = quiz.questions[currentIndex];

  const handleSelect = (optionLabel: string) => {
    if (isSubmitted) return;
    setSelectedOption(optionLabel);
  };

  const handleSubmit = () => {
    if (!selectedOption) return;
    setIsSubmitted(true);
    if (selectedOption === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
      setExplanation(null);
    } else {
      onFinish(score + (selectedOption === currentQuestion.correctAnswer ? 0 : 0), quiz.questions.length);
    }
  };

  const handleExplain = async () => {
    setLoadingExplanation(true);
    const text = await explainAnswer(currentQuestion);
    setExplanation(text);
    setLoadingExplanation(false);
  };

  const getOptionClass = (label: string) => {
    const base = "p-4 border-2 rounded-xl mb-3 cursor-pointer transition-all flex justify-between items-center ";
    
    if (!isSubmitted) {
      return base + (selectedOption === label 
        ? "border-blue-500 bg-blue-50" 
        : "border-gray-200 bg-white hover:border-blue-200");
    }

    if (label === currentQuestion.correctAnswer) {
      return base + "border-green-500 bg-green-50 text-green-900";
    }

    if (selectedOption === label && label !== currentQuestion.correctAnswer) {
      return base + "border-red-500 bg-red-50 text-red-900";
    }

    return base + "border-gray-200 bg-gray-50 opacity-60";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white shadow-sm sticky top-0 z-10">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-600">
          <ArrowLeft size={24} />
        </button>
        <div className="text-sm font-bold text-gray-500">
          Câu {currentIndex + 1} / {quiz.questions.length}
        </div>
        <div className="w-8"></div> {/* Spacer */}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-1.5">
        <div 
          className="bg-blue-600 h-1.5 transition-all duration-300" 
          style={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }}
        ></div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-6">
          <h2 className="text-lg font-bold text-gray-800 leading-relaxed">
            {currentQuestion.text}
          </h2>
        </div>

        <div className="space-y-2">
          {currentQuestion.options.map((opt) => (
            <div 
              key={opt.label} 
              onClick={() => handleSelect(opt.label)}
              className={getOptionClass(opt.label)}
            >
              <div className="flex items-center">
                <span className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 text-sm font-bold ${
                   isSubmitted && opt.label === currentQuestion.correctAnswer ? 'bg-green-200 text-green-800' :
                   isSubmitted && selectedOption === opt.label && opt.label !== currentQuestion.correctAnswer ? 'bg-red-200 text-red-800' :
                   selectedOption === opt.label ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-600'
                }`}>
                  {opt.label}
                </span>
                <span className="font-medium">{opt.content}</span>
              </div>
              {isSubmitted && opt.label === currentQuestion.correctAnswer && (
                <CheckCircle size={20} className="text-green-600" />
              )}
              {isSubmitted && selectedOption === opt.label && opt.label !== currentQuestion.correctAnswer && (
                <XCircle size={20} className="text-red-600" />
              )}
            </div>
          ))}
        </div>

        {/* Explanation Section */}
        {isSubmitted && (
           <div className="mt-6 animate-fade-in">
             {!explanation && !loadingExplanation && (
               <button 
                 onClick={handleExplain}
                 className="flex items-center text-sm font-semibold text-purple-600 hover:text-purple-700 bg-purple-50 px-4 py-2 rounded-lg transition-colors"
               >
                 <Sparkles size={16} className="mr-2" />
                 Tại sao đáp án {currentQuestion.correctAnswer} đúng? (Hỏi AI)
               </button>
             )}
             
             {loadingExplanation && (
               <div className="flex items-center text-gray-500 text-sm p-3 bg-gray-50 rounded-lg">
                 <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent mr-3"></div>
                 AI đang suy nghĩ...
               </div>
             )}

             {explanation && (
               <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl mt-2">
                 <div className="flex items-center gap-2 text-purple-800 font-bold text-sm mb-2">
                   <Sparkles size={16} />
                   Giải thích từ AI:
                 </div>
                 <p className="text-gray-700 text-sm leading-relaxed">{explanation}</p>
               </div>
             )}
           </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 max-w-md mx-auto">
        {!isSubmitted ? (
          <Button 
            onClick={handleSubmit} 
            fullWidth 
            disabled={!selectedOption}
          >
            Kiểm tra
          </Button>
        ) : (
          <Button 
            onClick={handleNext} 
            fullWidth 
            variant={currentIndex === quiz.questions.length - 1 ? "primary" : "secondary"}
            icon={currentIndex === quiz.questions.length - 1 ? undefined : <ChevronRight size={20}/>}
          >
            {currentIndex === quiz.questions.length - 1 ? "Xem kết quả" : "Câu tiếp theo"}
          </Button>
        )}
      </div>
    </div>
  );
};