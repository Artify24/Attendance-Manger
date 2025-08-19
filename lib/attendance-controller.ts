import type { AttendanceModel, AttendanceData, AttendanceStatus } from "./attendance-model"

// Controller: Manages business logic and coordinates between model and view
export class AttendanceController {
  constructor(private model: AttendanceModel) {}

  // Load attendance data
  loadAttendanceData(): AttendanceData {
    return this.model.loadData()
  }

  // Mark attendance
  markAttendance(subject: string, date: string, status: AttendanceStatus): AttendanceData {
    const currentData = this.model.loadData()
    const updatedData = this.model.updateAttendance(currentData, subject, date, status)
    this.model.saveData(updatedData)
    return updatedData
  }

  // Remove attendance
  removeAttendance(subject: string, date: string): AttendanceData {
    const currentData = this.model.loadData()
    const updatedData = this.model.removeAttendance(currentData, subject, date)
    this.model.saveData(updatedData)
    return updatedData
  }

  // Calculate stats per subject
  calculateSubjectStats(
    attendanceData: AttendanceData,
    subject: string,
  ): { attended: number; total: number; percentage: number; needed: number } {
    const records = attendanceData[subject] || {}
    const total = Object.keys(records).length
    const attended = Object.values(records).filter((s) => s === "present").length
    const percentage = total > 0 ? Math.round((attended / total) * 100) : 0

    // classes needed for 75%
    const needed = percentage >= 75 ? 0 : Math.max(0, 3 * total - 4 * attended)

    return { attended, total, percentage, needed }
  }

  // Calculate overall stats
  calculateOverallStats(attendanceData: AttendanceData): { overall: number; needed: number } {
    let totalAttended = 0
    let totalClasses = 0

    Object.values(attendanceData).forEach((subjectRecords) => {
      totalClasses += Object.keys(subjectRecords).length
      totalAttended += Object.values(subjectRecords).filter((s) => s === "present").length
    })

    const overall = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0
    const needed = overall >= 75 ? 0 : Math.max(0, 3 * totalClasses - 4 * totalAttended)

    return { overall, needed }
  }
}
