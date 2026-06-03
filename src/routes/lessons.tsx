import { createFileRoute } from '@tanstack/react-router'
import { LessonsFeed } from '../components/LessonsFeed'

export const Route = createFileRoute('/lessons')({ component: LessonsFeed })
