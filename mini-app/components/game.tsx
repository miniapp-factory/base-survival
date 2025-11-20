"use client";

import { useState } from "react";
import { useAccount, useConnect, useContractRead, useContractWrite, useWaitForTransaction } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ethers } from "ethers";

const contractAddress = process.env.NEXT_PUBLIC_SCOREBOARD_ADDRESS as `0x${string}`;
const abi = [
  "function submitScore(uint256 score) external",
  "function getBestScore(address player) external view returns (uint256)",
];

export default function Game() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { data: bestScoreData, refetch: refetchBestScore } = useContractRead({
    address: contractAddress,
    abi,
    functionName: "getBestScore",
    args: [address],
  });
  const { writeAsync: submitScore, isLoading: submitting } = useContractWrite({
    address: contractAddress,
    abi,
    functionName: "submitScore",
  });
  const { data: txHash, isLoading: txLoading } = useWaitForTransaction({
    hash: txHash?.hash,
  });

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [aiText, setAiText] = useState("");
  const [reaction, setReaction] = useState("");
  const [title, setTitle] = useState("");
  const [recap, setRecap] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);

  const startGame = () => {
    setRound(1);
    setScore(0);
    setCorrectCount(0);
    setAiText("Welcome to Lucky Blocks on Base. You have 5 guesses to test your luck. Pick the right block, stack points, and lock in your best score onchain.");
    setReaction("");
    setTitle("");
    setRecap("");
    setGameStarted(true);
    setGameEnded(false);
  };

  const handleGuess = (guess: number) => {
    const secret = Math.floor(Math.random() * 5) + 1;
    const isCorrect = guess === secret;
    if (isCorrect) {
      setScore((s) => s + 10);
      setCorrectCount((c) => c + 1);
      setReaction("Nice hit! You guessed the hidden block.");
    } else {
      setReaction("Unlucky this time, the hidden block slipped away.");
    }
    if (round < 5) {
      setRound((r) => r + 1);
    } else {
      setGameEnded(true);
      setTitle(`Sharpshooter of Base`);
      setRecap(`You nailed ${correctCount + (isCorrect ? 1 : 0)} out of 5 guesses – serious intuition. Your luck and timing make you a top contender in Lucky Blocks.`);
    }
  };

  const handleSubmitScore = async () => {
    if (!address) return;
    await submitScore?.({ args: [score] });
    refetchBestScore?.();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Lucky Blocks – Guess & Score</CardTitle>
      </CardHeader>
      <CardContent>
        {!isConnected && (
          <div className="flex flex-col items-center gap-4">
            <Button onClick={() => connect({ connector: connectors[0] })}>Connect Wallet</Button>
          </div>
        )}
        {isConnected && (
          <div className="flex flex-col gap-4">
            <div className="text-center">
              <span className="font-medium">Best Score: {bestScoreData?.toString() ?? "0"}</span>
            </div>
            {!gameStarted && (
              <div className="flex justify-center">
                <Button onClick={startGame}>Start Game</Button>
              </div>
            )}
            {gameStarted && !gameEnded && (
              <div className="text-center">
                <p>Round {round} of 5</p>
                <p>Current Score: {score}</p>
                <p className="italic">{aiText}</p>
                <p className="font-semibold">{reaction}</p>
                <div className="grid grid-cols-5 gap-2 mt-4">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Button key={n} onClick={() => handleGuess(n)}>{n}</Button>
                  ))}
                </div>
              </div>
            )}
            {gameEnded && (
              <div className="text-center">
                <p>Final Score: {score} / 50</p>
                <p className="font-semibold">{title}</p>
                <p>{recap}</p>
                <div className="flex justify-center gap-4 mt-4">
                  <Button onClick={handleSubmitScore} disabled={submitting || txLoading}>
                    {submitting || txLoading ? "Submitting..." : "Submit Score Onchain"}
                  </Button>
                  <Button onClick={startGame}>Play Again</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="text-center text-sm text-muted-foreground">
        Powered by Base
      </CardFooter>
    </Card>
  );
}
