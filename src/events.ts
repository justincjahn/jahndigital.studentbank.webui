import { create } from '@/services/eventBus';

export const stockCreate = create<Stock>('stock-create');

export const stockUpdate = create<Stock>('stock-update');

export const stockDelete = create<Stock>('stock-delete');
