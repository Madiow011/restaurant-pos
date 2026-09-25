import { ExportService } from './export.service';
import { Response } from 'express';
export declare class ExportController {
    private readonly exportService;
    constructor(exportService: ExportService);
    exportCSV(start: string, end: string, res: Response): Promise<void>;
    exportReport(start: string, end: string, res: Response): Promise<void>;
}
