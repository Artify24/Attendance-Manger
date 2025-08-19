"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AttendanceModel, AttendanceData } from "@/lib/attendance-model"
import { AttendanceController } from "@/lib/attendance-controller"

// Hardcoded timetable (trimmed subject names)
const TIMETABLE = {
  monday: ["EVS Lab", "AOA", "Maths", "DSGT", "COA"],
  tuesday: ["OE", "Math", "COA Lab", "AOA", "DSGT", "Java"],
  wednesday: ["AOA Lab", "COA", "Java", "ED", "EVS"],
  thursday: ["COA", "EVS", "Java Lab", "AOA", "ED"],
  friday: ["Math Tutorial", "ED Lab", "DSGT", "OE"],
} as const

type WeekDay = keyof typeof TIMETABLE 

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    new Date().toISOString().split("T")[0]
  )
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({})
  const [controller] = useState(() => new AttendanceController(new AttendanceModel()))

  useEffect(() => {
    // Load attendance data from localStorage
    const data = controller.loadAttendanceData()
    setAttendanceData(data)
  }, [controller])

  const getWeekdayFromDate = (dateString: string): WeekDay | null => {
    if (!dateString) return null
    const date = new Date(dateString)
    const map: Record<number, WeekDay | null> = {
      0: null,        // Sunday
      1: "monday",
      2: "tuesday",
      3: "wednesday",
      4: "thursday",
      5: "friday",
      6: null         // Saturday
    }
    return map[date.getDay()]
  }

  const getSubjectsForDate = (dateString: string): string[] => {
    const weekday = getWeekdayFromDate(dateString)
    return weekday ? TIMETABLE[weekday].map((s) => s.trim()) : []
  }

  const handleAttendanceChange = (subject: string, status: "present" | "absent") => {
    const updatedData = controller.markAttendance(subject, selectedDate, status)
    setAttendanceData(updatedData)
  }

  const getAttendanceStatus = (subject: string, date: string): string => {
    return attendanceData[subject]?.[date] || "unmarked"
  }

  const getAllSubjects = (): string[] => {
    const subjects = new Set<string>()
    Object.values(TIMETABLE).forEach((daySubjects) => {
      daySubjects.forEach((subject) => subjects.add(subject.trim()))
    })
    return Array.from(subjects).sort()
  }

  const subjects = getSubjectsForDate(selectedDate)
  const weekday = getWeekdayFromDate(selectedDate)
  const allSubjects = getAllSubjects()
  const overallPercentage = controller.calculateOverallStats(attendanceData)

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8">Attendance Management System</h1>

      {/* Calendar Input */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-2 border border-input rounded-md bg-background text-foreground"
          />
          {weekday && (
            <p className="mt-2 text-sm text-muted-foreground capitalize">
              {weekday} - {subjects.length} subjects scheduled
            </p>
          )}
        </CardContent>
      </Card>

      {/* Attendance Marking */}
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
                        className={status === "present" ? "bg-green-600 hover:bg-green-700" : ""}
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
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No subjects for weekday */}
      {selectedDate && subjects.length === 0 && weekday && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No subjects scheduled for {weekday}</p>
          </CardContent>
        </Card>
      )}

      {/* Invalid weekday */}
      {!weekday && selectedDate && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No timetable available for the selected date</p>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Attendance Statistics
            <span className="text-lg font-normal">Overall: {overallPercentage > 0 ? `${overallPercentage}%` : "-"}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Subject</th>
                  <th className="text-center p-2 font-semibold">Attended</th>
                  <th className="text-center p-2 font-semibold">Total</th>
                  <th className="text-center p-2 font-semibold">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {allSubjects.map((subject) => {
                  const stats = controller.calculateSubjectStats(attendanceData, subject)
                  const isLowAttendance = stats.percentage < 75 && stats.total > 0
                  return (
                    <tr key={subject} className="border-b">
                      <td className="p-2">{subject}</td>
                      <td className="text-center p-2">{stats.attended}</td>
                      <td className="text-center p-2">{stats.total}</td>
                      <td
                        className={`text-center p-2 font-semibold ${
                          isLowAttendance ? "text-red-600" : "text-foreground"
                        }`}
                      >
                        {stats.total > 0 ? `${stats.percentage}%` : "-"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {allSubjects.some((subject) => {
            const stats = controller.calculateSubjectStats(attendanceData, subject)
            return stats.percentage < 75 && stats.total > 0
          }) && (
            <p className="mt-4 text-sm text-red-600">* Subjects with less than 75% attendance are highlighted in red</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
