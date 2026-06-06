"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { AnimatedTabsList, AnimatedTabsTrigger } from "@/components/ui/animated-tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import WavesurferPlayer from "@wavesurfer/react"
import { Play, Pause, RotateCcw, RotateCw, Download, Copy, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { toast } from "sonner"
import type { Call } from "@/types/call"
import { formatDate, formatTime, formatDuration } from "@/lib/utils"

interface TranscriptionMessage {
  speaker: 'user' | 'assistant'
  text: string
  timestamp: string
}

interface CallDetailSheetProps {
  call: Call | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CallDetailSheet({ call, open, onOpenChange }: CallDetailSheetProps) {
  const [wavesurfer, setWavesurfer] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [activeTab, setActiveTab] = useState("overview")

  // Mock transcription data
  const mockTranscription: TranscriptionMessage[] = [
    {
      speaker: 'assistant',
      text: 'Good afternoon, you are speaking with Guus, the AI assistant for Downtown Legal. For your information, your details are handled confidentially. How can I help you legally today?',
      timestamp: '00:00 - 00:10 (10s)'
    },
    {
      speaker: 'user',
      text: 'Yes. I would like to schedule an appointment. Is that possible?',
      timestamp: '00:10 - 00:13 (2s)'
    }
  ]

  if (!call) return null

  const handlePlayPause = () => {
    if (wavesurfer) {
      wavesurfer.playPause()
    }
  }

  const handleRewind = () => {
    if (wavesurfer) {
      wavesurfer.skip(-5)
    }
  }

  const handleForward = () => {
    if (wavesurfer) {
      wavesurfer.skip(5)
    }
  }

  const handleDownload = () => {
    try {
      const audioUrl = call.recording_url || "/demo-audio.mp3"
      const link = document.createElement('a')
      link.href = audioUrl
      link.download = `call-${call.contact_number}-${formatDate(call.created_at)}.mp3`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success("Audio downloaded successfully")
    } catch (error) {
      toast.error("Download failed")
    }
  }

  const handleCopyPhone = () => {
    if (call && call.contact_number) {
      navigator.clipboard.writeText(call.contact_number)
        .then(() => {
          toast.success("Copied to clipboard")
        })
        .catch(() => {
          toast.error("Copy failed")
        })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="!w-auto !max-w-[66vw] min-w-[900px] overflow-y-auto p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle className="text-title font-semibold text-foreground">
            Call with {call.caller_name || "Unknown caller"}
          </SheetTitle>
        </SheetHeader>

        <div className="flex h-[calc(100vh-80px)]">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col border-r border-border">

          {/* Audio Player - Fixed */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-border">
            <div className="space-y-3">
              {/* Waveform */}
              <div className="p-3">
                <WavesurferPlayer
                  height={80}
                  waveColor="hsl(0 0% 90%)"
                  progressColor="hsl(0 0% 15%)"
                  cursorColor="hsl(0 0% 15%)"
                  barWidth={2}
                  barGap={1}
                  barRadius={2}
                  url={call.recording_url || "/demo-audio.mp3"}
                  onReady={(ws) => {
                    setWavesurfer(ws)
                    setDuration(ws.getDuration())
                  }}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onTimeupdate={(ws) => setCurrentTime(ws.getCurrentTime())}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full bg-foreground hover:bg-foreground/80"
                        onClick={handlePlayPause}
                      >
                        {isPlaying ? (
                          <Pause className="w-4 h-4 text-primary-foreground" fill="currentColor" />
                        ) : (
                          <Play className="w-4 h-4 text-primary-foreground" fill="currentColor" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isPlaying ? "Pause" : "Play"}</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={handleRewind}
                      >
                        <RotateCcw className="w-3 h-3 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Back 5 seconds</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={handleForward}
                      >
                        <RotateCw className="w-3 h-3 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Forward 5 seconds</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-body text-muted-foreground font-mono">
                    {formatDuration(Math.floor(currentTime))} / {formatDuration(Math.floor(duration))}
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={handleDownload}
                      >
                        <Download className="w-3 h-3 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Download audio</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>

          {/* Content Tabs - Fixed */}
          <div className="flex-shrink-0 px-6 pt-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <AnimatedTabsList className="inline-flex gap-0 bg-transparent border-none p-0">
                <AnimatedTabsTrigger
                  value="overview"
                  isActive={activeTab === "overview"}
                  className="flex-none border-t-0 border-x-0 border-b-2 border-transparent rounded-none px-2 py-1 text-body shadow-none cursor-pointer"
                >
                  Overview
                </AnimatedTabsTrigger>
                <AnimatedTabsTrigger
                  value="transcription"
                  isActive={activeTab === "transcription"}
                  className="flex-none border-t-0 border-x-0 border-b-2 border-transparent rounded-none px-2 py-1 text-body shadow-none cursor-pointer"
                >
                  Transcript
                </AnimatedTabsTrigger>
                <AnimatedTabsTrigger
                  value="client-data"
                  isActive={activeTab === "client-data"}
                  className="flex-none border-t-0 border-x-0 border-b-2 border-transparent rounded-none px-2 py-1 text-body shadow-none cursor-pointer"
                >
                  Client data
                </AnimatedTabsTrigger>
              </AnimatedTabsList>

              {/* Tab Content - Scrollable */}
              <div className="overflow-y-auto px-6 pb-4" style={{ maxHeight: 'calc(100vh - 80px - 200px - 60px)' }}>
                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4 mt-0">
                <Accordion type="multiple" defaultValue={["summary", "appointment", "call-status"]} className="space-y-2">
                  {/* Summary */}
                  <AccordionItem value="summary" className="border-border rounded-lg px-3">
                    <AccordionTrigger className="text-section font-semibold text-foreground hover:no-underline py-3">
                      Summary
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pb-3">
                        <p className="text-body text-muted-foreground leading-relaxed">
                          {call.summary}
                        </p>

                        {/* Key Information */}
                        <div className="space-y-3 pt-1">
                          {/* Case type */}
                          <div className="space-y-1">
                            <p className="text-meta text-muted-foreground uppercase tracking-wide">Case type</p>
                            <p className="text-body text-foreground font-medium">
                              {call.accident_type ? call.accident_type.charAt(0).toUpperCase() + call.accident_type.slice(1) : '-'}
                            </p>
                          </div>

                          {/* Priority */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <p className="text-meta text-muted-foreground uppercase tracking-wide">Priority</p>
                              <p className="text-body text-foreground font-medium">{call.case_priority}/10</p>
                            </div>
                            <Progress
                              value={call.case_priority * 10}
                              variant={
                                call.case_priority >= 8 ? "error" :
                                call.case_priority >= 5 ? "warning" :
                                "success"
                              }
                              className="h-1.5"
                            />
                          </div>

                          {/* Lead Qualified */}
                          <div className="space-y-1">
                            <p className="text-meta text-muted-foreground uppercase tracking-wide">Lead Qualified</p>
                            <Badge
                              variant={call.case_qualified ? "default" : "secondary"}
                              className={`text-caption h-4 px-1.5 font-medium ${
                                call.case_qualified
                                  ? "bg-[hsl(var(--info-success-bg))] text-[hsl(var(--info-success))] border border-[hsl(var(--info-success-border))] hover:bg-[hsl(var(--info-success-hover))]"
                                  : "bg-[hsl(var(--info-error-bg))] text-[hsl(var(--info-error))] border border-[hsl(var(--info-error-border))] hover:bg-[hsl(var(--info-error-hover))]"
                              }`}
                            >
                              {call.case_qualified ? "Yes" : "No"}
                            </Badge>
                          </div>

                          {/* Qualification Reasoning */}
                          <div className="space-y-1">
                            <p className="text-meta text-muted-foreground uppercase tracking-wide">Qualification Reasoning</p>
                            <p className="text-body text-foreground leading-relaxed">{call.qualification_reasoning}</p>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Appointment / Follow-up */}
                  <AccordionItem value="appointment" className="border-border rounded-lg px-3">
                    <AccordionTrigger className="text-section font-semibold text-foreground hover:no-underline py-3">
                      Next steps
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pb-3">
                        {call.appointment_date && call.lawyer_name ? (
                          <>
                            <div className="space-y-1">
                              <p className="text-meta text-muted-foreground uppercase tracking-wide">Appointment date</p>
                              <HoverCard openDelay={200} closeDelay={100}>
                                <HoverCardTrigger asChild>
                                  <Button variant="link" className="h-auto p-0 text-body font-normal text-foreground underline underline-offset-2 inline-flex items-center gap-1.5 justify-start">
                                    <Calendar className="w-2.5 h-2.5 flex-shrink-0 -ml-[14px]" />
                                    <span>{formatDate(call.appointment_date)} at {formatTime(call.appointment_date)}</span>
                                  </Button>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-80">
                                  <div className="space-y-2">
                                    <h4 className="text-section font-semibold">Change appointment</h4>
                                    <p className="text-meta text-muted-foreground">
                                      Click to schedule a new time through our online calendar.
                                    </p>
                                    <Button
                                      size="sm"
                                      className="w-full text-meta h-7"
                                      onClick={() => call.appointment_url && window.open(call.appointment_url, '_blank')}
                                      disabled={!call.appointment_url}
                                    >
                                      Open scheduling
                                    </Button>
                                  </div>
                                </HoverCardContent>
                              </HoverCard>
                            </div>
                            <div className="space-y-1">
                              <p className="text-meta text-muted-foreground uppercase tracking-wide">Lawyer name</p>
                              <p className="text-body text-foreground font-medium">{call.lawyer_name}</p>
                            </div>
                          </>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-meta text-muted-foreground uppercase tracking-wide">Next step</p>
                            <div className="flex items-center gap-2">
                              <p className="text-body text-foreground">No appointment scheduled</p>
                              <HoverCard>
                                <HoverCardTrigger asChild>
                                  <Button variant="link" className="h-auto p-0 text-body">
                                    Schedule appointment
                                  </Button>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-80">
                                  <div className="space-y-2">
                                    <h4 className="text-section font-semibold">Schedule appointment</h4>
                                    <p className="text-meta text-muted-foreground">
                                      Schedule a consultation with one of our lawyers through our online calendar.
                                    </p>
                                    <Button
                                      size="sm"
                                      className="w-full text-meta h-7"
                                      onClick={() => call.appointment_url && window.open(call.appointment_url, '_blank')}
                                      disabled={!call.appointment_url}
                                    >
                                      Open scheduling
                                    </Button>
                                  </div>
                                </HoverCardContent>
                              </HoverCard>
                            </div>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Call Status / Compliance */}
                  <AccordionItem value="call-status" className="border-border rounded-lg px-3">
                    <AccordionTrigger className="text-section font-semibold text-foreground hover:no-underline py-3">
                      Call status
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pb-3">
                        <div className="space-y-1">
                          <p className="text-meta text-muted-foreground uppercase tracking-wide">Outcome</p>
                          <Badge
                            variant="default"
                            className={`text-meta h-5 px-2 font-medium ${
                              call.appointment_date
                                ? "bg-[hsl(var(--info-success-bg))] text-[hsl(var(--info-success))] border border-[hsl(var(--info-success-border))] hover:bg-[hsl(var(--info-success-hover))]"
                                : "bg-[hsl(var(--info-warning-bg))] text-[hsl(var(--info-warning))] border border-[hsl(var(--info-warning-border))] hover:bg-[hsl(var(--info-warning-hover))]"
                            }`}
                          >
                            {call.appointment_date ? "Consult scheduled" : "Follow-up needed"}
                          </Badge>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>

              {/* Transcription Tab */}
              <TabsContent value="transcription" className="space-y-4 mt-0">
                <div className="space-y-4">
                  {mockTranscription.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${
                        message.speaker === 'assistant' ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      {/* Avatar */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Avatar className="h-10 w-10 flex-shrink-0 cursor-default">
                            <AvatarFallback className={`border border-border text-lg ${
                              message.speaker === 'assistant' ? 'bg-muted' : 'bg-background'
                            }`}>
                              {message.speaker === 'assistant' ? '👨‍🚀' : '👨‍⚕️'}
                            </AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{message.speaker === 'assistant' ? 'Agent' : 'Client'}</p>
                        </TooltipContent>
                      </Tooltip>

                      {/* Message Content */}
                      <div className={`flex-1 max-w-[70%] ${message.speaker === 'assistant' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                        <div className={`border rounded-lg px-3 py-2 ${
                          message.speaker === 'assistant'
                            ? 'bg-muted border-border'
                            : 'bg-background border-border'
                        }`}>
                          <p className="text-body text-foreground leading-snug">
                            {message.text}
                          </p>
                        </div>
                        <span className="text-meta text-muted-foreground px-1">
                          {message.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Client Data Tab */}
              <TabsContent value="client-data" className="space-y-4 mt-0">
                <div className="space-y-3">
                  {/* Phone number */}
                  <div className="space-y-1">
                    <p className="text-meta text-muted-foreground uppercase tracking-wide">Phone number</p>
                    <div className="flex items-center gap-2">
                      <p className="text-body text-foreground font-mono">{call.contact_number}</p>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0"
                            onClick={handleCopyPhone}
                          >
                            <Copy className="w-2.5 h-2.5 text-muted-foreground" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy phone number</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Name */}
                  <div className="space-y-1">
                    <p className="text-meta text-muted-foreground uppercase tracking-wide">Name</p>
                    <p className="text-body text-foreground">
                      {call.caller_name || "Unknown caller"}
                    </p>
                  </div>

                  {/* Call date */}
                  <div className="space-y-1">
                    <p className="text-meta text-muted-foreground uppercase tracking-wide">Call date</p>
                    <p className="text-body text-foreground">
                      {formatDate(call.created_at)} at {formatTime(call.created_at)}
                    </p>
                  </div>

                  {/* Call duration */}
                  <div className="space-y-1">
                    <p className="text-meta text-muted-foreground uppercase tracking-wide">Call duration</p>
                    <p className="text-body text-foreground">{formatDuration(call.duration_seconds)}</p>
                  </div>
                </div>
              </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        {/* Metadata Sidebar */}
        <div className="w-[280px] flex-shrink-0 border-l border-border p-6">
          <h3 className="text-section font-semibold text-foreground mb-4">Metadata</h3>
          <div className="space-y-4">
            <div>
              <p className="text-meta text-muted-foreground uppercase tracking-wide mb-1">Date</p>
              <p className="text-body text-foreground">{formatDate(call.created_at)}</p>
            </div>
            <div>
              <p className="text-meta text-muted-foreground uppercase tracking-wide mb-1">Time</p>
              <p className="text-body text-foreground">{formatTime(call.created_at)}</p>
            </div>
            <div>
              <p className="text-meta text-muted-foreground uppercase tracking-wide mb-1">Call duration</p>
              <p className="text-body text-foreground">{formatDuration(call.duration_seconds)}</p>
            </div>
            <div>
              <p className="text-meta text-muted-foreground uppercase tracking-wide mb-1">Lawyer email</p>
              <p className="text-body text-foreground break-words">{call.lawyer_email}</p>
            </div>
            <div>
              <p className="text-meta text-muted-foreground uppercase tracking-wide mb-1">Room ID</p>
              <p className="text-body text-foreground font-mono break-all">{call.room_name}</p>
            </div>
          </div>
        </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
