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

  // Update attendance for a specific subject and date
  updateAttendance(
    currentData: AttendanceData,
    subject: string,
    date: string,
    status: AttendanceStatus,
  ): AttendanceData {
    const updatedData: AttendanceData = {
      ...currentData,
      [subject]: {
        ...(currentData[subject] || {}),
        [date]: status,
      },
    }

    return updatedData
  }
}
