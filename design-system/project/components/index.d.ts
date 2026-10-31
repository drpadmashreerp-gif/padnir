export type Hue = 'blue' | 'saffron' | 'teal' | 'coral';
export interface ButtonOptions { label: string; variant?: 'primary' | 'quiet' | 'ghost'; disabled?: boolean; onClick?: (e: MouseEvent) => void }
export declare function Button(o: ButtonOptions): HTMLButtonElement;
export interface FrameOptions { hue?: Hue; eyebrow?: string; numeral?: string; title?: string; body?: string; source?: string; quiet?: boolean; zoom?: boolean }
export declare function Frame(o: FrameOptions): HTMLElement;
export interface TopicCircleOptions { number: number; label: string; hue?: Hue; current?: boolean; onClick?: (e: MouseEvent) => void }
export declare function TopicCircle(o: TopicCircleOptions): HTMLButtonElement;
export interface PathBarOptions { steps: string[]; current?: number; onChange?: (index: number) => void }
export declare function PathBar(o: PathBarOptions): HTMLElement;
export interface DataColumn { label: string; numeric?: boolean }
export interface DataRow { cells: (string | number)[]; flag?: boolean }
export interface DataTableOptions { caption?: string; columns: DataColumn[]; rows: DataRow[] }
export declare function DataTable(o: DataTableOptions): HTMLTableElement;
declare global { interface Window { PadnirCanvas: { Button: typeof Button; Frame: typeof Frame; TopicCircle: typeof TopicCircle; PathBar: typeof PathBar; DataTable: typeof DataTable } } }
