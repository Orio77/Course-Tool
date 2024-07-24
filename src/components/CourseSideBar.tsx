import { cn } from '@/lib/utils';
import { Chapter, Course, Unit } from '@prisma/client'
import Link from 'next/link';
import React from 'react'
import { Separator } from './ui/separator';

type Props = {
    course: Course & {
        units: (Unit & {
            chapters: Chapter[];
        })[];
    };
    currentChapterId: string;
};
// TODO make locked chapters not clickable
const CourseSideBar = async ({course, currentChapterId}: Props) => {
  return (
    <div className='w-[400px] absolute top-1/2 -translate-y-1/2 p-6 rounded-r-3x1 bg-secondary'>
        <h1 className='text-4xl font-bold'>
            {course.name}
        </h1>

        {course.units.map((unit, unitIndex) => {
            return unit.isUnlocked ? (<div key={unit.id} className='mt-4'>
                <h2 className='text-sm uppercase text-secondary-foreground'>
                    Unit {unitIndex + 1}
                </h2>

                <h2 className='text-2xl font-bold'>
                    {unit.name}
                </h2>

                {unit.chapters.map((chapter, chapterIndex) => {
                    return chapter.isUnlocked ? (
                        <div key={chapter.id}>
                            <Link href={`/course/${course.id}/${unitIndex}/${chapterIndex}`} className={cn('text-secondary-foreground/60', {
                                'text-green-500 font-bold': chapter.id === currentChapterId
                            })}>
                                {chapter.name}
                            </Link>
                        </div>
                    ) : (
                        <div key={chapter.id} className={cn('text-secondary-foreground/60', {
                            'text-gray-600 font-bold': chapter.id === currentChapterId
                        })}>
                            {chapter.name}
                        </div>
                    );
                })}
                <Separator className='mt-2 text-gray-500 bg-gray-500'/>
            </div>) : (
                <div>
                    <h2 className='text-sm uppercase text-secondary-foreground'>
                    Unit {unitIndex + 1}
                </h2>

                <h2 className='text-2xl font-bold text-gray-600'>
                    {unit.name}
                </h2>
                </div>
            )
        })}
    </div>
  )
}

export default CourseSideBar