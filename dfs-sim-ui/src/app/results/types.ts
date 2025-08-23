export interface DatasetMeta {
  filename: string;
  rowCount: number;
  checksum: string;
  schemaSignature: string;
  fileType?: 'optimizer' | 'variants' | 'projections' | 'unknown';
}

export interface ColumnSpec {
  field: string;
  headerName?: string;
  width?: number;
}

export interface Dataset {
  rows: any[];
  columns: ColumnSpec[];
  meta: DatasetMeta;
}

export interface ViewConfig {
  columnState: any;
}
