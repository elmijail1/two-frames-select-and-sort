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

export function mergeSortedInsert(
	sortedArray: number[],
	newIds: number[],
): void {
	const newSorted = [...newIds].sort((a, b) => a - b);
	const merged: number[] = [];

	let i = 0; // sorted array existing
	let n = 0; // new items

	while (i < sortedArray.length && n < newSorted.length) {
		if (sortedArray[i] <= newSorted[n]) {
			merged.push(sortedArray[i++]);
		} else {
			merged.push(newSorted[n++]);
		}
	}
	while (i < sortedArray.length) merged.push(sortedArray[i++]);
	while (n < newSorted.length) merged.push(newSorted[n++]);

	for (let m = 0; m < merged.length; m++) {
		sortedArray[m] = merged[m];
	}
}
