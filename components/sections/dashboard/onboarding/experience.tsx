"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import Button from "@/components/atoms/button"
import { Input } from "@/components/atoms/input"
import { Label } from "@/components/atoms/label"
import { Textarea } from "@/components/atoms/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/atoms/dialog"
import apiClient from "@/lib/axios/apiClient"

type StepProps = {
  nextStep: () => void
  prevStep: () => void
}

type Metric = {
  id: string
  name: string
  description: string
  tags: string[]
  type: "value" | "text"
}

const EXPERIENCE_PRESETS: Record<
  "NEW_GRADUATE" | "EXPERIENCED_PROFESSIONAL" | "SPECIALIST_EXPERT",
  { title: string; highlights: string[]; metrics: string[] }
> = {
  NEW_GRADUATE: {
    title: "New Graduate",
    highlights: ["Perfect for showcasing education and clinical preparation"],
    metrics: [
      "Education Level",
      "Clinical Hours",
      "Academic GPA",
      "Certifications",
    ],
  },
  EXPERIENCED_PROFESSIONAL: {
    title: "Experienced Professional",
    highlights: ["Highlight your proven track record and expertise"],
    metrics: [
      "Patients Treated",
      "Years Experience",
      "Success Rate",
      "Patient Satisfaction",
    ],
  },
  SPECIALIST_EXPERT: {
    title: "Specialist/Expert",
    highlights: ["Showcase advanced expertise and leadership"],
    metrics: [
      "Specializations",
      "Research Publications",
      "Success Rate",
      "Workshops Conducted",
    ],
  },
}

const DEFAULT_METRICS: Metric[] = [
  {
    id: "patients",
    name: "Patients Treated",
    description: "Total number of patients you have successfully treated",
    tags: ["experienced", "showcase"],
    type: "value",
  },
  {
    id: "years",
    name: "Years Experience",
    description: "Total years of professional practice",
    tags: ["experienced", "showcase"],
    type: "value",
  },
  {
    id: "success",
    name: "Success Rate",
    description: "Percentage of successful treatment outcomes",
    tags: ["experienced", "specialist", "showcase"],
    type: "value",
  },
  {
    id: "certs",
    name: "Certifications",
    description: "Number of professional certifications obtained",
    tags: ["new grad", "experienced", "specialist"],
    type: "value",
  },
  {
    id: "education",
    name: "Education Level",
    description: "Highest degree obtained",
    tags: ["new grad", "showcase"],
    type: "text",
  },
  {
    id: "clinical",
    name: "Clinical Hours",
    description: "Hours of supervised clinical practice",
    tags: ["new grad"],
    type: "value",
  },
  {
    id: "gpa",
    name: "Academic GPA",
    description: "Grade point average for your program",
    tags: ["new grad"],
    type: "value",
  },
  {
    id: "satisfaction",
    name: "Patient Satisfaction",
    description: "Average satisfaction score from feedback",
    tags: ["experienced"],
    type: "value",
  },
  {
    id: "specializations",
    name: "Specializations",
    description: "Key specialization areas",
    tags: ["specialist"],
    type: "text",
  },
  {
    id: "publications",
    name: "Research Publications",
    description: "Peer-reviewed papers or articles",
    tags: ["specialist"],
    type: "value",
  },
  {
    id: "workshops",
    name: "Workshops Conducted",
    description: "Training sessions or workshops you've led",
    tags: ["specialist"],
    type: "value",
  },
]

const schema = z.object({
  experienceLevel: z.enum([
    "NEW_GRADUATE",
    "EXPERIENCED_PROFESSIONAL",
    "SPECIALIST_EXPERT",
  ]),
  selectedMetricIds: z.array(z.string()).min(1, "Pick at least one metric"),
  values: z.record(z.string(), z.string()).optional(),
})

type FormValues = z.infer<typeof schema>

export default function ExperienceStep({ nextStep, prevStep }: StepProps) {
  const [customMetrics, setCustomMetrics] = useState<Metric[]>([])
  const allMetrics = useMemo(
    () => [...DEFAULT_METRICS, ...customMetrics],
    [customMetrics],
  )
  const [isInitializing, setIsInitializing] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      experienceLevel: "EXPERIENCED_PROFESSIONAL",
      selectedMetricIds: ["patients", "years", "success", "certs"],
      values: {},
    },
  })

  useEffect(() => {
    let mounted = true
    apiClient
      .get("/onboarding/experience")
      .then(res => {
        if (!mounted) return
        const data = res?.data?.data
        if (!data) return
        // Safely parse metrics
        let parsed: Array<{ id: string; value?: string | number | null }> = []
        try {
          const raw = data.metrics
          parsed = typeof raw === "string" ? JSON.parse(raw) : Array.isArray(raw) ? raw : []
        } catch {}

        // Add any unknown metrics as custom to render them
        const knownIds = new Set(allMetrics.map(m => m.id))
        const unknown = parsed.filter(m => m && m.id && !knownIds.has(m.id))
        if (unknown.length) {
          setCustomMetrics(prev => {
            const additions: Metric[] = []
            const existingIds = new Set([...DEFAULT_METRICS, ...prev].map(m => m.id))
            for (const m of unknown) {
              if (existingIds.has(m.id)) continue
              const name = m.id
                .split("-")
                .map(s => s.charAt(0).toUpperCase() + s.slice(1))
                .join(" ")
              additions.push({ id: m.id, name, description: "Custom metric", tags: ["custom"], type: "value" })
            }
            return additions.length ? [...prev, ...additions] : prev
          })
        }

        // Apply into form state
        setIsInitializing(true)
        const valuesMap: Record<string, string> = {}
        const ids: string[] = []
        for (const m of parsed) {
          if (!m || !m.id) continue
          ids.push(m.id)
          if (m.value != null) valuesMap[m.id] = String(m.value)
        }
        if (ids.length) setValue("selectedMetricIds", ids, { shouldValidate: true })
        if (Object.keys(valuesMap).length) setValue("values", valuesMap, { shouldValidate: false })
        if (data.experience) setValue("experienceLevel", data.experience, { shouldValidate: true })
        setIsInitializing(false)
      })
      .catch(err => {
        console.error("[Onboarding] Experience get error", err)
      })
    return () => {
      mounted = false
    }
  }, [allMetrics, setValue])

  const experienceLevel = watch("experienceLevel")
  const selectedMetricIds = watch("selectedMetricIds")
  const [query, setQuery] = useState("")

  const visibleMetrics = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allMetrics.filter(m =>
      [m.name, m.description, ...m.tags].some(t => t.toLowerCase().includes(q)),
    )
  }, [query, allMetrics])

  const toggleMetric = (id: string) => {
    const set = new Set(selectedMetricIds)
    set.has(id) ? set.delete(id) : set.add(id)
    setValue("selectedMetricIds", Array.from(set), { shouldValidate: true })
  }

  const onSubmit = (values: FormValues) => {
    try {
      // Log payload for API submission
      const payload = {
        experienceLevel: values.experienceLevel,
        metrics: values.selectedMetricIds.map(id => ({
          id,
          value: values.values?.[id] ?? null,
        })),
      }
      console.log("[Onboarding] Experience save payload", payload)
      apiClient.post("/onboarding/experience", payload).then(res => {
        console.log("[Onboarding] Experience save response", res)
      })
      nextStep()
    } catch (error) {
      console.error("[Onboarding] Experience save error", error)
    }
  }

  useEffect(() => {
    if (isInitializing) return
    // Auto-select metrics based on chosen experience level
    const presetNames = EXPERIENCE_PRESETS[experienceLevel].metrics
    const byName = new Map(allMetrics.map(m => [m.name, m.id]))
    const ids = presetNames.map(n => byName.get(n)).filter(Boolean) as string[]
    setValue("selectedMetricIds", ids, { shouldValidate: true })
  }, [experienceLevel, setValue, allMetrics, isInitializing])

  // Custom Metric dialog state & handlers
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [metricName, setMetricName] = useState("")
  const [metricDescription, setMetricDescription] = useState("")
  const [metricType, setMetricType] = useState<Metric["type"]>("value")
  const [metricTags, setMetricTags] = useState("")

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")

  const createCustomMetric = () => {
    const name = metricName.trim()
    if (!name) return
    const id = slugify(name)
    const tags = metricTags
      .split(",")
      .map(t => t.trim())
      .filter(Boolean)
    const newMetric: Metric = {
      id,
      name,
      description: metricDescription.trim() || "Custom metric",
      tags: tags.length ? tags : ["custom"],
      type: metricType,
    }
    setCustomMetrics(prev => {
      const next = [...prev]
      // Avoid duplicate ids
      if (![...DEFAULT_METRICS, ...prev].some(m => m.id === id))
        next.push(newMetric)
      return next
    })
    // Select the metric
    toggleMetric(id)
    // Reset dialog state
    setMetricName("")
    setMetricDescription("")
    setMetricType("value")
    setMetricTags("")
    setIsDialogOpen(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Experience Level */}
      <div className="space-y-3">
        <Label>Select Your Experience Level</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(
            [
              "NEW_GRADUATE",
              "EXPERIENCED_PROFESSIONAL",
              "SPECIALIST_EXPERT",
            ] as const
          ).map(key => (
            <button
              key={key}
              type="button"
              onClick={() =>
                setValue("experienceLevel", key, { shouldValidate: true })
              }
              className={`rounded-xl border p-4 text-left transition-colors ${
                experienceLevel === key
                  ? "border-color-1 bg-n-7"
                  : "border-n-6 bg-n-8 hover:bg-n-7"
              }`}
            >
              <div className="font-medium text-n-1">
                {EXPERIENCE_PRESETS[key].title}
              </div>
              <ul className="mt-2 list-disc pl-5 text-xs text-n-3 space-y-1">
                {EXPERIENCE_PRESETS[key].highlights.map(h => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </button>
          ))}
        </div>
        {errors.experienceLevel && (
          <p className="text-xs text-color-3">
            {errors.experienceLevel.message as string}
          </p>
        )}
      </div>

      {/* Customize Metrics */}
      <div className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-n-1">
              Customize Your Metrics
            </div>
            <div className="text-xs text-n-4">
              Select and configure the metrics to display on your profile
            </div>
          </div>
          <div className="text-xs text-n-3">
            <span className="font-medium text-n-1">
              {selectedMetricIds.length}
            </span>{" "}
            metrics selected
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Search metrics by name or description..."
            onChange={e => setQuery(e.target.value)}
          />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                className="px-4 bg-color-1 text-n-1 hover:bg-color-1/90 rounded-md border border-color-1"
              >
                Create Custom Metric
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Custom Metric</DialogTitle>
                <DialogDescription>
                  Add your own professional metric to display on your profile.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div>
                  <Label htmlFor="metric-name">Name</Label>
                  <Input
                    id="metric-name"
                    placeholder="e.g., Community Workshops"
                    value={metricName}
                    onChange={e => setMetricName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="metric-description">Description</Label>
                  <Textarea
                    id="metric-description"
                    rows={3}
                    placeholder="Short description of the metric"
                    value={metricDescription}
                    onChange={e => setMetricDescription(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="metric-type">Type</Label>
                    <select
                      id="metric-type"
                      className="w-full h-9 rounded-md border bg-transparent px-3 py-1 text-sm"
                      value={metricType}
                      onChange={e =>
                        setMetricType(e.target.value as Metric["type"])
                      }
                    >
                      <option value="value">Numeric Value</option>
                      <option value="text">Text</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="metric-tags">Tags (comma separated)</Label>
                    <Input
                      id="metric-tags"
                      placeholder="e.g., custom, showcase"
                      value={metricTags}
                      onChange={e => setMetricTags(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" className="px-4">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="button"
                  className="px-4 bg-color-1 text-n-1 hover:bg-color-1/90 rounded-md border border-color-1"
                  onClick={createCustomMetric}
                >
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visibleMetrics.map(m => {
            const selected = selectedMetricIds.includes(m.id)
            return (
              <div
                key={m.id}
                className={`rounded-xl border p-4 transition-colors ${
                  selected
                    ? "border-color-1 bg-n-7"
                    : "border-n-6 bg-n-8 hover:bg-n-7"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-n-1">{m.name}</div>
                    <div className="text-xs text-n-3">{m.description}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {m.tags.map(t => (
                        <span
                          key={t}
                          className="text-[10px] rounded border border-n-6 px-2 py-0.5 text-n-3"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleMetric(m.id)}
                    className={`h-7 rounded-md border px-3 text-sm ${
                      selected
                        ? "border-color-1 bg-color-1 text-n-1"
                        : "border-n-6 text-n-2 hover:bg-n-7"
                    }`}
                  >
                    {selected ? "Selected" : "Select"}
                  </button>
                </div>

                {selected && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {m.type === "value" ? (
                      <div>
                        <Label htmlFor={`metric-${m.id}`}>Value</Label>
                        <Input
                          id={`metric-${m.id}`}
                          placeholder="e.g., 500"
                           value={(watch("values") || {})[m.id] ?? ""}
                           onChange={e =>
                            setValue("values", {
                              ...(watch("values") || {}),
                              [m.id]: e.target.value,
                            })
                          }
                        />
                      </div>
                    ) : (
                      <div className="sm:col-span-2">
                        <Label htmlFor={`metric-${m.id}`}>Details</Label>
                        <Textarea
                          id={`metric-${m.id}`}
                          rows={2}
                          placeholder="Enter details"
                           value={(watch("values") || {})[m.id] ?? ""}
                          onChange={e =>
                            setValue("values", {
                              ...(watch("values") || {}),
                              [m.id]: e.target.value,
                            })
                          }
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        {errors.selectedMetricIds && (
          <p className="mt-1 text-xs text-color-3">
            {errors.selectedMetricIds.message as string}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        <Button type="button" className="px-5" onClick={prevStep}>
          Prev
        </Button>
        <Button type="submit" className="px-6">
          Save and Continue
        </Button>
      </div>
    </form>
  )
}
