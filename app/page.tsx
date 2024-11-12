"use client"
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();

  const handlePlayClick = () => {
    // Navigate to the /game page
    router.push('/game');
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-black">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hell.gif"  // Add your image path here
          alt="Game Background"
          layout="fill"
          objectFit="cover"
          priority
        />
      </div>

      {/* Game Title */}
      <div className="relative z-10 text-center text-white p-4">
        <h1 className="text-5xl font-bold mb-8 text-shadow-lg">
          Wave game!
        </h1>

        {/* Play Button */}
        <button
          onClick={handlePlayClick}
          className="px-6 py-3 text-xl font-semibold text-white bg-orange-500 rounded-lg shadow-lg hover:bg-orange-600 transition duration-300 ease-in-out"
        >
          Play
        </button>
      </div>
    </div>
  );
}
