'use client'

import { signIn } from "next-auth/react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center px-4 py-8 relative bg-white dark:bg-gray-950">
      <div className="absolute inset-0 z-0">
        <Image 
          src='/homepage.png' 
          layout="fill" 
          objectFit="cover" 
          objectPosition="center" 
          alt="Homepage background" 
          className="opacity-75" 
        />
      </div>
      <div className="relative z-10">
        <div className="flex flex-col rounded">
          <button className="w-full sm:w-auto rounded-lg border-2 border-b-4 border-r-4 border-black px-40 py-1 text-xl font-bold transition-all hover:-translate-y-[2px] hover:border-zinc-300 dark:border-white dark:hover:border-zinc-300 md:block dark:bg-black bg-white" onClick={() => {signIn('google')}}>
              Sign In to Create Your First Course With AI!
          </button>
        </div>
      </div>
    </div>
  );
}


// TODO Change to SignInButton with the same text