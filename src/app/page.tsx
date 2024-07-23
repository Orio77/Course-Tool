import HomeSignInButton from "@/components/HomeSignInButton";
import { getAuthSession } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";

const Home = async () => {
  const session = await getAuthSession();
  console.log(session)
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

            {session?.user ? (
              <Link href={'/create'} className='items-center hidden gap-2 sm:flex'>
                <p className='rounded-lg border-2 border-b-4 border-r-4 border-black px-2 py-1 text-xl font-bold transition-all hover:-translate-y-[2px] md:block dark:border-white dark:bg-black bg-white'>
                  Good Luck on Your Path! 
                </p>
              </Link>
          ) : (
          <HomeSignInButton />
          )}

        </div>
      </div>
    </div>
  );
}

export default Home
