import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { strict_output } from "@/lib/gpt";
import { checkSubscription } from "@/lib/subscription";
import { getUnsplashImage } from "@/lib/unsplash";
import { createChaptersSchema } from "@/validators/course";
import { Course } from "@prisma/client";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(req: Request, res: Response) {
    try {
        const session = await getAuthSession()
        if (!session?.user) {
            return new NextResponse('unauthorized', {status: 401})
        }
        const isPro = await checkSubscription();
        if (session.user.credits <= 0 && !isPro) {
            return new NextResponse('no credits', {status: 402})
        }
        const body = await req.json()
        const {title, units} = createChaptersSchema.parse(body)

        type outputUnits = {
            title: string;
            chapters: {
                youtube_search_query: string;
                chapter_title: string;
            }[];
        }[];

        let user_prompts: string[] = [];

        units.forEach(unit => {
            user_prompts.push(
                `Create a course about ${title}. The user has requested to create chapters for the following unit: ${unit}. Then for each chapter provide a detailed youtube search query to find an informative educational video. Each query should give educational informative course in youtube.`
            )
        })

        let result: outputUnits = [];
        let system_prompt = 'Act as a master course creator. Create course content. Create chapter titles. Find most suited youtube videos';

        for (const prompt of user_prompts) {
            let output = await strict_output(
                system_prompt,
                prompt,
                {
                    title: 'title of the unit',
                    chapters: 'an array of chapters, each chapter should have a youtube_search_query and a chapter_title key in the JSON object' 
                })
            
            result.push(output);
        }

        const imageSearchTerm = await strict_output(
            'Act as a image search master',
            `Provide a perfect image search term for the title of a course about ${title}. Make it short and concise.`,
            {
                image_search_term: 'a good search term for the title of the course',
            }
        )

        const course_image = await getUnsplashImage(imageSearchTerm.image_search_term);

        const course = await prisma.course.create({
            data: {
                name: title,
                image: course_image,
                userId: session.user.id
            },
        });

        let first = true;

        for (const unit of result) {
            const title = unit.title;
            const prismaUnit = await prisma.unit.create({
                data: {
                    name: title,
                    courseId: course.id
                }
            })

            await prisma.chapter.createMany({
                data: unit.chapters.map((chapter)=>{
                    return {
                        name: chapter.chapter_title,
                        youtubeSearchQuery: chapter.youtube_search_query,
                        unitId: prismaUnit.id
                    }
                })
            })
        }

        for (const unit of result) {
            // Fetch the unit by name to get its id
            const existingUnit = await prisma.unit.findFirst({
                where: { name: unit.title },
                select: { id: true }
            });
        
            if (existingUnit) {
                // Use the id to update the unit
                await prisma.unit.update({
                    where: { id: existingUnit.id },
                    data: { isUnlocked: true }
                });
            }
            break;
        }

        await prisma.user.update({
            where: {
                id: session.user.id,
            }, 
            data: {
                credits: {
                    decrement: 1,
                },
            },
        });

        await unlockNextChapter(course.id);

        return NextResponse.json({course_id: course.id});

    } catch (error) {
        if (error instanceof ZodError) {
            return new NextResponse('invalid body', {status:400})
        }
        console.error(error);
        return new NextResponse('Internal server error', { status: 500 });
    }
}

export async function unlockNextChapter(courseId: string) {
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: { units: { include: { chapters: true } } },
    });

    if (!course) {
        throw new Error('Course not found');
    }

    let found = false;
    let unlockNextUnit = false;

    for (const unit of course.units) {
        if (unlockNextUnit) {
            await prisma.unit.update({
                where: {id: unit.id},
                data: {isUnlocked: true}
            })

            for (const chapter of unit.chapters) {
                await prisma.chapter.update({
                    where: { id: chapter.id },
                    data: { isUnlocked: true },
                });
                return;
            }
        }
        for (const chapter of unit.chapters) {
            if (!chapter.isUnlocked) {
                await prisma.chapter.update({
                    where: { id: chapter.id },
                    data: { isUnlocked: true },
                });
                found = true;
            }
        }
        if (found) {
            unlockNextUnit = unit.chapters.every(chapter => chapter.isUnlocked);
            if (!unlockNextUnit) {
                return;
            }
        }
    }
}