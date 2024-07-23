import GalleryCourseCard from '@/components/GalleryCourseCard'
import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import React from 'react'

type Props = {}

const GalleryPage = async (props: Props) => {
    const session = await getAuthSession();
    console.log(session)
    if (session ==  null) {console.error("session is null")}
    const id = session?.user.id
    const courses = (id == null ? [] : (await prisma.course.findMany({
        where: {
            userId: id
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