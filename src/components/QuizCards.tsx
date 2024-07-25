'use client'

import { cn } from '@/lib/utils';
import { Chapter, Question } from '@prisma/client';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import React from 'react';
import { Button } from './ui/button';
import { ChevronRight } from 'lucide-react';
import { unlockNextChapter } from '@/app/api/course/createChapters/route';
import axios from 'axios';

type Props = {
  chapter: Chapter & {
    questions: Question[];
  };
  courseId: string,
};

const QuizCards = ({chapter, courseId}: Props) => {
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [questionState, setQuestionState] = React.useState<Record<string, boolean | null>>({});

  const checkAnswer = React.useCallback(async ()=> {
    const newQuestionState = {...questionState}
    chapter.questions.forEach(question => {
      const user_answer = answers[question.id]
      if (!user_answer) {
        return
      }
      if (user_answer == question.answer) {
        newQuestionState[question.id] = true
      }
      else {
        newQuestionState[question.id] = false
      }
      setQuestionState(newQuestionState)
    })

    let allRight = true

    for (const question in newQuestionState) {
      if ((newQuestionState[question] !== true)) {
        allRight = false;
        break;
      }
    }
    
    if (allRight) {
      try {
        const response = await axios.post('/api/unlockChapter', { courseId });
    
        if (response.status !== 200) {
          throw new Error('Failed to unlock the next chapter');
        }
    
        console.log('Next chapter unlocked successfully');
      } catch (error) {
        console.error('Error unlocking next chapter:', error);
      }
    }

  }, [answers, questionState, chapter.questions, courseId])

  return (
    <div className='flex-[1] mt-16 ml-8'>
        <h1 className='text-2xl font-bold'>
          Concept Check
        </h1>

        <div className='mt-2'>
          {chapter.questions.map((question) => {
            const options = JSON.parse(question.options) as string[]
            return <div key={question.id} className={cn('p-3 mt-4 border border-secondary rounded-lg', {
              'bg-green-700': questionState[question.id] === true,
              'bg-red-700': questionState[question.id] === false,
              'bg-secondary': questionState[question.id] === null,
            })}>
              <h1 className='text-lg font-semibold'>
                  {question.question}
              </h1>

              <div className='mt-2'>
                  <RadioGroup onValueChange={(e) => {
                      setAnswers((prev)=>{
                        return {
                          ...prev,
                          [question.id]: e
                        }
                      })
                    }
                  }>
                    {options.map((option, index) => {
                      return (
                        <div className='flex items-center space-x-2' key={index}>
                          <RadioGroupItem value={option} id={question.id + index.toString()} />
                            <Label htmlFor={question.id + index.toString()}>
                              {option}
                            </Label>
                        </div>
                      )
                    })}
                  </RadioGroup>
              </div>
            </div>;
          })}
        </div>
        <Button className='w-full mt-2' size='lg' onClick={checkAnswer}>
            Check Answers
            <ChevronRight className='w-4 h-4 ml-1'/>
        </Button>
    </div>
  )
}

export default QuizCards

