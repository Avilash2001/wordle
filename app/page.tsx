'use client';

import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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

  const handleGuess = () => {
    if (currentGuess.length !== WORD_LENGTH) {
      toast('Word must be 5 letters long');
      return;
    }

    const newGuesses = [...guesses, currentGuess.toUpperCase()];
    setGuesses(newGuesses);
    setCurrentGuess('');

    if (currentGuess.toUpperCase() === word) {
      setStatus('won');
      setGameOver(true);
    } else if (newGuesses.length >= MAX_ATTEMPTS) {
      setStatus('lost');
      setGameOver(true);
    }
  };

  const getBoxStyle = (char: string, index: number) => {
    if (word[index] === char) return 'bg-green-500 text-white';
    if (word.includes(char)) return 'bg-yellow-500 text-white';
    return 'bg-gray-700 text-white';
  };

  return (
    <main className="min-h-screen bg-bg text-white flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">Wordle Clone</h1>

      <div className="grid gap-2">
        {[...Array(MAX_ATTEMPTS)].map((_, rowIdx) => (
          <div key={rowIdx} className="flex gap-1">
            {[...Array(WORD_LENGTH)].map((_, colIdx) => {
              const guessStr = guesses[rowIdx] || '';
              const char = guessStr[colIdx] || '';
              return (
                <div
                  key={colIdx}
                  className={cn(
                    'w-12 h-12 flex items-center justify-center border text-xl font-bold rounded-md',
                    guessStr && getBoxStyle(char, colIdx),
                  )}
                >
                  {char}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {!gameOver && (
        <div className="flex gap-2">
          <Input
            className="w-[200px] text-text-white"
            maxLength={5}
            value={currentGuess}
            onChange={(e) => setCurrentGuess(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
          />
          <Button className="cursor-pointer" onClick={handleGuess}>
            Guess
          </Button>
        </div>
      )}

      {gameOver && (
        <div className="mt-4 text-xl">
          {status === 'won'
            ? '🎉 You guessed it!'
            : `❌ Game over. The word was ${word}`}
        </div>
      )}
    </main>
  );
}
