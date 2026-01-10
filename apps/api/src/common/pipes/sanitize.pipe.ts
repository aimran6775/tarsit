import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import * as DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitization Pipe
 * Removes potentially dangerous HTML/script content from user inputs
 */
@Injectable()
export class SanitizePipe implements PipeTransform {
  private sanitizeValue(value: any): any {
    if (typeof value === 'string') {
      // Remove HTML tags and sanitize
      return DOMPurify.sanitize(value, {
        ALLOWED_TAGS: [], // No HTML tags allowed
        ALLOWED_ATTR: [],
        KEEP_CONTENT: true, // Keep text content but remove tags
      }).trim();
    }
    
    if (Array.isArray(value)) {
      return value.map(item => this.sanitizeValue(item));
    }
    
    if (value && typeof value === 'object') {
      const sanitized: any = {};
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          sanitized[key] = this.sanitizeValue(value[key]);
        }
      }
      return sanitized;
    }
    
    return value;
  }

  transform(value: any, metadata: ArgumentMetadata) {
    if (!value) return value;
    
    // Only sanitize body data (not query params, which are handled differently)
    if (metadata.type === 'body') {
      return this.sanitizeValue(value);
    }
    
    return value;
  }
}
