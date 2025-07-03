'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;
const KEYS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK'],
];

export default function Home() {
  const [word, setWord] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [usedKeys, setUsedKeys] = useState<{ [key: string]: string }>({});

  const fetchWord = async () => {
    const res = await fetch('https://api.datamuse.com/words?sp=?????&max=1000');
    const data = await res.json();
    const words = data
      .map((w: { word: string }) => w.word.toUpperCase())
      .filter((w: string) => /^[A-Z]{5}$/.test(w));
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setWord(randomWord);
  };

  const validateWord = async (guess: string): Promise<boolean> => {
    const res = await fetch(
      `https://api.datamuse.com/words?sp=${guess.toLowerCase()}&max=1`,
    );
    const data = await res.json();
    return data.length > 0 && data[0].word.toUpperCase() === guess;
  };

  const handleGuess = async () => {
    if (currentGuess.length !== WORD_LENGTH) {
      toast('Word must be 5 letters long');
      return;
    }

    const isValid = await validateWord(currentGuess);
    if (!isValid) {
      toast('Not a valid word');
      return;
    }

    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    setCurrentGuess('');

    const updatedKeys = { ...usedKeys };
    currentGuess.split('').forEach((char, idx) => {
      if (word[idx] === char) {
        updatedKeys[char] = 'bg-bg-green';
      } else if (word.includes(char)) {
        if (updatedKeys[char] !== 'bg-bg-green')
          updatedKeys[char] = 'bg-bg-yellow';
      } else {
        if (!updatedKeys[char]) updatedKeys[char] = 'bg-bg-gray';
      }
    });
    setUsedKeys(updatedKeys);

    if (currentGuess === word) {
      setStatus('won');
      setGameOver(true);
    } else if (newGuesses.length >= MAX_ATTEMPTS) {
      setStatus('lost');
      setGameOver(true);
    }
  };

  const handleReset = () => {
    setGuesses([]);
    setCurrentGuess('');
    setGameOver(false);
    setStatus('playing');
    setUsedKeys({});
    fetchWord();
  };

  const handleVirtualKey = (key: string) => {
    if (gameOver) return;
    if (key === 'ENTER') {
      handleGuess();
    } else if (key === 'BACK') {
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
      setCurrentGuess((prev) => prev + key);
    }
  };

  const getBoxStyle = (char: string, index: number) => {
    if (!char) return 'border-bg-gray bg-bg text-white';
    if (word[index] === char) return 'bg-bg-green text-white border-none';
    if (word.includes(char)) return 'bg-bg-yellow text-white border-none';
    return 'bg-bg-gray text-white border-none';
  };

  useEffect(() => {
    fetchWord();
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

  return (
    <main className="min-h-screen bg-bg text-text-white flex flex-col items-center justify-center p-4 select-none touch-manipulation gap-8">
      <p className="text-2xl md:text-4xl font-bold">
        Wordle by <Link href={'https://github.com/Avilash2001'}>Avilash</Link>
      </p>

      <div className="flex flex-col gap-2">
        <p className="md:text-lg font-semibold text-center">
          Made this so I can play as much as I want. No paywalls! No limits!
        </p>

        <p className="text-xs md:text-base text-center">
          <i>“Wordle should be a right, not a privilege.” — Me, probably</i>
        </p>
      </div>

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
        <div className="text-center">
          <div className="text-sm md:text-xl mb-4">
            {status === 'won'
              ? `You guessed it! The word was ${word}`
              : `Sorry! Game over. The word was ${word}`}
          </div>
          <Button
            onClick={handleReset}
            className="mt-2 px-4 py-2 bg-white text-black rounded hover:bg-gray-200 cursor-pointer"
          >
            Play Again
          </Button>
        </div>
      )}

      {/* Onscreen Keyboard */}
      <div className="flex flex-col gap-2 md:gap-1 max-w-[90vw]">
        {KEYS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex justify-center gap-2 md:gap-1">
            {row.map((key) => (
              <button
                key={key}
                onClick={() => handleVirtualKey(key)}
                className={cn(
                  'text-xs md:text-sm py-3 px-1 md:p-3 rounded font-semibold md:font-bold uppercase transition-all duration-100 active:scale-95',
                  key === 'ENTER' || key === 'BACK' ? 'w-16' : 'w-10',
                  usedKeys[key] || 'bg-bg-light-gray text-white',
                )}
              >
                {key === 'BACK' ? '⌫' : key}
              </button>
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}
