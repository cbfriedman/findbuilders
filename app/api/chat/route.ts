import {
  consumeStream,
  convertToModelMessages,
  streamText,
  UIMessage,
} from 'ai'

export const maxDuration = 30

const SYSTEM_PROMPT = `You are a helpful construction and home improvement assistant for FindBuilders.net. 

Your expertise includes:
- Home renovation projects (kitchens, bathrooms, basements, etc.)
- Construction costs and budgeting
- Finding and vetting contractors
- Building permits and regulations
- Project timelines and planning
- Material selection and quality

Be helpful, friendly, and provide accurate information. When you don't know something specific (like exact local regulations or current material prices), acknowledge that and suggest the user verify with local authorities or get quotes from contractors.

Always encourage users to:
- Get multiple quotes from contractors
- Check contractor licenses and insurance
- Read reviews and ask for references
- Get everything in writing`

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: 'openai/gpt-5',
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    consumeSseStream: consumeStream,
  })
}
