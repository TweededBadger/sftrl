export interface QueueItem<T> {
  item: T;
  cost: number;
}

export type Comparator<T> = (a: T, b: T) => boolean;

export class PriorityQueue<T> {
  private _elements: QueueItem<T>[] = [];

  constructor(private _comparator: Comparator<T>) {}

  enqueue(item: T, cost: number): void {
    const queueItem: QueueItem<T> = { item, cost };
    this._elements.push(queueItem);
    this._elements.sort((a, b) => (this._comparator(a.item, b.item) ? -1 : 1));
  }

  dequeue(): T | undefined {
    const queueItem = this._elements.shift();
    return queueItem?.item;
  }

  isEmpty(): boolean {
    return this._elements.length === 0;
  }
}
