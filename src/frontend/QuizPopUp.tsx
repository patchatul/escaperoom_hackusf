import { Html } from "@react-three/drei";
interface QuizPopupProps {
  visible: boolean;
  onSubmit: (answer: string) => void;
}


export default function QuizPopup({ visible, onSubmit }: QuizPopupProps) {
  if (!visible) return null;

  return (
    <Html center>
      <div className="bg-black/80 text-white p-6 rounded-xl w-75 space-y-4 border border-white/20">
        <h2 className="text-xl font-bold text-center">QUIZ QUESTION</h2>

        <p className="text-sm">What is written on the old book?</p>

        <input
          id="answer"
          type="text"
          className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
          placeholder="Type your answer..."
        />

        <button
          onClick={() => {
            const value = (document.getElementById("answer") as HTMLInputElement)
              .value;
            onSubmit(value);
          }}
          className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-2 rounded"
        >
          Submit
        </button>
      </div>
    </Html>
  );

}