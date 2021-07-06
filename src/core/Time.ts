export const SECS_IN_MINUTE = 60;
export const SECS_IN_HOUR: number = SECS_IN_MINUTE * 60;
export const SECS_IN_DAY: number = SECS_IN_HOUR * 24;
export const SECS_IN_MONTH: number = SECS_IN_DAY * 30;
export const SECS_IN_YEAR: number = SECS_IN_MONTH * 12;

/**
 * Formats a number to a specified length
 * @param n The number to format
 * @param length The length of the returned number. Does not count the negative sign if n is negative
 */
export function formatDigit(n: number, length = 2): string {
	const num = Math.abs(n).toString();
	length = length < num.length ? num.length : length;
	return `${n < 0 ? '-' : ''}${'0'.repeat(length - num.length)}${n}`;
}

/**
 * Formats time from a Date object
 * @param date The Date object to format the time from
 * @param seconds Whether to display the seconds
 * @param milliseconds Whether to display the milliseconds
 */
export function formatTime(date: Date = new Date(), seconds = true, milliseconds = false): string {
	const hours = formatDigit(date.getHours());
	const minutes = formatDigit(date.getMinutes());
	let secs, millis = '';
	if (seconds) secs = ':' + formatDigit(date.getSeconds());
	if (milliseconds) millis = '.' + formatDigit(date.getMilliseconds(), 3);
	return `${hours}:${minutes}${secs}${millis}`;
}

/**
 * Formats date from a Date object
 * @param date The Date object to format the date from
 */
export function formatDate(date = new Date()): string {
	const day: string = formatDigit(date.getDate());
	const month: string = formatDigit(date.getMonth() + 1);
	const year: string = date.getFullYear().toString();
	return `${year}-${month}-${day}`;
}

/**
 * Converts a duration string (e.g `1d2h3m`) to milliseconds 
 * @param str The string to convert
 */
export function parseDuration(str: string): number | null {
	if (str.length < 2) return 0;
	if (!/(\d+)(d|h|m|s)/.test(str)) return null;
	let days = 0;
	let hours = 0;
	let minutes = 0;
	let seconds = 0;
	let duration = 0;
	if (/(\d+)d/i.test(str)) days = parseInt(/(\d+)d/i.exec(str)![1]) || 0;
	if (/(\d+)h/i.test(str)) hours = parseInt(/(\d+)h/i.exec(str)![1]) || 0;
	if (/(\d+)m/i.test(str)) minutes = parseInt(/(\d+)m/i.exec(str)![1]) || 0;
	if (/(\d+)s/i.test(str)) seconds = parseInt(/(\d+)s/i.exec(str)![1]) || 0;
	duration = days * 86400000 + hours * 3600000 + minutes * 60000 + seconds * 1000;
	return !isFinite(duration) || isNaN(new Date(Date.now() + duration).getTime()) ? null : duration;
}

/**
 * Converts milliseconds to a readable duration
 * @param duration The duration in milliseconds
 * @param bold Whether to format numbers in bold (using Markdown)
 */
export function formatDuration(duration: number, bold = false): string {
	if (duration < 1000)
		return 'less than a second';
	let delta: number = duration / 1000;
	const years: number = Math.floor(delta / SECS_IN_YEAR);
	delta -= years * SECS_IN_YEAR;
	const months: number = Math.floor(delta / SECS_IN_MONTH) % 12;
	delta -= months * SECS_IN_MONTH;
	const days: number = Math.floor(delta / SECS_IN_DAY) % 30;
	delta -= days * SECS_IN_DAY;
	const hours: number = Math.floor(delta / SECS_IN_HOUR) % 24;
	delta -= hours * SECS_IN_HOUR;
	const minutes: number = Math.floor(delta / SECS_IN_MINUTE) % 60;
	delta -= minutes * SECS_IN_MINUTE;
	const seconds: number = Math.floor(delta);
	let output = '';
	if (years > 0)
		output += `${years} year${(years > 1) ? 's' : ''}, `;
	if (months > 0)
		output += `${months} month${(months > 1) ? 's' : ''}, `;
	if (days > 0)
		output += `${days} day${(days > 1) ? 's' : ''}, `;
	if (hours > 0)
		output += `${hours} hour${(hours > 1) ? 's' : ''}, `;
	if (minutes > 0)
		output += `${minutes} minute${(minutes > 1) ? 's' : ''}, `;
	if (seconds > 0)
		output += `${seconds} second${(seconds > 1) ? 's' : ''}, `;
	if (bold)
		output = output.replace(/(\d+)/gi, '**$1**');
	output = output.slice(0, output.length - 2);
	return output;
}