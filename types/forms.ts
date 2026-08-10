export type AdmissionFormData = {
  studentName: string;
  email: string;
  phone: string;
  course: string;
  qualification: string;
  currentStatus: string;
  graduationYear: string;
  collegeName: string;
  state: string;
  trainingMode: "Classroom" | "Online" | "Either" | "";
  message: string;
  consent: boolean;
  website: string;
};

export type ApiResponse = { success: boolean; message: string; referenceId?: string; errors?: Record<string, string[]> };
