"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AttendanceModel, type AttendanceData } from "@/lib/attendance-model"
import { AttendanceController } from "@/lib/attendance-controller"

const TIMETABLE = {
  monday: ["EVS Lab", "AOA", "Maths", "DSGT", "COA"],
  tuesday: ["OE", "Math", "COA Lab", "AOA", "DSGT", "Java"],
  wednesday: ["AOA Lab", "COA", "Java", "ED", "EVS"],
  thursday: ["COA", "EVS", "Java lab", "AOA", "ED"],
  friday: ["Math Tutorial", "ED Lab", "DSGT", "OE"],
} as const

type WeekDay = keyof typeof TIMETABLE

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({})
  const [controller] = useState(() => new AttendanceController(new AttendanceModel()))

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]
    setSelectedDate(today)
    setAttendanceData(controller.loadAttendanceData())
  }, [controller])

  const getWeekdayFromDate = (dateString: string): WeekDay | null => {
    if (!dateString) return null
    const date = new Date(dateString)
    const weekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const
    const weekday = weekdays[date.getDay()]
    return TIMETABLE[weekday as WeekDay] ? (weekday as WeekDay) : null
  }

  const getSubjectsForDate = (dateString: string): string[] => {
    const weekday = getWeekdayFromDate(dateString)
    return weekday ? [...TIMETABLE[weekday]] : []
  }

  const handleAttendanceChange = (subject: string, status: "present" | "absent") => {
    const updatedData = controller.markAttendance(subject, selectedDate, status)
    setAttendanceData(updatedData)
  }

  const handleAttendanceRemove = (subject: string) => {
    const updatedData = controller.removeAttendance(subject, selectedDate)
    setAttendanceData(updatedData)
  }

  const getAttendanceStatus = (subject: string, date: string): string => {
    return attendanceData[subject]?.[date] || "unmarked"
  }

  const getAllSubjects = (): string[] => {
    const subjects = new Set<string>()
    Object.values(TIMETABLE).forEach((daySubjects) => {
      daySubjects.forEach((subject) => subjects.add(subject))
    })
    return Array.from(subjects).sort()
  }

  const subjects = getSubjectsForDate(selectedDate)
  const weekday = getWeekdayFromDate(selectedDate)
  const allSubjects = getAllSubjects()
  const overallStats = controller.calculateOverallStats(attendanceData)

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8">Attendance Management System</h1>

      {/* Calendar */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
          {weekday && <p className="mt-2 text-sm text-muted-foreground capitalize">{weekday}</p>}
        </CardContent>
      </Card>

      {/* Mark Attendance */}
      {selectedDate && subjects.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Mark Attendance for {selectedDate}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjects.map((subject) => {
                const status = getAttendanceStatus(subject, selectedDate)
                return (
                  <div key={subject} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{subject}</span>
                    <div className="flex gap-2">
                      <Button
                        variant={status === "present" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleAttendanceChange(subject, "present")}
                      >
                        Present
                      </Button>
                      <Button
                        variant={status === "absent" ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => handleAttendanceChange(subject, "absent")}
                      >
                        Absent
                      </Button>
                      {status !== "unmarked" && (
                        <Button variant="outline" size="sm" onClick={() => handleAttendanceRemove(subject)}>
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Attendance Statistics
            <span className="text-lg font-normal">
              Overall: {overallStats.overall}%{" "}
              {overallStats.needed > 0 && <span className="text-red-600">(Need {overallStats.needed} more)</span>}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Subject</th>
                  <th className="text-center p-2">Attended</th>
                  <th className="text-center p-2">Total</th>
                  <th className="text-center p-2">%</th>
                  <th className="text-center p-2">Needed for 75%</th>
                </tr>
              </thead>
              <tbody>
                {allSubjects.map((subject) => {
                  const stats = controller.calculateSubjectStats(attendanceData, subject)
                  return (
                    <tr key={subject} className="border-b">
                      <td className="p-2">{subject}</td>
                      <td className="text-center p-2">{stats.attended}</td>
                      <td className="text-center p-2">{stats.total}</td>
                      <td className={`text-center p-2 ${stats.percentage < 75 ? "text-red-600" : ""}`}>
                        {stats.total > 0 ? `${stats.percentage}%` : "-"}
                      </td>
                      <td className="text-center p-2">
                        {stats.needed > 0 ? `${stats.needed} more` : "✅ Safe"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
