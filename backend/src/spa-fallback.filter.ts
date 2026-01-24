
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Catch()
export class SpaFallbackFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest();

        // 1. If it's an API/Upload request, return JSON error
        if (request.url.startsWith('/api') || request.url.startsWith('/uploads')) {
            const status = (exception as any).getStatus ? (exception as any).getStatus() : 500;
            response.status(status).json({
                statusCode: status,
                message: (exception as any).message || 'Internal Server Error',
                timestamp: new Date().toISOString(),
                path: request.url,
            });
            return;
        }

        // 2. For page requests (likely 404 or 500 on navigation), try to serve index.html
        // Log the real error for debugging
        console.warn('SPA Filter caught exception on route:', request.url, exception);

        const indexPath = join(process.cwd(), '..', 'frontend', 'dist', 'index.html');

        try {
            if (!require('fs').existsSync(indexPath)) {
                console.error(`SPA Fallback Error: Index file not found at ${indexPath}`);
                response.status(404).send('Application not found (index.html missing)');
                return;
            }

            const content = require('fs').readFileSync(indexPath, 'utf8');
            response.header('Content-Type', 'text/html');
            response.send(content);
        } catch (err) {
            console.error('SPA Fallback Critical Error:', err);
            if (!response.headersSent) {
                response.status(500).send('Internal Server Error loading application');
            }
        }
    }
}
