"use client";
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { LuCalendarDays, LuTrendingUp } from "react-icons/lu";
import {
  PieChart as LucidePieChart,
  BarChart as LucideBarChart,
} from "lucide-react";
import { ny } from "@/lib/utils";

// Mock Data
const studyTimeData = [
  { date: "2025-09-01", duration: 120 },
  { date: "2025-09-02", duration: 90 },
  { date: "2025-09-03", duration: 150 },
  { date: "2025-09-04", duration: 80 },
  { date: "2025-09-05", duration: 200 },
];

const progressData = [
  { chapter: "Intro", progress: 100 },
  { chapter: "AI Basics", progress: 80 },
  { chapter: "ML", progress: 60 },
  { chapter: "Deep Learning", progress: 40 },
];

const subjectDistribution = [
  { name: "Math", value: 400 },
  { name: "AI", value: 300 },
  { name: "ML", value: 300 },
  { name: "DL", value: 200 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const performanceMetrics = [
  { label: "Total Study Time", value: "640 min", icon: LuCalendarDays },
  { label: "Avg. Progress", value: "70%", icon: LuTrendingUp },
  { label: "Subjects", value: "4", icon: LucidePieChart },
  { label: "Chapters Completed", value: "3", icon: LucideBarChart },
];

const learningInsights = [
  {
    title: "Consistent Study",
    description: "You studied consistently for 5 days.",
  },
  { title: "AI Mastery", description: "AI chapters are your strongest area." },
  {
    title: "Math Needs Attention",
    description: "Math chapters have lower completion.",
  },
];

export default function AnalyticsPage() {
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <Select defaultValue="week">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="This Week" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {performanceMetrics.map((metric, idx) => (
          <Card
            key={idx}
            className="flex flex-col items-center justify-center gap-2"
          >
            <CardHeader className="items-center">
              <metric.icon className="text-3xl text-primary" />
              <CardTitle className="text-lg font-semibold">
                {metric.value}
              </CardTitle>
              <CardDescription className="text-xs text-gray-500">
                {metric.label}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="study">Study Time</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Subject Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={subjectDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      label
                    >
                      {subjectDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Progress by Chapter</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={progressData}>
                    <XAxis dataKey="chapter" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="progress" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>Progress by Chapter</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={progressData}>
                  <XAxis dataKey="chapter" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="progress"
                    stroke="#00C49F"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="study">
          <Card>
            <CardHeader>
              <CardTitle>Study Time (minutes)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={studyTimeData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="duration"
                    stroke="#FFBB28"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {learningInsights.map((insight, idx) => (
              <Card key={idx} className="flex flex-col gap-2">
                <CardHeader>
                  <CardTitle className="text-lg">{insight.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">{insight.description}</p>
                  <Badge variant="secondary">Insight</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
