import { Pipe, PipeTransform } from '@angular/core';
import {
  format,
  formatDistanceToNow,
  parseISO,
  differenceInMinutes,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
} from 'date-fns';
import { vi } from 'date-fns/locale';
import customVi from 'src/app/utils/vi-custom-locale';

@Pipe({
  name: 'timeAgo',
  pure: false,
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: string | Date): string {
    if (!value) return '';

    const date = typeof value === 'string' ? parseISO(value) : value;
    const now = new Date();

    const diffInMinutes = differenceInMinutes(now, date);
    const diffInDays = differenceInDays(now, date);
    const diffInWeeks = differenceInWeeks(now, date);
    const diffInMonths = differenceInMonths(now, date);

    // < 1 ngày
    if (diffInMinutes < 1440) {
      return formatDistanceToNow(date, { addSuffix: true, locale: customVi });
    }

    // 1 - 3 ngày
    if (diffInDays <= 3) {
      return formatDistanceToNow(date, { addSuffix: true, locale: customVi });
    }

    // > 3 ngày và < 7 ngày => hiển thị thứ
    if (diffInDays < 7) {
      return format(date, 'EEEE', { locale: vi }); // VD: "Thứ Hai"
    }

    // 1 - 2 tuần
    if (diffInWeeks < 2) {
      return '1 tuần trước';
    }

    // > 2 tuần và < 6 tháng => hiển thị ngày/tháng
    if (diffInMonths < 6) {
      return format(date, 'dd/MM', { locale: vi });
    }

    // > 6 tháng => hiển thị ngày/tháng/năm
    return format(date, 'dd/MM/yyyy', { locale: vi });
  }
}
