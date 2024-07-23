'use client'

import { signIn } from 'next-auth/react'
import React from 'react'

type Props = {}

const HomeSignInButton = (props: Props) => {
  return (
    <button className="w-full sm:w-auto rounded-lg border-2 border-b-4 border-r-4 border-black px-40 py-1 text-xl font-bold transition-all hover:-translate-y-[2px] hover:border-zinc-300 dark:border-white dark:hover:border-zinc-300 md:block dark:bg-black bg-white" onClick={() => {signIn('google')}}>
        Sign In to Create Your First Course With AI!
    </button>
  )
}

export default HomeSignInButton