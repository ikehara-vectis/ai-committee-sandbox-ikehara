'use client';

import { useState, useEffect } from 'react';
import type { TestQuestion as TestQuestionType } from '@prisma/client';

interface TestQuestionProps {
  question: TestQuestionType;
  userId: string;
}

export default function TestQuestion({ question, userId }: TestQuestionProps) {
  const [answer, setAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const options = question.options ? JSON.parse(question.options) : null;
  const isChoiceType = question.type === 'LIGHT_CHOICE';

  useEffect(() => {
    if (userId) {
      fetchExistingAnswer();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id, userId]);

  useEffect(() => {
    if (question.timeLimit && !isSubmitted && timeRemaining === null) {
      setTimeRemaining(question.timeLimit * 60); // 分を秒に変換
    }
  }, [question.timeLimit, isSubmitted, timeRemaining]);

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && !isSubmitted) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            handleSubmit(); // 時間切れで自動提出
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining, isSubmitted]);

  const fetchExistingAnswer = async () => {
    try {
      const response = await fetch(`/api/test/${question.id}?userId=${userId}`);
      if (response.ok) {
        const result = await response.json();
        if (result) {
          setAnswer(result.answer);
          if (isChoiceType && result.answer.includes('|')) {
            const [option, reason] = result.answer.split('|');
            setSelectedOption(option);
            setAnswer(reason);
          }
          setIsSubmitted(true);
          setScore(result.score);
          setFeedback(result.feedback || '');
        }
      }
    } catch (error) {
      console.error('Failed to fetch existing answer:', error);
    }
  };

  const handleSubmit = async () => {
    if (!userId || (!answer.trim() && !selectedOption)) return;

    setIsLoading(true);
    
    try {
      const finalAnswer = isChoiceType ? `${selectedOption}|${answer}` : answer;
      
      const response = await fetch('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          questionId: question.id,
          answer: finalAnswer,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setIsSubmitted(true);
        setScore(result.score);
        setFeedback(result.feedback || '');
        setTimeRemaining(null); // タイマーを停止
      } else {
        throw new Error('Failed to submit answer');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('回答の提出に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    const percentage = (score / question.maxScore) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4">
      {/* 制限時間表示 */}
      {timeRemaining !== null && timeRemaining > 0 && !isSubmitted && (
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-600">⏰</span>
            <span className="text-yellow-800 font-medium">
              残り時間: {formatTime(timeRemaining)}
            </span>
          </div>
        </div>
      )}

      {/* 問題文 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <pre className="whitespace-pre-wrap text-gray-700 font-sans">
          {question.content}
        </pre>
      </div>

      {/* 選択肢（選択問題の場合） */}
      {isChoiceType && options && !isSubmitted && (
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-700">選択肢を選んでください:</h4>
          {options.map((option: string, index: number) => (
            <label key={index} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option.substring(0, 2)}
                checked={selectedOption === option.substring(0, 2)}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="text-blue-600"
              />
              <span className="text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      )}

      {/* 回答入力 */}
      <div>
        <label htmlFor={`answer-${question.id}`} className="block text-sm font-medium text-gray-700 mb-2">
          {isChoiceType ? '選択理由を記述してください:' : '回答を入力してください:'}
        </label>
        <textarea
          id={`answer-${question.id}`}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={isSubmitted || !userId}
          placeholder={
            question.type === 'LIGHT_SHORT' 
              ? '50字以内で簡潔に回答してください...'
              : '具体的で実践的な回答を記述してください...'
          }
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          rows={question.type === 'LIGHT_SHORT' ? 2 : 6}
          maxLength={question.type === 'LIGHT_SHORT' ? 50 : undefined}
        />
        {question.type === 'LIGHT_SHORT' && (
          <div className="text-sm text-gray-500 mt-1">
            {answer.length}/50文字
          </div>
        )}
      </div>

      {/* 提出ボタン */}
      {!isSubmitted && (
        <button
          onClick={handleSubmit}
          disabled={isLoading || !userId || (!answer.trim() && !selectedOption)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? '提出中...' : '回答を提出'}
        </button>
      )}

      {/* 結果表示 */}
      {isSubmitted && score !== null && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-gray-800">評価結果</span>
            <span className={`text-lg font-bold ${getScoreColor(score)}`}>
              {score}/{question.maxScore}点
            </span>
          </div>
          {feedback && (
            <div className="text-gray-700">
              <h5 className="font-medium mb-1">フィードバック:</h5>
              <p className="text-sm">{feedback}</p>
            </div>
          )}
          {isChoiceType && selectedOption && question.correctAnswer && (
            <div className="mt-2 text-sm">
              <span className={`font-medium ${selectedOption === question.correctAnswer ? 'text-green-600' : 'text-red-600'}`}>
                あなたの選択: {selectedOption} 
                {selectedOption === question.correctAnswer ? ' ✓' : ' ✗'}
              </span>
              {selectedOption !== question.correctAnswer && (
                <span className="text-green-600 ml-2">
                  正解: {question.correctAnswer}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}