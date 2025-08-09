"use client"

import React, { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/atoms/tabs'
import {
  Book,
  MessageSquare,
  FileText,
  Database,
  Save,
  Wand2,
  Plus,
  X,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/atoms/select'
import { toast } from 'sonner'
import { apiClient } from '@/lib/axios'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/atoms/dialog'
import Button from '@/components/atoms/button'

type Sender = 'user' | 'assistant'

interface Language {
  languageCode: string
  priority: number
  languageName: string
}

const Configuration = () => {
  const [activeTab, setActiveTab] = useState('tab1')
  const [firstMessageText, setFirstMessageText] = useState('')
  const [firstMessage, setFirstMessage] = useState<Sender>('assistant')
  const [languages, setLanguages] = useState<Language[]>([
    { languageCode: 'en', priority: 1, languageName: 'English' },
  ])

  const [profileInfo,setProfileInfo] = useState("")

  const [handleGenerateContentModal, setHandleGenerateContentModal] = useState(false)

  const [tabContents, setTabContents] = useState({
    tab1: '',
    tab2: '',
    tab3: '',
    tab4: '',
  })

  useEffect(() => {
    getDataLake()
  }, [])

  const getDataLake = async () => {
    try {
      const response = await apiClient.get("voice-assistant/get-data-lake")

      if (response.data && response.data.data) {
        const data = response.data.data
        setTabContents({
          tab1: data.identity_purpose || '',
          tab2: data.conversation_flow || '',
          tab3: data.guidelines_scenarios || '',
          tab4: data.knowledge_base || '',
        })

        setFirstMessage(data.is_assistant_first_speaks ? 'assistant' : 'user')
        if (data.assistant_first_text) {
          setFirstMessageText(data.assistant_first_text)
        }

        if (data.assistant_languages) {
          const parsedLanguages = JSON.parse(data.assistant_languages)
          setLanguages(
            parsedLanguages.map((lang: any) => ({
              languageCode: lang.language_code,
              priority: lang.priority,
              languageName: getLanguageName(lang.language_code),
            }))
          )
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleTabContentChange = (tab: string, content: string) => {
    setTabContents((prev) => ({
      ...prev,
      [tab]: content,
    }))
  }

  const addLanguage = () => {
    setLanguages((prev) => [
      ...prev,
      {
        languageCode: 'en',
        priority: prev.length + 1,
        languageName: 'English',
      },
    ])
  }

  const removeLanguage = (index: number) => {
    setLanguages((prev) => {
      const newLanguages = prev.filter((_, i) => i !== index)
      return newLanguages.map((lang, i) => ({
        ...lang,
        priority: i + 1,
      }))
    })
  }

  const getLanguageName = (code: string): string => {
    const languageMap: { [key: string]: string } = {
      en: 'English',
      hi: 'Hindi', 
      de: 'German',
      es: 'Spanish',
      fr: 'French',
      ar: 'Arabic',
      it: 'Italian',
      ja: 'Japanese',
      ko: 'Korean',
      nl: 'Dutch',
      pt: 'Portuguese',
      ru: 'Russian',
      tr: 'Turkish',
      ta: 'Tamil',
      te: 'Telugu',
      mr: 'Marathi',
      bn: 'Bengali',
      pa: 'Punjabi',
      gu: 'Gujarati',
      kn: 'Kannada',
    }
    return languageMap[code] || code
  }

  const updateLanguage = (index: number, languageCode: string) => {
    setLanguages((prev) =>
      prev.map((lang, i) =>
        i === index
          ? {
              ...lang,
              languageCode,
              languageName: getLanguageName(languageCode),
            }
          : lang
      )
    )
  }

  const handleUpdateAssistant = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const postData = {
        identity_purpose: tabContents.tab1,
        conversation_flow: tabContents.tab2,
        guidelines_scenarios: tabContents.tab3,
        knowledge_base: tabContents.tab4,
        is_assistant_first_speaks: firstMessage === 'assistant',
        assistant_first_text: firstMessageText,
        languages: languages,
      }

      const response = await apiClient.post(
        "voice-assistant/update-assistant",
        postData
      )
      
      if (response.data && response.data.status) {
        toast.success(response.data.message)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response.data.message)
    }
  }

  const handleGenerateContent = async () => {
    try {
      const response = await apiClient.post("voice-assistant/generate-content")
      
      if (response.data && response.data.data) {
        const data = response.data.data
        setTabContents({
          tab1: data.identity_purpose || '',
          tab2: data.conversation_flow || '',
          tab3: data.guidelines_scenarios || '',
          tab4: data.knowledge_base || '',
        })
        setFirstMessage(data.is_assistant_first_speaks ? 'assistant' : 'user')
        if (data.assistant_first_text) {
          setFirstMessageText(data.assistant_first_text)
        }
        if (data.languages) {
          setLanguages(data.languages)
        }
        toast.success('Content generated successfully')
      }
    } catch (error) {
      console.log(error)
      toast.error('Failed to generate content')
    }
  }

  return (
    <div className="w-full rounded-xl border border-n-6 bg-n-8 p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-n-1">Voice Assistant Configuration</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setHandleGenerateContentModal(true)}
            className="flex items-center gap-1.5 rounded-md border border-n-6 bg-n-7 px-3 py-2 text-sm text-n-1 hover:bg-n-6"
          >
            <Wand2 className="h-3.5 w-3.5" />
            Generate
          </button>
          <button
            onClick={handleUpdateAssistant}
            className="flex items-center gap-1.5 rounded-md bg-color-1 px-3 py-2 text-sm text-n-1 hover:bg-color-1/80"
          >
            <Save className="h-3.5 w-3.5" />
            Save
          </button>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-n-6 bg-n-8 p-4">
        <div className="grid gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-n-1">
              Initial Interaction
              <span className="block text-xs text-n-3">
                Choose who starts the conversation - the assistant or the user
              </span>
            </label>
            <Select value={firstMessage} onValueChange={setFirstMessage}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Who speaks first?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="assistant">Assistant speaks first</SelectItem>
                <SelectItem value="user">User speaks first</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {firstMessage === 'assistant' && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-n-1">
                First Message
                <span className="block text-xs text-n-3">
                  The initial greeting message the assistant will speak
                </span>
              </label>
              <input
                type="text"
                value={firstMessageText}
                onChange={(e) => setFirstMessageText(e.target.value)}
                className="w-full rounded-md border border-n-6 bg-n-7 px-3 py-2 text-sm text-n-1 focus:border-color-1 focus:ring-2 focus:ring-color-1"
                placeholder="Enter assistant's first message..."
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between py-2">
              <label className="mb-1.5 block text-sm font-medium text-n-1">
                Languages
                <span className="block text-xs text-n-3">
                  Set your preferred languages in order - your AI assistant will prioritize speaking in these languages
                </span>
              </label>
              <button
                onClick={addLanguage}
                className="flex items-center gap-1.5 rounded-md border border-n-6 bg-n-7 px-2 py-1 text-sm text-n-1 hover:bg-n-6"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Language
              </button>
            </div>
            <div className="space-y-2">
              {languages.map((lang, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Select
                    value={lang.languageCode}
                    onValueChange={(value) => updateLanguage(index, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                      <SelectItem value="it">Italian</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                      <SelectItem value="ko">Korean</SelectItem>
                      <SelectItem value="nl">Dutch</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                      <SelectItem value="ru">Russian</SelectItem>
                      <SelectItem value="tr">Turkish</SelectItem>
                      <SelectItem value="ta">Tamil</SelectItem>
                      <SelectItem value="te">Telugu</SelectItem>
                      <SelectItem value="mr">Marathi</SelectItem>
                      <SelectItem value="bn">Bengali</SelectItem>
                      <SelectItem value="pa">Punjabi</SelectItem>
                      <SelectItem value="gu">Gujarati</SelectItem>
                      <SelectItem value="kn">Kannada</SelectItem>
                    </SelectContent>
                  </Select>
                  {index > 0 && (
                    <button
                      onClick={() => removeLanguage(index)}
                      className="rounded-md border border-n-6 bg-n-7 p-2 text-color-3 hover:bg-n-6"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="tab1" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-6 flex gap-1.5 rounded-lg border border-n-6 bg-n-7 p-1">
          <TabsTrigger
            value="tab1"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-sm data-[state=active]:bg-color-1 data-[state=active]:text-n-1"
          >
            <Book className="h-3.5 w-3.5" />
            Identity
          </TabsTrigger>
          <TabsTrigger
            value="tab2"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-sm data-[state=active]:bg-color-1 data-[state=active]:text-n-1"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Flow
          </TabsTrigger>
          <TabsTrigger
            value="tab3"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-sm data-[state=active]:bg-color-1 data-[state=active]:text-n-1"
          >
            <FileText className="h-3.5 w-3.5" />
            Guidelines
          </TabsTrigger>
          <TabsTrigger
            value="tab4"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-sm data-[state=active]:bg-color-1 data-[state=active]:text-n-1"
          >
            <Database className="h-3.5 w-3.5" />
            Knowledge
          </TabsTrigger>
        </TabsList>

        <div className="rounded-lg border border-n-6 bg-n-8 p-4">
          <TabsContent value="tab1">
            <p className="mb-2 text-xs text-n-3">
              Define the assistant's personality, purpose, and core characteristics
            </p>
            <textarea
              className="h-[400px] w-full rounded-md border border-n-6 bg-n-7 p-3 font-mono text-sm text-n-1 focus:border-color-1 focus:ring-2 focus:ring-color-1"
              value={tabContents.tab1}
              onChange={(e) => handleTabContentChange('tab1', e.target.value)}
              placeholder="Enter Identity & Purpose content..."
            />
          </TabsContent>

          <TabsContent value="tab2">
            <p className="mb-2 text-xs text-n-3">
              Specify how conversations should flow and the interaction patterns
            </p>
            <textarea
              className="h-[400px] w-full rounded-md border border-n-6 bg-n-7 p-3 font-mono text-sm text-n-1 focus:border-color-1 focus:ring-2 focus:ring-color-1"
              value={tabContents.tab2}
              onChange={(e) => handleTabContentChange('tab2', e.target.value)}
              placeholder="Enter Conversation Flow content..."
            />
          </TabsContent>

          <TabsContent value="tab3">
            <p className="mb-2 text-xs text-n-3">
              Set guidelines for handling different scenarios and situations
            </p>
            <textarea
              className="h-[400px] w-full rounded-md border border-n-6 bg-n-7 p-3 font-mono text-sm text-n-1 focus:border-color-1 focus:ring-2 focus:ring-color-1"
              value={tabContents.tab3}
              onChange={(e) => handleTabContentChange('tab3', e.target.value)}
              placeholder="Enter Guidelines & Scenarios content..."
            />
          </TabsContent>

          <TabsContent value="tab4">
            <p className="mb-2 text-xs text-n-3">
              Add domain-specific knowledge and information the assistant should know
            </p>
            <textarea
              className="h-[400px] w-full rounded-md border border-n-6 bg-n-7 p-3 font-mono text-sm text-n-1 focus:border-color-1 focus:ring-2 focus:ring-color-1"
              value={tabContents.tab4}
              onChange={(e) => handleTabContentChange('tab4', e.target.value)}
              placeholder="Enter Knowledge Base content..."
            />
          </TabsContent>
        </div>
      </Tabs>

      

      {/* Modal for generate content option  */}

      <Dialog open={handleGenerateContentModal} onOpenChange={setHandleGenerateContentModal}  >
     
        <DialogContent className="max-w-[300px] lg:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Generate Configuration Content</DialogTitle>
            <DialogDescription>
              Describe what kind of AI assistant you want to create and we'll help generate the configuration.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <textarea
              value={profileInfo}
              onChange={(e) =>{
                setProfileInfo(e.target.value);
              }}
              className="h-[300px] w-full rounded-md border border-n-6 bg-n-7 p-3 font-mono text-sm text-n-1 focus:border-color-1 focus:ring-2 focus:ring-color-1"
              placeholder="Describe your AI assistant's purpose, personality, and key capabilities..."
            />
          </div>
          <DialogFooter className="mt-6 w-full flex !justify-between gap-4 items-center">
            <Button onClick={()=>{setHandleGenerateContentModal(false)}}>
              Cancel
            </Button>
            <Button>
              <div  className="flex gap-2 ">

            <Wand2 className="h-3.5 w-3.5" />
              <span>
              Generate
              </span>
              </div>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


    </div>
  )
}

export default Configuration