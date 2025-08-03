import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'relativeDate',
  standalone: true
})
export class RelativeDatePipe implements PipeTransform {

  transform(value: string | Date | null | undefined): string {
    if (!value) return '';

    // Server returns UTC timestamps without 'Z' suffix, so we need to add it
    let dateString = value.toString();
    if (typeof value === 'string' && !dateString.includes('Z') && !dateString.includes('+')) {
      dateString += 'Z'; // Explicitly mark as UTC
    }
    
    const date = new Date(dateString);
    const now = new Date();
    
    // Calculate difference in milliseconds
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInMinutes < 1) {
      return 'сега';
    } else if (diffInMinutes < 60) {
      return `преди ${diffInMinutes} ${diffInMinutes === 1 ? 'минута' : 'минути'}`;
    } else if (diffInHours < 24) {
      return `преди ${diffInHours} ${diffInHours === 1 ? 'час' : 'часа'}`;
    } else if (diffInDays < 30) {
      if (diffInDays === 1) {
        return 'вчера';
      } else if (diffInDays === 2) {
        return 'позавчера';
      } else {
        return `преди ${diffInDays} дни`;
      }
    } else if (diffInMonths < 12) {
      return `преди ${diffInMonths} ${diffInMonths === 1 ? 'месец' : 'месеца'}`;
    } else {
      return `преди ${diffInYears} ${diffInYears === 1 ? 'година' : 'години'}`;
    }
  }
}