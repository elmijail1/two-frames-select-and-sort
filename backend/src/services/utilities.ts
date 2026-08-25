export function findFirstIndexGreaterThan(
	sortedNums: number[],
	target: number,
): number {
	if (target < sortedNums[0] || sortedNums.length === 0) return 0;
	if (target > sortedNums[sortedNums.length - 1]) return sortedNums.length;
	let low = 0;
	let high = sortedNums.length;

	while (low < high) {
		const mid = Math.floor((low + high) / 2);
		if (sortedNums[mid] > target) {
			high = mid;
		} else {
			low = mid + 1;
		}
	}

	return low;
}
