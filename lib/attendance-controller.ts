import type { AttendanceModel, AttendanceData, AttendanceStatus } from "./attendance-model"

// Controller: Manages business logic and coordinates between model and view
export class AttendanceController {
  constructor(private model: AttendanceModel) {}

  // Load all attendance data
  loadAttendanceData(): AttendanceData {
    return this.model.loadData()
  }

  // Mark attendance for a subject on a specific date
  markAttendance(
    subject: string,
    date: string,
    status: AttendanceStatus
  ): AttendanceData {
    const currentData = this.model.loadData()
    const updatedData = this.model.updateAttendance(currentData, subject, date, status)
    this.model.saveData(updatedData)
    return updatedData
  }

  // Calculate attendance statistics for a subject
  calculateSubjectStats(
    attendanceData: AttendanceData,
    subject: string,
  ): { attended: number; total: number; percentage: number } {
    const records = attendanceData[subject] || {}
    const total = Object.keys(records).length
    const attended = Object.values(records).filter((status) => status === "present").length
    const percentage = total > 0 ? Math.round((attended / total) * 100) : 0

    return { attended, total, percentage }
  }

  // Calculate overall attendance statistics
  calculateOverallStats(attendanceData: AttendanceData): number {
    let totalAttended = 0
    let totalClasses = 0

    Object.values(attendanceData).forEach((subjectRecords) => {
      totalClasses += Object.keys(subjectRecords).length
      totalAttended += Object.values(subjectRecords).filter((status) => status === "present").length
    })

    return totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0
  }
}
