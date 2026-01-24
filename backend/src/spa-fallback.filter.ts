
import { ArgumentsHost, Catch, ExceptionFilter, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Catch(NotFoundException)
export class SpaFallbackFilter implements ExceptionFilter {
    catch(exception: NotFoundException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest();

        // If it's an API call, return normal 404
        if (request.url.startsWith('/api') || request.url.startsWith('/uploads')) {
            response.status(404).json({
                statusCode: 404,
                message: `Cannot ${request.method} ${request.url}`,
                error: 'Not Found',
            });
            return;
        }

        // Otherwise serve index.html for SPA routing
        const indexPath = join(process.cwd(), '..', 'frontend', 'dist', 'index.html');

        if (!require('fs').existsSync(indexPath)) {
            console.error(`SPA Fallback Error: Index file not found at ${indexPath}`);
            response.status(404).json({
                statusCode: 404,
                message: 'SPA index.html not found',
                error: 'Not Found'
            });
            return;
        }

        response.sendFile(indexPath, (err) => {
            if (err) {
                console.error('SPA Fallback Error: sendFile failed', err);
                if (!response.headersSent) {
                    response.status(500).json({ statusCode: 500, message: 'Could not serve index.html' });
                }
            }
        });
    }
}
