import { YoutubeTranscript } from 'youtube-transcript';
import { strict_output } from './gpt';
import axios from 'axios';

export async function searchYouTube(searchQuery: string) {
    searchQuery = encodeURIComponent(searchQuery);
    console.count("youtube search");
    const { data } = await axios.get(
      `https://www.googleapis.com/youtube/v3/search?key=${process.env.YOUTUBE_API}&q=${searchQuery}&videoDuration=medium&videoEmbeddable=true&type=video&maxResults=5`
    );
    if (!data) {
        console.log("youtube fail");
        return null;
    }

    if (data.items[0] == undefined) {
      console.log("youtube fail");
      return null;
    }
    return data.items[0].id.videoId;
}

export async function getTranscript(videoId: string) {
    try {
        let transcript_arr = await YoutubeTranscript.fetchTranscript(videoId, {
            lang: 'en',
        });
        let transcript = ''
        for (let t of transcript_arr) {
            transcript += t.text + ' ';
        }
        return transcript.replaceAll('\n', '');
    } catch (error) {
        return "";
    }
}

export async function getQuestionsFromTranscript(transcript: string, course_title: string) {
    type Question = {
        question: string,
        answer: string,
        option1: string,
        option2: string,
        option3: string,
    }
    const questions: Question[] = await strict_output('Act as a master at creating mcq questions and answers. The answers must be short - no more than 15 words',
        new Array(5).fill(`You are to generate a random hard mcq question about ${course_title} with context of the following transcript: ${transcript}`),
            {
                question: 'question',
                answer: 'answer with max length of 15 words',
                option1: 'option with max length of 15 words',
                option2: 'option with max length of 15 words',
                option3: 'option with max length of 15 words'
            }
    )
    return questions;
}