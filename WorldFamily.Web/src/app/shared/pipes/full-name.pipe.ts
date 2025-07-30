import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fullName',
  standalone: true
})
export class FullNamePipe implements PipeTransform {

  transform(
    firstName: string | null | undefined, 
    middleName?: string | null | undefined, 
    lastName?: string | null | undefined,
    includeMiddleName: boolean = true
  ): string {
    if (!firstName) return '';
    
    const parts: string[] = [firstName.trim()];
    
    if (includeMiddleName && middleName && middleName.trim()) {
      parts.push(middleName.trim());
    }
    
    if (lastName && lastName.trim()) {
      parts.push(lastName.trim());
    }
    
    return parts.join(' ');
  }
}