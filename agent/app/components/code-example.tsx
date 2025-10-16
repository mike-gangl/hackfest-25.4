import type { ReactNode } from "react"
import SyntaxHighlighter from 'react-syntax-highlighter';
import docco from 'react-syntax-highlighter/dist/esm/styles/hljs/docco'
import monokai from 'react-syntax-highlighter/dist/esm/styles/hljs/monokai'; // Or another dark theme

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@components/ui/tabs"
import { useDarkMode } from "~/hooks/use-dark-mode.js";
import { Badge } from "@components/ui/badge"
import { Code, File } from "lucide-react";

interface CodeExample {
  title: string
  description: string
  filename: string
  content: string
}

interface CodeExampleProps {
  examples: CodeExample[]
}

export default function CodeExample({
  examples
}: CodeExampleProps) {
  const { darkMode } = useDarkMode()
  return (
    <div className="flex w-full flex-col gap-6">
      <Tabs defaultValue={examples[0].title}>
        <TabsList>
          {
            examples.map(({ title }) => (
              <TabsTrigger key={title} value={title}>{title}</TabsTrigger>
            ))
          }
        </TabsList>
        {
          examples.map(({ title, description, filename, content }) => (
            <TabsContent key={title} value={title}>
              <Card className="pb-0">
                <CardHeader>
                  <CardTitle className="flex flex-col items-start gap-2"><Code className="text-secondary w-5 h-5" />{title}</CardTitle>
                  <CardDescription>
                    {description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 overflow-y-auto">
                  <Badge variant="outline"><File />{filename}</Badge>
                  <SyntaxHighlighter language={title.toLowerCase()} style={darkMode ? monokai : docco} showLineNumbers>
                    {content}
                  </SyntaxHighlighter>
                </CardContent>
              </Card>
            </TabsContent>
          ))
        }
      </Tabs>
    </div>
  )
}
