import vi from 'date-fns/locale/vi';

const customVi = {
  ...vi,
  formatDistance: ((token: any, count: number, options?: any): string => {
    const formatDistanceFn = (vi as any).formatDistance as Function;

    let result = formatDistanceFn(token, count, options);

    // Bỏ từ "khoảng" nếu có
    result = result.replace(/^khoảng\s/, '');

    // Bỏ từ "dưới" nếu có
    result = result.replace(/^dưới\s/, '');

    return result;
  }) as (token: any, count: number, options?: any) => string,
};

export default customVi;
