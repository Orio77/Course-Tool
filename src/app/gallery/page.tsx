import GalleryCourseCard from '@/components/GalleryCourseCard'
import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import React from 'react'

type Props = {}

const getUserId = async () => {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return null;
    }
    return session.user.id;
  } catch (error) {
    console.error("Failed to get user ID:", error);
    return null;
  }
};

const GalleryPage = async (props: Props) => {
    const userId = await getUserId();
    const courses = (userId == null ? [] : (await prisma.course.findMany({
        where: {
            userId: userId
        },
        include: {
            units: {
                include: { chapters: true }
            }
        }
    })))
  return (
    <div className='py-8 mx-auto max-w-7xl'>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 place-times-center'>
            {courses.map(course => {
                return <GalleryCourseCard course={course} key={course.id}/>
            })}
        </div>
    </div>
  )
}

export default GalleryPage