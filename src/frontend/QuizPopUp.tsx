import { useRef, useState } from "react";

interface QuizPopupProps {
  visible: boolean;
  question?: string;
  correctAnswer: string;
  solvedCount: number;
  onSubmit: (answer: string) => void;
  onClose: () => void;
  username?: string;
}

function QuizPopUp({
  visible,
  question,
  correctAnswer,
  solvedCount,
  onSubmit,
  onClose,
  username,
}: QuizPopupProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [wrong, setWrong] = useState(false);

  if (!visible) return null;

  const handleSubmit = () => {
    const val = inputRef.current?.value ?? "";
    const isCorrect =
      val.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

    if (isCorrect) {
      setWrong(false);
      onSubmit(val);
      if (inputRef.current) inputRef.current.value = "";
    } else {
      setWrong(true);
      // Shake the input briefly
      if (inputRef.current) {
        inputRef.current.classList.add("shake");
        setTimeout(() => inputRef.current?.classList.remove("shake"), 500);
      }
    }
  };

  return (
    <>
      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-8px); }
          40%      { transform: translateX(8px); }
          60%      { transform: translateX(-6px); }
          80%      { transform: translateX(6px); }
        }
        .shake { animation: shake 0.4s ease; }
      `}</style>

      {/* Full-screen overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999,
          background: "rgba(0,0,0,0.6)",
        }}
      >
        {/* Card — original Tailwind classes kept exactly */}
        <div className="relative bg-black/80 text-white p-6 rounded-xl w-75 space-y-4 border border-white/20">
          {/* Progress indicator */}
          <div className="flex justify-between items-center text-xs text-white/50">
            <span>Player: {username || "Anonymous"}</span>
            <span>{solvedCount} / 5 solved</span>
            <p
              onClick={() => {
                setWrong(false);
                onClose();
              }}
              className="cursor-pointer absolute top-2 right-2 bg-red-800 text-white text-xs px-2 py-1 rounded"
            >
              x
            </p>
          </div>

          <h2 className="text-md font-bold text-center">QUIZ QUESTION</h2>

          <p className="text-sm">{question ?? "What do you see?"}</p>

          <input
            ref={inputRef}
            type="text"
            className="w-full p-2 rounded text-black bg-white/10 border border-white/20"
            placeholder="Type your answer..."
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
            autoFocus
          />

          {wrong && (
            <p className="text-red-400 text-xs text-center">
              Wrong answer. Try again.
            </p>
          )}

          <button
            onClick={handleSubmit}
            className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-2 rounded"
          >
            Submit
          </button>
        </div>
      </div>
    </>
  );
}

export default QuizPopUp;
