// Model: Handles data structure and localStorage operations

export type AttendanceStatus = "present" | "absent"
export type AttendanceData = Record<string, Record<string, AttendanceStatus>>

export class AttendanceModel {
  private readonly STORAGE_KEY = "attendance-data"

  // Load attendance data from localStorage
  loadData(): AttendanceData {
    if (typeof window === "undefined") return {}

    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      return data ? (JSON.parse(data) as AttendanceData) : {}
    } catch (error) {
      console.error("Error loading attendance data:", error)
      return {}
    }
  }

  // Save attendance data to localStorage
  saveData(data: AttendanceData): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error("Error saving attendance data:", error)
    }
  }

  // Update attendance
  updateAttendance(
    currentData: AttendanceData,
    subject: string,
    date: string,
    status: AttendanceStatus,
  ): AttendanceData {
    const updatedData: AttendanceData = { ...currentData }

    if (!updatedData[subject]) {
      updatedData[subject] = {}
    }

    updatedData[subject] = {
      ...updatedData[subject],
      [date]: status,
    }

    return updatedData
  }

  // Remove attendance
  removeAttendance(currentData: AttendanceData, subject: string, date: string): AttendanceData {
    const updatedData: AttendanceData = { ...currentData }

    if (updatedData[subject]) {
      delete updatedData[subject][date]
      if (Object.keys(updatedData[subject]).length === 0) {
        delete updatedData[subject]
      }
    }

    return updatedData
  }
}
