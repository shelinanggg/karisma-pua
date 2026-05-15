/**
 * Utility functions for employee status checking
 */

/**
 * Check if an employee should be marked as inactive based on their retirement date
 * @param tmtPensiun - The employee's retirement date (tmt_pensiun)
 * @returns true if the employee has reached retirement date, false otherwise
 */
export function shouldBeInactive(tmtPensiun?: string): boolean {
  if (!tmtPensiun) return false;
  
  try {
    const retirementDate = new Date(tmtPensiun);
    const today = new Date();
    
    // Normalize to date comparison only (ignore time)
    const retirementDateNormalized = new Date(retirementDate.getFullYear(), retirementDate.getMonth(), retirementDate.getDate());
    const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    return todayNormalized >= retirementDateNormalized;
  } catch {
    return false;
  }
}

/**
 * Get days until retirement for an employee
 * @param tmtPensiun - The employee's retirement date (tmt_pensiun)
 * @returns number of days until retirement (negative if already retired)
 */
export function getDaysUntilRetirement(tmtPensiun?: string): number | null {
  if (!tmtPensiun) return null;
  
  try {
    const retirementDate = new Date(tmtPensiun);
    const today = new Date();
    
    const msPerDay = 24 * 60 * 60 * 1000;
    const diffMs = retirementDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / msPerDay);
    
    return diffDays;
  } catch {
    return null;
  }
}

/**
 * Format retirement status as text
 * @param tmtPensiun - The employee's retirement date (tmt_pensiun)
 * @returns formatted text describing retirement status
 */
export function formatRetirementStatus(tmtPensiun?: string): string {
  if (!tmtPensiun) return 'Tanggal pensiun tidak diketahui';
  
  const daysUntil = getDaysUntilRetirement(tmtPensiun);
  if (daysUntil === null) return 'Tanggal pensiun tidak valid';
  
  if (daysUntil < 0) {
    return `Sudah pensiun ${Math.abs(daysUntil)} hari lalu`;
  } else if (daysUntil === 0) {
    return 'Hari ini adalah hari pensiun';
  } else if (daysUntil < 30) {
    return `Pensiun dalam ${daysUntil} hari`;
  } else {
    const months = Math.floor(daysUntil / 30);
    const days = daysUntil % 30;
    return `Pensiun dalam ${months} bulan ${days} hari`;
  }
}

/**
 * Get status badge color based on retirement proximity
 * @param tmtPensiun - The employee's retirement date (tmt_pensiun)
 * @returns CSS class for badge color
 */
export function getRetirementStatusColor(tmtPensiun?: string): string {
  if (!tmtPensiun) return 'bg-gray-100 text-gray-700';
  
  const daysUntil = getDaysUntilRetirement(tmtPensiun);
  if (daysUntil === null) return 'bg-gray-100 text-gray-700';
  
  if (daysUntil < 0) {
    return 'bg-red-100 text-red-700'; // Already retired
  } else if (daysUntil < 30) {
    return 'bg-orange-100 text-orange-700'; // Retiring soon
  } else if (daysUntil < 180) {
    return 'bg-yellow-100 text-yellow-700'; // Retiring within 6 months
  } else {
    return 'bg-green-100 text-green-700'; // Normal status
  }
}
