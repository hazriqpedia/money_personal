export function ageForYear(dateOfBirth: string, year: number): number {
  return year - new Date(dateOfBirth).getFullYear();
}
