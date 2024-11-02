// Discussion.tsx
"use client";
import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  DocumentData,
} from 'firebase/firestore';

interface QuestionData {
  id: string;
  question: string;
  answers: AnswerData[];
}

interface AnswerData {
  id: string;
  answer: string;
  timestamp: any;
}

const Discussion: React.FC = () => {
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [question, setQuestion] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'questions'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const questionsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as QuestionData[];
      setQuestions(questionsData);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      await addDoc(collection(db, 'questions'), {
        question,
        answers: [],
        timestamp: new Date(),
      });
      setQuestion('');
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent, questionId: string) => {
    e.preventDefault();
    if (answer.trim()) {
      const answerRef = collection(doc(db, 'questions', questionId), 'answers');
      await addDoc(answerRef, {
        answer,
        timestamp: new Date(),
      });
      setAnswer('');
      setSelectedQuestionId(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Discussion Forum</h1>
      <form onSubmit={handleSubmitQuestion} className="mb-4">
        <textarea
          className="w-full p-2 border rounded"
          placeholder="Ask a question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
        />
        <button type="submit" className="mt-2 bg-teal-500 text-white py-2 px-4 rounded">
          Submit Question
        </button>
      </form>
      
      <div>
        {questions.map(({ id, question, answers }) => (
          <div key={id} className="border p-4 mb-4 rounded">
            <h2 className="font-bold">{question}</h2>
            <button
              onClick={() => setSelectedQuestionId(selectedQuestionId === id ? null : id)}
              className="text-blue-500 underline"
            >
              {selectedQuestionId === id ? 'Hide Answers' : 'Show Answers'}
            </button>
            {selectedQuestionId === id && (
              <>
                <form onSubmit={(e) => handleSubmitAnswer(e, id)} className="mt-2">
                  <textarea
                    className="w-full p-2 border rounded"
                    placeholder="Write your answer..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    rows={2}
                  />
                  <button type="submit" className="mt-2 bg-teal-500 text-white py-2 px-4 rounded">
                    Submit Answer
                  </button>
                </form>
                <div className="mt-4">
                  {answers.map((ans: AnswerData) => (
                    <div key={ans.id} className="p-2 border-b">
                      {ans.answer}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Discussion;
