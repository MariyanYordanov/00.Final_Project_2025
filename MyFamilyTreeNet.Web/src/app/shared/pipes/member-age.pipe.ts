import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'memberAge',
  standalone: true
})
export class MemberAgePipe implements PipeTransform {

  transform(
    birthDate: string | Date | null | undefined, 
    deathDate?: string | Date | null | undefined,
    format: 'number' | 'text' | 'detailed' = 'text'
  ): string | number {
    if (!birthDate) return '';

    const birth = new Date(birthDate);
    const reference = deathDate ? new Date(deathDate) : new Date();
    
    // Calculate age
    let age = reference.getFullYear() - birth.getFullYear();
    const monthDiff = reference.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && reference.getDate() < birth.getDate())) {
      age--;
    }

    // Return format based on parameter
    switch (format) {
      case 'number':
        return age;
        
      case 'detailed':
        const months = monthDiff < 0 ? monthDiff + 12 : monthDiff;
        const days = reference.getDate() - birth.getDate();
        
        if (age < 1) {
          if (months < 1) {
            return `${Math.abs(days)} ${Math.abs(days) === 1 ? 'ден' : 'дни'}`;
          }
          return `${months} ${months === 1 ? 'месец' : 'месеца'}`;
        }
        
        let result = `${age} ${age === 1 ? 'година' : 'години'}`;
        if (months > 0) {
          result += ` и ${months} ${months === 1 ? 'месec' : 'месеца'}`;
        }
        return result;
        
      default: // 'text'
        if (age < 1) {
          return 'под 1 година';
        } else if (age === 1) {
          return '1 година';
        } else {
          return `${age} години`;
        }
    }
  }
}