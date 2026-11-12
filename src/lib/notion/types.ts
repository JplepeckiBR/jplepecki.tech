export type SiteStatus = 'Draft' | 'In progress' | 'Published';
export type LoopStage = 'Ask' | 'Study' | 'Build' | 'Ship';

export interface RichTextSpan {
  text: string;
  href?: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  strikethrough?: boolean;
  underline?: boolean;
}

export interface SerializedImage {
  asset: string;
  alt: string;
  caption?: string;
}

export interface TableColumn {
  label: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableRow {
  cells: string[];
  isMaximum?: boolean;
}

export interface PlantStakeRecord {
  name: string;
  role?: string;
  note?: string;
  price?: string;
}

export type ContentBlock =
  | { id: string; type: 'paragraph'; richText: RichTextSpan[] }
  | { id: string; type: 'heading2' | 'heading3'; richText: RichTextSpan[]; anchor: string }
  | {
      id: string;
      type: 'bulletedList' | 'numberedList';
      items: Array<{ richText: RichTextSpan[]; children: ContentBlock[] }>;
    }
  | { id: string; type: 'quote'; richText: RichTextSpan[] }
  | { id: string; type: 'divider' }
  | { id: string; type: 'code'; code: string; language?: string; caption?: string }
  | { id: string; type: 'image'; image: SerializedImage }
  | {
      id: string;
      type: 'table';
      caption: string;
      columns: TableColumn[];
      rows: TableRow[];
    }
  | {
      id: string;
      type: 'receipt';
      store: string;
      items: Array<{ label: string; value: string }>;
      total: { label: string; value: string };
    }
  | { id: string; type: 'plantStakes'; stakes: PlantStakeRecord[] }
  | { id: string; type: 'marginNote'; image: SerializedImage }
  | { id: string; type: 'toggle'; summary: RichTextSpan[]; children: ContentBlock[] }
  | { id: string; type: 'youtube'; videoId: string; title: string };

export interface BuildLogEntry {
  date: string;
  dateTime: string;
  status: 'done' | 'today' | 'planned';
  fallbackStatus?: 'done' | 'planned';
  title: string;
}

export interface PostEntry {
  notionId: string;
  title: string;
  slug: string;
  siteStatus: SiteStatus;
  inProgress: boolean;
  publishedDate?: string;
  series?: string;
  part?: number;
  excerpt?: string;
  hero?: SerializedImage;
  status?: string;
  topics: string[];
  projectIds: string[];
  workIds: string[];
  loopIds: string[];
  blocks: ContentBlock[];
  contents: Array<{ href: string; label: string }>;
  buildLog: BuildLogEntry[];
  buildLogSource?: string;
}

export interface LoopEntry {
  notionId: string;
  name: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  stage?: LoopStage;
  goal?: string;
  postTarget?: number;
  projectIds: string[];
  isCurrent: boolean;
}

export interface DailyTargetEntry {
  notionId: string;
  task: string;
  done: boolean;
  day: number;
  kpi?: string;
  loopIds: string[];
}

export interface ProjectEntry {
  notionId: string;
  name: string;
  slug: string;
  status?: string;
  whatItIs?: string;
  nextAction?: string;
  cover?: SerializedImage;
  onSite: boolean;
  loopIds: string[];
}

export interface ShippedContentEntry {
  notionId: string;
  title: string;
  status?: string;
  format?: string;
  publishDate?: string;
  loopIds: string[];
  projectIds: string[];
  link?: string;
}

export interface ReadmeEntry {
  notionId: string;
  loopNotes: string[];
  changelog: Array<{ date?: string; change: string }>;
}

export interface NotionDataset {
  posts: PostEntry[];
  loops: LoopEntry[];
  dailyTargets: DailyTargetEntry[];
  projects: ProjectEntry[];
  content: ShippedContentEntry[];
  readme: ReadmeEntry[];
}
