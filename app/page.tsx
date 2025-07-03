'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;
const VALID_WORDS = ['BLINK', 'TRUST', 'MOUNT', 'PLANE', 'SHORE', 'CRISP'];

export default function Home() {
  const [word, setWord] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  useEffect(() => {
    const randomWord =
      VALID_WORDS[Math.floor(Math.random() * VALID_WORDS.length)];
    setWord(randomWord);
  }, []);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (gameOver) return;
      const key = e.key.toUpperCase();
      if (key === 'ENTER') {
        handleGuess();
      } else if (key === 'BACKSPACE') {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (/^[A-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
        setCurrentGuess((prev) => prev + key);
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [currentGuess, gameOver]);

  const handleGuess = () => {
    if (currentGuess.length !== WORD_LENGTH) {
      toast('Word must be 5 letters long');
      return;
    }

    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    setCurrentGuess('');

    if (currentGuess === word) {
      setStatus('won');
      setGameOver(true);
    } else if (newGuesses.length >= MAX_ATTEMPTS) {
      setStatus('lost');
      setGameOver(true);
    }
  };

  const getBoxStyle = (char: string, index: number) => {
    if (!char) return 'border-bg-gray bg-bg text-white';
    if (word[index] === char) return 'bg-bg-green text-white border-none';
    if (word.includes(char)) return 'bg-bg-yellow text-white border-none';
    return 'bg-bg-gray text-white border-none';
  };

  return (
    <main className="min-h-screen bg-bg text-text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">Wordle</h1>

      <div className="grid gap-1.5">
        {[...Array(MAX_ATTEMPTS)].map((_, rowIdx) => {
          const guess =
            guesses[rowIdx] || (rowIdx === guesses.length ? currentGuess : '');
          return (
            <div key={rowIdx} className="flex gap-1.5">
              {[...Array(WORD_LENGTH)].map((_, colIdx) => {
                const char = guess[colIdx] || '';
                return (
                  <div
                    key={colIdx}
                    className={cn(
                      'w-14 h-14 border border-gray-500 uppercase font-bold text-2xl flex items-center justify-center',
                      getBoxStyle(guesses[rowIdx] ? char : '', colIdx),
                    )}
                  >
                    {char}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {gameOver && (
        <div className="mt-6 text-xl">
          {status === 'won'
            ? '🎉 You guessed it!'
            : `❌ Game over. The word was ${word}`}
        </div>
      )}
    </main>
  );
}
