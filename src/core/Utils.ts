/**
 * Formats a long number to a readable number
 * @param n The number to format
 * @param sep The separator to place between the three-digit packs
 */
export function formatNumber(n: number, sep = ','): string {
	return (n < 0 ? '-' : '') + Math.abs(n).toString().split('').reverse().reduce((previous, current, i, arr) => ((i + 1) % 3 == 0 && i + 1 < arr.length ? sep : '') + current + previous);
}
// putain j'ai tryhard elle est trop stylée cette fonction 
// dinguerie