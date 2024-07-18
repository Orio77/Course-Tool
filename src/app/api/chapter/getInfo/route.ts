import { prisma } from "@/lib/db";
import { strict_output } from "@/lib/gpt";
import { getQuestionsFromTranscript, getTranscript, searchYouTube } from "@/lib/youtube";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodyParser = z.object({
    chapterId: z.string(),
});

export async function POST(req: Request, res: Response) {
    try {
        const body = await req.json();
        const { chapterId } = bodyParser.parse(body);
        const chapter = await prisma.chapter.findUnique({
            where: {
                id: chapterId,
            },
        });

        if (!chapter) {
            return NextResponse.json({
                success: false,
                error: "Chapter not found",
            }, {
                status: 404
            });
        }

        const videoId = await searchYouTube(chapter.youtubeSearchQuery);

        if (!videoId) {
            console.error("YouTube search failed for query:", chapter.youtubeSearchQuery);
            return NextResponse.json({
                success: false,
                error: "YouTube search failed",
            }, {
                status: 500
            });
        }

        let transcript = await getTranscript(videoId);

        if (!transcript) {
            console.error("Transcript fetch failed for videoId:", videoId);
            return NextResponse.json({
                success: false,
                error: "Transcript fetch failed",
            }, {
                status: 500
            });
        }

        let maxLength = 250;
        transcript = transcript.split(' ').slice(0, maxLength).join(" ");

        const { summary }: { summary: string } = await strict_output('Act as a master text summarizer',
            'Summarize in 250 words or less and do not talk of anything unrelated to the main topic. Do not introduce what the summary is about.\n' + transcript,
            { summary: 'summary of the transcript' }
        );

        const questions = await getQuestionsFromTranscript(transcript, chapter.name);

        await prisma.question.createMany({
            data: questions.map(question => {
                let options = [question.answer, question.option1, question.option2, question.option3];
                options = options.sort(() => Math.random() - 0.5);
                return {
                    question: question.question,
                    answer: question.answer,
                    options: JSON.stringify(options),
                    chapterId: chapterId,
                };
            })
        });

        await prisma.chapter.update({
            where: { id: chapterId },
            data: {
                videoId: videoId,
                summary: summary,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error in POST /api/chapter/getInfo:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                error: 'Invalid body',
            }, {
                status: 400
            });
        } else {
            return NextResponse.json({
                success: false,
                error: 'unknown',
            }, {
                status: 500
            });
        }
    }
}
